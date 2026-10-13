import Link from "next/link";
import type { ReactNode } from "react";

/*
  Action button. Hover pattern adapted from Uiverse.io "animated-button" by gharsh11032000 (MIT, see
  THIRD_PARTY_NOTICES.md): a circle fills the pill from its centre, the arrow leaves on the right and a
  second arrow enters on the left. Rebuilt in Loopstak tokens; hover only on fine pointers.
*/
const Arrow = ({ className }: { className: string }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true" focusable="false">
    <path d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z" />
  </svg>
);

export function CtaInner({ children }: { children: ReactNode }) {
  return (
    <>
      <Arrow className="btn-arr btn-arr-in" />
      <span className="btn-text">{children}</span>
      <span className="btn-fill" aria-hidden="true" />
      <Arrow className="btn-arr btn-arr-out" />
    </>
  );
}

type Props = {
  href: string;
  children: ReactNode;
  kind?: "primary" | "ghost";
  size?: "sm" | "md" | "lg";
  magnetic?: boolean;
  onClick?: () => void;
  className?: string;
};

export function Cta({ href, children, kind = "primary", size = "md", magnetic, onClick, className = "" }: Props) {
  const cls = `btn btn-${kind} btn-${size} ${className}`.trim();
  const extra = magnetic ? { "data-magnetic": "" } : {};
  const inner = <CtaInner>{children}</CtaInner>;
  if (href.startsWith("http")) {
    return (
      <a className={cls} href={href} target="_blank" rel="noopener" onClick={onClick} {...extra}>
        {inner}
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
    );
  }
  return (
    <Link className={cls} href={href} onClick={onClick} {...extra}>
      {inner}
    </Link>
  );
}
