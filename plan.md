# Shannon-Gemini Development Plan

## Goal
Create an autonomous AI pentester similar to Shannon, but powered by Google's Gemini models (specifically Gemini 1.5 Pro) instead of Anthropic's Claude.

## Architecture

The system will mirror Shannon's successful architecture:
1.  **Orchestration:** Temporal.io for managing long-running, resilient workflows.
2.  **Environment:** Docker containers for isolation and tool availability.
3.  **AI Engine:** Google Generative AI SDK replacing the Anthropic Agent SDK.
4.  **Interface:** CLI-based interaction.

## Tech Stack
-   **Language:** TypeScript / Node.js
-   **AI Model:** Gemini 1.5 Pro (via `@google/generative-ai`)
-   **Orchestrator:** Temporal (`@temporalio/*`)
-   **Runtime:** Docker & Docker Compose
-   **Validation:** Zod

## Roadmap

### Phase 1: Foundation & Scaffold
-   [ ] Initialize project structure (`package.json`, `tsconfig.json`).
-   [ ] Create `docker-compose.yml` (Temporal + Worker).
-   [ ] Create CLI entry point (`shannon-gemini`).
-   [ ] Set up basic Temporal worker infrastructure.

### Phase 2: AI Engine (The "Brain")
-   [ ] Implement `GeminiExecutor` to replace `ClaudeExecutor`.
    -   Support for Gemini Function Calling (Tools).
    -   Context management.
    -   Retry logic and Error handling.
-   [ ] Implement Core Tools (as Gemini Functions):
    -   `readFile`, `writeFile`, `listFiles`.
    -   `runCommand` (Shell execution).
    -   `browser` (Headless browser interaction - basic).

### Phase 3: Workflows & Activities
-   [ ] Port the `pentestPipelineWorkflow` from Shannon.
    -   Reconnaissance Phase.
    -   Vulnerability Analysis (Parallel pipelines).
    -   Exploitation Phase.
    -   Reporting.
-   [ ] Implement Activities that wrap the `GeminiExecutor` with specific prompts.

### Phase 4: Prompts & Agents
-   [ ] Adapt Shannon's prompts for Gemini.
    -   *Note:* Gemini often requires slightly different prompting styles (more explicit instructions on tool usage).
-   [ ] Create Agent definitions:
    -   `ReconAgent`
    -   `VulnAnalysisAgent` (Injection, XSS, Auth, SSRF).
    -   `ExploitAgent`.
    -   `ReportAgent`.

### Phase 5: Testing & Refinement
-   [ ] Test against a vulnerable target (e.g., local Juice Shop or similar).
-   [ ] Tune prompts and tool definitions based on performance.

## Directory Structure (Planned)

```
shannon-gemini/
├── package.json
├── tsconfig.json
├── docker-compose.yml
├── shannon-gemini (CLI script)
├── src/
│   ├── ai/
│   │   ├── gemini-executor.ts
│   │   └── tools.ts
│   ├── temporal/
│   │   ├── client.ts
│   │   ├── worker.ts
│   │   ├── workflows.ts
│   │   └── activities.ts
│   ├── agents/
│   │   ├── recon.ts
│   │   ├── injection.ts
│   │   └── ...
│   └── utils/
└── configs/
```
