import type { Metadata, Viewport } from "next";
import { Schibsted_Grotesk, Unbounded } from "next/font/google";
import { Header } from "@/components/Header";
import { Scene } from "@/components/Scene";
import { Motion } from "@/components/Motion";
import { StickyCta } from "@/components/StickyCta";
import { SITE_NAME } from "@/lib/site";
import "./globals.css";

const unbounded = Unbounded({
  variable: "--font-unbounded",
  subsets: ["latin"],
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

export const viewport: Viewport = { themeColor: "#061417" };

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
    <html lang="en" className={`${unbounded.variable} ${body.variable}`} suppressHydrationWarning>
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
          THESIS: Loopstak is its own name made physical: a loop and a stack. One scroll flies the visitor through a chrome infinity loop into a stack of glass layers that build a website, past the keys handed over on day one, to the live work. It refuses the template web-agency page and the novelty-sign look it replaced.
          OWN-WORLD: near-black teal void, chrome and glass, deep-teal glow, one mint signal, huge tight Unbounded type, Geist for reading; a single fixed WebGL canvas behind real HTML.
          STORY: the visitor sees something they cannot buy from a template seller, understands the build in layers, sees the prices, learns the keys are theirs, opens real work, and messages.
          FIRST VIEWPORT: left, the Loopstak eyebrow then "We build websites that help you get customers." set huge, the from-LKR-35,000 line and two actions (WhatsApp, free Google check); right, a tilted stack of the live sites; the chrome loop glows behind.
          FORM: Loop & Stack, a scroll-driven 3D tour (user-pinned direction; Pinterest research: dark pages, chrome/glass objects, camera moving with scroll).
          FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
        */}
        <a className="skip" href="#content">
          Skip to content
        </a>
        <div className="progress" aria-hidden="true" />
        <Scene />
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
