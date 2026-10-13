import { NextResponse, type NextRequest } from "next/server";
import { GEO_COOKIE, listForCountry } from "@/lib/prices";

/*
  Tells the page which price list to show first, without making pages dynamic:
  Vercel's country header becomes a small cookie that a head script reads before paint.
  No country header (local dev, other hosts) means no cookie, and the page falls back to USD.
*/
export function proxy(request: NextRequest) {
  const res = NextResponse.next();
  const country = request.headers.get("x-vercel-ip-country");
  if (country) {
    res.cookies.set(GEO_COOKIE, listForCountry(country), {
      path: "/",
      maxAge: 60 * 60 * 24,
      sameSite: "lax",
      secure: true,
    });
  }
  return res;
}

export const config = {
  // pages only: not the API, Next assets or files with an extension
  matcher: ["/((?!api|_next/static|_next/image|.*\\..*).*)"],
};
