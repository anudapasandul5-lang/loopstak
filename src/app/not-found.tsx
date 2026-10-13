import { Cta } from "@/components/Cta";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <section className="doc">
      <div className="wrap">
        <div className="doc-in">
          <h1 className="h-sec">That page isn’t here.</h1>
          <p>The link may be old or mistyped.</p>
          <div className="cta-row">
            <Cta href="/">Back to the homepage</Cta>
            <Cta href="/#contact" kind="ghost">
              Write to us
            </Cta>
          </div>
        </div>
      </div>
    </section>
  );
}
