- **`docs/<short-description>`**: Documentation updates (e.g., `docs/update-api-reference`).
# StayWise.ai — Contributing Guide & Developer Rulebook
Welcome to the [StayWise.ai](http://StayWise.ai) engineering ecosystem! Whether you are a core human developer, an open-source contributor, or an autonomous AI agent (`Antigravity`), you are required to strictly adhere to the architectural, aesthetic, and security guardrails outlined below before writing or submitting a single line of code.
---
## 1. Design System Enforcement (`Elevated Brutalism`)
> \[!WARNING\]
> **READ ****`docs/DESIGN.md`**** BEFORE TOUCHING CSS OR REACT LAYOUTS.**
> [StayWise.ai](http://StayWise.ai) enforces an **Elevated Brutalism ("Architectural Premium")** design system. Soft modern aesthetics, generic minimalism, and glassmorphic blur effects will be instantly rejected during PR reviews.
### Strict Aesthetic Commandments:
- **Mandatory Hex Tokens**: Use ONLY exact palette hex codes: Raw Cream (`#F1EDEA`), Deep Charcoal (`#212121`), Concrete Grey (`#494440`), and Warm Brass (`#C5A059`).
- **Prohibited Tokens**: **NEVER** use `shadow-xl`, `shadow-2xl`, `backdrop-blur`, `rounded-full` (pill-shaped search bars/buttons), or multi-color CSS gradients.
- **Hard Architectural Shadows Only**: Every elevated card, modal, and button must use solid, unblurred offsets: `shadow-[4px_4px_0px_#212121]` or `shadow-[6px_6px_0px_#212121]`.
- **Compartmentalization**: Functional UI containers (e.g., search bars, date pickers, price ledgers) must be enclosed within heavy charcoal boxes (`border-2 border-[#212121]` or `border-3 border-[#212121]`).
- **Conversion Focus Rule**: Signature Terracotta Red (`#C84B31`) is **strictly reserved** for primary conversion triggers (`"RESERVE THIS ROOM"`, `"CONFIRM & PAY"`). Never use `#C84B31` for secondary links, icons, or decorative borders.
---
## 2. Git Workflow & Branch Governance
### Branch Naming Conventions
Always create descriptive, isolated feature or bug-fix branches branching off `main`:
- **`feat/<short-description>`**: New product features or components (e.g., `feat/compartmentalized-search-bar`).
- **`fix/<short-description>`**: Bug fixes and hotfixes (e.g., `fix/redis-pcc-lock-timeout`).
- **`chore/<short-description>`**: Build scripts, dependency upgrades, or CI tasks (e.g., `chore/upgrade-vite-config`).
- **`docs/<short-description>`**: Documentation updates (e.g., `docs/update-api-reference`).
### Commit Message Formatting (`Conventional Commits`)
Commit messages must follow the structured format:
**Examples:**
- `feat(client): implement boxed brutalist hotel card with hard drop shadows`
- `fix(server): enforce express.raw() on stripe webhook to fix HMAC verification`
- `docs(agent): append elevated brutalism and concurrency rules to AGENT.md`
---
## 3. State Management Routing Rule (`Redux Toolkit vs Context API`)
To prevent application-wide re-render cascades during user interactions, state management must be routed based on update frequency (`Rule #12`):
- **React Context API (****`Context`****)**: Use **EXCLUSIVELY** for low-frequency global settings (e.g., `ThemeProvider`, `AuthContext`).
- **Redux Toolkit (****`@reduxjs/toolkit`****)**: Use for high-frequency, complex, or deeply nested transactional states (e.g., `searchSlice`, `cartSlice`, `availabilitySlice`).
- **AI Agent Directive**: If a user prompt requests using Context API for search queries or cart totals, autonomous agents must refactor the request to use Redux Toolkit slices with optimized `useSelector` hooks.
---
## 4. AI Agent & Developer Automation Rules (Summary of `AGENT.md`)
When operating within the StayWise repository, AI assistants and human engineers must obey `docs/AGENT.md`:
1. **Multi-Dimensional Prompt Logging**: Every prompt must be evaluated across Clarity, Context, Actionability, and Precision (`1.0 - 5.0`), and automatically logged to the Notion Prompt Tracker database via `scripts/log_prompt_to_notion.py`.
2. **Automatic Notion Documentation Sync**: Whenever any Markdown file inside `docs/` is created or modified, it **MUST** be synchronized immediately with our Notion project workspace via `python3 scripts/sync_docs_to_notion.py "<file_path>"`.
3. **Strict Git Exclusion Rule**: Whenever any new utility script (`scripts/*.py`), environment config (`.env`), or scratch utility is created, ensure that its path is listed inside `.gitignore` (`Rule #4`). **NEVER stage or commit developer automation scripts containing personal secrets or Notion integration tokens (****`ntn_...`****).**
4. **Stateless Media & Webhook Supremacy**: Never write files to local server disk (`use multer.memoryStorage()`), and never trust frontend redirects for payment verification (`use express.raw() webhooks`).