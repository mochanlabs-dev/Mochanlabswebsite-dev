// All copy for the public site lives here so it can be edited without touching
// layout code. Text is carried over verbatim from the previous site.

export const contact = {
  email: "info@mochanlabs.com",
  whatsappNumber: "919971203567",
  whatsappUrl: "https://wa.me/919971203567",
  instagramUrl: "https://www.instagram.com/mochan_labs/reels/",
  location: "India",
  hours: "Mon - Sat: 9AM - 7PM IST",
};

export const nav = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Services", href: "#services" },
  { label: "Work", href: "/work" },
  { label: "Why Us", href: "#why-us" },
  { label: "Process", href: "#process" },
  { label: "Contact", href: "#contact" },
];

export const hero = {
  badge: "Innovative IT Solutions",
  titleLead: "Transforming Ideas Into",
  titleAccent: "Digital Reality",
  body: "Websites, apps, AI and automation, built around the way your business actually works.",
};

export const about = {
  tag: "about us",
  titleLead: "Your Trusted Technology",
  titleAccent: "Partner",
  lead: "We help businesses turn everyday operational problems into simpler, faster ways of working, using AI, automation and software built around how you run.",
  blocks: [
    { title: "What we do", body: "We automate manual work, build the software your processes need, and help you scale." },
    { title: "What we believe", body: "Technology should solve real problems, not add complexity." },
  ],
};

// The line that darkens word by word between the hero and About.
export const statement = "More Than Technology. A Partner in Your Business Transformation.";

export const services = {
  tag: "our services",
  titleLead: "Comprehensive IT",
  titleAccent: "Solutions",
  intro: "Everything you need, from a first website to fully automated operations.",
  items: [
    { title: "Web development", body: "Fast, responsive websites and web apps, from landing pages to full business portals." },
    { title: "Mobile app development", body: "Android and iOS apps, native or cross-platform, built to feel simple." },
    { title: "E-commerce & logistics", body: "Online stores and order-tracking systems that keep stock and deliveries in view." },
    { title: "Custom software, ERP & CRM", body: "Software built around your processes, from a single tool to a full ERP or CRM." },
    { title: "Process optimisation", body: "We find where your team loses time and remove those steps." },
    { title: "AI bots", body: "Bots on WhatsApp and your website that answer customers in seconds, day and night." },
    { title: "AI employees", body: "Give AI a job, such as replies, reminders, invoices or reports, and it does it every day." },
    { title: "Integration & automation", body: "Connect your tools, WhatsApp and third-party APIs so work moves on its own." },
    { title: "Cloud & DevOps", body: "Cloud setup, migration and automated deployments that stay reliable as you grow." },
    { title: "Cybersecurity", body: "Security reviews, testing and fixes to keep your data and customers safe." },
    { title: "IT support & consulting", body: "Hands-on IT help and planning, from day-to-day support to long-term strategy." },
  ],
};

// The Work page: a short list of products, each with a demo video.
export const work = {
  tag: "our work",
  titleLead: "Some of our",
  titleAccent: "products",
  intro: "Two products we built and still support. Press play to see each one at work.",
  items: [
    {
      slug: "weighbridge",
      kicker: "weighbridge management software",
      name: "Weighbridge",
      summary: "Weigh vehicles, bill sales and purchases, print slips, and keep Tally and the government portal in step, all from one app.",
      points: ["Live weight straight from the scale", "Billed before the truck leaves", "Tally and MDTSS portal sync built in"],
      tags: ["Windows desktop app", "Tally", "MDTSS portal", "RFID & cameras"],
      video: "/video/products/weighbridge.mp4",
      poster: "/video/products/weighbridge-poster.jpg",
      length: "1:46",
      docsUrl: "https://mochanlabs-dev.github.io/app-docs/weighbridge/",
    },
    {
      slug: "odts",
      kicker: "dealer order & dispatch platform",
      name: "ODTS",
      summary: "Dealers place orders, dispatchers ship them, and the office sees every order's status live, in one web app.",
      points: ["Orders checked against each dealer's credit limit", "Dispatch with vehicle, driver and a receipt photo", "A dashboard for every role"],
      tags: ["Web app", "Role-based access", "Excel exports", "Daily backups"],
      video: "/video/products/odts.mp4",
      poster: "/video/products/odts-poster.jpg",
      length: "0:30",
    },
  ],
};

export const whyUs = {
  tag: "why choose us",
  titleLead: "What Makes",
  titleAccent: "Mochan Labs",
  titleTrail: "Different",
  intro: "Why teams choose us, and stay.",
  items: [
    { title: "Expert team", body: "Experienced engineers across web, mobile, cloud, AI and security." },
    { title: "Cost effective", body: "Clear pricing and no over-engineering, so you pay only for what you need." },
    { title: "Fast delivery", body: "Small, regular releases keep every project on schedule." },
    { title: "Ongoing support", body: "We stay after launch with updates, fixes and help when you need it." },
    { title: "Scalable solutions", body: "Built to grow with your business, so you never have to start over." },
    { title: "Trusted partner", body: "NDA-friendly, transparent about scope and cost, and easy to reach." },
  ],
};

export const process = {
  tag: "how we work",
  titleLead: "Our Simple",
  titleAccent: "Process",
  intro: "Four steps from first call to launch.",
  steps: [
    { title: "Discovery", body: "We learn your goals, your challenges and how work really flows." },
    { title: "Planning", body: "A clear roadmap, the right technology and realistic timelines." },
    { title: "Development", body: "Regular updates and thorough testing as we build." },
    { title: "Launch & support", body: "Smooth rollout, training and help after go-live." },
  ],
};

export const contactSection = {
  tag: "contact us",
  titleLead: "Let's Build Something",
  titleAccent: "Amazing",
  intro: "Tell us what you need. We usually reply within a day.",
  formTitle: "Send us a message",
  serviceOptions: [
    "Web development",
    "Mobile apps",
    "Custom software, ERP & CRM",
    "AI bots & automation",
    "Process optimisation",
    "Cloud & DevOps",
    "Cybersecurity",
    "IT support & consulting",
    "Other",
  ],
};

export const footer = {
  blurb: "IT solutions, AI and automation for growing businesses.",
  company: [
    { label: "About", href: "#about" },
    { label: "Our work", href: "/work" },
    { label: "Why us", href: "#why-us" },
    { label: "Process", href: "#process" },
    { label: "Contact", href: "#contact" },
  ],
  // The one "start a project" button on the site lives in the top bar.
  cta: "Start a project",
  copyright: "© 2026 Mochan Labs. All rights reserved.",
  madeWith: "Built with ♥ for innovation",
};

// EmailJS IDs (public by design - the same ones the previous site used).
export const emailjs = {
  serviceId: "service_9wjhtlg",
  templateId: "template_7ahq6of",
  autoReplyTemplateId: "template_9vjd9ci",
  publicKey: "2t6clZCTnmXysZnb6",
};
