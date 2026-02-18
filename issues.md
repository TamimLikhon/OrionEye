# Shannon-Gemini Issues Log

This file tracks issues encountered during development and testing of Shannon-Gemini.

## [2026-02-17] Reconnaissance Phase Timeout on Large Repositories

**Description:**
The `ReconAgent` was failing and retrying indefinitely (or timing out) when analyzing the `juice-shop` repository. This occurred because the default `maxTurns` limit (30) for the Gemini executor was too low for the number of tool calls (file listings, grep searches) required to analyze a large codebase like Juice Shop. The AI would hit the limit and throw an error, causing the Temporal workflow to retry from the beginning.

**Impact:**
-   Infinite loop of retries.
-   Workflow stuck in "Running" state for over an hour.
-   Incomplete analysis.

**Resolution:**
-   Increased the default `maxTurns` in `src/ai/gemini-executor.ts` from **30** to **100**.
-   This provides the AI with more "thinking steps" to complete the reconnaissance phase on larger repositories.

**Status:**
-   [x] Fixed (2026-02-17)
