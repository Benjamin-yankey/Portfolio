> Shared across ALL microservices. Every service must conform to everything in this document.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | NestJS (TypeScript) |
| Database | PostgreSQL — one shared DB `school_db`, logically split by schema |
| ORM | TypeORM (each service scoped to its own schema) |
| Auth | JWT via `@nestjs/jwt` + `passport-jwt` |
| Password hashing | bcrypt |
| Validation | class-validator + class-transformer |
| Email | `@nestjs-modules/mailer` + nodemailer |
| Message broker | **Redpanda** (Kafka-compatible, no ZooKeeper, single binary) |
| NestJS transport | `@nestjs/microservices` Kafka transport — used for ALL inter-service communication |

**Why Redpanda over vanilla Kafka:** identical wire protocol, so `@nestjs/microservices` works with zero changes. No ZooKeeper dependency — single binary, trivial docker-compose setup, production-ready. All Kafka tooling (consumers groups, topic replay, retention policies) is supported.

**Why Kafka for everything (including sync calls):** no direct service-to-service connections exist anywhere in the system. Every interaction — whether it needs a response or not — goes through Redpanda. Services are deployable, scalable, and replaceable independently. The only tradeoff is slightly higher latency on the two request/response calls; this is acceptable given the decoupling benefit.

---

## Communication Architecture

All inter-service communication goes through Redpanda. No service knows the host, port, or internal structure of any other service. They only know **topic names and message schemas**.

---

### Two Kafka Patterns in Use

#### Pattern A — Event (async, no response expected)

```
Producer                Redpanda              Consumer
Service  ──publish──▶  [topic]  ──deliver──▶  Service
                                               processes independently
                                               acks offset on success
```

- Producer publishes and moves on immediately
- Consumer group offset tracking ensures **at-least-once delivery** — no message is lost even if the consumer restarts
- Failed processing → consumer does not commit offset → Redpanda redelivers
- Used for: notification triggers (welcome email, password reset email)

#### Pattern B — Request/Reply (pseudo-sync over Kafka)

```
Requester                    Redpanda                    Responder
Service  ──publish──▶  [request.topic]  ──deliver──▶  Service
         ◀──publish──  [reply.topic]    ◀──publish────
```

NestJS implements this natively via the Kafka transport's `ClientKafka.send()`:
- Requester publishes to a request topic with a **correlation ID** and a **reply topic header**
- Responder picks up the message, processes it, publishes the answer to the reply topic with the same correlation ID
- Requester blocks on an Observable, waiting for the matching correlation ID
- **Timeout: 5 seconds** — if no reply arrives, the requester throws `503 Service Unavailable` immediately. No retries. The caller surfaces the error to the client.

Used for: password verification, schoolId validation — the two calls where the user is blocked waiting for a result.

---

### Full Communication Map

| From | To | Pattern | Topic | Payload |
|---|---|---|---|---|
| Auth Service | User Service | Request/Reply | `user.find-by-email` / `user.find-by-email.reply` | `{ email }` → `{ id, email, role, isActive, mustResetPassword } \| null` |
| User Service | Auth Service | Request/Reply | `auth.verify-password` / `auth.verify-password.reply` | `{ userId, plainPassword }` → `{ valid: boolean }` |
| User Service | School Service | Request/Reply | `school.validate` / `school.validate.reply` | `{ schoolId }` → `{ exists: boolean }` |
| User Service | Notification Service | Event | `notification.email` | `{ type: 'welcome' \| 'password-reset', to, tempPassword }` |
| API Gateway | All services | HTTP proxy | — | forwarded HTTP requests |

> The API Gateway proxies inbound HTTP — it does **not** publish to Kafka. It forwards requests to each service's own HTTP listener.

---

### Topic Naming Convention

```
<service-domain>.<action>           — request or event topic
<service-domain>.<action>.reply     — reply topic (request/reply pattern only)
```

All topics must be **pre-created** in Redpanda before services start, or services must be configured with `allowAutoTopicCreation: true` during development.

---

### Kafka Message Envelope

Every Kafka message published by a NestJS service (via `ClientKafka` or `@MessagePattern`) follows this shape:

