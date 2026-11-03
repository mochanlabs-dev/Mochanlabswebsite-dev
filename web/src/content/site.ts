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

// Case studies. Facts come from the products' own documentation; screenshots
// use demo data. Steps are shown as sticky steps with a screenshot each.
export const work = {
  tag: "our work",
  titleLead: "Some of our",
  titleAccent: "products",
  intro: "A selection of what we have built and still support, from first draft to everyday use.",
  weighbridge: {
    name: "Weighbridge",
    kicker: "Weighbridge management software",
    summary:
      "Weigh vehicles, bill sales and purchases, print receipts, and keep Tally and the government portal in step - from one app on the weighbridge computer.",
    tags: ["Windows desktop app", "SQL Server", "Tally integration", "MDTSS govt portal", "RFID & IP cameras", "Multi-computer"],
    docsUrl: "https://mochanlabs-dev.github.io/app-docs/weighbridge/",
    steps: [
      {
        title: "Weigh",
        body: "Live weight straight from the scale. Vehicles are recognised by RFID and photographed by IP cameras - first weight on entry, second on exit.",
        image: "/projects/weighbridge/token-entry.webp",
        alt: "Weighbridge token page recording a vehicle's first weight",
      },
      {
        title: "Bill",
        body: "The weights decide whether it's a sale or a purchase. Party rates, GST, freight and round-off fill in by themselves.",
        image: "/projects/weighbridge/sale-billing.webp",
        alt: "Completing a sale with line items, GST and charges",
      },
      {
        title: "Print",
        body: "Weight slips, inward tokens and GST tax invoices - on A4 or straight to a thermal receipt printer.",
        image: "/projects/weighbridge/slip-sale.webp",
        alt: "Weight slip with two copies on one sheet",
      },
      {
        title: "Sync",
        body: "Every sale and purchase posts to Tally, and every weighment is reported to the Uttarakhand MDTSS portal - retried automatically if either is offline.",
        image: "/projects/weighbridge/tally.webp",
        alt: "Tally connection setup",
      },
    ],
  },
  odts: {
    name: "ODTS",
    fullName: "Order Dispatch & Tracking System",
    kicker: "Dealer order and dispatch platform",
    summary:
      "Dealers place orders, dispatchers accept and dispatch them, and the office sees every order's status as it changes - one web app for the whole dealer network.",
    roles: ["Dealer", "Dispatcher", "Office", "Admin", "Sales Officer"],
    features: [
      "Orders checked against each dealer's credit limit, with alerts as limits run low",
      "Dispatch with vehicle, driver contact, bilty number and receipt upload",
      "Orders put on hold with a reason that every role can see",
      "Role-based access, live status updates and Excel exports",
    ],
    tags: ["React", "Node.js", "PostgreSQL", "Supabase"],
  },
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
