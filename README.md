# OrionEye (Shannon-Gemini)

OrionEye is an autonomous AI penetration testing framework powered by Google's Gemini 1.5 Pro models.

## 📋 Prerequisites

-   **Docker & Docker Compose**
-   **Node.js (v20+)**
-   **Google Cloud API Key** (with access to Gemini 1.5 Pro)

## 🛠️ Setup & Usage

1.  **Clone/Navigate:**
    ```bash
    cd OrionEye
    ```

2.  **Environment:**
    Create a `.env` file in the `OrionEye` directory:
    ```bash
    GOOGLE_API_KEY=your-gemini-api-key
    ```

3.  **Start a Pentest:**
    ```bash
    ./orioneye start URL=https://example.com REPO=my-repo-name
    ```
    *Note: Ensure your target repository is placed inside `OrionEye/repos/`.*

4.  **Monitor Progress:**
    -   **Temporal UI:** `http://localhost:8233`
    -   **Logs:** `./orioneye logs ID=<workflow-id>`

5.  **Stop Services:**
    ```bash
    ./orioneye stop
    # To remove all data/volumes:
    ./orioneye stop CLEAN=true
    ```

---
For detailed information about the project architecture, features, and roadmap, see [plan.md](./plan.md).
