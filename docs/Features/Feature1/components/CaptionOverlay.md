# \`CaptionOverlay.md\` — Synced Architectural Caption Box
> \*\*Parent Feature:\*\* \`docs/Features/Feature1.md\`
> \*\*Target Code Path:\*\* \`client/src/components/landing/CaptionOverlay.jsx\`
> \*\*Layer:\*\* Client UI Overlay Component (Landing Page Hero)
---
## 1. Architectural Role & Purpose
The \`\<CaptionOverlay /\>\` component is responsible for rendering progressive text reveals synced to the user's scroll depth across the \`300vh\` pinned hero sequence.
Instead of static subtitle tracks or embedded video text, rendering captions as real HTML DOM elements ensures:
1. \*\*Screen Reader Accessibility:\*\* Captions are live, semantic text elements reachable by assistive technology.
2. \*\*Dynamic Localization:\*\* Text can be easily translated via internationalization (\`i18n\`) dictionaries without re-rendering video frames.
3. \*\*Elevated Brutalism Materiality:\*\* Allows captions to exist in tactile, high-contrast boxes with hard unblurred shadows (\`shadow-\[4px_4px_0px_#212121\]\`).
---
## 2. Design System Tokens & Styling Contract
Per \`DESIGN.md\` Section 1 and Section 4:
- \*\*Box Surface & Borders:\*\* \`bg-white border-2 border-\[#212121\] shadow-\[4px_4px_0px_#212121\] px-4 py-2\`
- \*\*Typography:\*\* \`font-mono text-xs uppercase tracking-wider text-\[#212121\] font-bold\` (\`JetBrains Mono\`)
- \*\*Positioning:\*\* Fixed in the lower-left compartment (\`absolute bottom-32 left-8 z-20\`) to anchor the visual weight against the background footage.
---
## 3. Scroll Progress Threshold Map
The active caption updates reactively as \`useGSAPScrollProgress()\` crosses exact decimal thresholds:
\| Scroll Progress Range \| Active Caption Text \| Narrative Theme \|
\|---\|---\|---\|
\| \`0.00 → 0.14\` \| \`\[ ARRIVAL \]\` \| Exterior facade at golden hour \|
\| \`0.15 → 0.39\` \| \`\[ MATERIAL HONESTY \]\` \| Gliding through lobby concrete & brass \|
\| \`0.40 → 0.64\` \| \`\[ SPACES FOR PRESENCE \]\` \| Signature suite linen & Terracotta wall \|
\| \`0.65 → 1.00\` \| \`\[ CURATED BY INTELLIGENCE \]\` \| Balcony reveal & AI Match tie-in \|
---
## 4. Implementation Blueprint
---
## 5. Verification & Testing Checklist
- \[ \] Confirm caption box transitions sharply without layout shifts (\`CLS = 0\`) at exact \`0.15\`, \`0.40\`, and \`0.65\` progress thresholds.
- \[ \] Verify fontfamily explicitly resolves to \`JetBrains Mono\` (or \`Fira Code, monospace\` fallback).
- \[ \] Test static mode (\`isStatic=\{true\}\`) to ensure \`\[ CURATED BY INTELLIGENCE \]\` renders on initial load for mobile and \`prefers-reduced-motion\` users.
---
\*Document synced to Notion via \`scripts/sync_docs_to_notion.py\` on save.\*