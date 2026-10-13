import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Geist, Geist_Mono } from "next/font/google";
import { Header } from "@/components/Header";
import { World } from "@/components/World";
import { Motion } from "@/components/Motion";
import { StickyCta } from "@/components/StickyCta";
import { Footer } from "@/components/Footer";
import { SITE_NAME } from "@/lib/site";
import { GEO_COOKIE, LIST_OVERRIDE_KEY } from "@/lib/prices";
import "./globals.css";

// three voices: Bricolage for display, Geist for reading, Geist Mono for numbers and small labels
const display = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  axes: ["opsz", "wdth"],
  display: "swap",
});

const body = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
});

const mono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
if (!siteUrl && process.env.NODE_ENV === "production") {
  // A missing origin would silently poison canonical and social URLs.
  throw new Error("NEXT_PUBLIC_SITE_URL must be set for production builds.");
}

export const viewport: Viewport = { themeColor: "#0c0d0d", colorScheme: "dark" };

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl ?? "http://localhost:3000"),
  title: { default: `${SITE_NAME}: websites and AI for small businesses in Sri Lanka`, template: `%s | ${SITE_NAME}` },
  description:
    "We build websites and the AI behind them for owner-run businesses in Sri Lanka and abroad. Fixed public prices. Everything in your name from day one.",
  // Stay out of search until the real domain and contact details are live.
  robots: process.env.ALLOW_INDEXING === "true" ? undefined : { index: false, follow: false },
  openGraph: {
    title: `${SITE_NAME}: the website and the AI behind it`,
    description: "Built for you. Owned by you. Fixed public prices, and every account in your name from day one.",
    type: "website",
  },
};

/*
  Runs before first paint:
  1. picks the price list (the visitor's own choice this visit, else their country, else USD)
  2. marks text that JS will reveal, with a timeout so it can never stay hidden
*/
const HEAD = `try{var d=document.documentElement,o=null;try{o=sessionStorage.getItem('${LIST_OVERRIDE_KEY}')}catch(e){}var c=document.cookie.match(/(?:^|; )${GEO_COOKIE}=(lkr|usd)/);d.dataset.list=(o==='lkr'||o==='usd')?o:(c?c[1]:'usd');if(!matchMedia('(prefers-reduced-motion: reduce)').matches){d.classList.add('anim');setTimeout(function(){d.classList.remove('anim')},2600)}}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: HEAD }} />
      </head>
      <body>
        {/*
          THESIS: Loopstak builds from small parts and hands every part to the owner. The whole site is one
          world of small blocks that rebuilds itself as you scroll: an infinity loop, a website, a loop of
          gears, a plug, a classroom, a stack, and a key that turns mint, the colour that means "yours".
        */}
        <a className="skip" href="#content">
          Skip to content
        </a>
        <World />
        <div className="grain" aria-hidden="true" />
        <Header />
        <main id="content" tabIndex={-1}>
          {children}
        </main>
        <Footer />
        <StickyCta />
        <Motion />
      </body>
    </html>
  );
}
