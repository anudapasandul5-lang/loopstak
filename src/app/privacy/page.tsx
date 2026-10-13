import Link from "next/link";
import type { Metadata } from "next";
import { BUILDER, SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "How we handle your details",
  description: "What the enquiry form collects, why, the one small cookie this site sets, and how to have your details deleted.",
};

/* Owner review pending: confirm the hosting provider and how long enquiries are kept before going live. */
export default function Privacy() {
  return (
    <section className="doc">
      <div className="wrap">
        <div className="doc-in">
          <h1 className="h-sec">How we handle your details</h1>
          <p>
            {SITE_NAME} is built and run by {BUILDER}. This page covers what this site collects and what we do with it. If
            anything here is unclear, ask us.
          </p>

          <h2>What the form collects</h2>
          <p>Your name, the WhatsApp number or email you type in, the Service you pick, and your message. Nothing else.</p>

          <h2>Why</h2>
          <p>
            Only so we can reply to you about your enquiry. We don’t add you to a mailing list, and we never sell or share
            your details.
          </p>

          <h2>Where it goes</h2>
          <p>
            The form sends your message to our email inbox through an email delivery service (Resend). If you message us on
            WhatsApp instead, WhatsApp’s own privacy terms apply to that chat.
          </p>

          <h2>Cookies and tracking</h2>
          <p>
            One small cookie picks which price list you see first: rupees if your connection comes from Sri Lanka, dollars
            otherwise. It holds no personal details and expires after a day. If you switch the price list yourself, your
            browser remembers that choice until you close the tab. There are no analytics or ad trackers. The company hosting
            the site may keep standard technical logs, such as IP addresses, for security.
          </p>

          <h2>Your rights</h2>
          <p>
            You can ask to see, correct or delete what you sent us at any time. Message us on WhatsApp or through the form, and
            we’ll do it.
          </p>

          <p>
            <Link href="/">Back to the homepage</Link>
          </p>
        </div>
      </div>
    </section>
  );
}
