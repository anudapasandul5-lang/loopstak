import type { Metadata, Viewport } from "next";
import { Archivo, Schibsted_Grotesk } from "next/font/google";
import { Header } from "@/components/Header";
import { Motion } from "@/components/Motion";
import { StickyCta } from "@/components/StickyCta";
import { SITE_NAME } from "@/lib/site";
import "./globals.css";

// One variable file covers every weight and width; the wide cut carries the headlines.
const display = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  axes: ["wdth"],
  display: "swap",
});

const body = Schibsted_Grotesk({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
if (!siteUrl && process.env.NODE_ENV === "production") {
  // A missing origin would silently poison canonical and social URLs.
  throw new Error("NEXT_PUBLIC_SITE_URL must be set for production builds.");
}

export const viewport: Viewport = { themeColor: "#eef0ec" };

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl ?? "http://localhost:3000"),
  title: `${SITE_NAME}: websites that help you get customers`,
  description:
    "Websites for Sri Lankan businesses that help you get customers: on Google, live in 7 days from LKR 35,000, with every login in your name. One builder, public prices.",
  // Stay out of search until the real domain and contact details are live.
  robots: process.env.ALLOW_INDEXING === "true" ? undefined : { index: false, follow: false },
  openGraph: {
    title: `${SITE_NAME}: we build websites that help you get customers`,
    description: "The Own-It Website: live in 7 days, from LKR 35,000, every login in your name. Pay the second half only when you're happy.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`} suppressHydrationWarning>
      <head>
        {/* hide animated text only while JS can reveal it; a timeout guarantees it never stays hidden */}
        <script
          dangerouslySetInnerHTML={{
            __html: "if(!matchMedia('(prefers-reduced-motion: reduce)').matches){document.documentElement.classList.add('anim');setTimeout(function(){document.documentElement.classList.remove('anim')},2500)}",
          }}
        />
      </head>
      <body>
        {/*
          THESIS: Handover. The site's one creative moment is the promise itself: five keys (address, hosting, Google listing, email, files) pass from Loopstak to the visitor's business.
          OWN-WORLD: cool paper, near-black ink, one green that means "yours"; huge wide Archivo headlines, Schibsted Grotesk for reading. No WebGL: speed on a mid-range phone beats spectacle.
          STORY: see real sites through the headline window, understand four steps, read public prices, watch the keys change hands, open the live work, message.
          RULES: one signature move per page; everything readable at rest (no JS, reduced motion); first screen under 2.5 s on slow 4G.
        */}
        <a className="skip" href="#content">
          Skip to content
        </a>
        <div className="progress" aria-hidden="true" />
        <Motion />
        <Header />
        <main id="content" tabIndex={-1}>
          {children}
        </main>
        <StickyCta />
      </body>
    </html>
  );
}
