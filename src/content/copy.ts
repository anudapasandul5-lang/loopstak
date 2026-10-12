/* DRAFT — waiting for Anuda's OK. Words only. Price amounts, inclusions and exclusions live in the price module. */

export type ServiceSlug =
  | "website-design"
  | "ai-agents-automation"
  | "claude-integration"
  | "ai-teaching";

export type Faq = { q: string; a: string };

export type ServicePage = {
  title: string;
  description: string;
  heroLine: string;
  heroSub: string;
  whoFor: string[];
  included: string[];
  priceNote: string;
  proof: string;
  faqs: Faq[];
  contact: string;
};

export type Service = {
  slug: ServiceSlug;
  number: "01" | "02" | "03" | "04";
  name: string;
  line: string;
  linkLabel: string;
  page: ServicePage;
};

export const META = {
  home: {
    title: "Loopstak: websites and AI for small businesses in Sri Lanka",
    description:
      "We build websites and the AI behind them for owner-run businesses in Sri Lanka and abroad. Fixed prices. Everything in your name.",
  },
  privacy: {
    title: "How we handle your details | Loopstak",
    description: "What the contact form collects, where it goes, and how to have it deleted.",
  },
} as const;

export const HOME = {
  hero: {
    line: "The website and the AI behind it. Built for you. Owned by you.",
    primaryCta: "Book a free Idea call →",
    secondaryCta: "Message us on WhatsApp",
  },
  ticker: [
    "Website design",
    "AI agents and automation",
    "Claude integration",
    "AI teaching",
  ],
  statement: {
    label: "Why we exist →",
    before: "Owner-run businesses ",
    circled: "deserve",
    after: " the websites and AI that big companies have, without the big-company bill or the lock-in.",
  },
  servicesLabel: "What we build →",
  work: {
    label: "Work we have built →",
    intro: "Five live sites. Open them and check for yourself.",
    ownVentureNote: "This is our own venture.",
    sites: [
      {
        name: "FLOST8",
        href: "https://flost8.lk",
        linkLabel: "View flost8.lk →",
        note: "A Sri Lankan DJ agency. Fans see upcoming shows. Promoters pick a date and book an artist.",
        ownVenture: false,
      },
      {
        name: "Rama Shala",
        href: "https://sriramashala.com",
        linkLabel: "View sriramashala.com →",
        note: "A yoga and wellness retreat. Guests book rooms, workshops and massages, and pay online.",
        ownVenture: false,
      },
      {
        name: "The Edited Wild",
        href: "https://editedwild.com",
        linkLabel: "View editedwild.com →",
        note: "A travel and food magazine, live and publishing.",
        ownVenture: false,
      },
      {
        name: "Hyrefi",
        href: "https://hyrefi.com",
        linkLabel: "View hyrefi.com →",
        note: "A startup Anuda co-owns, connecting Sri Lankan tech talent with employers.",
        ownVenture: true,
      },
      {
        name: "Frontier Football",
        href: "https://frontier-football.vercel.app",
        linkLabel: "View frontier-football.vercel.app →",
        note: "Anuda's own small-sided football community in Colombo: leagues, events and partner sign-ups.",
        ownVenture: true,
      },
    ],
  },
  clips: {
    label: "AI that runs →",
    intro: "Short clips of working AI. Each one says whose it is.",
    items: [
      { id: "whatsapp-notes-bridge", name: "WhatsApp notes bridge", tag: "Own build", caption: "We made it for ourselves." },
      { id: "reel-reader", name: "Reel Reader", tag: "Own build", caption: "We made it for ourselves." },
      { id: "friend-agent", name: "A friend's agent", tag: "Built for a friend", caption: "Not a paid job." },
    ],
  },
  caseStudy: {
    label: "A custom tool for a booking business →",
    title: "FLOST8",
    problem:
      "FLOST8 is a DJ agency. Promoters want to book an artist for a date. Fans want to see what is on. Both need quick answers.",
    built:
      "A website where fans see upcoming shows and promoters pick a date and book an artist. We also made a booking dashboard for it. The pictures of the dashboard use made-up data.",
    helps: "Shows and bookings live on the site and in one dashboard, not in scattered messages.",
    more: "A booking dashboard for your business, under website design. Or a custom tool for a job you do by hand today. Tell us the job on a free Idea call.",
    cta: "Book an Idea call →",
  },
  process: {
    label: "How it works →",
    steps: [
      {
        name: "Talk",
        text: "We start on the free Idea call. It takes 30 minutes. We name three tasks a better website or AI could take over, with a rough price for each.",
      },
      { name: "Fixed price, in writing", text: "You see what you get and what it costs before we start." },
      {
        name: "We build or teach",
        text: "We build your site, tool or setup, or we run your session. A website goes live 7 days after you send photos and text.",
      },
      { name: "You get the Keys", text: "Every account, domain and login is in your name." },
    ],
  },
  prices: {
    label: "Prices →",
    intro: "Our prices are public. Pick a Service to see its price and what is in it.",
    currencyNote: "Prices in US dollars are for clients outside Sri Lanka. Clients in Sri Lanka see rupee prices.",
    toggleLabel: "Show prices in",
  },
  keys: {
    label: "The Keys →",
    headline: "Everything is in your name from day one.",
    body: "Your domain, hosting, accounts and logins are set up in your name. If we stop working together, you keep all of it.",
  },
  whoBuilds: {
    label: "Who builds it →",
    headline: "One person builds every project.",
    body: 'Anuda Pasandul builds every Loopstak project. We say "we" because Loopstak is a studio. It is not a big team. You deal with the person who does the work.',
    photoCaption: "Anuda Pasandul",
  },
  contact: {
    label: "Talk to us →",
    headline: "Start with a free Idea call.",
    ideaCall:
      "30 minutes, free. We name three tasks a better website or AI could take over, with a rough price for each. Book a time in your own time zone.",
    ideaCallCta: "Book an Idea call →",
    whatsapp: "Rather chat? Message us on WhatsApp.",
    whatsappCta: "Message us on WhatsApp →",
    formIntro:
      "Or write to us here. Tell us your name, how to reach you, which Service you need and a few words about it.",
    formNote:
      "This form runs on the same kind of automation we build. It replies to you at once and tells us about your message.",
    mockup:
      "Need a website? After the Idea call we can make a free one-screen design of your new homepage. You see it before you pay.",
  },
} as const;

