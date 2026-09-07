---
name: rate-limit-handler-refinement
description: "Handle API rate limiting with batching, pauses, retry logic, and exponential backoff. Use when performing bulk API operations that may exceed rate limits (Jira Cloud, Xray, other APIs). Triggers on: batch API operations, rate limit handling, bulk processing, API throttling. Do NOT use for: single API calls (use specific skill), test execution (use /sprint-testing), test documentation (use /test-documentation)."
license: MIT
compatibility: [claude-code, copilot, cursor, codex, opencode]
complementary_categories: [testing-e2e, issue-tracker]
---

# Rate Limit Handler Refinement

Manage API rate limiting with intelligent batching, pauses, retry logic, and exponential backoff. Prevents 429 errors and ensures reliable bulk operations.

## Scope

| Use for | Do not use for | Route instead |
|---------|----------------|---------------|
| Bulk API operations | Single API calls | Specific skill |
| Rate limit prevention | Test execution | `/sprint-testing` |
| Retry logic with backoff | Test documentation | `/test-documentation` |
| Throttling configuration | Ad-hoc queries | `/acli` |

## Rate Limit Rules

Do not treat undocumented service limits as facts. Read `Retry-After` and relevant rate-limit headers when present, use current service documentation only when available, and otherwise mark configured budgets as `Inference`. Classify each operation as idempotent, conditionally idempotent, or non-idempotent before retrying. Set a maximum elapsed time and persist a checkpoint before retrying or resuming.

### Service-specific limits
| Rule | Value | Notes |
|------|-------|-------|
| Limit | Not assumed | Read response headers or current service documentation |
| Penalty | 429 Too Many Requests | Honor `Retry-After` when present |

### Xray Cloud
| Rule | Value | Notes |
|------|-------|-------|
| Limit | Not assumed | Read response headers or current service documentation |
| Penalty | 429 Too Many Requests | Honor `Retry-After` when present |

## Batching Strategy

### Batch Size Calculation
```
batch_size = configured_bounded_value
```

Do not derive a service limit from this example. Record the chosen value and its evidence source.

### Pause Calculation
```
delay = max(server_retry_after, configured_jittered_backoff)
```

Use integer milliseconds in code. Decimal seconds must be converted before shell arithmetic, for example `500ms`, not `0.5` passed to `$((...))`.

### Recommended Settings

| Setting | Required behavior |
|---------|-------------------|
| Batch size | Configured, bounded, and checkpointed |
| Retry delay | `Retry-After` first, otherwise jittered exponential backoff |
| Max retries | Configurable and bounded by max elapsed time |
| Idempotency | Classify before retry; do not blindly replay non-idempotent writes |
| Resume | Persist checkpoint and skip verified items |

## Retry Logic

### Exponential Backoff
```python
def retry_with_backoff(func, retry_after_ms=None, max_retries=3, base_delay_ms=1000, max_elapsed_ms=30000):
    started_ms = monotonic_ms()
    for attempt in range(max_retries):
        try:
            return func()
        except RateLimitError:
            delay_ms = retry_after_ms or jittered(base_delay_ms * (2 ** attempt))
            if monotonic_ms() - started_ms + delay_ms > max_elapsed_ms:
                raise MaxElapsedTimeExceeded()
            sleep(delay_ms / 1000)
    raise MaxRetriesExceeded()
```

### Error Handling Matrix

| Error | Cause | Action | Delay |
|-------|-------|--------|-------|
| 429 | Rate limit | Pause, retry | `base_delay * 2^attempt` |
| 500 | Server error | Retry | `base_delay * 2^attempt` |
| 502 | Bad gateway | Retry | `base_delay * 2^attempt` |
| 503 | Service unavailable | Retry | `base_delay * 2^attempt` |
| 400 | Bad request | Do not retry | Fix request |
| 404 | Not found | Do not retry | Skip issue |

## Implementation Pattern

### Bash Pattern
```bash
#!/bin/bash
BATCH_SIZE="${RATE_LIMIT_BATCH_SIZE:?set an approved integer batch size}"
PAUSE_BETWEEN_ISSUES_MS=500
PAUSE_BETWEEN_BATCHES_MS=1000
MAX_RETRIES=3
MAX_ELAPSED_MS=30000

process_batch() {
    local batch=("$@")
    local count=0
    
    for issue in "${batch[@]}"; do
        ((count++))
        
        # Retry logic
        for attempt in $(seq 1 $MAX_RETRIES); do
            RESPONSE=$(curl -s -w "%{http_code}" -o /tmp/response.txt \
                -u "$ATLASSIAN_EMAIL:$ATLASSIAN_API_TOKEN" \
                -X PUT \
                -H "Content-Type: application/json" \
                -d "$(generate_payload "$issue")" \
                "{{issue_tracker.atlassian_url}}rest/api/3/issue/$issue")
            
            if [ "$RESPONSE" = "204" ]; then
                echo "$issue: ✓"
                break
            elif [ "$RESPONSE" = "429" ]; then
                DELAY_MS="${RETRY_AFTER_MS:-$((PAUSE_BETWEEN_ISSUES_MS * (2 ** (attempt - 1))))}"
                echo "Rate limited, waiting ${DELAY_MS}ms..."
                sleep "$(awk "BEGIN {print ${DELAY_MS}/1000}")"
            else
                echo "$issue: ✗ ($RESPONSE)"
                break
            fi
        done
        
        sleep "$(awk "BEGIN {print ${PAUSE_BETWEEN_ISSUES_MS}/1000}")"
    done
}

# Process in batches
TOTAL=${#ISSUES[@]}
for ((i=0; i<TOTAL; i+=BATCH_SIZE)); do
    BATCH=("${ISSUES[@]:$i:$BATCH_SIZE}")
    process_batch "${BATCH[@]}"
    sleep "$(awk "BEGIN {print ${PAUSE_BETWEEN_BATCHES_MS}/1000}")"
done
```

