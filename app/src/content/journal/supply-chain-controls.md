This document explains, and shows how to demonstrate, the three controls from
the brief:

1. CodeArtifact as an **upstream proxy** for pip/npm.
2. ECR with **image scanning** + **tag immutability**.
3. The build **fails on High/Critical** vulnerabilities.

---

## 1. CodeArtifact upstream proxy

### Topology (Terraform: `infra/modules/codeartifact`)
```
domain: fincorp
  ├─ pypi-store   --external-->  public:pypi
  ├─ npm-store    --external-->  public:npmjs
  └─ fincorp-app  --upstream-->  pypi-store, npm-store   ← builds use this
```

Any package not yet cached is pulled from the public registry **once**, stored
internally, and served from CodeArtifact forever after. This gives FinCorp a
single audited, controllable source of truth for dependencies.

### How the build authenticates (from `pipeline/buildspec.yml`)
```bash
export CODEARTIFACT_AUTH_TOKEN=$(aws codeartifact get-authorization-token \
  --domain fincorp --domain-owner "$AWS_ACCOUNT_ID" \
  --query authorizationToken --output text)

export CODEARTIFACT_INDEX_URL="https://aws:${CODEARTIFACT_AUTH_TOKEN}@fincorp-${AWS_ACCOUNT_ID}.d.codeartifact.${AWS_DEFAULT_REGION}.amazonaws.com/pypi/fincorp-app/simple/"
```
That index URL is passed into the Docker build as `--build-arg
CODEARTIFACT_INDEX_URL=...`, and the Dockerfile runs
`pip install --index-url "$CODEARTIFACT_INDEX_URL" -r requirements.txt`.

### Demonstrate it
```bash
# Show packages were cached in CodeArtifact after a build:
aws codeartifact list-packages --domain fincorp \
  --domain-owner "$ACCOUNT" --repository fincorp-app --format pypi

# Prove the build is NOT hitting public PyPI directly: the only network egress
# for pip is the *.codeartifact.<region>.amazonaws.com endpoint (CodeBuild logs).
```

---

## 2. ECR image scanning + tag immutability

Terraform (`infra/modules/ecr`):
```hcl
image_tag_mutability = "IMMUTABLE"
image_scanning_configuration { scan_on_push = true }
```
Plus an account-level registry rule (`SCAN_ON_PUSH` for `*`).

### Demonstrate tag immutability
```bash
# First push of a tag succeeds; re-pushing the SAME tag is rejected:
docker push $ECR/fincorp-ledger:demo            # OK
docker push $ECR/fincorp-ledger:demo            # ERROR: tag immutable
# => "cannot be overwritten because the repository is configured as immutable"
```
This guarantees the artifact behind a tag can never change after publication.

### Demonstrate scanning
```bash
aws ecr describe-image-scan-findings \
  --repository-name fincorp-ledger --image-id imageTag=<sha> \
  --query 'imageScanFindings.findingSeverityCounts'
# => { "CRITICAL": 0, "HIGH": 0, "MEDIUM": 3, ... }
```

---

## 3. Build fails on High/Critical

Enforced by `pipeline/scan-gate.sh`, called in the `post_build` phase:

- Polls `describe-image-scan-findings` until the scan status is `COMPLETE`.
- Reads `findingSeverityCounts`.
- Sums the counts for `HIGH` + `CRITICAL` (configurable via
  `VULN_FAIL_SEVERITIES`).
- **Exits 1 if that sum > 0**, which fails the CodeBuild action and therefore
  the pipeline. No vulnerable image is promoted.

### Demonstrate the gate firing (negative test)
Temporarily pin a known-vulnerable dependency, or point the base image at an old
tag, then run the pipeline. The build reaches `post_build`, the scan reports
HIGH/CRITICAL, and you'll see:

```
==========================================================
VULNERABILITY GATE FAILED: N finding(s) at [HIGH,CRITICAL]
Build rejected — image will NOT be promoted.
==========================================================
```
CodePipeline shows the Build stage as **Failed**. Revert the change and the
build goes green again.

---

## Where each control lives

| Control | File |
|---------|------|
| CodeArtifact domain + repos | `infra/modules/codeartifact/main.tf` |
| pip → CodeArtifact auth | `pipeline/buildspec.yml` (`pre_build`) |
| Dockerfile uses CodeArtifact index | `app/Dockerfile` (`deps` stage) |
| ECR immutability + scan-on-push | `infra/modules/ecr/main.tf` |
| Scan gate (fail on HIGH/CRITICAL) | `pipeline/scan-gate.sh` |
| CodeBuild IAM (least privilege) | `infra/modules/cicd/main.tf` |
