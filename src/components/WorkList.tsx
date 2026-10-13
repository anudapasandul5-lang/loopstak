import Image from "next/image";
import { WORK } from "@/lib/site";

/** The live sites, shown big: one screenshot per row, with what it is and a link out. */
export function WorkList() {
  return (
    <ul className="work">
      {WORK.map((p) => (
        <li key={p.name} className="work-item">
          <a className="work-shot" href={p.href} target="_blank" rel="noopener noreferrer" tabIndex={-1} aria-hidden="true">
            <Image src={p.src} alt="" width={1440} height={900} sizes="(max-width: 80rem) 100vw, 76rem" />
          </a>
          <div className="work-cap">
            <h3 translate="no">{p.name}</h3>
            <p>{p.note}</p>
            <a className="work-link" href={p.href} target="_blank" rel="noopener noreferrer">
              Visit site <span aria-hidden="true">↗</span>
              <span className="sr-only"> {p.name} (opens {p.href.replace("https://", "")} in a new tab)</span>
            </a>
          </div>
        </li>
      ))}
    </ul>
  );
}
