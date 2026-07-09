# \`ScrollProgressIndicator.md\` — Top Viewport Scroll Bar Indicator
> \*\*Parent Feature:\*\* \`docs/Features/Feature1.md\`
> \*\*Target Code Path:\*\* \`client/src/components/landing/ScrollProgressIndicator.jsx\`
> \*\*Layer:\*\* Client UI Progress Indicator Component (Landing Page Hero)
---
## 1. Architectural Role & Purpose
The \`\<ScrollProgressIndicator /\>\` component provides immediate visual feedback to users as they scroll through the \`300vh\` pinned \`CinematicHero\` sequence.
Because scroll-scrubbing pauses vertical page displacement while advancing video frames, users need clear spatial orientation to know where they are within the narrative sequence and how much scroll distance remains until the \`SearchBar\` materializes at \`85%\`.
---
## 2. Design System Tokens & Elevated Brutalism Constraints
Per \`DESIGN.md\` Section 1 and \`Feature1.md\` Section 3.2:
- \*\*Strict Prohibition:\*\* ❌ \*\*NO\*\* \`rounded-full\` or pill-shaped progress indicators or floating glowing tracking bars.
- \*\*Structural Shape:\*\* Must be a sharp, unrounded structural line (\`h-1 rounded-none fixed top-0 left-0 z-50\`).
- \*\*Color Accent:\*\* Uses \*\*Signature Terracotta (\`#C84B31\`)\*\* fill (\`bg-\[#C84B31\]\`) contrasting against an optional subtle \`bg-\[#212121\]/10\` background track.
---
## 3. Implementation Blueprint
---
## 4. Verification & Testing Checklist
- \[ \] Confirm \`style=\{\{ transform: scaleX(progress) \}\}\` scales linearly from \`0.0\` to \`1.0\` during scroll without triggering DOM layout recalculations (\`scaleX\` vs \`width\`).
- \[ \] Verify \`z-50\` keeps the bar above all hero gradients and overlays.
- \[ \] Confirm zero border radius (\`rounded-none\`) per Elevated Brutalism rules.
---
\*Document synced to Notion via \`scripts/sync_docs_to_notion.py\` on save.\*