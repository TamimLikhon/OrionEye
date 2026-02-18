# Shannon-Gemini Issues Log - Updated

## [2026-02-18] GrepTool Performance Optimization

**Description:**
The `runRecon` activity was timing out and retrying (3 times) even after increasing `maxTurns` to 100. The root cause was identified as the `grep_search` tool scanning large directories like `node_modules`, `.git`, `dist`, etc., causing significant delays and potential timeouts.

**Resolution:**
- Updated `src/ai/tools.ts` to modify the `GrepTool` implementation.
- Added exclusions to the grep command: `--exclude-dir={node_modules,.git,dist,build,vendor,coverage} --exclude=package-lock.json --exclude=yarn.lock`.
- Added `-I` flag to ignore binary files.

**Impact:**
- Significantly faster search execution.
- Reduced risk of timeouts during reconnaissance on large repositories.
- Prevents the AI from ingesting irrelevant dependency code.

**Status:**
- [x] Fixed (2026-02-18)

## [2026-02-18] Activity Timeout Increase

**Description:**
The `runRecon` activity was still timing out with `TIMEOUT_TYPE_START_TO_CLOSE` after 30 minutes, even with optimized tools. Large repositories simply take longer for the AI to analyze thoroughly.

**Resolution:**
- Updated `src/temporal/workflows.ts` to increase `startToCloseTimeout` from "30 minutes" to "2 hours".

**Impact:**
- Prevents premature termination of long-running analysis tasks.
- Allows the AI sufficient time to complete deep reconnaissance.

**Status:**
- [x] Fixed (2026-02-18)
