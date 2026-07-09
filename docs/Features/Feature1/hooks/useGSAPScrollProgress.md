# \`useGSAPScrollProgress.md\` — Reactive GSAP Scroll Progress Hook
> \*\*Parent Feature:\*\* \`docs/Features/Feature1.md\`
> \*\*Target Code Path:\*\* \`client/src/hooks/useGSAPScrollProgress.js\`
> \*\*Layer:\*\* Client Custom Hook (Reactive State / UI Sync Engine)
---
## 1. Architectural Role & Purpose
The \`useGSAPScrollProgress\` custom hook exposes a reactive normalized progress value (\`0.0\` to \`1.0\`) representing how far the user has scrolled through the \`CinematicHero\` pinned sequence (\`300vh\`).
### State Management Routing Rule Compliance
Per \`AGENT.md\` Rule 12 (\`State Management Architecture Routing Rule\`):
- High-frequency animation values (\`60fps\` scroll progress ticks) MUST NEVER be dispatched directly to Redux (\`useDispatch\`), as doing so forces global store subscription evaluations across every connected component in the application, destroying performance (\`LCP\` and \`INP\` budget violations).
- Instead, \`useGSAPScrollProgress\` routes high-frequency progress state directly to local React state via \`useState\` and isolated component subscriptions (\`useGSAPScrollProgress\`), ensuring only localized overlay components (\`CaptionOverlay\`, \`AIMatchBadge\`) re-render during scroll events.
---
## 2. API Signature & Parameter Contract
```typescript
function useGSAPScrollProgress(
  triggerSelector?: string | HTMLElement
): number
```
\| Parameter \| Type \| Default \| Description \|
\|---\|---\|---\|---\|
\| \`triggerSelector\` \| \`string \\\| HTMLElement\` \| \`'.cinematic-hero-pin'\` \| Optional selector identifying the pinned ScrollTrigger container. \|
\*\*Returns:\*\* \`number\` — Normalized decimal between \`0.00\` and \`1.00\` representing exact scroll completion through the pinned timeline.
---
## 3. Implementation Blueprint
```javascript
// client/src/hooks/useGSAPScrollProgress.js
import { useState, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const useGSAPScrollProgress = (triggerSelector = '[data-scroll-pin="cinematic-hero"]') => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // 1. Accessibility Check: Exit early if reduced motion is preferred
    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      setProgress(1.0); // Show final state instantly for reduced-motion users
      return;
    }

    // 2. Locate active ScrollTrigger instance or attach standalone listener
    const triggerElem = typeof triggerSelector === 'string'
      ? document.querySelector(triggerSelector)
      : triggerSelector;

    if (!triggerElem) return;

    // Create an auxiliary ScrollTrigger hooked to the exact same pinned container
    const st = ScrollTrigger.create({
      trigger: triggerElem,
      start: 'top top',
      end: '+=200%',
      onUpdate: (self) => {
        // Round to 3 decimal places to avoid excessive micro-renders
        const roundedProgress = Math.round(self.progress * 1000) / 1000;
        setProgress(roundedProgress);
      },
    });

    return () => {
      st.kill();
    };
  }, [triggerSelector]);

  return progress;
};
```
---
## 4. Verification & Testing Checklist
- \[ \] Confirm progress emits \`0.0\` at the exact top of the viewport (\`start: 'top top'\`).
- \[ \] Verify progress reaches \`1.0\` right when the pin releases (\`end: '+=200%'\`).
- \[ \] Confirm \`onUpdate\` throttling/rounding limits state re-renders to maximum \`60fps\` without locking the main thread.
- \[ \] Verify \`prefers-reduced-motion\` immediately emits \`1.0\` so downstream UI (captions/searchbar) renders in its finalized target state.
---
\*Document synced to Notion via \`scripts/sync_docs_to_notion.py\` on save.\*