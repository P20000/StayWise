# \`CinematicHero.md\` — Scroll-Driven Cinematic Hero Container
> \*\*Parent Feature:\*\* \`docs/Features/Feature1.md\`
> \*\*Target Code Path:\*\* \`client/src/components/landing/CinematicHero.jsx\`
> \*\*Layer:\*\* Client UI Container (Landing Page Hero)
---
## 1. Architectural Role & Purpose
The \`\<CinematicHero /\>\` component acts as the primary container for the landing page's signature scroll-scrubbed hotel tour sequence. It is responsible for orchestrating the \`300vh\` scroll pin, rendering the background \`\<video\>\` element (or static poster fallback), applying the structural architectural vignette, and positioning child overlays (\`CaptionOverlay\`, \`AIMatchBadge\`, \`SearchBar\`).
### Why Standalone Container Isolation?
By isolating this container into its own modular component:
1. \*\*Zero Monolithic Clutter:\*\* Keeps the root \`\<LandingPage /\>\` view concise (\`\<CinematicHero /\>\`, \`\<SmartStayRecommender /\>\`, \`\<FeaturedHotels /\>\`).
2. \*\*Device Tier Routing:\*\* Manages responsive breakpoints (\`\< 768px\`) and OS motion preferences cleanly without polluting global page logic.
---
## 2. Design System Integration & Elevated Brutalism Constraints
Per \`DESIGN.md\` and \`AGENT.md\` Rule 8:
- \*\*Surface Foundation:\*\* Uses \`bg-\[#F1EDEA\]\` (Raw Cream / Bone) for any exposed container space.
- \*\*Vignette Strategy:\*\* Strictly \*\*PROHIBITS\*\* \`backdrop-blur\` or soft frosted glass overlays. The video contrast is managed via a hard structural linear gradient: \`bg-gradient-to-b from-\[#212121\]/40 via-transparent to-\[#212121\]/60\`.
- \*\*Search Bar Compartment Placement:\*\* Pinned at \`bottom-12 left-1/2 -translate-x-1/2\` with \`max-w-5xl\` full-width framing, revealing cleanly when scroll progress reaches \`85%\`.
---
## 3. Child Component Orchestration Tree
---
## 4. Implementation Blueprint
---
## 5. Verification & Testing Checklist
- \[ \] Confirm section pins precisely at \`top: 0px\` across the full \`300vh\` scroll duration without layout shifts (\`CLS = 0\`).
- \[ \] Verify \`border-b-3 border-\[#212121\]\` cleanly separates the hero from downstream sections (\`\<SmartStayRecommender /\>\`).
- \[ \] Test viewport resize from desktop (\`1280px\`) to mobile (\`375px\`) to ensure seamless transition to static \`final-frame-poster.webp\` fallback.
- \[ \] Confirm no soft drop shadows or frosted glass classes exist inside the DOM hierarchy.
---
\*Document synced to Notion via \`scripts/sync_docs_to_notion.py\` on save.\*