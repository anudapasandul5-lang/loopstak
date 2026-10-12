# Froztech Website: Rebuild Brief for Claude Code

Source: https://www.froztech.com/ (home page, captured 2026-10-12)
Purpose: give Claude Code the content, structure and style cues to rebuild or redesign this site.

## 1. What the company is

Froztech is a digital agency. It builds websites, software and cloud/DevOps systems for businesses. Offices are in the USA (Miami, Lake Park) and Colombia (Bogota).

Tagline: "Our agency develops Websites, Software & Cloud DevOps."

Three trust claims shown under the hero:

- Creative solutions to give your results.
- Commitment to get 100% client satisfaction.
- 24/7 availability to answer your questions.

## 2. Tech and style notes (what I could verify)

- Body font: "Favorit" (a paid typeface). Use a close free substitute, such as Inter or DM Sans, unless you have the license.
- Look: dark, near-black background, white large headings, big editorial serif-style statement text for the mission block, a red wordmark logo "FROZTECH" in the header.
- A looping hero video/reel ("IMPERO 2020 Reel") with a Play button.
- A 3D wireframe/molecule graphic sits behind the mission text.
- Section labels use an arrow, e.g. "HOW WE THINK →", "HOW WE OPERATE", "OUR AGENCY DEVELOPS →".
- Services are shown as numbered cards (01, 02, 03, 04), each with two images (likely a hover swap) and a "CONTACT US →" link.
- Menu is a full-screen overlay (has a "Close Menu" button).
- Language switch to Spanish at /es/landing/.
- Not verified: exact hex colors, spacing, animation library, CMS. The site looks like WordPress, but that is a guess. Ask before assuming.

## 3. Site map

Top nav: ABOUT, PORTFOLIO, CONTACT, SERVICES (dropdown), Spanish flag toggle.

| Group | Page | URL |
|---|---|---|
| Main | About | /about/ |
| Main | Portfolio | /portfolio/ |
| Main | Contact | /contact/ |
| Main | Blog | /blog/ |
| Development | Software development | /software-development/ |
| Development | Web development | /website-design-miami/ |
| Development | Website maintenance | /website-maintenance/ |
| Development | Functional tests | /functional-tests/ |
| SEO | SEO Miami | /seo-miami/ |
| SEO | SEO Austin | /seo-austin/ |
| Cloud Services | Cloud DevOps services | /cloud-devops-services/ |
| Cloud Services | Application modernization services | /application-modernization-services/ |
| Cloud Services | AWS consulting | /aws-consulting/ |
| Cloud Services | Cloud management | /cloud-management/ |
| Cloud Services | Non-functional tests | /non-functional-test/ |
| Case studies | Technogym | /technogym/ |
| Case studies | Taquilla Live | /taquillalive/ |
| Spanish | Landing | /es/landing/ |

All paths are on froztech.com.

## 4. Home page, section by section

### 4.1 Header
Logo "Froztech" (left). Nav: ABOUT, PORTFOLIO, CONTACT, SERVICES, language flag. Menu overlay lists Home, Developments, SEO, Cloud Services, Blog.

### 4.2 Hero
- Small label: "OUR AGENCY DEVELOPS →"
- Headline: "Websites, Software & Cloud DevOps"
- Scroll arrow.
- Reel video with Play button.
- Three trust lines (see section 1), shown as a repeating ticker.

### 4.3 How we think
- Label: "HOW WE THINK →"
- Statement (large type): "Our mission is to **Help** businesses lead the charts in their industries. We want to bring a big smile on our clients' faces by making them visible among their top competitors, and leave no stones unturned in doing so. One thing that helps us the most in our mission is the perfect trifecta of passion, dedication, and **lots of caffeine.**"
- The words "Help" and "lots of caffeine." are highlighted (a red circle is drawn around "Help").

### 4.4 How we operate (four numbered service cards)

1. **Cloud Services.** Online data storage and backup solutions, web-based e-mail services, database processing, managed technical support services. CTA: Contact us → /contact/
2. **Software & App Development.** Developers take your ideas to the next level, from automation to artificial intelligence. Complete website solutions include web translation services so you can reach your audience. CTA: Contact us.
3. **Website Design & Development.** Bring your business online with professional web design by expert web developers in Miami, Austin, and nationwide in the US. Designs for startups, corporations, and non-profits. CTA: Contact us → /contact/
4. **SEO.** Helps businesses rank on top of organic search engines like Google and Bing, so you get ready-to-convert traffic for free. A-Z SEO solutions: link building, local SEO, technical SEO, advanced SEO consultation, keyword research, and more. CTA: Contact us → /contact/

