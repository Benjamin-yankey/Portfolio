> Account inherited from previous team. Goal: identify "zombie" resources
> incurring spend without business value, quantify monthly waste, and remediate.

## Sandbox baseline

The `terraform/wasteful-resources/` module provisions the deliberate waste
scenario used for this audit:

| # | Resource | Why it's a zombie | Approx. monthly cost (eu-west-1) |
|---|---|---|---|
| 1 | `t3.large` EC2, no user-data, no CostCenter tag | Idle, over-sized, untagged | **$60.74** |
| 2 | 2 × `gp3` 100 GiB EBS volumes, state = `available` | Never attached to anything | **$16.00** |
| 3 | Elastic IP, no association | EIPs unassociated bill hourly | **$3.65** |
| 4 | 2 × Security groups, one attached to nothing | Clutter, not directly billed |  — |

**Estimated waste in this sandbox: ~$80.39 / month** doing zero work.
Extrapolated across a 50-account org of similar sloppiness this is the kind
of pattern that hides four- to five-figure annual leaks.

## Detection workflow

### 1. AWS Cost Explorer

1. Console -> **Cost Management -> Cost Explorer**.
2. Group by **Service**. Look for EC2-Other (where unattached EBS, EIPs, and
   data transfer hide) climbing while EC2-Instance hours stay flat.
3. Filter by tag: select `CostCenter` and check the **No tag** bucket. Any
   non-trivial dollars in that bucket = untagged resources that bypass
   showback/chargeback.
4. Save the view as a Cost Explorer report: `Zombie-Watch`.

Screenshot to capture: `screenshots/01-cost-explorer-untagged.png` showing
the "No CostCenter tag" slice.

### 2. Trusted Advisor

1. Console -> **Trusted Advisor -> Cost Optimization**.
2. Expected checks light up:
   - **Underutilized Amazon EC2 Instances** — flags the idle `t3.large`
     (CPU <10% for 14 consecutive days).
   - **Unassociated Elastic IP Addresses** — flags the orphan EIP.
   - **Amazon EBS Volume Idle** — typically reports volumes whose I/O has
     been 1 IOPS or less for the last 7 days.
   - **Idle Load Balancers** — N/A for this sandbox but worth checking.
3. Export each check to CSV for the report bundle.

Screenshot: `screenshots/02-trusted-advisor-cost.png`.

### 3. Compute Optimizer

1. Opt-in if not already enabled (free, takes ~12h to populate).
2. Console -> **Compute Optimizer -> EC2 instances**. The idle `t3.large`
   will surface as "Over-provisioned" with a recommendation to drop to
   `t3.small` or similar.
3. Capture the recommendation, including the projected monthly savings.

Screenshot: `screenshots/03-compute-optimizer.png`.

### 4. AWS Config

After the governance module is deployed, the `ec2-requires-costcenter-tag`
rule reports the idle EC2 instance as `NON_COMPLIANT` within a few minutes.

Screenshot: `screenshots/04-config-noncompliant.png`.

## Remediation actions taken

| Action | Tool | Result |
|---|---|---|
| Run `ebs_garbage_collector.py --dry-run` | scripts/cleanup | Identified the 2 orphan volumes, projected $16/mo recovery |
| Re-run with `--apply --snapshot-first` | scripts/cleanup | Volumes deleted, snapshots retained for 30d safety net |
| Release unassociated EIP | AWS CLI (`aws ec2 release-address`) | $3.65/mo recovered |
| Right-size or terminate idle t3.large | Compute Optimizer rec / Terraform destroy | $60+/mo recovered |
| Tag enforcement | Config rule + Lambda | Future untagged instances auto-stopped |
| Budget alerts | AWS Budgets + SNS | $50/mo cap with 80/100/forecast notifications |

## Total recoverable spend (this sandbox)

**~$80/month** -> **~$960/year** from a single tiny account. The same
detection pattern, applied to a real production org, is where FinOps pays
for itself in week one.
