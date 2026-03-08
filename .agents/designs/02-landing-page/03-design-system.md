# Design System — SkillBridge AI Landing Page

## Color Tokens

```css
--color-primary: #6366F1;          /* Indigo — AI intelligence */
--color-primary-rgb: 99, 102, 241;
--color-secondary: #22D3EE;        /* Cyan — market data */
--color-secondary-rgb: 34, 211, 238;
--color-accent: #10B981;           /* Emerald — CTA/growth */
--color-accent-rgb: 16, 185, 129;

/* Dark surfaces */
--color-dark: #0B0E14;             /* Obsidian hero/footer */
--color-dark-2: #161B22;           /* Card on dark */
--color-dark-border: #30363D;      /* Steel border on dark */

/* Light surfaces */
--color-bg: #FAFAFA;
--color-bg-2: #F1F5F9;             /* How-it-works section */
--color-surface: #FFFFFF;          /* Cards */

/* Text */
--color-text: #0F172A;             /* Primary text on light */
--color-text-secondary: #475569;   /* Secondary text */
--color-text-light: #94A3B8;       /* Subdued on dark */

/* Gradients */
--gradient-primary: linear-gradient(135deg, #6366F1 0%, #22D3EE 100%);
--gradient-accent: linear-gradient(135deg, #10B981 0%, #06B6D4 100%);
--gradient-hero: linear-gradient(135deg, #0B0E14 0%, #1a1040 40%, #0e1628 100%);
```

## Typography Tokens

```css
--font-display: 'Nunito', sans-serif;    /* Headings, CTAs */
--font-body: 'Inter', sans-serif;         /* Body text, nav */
--font-mono: 'JetBrains Mono', monospace; /* Stats, data */

/* Scale */
--text-hero: clamp(36px, 6vw, 72px);     /* H1 */
--text-section: clamp(28px, 4vw, 48px);  /* H2 */
--text-card: 20px;                        /* Card titles */
--text-body: 15-18px;                     /* Body text */
--text-label: 12-13px;                    /* Labels, badges */
--text-mono: 28px;                        /* Stat numbers */
```

## Spacing & Shape

```css
--radius-sm: 8px;
--radius-md: 12px;
--radius-lg: 16px;
--radius-xl: 24px;
--radius-pill: 9999px;  /* Buttons, badges */
```

## Shadow Tokens

```css
--shadow-sm: 0 1px 3px rgba(0,0,0,0.08);
--shadow-md: 0 4px 16px rgba(99,102,241,0.12);    /* Colored shadow */
--shadow-lg: 0 8px 32px rgba(99,102,241,0.20);
--shadow-glow-emerald: 0 0 32px rgba(16,185,129,0.4);  /* CTA button */
--shadow-glow-primary: 0 0 24px rgba(99,102,241,0.30);
```

## Component Specs

### Header
- Height: 72px, sticky
- Background: `rgba(11, 14, 20, 0.8)` + `backdrop-filter: blur(20px)`
- Logo: gradient icon (36px) + Nunito 800 gradient text
- Nav links: Inter 500, 14px, rgba(248,250,252,0.7)
- "Zaloguj się": outlined pill button, border rgba(255,255,255,0.2)

### Buttons
- **Primary (CTA)**: Emerald gradient, pill, 16px Nunito 700, glow shadow, hover: lift + stronger glow
- **Secondary**: Transparent, outlined, white text, hover: semi-transparent bg

### Value Cards
- White bg, `border-radius: 24px`, border `rgba(99,102,241,0.08)`
- Hover: `translateY(-6px)` + shadow-lg + top 3px gradient border
- Icon container: 56px, rounded-md, colored bg + border (indigo/cyan/emerald variants)

### Step Cards
- White bg, rounded-xl, centered text
- Number circle: 56px, gradient bg, glow shadow, JetBrains Mono
- Connecting line: gradient, opacity 0.3

### CTA Banner
- Same dark gradient as hero (visual bookend)
- Dot grid overlay
- Floating blobs (opacity 0.5)

## Distinctive Elements (non-generic)

1. **Floating gradient blobs** in hero — radial gradients animating with float keyframe
2. **Dot grid pattern** on dark sections — `radial-gradient` background-image
3. **Gradient text** — hero H1 partial, logo, CTA heading
4. **JetBrains Mono stats** — stat bar below hero
5. **Colored card hover border** — top 3px gradient reveal on hover
6. **Emerald glow CTA** — not just colored button, it *glows*
7. **Dark/Light frame** — hero + footer dark; body light (visual identity)
