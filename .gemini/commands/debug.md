---
description: Systematically debug OrionEye (Gemini) errors using context analysis and structured recovery
---

You are debugging an issue in OrionEye. Follow this structured approach to avoid spinning in circles.

## Step 1: Capture Error Context
- Read the full error message and stack trace.
- Identify the layer where the error originated:
  - **CLI/Args** - Input validation, path resolution (`orioneye` script).
  - **Temporal Client** - Workflow submission (`src/temporal/client.ts`).
  - **Workflow Logic** - Pipeline orchestration (`src/temporal/workflows.ts`).
  - **Activities** - Agent execution wrappers (`src/temporal/activities.ts`).
  - **Agents** - Individual agent logic (`src/agents/`).
  - **Gemini Engine** - SDK calls, tool execution, turn handling (`src/ai/gemini-executor.ts`).
  - **Tools** - File system, network, or deliverable tools (`src/ai/tools.ts`).

## Step 2: Check Relevant Logs

**Temporal UI:**
Check `http://localhost:8233` for workflow status and activity heartbeats.

**Filesystem Logs:**
```bash
# Check deliverable outputs
ls -R repos/<repo>/deliverables/

# Check audit logs (if configured)
ls -lt audit-logs/
```

## Step 3: Trace the Call Path

1. **CLI** (`orioneye`) -> Calls Docker Compose.
2. **Temporal Client** (`src/temporal/client.ts`) -> Starts `pentestWorkflow`.
3. **Workflow** (`src/temporal/workflows.ts`) -> Coordinates Pre-Recon -> Recon -> Vuln Analysis -> Exploitation -> Report.
4. **Activities** (`src/temporal/activities.ts`) -> Instantiates and runs Agents.
5. **Agents** (`src/agents/*.ts`) -> Defines system prompts and run logic.
6. **Gemini Executor** (`src/ai/gemini-executor.ts`) -> Calls Google AI SDK.
7. **Tools** (`src/ai/tools.ts`) -> Executes requested functions.

## Step 4: Identify Root Cause

**Common OrionEye-specific issues:**

| Symptom | Likely Cause | Fix |
|---------|--------------|-----|
| Agent hits `maxTurns` limit | Analysis too complex for 100 turns | Increase `maxTurns` in `BaseAgent` constructor. |
| "Validation failed: Missing deliverable" | Agent didn't call `save_deliverable` | Review agent system prompt and `run()` logic. |
| Temporal Workflow Timeout | `startToCloseTimeout` too short | Increase timeout in `workflows.ts` (currently 2 hours). |
| Gemini API Error (Quota/Billing) | Rate limited or budget exceeded | Check Google AI Studio / GCP Console. |
| Parallel agents fail | Shared resource contention | Ensure unique paths or separate worker instances. |

## Step 5: Apply Fix & Validate

**Compile and Verify:**
```bash
# Compile TypeScript
npm run build

# Verify build
ls dist/
```

**Test Run:**
```bash
./orioneye start URL=<target> REPO=<repo>
```

---
Now analyze the error and begin debugging systematically.
