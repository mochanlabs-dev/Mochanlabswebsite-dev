// All copy for the public site lives here so it can be edited without touching
// layout code. Text is carried over verbatim from the previous site.

export const contact = {
  email: "info@mochanlabs.com",
  whatsappNumber: "919971203567",
  whatsappUrl: "https://wa.me/919971203567",
  instagramUrl: "https://www.instagram.com/mochan_labs/reels/",
  location: "India",
  hours: "Mon – Sat: 9AM – 7PM IST",
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
  body: "Mochan Labs delivers cutting-edge IT solutions - web development, cloud services, cybersecurity, and custom software. We turn your vision into powerful digital experiences.",
  cta: "Get Free Consultation",
};

export const about = {
  tag: "About Us",
  titleLead: "Your Trusted Technology",
  titleAccent: "Partner",
  paragraphs: [
    "Mochan Labs is a leading IT solutions company committed to delivering innovative technology services that drive business growth. Founded with a passion for technology, we combine expertise with creativity to build solutions that make a real difference.",
    "Our team of experienced professionals works closely with clients to understand their unique challenges and develop tailored solutions that exceed expectations - from startups to enterprises across all industries.",
  ],
  features: [
    "Client-First Approach",
    "Agile Development",
    "Transparent Communication",
    "On-Time Delivery",
  ],
  cta: "Work With Us",
};

export const services = {
  tag: "Our Services",
  titleLead: "Comprehensive IT",
  titleAccent: "Solutions",
  intro: "We offer a full spectrum of IT services to help your business thrive in the digital age.",
  items: [
    {
      title: "Web Development",
      body: "Custom, responsive websites and web applications built with modern technologies - from landing pages to complex enterprise portals.",
      points: ["React / Next.js / Vue", "Node.js / Django / Laravel", "E-Commerce Solutions"],
    },
    {
      title: "Mobile App Development",
      body: "Native and cross-platform mobile applications for iOS and Android that deliver exceptional user experiences.",
      points: ["React Native / Flutter", "iOS & Android", "App Store Deployment"],
    },
    {
      title: "Cloud Solutions & DevOps",
      body: "Scalable cloud infrastructure, migration services, and DevOps automation to modernize your IT operations.",
      points: ["AWS / Azure / GCP", "Cloud Migration", "CI/CD Pipelines"],
    },
    {
      title: "Cybersecurity",
      body: "Protect your business with comprehensive security assessments, penetration testing, and security implementation.",
      points: ["Security Audits", "Penetration Testing", "Data Protection & Compliance"],
    },
    {
      title: "Custom Software",
      body: "Bespoke software solutions designed to solve your specific business challenges and automate workflows.",
      points: ["Business Automation", "ERP / CRM Systems", "API Integration"],
    },
    {
      title: "IT Support & Consulting",
      body: "24/7 IT support, strategic consulting, and managed services to keep your business running smoothly.",
      points: ["24/7 Technical Support", "IT Strategy Planning", "Infrastructure Management"],
    },
    {
      title: "ERP & CRM Development",
      body: "Enterprise resource planning and customer relationship management systems tailored to your business needs.",
      points: ["ERP Development", "CRM Development", "Custom Modules & Integration"],
    },
    {
      title: "E-commerce & Logistics",
      body: "Complete e-commerce platforms with real-time order tracking and logistics management systems.",
      points: ["E-commerce Solutions", "Logistics & Tracking Systems", "Real-Time Order Tracking"],
    },
    {
      title: "API Integration & Automation",
      body: "Seamless integration of third-party services and WhatsApp API for enhanced customer communication.",
      points: ["WhatsApp API Integration", "Third-Party API Integration", "Workflow Automation"],
    },
    {
      title: "Enterprise Web Applications",
      body: "Robust, scalable enterprise-grade web applications designed for high performance and security.",
      points: ["Enterprise Web Apps", "Cloud Migration", "Microservices Architecture"],
    },
    {
      title: "AI & Automation Solutions",
      body: "Leverage artificial intelligence and automation to streamline operations and enhance productivity.",
      points: ["AI Solutions", "Custom Automation", "Machine Learning Integration"],
    },
  ],
};

// Case studies. Facts come from the products' own documentation; screenshots
// use demo data. Steps are shown as sticky steps with a screenshot each.
export const work = {
  tag: "Our Work",
  titleLead: "Software that runs",
  titleAccent: "real operations",
  intro: "Two products we designed, built and support end to end.",
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
  tag: "Why Choose Us",
  titleLead: "What Makes",
  titleAccent: "Mochan Labs",
  titleTrail: "Different",
  intro: "We don't just build technology - we build partnerships that drive long-term success.",
  items: [
    { title: "Expert Team", body: "Our certified professionals bring years of experience across multiple domains and the latest technologies." },
    { title: "Cost Effective", body: "Premium quality solutions at competitive prices. Maximum ROI for your technology investment." },
    { title: "Fast Delivery", body: "Agile methodology ensures rapid development and on-time delivery without compromising quality." },
    { title: "Ongoing Support", body: "We're with you beyond launch. Continuous maintenance, updates, and 24/7 technical support." },
    { title: "Scalable Solutions", body: "Future-proof architecture that grows with your business. No limits, no compromises." },
    { title: "Trusted Partner", body: "NDA-compliant, transparent processes, and a proven track record of client satisfaction." },
  ],
};

export const process = {
  tag: "How We Work",
  titleLead: "Our Simple",
  titleAccent: "Process",
  intro: "A streamlined process designed to deliver results efficiently and effectively.",
  steps: [
    { title: "Discovery", body: "We listen, analyze, and understand your business goals, challenges, and requirements in depth." },
    { title: "Planning", body: "Strategic roadmap, technology selection, and detailed project planning with clear timelines." },
    { title: "Development", body: "Agile development with regular updates, code reviews, and thorough quality assurance testing." },
    { title: "Launch & Support", body: "Seamless deployment, user training, and ongoing support to ensure long-term success." },
  ],
};

export const contactSection = {
  tag: "Contact Us",
  titleLead: "Let's Build Something",
  titleAccent: "Amazing",
  intro: "Ready to transform your business? Reach out to us through any channel below.",
  formTitle: "Send Us a Message",
  serviceOptions: [
    "Web Development",
    "Mobile App Development",
    "Cloud Solutions",
    "Cybersecurity",
    "Custom Software",
    "IT Support & Consulting",
    "Other",
  ],
};

export const footer = {
  blurb: "Transforming businesses through innovative technology solutions. Your trusted IT partner for digital success and growth.",
  services: ["Web Development", "Mobile Apps", "Cloud Solutions", "Cybersecurity", "Custom Software", "IT Consulting"],
  company: [
    { label: "About Us", href: "#about" },
    { label: "Our Work", href: "/work" },
    { label: "Why Choose Us", href: "#why-us" },
    { label: "Our Process", href: "#process" },
    { label: "Contact", href: "#contact" },
  ],
  cta: "Start a Project",
  copyright: "© 2026 Mochan Labs. All rights reserved.",
  madeWith: "Built with ♥ for Innovation",
};

// EmailJS IDs (public by design — the same ones the previous site used).
export const emailjs = {
  serviceId: "service_9wjhtlg",
  templateId: "template_7ahq6of",
  autoReplyTemplateId: "template_9vjd9ci",
  publicKey: "2t6clZCTnmXysZnb6",
};
