import { buildAdapters } from "@/lib/enquiry/config";
import { loadConfig } from "@/lib/enquiry/config";
import { handleEnquiry } from "@/lib/enquiry/handle";
import { clientIp } from "@/lib/enquiry/rate-limit";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Bad request." }, { status: 400 });
  }

  const { status, body: out } = await handleEnquiry(
    body,
    clientIp(request.headers),
    buildAdapters(),
    loadConfig(),
  );
  return Response.json(out, { status });
}
