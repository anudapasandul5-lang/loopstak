import { LeadForm } from "@/components/LeadForm";
import { Cta } from "@/components/Cta";
import { IDEA_CALL_LABEL, ideaCallHref, whatsappHref } from "@/lib/site";

/** The closing section on every page: the free Idea call first, then WhatsApp, the form and questions. */
export function Contact({
  title = "Start with a free Idea call.",
  line,
  service,
  faq,
  form = "loop",
}: {
  title?: string;
  line?: string;
  service?: string;
  faq: [string, string][];
  form?: string;
}) {
  const call = ideaCallHref();
  const wa = whatsappHref();
  return (
    <section id="contact" className="scene scene-contact" data-form={form} data-side="center" data-dim="0.8">
      <div className="wrap contact-grid">
        <div className="contact-copy">
          <h2 className="h-sec" data-split>
            {title}
          </h2>
          <p className="lede" data-reveal>
            {line ?? "30 minutes, free. We name three tasks a better website or AI could take over, with a rough price for each."}
          </p>
          <div className="cta-row" data-reveal>
            <Cta href={call} size="lg" magnetic>
              {IDEA_CALL_LABEL}
            </Cta>
            {wa && (
              <Cta href={wa} kind="ghost" size="lg">
                Message us on WhatsApp
              </Cta>
            )}
          </div>
          <p className="fine" data-reveal>
            Need a website? After the call we can make a free one-screen design of your new homepage, so you see it
            before you pay.
          </p>
          <div className="faq" data-reveal>
            <h3 className="faq-h">Questions</h3>
            {faq.map(([q, a]) => (
              <details key={q}>
                <summary>{q}</summary>
                <p>{a}</p>
              </details>
            ))}
          </div>
        </div>
        <div className="contact-form" data-reveal data-glow>
          <h3 className="form-h">Or write to us</h3>
          <p className="form-intro">Tell us your name, how to reach you, the Service you need, and a few words about it.</p>
          <LeadForm whatsapp={wa} service={service} />
        </div>
      </div>
    </section>
  );
}
