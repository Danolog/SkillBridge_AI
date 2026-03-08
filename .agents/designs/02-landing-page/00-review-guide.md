# Review Guide — Landing Page Wireframe

## Brand Personality Summary

**Style**: 🌅 Cosmic Campus / Hybrid

SkillBridge AI targets Polish university students who use both consumer apps (Duolingo, Instagram) and professional tools (LinkedIn, Notion). The landing page needs to **convert first-time visitors** to `/onboarding` while building trust and excitement.

Visual identity choices:
- **Dark hero + footer** = premium, AI-forward, serious — frames the bright content
- **Indigo + Cyan gradient** = intelligence + data (brand pillars)
- **Emerald CTA** = growth, success, career progression — stands out from brand palette
- **Nunito font** = friendly, approachable, student-facing (not cold enterprise)
- **JetBrains Mono stats** = "this is real data, not marketing" — builds trust
- **Animated blobs** = modern, alive, not static — signals AI/tech

## Screen Map

| Screen | File | Status |
|--------|------|--------|
| Landing Page | `wireframes/landing-page.html` | ✅ Ready for review |

Open in browser: `open .agents/designs/02-landing-page/wireframes/landing-page.html`

## Design Decisions

| Decision | Rationale |
|----------|-----------|
| Dark hero (not light) | Matches competitive edtech feel (Coursera, Udemy use light — this differentiates) |
| Emerald CTA instead of Indigo | Color theory: emerald = "go/proceed", avoids nav color clash |
| Stats bar below hero CTA | Builds trust AFTER the emotional hook, not before |
| 3 cards + 3 steps layout | Mirrors product reality — not artificial padding |
| No testimonials section | Product doesn't exist yet; fake testimonials reduce trust |
| "Powered by Claude AI" badge | Target audience appreciates AI credentialing |
| Polish text throughout | Per project requirement; tech terms (Market Intelligence) stay in English |

## Known Trade-offs

- Stats (14 uczelni, 500+ ofert, 95% trafności) are placeholder values — need real data or remove for launch
- No mobile hamburger menu (nav collapses for small screens, simplified)
- No testimonials / social proof — can add after launch with real user quotes
- Hero illustration omitted — blobs + dot grid provide visual interest without needing custom art

## Questions for Reviewer

1. **CTA copy**: "Stwórz swój Paszport" vs "Zacznij za darmo" — which drives more conversions?
2. **Stats bar**: Should we show these metrics? Are they accurate / achievable for launch?
3. **Hero badge** ("Powered by Claude AI"): Helpful or distracting?
4. **"Panel Uczelni" link** in header: Do we want this visible to students or only accessible via direct URL?
5. **Animations**: Speed and style — too fast? too slow?

## Next Steps (Implementation)

### Files to update after wireframe approval:
1. `src/app/page.tsx` — full rewrite with this design
2. `src/app/layout.tsx` — update metadata title + description
3. `src/components/auth/login-form.tsx` — update redirect to `/dashboard`

### Implementation order:
1. Approve wireframe → implement `page.tsx`
2. Update `layout.tsx` metadata
3. Update login redirect
4. Run `pnpm build && pnpm lint`
5. Manual: open `localhost:3000`, verify, click CTAs
6. Run `/testing-loop`
