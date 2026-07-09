# StayWise Agent Workspace Rules
## Automatic Notion Documentation Sync Rule
Whenever any markdown file (`*.md`) inside the `docs/` directory is created or modified during a coding session, automatically run `python3 scripts/sync_docs_to_notion.py "docs/<filename>.md"` in the background (using `run_command` with `SafeToAutoRun: true`) to ensure that the project documentation is immediately synchronized and live in the user's Notion workspace.

## Documentation Restoration & Fallback Rule
At the start of every session or task, the agent MUST verify that all expected documentation files (e.g. `docs/AGENT.md`, `docs/PRD.md`, `docs/DESIGN.md`, etc.) are present in the local `docs/` directory. If any documentation files are missing, the agent MUST immediately run:
```bash
python3 scripts/sync_docs_from_notion.py
```
in the background (using `run_command` with `SafeToAutoRun: true`) to pull down and restore the complete documentation suite from Notion before performing any code modifications.

## Automatic Notion Prompt Tracking Rule
Whenever the user gives a prompt or task during the session, the agent MUST evaluate the prompt using the \*\*Multi-Dimensional Prompt Evaluation Rubric\*\* below before logging it:
### Multi-Dimensional Prompt Evaluation Rubric (Scale: 1.0 to 5.0)
Evaluate the prompt across 4 concrete metrics:
1. \*\*Clarity & Specificity (\`1-5\`):\*\* How precisely does the prompt define the exact feature, component, or behavior without ambiguity?
2. \*\*Context & Scope (\`1-5\`):\*\* Does the prompt provide architectural context, constraints, or boundary conditions?
3. \*\*Actionability (\`1-5\`):\*\* Can the agent immediately execute precise code edits/tools without guessing or requiring clarification?
4. \*\*Technical Precision (\`1-5\`):\*\* Does the prompt specify exact frameworks, schemas, routes, or file paths?
### Required Format for \`\<quality_evaluation\>\`:
### Required Format for \`\<suggestions\>\` (Strict Anti-Vagueness Rule):
NEVER use vague advice like "Be more specific" or "Add more details." You MUST provide exact, actionable improvements:
- \*\*Missing Parameters:\*\* State exactly what technical parameters or constraints should be specified next time.
- \*\*Improved Prompt Example:\*\* Provide a concrete, drop-in rewritten version of the prompt that would achieve \`5.0/5.0\` (e.g., \`"Update server/models/Room.js to add a commissionFee field (\`Number\`, required) and sync the schema to MongoDB."\`).
### Background Execution Command:
In the background (using \`run_command\` with \`SafeToAutoRun: true\`), run:
```bash
python3 scripts/log_prompt_to_notion.py "<prompt_text>" "<quality_evaluation>" "<suggestions>"
```
## Developer Automation & Git Hygiene Rule
Whenever any new utility script, internal developer automation hook, API synchronization file (\`scripts/\*.py\`), environment variable file (\`.env\`), or local temporary/scratch file is created during a session:
1. \*\*Strict Git Exclusion:\*\* Verify that the folder or file pattern (\`scripts/\`, \`.env\`, \`.cache/\`, etc.) is listed inside \`.gitignore\` immediately upon creation.
2. \*\*Never Stage or Commit Automation Secrets:\*\* Developer-specific scripts or internal utilities (especially those containing personal API keys, integration tokens like Notion \`ntn_...\`, or local path configurations) MUST NEVER be staged (\`git add\`), committed, or pushed to the remote Git repository (\`origin\`). Only core project source code (\`client/\`, \`server/\`, \`docs/\*.md\`) and \`.gitignore\` itself shall be tracked in Git.
---
## StayWise.ai Architectural & Operational Guardrails
### 8. Elevated Brutalism Design System Enforcement Rule
\*\*Trigger:\*\* Whenever generating, modifying, or reviewing React components, Tailwind CSS classes, or UI layouts.
\*\*Constraint:\*\* The platform strictly adheres to the "Architectural Premium" aesthetic. Soft UI, glassmorphism, and modern minimalist trends are strictly prohibited.
- \*\*Mandatory Tokens:\*\* Always use the exact hex codes: Raw Cream (\`#F1EDEA\`), Deep Charcoal (\`#212121\`), Concrete Grey (\`#494440\`), and Warm Brass (\`#C5A059\`).
- \*\*Hard Shadows Only:\*\* NEVER use soft drop shadows (e.g., \`shadow-xl\`, \`shadow-2xl\`). All elevations must use hard, unblurred offsets: \`shadow-\[4px_4px_0px_#212121\]\`, \`shadow-\[6px_6px_0px_#212121\]\`, etc.
- \*\*Compartmentalization:\*\* All functional UI elements must be enclosed in boxes with \`2px solid #212121\` or \`3px solid #212121\` borders.
- \*\*Prohibited Elements:\*\* NEVER use \`backdrop-blur\`, \`rounded-full\` (pill shapes), or CSS gradients. Corners must be sharp (\`rounded-none\`) or slightly eased (\`rounded-md\` / \`rounded-lg\`).
- \*\*Conversion Focus Rule:\*\* Signature Terracotta Red (\`#C84B31\`) is \*\*EXCLUSIVELY\*\* reserved for primary conversion triggers (\`Book Now\`, \`Pay Securely\`, \`Explore Stays\`). It must never be used for decorative backgrounds, standard links, or secondary buttons.
### 9. Stateless Media Pipeline & File Handling Rule
\*\*Trigger:\*\* When implementing file uploads, image processing, or admin room management (\`/admin/rooms\`).
\*\*Constraint:\*\* The Express.js backend MUST remain completely stateless to allow horizontal scaling on Render/AWS ECS.
- \*\*No Local Disk Writes:\*\* NEVER use \`multer.diskStorage\` or write files to local directories (e.g., \`public/uploads/\`).
- \*\*Mandatory Pipeline:\*\* All uploads must use \`multer.memoryStorage()\` to buffer files in RAM, followed by \`streamifier\` to pipe the binary buffer directly to the Cloudinary CDN upload stream.
- \*\*Validation Limits:\*\* Enforce a strict 4MB file size limit and whitelist only \`image/jpeg\`, \`image/png\`, and \`image/webp\` MIME types to prevent memory exhaustion attacks.
### 10. Financial Integrity & Asynchronous Webhook Rule
\*\*Trigger:\*\* When handling Stripe/Razorpay integrations, checkout flows, or booking status updates.
\*\*Constraint:\*\* Frontend success callbacks and URL redirects are inherently unreliable and MUST NEVER be used as the single source of truth to mark a booking as "Paid" or "Confirmed".
- \*\*Webhook Supremacy:\*\* All payment state transitions must be triggered exclusively by asynchronous, cryptographically verified backend webhooks (\`/api/payment/webhook/stripe\` or \`/razorpay\`).
- \*\*Raw Payload Parsing:\*\* Webhook endpoints MUST use \`express.raw(\{ type: 'application/json' \})\` to preserve the exact byte payload required for Stripe/Razorpay signature verification. Standard JSON body parsers will invalidate the signatures.
- \*\*Idempotency:\*\* Implement Redis-based caching for processed Event IDs (with a 24-hour TTL) to prevent replay attacks and duplicate database writes.
### 11. High-Concurrency & Double-Booking Prevention Rule
\*\*Trigger:\*\* When writing database queries for room availability checks (\`/api/rooms/:id/check\`) or creating new bookings.
\*\*Constraint:\*\* Naive array pushes or standard \`findOneAndUpdate\` operations will result in race conditions and double-bookings under high load.
- \*\*MongoDB Overlap Logic:\*\* Availability checks must atomically verify that the requested dates do not overlap with existing \`bookedSlots\` using \`\$not\` and \`\$elemMatch\` operators.
- \*\*Concurrency Control Strategy:\*\*
- Use \*\*Optimistic Concurrency Control (OCC)\*\* via Mongoose version keys (\`__v\`) for standard metadata updates.
- Use \*\*Pessimistic Concurrency Control (PCC)\*\* via Redis distributed locks for high-demand room bookings. The lock must be acquired \*before\* reading the inventory document and released only after the transaction is committed.
### 12. State Management Architecture Routing Rule
\*\*Trigger:\*\* When introducing new global state, context providers, or Redux slices.
\*\*Constraint:\*\* Prevent unnecessary re-renders across the application by routing state to the correct management tool based on update frequency.
- \*\*React Context API:\*\* Use \*\*ONLY\*\* for low-frequency, semi-static global states (e.g., UI Theme, Language, basic Auth User Profile).
- \*\*Redux Toolkit:\*\* Use for high-frequency, dynamic, or deeply nested states (e.g., Search Filters, Booking Cart Totals, Availability Widget dates).
- \*\*Action:\*\* If a prompt requests Context API for search results or cart totals, automatically refactor the suggestion to use Redux Toolkit with optimized \`useSelector\` hooks to isolate component re-renders.
### 13. Security & Endpoint Protection Baseline Rule
\*\*Trigger:\*\* When creating new Express routes, controllers, or middleware.
\*\*Constraint:\*\* No public endpoint should be left unprotected against basic abuse, and administrative boundaries must be strictly enforced.
- \*\*Middleware Stack:\*\* All Express apps must initialize \`express-rate-limit\` (100 req / 15 mins), \`helmet\` (for CSP and HSTS headers), and \`cors\` (restricted to explicit whitelisted origins like \`staywise.ai\`).
- \*\*RBAC Enforcement:\*\* Admin routes (\`/admin/\*\`) MUST be protected by JWT verification middleware that explicitly checks for \`role: "Admin"\` in the decoded payload.
- \*\*Credential Security:\*\* Passwords must be hashed using \`bcrypt\` (minimum 12 rounds). JWTs must be transmitted using \`HttpOnly\` and \`Secure\` cookie flags to mitigate XSS and MitM attacks.
### 14. AI Recommender & Algorithmic Guardrail
\*\*Trigger:\*\* When modifying the SmartStay Recommender logic, TF-IDF vectorization, or user preference tracking.
\*\*Constraint:\*\* Ensure recommendations are computationally efficient and do not leak PII or block critical user paths.
- \*\*Asynchronous Profiling:\*\* User preference vectors must be updated asynchronously post-booking or post-search to avoid blocking the checkout thread or latency-sensitive API responses.
- \*\*Caching Strategy:\*\* TF-IDF hotel attribute vectors must be cached in Redis. Recalculation of the entire catalog's cosine similarity matrix on every landing page load is strictly prohibited.
- \*\*Threshold Filtering:\*\* The system must automatically filter out recommendations with a cosine similarity score below the defined minimum threshold to prevent irrelevant "hallucinated" matches.
### 15. Documentation Completeness Check Rule
\*\*Trigger:\*\* At the conclusion of any major feature implementation, architectural refactor, database schema migration, or REST API modification across \`client/\` or \`server/\`.
\*\*Constraint:\*\* Code modifications and architectural decisions MUST NOT remain siloed in source files. The AI agent (\`Antigravity\`) or developer must perform a mandatory documentation audit before concluding the session.
- \*\*Mandatory Verification Matrix:\*\* The agent must verify and update relevant documentation files across the ecosystem:
1. \*\*\`README.md\`\*\*: Update architecture diagrams, feature bullets, or tech stack badges if major dependencies change.
2. \*\*\`docs/PRD.md\` & \`docs/DESIGN.md\`\*\*: Sync user roles, pricing flows, or UI/color token changes (\`Elevated Brutalism\`).
3. \*\*\`docs/API_REFERENCE.md\`\*\*: Document exact route paths, query parameters, JWT auth requirements, and webhook payloads (\`express.raw()\`) for all new or modified endpoints.
4. \*\*\`docs/DATABASE_SCHEMA.md\`\*\*: Record Mongoose schema additions, compound indexes, version keys (\`__v\`), and Redis PCC distributed lock keys/TTLs.
5. \*\*\`docs/SECURITY.md\`\*\*: Log new rate limits, Helmet CSP domain additions, CORS whitelisting, or file upload MIME restrictions.
6. \*\*\`docs/DEPLOYMENT_GUIDE.md\` & \`docs/ENVIRONMENT_VARIABLES.md\`\*\*: Register any newly introduced \`.env\` variables (\`MONGO_URI\`, \`STRIPE_SECRET_KEY\`, etc.) and container build step changes.
7. \*\*\`docs/TESTING_STRATEGY.md\` & \`docs/CONTRIBUTING.md\`\*\*: Update Jest/Supertest coverage targets or developer workflow conventions.
8. \*\*\`docs/changeLogs.md\`\*\*: Record all created, modified, or deleted files during the session along with architectural rationale in the mandatory change log format.
- \*\*Automatic Notion Synchronization:\*\* Upon updating any of the above Markdown documents, the agent MUST immediately trigger the Notion synchronization script via background terminal execution (\`python3 scripts/sync_docs_to_notion.py "\<updated_file_path\>"\`).
### 16. Mandatory Change Log Maintenance Rule
\*\*Trigger:\*\* Whenever any file (code, documentation, configuration, or utility) is created, modified, or deleted during a coding session.
\*\*Constraint:\*\* The AI agent (\`Antigravity\`) or developer MUST always keep \`docs/changeLogs.md\` up to date based on the latest changes before concluding any task or session.
- \*\*Mandatory Format:\*\* Every change entry added to \`docs/changeLogs.md\` MUST strictly adhere to the following exact structure:
```markdown
date: YYYY-MM-DD
what changed : <clear, concise summary of what was implemented, modified, or removed>
what files changed : `file1`, `file2`, `file3` ... `file N`
why changed : <architectural rationale, bug fix explanation, or user requirement justification>
```
- \*\*Chronological Tracking:\*\* Always append or prepend entries cleanly so that the log accurately tracks the chronological evolution of the repository.
- \*\*Automatic Notion Synchronization:\*\* Whenever \`docs/changeLogs.md\` is updated, the agent MUST immediately trigger \`python3 scripts/sync_docs_to_notion.py "docs/changeLogs.md"\` in the background via terminal execution (\`SafeToAutoRun: true\`).