### 4.5 We're pretty good at what we do
- "Unparalleled prices for exceptional quality work."
- "Transparency with the budget, turnaround time, and expected results."
- Sub-heading: "We're based in USA and Colombia →"
- "Foolproof planning, & meticulous Immaculate Designs execution."
- One brand image.

### 4.6 Currently we're working in (portfolio strip)
The home page shows these in Spanish. English translations are mine:

1. Design and development of custom software for Rémy Cointreau.
2. Custom payment-processing solution for Technogym & Grupo Aval Bank. (links to /technogym/)
3. Solid-architecture website for Taquilla Live. (links to /taquillalive/)
4. (Number 04 is missing on the live page.)
5. Redesign of the promotions website for Grupo VLR.
6. SEO optimization of the First Step Subrogacy website.
7. Local SEO optimization of the Refriplast website for Colombia.
8. WordPress website design and development for Jacqueline Pinto.
9. Local and national SEO optimization for RMG Staffing Agency in Miami.

### 4.7 Contact CTA band
Heading "Contact us" with button "Go to the contact page" and the line "GET A QUOTE FOR YOUR PROJECT". Links to /contact/.

### 4.8 Footer
- Big line: "Got a Project in mind? Contact us."
- **Miami:** 78 SW 7th St, Miami, FL 33130, USA. contact@froztech.com, +1 (786) 448-6235
- **Colombia:** Cl. 24C #26-50, Piso 4, Bogota, Colombia. contact@froztech.com
- **Lake Park:** 1251 10th St, Lake Park, FL 33403, USA. contact@froztech.com, +1 (786) 448-6235
- **Follow us:** Instagram (@froztech_us), Facebook (FROZTECHUS), LinkedIn (company/froztech)
- Partner logo.

## 5. Known gaps and issues to fix in a rebuild

- The home page portfolio text is in Spanish while the rest is English. Pick one language per page, and keep the Spanish version under /es/.
- Portfolio item 04 is missing.
- The "Software & App Development" card (02) has a "Contact us" link with no destination. The other three cards link to /contact/.
- Typos in the live copy: "Our mission is to businesses lead the charts" (Help is added by an animation; make sure it exists in plain HTML for search engines and screen readers), "GET100%" and "AVAILABILITYTO" (missing spaces).
- Portfolio links on items 01, 05 to 09 have no destination.
- The ticker and menu overlay need keyboard and screen-reader support, plus a reduced-motion option.
- Reel video needs captions or a text alternative.

## 6. Suggested prompt for Claude Code

> Rebuild the Froztech home page from this brief using Next.js and Tailwind. Dark theme, large editorial type, numbered service cards with hover image swap, full-screen menu overlay, a sticky header, and EN/ES routing. Keep all copy as written in section 4 (fix the typos in section 5). Use placeholder images and a placeholder video. Make it responsive, keyboard accessible, and fast. Do not invent client logos, testimonials or statistics. Tell me what you skipped or could not verify.

## 7. Inner pages (content summary)

All pages share the same header, footer, "Currently we're working in" strip (Spanish) and a "Got a project in mind? Contact us." footer. Copy below is shortened, not word for word. The live site has typos and awkward English, so rewrite lightly when rebuilding.

### About (/about/)
- Four numbered service groups: 01 Cloud Services (Cloud DevOps, application modernization, cloud management). 02 AWS Services (migration and transfer, management, application integration). 03 Website Services (website design, software development, functional tests, non-functional tests, app development). 04 Search Engine Optimization (technical, on-page, off-page, local SEO).
- Blurb: "We are an IT company, a leader in the sector, specializing in Cloud Computing, DevOps, Software Development, SEO & Website Design. We have worked with several important clients in the United States and Colombia."
- **Warning:** the live About page also contains a hidden block of unrelated German text about a prescription drug mixed with alcohol. It is not Froztech content. It looks like injected spam from a hack or bad plugin. I left it out on purpose. Tell the site owner.

### Contact (/contact/)
Headline "We're based in Miami and Bogota, Colombia". Same three offices and details as the footer in section 4.8. No form text was readable; check the live page for form fields.

### Portfolio (/portfolio/)
Opens with Remy Cointreau (alcoholic beverage company). Only the first entry was readable as text; the rest are image tiles. The list in 4.6 is the same set of clients.

### Software development (/software-development/)
- Headline: "A network of developers at your service."
- Pitch: custom software using current technologies, for household names and small businesses.
- Sub-section "Budget Control": uses Earned Value Management (EVM) to watch cost and performance daily, find variances, fix root causes. Testing and QA called a priority.

### Web development (/website-design-miami/)
- "Become the leader in the industry": claims to be among the top Miami web design companies.
- Pitch: SEO-friendly design that works as a 24/7 salesperson and brings qualified leads. Different packages for different budgets.

