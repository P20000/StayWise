# \`useScrollVideoScrub.md\` — GSAP ScrollTrigger Video Scrubbing Hook
> \*\*Parent Feature:\*\* \`docs/Features/Feature1.md\`
> \*\*Target Code Path:\*\* \`client/src/hooks/useScrollVideoScrub.js\`
> \*\*Layer:\*\* Client Custom Hook (Performance / Animation Engine)
---
## 1. Architectural Role & Purpose
The \`useScrollVideoScrub\` hook encapsulates the high-concurrency scroll synchronization engine that physically maps the user's vertical scroll position to an HTML5 \`\<video\>\` element's \`currentTime\` property.
By keeping this logic isolated in a dedicated hook rather than inline inside \`\<CinematicHero /\>\`, we achieve:
1. \*\*Separation of Concerns:\*\* The UI container remains purely declaratory, while the GSAP timeline and memory lifecycle (\`gsap.context\`) reside cleanly in custom hook logic.
2. \*\*Reusability & Testing:\*\* Can be independently unit tested or reused across other cinematic walkthrough sections (e.g., Virtual Suite Tours).
3. \*\*Strict Memory & Event Management:\*\* Guarantees proper cleanup (\`ctx.revert()\`) when React components unmount or re-render during HMR.
---
## 2. API Signature & Parameter Contract
```typescript
function useScrollVideoScrub(
  videoRef: React.RefObject<HTMLVideoElement>,
  containerRef: React.RefObject<HTMLElement>
): void
```
\| Parameter \| Type \| Required \| Description \|
\|---\|---\|---\|---\|
\| \`videoRef\` \| \`React.RefObject\<HTMLVideoElement\>\` \| Yes \| Reference to the \`\<video\>\` element whose \`currentTime\` property will be scrubbed. \|
\| \`containerRef\` \| \`React.RefObject\<HTMLElement\>\` \| Yes \| Reference to the wrapper \`\<section\>\` element that acts as the pinned scroll trigger (\`end: '+=200%'\`). \|
---
## 3. Performance & Accessibility Guardrails
1. \*\*\`prefers-reduced-motion\` Interception:\*\*
Before initializing \`gsap.context()\`, the hook MUST query \`window.matchMedia('(prefers-reduced-motion: reduce)')\`. If matched, the hook immediately returns without attaching any scroll listeners or timeline animations (\`WCAG 2.2 SC 2.3.3\` compliance).
1. \*\*Metadata Readiness Check:\*\*
Scrubbing a video before its duration and keyframes are known (\`video.readyState \< 1\`) causes fatal \`NaN\` duration errors and timeline crashes. The hook checks \`video.readyState \>= 1\`. If not loaded, it attaches a \`loadedmetadata\` event listener (\`\{ once: true \}\`) to defer timeline binding until the browser is ready.
1. \*\*Smoothing & Anticipation:\*\*
Uses \`scrub: 0.5\` (0.5 seconds of inertial damping) and \`anticipatePin: 1\` to prevent visual jitter on high-frequency trackpad scrolling and eliminate pin delay stutter.
---
## 4. Implementation Blueprint
```javascript
// client/src/hooks/useScrollVideoScrub.js
import { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const useScrollVideoScrub = (videoRef, containerRef) => {
  useEffect(() => {
    // 1. Accessibility Check: Exit early if reduced motion is preferred
    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }

    const video = videoRef.current;
    const container = containerRef.current;
    if (!video || !container) return;

    // 2. Setup Function: Binds GSAP context and timeline
    const setup = () => {
      const ctx = gsap.context(() => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: container,
            start: 'top top',
            end: '+=200%',          // 300vh total pin distance (100vh + 200vh scroll)
            pin: true,
            scrub: 0.5,             // 0.5s smoothing for cinematic feel
            anticipatePin: 1,
          },
        });

        tl.to(video, {
          currentTime: video.duration,
          ease: 'none',
        });
      }, container);

      // Return cleanup handler to revert all GSAP DOM mutations and scroll listeners
      return () => ctx.revert();
    };

    // 3. Execution based on Video Metadata Readiness
    if (video.readyState >= 1) {
      return setup();
    }

    const handleMetadata = () => {
      setup();
    };

    video.addEventListener('loadedmetadata', handleMetadata, { once: true });
    return () => {
      video.removeEventListener('loadedmetadata', handleMetadata);
    };
  }, [videoRef, containerRef]);
};
```
---
## 5. Verification & Testing Checklist
- \[ \] Verify \`video.currentTime\` increments linearly from \`0.0\` to \`video.duration\` across the \`300vh\` scroll distance.
- \[ \] Confirm no memory leak or lingering ScrollTrigger markers after navigating away from the landing page (\`ctx.revert()\` verified).
- \[ \] Test behavior when \`video.src\` fails to load (must not throw unhandled JS exception).
- \[ \] Verify \`prefers-reduced-motion\` OS toggle completely bypasses scroll scrubbing.
---
\*Document synced to Notion via \`scripts/sync_docs_to_notion.py\` on save.\*