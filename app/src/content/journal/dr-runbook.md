**Objective:** restore the critical database in a different region within
**30 minutes** (RTO ≤ 30m). RPO = up to 24h with the daily plan (tighten the
schedule for a smaller RPO).

| Term | Value here |
|------|-----------|
| Primary region | `us-east-1` |
| DR region | `us-west-2` |
| Protected resource | RDS PostgreSQL `fincorp-primary` |
| Backup mechanism | AWS Backup daily plan + cross-region `copy_action` |
| DR vault | `fincorp-dr-vault` (us-west-2) |
| Restore target | `fincorp-restored-dr` (us-west-2) |

---

## 0. Pre-flight (one-time, done by `terraform apply`)

- RDS is tagged `Backup = fincorp-daily`.
- AWS Backup plan copies daily recovery points to the DR vault in us-west-2.
- DR VPC + DB subnet group already exist in us-west-2 (keeps RTO predictable).

Verify the wiring:
```bash
cd infra && terraform output            # confirm vault names, regions, ids
aws backup get-backup-plan --backup-plan-id "$(terraform output -raw backup_plan_id 2>/dev/null)" 2>/dev/null
```

---

## 1. Seed canary data (so we can prove the data survived)

```bash
# Get the primary DB connection string from Secrets Manager
SECRET_ARN=$(cd infra && terraform output -raw db_secret_arn)
export DATABASE_URL=$(aws secretsmanager get-secret-value --secret-id "$SECRET_ARN" \
  --query SecretString --output text | python3 -c 'import sys,json;print(json.load(sys.stdin)["database_url"])')

# Write known canary rows into the PRIMARY database
cd app && python scripts/seed_and_verify.py --seed
```
This creates two accounts and a transfer; expected balances are 7500 / 2500.

---

## 2. Create a cross-region recovery point now

The daily schedule runs at 05:00 UTC. For a live demo, force one immediately:

```bash
./scripts/dr-create-ondemand-backup.sh
```
Wait until the backup job is `COMPLETED`, then until the copy lands in the DR
vault:
```bash
aws backup list-recovery-points-by-backup-vault \
  --backup-vault-name fincorp-dr-vault --region us-west-2 \
  --query 'RecoveryPoints[].{arn:RecoveryPointArn,status:Status,created:CreationDate}'
```
> Cross-region copy of a small RDS snapshot typically lands in a few minutes.
> **Tip:** do steps 1–2 *before* the live walkthrough so you're not watching a
> progress bar on stage; the timed restore in step 4 is the part that matters.

---

## 3. Simulate the region failure

```bash
./scripts/dr-simulate-failure.sh
```
This first re-confirms a DR recovery point exists, then **deletes the primary
RDS instance** in us-east-1 with no final snapshot — i.e. the primary region is
gone. The data now exists *only* in the us-west-2 backup vault.

---

## 4. Restore in the DR region (the < 30-minute proof)

```bash
./scripts/dr-restore.sh
```
The script:
1. finds the latest `COMPLETED` RDS recovery point in `fincorp-dr-vault`,
2. builds restore metadata (new identifier, DR subnet group, DR KMS key, not
   publicly accessible),
3. calls `aws backup start-restore-job` (resource type `RDS`),
4. polls the restore job and then `rds wait db-instance-available`,
5. **prints the total elapsed time** and the restored endpoint.

Expected tail:
```
============================================================
RESTORE COMPLETE in 540s (9m 0s) — RTO target: 30m
Restored DB endpoint (us-west-2): fincorp-restored-dr.xxxx.us-west-2.rds.amazonaws.com
```
> For a `db.t3.micro` with a small dataset, restore + availability is usually
> 8–15 minutes — comfortably inside the 30-minute objective.

---

## 5. Verify the data survived the failover

```bash
ENDPOINT=$(aws rds describe-db-instances --db-instance-identifier fincorp-restored-dr \
  --region us-west-2 --query 'DBInstances[0].Endpoint.Address' --output text)

# Reuse the SAME master credentials (they are restored with the snapshot)
export DATABASE_URL="postgresql+psycopg2://fincorp_admin:<password>@${ENDPOINT}:5432/fincorp"
cd app && python scripts/seed_and_verify.py --verify
# => [verify] PASS: canary data intact after DR restore (...=7500, ...=2500)
```
Exit code 0 == the ledger, balances, and audit trail all survived the
cross-region restore.

---

## 6. (Optional) point the app at the restored DB

The same immutable image runs in us-west-2 (it was replicated to DR ECR). Run it
with `DB_HOST` set to the restored endpoint; `entrypoint.sh` re-applies
migrations (idempotent) and serves. `/readyz` flips back to `200`.

---

## 7. Clean up

```bash
./scripts/teardown.sh --purge-backups
```

---

## RTO / RPO and alternatives

| Approach | RPO | RTO | Cost | Notes |
|----------|-----|-----|------|-------|
| **AWS Backup cross-region copy** (this) | ≤ 24h (tunable) | minutes | low | Matches the brief; restore on demand |
| Cross-region **read replica** | seconds | minutes (promote) | higher (always-on) | Better RPO; standby always running |
| Aurora **Global Database** | ~1s | < 1 min | highest | Best RTO/RPO; Aurora only |

To shrink RPO here, change `backup_schedule_cron` to run more frequently (e.g.
hourly) — the cross-region copy follows automatically.

## Troubleshooting

- **No recovery points in DR vault** → the daily job hasn't run / copy still in
  flight. Use `dr-create-ondemand-backup.sh` and wait for `COMPLETED`.
- **Restore job FAILED on subnet group** → confirm `terraform output
  dr_runbook_inputs.dr_subnet_group` exists in us-west-2.
- **`db-instance-available` wait times out** → large datasets take longer; the
  job is still fine, just re-run the wait. The clock the auditor cares about is
  in the script output.