### Website maintenance (/website-maintenance/)
- Ongoing support so the site stays fast, fresh and secure. Warns that an unmaintained site can get hacked, run slowly or lose data.
- Process starts with "Day 1 Initial call".
- Custom Maintenance package: content changes, critical error fixes, content and plugin updates, monthly meetings with web experts, bi-weekly reports.

### Functional tests (/functional-tests/)
- "Functional Tests Design": manual and automated integration testing, test design, planning, estimation, execution.
- "Expense Control": EVM again; white-box and black-box tests for quality assurance.

### SEO Miami (/seo-miami/)
- "Miami SEO services: what is included?" Numbered blocks, for example 01 Miami Local SEO and 02 Local SEO in Miami, FL (geo-targeted searches such as "X services near me"). Mentions bilingual SEO elsewhere on the blog.

### SEO Austin (/seo-austin/)
- "SEO Austin, Texas company". Strategy list: 01 Make your website stand out. 02 Create on-page and off-page SEO strategies. 03 Improve your keyword strategy. Local SEO section "Austin Local SEO: Get Found Nearby".

### Cloud DevOps services (/cloud-devops-services/)
- "Our cloud services": 01 Cloud Migration. 02 Cloud Consulting. 03 Good Cloud Architecture and Design. 04 Cloud Services (PaaS, SaaS, IaaS, private cloud DevOps, white-label cloud DevOps).
- "Best Practices": ten recommended practices (collaboration culture, customer focus, agile, CI/CD, DevOps metrics and performance testing, right tools, microservices, security, infrastructure investment, continuous learning).

### Application modernization (/application-modernization-services/)
- Upgrading older software (language, platform, architecture, frameworks) to extend its life and speed up delivery.
- "01 Modern Application Development": cloud-native, microservices, managed databases, AI, DevOps, monitoring, CI/CD, infrastructure as code, threat detection.
- Block "Looking for a Cloud DevOps company?" and a "Why Froztech?" list (creative solutions and similar claims).

### AWS consulting (/aws-consulting/)
- "Your trusted AWS consultant": claims AWS Premier Consulting and AWS-certified experts (architecture, sysops, DevOps, ITSM). Verify the "Premier" claim before reusing it.
- "We offer configuration management of": 01 Hybrid Cloud Environments. 02 Hybrid Cloud Management.
- "Why choose us?": 01 Experience. 02 Transparency (clear architecture and deliverables). More points follow on the live page.

### Cloud management (/cloud-management/)
- "Expense Control": EVM applied to AWS cost management.
- "Activities in cloud development": 01 Direct Connection. 02 Backup as a Service. 03 Storage.

### Non-functional tests (/non-functional-test/)
- Quality certification of how software behaves: load, performance, support, risk review. Notes that usability, reliability and portability testing (functional) come first.

### Blog (/blog/)
Title "Technology Insights". Paginated, 9 pages, 6 posts per page. First page posts:
1. Driving Austin Growth with Miami Tech SEO Austin Insights
2. Bilingual SEO in Miami: 5 Essential Tips To Grow Your Business
3. Level Up Your Business: A Powerful SEO Partnership for Explosive Growth in Austin (mentions SEOReseller partnership)
4. How Froztech Delivered a Global Fitness Leader's Critical Web Solution in Miami: A Technogym Case Study
5. Key Strategies to Dominate SEO in Miami in 2025
6. SEO for Your Company Without Losing Your Mind in 2025

Each post is a title, a short excerpt ending in "[...]" and a link to the full post. Full post pages were not read.

### Case study: Technogym (/technogym/)
- Hero: "Equipment and digital technologies for fitness". Tags: Website / payment process.
- "Who are they?": publicly traded fitness equipment company (TGYM). Claims 50 million users, 80,000 wellness centers, 500,000 homes, Olympic supplier, founded 1983.
- "Why Froztech?": Technogym needed development for a partnership with Grupo Aval, the largest bank group in Colombia (payment processing). Rest of the page was cut off in my read.

### Case study: TaquillaLive (/taquillalive/)
- Hero: "Ticketing platform". Tags: Web design / cloud architecture / AWS / SEO.
- "Who are they?": ticketing company for Latin America; works with Live Nation and large events; claims 20,000 tickets sold per day and 3D stadium maps. Rest of the page was cut off.

## 8. What this brief does NOT include

- Full text of the last parts of some long pages (marked "more points follow"), full blog posts, the Spanish /es/landing/ page, and any contact form fields.
- Images, the reel video and logo files. Download them from the live site only if you have rights to them.
- Client claims (users, tickets, "Premier" partner status) are the company's own marketing. Do not present them as verified facts.

For visual rules, see the separate file `froztech-design.md`.
