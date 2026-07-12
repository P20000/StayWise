# Breaking Up Monolithic Files — A Practical Playbook

A step-by-step guide for splitting large, multi-responsibility files into smaller, focused ones — without breaking your codebase along the way.

---

## 1. Triage: Find and Rank the Worst Offenders

Don't try to fix everything at once. First get a sorted list of pain points.

```bash
# Find largest files by line count (adjust extension)
find . -name "*.js" -o -name "*.ts" -o -name "*.py" | xargs wc -l | sort -rn | head -30
```

For each candidate, score it on:

| Signal | Why it matters |
|---|---|
| Line count (500+, 1000+, 2000+) | Rough proxy for complexity |
| Number of distinct exports/classes/functions | Signals mixed responsibilities |
| Number of unrelated imports (e.g. both DB and UI logic) | Signals mixed concerns |
| Git churn (`git log --oneline <file> \| wc -l`) | Frequently-changed files cause the most merge conflicts and bugs |
| How many people touch it | High-traffic files benefit most from splitting |

**Prioritize files that are both large AND frequently changed.** A 2000-line file nobody touches is low priority. A 600-line file that changes weekly is high priority.

---

## 2. Diagnose *Why* the File Is Monolithic

Before splitting, identify which pattern(s) apply — this determines your strategy:

- **God Object / God Module** — one file does everything (data access + business logic + validation + formatting).
- **Kitchen-Sink Utils** — a `utils.js` / `helpers.py` that's become a dumping ground for unrelated functions.
- **Feature Creep** — a file started focused, then every new related feature got bolted on instead of getting its own file.
- **Copy-Paste Accretion** — similar code duplicated and appended over time instead of abstracted.
- **Circular Dependency Avoidance** — things were jammed into one file specifically *to avoid* import cycles (this one needs care — see Step 5).

---

## 3. Identify Natural Seams

Look for boundaries that already exist implicitly in the code:

- **By responsibility** (Single Responsibility Principle): data fetching vs. transformation vs. rendering vs. validation.
- **By domain/feature**: everything related to "orders" vs. everything related to "users."
- **By layer**: controllers vs. services vs. repositories/models.
- **By change reason**: group code that changes together for the same reason (this is often the most durable split).
- **By dependency direction**: low-level utilities vs. high-level orchestration.

A quick heuristic: **if you can draw a box around a group of functions/variables that only talk to each other and rarely to the rest of the file, that box is a new file.**

---

## 4. Propose a New Structure

Example — turning a monolithic `userService.js` into a folder:

```
Before:
  userService.js   (1400 lines: validation, DB queries, email sending,
                     permission checks, formatting, caching)

After:
  user/
    index.js              # public API — re-exports what's needed
    userService.js         # orchestration only (thin)
    userValidation.js
    userRepository.js      # DB queries
    userEmail.js
    userPermissions.js
    userFormatting.js
    userCache.js
```

Guidelines for the new files:
- **One clear responsibility per file** — the file name should describe what it does, not what it's part of.
- **Keep a thin "orchestrator"** file if needed, that composes the smaller pieces — don't force every caller to import 6 files.
- **Avoid over-splitting**: if two pieces of logic are never used independently and always change together, they can stay together. Splitting isn't free — more files means more navigation and import overhead.
- Use an `index.js` / `__init__.py` / `mod.rs` (language-dependent) to keep the external import path stable, so consumers don't need to change their imports.

---

## 5. Do the Split Safely (Incremental, Not Big-Bang)

**Never do a single giant "split everything" PR.** It's high-risk and hard to review. Instead:

1. **Add tests first** if the file lacks coverage for the behavior you're about to move. You want a safety net *before* refactoring, not after.
2. **Extract one piece at a time.** Pick the most isolated/self-contained chunk first (usually pure utility functions with no side effects).
3. **Move code, don't rewrite it** in the same step. Copy the function/class into the new file, update imports, delete from the old file, run tests. Resist the urge to "improve" the logic in the same commit — that makes it hard to tell if a bug came from moving or from rewriting.
4. **Re-export from the old location temporarily** if many other files import from it, so you don't have to update every call site at once:
   ```js
   // userService.js (transitional)
   export { validateUser } from './userValidation.js';
   ```
   Remove these re-exports once all call sites are updated.
5. **Watch for circular imports** as you split — if File A now needs something from File B and vice versa, you likely have a boundary in the wrong place, or need a third shared file for the common piece.
6. **Run the full test suite (and linter/type-checker) after every extraction**, not just at the end.
7. **Commit each extraction separately** with a clear message (`refactor: extract user validation from userService`). Small, reviewable diffs.

---

## 6. Guardrails to Prevent Regrowth

Splitting once doesn't stop the problem from coming back. Add some structural enforcement:

- **File size lint rule** — e.g. ESLint `max-lines`, or a CI check that fails/warns above a line threshold (start generous, e.g. 300–400 lines, and tighten over time).
- **Architecture/dependency rules** — tools like `dependency-cruiser` (JS/TS), `import-linter` (Python), or `ArchUnit` (Java) can enforce "UI files must not import DB files directly," etc.
- **Code review checklist item**: "Does this PR add to an already-large file? If so, could it be its own file?"
- **Document the target structure** (folder layout + responsibility of each file) in a `CONTRIBUTING.md` or `ARCHITECTURE.md` so new contributors know where new code should go instead of defaulting to the nearest existing file.

---

## 7. Suggested Rollout Order

1. Pick your **top 3** worst offenders from Step 1.
2. For each: diagnose the pattern (Step 2), map the seams (Step 3), sketch the target structure (Step 4).
3. Split **one file fully** end-to-end first, as a template — this surfaces process issues (test gaps, tooling, review norms) while the blast radius is small.
4. Apply the same process to the rest, ideally spreading the work across the team so it's not one person's multi-week slog.
5. Add the size-limit lint rule (Step 6) once you've cleared the worst offenders, so new monoliths don't form while you're cleaning up old ones.

---

## Quick Checklist (per file)

- [ ] Tests exist and pass before starting
- [ ] Responsibilities identified and named
- [ ] Target file structure sketched and reviewed (even informally)
- [ ] Extracted incrementally, one responsibility per commit
- [ ] Old file re-exports temporarily if needed for compatibility
- [ ] Tests + linter pass after each extraction
- [ ] Call sites updated, temporary re-exports removed
- [ ] Final file sizes reasonable and each file's name matches its contents