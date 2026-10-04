"use client";

import { setWorkHover } from "@/lib/scene-bus";

/* Real, live projects built by the owner before Loopstak existed. No quotes or metrics: none exist. */
const PROJECTS = [
  { name: "FLOST8", href: "https://flost8.lk", note: "Live site with a booking form, for a client business." },
  { name: "Rama Shala", href: "https://sriramashala.com", note: "Booking engine with Stripe checkout in USD, EUR and LKR." },
  { name: "The Edited Wild", href: "https://editedwild.com", note: "Editorial WordPress site, live in production for a client." },
  { name: "Hyrefi", href: "https://hyrefi.com", note: "An AI CV platform I co-own and built. My own venture." },
];

export function WorkList() {
  return (
    <ul className="rows">
      {PROJECTS.map((p, i) => (
        <li key={p.name}>
          <a
            className="work-row"
            href={p.href}
            target="_blank"
            rel="noopener noreferrer"
            onMouseEnter={() => setWorkHover(i)}
            onMouseLeave={() => setWorkHover(-1)}
            onFocus={() => setWorkHover(i)}
            onBlur={() => setWorkHover(-1)}
          >
            <h3>{p.name}</h3>
            <p>{p.note}</p>
            <span className="go" aria-hidden="true">
              ↗
            </span>
            <span className="sr-only">(opens {p.href.replace("https://", "")} in a new tab)</span>
          </a>
        </li>
      ))}
    </ul>
  );
}