```ts
// Key: always the primary entity ID (userId, schoolId, etc.) — enables partition locality
// Value: JSON-serialised payload
// Headers: set automatically by NestJS for request/reply correlation
```

---

### Timeout and Failure Behaviour (Request/Reply)

```ts
// In the calling service — configure on ClientKafka:
ClientsModule.register([{
  name: 'KAFKA_CLIENT',
  transport: Transport.KAFKA,
  options: {
    client: { brokers: [process.env.KAFKA_BROKER] },
    consumer: { groupId: '<this-service>-reply-consumer' },
  },
}])

// In the calling method — pipe a timeout:
this.kafkaClient
  .send('auth.verify-password', { userId, plainPassword })
  .pipe(timeout(5000))          // throws TimeoutError after 5s
  .toPromise()
  .catch((err) => {
    if (err.name === 'TimeoutError') throw new ServiceUnavailableException();
    throw err;
  });
```

---

## Database Layout

**One database, multiple schemas — one schema per service domain.**

```sql
CREATE SCHEMA auth;
CREATE SCHEMA "user";
CREATE SCHEMA school;
CREATE SCHEMA notification;
CREATE SCHEMA academic;
CREATE SCHEMA audit;
```

### Hard Rules
- Each service's TypeORM connection is scoped to **its own schema only** via the `schema` config option
- **No cross-schema JOINs** in application code — ever
- **No service imports another service's TypeORM entity class**
- All cross-domain data travels through **Kafka topic messages only** — never via shared DB access

---

## Role Enum — Scoping Rules

Roles travel between services as **plain strings inside Kafka message payloads and JWT claims**. No service imports role types from another service.

| Service | Needs local role enum? | Reason |
|---|---|---|
| Auth Service | No | Only verifies passwords; role is a string in the JWT it signs |
| User Service | Yes | Enforces creation rules; knows which roles administration may assign |
| School Service | No | Only superadmin reaches it — enforced at the Gateway before the request arrives |
| Notification Service | No | Pure event consumer; no role logic |
| API Gateway | Yes | Enforces route-level `@Roles()` guards |

Where defined, the enum lives at `src/common/enums/role.enum.ts`:

```ts
export enum Role {
  SUPERADMIN     = 'superadmin',
  ADMINISTRATION = 'administration',
  TEACHER        = 'teacher',
  STUDENT        = 'student',
  PARENT         = 'parent',
}
```

---

## JWT

### Token payload (signed)
```ts
{
  sub: string               // userId
  email: string
  role: string              // plain string — matches Role enum values
  mustResetPassword?: boolean
}
```

### `req.user` (after JwtStrategy validation)
```ts
{
  id: string
  email: string
  role: string
  mustResetPassword?: boolean
}
```

- Secret: `process.env.JWT_SECRET`
- Expiry: `'7d'`
- `role` is always a plain string on the wire — never an imported type from another service

---

## Guards

Guards live in `src/common/guards/` in each service that exposes HTTP routes. Pure Kafka consumers (Notification Service) have no guards.

### `JwtAuthGuard`
Extends `AuthGuard('jwt')`. Validates the token, populates `req.user`.

### `RolesGuard`
Reads `@Roles()` metadata. Compares `req.user.role` (string) against the allowed list.

### `MustResetGuard`
Throws `403 ForbiddenException('You must reset your password before continuing.')` when `req.user.mustResetPassword === true`.
Skipped **only** on `/auth/first-login-reset` and `/auth/change-password`.

### `ScopeGuard`
Administration routes only. Confirms the target user's `schoolId` matches `req.user.schoolId`. Throws `403` if not.

### Standard stack on all protected routes
```ts
@UseGuards(JwtAuthGuard, MustResetGuard, RolesGuard)
```

---

## Decorators

```ts
// src/common/decorators/roles.decorator.ts
import { SetMetadata } from '@nestjs/common';
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);

// src/common/decorators/current-user.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
export const CurrentUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext) => ctx.switchToHttp().getRequest().user,
);
```

---

## Environment Variables

