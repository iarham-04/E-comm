# Corazonetouch Workspace Project Rules

All current and future code changes across `/apps/web` and `/apps/api` MUST adhere to these 10 core engineering and design principles:

---

## 10 Core Project Principles

> [!IMPORTANT]
> **Design Constitution**: Every component and page must conform strictly to the rules in [design_language_inspiration_book.md](file:///Users/arham/.gemini/antigravity-ide/brain/9c79ceeb-698c-4458-8e50-2b3147906b79/design_language_inspiration_book.md).

### 1. Minimal UI
- Eliminate unnecessary decorative borders, redundant dividers, and distracting chrome.
- Let typography, whitespace, and product photography drive visual hierarchy.

### 2. Maximum Whitespace
- Use generous vertical spacing (`py-12`, `py-16`, `space-y-8`, `space-y-12`) between layout sections.
- Component padding must conform to the design system spacing scale (`tokens.ts`).

### 3. Product-First Layouts
- Product imagery must occupy at least 50% of above-the-fold viewport height on product pages.
- Prices must be clearly formatted with multi-currency support (`INR ₹`, `USD $`, `EUR €`, `GBP £`).

### 4. Fast Loading & Zero Cumulative Layout Shift (CLS)
- Utilize Next.js 14 App Router Server Components for initial rendering.
- Layout geometry must be preserved during loading state using `HomepageSkeleton.tsx` and `Skeleton.tsx` to maintain CLS < 0.01.

### 5. Mobile-First Responsiveness
- All components must be designed for 375px mobile viewports first, scaling gracefully to desktop (`sm:`, `md:`, `lg:`, `xl:`).
- All interactive buttons and touch targets must measure at least 44x44px.

### 6. WCAG 2.1 AA Accessibility
- Every interactive element must display a high-contrast focus ring on keyboard navigation (`focus-visible:ring-2 focus-visible:ring-forge-gold`).
- Text contrast ratio must exceed 4.5:1 for normal body copy and 3:1 for large display headers.
- All non-text content (images, icons) must provide descriptive `alt` text or `aria-label` attributes.

### 7. SEO-Friendly Semantic HTML
- Every page must render exactly one `<h1>` tag with proper heading hierarchy (`<h2>`, `<h3>`).
- HTML5 semantic structure required (`<header>`, `<nav>`, `<main>`, `<section>`, `<footer>`).
- Rich metadata must include title tags, meta descriptions, OpenGraph, Twitter Cards, and JSON-LD structured data.

### 8. High-Quality Imagery
- Product imagery must feature museum-grade side-lit or dramatic lighting with un-cropped aspect ratios.
- Images must specify responsive loading attributes (`loading="lazy"` for below-the-fold).

### 9. Consistent Design System
- All UI elements MUST be composed using primitives from `@/components/ui/` (`Button`, `Input`, `Select`, `Card`, `Badge`, `Breadcrumb`, `Modal`, `Drawer`, `Toast`, `Skeleton`, `EmptyState`, `ErrorState`, `LoadingSpinner`).
- Styling must reference design tokens from `@/design-system/tokens.ts` and motion presets from `@/design-system/motion.ts`.

### 10. Trust Built Into Every Interaction
- Reinforce trust at key touchpoints: Free Worldwide Express Shipping, Verified Collector Testimonials, 30-Day Returns, and 256-Bit Encrypted Checkout.

---

## UI Design Directives (Permanent Constraints — All Phases)

These 5 directives are **enforceable constraints**, not optional guidelines. Every UI decision — for any new feature, page, or component — must be evaluated against each of these before building.

---

### Directive 10: 10-Point Design Approval Gate
Before declaring any screen complete, verify it answers **"YES"** to all 10 questions:
1. Is the product the focal point?
2. Is there enough whitespace? (8-point scale)
3. Is the primary action obvious? (Single primary CTA)
4. Is the typography hierarchy clear? (`Cormorant Garamond` headers + `Inter` body)
5. Does it feel premium & quiet?
6. Does it load quickly? (LCP < 2.5s, CLS < 0.1, INP < 200ms)
7. Is it accessible? (WCAG AA, gold focus ring, reduced motion)
8. Does it follow the DLS v1.0 rules? (80/10/8/2 colors)
9. Does it reinforce continuous trust?
10. Is any UI element unnecessary?

### Directive 1: Products Are the Hero
- Product photos always receive the **largest visual weight** on any page they appear on. No competing gradients, patterns, or busy backgrounds within or adjacent to product imagery.
- UI chrome (buttons, filters, nav, labels) uses **neutral colors only** — `slate`, `stone`, `white`, `black`. No bright competing accent colors except on the **one primary CTA per screen**.
- **Customer Terminology Consistency**: Always use customer-facing term **"Collections"** in UI navigation and labels. Never mix "Categories", "Departments", or "Sections" in customer copy.
- Secondary actions (wishlist, share, compare) must visually recede — ghost buttons or icon-only controls with no fill.
- If any design element draws more attention than the product image, simplify the element, not the image.

### Directive 2: White Space Creates Luxury
- Generous padding around product cards and layout sections is **not optional** — it is the design. Default to `py-16`/`py-24` for section gaps, `p-8`/`p-10` for card interiors.
- **Never fill empty space just to fill it.** Empty space is intentional. Adding content, icons, or decorative elements to fill a gap is a violation of this directive.
- When in doubt between more whitespace and more content density: **choose whitespace**.
- Grid layouts for products use a maximum of **4 columns on desktop**. Never 5+. Items need room to breathe.

### Directive 3: Motion Has Purpose
- Only add animation/transitions that **clarify state changes** (e.g. smooth height transition when filter panel expands, toast sliding up).
- **Exact Motion Durations**:
  - Hover states: **150ms** (`duration-150`)
  - Page/Route transitions: **200ms** (`duration-200`)
  - Drawers & Modals: **250ms** (`duration-250`)
- **Easing Curve**: Always use smooth **ease-in-out** curves (`ease-in-out`).
- **Forbidden Motion**: Zero bouncing (`animate-bounce`), zero elastic effects, zero overshoot animations, and zero decorative parallax scrolling.
- Motion presets from `@/design-system/motion.ts` are the only approved animation source. Do not add one-off custom Framer Motion variants.

### Directive 4: Every Pixel Builds Trust
- **No placeholder-looking content** in production code paths: no `lorem ipsum`, no `TODO:`, no broken image states without a graceful fallback component.
- All broken or missing images must render the `EmptyState` or a neutral product silhouette placeholder — never a broken `<img>` icon.
- **No inconsistent button styles** across pages. Every button must map to exactly one variant from `@/components/ui/Button.tsx`.
- Checkout and payment screens are held to the **highest trust standard**:
  - Always display numbered step indicators (Step 1 of 3, etc.).
  - No ambiguous button labels. Use specific, outcome-oriented labels:
    - ❌ "Submit" → ✅ "Place Order"
    - ❌ "Continue" → ✅ "Proceed to Payment"
    - ❌ "OK" → ✅ "Confirm Address"
    - ❌ "Pay" → ✅ "Pay ₹34,999 Securely"
  - Display the security badge (`🔒 256-bit encrypted`) near every payment action.

### Directive 5: Every Click Must Feel Intentional
- Minimize the number of clicks/steps to any core action: **add to cart, checkout, search**.
- **Navigation must never require more than three clicks to reach any product** from anywhere on the site.
- **Mega Menu Restraint & Cognitive Load Reduction**: Avoid bloated mega-menus with dozens of links. Limit mega-menus to max 4 focused columns with max 4 high-quality links per group.
- **Every screen and navigation state must visually answer 4 core orientation questions**:
  1. *Where am I?* → High-visibility single `<h1>`, active nav indicator, clear breadcrumbs.
  2. *What can I buy?* → Product-first layout, un-cluttered photography, clear pricing.
  3. *How do I get back?* → Sticky header, persistent logo link to `/`, non-destructive back actions.
  4. *How do I complete my purchase?* → Single visually dominant primary CTA ("Add to Cart", "Place Order · Pay ₹X Securely").
- **Never require two clicks for something achievable in one.** If a common action (e.g. filter by category) requires opening a modal to then apply, flatten it to inline pills.
- **No "Are you sure?" confirmation dialogs for reversible or low-stakes actions.**
  - Removing a cart item → show an **Undo toast** (`useToast` from `@/components/ui/Toast.tsx`) instead.
  - Clearing the wishlist → show an **Undo toast**.
  - Save confirmation dialogs **only** for genuinely irreversible/destructive actions (e.g. permanently deleting an account, cancelling a placed order).
- Each page must have exactly **one visually dominant primary CTA**. If a screen has two equally prominent buttons, one of them is wrong — demote the secondary to an outline/ghost variant.

