# Shannon-Gemini

Shannon-Gemini is an autonomous AI penetration testing framework powered by Google's Gemini 1.5 Pro models. It is a port of the original Shannon framework (which uses Claude).

## Features

-   **Autonomous Reconnaissance:** Analyze target URLs and repositories to identify attack surfaces.
-   **Vulnerability Analysis:** (Planned) Detect Injection, XSS, Auth bypasses.
-   **Exploitation:** (Planned) Verify vulnerabilities with real exploits.
-   **Reporting:** (Planned) Generate comprehensive reports.
-   **Gemini-Powered:** Uses the Google Generative AI SDK with native Function Calling.
-   **Resilient Orchestration:** Built on Temporal.io for reliable long-running workflows.

## Prerequisites

-   Docker & Docker Compose
-   Node.js (v20+)
-   Google Cloud API Key (with access to Gemini 1.5 Pro)

## Setup

1.  **Clone/Navigate:**
    ```bash
    cd shannon-gemini
    ```

2.  **Environment:**
    Create a `.env` file:
    ```bash
    GOOGLE_API_KEY=your-gemini-api-key
    ```

3.  **Build:**
    ```bash
    npm install
    npm run build
    ```

## Usage

**Start the stack and run a pentest:**

```bash
./shannon-gemini start URL=https://example.com REPO=my-repo-name
```

*Note:* Ensure your target repository is placed inside `shannon-gemini/repos/`.

## Architecture

-   `src/ai/gemini-executor.ts`: The core AI engine wrapping Google's Generative AI SDK.
-   `src/ai/tools.ts`: Tool definitions (File Read/Write, Shell Execution).
-   `src/agents/`: Specialized agents (Recon, etc.).
-   `src/temporal/`: Temporal workflow definitions and worker.

## Development

-   **Build:** `npm run build` (runs `tsc`)
-   **Worker:** `npm run temporal:worker`
-   **Client:** `npm run temporal:start <url> <repo>`

## License

AGPL-3.0 (inherited from Shannon)
