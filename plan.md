# OrionEye (Shannon-Gemini) Project Details

## 🚀 Core Features

-   **Fully Autonomous Lifecycle:** Handles reconnaissance, vulnerability analysis, exploitation, and reporting without human intervention.
-   **White-Box Intelligence:** Analyzes target source code to identify potential sinks and data flows.
-   **Proof-by-Exploitation:** Follows a strict "No Exploit, No Report" policy, verifying vulnerabilities with real-world PoCs.
-   **Multi-Agent Architecture:** Specialized agents for different vulnerability classes (Injection, XSS, Auth, Authz, SSRF).
-   **Resilient Orchestration:** Built on **Temporal.io** for reliable, long-running workflows.
-   **Cross-Platform CLI:** A unified `orioneye` script for Linux, macOS, and Windows (via Git Bash).

## 🏗️ Architecture & Tech Stack

-   **AI Engine:** Gemini 1.5 Pro (via Google Generative AI SDK) with native Function Calling.
-   **Orchestration:** Temporal.io (Workflow Engine).
-   **Runtime:** Docker & Docker Compose.
-   **Language:** TypeScript / Node.js.
-   **Automation:** Playwright for browser-based attacks.

## 🛤️ Roadmap & Progress

-   [x] Phase 1: Foundation (Temporal + Docker + CLI).
-   [x] Phase 2: AI Engine (Gemini Executor + Core Tools).
-   [x] Phase 3: 5-Phase Pipeline (Pre-Recon to Reporting).
-   [x] Phase 4: Expanded Vulnerability Agents (XSS, Auth, Authz, SSRF).
-   [ ] Phase 5: Advanced Tooling (MCP Server integration, Benchmarking).

## ⚠️ Important Notes

-   **Platform Compatibility:** On Windows, use Git Bash or WSL2. Native PowerShell is supported via `orioneye` (bash) if Git Bash is installed, or through Docker Desktop.
-   **Antivirus:** Real exploit payloads may be flagged by AV. Set up exclusions for the `repos/` and `audit-logs/` directories.
-   **Cost:** Autonomous runs consume significant tokens. Gemini 1.5 Pro's large context window is utilized to minimize context fragmentation.

## 📜 License

AGPL-3.0 (Inherited from Shannon)
