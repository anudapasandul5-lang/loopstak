import {
  anthropicSummariser,
  googleSheetLog,
  resendMailer,
  telegramNotifier,
} from "./adapters.ts";
import type { Adapters } from "./adapters.ts";

export type EnquiryConfig = {
  /** Where Anuda's email copy goes. */
  ownerEmail: string;
  /** "From" address for every email sent. */
  from: string;
  /** Cal.com booking link for the client reply. */
  calLink: string;
  /** WhatsApp number, digits only. The client reply turns it into a wa.me link. */
  whatsapp: string;
};

type Env = Record<string, string | undefined>;

const val = (v: string | undefined) => (v && v.trim() ? v.trim() : "");

export function loadConfig(env: Env = process.env): EnquiryConfig {
  return {
    ownerEmail: val(env.LEAD_NOTIFY_TO),
    from: val(env.LEAD_FROM),
    calLink: val(env.NEXT_PUBLIC_CAL_LINK),
    whatsapp: val(env.NEXT_PUBLIC_WHATSAPP).replace(/\D/g, ""),
  };
}

/** Each adapter exists only when all of its env vars are present. */
export function buildAdapters(env: Env = process.env): Adapters {
  const resend = val(env.RESEND_API_KEY);
  const from = val(env.LEAD_FROM);
  const tgToken = val(env.TELEGRAM_BOT_TOKEN);
  const tgChat = val(env.TELEGRAM_CHAT_ID);
  const anthropic = val(env.ANTHROPIC_API_KEY);
  const gEmail = val(env.GOOGLE_SERVICE_ACCOUNT_EMAIL);
  // Vercel env vars often hold the key with literal \n sequences.
  const gKey = val(env.GOOGLE_PRIVATE_KEY).replace(/\\n/g, "\n");
  const gSheet = val(env.GOOGLE_SHEET_ID);

  return {
    mailer: resend && from ? resendMailer(resend) : null,
    notifier: tgToken && tgChat ? telegramNotifier(tgToken, tgChat) : null,
    summariser: anthropic ? anthropicSummariser(anthropic, val(env.ANTHROPIC_MODEL) || "claude-haiku-4-5") : null,
    sheet: gEmail && gKey && gSheet ? googleSheetLog(gEmail, gKey, gSheet) : null,
  };
}
