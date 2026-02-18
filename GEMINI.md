# Shannon - AI Penetration Testing Framework

## Project Overview

Shannon is an autonomous AI pentester designed to break web applications before attackers do. It functions as a white-box pentester, requiring access to the application's source code to guide its attacks.

**Key Features:**
*   **Autonomous Operation:** Handles the entire pentest lifecycle from reconnaissance to reporting.
*   **Proof-of-Exploit:** Focuses on actionable findings by proving vulnerabilities with real exploits (e.g., SQL injection, XSS).
*   **Multi-Agent Architecture:** Uses specialized agents for different tasks (Recon, Vuln Analysis, Exploitation), orchestrated by Temporal.io.
*   **White-Box Analysis:** Analyzes source code to inform dynamic attacks.

**Tech Stack:**
*   **Language:** TypeScript (Node.js)
*   **Orchestration:** Temporal.io
*   **AI Engine:** Anthropic Claude Agent SDK
*   **Infrastructure:** Docker & Docker Compose
*   **CLI:** Bash script wrapper (`./shannon`)

## Directory Structure

*   `shannon/`: Main project root.
    *   `shannon`: CLI entry point (Bash script).
    *   `src/`: Application source code.
        *   `temporal/`: Temporal workflow definitions, worker, and client.
        *   `phases/`: Logic for pentest phases (Recon, Analysis, Exploitation).
        *   `ai/`: AI agent implementations.
    *   `mcp-server/`: Model Context Protocol server implementation.
    *   `configs/`: Configuration files for the pentester.
    *   `docker-compose.yml`: Docker services definition (Temporal, Worker, Router).

## Building and Running

The project is primarily run via the `./shannon` CLI script, which wraps Docker Compose commands.

### Prerequisites
*   Docker & Docker Compose
*   Anthropic API Key (or compatible provider via Router)

### Key Commands

**1. Setup & Configuration**
Create a `.env` file in the `shannon/` directory:
```bash
ANTHROPIC_API_KEY=your-api-key
CLAUDE_CODE_MAX_OUTPUT_TOKENS=64000
```

**2. Start a Pentest**
```bash
cd shannon
./shannon start URL=<target-url> REPO=<repo-name>
```
*   `URL`: The URL of the running application to test.
*   `REPO`: The folder name of the target repository (must be placed in `shannon/repos/`).

**3. Monitor Progress**
```bash
./shannon logs ID=<workflow-id>
./shannon query ID=<workflow-id>
```
*   **Temporal UI:** Accessible at `http://localhost:8233`.

**4. Stop Services**
```bash
./shannon stop
# To remove all data/volumes:
./shannon stop CLEAN=true
```

## Development Conventions

*   **TypeScript:** The codebase is written in TypeScript. Build with `npm run build` (which runs `tsc`).
*   **Temporal Workflows:** Logic is structured around Temporal workflows and activities. The `worker` service executes these activities.
*   **Docker-First:** Development and execution happen primarily within Docker containers. The `shannon` script handles mounting volumes for code, configs, and output.
*   **Repo Structure:** Target repositories must be placed in `shannon/repos/` to be accessible by the pentester.
