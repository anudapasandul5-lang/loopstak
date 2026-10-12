# Switching on the enquiry form

The form works like this. A visitor sends a message. Then:

- they get a fixed "we got your message" email (only if they gave an email),
- a new row is added to your Google Sheet,
- you get a Telegram message and an email copy,
- Claude writes a short private summary and a suggested next step, sent only to you.

You do not need every piece. You need at least Telegram or the Resend email, so the form can reach you. Anything you skip is simply left off. If you set up nothing, the form tells visitors to use WhatsApp.

Never paste a key into a chat, an issue or a file in the repo. Keys only go into Vercel (last section).

## 1. Telegram bot (your phone alert)

1. Open Telegram and search for `@BotFather`. Check it has the blue tick.
2. Send `/newbot`. Give it a name, then a username that ends in `bot`.
3. BotFather replies with a token. It looks like numbers, a colon, then letters. This is `TELEGRAM_BOT_TOKEN`.
4. Open your new bot in Telegram and press Start. Send it any message, like "hi".
5. Find your chat id. In PowerShell, replace `PASTE_TOKEN` with your token and run:

   ```powershell
   Invoke-RestMethod "https://api.telegram.org/botPASTE_TOKEN/getUpdates" | ConvertTo-Json -Depth 8
   ```

6. Look for `"chat"` then `"id"`. The number next to it is `TELEGRAM_CHAT_ID`. Close the window afterwards so the token does not stay on screen.

## 2. Anthropic key (the private summary)

1. Go to console.anthropic.com and sign in.
2. Add a few dollars of credit under Billing. The summaries cost very little.
3. Open API keys, press Create key, name it `loopstak`.
4. Copy the key now. It is shown once. This is `ANTHROPIC_API_KEY`.
5. Optional: `ANTHROPIC_MODEL`. Leave it empty to use the cheap default.

## 3. Google Sheet (the enquiry log)

1. Go to sheets.google.com and create a blank Sheet. Name it `Loopstak enquiries`.
2. In row 1, type headings: Time, Name, Contact, Service, Message.
3. Look at the address bar. The long text between `/d/` and `/edit` is `GOOGLE_SHEET_ID`.
4. Go to console.cloud.google.com. Create a project called `loopstak`.
5. Open APIs and Services, then Library. Search "Google Sheets API" and press Enable.
6. Open IAM and Admin, then Service Accounts. Press Create service account, name it `loopstak-form`, and finish.
7. Click the new account. Copy its email address (it ends in `iam.gserviceaccount.com`). This is `GOOGLE_SERVICE_ACCOUNT_EMAIL`.
8. Open the Keys tab. Add key, Create new key, JSON. A file downloads.
9. Open that file in Notepad. Find `private_key`. Its value (starting `-----BEGIN PRIVATE KEY-----`) is `GOOGLE_PRIVATE_KEY`. Keep it as one line with the `\n` marks as they are.
10. Go back to your Sheet. Press Share, paste the service account email, give it Editor access, and untick "Notify people".
11. Delete the downloaded JSON file once the key is saved in Vercel.

## 4. Resend (email)

1. Go to resend.com and sign up.
2. Open Domains, then Add domain. Type your domain.
3. Resend shows DNS records (a few lines of type, name and value). Add each one where your domain is managed (your registrar or DNS host).
4. Press Verify in Resend. It can take from a few minutes to a few hours.
5. Open API Keys, create a key with "Sending access". This is `RESEND_API_KEY`.
6. `LEAD_FROM` is the sender, for example `Loopstak <hello@yourdomain.com>`. It must use the verified domain.
7. `LEAD_NOTIFY_TO` is the inbox where you want the copies.

## 5. Cal.com and WhatsApp links

1. Go to cal.com, sign up, and create an event type such as "20 minute intro".
2. Copy its public link. This is `NEXT_PUBLIC_CAL_LINK`.
3. For WhatsApp, type your number with the country code, digits only, no plus or spaces (for example `94771234567`). This is `NEXT_PUBLIC_WHATSAPP`.

## 6. Put them into Vercel

1. Open vercel.com, then your Loopstak project, then Settings, then Environment Variables.
2. For each name in `.env.example`, add the name and its value. Tick Production (and Preview if you want to test there).
3. Press Save, then go to Deployments, open the latest one, and choose Redeploy. Variables only apply to new deployments.
4. Open the live site and send a test enquiry with your own email. Check that Telegram, your inbox, the Sheet and the client reply all arrive.
5. If something does not arrive, open Vercel, then Logs. Lines starting with `[enquiry]` name the step that failed. They never show keys.

## Notes

- The form allows 5 messages per visitor per 10 minutes. This is a speed bump for spam, not a perfect wall.
- The client reply is always fixed template text. Claude only writes the private summary for you.
- Claude is told never to invent prices. Still read the summary before acting on it.
