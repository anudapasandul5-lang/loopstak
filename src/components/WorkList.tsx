"use client";

import { setWorkHover } from "@/lib/scene-bus";
import { WORK } from "@/lib/site";


export function WorkList() {
  return (
    <ul className="rows">
      {WORK.map((p, i) => (
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
            <h3 translate="no">{p.name}</h3>
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
