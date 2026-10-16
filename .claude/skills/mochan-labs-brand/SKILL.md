---
name: mochan-labs-brand
description: Mochan Labs brand system — logo files, colour palette (navy, sapphire, cyan, gold, all taken from the logo), fonts (Sora + Figtree), imagery rules, motion and copy voice. Use whenever creating or restyling anything for Mochan Labs — website pages or versions, landing pages, templates, slides, social posts, videos, emails, documents — so it stays on-brand.
---

# Mochan Labs brand

Mochan Labs is an Indian IT solutions company (web, mobile, cloud, ERP/CRM,
automation). Its products run real operations — e.g. **Weighbridge**
(weighbridge management with Tally + govt-portal sync) and **ODTS** (dealer
order dispatch & tracking). The brand should feel like an established,
trustworthy technology partner: confident and rich, not minimal and not
"AI-generated".

## Files

| File | Use |
|---|---|
| `assets/logo-mark.png` | The hexagon "M" mark (transparent). Favicons, small lockups, video intros. |
| `assets/logo-full.png` | Full logo with wordmark. Documents, print, social avatars. |
| `assets/tokens.css` | Colour, font and motion tokens (Tailwind v4 `@theme` + CSS variables). Copy into new projects. |
| `assets/palette.png` | Visual reference of the palette and each colour's role. |

Always use the real logo files — never redraw or recolour the mark. In a
lockup, the wordmark "Mochan Labs" is set in Sora 600 beside the mark.

## Colour

Every colour comes from the logo: the dark navy field, the sapphire "M",
the cyan inner trace and the gold outer trace.

| Token | Hex | Role |
|---|---|---|
| navy-900 | `#0A1A3D` | Primary brand colour. Hero, section bands, footer. |
| navy-700 | `#173A72` | Gradients, cards on navy. |
| sapphire | `#215E97` | Links, secondary buttons, focus rings. |
| cyan | `#2BB7C9` | Highlight words in headings, icons, active states, thin lines. |
| gold | `#E0A83C` | **Primary call to action only** (buttons, key emphasis). Dark text on gold. |
| mist | `#F3F6FA` | Light section backgrounds. |
| ink | `#0B1630` | Body text on light backgrounds. |

Rules:
- Alternate **navy** and **light (mist/white)** sections so pages have rhythm;
  never a page that is white top to bottom, never random black blocks.
- One gold element per view at most — it is the "do this" colour.
- Cyan is for accents on navy or as large text; not for small body text on
  white (contrast).
- The signature background is `--gradient-brand` (navy with a cyan glow).
- Don't introduce other hues (no purple, no pink, no generic "tech" gradients).

## Typography

- **Sora** (600/700) for headings and the wordmark — geometric, technical.
- **Figtree** (400/500/600) for body, UI and buttons — friendly, very readable.
- Headings: tight but not cramped (`letter-spacing: -0.02em`, `line-height ~1.1`).
- No monospace "code" styling for decoration. Numbers use tabular figures.

## Imagery

- **Rich, not empty**: pages should mix photography, product UI and motion.
- **Stock photos are for context only** — industries, cities, devices,
  workplaces, logistics, retail, the template showcase. Source free-licence
  images (Unsplash/Pexels licence) and credit them in a `CREDITS.md`.
- **Never present stock people as Mochan Labs staff, clients or reviewers.**
  No stock faces beside testimonials or "our team". People in stock images
  should be incidental (hands, backs, crowds, distant).
- Prefer real product visuals: Weighbridge and ODTS screens, the brand film.
- Leave clearly marked slots for real team/office/site photos.
- Photos on navy get a navy gradient overlay so text stays readable.

## Motion

Animated, but purposeful (GSAP + Lenis on the web):
- Headings reveal line by line; sections fade/slide in on scroll.
- Photos have gentle parallax or slow zoom; product UI builds itself.
- Marquees for industries/logos; hover lifts on cards.
- Respect `prefers-reduced-motion` — everything must work without animation.

## Voice

Plain, confident, specific. Say what we build and for whom ("ERP for
distributors", "weighbridge software that syncs with Tally"), not vague
superlatives. Indian English, ₹ for prices. Never invent client names,
numbers, reviews or testimonials — use clearly fictional demo data in
mock-ups.

## Checklist before shipping

- [ ] Real logo files, untouched
- [ ] Only palette colours; gold used once per view for the main action
- [ ] Sora headings, Figtree body
- [ ] Navy/light section rhythm; looks rich on a 390px-wide phone
- [ ] No stock faces presented as team/clients; credits recorded
- [ ] Animations degrade gracefully with reduced motion
