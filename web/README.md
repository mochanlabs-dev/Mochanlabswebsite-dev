# Mochan Labs — public website

Next.js (App Router) + Tailwind v4 + GSAP + Lenis, exported as static files and
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

- `src/content/site.ts` — all copy, contact details, EmailJS IDs, globe markers
- `src/components/` — one component per section
- `src/lib/ink.ts` — the WebGL "ink" wipe between the dark hero and white body
- `src/app/globals.css` — brand tokens (paper, ink, accent) and shared styles
