# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Next.js 16 (App Router) + Tailwind v4, new project in `Desktop/Loopstak`. Deploy target undecided; the site URL is an env var (`NEXT_PUBLIC_SITE_URL`).

## Users

Owner-run small and mid-size businesses in Sri Lanka and abroad. Two entry points: owners with no or a weak website who need to be found and booked, and growing SMBs buried in manual admin who want leads captured, followed up and routed automatically. They are deciding whether a one-person builder is real, fairly priced and safe to hand their domain to.

## Product Purpose

Loopstak (spelled "Loopstak" per the owner; owned domain is loopstack.net, so the production domain is unresolved) sells four Services run by one builder, Anuda Pasandul (PRD, issue #1): Website design ("The Own-It Website", LKR 35,000 one-off: up to 5 pages, live 7 days after photos and text arrive, Google Business Profile and Search Console setup, 50% up front and 50% on approval of the live site; online payments quoted separately) with optional Upkeep (LKR 7,500/month); AI agents and automation (LKR 40,000/month, up to 3 running automations, one new or change per month, client pays AI usage fees); Claude integration (LKR 20,000 one-off, up to 2 tool connections, 1-hour handover, client pays their own Claude plan); AI teaching (LKR 75,000 per full day, up to 15 people, transport outside Colombo extra). Clients outside Sri Lanka see a separate USD list (450 / 40 / 300 / 150 / 400 per online day). The free first step is a 30-minute Idea call. The site's job is to turn warm visitors into a WhatsApp message or an inquiry. Success is inbound conversations, not traffic.

## Positioning

The client owns everything from day one: domain, hosting and every account sit in the client's name, so there is no lock-in. A template seller or marketplace gig cannot truthfully copy "you hold the keys from the first day".

## Operating Context

Solo operator, ~40 hours a week, no employees. Prices are public. Visitors read in English; Sri Lankan visitors see the LKR list, everyone else the USD list, with a switch between them. Contact is WhatsApp plus an inquiry form delivered by email. Cold outreach is excluded.

## Capabilities and Constraints

- Offers and prices as above; the USD list is its own price list for clients outside Sri Lanka, not a conversion. All prices live in `src/lib/prices.ts`.
- Zero paying clients under the Loopstak name today.
- Name spelling "Loopstak" vs domain loopstack.net is unresolved; keep the site name and URL configurable.
- WhatsApp number and notification email are not on file; both come from env vars, never hardcoded.
- Past work is real but built under Anuda's own name; show it as selected work by the builder.

## Brand Commitments

- Name: Loopstak (owner's final spelling).
- Integrity: no fake urgency, invented testimonials, invented metrics or implied agency size.
- Do not imply a UK or other overseas presence.

## Evidence on Hand

Live sites that may be shown: flost8.lk, sriramashala.com, editedwild.com, hyrefi.com, and Frontier Football (frontier-football.vercel.app; shown, like Hyrefi, as the builder's own venture). Screenshots must be captured fresh from the live sites. Absent and must not be fabricated: client testimonials, case-study metrics, delivery timelines, team photos, logo.

## Product Principles

1. Say what it costs and what you get; scope boundaries are visible.
2. Ownership is the headline promise: your domain, your accounts, from day one.
3. Show real work, label anything synthetic, claim nothing unverifiable.
4. Studio voice ("we", owner decision 2026-10-04), but honest about size: the footer and privacy page say Loopstak is built and run by Anuda Pasandul. Never claim a team, offices or headcount.
5. A visitor can act (WhatsApp or form) within seconds from any section.

## Accessibility & Inclusion

WCAG AA contrast, keyboard operable controls including the currency toggle and form, visible focus, reduced-motion respected.
