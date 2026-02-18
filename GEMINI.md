# OrionEye: Autonomous AI Penetration Testing Framework (Gemini Port)

## Project Overview
OrionEye is a port of the Shannon autonomous pentesting framework to the Google Gemini ecosystem. It performs white-box, source-aware security assessments using Gemini 1.5 Pro models orchestrated via Temporal.io.

## Core Mandates
- **No Exploit, No Report:** Only vulnerabilities confirmed via active exploitation are included in the final report.
- **Source-to-Sink Analysis:** Every vulnerability must be traced from an untrusted source to a dangerous sink in the source code.
- **Durable Workflows:** All long-running operations MUST be implemented as Temporal Workflows or Activities to ensure survival across crashes.
- **Surgical Agents:** Agents are specialized by role (Recon, XSS Analysis, etc.). Do not mix unrelated logic into a single agent.

## Architecture
1.  **Phase 1: Pre-Recon (`pre-recon`)**: Source code analysis to identify potential attack surfaces.
2.  **Phase 2: Recon (`recon`)**: Active mapping of the live application correlated with source code.
3.  **Phase 3: Vuln Analysis** (Parallel): Specialized agents (Injection, XSS, Auth, SSRF, Authz) hunt for exploitable paths.
4.  **Phase 4: Exploitation** (Parallel/Sequential): Active weaponization and verification of findings.
5.  **Phase 5: Reporting (`report`)**: Consolidation of verified findings into a professional report.

## Development Conventions
- **TypeScript:** Rigorous typing is required. Avoid `any`.
- **System Prompts:** Prompts are stored in `src/ai/prompts.ts`. Keep them role-focused and grounded in the source-to-sink methodology.
- **Tools:** Tools are defined in `src/ai/tools.ts` using Gemini Function Calling schemas.
- **Deliverables:** All formal agent outputs must be saved to the `deliverables/` folder in the target repository using the `save_deliverable` tool.

## Directory Structure
- `src/agents/`: Role-specific agent implementations.
- `src/ai/`: Core Gemini executor and tool definitions.
- `src/temporal/`: Workflow and activity definitions.
- `prompts/`: (Optional) Large prompt templates.
- `orioneye`: Unified CLI script for Linux/Mac/Windows.

## CLI Usage
```bash
./orioneye start URL=<target-url> REPO=<repo-name>
./orioneye logs ID=<workflow-id>
./orioneye stop
```
