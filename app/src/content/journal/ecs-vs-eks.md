Benchmark the **same** microservices e-commerce app deployed two ways on AWS, so
the CTO can pick an orchestrator. One codebase, one set of container images, two
runtimes.

**ShopNow is a full storefront:** browse/search a catalog, register & log in
(JWT), keep a per-user cart with quantities, check out through a **mock payment
gateway**, view order history, and manage the catalog + orders from an **admin
panel**. The UI is an **Angular SPA**; the three backend services keep the
original "database-per-service" shape so the ECS-vs-EKS comparison still holds.

| Area      | What you can do                                                        |
|-----------|------------------------------------------------------------------------|
| Storefront| Search, filter by category, product detail pages, add to cart          |
| Accounts  | Register / login, JWT-secured sessions, per-user carts & order history  |
| Checkout  | Quantities, mock payment (declines any card ending `0000`), order confirmation |
| Admin     | Dashboard stats, product CRUD, view all orders (role-gated)            |


```
                       ┌──────────────┐
              ┌───────►│  Products svc├──► Postgres   (own DB)
  Internet ─► Frontend │  (Node API)  │
              │        └──────────────┘
   public LB  │        ┌──────────────┐
              └───────►│   Cart svc   ├──► Redis      (own DB)
                       │  (Node API)  │
        service        └──────────────┘
        discovery
```

Three independently deployable services + **database-per-service** (Products owns
Postgres, Cart owns Redis):

| Service   | Tech                      | Owns / talks to                       | Port |
|-----------|---------------------------|---------------------------------------|------|
| Frontend  | Angular SPA + Express proxy | serves the SPA, calls Products & Cart | 8080 |
| Products  | Node.js + Express         | **Postgres** (catalog, users, orders) | 5001 |
| Cart      | Node.js + Express         | **Redis** (per-user carts + visits)   | 5002 |
| Postgres  | postgres:16-alpine        | — (owned by Products)                 | 5432 |
| Redis     | redis:7-alpine            | — (owned by Cart)                     | 6379 |

The Products service is the relational system-of-record (catalog + accounts +
orders); the Cart service keeps per-user carts in Redis. Both verify the **same
JWT** using a shared `JWT_SECRET`, so auth works regardless of which service the
request lands on. The frontend builds the Angular app at image-build time and
serves the static bundle, reverse-proxying `/api/*` to the right service.

The frontend never hard-codes addresses; it discovers each service by name via
two env vars (`PRODUCTS_URL`, `CART_URL`). Those — plus the shared `JWT_SECRET` —
are the only things that differ between environments:

| Service  | ECS (Cloud Map)                       | EKS (kube-dns)        |
|----------|---------------------------------------|-----------------------|
| Products | `http://products.shopnow.local:5001`  | `http://products:5001`|
| Cart     | `http://cart.shopnow.local:5002`      | `http://cart:5002`    |

---

## ECS vs EKS — what the benchmark shows

| Dimension              | ECS (Fargate)                                  | EKS                                              |
|------------------------|------------------------------------------------|-------------------------------------------------|
| Setup complexity       | Low — AWS-native, fewer moving parts           | Higher — control plane + addons + LB controller |
| Servers to manage      | None (serverless Fargate)                      | Node groups (or Fargate profiles)               |
| Service discovery      | Cloud Map (`*.shopnow.local`)                  | Built-in kube-dns (`*.svc.cluster.local`)       |
| Load balancing         | ALB + target groups (native)                   | Ingress → ALB via LB Controller; Service for L4  |
| Control-plane cost     | $0                                             | ~$0.10/hr per cluster                            |
| Portability            | AWS-locked                                      | Portable (any K8s)                               |
| Ecosystem              | AWS console/CLI/IaC                            | Huge CNCF ecosystem (Helm, operators, etc.)     |
| Best for               | Teams wanting simplicity & speed on AWS         | Teams wanting K8s portability & flexibility      |

**Rule of thumb for ShopNow:** start on **ECS Fargate** for fastest time-to-prod
with the least ops burden; move to **EKS** when you need multi-cloud portability,
advanced scheduling, or the Kubernetes ecosystem.

---


## Design notes / caveats

- **Stateful tiers are demo-grade.** Postgres/Redis run as single replicas with
  ephemeral storage on both platforms. For production use Amazon RDS + ElastiCache
  (or StatefulSets + EBS PVCs on EKS) and store credentials in Secrets Manager.
- **Microservices + database-per-service.** Products and Cart are independently
  deployable, independently scalable, and own their own datastore. Killing one
  doesn't take down the other.
- **Same images, two runtimes.** The only per-environment change is the service
  URLs (`PRODUCTS_URL` / `CART_URL`), proving the containers are portable.
- **Secrets** are inline here for clarity only. Replace with AWS Secrets Manager
  (ECS `secrets`) / Kubernetes external-secrets in production. This now includes
  the shared `JWT_SECRET` — it must be identical for the Products and Cart
  services (they both verify the same auth tokens). It's a Terraform `jwt_secret`
  variable for ECS and the `app-secrets` Secret for EKS.
- **Payments are mocked.** Checkout runs a deterministic in-process gateway (any
  card ending `0000` is declined); no real charge, no external keys. Swap in a
  real PSP (Stripe, etc.) at the `POST /api/orders` boundary for production.
- **The frontend has a build step.** The Angular app under `app/frontend/web` is
  compiled during the Docker image build (multi-stage); the runtime image just
  serves the static bundle and proxies `/api`. The image is still environment-
  agnostic — same image on ECS and EKS.
