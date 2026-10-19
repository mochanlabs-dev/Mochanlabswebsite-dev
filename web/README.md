# Mochan Labs - public website

Next.js (App Router) + Tailwind v4 + GSAP + Lenis (Design 2: calm, minimal), exported as static files and
served by the Express app in `../server` alongside the admin portal.

## Develop

```bash
npm install
npm run dev -- --port 3001
```

## Build

```bash
npm run build   # writes ./out, which ../server serves at /
```

## Where things live

- `src/content/site.ts` - all copy, contact details, EmailJS IDs
- `src/components/` - one component per section
- `src/components/CircuitLines.tsx` - the line illustration used in the hero and dark panels
- `src/app/globals.css` - brand tokens (paper, ink, accent) and shared styles
