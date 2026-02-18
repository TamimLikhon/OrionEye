---
description: Review code changes for OrionEye (Gemini) patterns, security, and common mistakes
---

Review the current changes (staged or working directory) with focus on OrionEye-specific patterns.

## Step 1: Gather Changes
```bash
git diff --stat HEAD
git diff HEAD
```

## Step 2: Check OrionEye-Specific Patterns

### Temporal & Activity Logic
- [ ] **Agent instance inside Activity** - Ensure agents are instantiated inside activities, not shared globally.
- [ ] **Context logging** - Use `Context.current().log.info` inside activities for better traceability.
- [ ] **Input validation** - Ensure `url` and `repoPath` are validated before passing to agents.

### Gemini Engine & Tools
- [ ] **System Prompt Integrity** - Check that system prompts in `src/ai/prompts.ts` follow the intended specialist role.
- [ ] **Tool Declarations** - Ensure all new tools in `src/ai/tools.ts` have correct `SchemaType` definitions.
- [ ] **Max Turns** - Verify `maxTurns` is appropriate for the agent's complexity (default 100).
- [ ] **JSON Parsing** - Ensure agents handle potential non-JSON output from the model gracefully.

### Deliverables
- [ ] **save_deliverable tool usage** - Analysis and Queue agents MUST use `save_deliverable` for formal outputs.
- [ ] **Deliverable Paths** - Ensure deliverables are saved under `deliverables/` relative to the repository path.

## Step 3: Security Review
- [ ] **No Secrets in Logs** - Verify `GOOGLE_API_KEY` is never logged.
- [ ] **Sanitized Shell Commands** - `run_command` arguments should be safe from injection.
- [ ] **Path Traversal Prevention** - `read_file` and `write_file` should validate paths.

## Step 4: Code Quality
- [ ] **TypeScript Safety** - Avoid `any` where possible. Use explicit types for agent inputs/outputs.
- [ ] **Kebab-case File Naming** - Ensure new files follow the project's naming convention.

---
Now review the current changes.