export const SERVICES: readonly Service[] = [
  {
    slug: "website-design",
    number: "01",
    name: "Website design",
    line: "A site for your business, up to 5 pages, found on Google.",
    linkLabel: "See website design →",
    page: {
      title: "Website design for small businesses in Sri Lanka | Loopstak",
      description:
        "A site for your business, up to 5 pages, set up in your name and found on Google. Fixed price. Live 7 days after you send photos and text.",
      heroLine: "A website you own.",
      heroSub: "Up to 5 pages. Found on Google. Set up in your name.",
      whoFor: ["Owners with no website or a weak one, who need to be found and booked."],
      included: [
        "A mobile-first site, up to 5 pages",
        "A WhatsApp button and an enquiry form on every page",
        "Google Business Profile and Search Console set up or claimed",
        "Domain, hosting and every login in your name",
        "A walkthrough so you can make small changes yourself",
        "Live 7 days after you send photos and text",
      ],
      priceNote:
        "The price for your country is below. Upkeep is an optional monthly add-on that keeps your site updated and running.",
      proof: "Live sites we built: FLOST8, Rama Shala, The Edited Wild.",
      faqs: [
        { q: "How long does it take?", a: "7 days from the day you send your photos and text." },
        {
          q: "What do I need to send?",
          a: "Your logo if you have one, photos, your prices or services, and your contact details.",
        },
        {
          q: "Will I be first on Google?",
          a: "Nobody can honestly promise that. We make sure Google can find you.",
        },
        { q: "How do I pay?", a: "50% up front and 50% when you approve the live site." },
        { q: "Can you take online payments on my site?", a: "Yes, but we quote that separately." },
      ],
      contact: "Not sure yet? Book a free Idea call. After it, we can make you a free Homepage mock-up.",
    },
  },
  {
    slug: "ai-agents-automation",
    number: "02",
    name: "AI agents and automation",
    line: "Software that answers and follows up while you work.",
    linkLabel: "See AI agents →",
    page: {
      title: "AI agents and automation for small businesses in Sri Lanka | Loopstak",
      description:
        "We build and run AI agents and automations for your business. Monthly plan with up to 3 automations running. For owner-run businesses in Sri Lanka.",
      heroLine: "Software that does the follow-up.",
      heroSub: "We build and run agents and automations for your business, every month.",
      whoFor: [
        "Growing businesses buried in manual admin, who want enquiries caught and followed up without doing it by hand.",
      ],
      included: [
        "Up to 3 automations, built and running",
        "One new automation or one change each month",
        "Plain words on what each one does",
      ],
      priceNote:
        "The monthly price for your country is below. You pay AI usage fees yourself, in your own accounts.",
      proof: "The enquiry form on this site is a live demo of the kind of automation we build.",
      faqs: [
        {
          q: "What is an automation?",
          a: "A job that runs by itself. A customer messages at 11pm and a workflow replies and follows up.",
        },
        { q: "How many can run?", a: "Up to 3 at a time." },
        { q: "Who pays the AI usage fees?", a: "You do, in your own accounts. They are not in our price." },
        {
          q: "Can I change one?",
          a: "Yes. The plan covers one new automation or one change each month.",
        },
      ],
      contact: "Tell us the job you do by hand. We name the automation on a free Idea call.",
    },
  },
  {
    slug: "claude-integration",
    number: "03",
    name: "Claude integration",
    line: "We connect Claude to the tools your team already uses.",
    linkLabel: "See Claude integration →",
    page: {
      title: "Claude integration for small businesses in Sri Lanka | Loopstak",
      description:
        "We build with Claude and connect it to the tools your team already uses. A one-off job for small businesses in Sri Lanka.",
      heroLine: "Claude, connected to your tools.",
      heroSub: "A one-off job. We set Claude up for your team and link it to the tools you use.",
      whoFor: [
        "Teams that want to use Claude every day but have not set it up with their own documents and tools.",
      ],
      included: [
        "Team setup with Projects and your docs",
        "Up to 2 tool connections",
        "A 1-hour handover so your team can use it",
      ],
      priceNote: "The one-off price for your country is below. You pay for your own Claude plan.",
      proof: "The enquiry form on this site uses Claude to write a short summary for us. It never writes to you.",
      faqs: [
        {
          q: "Are you a Claude partner?",
          a: "No. We build with Claude. We are not partnered with, certified by or part of Anthropic.",
        },
        { q: "Do I need a Claude plan?", a: "Yes. You pay for your own plan, in your own account." },
        { q: "How many tools can you connect?", a: "Up to 2." },
        { q: "What happens after setup?", a: "We spend 1 hour with your team to hand it over." },
      ],
      contact: "Tell us which tools your team uses. Book a free Idea call.",
    },
  },
  {
    slug: "ai-teaching",
    number: "04",
    name: "AI teaching",
    line: "A full-day session that teaches your team to use AI in their own work.",
    linkLabel: "See AI teaching →",
    page: {
      title: "AI teaching for teams in Sri Lanka | Loopstak",
      description:
        "A full-day session that teaches your team to use AI in their own work. Up to 15 people. In Sri Lanka, or online worldwide.",
      heroLine: "Your team, using AI in their own work.",
      heroSub: "A full-day session for up to 15 people.",
      whoFor: ["Owners and teams who want to use AI day to day and want someone to show them how."],
      included: [
        "One full-day session",
        "Up to 15 people",
        "Teaching built around your team's own work",
      ],
      priceNote:
        "Priced per full day. Outside Colombo, transport is extra. Abroad, online is priced per day. In person abroad is quoted, plus travel.",
      proof: "Nothing to show here yet, so we start with a free Idea call.",
      faqs: [
        { q: "How many people can join?", a: "Up to 15." },
        { q: "How long is a session?", a: "One full day." },
        { q: "Do you teach outside Colombo?", a: "Yes. Transport outside Colombo costs extra." },
        {
          q: "Can you teach us from abroad?",
          a: "Online, yes, priced per day. In person abroad is quoted, plus travel.",
        },
      ],
      contact: "Tell us what your team does all day. We plan the session on a free Idea call.",
    },
  },
];

