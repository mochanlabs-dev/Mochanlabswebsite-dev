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
  { label: "Why Us", href: "#why-us" },
  { label: "Process", href: "#process" },
  { label: "Contact", href: "#contact" },
];

export const hero = {
  badge: "Innovative IT Solutions",
  titleLead: "Transforming Ideas Into",
  titleAccent: "Digital Reality",
  body: "Mochan Labs delivers cutting-edge IT solutions — web development, cloud services, cybersecurity, and custom software. We turn your vision into powerful digital experiences.",
  cta: "Get Free Consultation",
  stats: [
    { value: 15, suffix: "+", label: "Projects Delivered" },
    { value: 10, suffix: "+", label: "Happy Clients" },
    { value: 5, suffix: "+", label: "Years Experience" },
  ],
};

// Points shown on the hero globe. Add entries here as Mochan Labs expands
// to new markets — [latitude, longitude].
export const globeMarkers: { location: [number, number]; size: number }[] = [
  { location: [22.5, 79], size: 0.09 },
];

export const about = {
  tag: "About Us",
  titleLead: "Your Trusted Technology",
  titleAccent: "Partner",
  paragraphs: [
    "Mochan Labs is a leading IT solutions company committed to delivering innovative technology services that drive business growth. Founded with a passion for technology, we combine expertise with creativity to build solutions that make a real difference.",
    "Our team of experienced professionals works closely with clients to understand their unique challenges and develop tailored solutions that exceed expectations — from startups to enterprises across all industries.",
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
      body: "Custom, responsive websites and web applications built with modern technologies — from landing pages to complex enterprise portals.",
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

export const whyUs = {
  tag: "Why Choose Us",
  titleLead: "What Makes",
  titleAccent: "Mochan Labs",
  titleTrail: "Different",
  intro: "We don't just build technology — we build partnerships that drive long-term success.",
  items: [
    { title: "Expert Team", body: "Our certified professionals bring years of experience across multiple domains and the latest technologies." },
    { title: "Cost Effective", body: "Premium quality solutions at competitive prices. Maximum ROI for your technology investment." },
    { title: "Fast Delivery", body: "Agile methodology ensures rapid development and on-time delivery without compromising quality." },
    { title: "Ongoing Support", body: "We're with you beyond launch. Continuous maintenance, updates, and 24/7 technical support." },
    { title: "Scalable Solutions", body: "Future-proof architecture that grows with your business. No limits, no compromises." },
    { title: "Trusted Partner", body: "NDA-compliant, transparent processes, and a proven track record of client satisfaction." },
  ],
};

export const tech = {
  tag: "Technologies",
  titleLead: "Our",
  titleAccent: "Tech Stack",
  intro: "We work with the latest and most reliable technologies to deliver cutting-edge solutions.",
  items: [
    "React", "Node.js", "Python", "AWS", "Docker", "Angular", "Vue.js", "PHP",
    "MongoDB", "PostgreSQL", "Java", "Android", "Azure", "Cloud Computing",
    "Flutter", "React Native", "Express.js", "FastAPI", "Spring Boot", "Terraform",
    "CI/CD Pipelines", "Generative AI", "AI Chatbots", "AI Automation",
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

export const manifesto = "Transforming businesses through innovative technology solutions.";

export const footer = {
  blurb: "Transforming businesses through innovative technology solutions. Your trusted IT partner for digital success and growth.",
  services: ["Web Development", "Mobile Apps", "Cloud Solutions", "Cybersecurity", "Custom Software", "IT Consulting"],
  company: [
    { label: "About Us", href: "#about" },
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