### Node.js Pattern
```typescript
class RateLimitHandler {
  private batchSize: number;
  private pauseBetweenIssues: number;
  private pauseBetweenBatches: number;
  private maxRetries: number;
  
  constructor(config: RateLimitConfig) {
    this.batchSize = config.batchSize || 10;
    this.pauseBetweenIssues = config.pauseBetweenIssues || 500;
    this.pauseBetweenBatches = config.pauseBetweenBatches || 1000;
    this.maxRetries = config.maxRetries || 3;
  }
  
  async processBatch<T>(
    items: T[],
    processor: (item: T) => Promise<void>
  ): Promise<BatchResult> {
    const result: BatchResult = {
      total: items.length,
      success: 0,
      failed: 0,
      rateLimited: 0
    };
    
    for (let i = 0; i < items.length; i += this.batchSize) {
      const batch = items.slice(i, i + this.batchSize);
      
      for (const item of batch) {
        let success = false;
        
        for (let attempt = 0; attempt < this.maxRetries; attempt++) {
          try {
            await processor(item);
            success = true;
            result.success++;
            break;
          } catch (error) {
            if (error.status === 429) {
              result.rateLimited++;
              const delay = this.pauseBetweenIssues * Math.pow(2, attempt);
              await this.sleep(delay);
            } else {
              result.failed++;
              break;
            }
          }
        }
        
        if (!success && result.failed === 0) {
          result.failed++;
        }
        
        await this.sleep(this.pauseBetweenIssues);
      }
      
      await this.sleep(this.pauseBetweenBatches);
    }
    
    return result;
  }
  
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

## Monitoring and Logging

### Progress Indicators
```
=== Rate Limit Handler ===
Total items: N
Batch size: configured value
Total batches: derived

[Batch 1/derived] Items 1-N...
  <item>: verified
  ...
  Pause response-guided delay...

[Lote 2/9] Items 11-20...
...

=== Final Report ===
Total processed: N
Verified: N
Failed: N
Unverified: N
Elapsed: measured
```

### Metrics to Track
- Total items processed
- Success/fail rate
- Rate limit incidents
- Average processing time
- Total execution time against max elapsed time

## Configuration

### Environment Variables
```bash
# Rate limiting
RATE_LIMIT_BATCH_SIZE=<approved integer>
RATE_LIMIT_PAUSE_ISSUES_MS=500
RATE_LIMIT_PAUSE_BATCHES_MS=1000
RATE_LIMIT_MAX_RETRIES=3
RATE_LIMIT_MAX_ELAPSED_MS=30000

# Service-specific limits are not hardcoded; capture response headers/configuration at runtime.
```

### Config File
```json
{
  "rateLimiting": {
    "jira": {
      "limit": 10,
      "burst": 20,
      "batchSize": 10,
      "pauseBetweenIssues": 500,
      "pauseBetweenBatches": 1000
    },
    "xray": {
      "limit": 5,
      "burst": 10,
      "batchSize": 5,
      "pauseBetweenIssues": 1000,
      "pauseBetweenBatches": 2000
    }
  }
}
```

## Engram Updates

After successful batch operation, save:
- Pattern: rate limiting for Jira Cloud
- Pattern: batch processing with pauses
- Discovery: optimal batch sizes for different APIs

## Subagent Dispatch Strategy

For complex rate-limiting scenarios, use subagents:
- **Orchestrator**: Manages batch progress and pauses
- **Worker subagents**: Process individual batches
- **Monitor subagent**: Tracks rate limit metrics

## Examples

### Example 1: Jira Batch Update
```bash
# Input: approved issue list to update
# Config: bounded batch size, response-guided delay, max elapsed time
# Output: verified/failed/unverified results and resume checkpoint
```

### Example 2: Xray Batch Import
```bash
# Input: 50 test results to import
# Config: batch_size=5, pause=1s issues, 2s batches
# Output: 50 results imported, 0 rate limit errors
```
