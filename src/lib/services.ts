/*
  The four Services. Copy follows docs/copy (claims traced to PRODUCT.md and the PRD, issue #1).
  No invented proof: where there is nothing public to show, the page says so.
*/

export type ServiceId = "website" | "agents" | "claude" | "teaching";

/** A 3D block shape from src/components/world/forms.ts. */
export type FormName = "loop" | "city" | "site" | "agents" | "plug" | "team" | "drift" | "stack" | "key" | "person";

export type Service = {
  id: ServiceId;
  n: string;
  slug: string;
  name: string;
  /** one plain line for cards and the Services chapters */
  line: string;
  /** three short points for the home chapter */
  points: [string, string, string];
  form: FormName;
  page: {
    title: string;
    description: string;
    h1: string;
    sub: string;
    forWho: string;
    included: string[];
    notIncluded: string[];
    proof: string;
    faq: [string, string][];
    contactLine: string;
    /** caption for each build stage of the 3D story, in page order */
    stages: [string, string, string, string];
  };
};

export const SERVICES: Service[] = [
  {
    id: "website",
    n: "01",
    slug: "website-design",
    name: "Website design",
    line: "A site for your business, up to 5 pages, found on Google.",
    points: [
      "Live 7 days after you send photos and text",
      "WhatsApp button and enquiry form on every page",
      "Domain, hosting and every login in your name",
    ],
    form: "site",
    page: {
      title: "Website design for small businesses in Sri Lanka",
      description:
        "A site for your business, up to 5 pages, set up in your name and found on Google. Fixed price. Live 7 days after you send photos and text.",
      h1: "A website you own.",
      sub: "Up to 5 pages. Found on Google. Set up in your name from day one.",
      forWho: "Owners with no website, or a weak one, who need to be found on Google and booked.",
      included: [
        "A mobile-first site, up to 5 pages",
        "A WhatsApp button and an enquiry form on every page",
        "Google Business Profile and Search Console set up or claimed",
        "Domain, hosting and every login in your name",
        "A walkthrough so you can make small changes yourself",
        "Live 7 days after you send photos and text",
      ],
      notIncluded: ["Online payments, quoted separately", "Domain and hosting fees, paid by you to the providers, in your name"],
      proof: "Live sites we built, before Loopstak had a name. Open them and check.",
      faq: [
        ["How long does it take?", "7 days from the day you send your photos and text."],
        ["What do I need to send?", "Your logo if you have one, photos, your prices or services, and your contact details."],
        ["Will I be first on Google?", "Nobody can honestly promise that. We make sure Google can find you when people search your name."],
        ["How do I pay?", "50% up front and 50% when you approve the live site."],
        ["Can you take online payments on my site?", "Yes, but we quote that separately."],
      ],
      contactLine: "Not sure yet? Book a free Idea call. After it, we can make you a free mock-up of your new homepage.",
      stages: ["The frame goes down.", "Your photos take their place.", "Your words and services fill it in.", "Your address and your button. Both yours."],
    },
  },
  {
    id: "agents",
    n: "02",
    slug: "ai-agents",
    name: "AI agents and automation",
    line: "Software that answers and follows up while you work.",
    points: [
      "Up to 3 automations, built and running",
      "One new automation or one change each month",
      "AI usage fees paid by you, in your own accounts",
    ],
    form: "agents",
    page: {
      title: "AI agents and automation for small businesses in Sri Lanka",
      description:
        "We build and run AI agents and automations for your business. A monthly plan with up to 3 automations running. For owner-run businesses in Sri Lanka and abroad.",
      h1: "Software that does the follow-up.",
      sub: "We build and run agents and automations for your business, every month.",
      forWho: "Growing businesses buried in manual admin, who want enquiries caught and followed up without doing it by hand.",
      included: [
        "Up to 3 automations, built and running",
        "One new automation or one change each month",
        "Plain words on what each one does",
      ],
      notIncluded: ["AI usage fees. You pay these yourself, in your own accounts."],
      proof: "We have no client results to show here yet, and we will not invent any. Tell us the job you do by hand and we will name the automation on a free Idea call.",
      faq: [
        ["What is an automation?", "A job that runs by itself. A customer messages at 11pm, and a workflow replies and follows up."],
        ["How many can run at once?", "Up to 3."],
        ["Who pays the AI usage fees?", "You do, in your own accounts. They are not in our price."],
        ["Can I change one later?", "Yes. The plan covers one new automation or one change each month."],
      ],
      contactLine: "Tell us the job you do by hand. We name the automation on a free Idea call.",
      stages: ["A message arrives.", "The loop picks it up.", "It does the work you used to do by hand.", "The reply goes out. Your customer is answered."],
    },
  },
  {
    id: "claude",
    n: "03",
    slug: "claude-integration",
    name: "Claude integration",
    line: "We connect Claude to the tools your team already uses.",
    points: ["Team setup with Projects and your documents", "Up to 2 tool connections", "A 1-hour handover for your team"],
    form: "plug",
    page: {
      title: "Claude integration for small businesses in Sri Lanka",
      description:
        "We set Claude up for your team and connect it to the tools you already use. A one-off job for small businesses in Sri Lanka and abroad.",
      h1: "Claude, connected to your tools.",
      sub: "A one-off job. We set Claude up for your team and link it to the tools you already use.",
      forWho: "Teams that want to use Claude every day but have not set it up with their own documents and tools.",
      included: ["Team setup with Projects and your documents", "Up to 2 tool connections", "A 1-hour handover so your team can use it"],
      notIncluded: ["Your Claude plan. You pay for it in your own account."],
      proof: "We have no client results to show here yet, and we will not invent any. Bring the two tools your team lives in to a free Idea call.",
      faq: [
        ["Do you work for Anthropic?", "No. We are independent. We build with Claude, and Anthropic has no part in our work."],
        ["Do I need a Claude plan?", "Yes. You pay for your own plan, in your own account."],
        ["How many tools can you connect?", "Up to 2 in this job."],
        ["What happens after setup?", "We spend 1 hour with your team to hand it over."],
      ],
      contactLine: "Tell us which tools your team uses. Book a free Idea call.",
      stages: ["Your tools, side by side, not talking.", "We run the cable between them.", "Plugged in.", "Both sides lit. Both in your account."],
    },
  },
  {
    id: "teaching",
    n: "04",
    slug: "ai-teaching",
    name: "AI teaching",
    line: "A full-day session that teaches your team to use AI in their own work.",
    points: ["Up to 15 people", "Built around your team’s own work", "In Sri Lanka, or online anywhere"],
    form: "team",
    page: {
      title: "AI teaching for teams in Sri Lanka",
      description:
        "A full-day session that teaches your team to use AI in their own work. Up to 15 people. In Sri Lanka, or online anywhere.",
      h1: "Your team, using AI in their own work.",
      sub: "A full-day session for up to 15 people, built around the work they already do.",
      forWho: "Owners and teams who want to use AI day to day, and want someone to show them how.",
      included: ["One full-day session", "Up to 15 people", "Teaching built around your team’s own work"],
      notIncluded: ["Transport outside Colombo", "Travel for in-person sessions abroad"],
      proof: "We have no client results to show here yet, and we will not invent any. We plan your day around your team on a free Idea call.",
      faq: [
        ["How many people can join?", "Up to 15."],
        ["How long is a session?", "One full day."],
        ["Do you teach outside Colombo?", "Yes. Transport outside Colombo costs extra."],
        ["Can you teach us from abroad?", "Online, yes, priced per day. In person abroad is quoted, plus travel."],
      ],
      contactLine: "Tell us what your team does all day. We plan the session on a free Idea call.",
      stages: ["The table is set.", "The first people sit down.", "The room fills up.", "Everyone at work on their own tasks."],
    },
  },
];

export const serviceById = (id: ServiceId) => SERVICES.find((s) => s.id === id)!;
export const SERVICE_NAMES = SERVICES.map((s) => s.name);