```env
# Superadmin seed
SUPERADMIN_EMAIL=admin@yourdomain.com
SUPERADMIN_PASSWORD=StrongPasswordHere123!

# JWT
JWT_SECRET=your_long_random_jwt_secret

# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/school_db

# Mail
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=587
MAIL_USER=your_mailtrap_user
MAIL_PASS=your_mailtrap_pass
MAIL_FROM=noreply@schoolapp.com

# Redpanda / Kafka broker
KAFKA_BROKER=localhost:9092
```

> Each service only needs `KAFKA_BROKER` — no per-service host/port env vars.
> Consumer group IDs are hardcoded per service (see Service Build Reference).

---

## File Structure (Per Service)

```
[service-name]/
├── src/
│   ├── [feature]/
│   │   ├── [feature].module.ts
│   │   ├── [feature].controller.ts          ← HTTP handlers (services with HTTP surface)
│   │   ├── [feature].kafka.controller.ts    ← @MessagePattern / @EventPattern handlers
│   │   ├── [feature].service.ts
│   │   ├── [feature].entity.ts
│   │   └── dto/
│   │       └── [action].dto.ts
│   ├── common/
│   │   ├── guards/                          ← HTTP-facing services only
│   │   │   ├── jwt-auth.guard.ts
│   │   │   ├── roles.guard.ts
│   │   │   ├── must-reset.guard.ts
│   │   │   └── scope.guard.ts
│   │   ├── decorators/
│   │   │   ├── roles.decorator.ts
│   │   │   └── current-user.decorator.ts
│   │   └── enums/
│   │       └── role.enum.ts                 ← only in services that need it
│   ├── seeder/                              ← User Service only
│   │   ├── seeder.module.ts
│   │   └── seeder.service.ts
│   ├── app.module.ts
│   └── main.ts
├── .env
└── package.json
```

### `main.ts` — services that consume Kafka

Every service except the API Gateway connects to Redpanda as a microservice consumer. They boot **both** an HTTP server and a Kafka microservice listener:

```ts
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: '<service-name>',
        brokers: [process.env.KAFKA_BROKER],
      },
      consumer: {
        groupId: '<service-name>-consumer',
      },
    },
  });

  await app.startAllMicroservices();
  await app.listen(HTTP_PORT);
}
```

The **Notification Service** has no HTTP listener — call `app.startAllMicroservices()` only, skip `app.listen()`.

---

## Superadmin Seeding (User Service only)

Seeded on first boot via `SeederService` implementing `OnApplicationBootstrap`. Never via an endpoint.

```
1. Check if role='superadmin' exists in user.users
2. If yes  → skip
3. If no   → read SUPERADMIN_EMAIL + SUPERADMIN_PASSWORD from .env
           → if either missing: log error, skip, do not throw
           → bcrypt.hash(password)
           → INSERT into user.users  (role='superadmin', isActive=true)
           → INSERT into auth.credentials (mustResetPassword=false)
             ⚠ This is the one permitted cross-schema write in the entire system.
               It runs once at boot before any request boundary exists.
           → log: "Superadmin seeded: <email>"
```

---

## Global Business Rules

1. **No public signup** — all accounts are created top-down.
2. **Superadmin only from `.env` seed** — never via API.
3. **Every admin-created account** starts with `mustResetPassword=true` and a temp password.
4. **Administration** may only create `TEACHER`, `STUDENT`, `PARENT` — never `ADMINISTRATION` or `SUPERADMIN`.
5. **Administration** is strictly scoped to their own `schoolId` — `ScopeGuard` enforces this on every administration route.
6. **Self-serve password change always requires the current password** — no bypass.
7. **Admin force-reset** always generates a new temp password, sets `mustResetPassword=true`, and publishes a `notification.email` event to Kafka.
8. **Superadmin credential update** lives in User Service (identity concern), not Auth Service.
9. **Notification Service has zero HTTP surface** — it only consumes Kafka events. Nothing calls it directly.
10. **No cross-schema queries** in application code — ever. The seeder is the single documented exception.
11. **No direct service-to-service connections** — all communication goes through Redpanda without exception.

---

## What NOT to Build (Phase 2)

- Academic Service (classes, grades, attendance)
- Communication Service (announcements, messaging)
- Audit / Logging Service
- Frontend / admin dashboard
- Refresh token rotation
- OAuth / social login
