_Generated 2026-06-23T14:49:15Z_

**2 incident(s) detected.**

## [API] API error rate > 5%
- **Insight ID:** `techstream-api-1782225755`
- **Window:** 14:42:35 -> 14:43:40 (65s)
- **Peak api_errors:** 0.3495 (threshold 0.05)

### Correlated signals
| Signal | Baseline | Peak | Amplification | Driver? |
| --- | --- | --- | --- | --- |
| api_traffic | 11.8535 | 6.0416 | 0.51x | no |
| api_latency_p95 | 0.0337 | 0.0252 | 0.75x | no |
| api_cpu | 0.0297 | 0.0136 | 0.46x | no |
| db_p95 | 0.0265 | 0.0288 | 1.09x | no |
| cache_hit | 0.3648 | 0.2 | 1.82x | no |
| queue_depth | 0.1889 | 248.0 | 1312.94x | no |
| worker_throughput | 0.7959 | 0.0364 | 0.05x | no |
| worker_errors | 0.0 | 0.0 | 1.0x | no |

### Probable root cause
> API returned 5xx with NO significant correlated resource signal -- consistent with a bad deploy or fault-injection event, not resource exhaustion.

### Automated remediation
- `restart` on **techstream-api** (trigger: HighErrorRate) at 2026-06-23T14:42:53Z

### Recommendation
Self-healing restarted the API tier and recovered the error rate. Prevent recurrence: autoscale on CPU/latency, add a circuit breaker on the failing path, and gate deploys on a 5xx canary check.

## [WORKER] Worker queue backlog > 50
- **Insight ID:** `techstream-worker-1782225820`
- **Window:** 14:43:40 -> 14:44:35 (55s)
- **Peak queue_depth:** 248.0 (threshold 50)

### Correlated signals
| Signal | Baseline | Peak | Amplification | Driver? |
| --- | --- | --- | --- | --- |
| api_errors | 0.0352 | 0.0371 | 1.05x | no |
| api_traffic | 10.4975 | 6.0416 | 0.58x | no |
| api_latency_p95 | 0.0323 | 0.025 | 0.77x | no |
| api_cpu | 0.0268 | 0.014 | 0.52x | no |
| db_p95 | 0.0254 | 0.0242 | 0.95x | no |
| cache_hit | 0.3511 | 0.3454 | 1.02x | no |
| worker_throughput | 0.6914 | 4.4907 | 6.49x | yes |
| worker_errors | 0.0 | 0.0 | 1.0x | no |

### Probable root cause
> Worker queue backlog -- job arrival rate exceeded processing rate (under-provisioned worker or a job slowdown).

### Automated remediation
- `restart` on **techstream-worker** (trigger: WorkerQueueBacklog) at 2026-06-23T14:44:13Z

### Recommendation
Self-healing restarted the worker tier and drained the backlog. Prevent recurrence: autoscale workers on queue depth, add a dead-letter queue for poison jobs, and alert on throughput < arrival rate.
