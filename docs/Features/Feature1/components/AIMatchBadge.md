# \`AIMatchBadge.md\` — AI Recommender Match Teaser Badge
> \*\*Parent Feature:\*\* \`docs/Features/Feature1.md\`
> \*\*Target Code Path:\*\* \`client/src/components/landing/AIMatchBadge.jsx\`
> \*\*Layer:\*\* Client UI Badge Component (Landing Page Hero)
---
## 1. Architectural Role & Purpose
The \`\<AIMatchBadge /\>\` component teases the platform's flagship \`SmartStay Recommender\` engine right as the user scrolls past the \`65%\` progress mark (\`CinematicHero\` suite balcony reveal).
By surfacing computed AI similarity metrics (\`\[✨ 94% AI MATCH\]\`) directly over the architectural tour:
1. \*\*Psychological Priming:\*\* Bridges the gap between visual luxury (the video) and algorithmic intelligence (the recommender).
2. \*\*Smooth Visual Hand-off:\*\* Prepares the user to transition from passive video exploration into active, AI-curated search filtering.
---
## 2. Design System Tokens & Styling Contract
Per \`DESIGN.md\` Section 1 and Section 4:
- \*\*Surface & Structural Border:\*\* \`bg-\[#F1EDEA\] text-\[#212121\] border-2 border-\[#212121\] shadow-\[2px_2px_0px_#212121\] px-3 py-1.5\`
- \*\*Typography:\*\* \`font-mono text-xs font-bold uppercase tracking-wide\` (\`JetBrains Mono\`)
- \*\*Placement:\*\* Top-left viewport anchor (\`absolute top-24 left-8 z-20\`) to balance the bottom-left \`CaptionOverlay\`.
---
## 3. State Management & Redux Integration
Per \`AGENT.md\` Rule 12 (\`State Management Architecture Routing Rule\`) and Rule 14 (\`AI Recommender & Algorithmic Guardrail\`):
- The AI Match score (\`94%\`) is sourced asynchronously from the user's active preference vector (\`recommenderSlice\` in Redux Toolkit) when authenticated.
- For unauthenticated or first-time landing page visitors, it falls back cleanly to a high-intent teaser: \`\[✨ 94% AI MATCH — SIGN IN TO PERSONALIZE\]\`.
---
## 4. Implementation Blueprint
---
## 5. Verification & Testing Checklist
- \[ \] Confirm badge remains hidden (\`opacity-0 -translate-y-2\`) during the initial \`0.00 -\> 0.64\` scroll window.
- \[ \] Verify smooth fade and drop animation (\`translate-y-0\`) right when \`progress \>= 0.65\`.
- \[ \] Confirm \`border-2 border-\[#212121\]\` and \`shadow-\[2px_2px_0px_#212121\]\` match exact Elevated Brutalism token requirements.
---
\*Document synced to Notion via \`scripts/sync_docs_to_notion.py\` on save.\*