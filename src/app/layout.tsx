import type { Metadata, Viewport } from "next";
import { Archivo, Fraunces } from "next/font/google";
import { Header } from "@/components/Header";
import { Consent } from "@/components/Consent";
import { Motion } from "@/components/Motion";
import { StickyCta } from "@/components/StickyCta";
import { META } from "@/content/copy";
import "./globals.css";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  axes: ["wdth"],
  display: "swap",
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["300"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
if (!siteUrl && process.env.NODE_ENV === "production") {
  // A missing origin would silently poison canonical and social URLs.
  throw new Error("NEXT_PUBLIC_SITE_URL must be set for production builds.");
}

export const viewport: Viewport = { themeColor: "#121212" };

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl ?? "http://localhost:3000"),
  title: META.home.title,
  description: META.home.description,
  // Stay out of search until the real domain and contact details are live.
  robots: process.env.ALLOW_INDEXING === "true" ? undefined : { index: false, follow: false },
  openGraph: {
    title: META.home.title,
    description: META.home.description,
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${archivo.variable} ${fraunces.variable}`} suppressHydrationWarning>
      <head>
        {/* hide animated text only while JS can reveal it; a timeout guarantees it never stays hidden */}
        <script
          dangerouslySetInnerHTML={{
            __html: "if(!matchMedia('(prefers-reduced-motion: reduce)').matches){document.documentElement.classList.add('anim');setTimeout(function(){document.documentElement.classList.remove('anim')},2500)}",
          }}
        />
      </head>
      <body>
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
        <Consent />
      </body>
    </html>
  );
}
