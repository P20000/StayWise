# \`feature1.md\` — Scroll-Driven Cinematic Video Hero (Landing Page)
# Feature 1: Scroll-Driven Cinematic Video Hero
## StayWise.ai Landing Page — "Architectural Stays in Motion"
> \*\*Status:\*\* Architecture Specification & Registry
> \*\*Parent Page:\*\* \`PRD.md\` → Landing Page (\`/\`)
> \*\*Design System:\*\* \`DESIGN.md\` → Elevated Brutalism ("Architectural Premium")
---
### very very important aspect:
> don't ever make Huge monolothic file and keep things in it for confusion
> every component must be separate into separate file.
---
## 1. Strategic Purpose
The landing page hero section must transcend the conventional static banner. Instead of a single looping background video (a pattern exhausted by every OTA competitor), StayWise.ai will deploy a \*\*scroll-scrubbed cinematic sequence\*\* — a technique popularized by Apple, Aesop, and luxury architectural firms — where the user's vertical scroll physically drives the playback of a high-fidelity hotel tour.
This achieves three business objectives simultaneously:
\| Objective \| Mechanism \|
\|---\|---\|
\| \*\*Dwell Time Extension\*\* \| Scroll-scrubbing forces intentional, slow consumption — users cannot passively skim. \|
\| \*\*Brand Positioning\*\* \| The "Architectural Premium" aesthetic is reinforced through cinematic materiality — concrete, brass, light, and shadow moving in physical response to the user. \|
\| \*\*Conversion Priming\*\* \| The sequence terminates precisely at the \`SearchBar\` compartment, psychologically positioning the search action as the natural next step. \|
---
## 2. User Journey Narrative
The hero occupies the full viewport (\`100vh\`) and is pinned for \*\*300vh of scroll distance\*\*. As the user scrolls:
\| Scroll Progress \| Visual State \| Narrative Beat \|
\|---\|---\|---\|
\| \`0% → 15%\` \| Exterior architectural facade at golden hour. Slow zoom-in. \| "Every stay begins with arrival." \|
\| \`15% → 40%\` \| Camera glides through the lobby — concrete walls, brass fixtures, warm lighting. \| "Material honesty. Structural integrity." \|
\| \`40% → 65%\` \| Transition into a signature suite. Linen textures, compartmentalized furniture, Terracotta accent wall. \| "Spaces designed for presence." \|
\| \`65% → 85%\` \| Balcony reveal — city skyline at dusk. SmartStay AI match badge fades in: \`\[✨ 94% AI MATCH\]\`. \| "Curated by intelligence." \|
\| \`85% → 100%\` \| Camera settles on the suite's desk. The \`SearchBar\` compartment materializes over the video with a hard \`#212121\` border. \| "Begin your reservation." \|
---
## 3. Visual Design System Integration
### 3.1 Mandatory Tokens (from \`DESIGN.md\`)
\| Element \| Token \|
\|---\|---\|
\| Background Body \| \`bg-\[#F1EDEA\]\` (Raw Cream) — visible before/after the pinned section \|
\| Caption Box \| \`bg-white border-2 border-\[#212121\] shadow-\[4px_4px_0px_#212121\] px-4 py-2\` \|
\| Caption Typography \| \`font-mono text-xs uppercase tracking-wider text-\[#212121\]\` (JetBrains Mono) \|
\| AI Match Badge \| \`bg-\[#F1EDEA\] text-\[#212121\] border-2 border-\[#212121\] shadow-\[2px_2px_0px_#212121\]\` \|
\| Final CTA \| \`bg-\[#C84B31\] text-white font-mono font-bold uppercase\` (Signature Terracotta — \*\*EXCLUSIVELY\*\* for conversion) \|
### 3.2 Strict Prohibitions
- ❌ \*\*NO\*\* \`backdrop-blur-md\` over the video. The video must render at full opacity; overlays use solid \`bg-\[#F1EDEA\]\` or \`bg-\[#212121\]\` with opacity.
- ❌ \*\*NO\*\* soft gradient fades at section boundaries. Transitions use hard \`border-b-2 border-\[#212121\]\` structural dividers.
- ❌ \*\*NO\*\* \`rounded-full\` or pill-shaped progress indicators. The scroll progress bar must be a sharp \`h-1 bg-\[#C84B31\]\` fixed to the top viewport edge.
- ❌ \*\*NO\*\* autoplay with sound. The sequence is \*\*silent by design\*\* — architectural cinema does not require audio.
---
## 4. Technical Architecture
### 4.1 Implementation Strategy Selection
\| Approach \| Pros \| Cons \| Verdict \|
\|---\|---\|---\|---\|
\| \*\*A. HTML5 \`\<video\>\` + scroll-scrub\*\* \| Native, small payload, GPU-accelerated \| Seeking latency on some browsers, mobile Safari quirks \| ⚠️ Viable with polyfills \|
\| \*\*B. Pre-rendered frame sequence (WebP)\*\* \| Frame-perfect scrubbing, no codec issues \| Large payload (300+ frames × 200KB = 60MB) \| ❌ Rejected — violates performance budget \|
\| \*\*C. GSAP ScrollTrigger + \`\<video\>\`\*\* \| Industry standard, robust timeline control \| Adds \~30KB dependency \| ✅ \*\*Selected\*\* \|
\| \*\*D. Three.js / WebGL shader\*\* \| Maximum creative control \| Massive complexity, overkill for 2D footage \| ❌ Rejected \|
\*\*Decision:\*\* Approach \*\*C\*\* — GSAP ScrollTrigger driving an HTML5 \`\<video\>\` element's \`currentTime\` property.
---
## 5. Component & Hook Registry
To strictly adhere to our anti-monolithic rule (\`every component must be separate into separate file\`), the technical blueprint and exact code contract for every single UI component and animation hook are isolated in dedicated specification files inside \`docs/Features/Feature1/\`:
\| Component / Hook \| Layer \| Target Code File \| Standalone Specification File \|
\|---\|---\|---\|---\|
\| \`useScrollVideoScrub\` \| Animation Engine \| \`client/src/hooks/useScrollVideoScrub.js\` \| \[\`docs/Features/Feature1/hooks/useScrollVideoScrub.md\`\](file:///run/media/pranavissam/files%20and%20data/programming/mega%20projects/StayWise/docs/Features/Feature1/hooks/useScrollVideoScrub.md) \|
\| \`useGSAPScrollProgress\` \| State Reactive Hook \| \`client/src/hooks/useGSAPScrollProgress.js\` \| \[\`docs/Features/Feature1/hooks/useGSAPScrollProgress.md\`\](file:///run/media/pranavissam/files%20and%20data/programming/mega%20projects/StayWise/docs/Features/Feature1/hooks/useGSAPScrollProgress.md) \|
\| \`\<CinematicHero /\>\` \| UI Container \| \`client/src/components/landing/CinematicHero.jsx\` \| \[\`docs/Features/Feature1/components/CinematicHero.md\`\](file:///run/media/pranavissam/files%20and%20data/programming/mega%20projects/StayWise/docs/Features/Feature1/components/CinematicHero.md) \|
\| \`\<CaptionOverlay /\>\` \| UI Overlay \| \`client/src/components/landing/CaptionOverlay.jsx\` \| \[\`docs/Features/Feature1/components/CaptionOverlay.md\`\](file:///run/media/pranavissam/files%20and%20data/programming/mega%20projects/StayWise/docs/Features/Feature1/components/CaptionOverlay.md) \|
\| \`\<AIMatchBadge /\>\` \| UI Badge \| \`client/src/components/landing/AIMatchBadge.jsx\` \| \[\`docs/Features/Feature1/components/AIMatchBadge.md\`\](file:///run/media/pranavissam/files%20and%20data/programming/mega%20projects/StayWise/docs/Features/Feature1/components/AIMatchBadge.md) \|
\| \`\<ScrollProgressIndicator /\>\` \| UI Progress Bar \| \`client/src/components/landing/ScrollProgressIndicator.jsx\` \| \[\`docs/Features/Feature1/components/ScrollProgressIndicator.md\`\](file:///run/media/pranavissam/files%20and%20data/programming/mega%20projects/StayWise/docs/Features/Feature1/components/ScrollProgressIndicator.md) \|
---
## 6. Performance Engineering
### 6.1 Video Encoding Specification
\| Parameter \| Requirement \| Rationale \|
\|---\|---\|---\|
\| Container \| \`.mp4\` (H.264) + \`.webm\` (VP9) fallback \| Safari H.264 mandatory; WebM for Chrome/Firefox efficiency \|
\| Resolution \| \`1920×1080\` (desktop), \`1080×1920\` (mobile via \`\<source media\>\`) \| 4K is wasteful — user is scrolling, not inspecting pixels \|
\| Bitrate \| \`2.5 Mbps\` (desktop), \`1.2 Mbps\` (mobile) \| Sweet spot for visual fidelity vs. payload \|
\| Duration \| \`12–15 seconds\` \| Matches the 300vh scroll distance at natural reading pace \|
\| Keyframe Interval \| Every \`1 second\` (not default 2–5s) \| \*\*Critical\*\* — enables frame-accurate scrubbing without decode lag \|
\| File Size Budget \| \`\< 6 MB\` desktop, \`\< 3 MB\` mobile \| Hard ceiling — violates performance budget otherwise \|
### 6.2 Mobile Degradation Policy
\| Device Tier \| Behavior \|
\|---\|---\|
\| Desktop (≥ 1024px) \| Full scroll-scrub experience \|
\| Tablet (768–1023px) \| Scroll-scrub with reduced resolution source \|
\| Mobile (\< 768px) \| \*\*Fallback to static hero image\*\* with progressive caption reveals (\`isStatic=\{true\}\`) \|
---
## 7. Accessibility & Fallbacks
- \*\*\`prefers-reduced-motion\` Compliance:\*\* When active, \`useScrollVideoScrub\` and \`useGSAPScrollProgress\` bypass all scroll bindings and render the static poster frame (\`assets/cinematic/final-frame-poster.webp\`) (\`WCAG 2.2 SC 2.3.3\`).
- \*\*Keyboard Navigation:\*\* Pinned section does not trap focus; users tab smoothly directly into the materialized \`SearchBar\`.
---
## 8. Integration Map with Landing Page
---
## 9. Acceptance Criteria
- \[ \] Every functional UI component and hook resides in its own standalone markdown specification file inside \`docs/Features/Feature1/\`.
- \[ \] Video scrubs smoothly at 60fps on M1 Mac, XPS 13, and Pixel 7 without keyframe seeking lag.
- \[ \] Total hero payload (video + poster) \< 6 MB.
- \[ \] \`prefers-reduced-motion\` and mobile (\< 768px) cleanly display the static poster frame and immediate UI target states.
- \[ \] No \`backdrop-blur\`, \`rounded-full\`, or soft drop shadows exist anywhere across any component specification.
---
## 10. Open Questions for Design Review
1. \*\*Video Source:\*\* Do we commission original architectural footage, or license from a cinematic stock library (Artgrid, Filmpac)? Budget implication: \$0 vs. \$800–\$2,500.
2. \*\*AI Match Badge Copy:\*\* Should the badge display a real computed match score (requires user auth + history) or a static teaser (\`\[✨ 94% MATCH — SIGN IN TO PERSONALIZE\]\`)?
3. \*\*SearchBar Materialization:\*\* Should the SearchBar fade in, slide up, or "stamp" into place with a hard shadow animation?
---
## 11. Dependencies
\| Dependency \| Version \| Purpose \|
\|---\|---\|---\|
\| \`gsap\` \| \`\^3.12.5\` \| ScrollTrigger plugin for scroll-scrub timeline \|
\| \`react\` \| \`\^18.3.0\` \| Component framework \|
\| \`tailwindcss\` \| \`\^3.4.0\` \| Utility classes matching \`DESIGN.md\` tokens \|
---
\*Document synced to Notion via \`scripts/sync_docs_to_notion.py\` on save.\*