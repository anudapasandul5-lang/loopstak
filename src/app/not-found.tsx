import Link from "next/link";
export default function NotFound() {
  return (
    <section className="doc">
      <div className="panel">
        <p className="eyebrow">404</p>
        <h1 className="h-sec">That page isn’t here.</h1>
        <p className="lede">The link may be old or mistyped. Everything lives on one page anyway.</p>
        <div className="hero-cta">
          <Link className="pill" href="/">
            Back to the homepage
          </Link>
          <Link className="pill pill-ghost" href="/#contact">
            Send us a message
          </Link>
        </div>
      </div>
    </section>
  );
}