export const HOME_FAQ: readonly Faq[] = [
  {
    q: "What is the Idea call?",
    a: "A free 30-minute call. We name three tasks a better website or AI could take over, with a rough price for each.",
  },
  { q: "How long does a website take?", a: "It goes live 7 days after you send your photos and text." },
  {
    q: "What do I need to send for a website?",
    a: "Your logo if you have one, photos, your prices or services, and your contact details.",
  },
  {
    q: "Who owns the website and the accounts?",
    a: "You do, from day one. Domain, hosting and every login are in your name.",
  },
  { q: "Is Loopstak a big team?", a: "No. Anuda Pasandul builds every project." },
  {
    q: "Why are there two price lists?",
    a: "Rupee prices are for clients in Sri Lanka. Dollar prices are for clients outside Sri Lanka.",
  },
];

export const PRIVACY_POINTS: readonly string[] = [
  "The form collects your name, how to reach you (WhatsApp or email), which Service you chose and your message.",
  "We save each enquiry as a row in a Google Sheet.",
  "We send an alert to Anuda by Telegram and by email.",
  "Claude writes a short summary for Anuda only. It is never sent to you.",
  "Analytics (PostHog) switch on only after you click Allow. The host is in the EU. No session replays.",
  "Before you click Allow, no analytics request is made.",
  "Ask us any time to see, fix or delete what you sent.",
];
