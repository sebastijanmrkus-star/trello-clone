export const TEMPLATE_CATEGORIES = [
  { slug: "popular", name: "Popular" },
  { slug: "small-business", name: "Small business" },
  { slug: "design", name: "Design" },
  { slug: "education", name: "Education" },
  { slug: "engineering-it", name: "Engineering-IT" },
  { slug: "marketing", name: "Marketing" },
  { slug: "human-resources", name: "Human Resources" },
  { slug: "operations", name: "Operations" },
  { slug: "crm", name: "CRM" },
] as const;

export type CategorySlug = (typeof TEMPLATE_CATEGORIES)[number]["slug"];

export type Template = {
  id: string;
  title: string;
  description: string;
  category: Exclude<CategorySlug, "popular">;
  popular?: boolean;
  background: string;
  lists: { title: string; cards: string[] }[];
};

export const BACKGROUNDS = [
  "#0079bf",
  "#d29034",
  "#519839",
  "#b04632",
  "#89609e",
  "#cd5a91",
  "#00aecc",
  "#838c91",
  "linear-gradient(135deg, #0c66e4 0%, #37b4c3 100%)",
  "linear-gradient(135deg, #f99cdb 0%, #f7b84b 50%, #8f3f97 100%)",
  "linear-gradient(135deg, #1d2125 0%, #c9372c 55%, #1d2125 100%)",
  "linear-gradient(135deg, #172b4d 0%, #4c6b9a 100%)",
  "linear-gradient(135deg, #6e5dc6 0%, #e774bb 100%)",
  "linear-gradient(135deg, #1f845a 0%, #94c748 100%)",
];

const G = {
  blue: "linear-gradient(135deg, #0c66e4 0%, #37b4c3 100%)",
  sunset: "linear-gradient(135deg, #f99cdb 0%, #f7b84b 50%, #8f3f97 100%)",
  ember: "linear-gradient(135deg, #1d2125 0%, #c9372c 55%, #1d2125 100%)",
  night: "linear-gradient(135deg, #172b4d 0%, #4c6b9a 100%)",
  violet: "linear-gradient(135deg, #6e5dc6 0%, #e774bb 100%)",
  green: "linear-gradient(135deg, #1f845a 0%, #94c748 100%)",
  orange: "linear-gradient(135deg, #e56910 0%, #f5cd47 100%)",
  teal: "linear-gradient(135deg, #206a83 0%, #6cc3e0 100%)",
};

export const TEMPLATES: Template[] = [
  // Small business
  {
    id: "small-business-crm-lite",
    title: "Small Business Operations",
    description: "Track orders, suppliers and day-to-day tasks for a small shop.",
    category: "small-business",
    popular: true,
    background: G.orange,
    lists: [
      { title: "New orders", cards: ["Order #1001", "Order #1002"] },
      { title: "In progress", cards: ["Pack shipment for Order #998"] },
      { title: "Suppliers", cards: ["Reorder packaging", "Confirm delivery dates"] },
      { title: "Done", cards: [] },
    ],
  },
  {
    id: "small-business-bookkeeping",
    title: "Bookkeeping Tracker",
    description: "Keep invoices, expenses and tax deadlines in one place.",
    category: "small-business",
    background: G.green,
    lists: [
      { title: "Invoices to send", cards: ["Invoice client A", "Invoice client B"] },
      { title: "Awaiting payment", cards: [] },
      { title: "Expenses to file", cards: ["Office supplies receipt"] },
      { title: "Tax deadlines", cards: ["Quarterly VAT return"] },
      { title: "Paid / Filed", cards: [] },
    ],
  },
  {
    id: "small-business-launch",
    title: "Business Launch Checklist",
    description: "Everything you need to open your doors.",
    category: "small-business",
    background: G.teal,
    lists: [
      { title: "Legal", cards: ["Register business", "Open bank account"] },
      { title: "Branding", cards: ["Logo", "Website domain"] },
      { title: "Launch", cards: ["Soft opening", "Announce on social media"] },
      { title: "Done", cards: [] },
    ],
  },

  // Design
  {
    id: "design-sprint",
    title: "Design Sprint",
    description: "Run a five-day design sprint from mapping to testing.",
    category: "design",
    popular: true,
    background: G.violet,
    lists: [
      { title: "Map", cards: ["Define long-term goal", "Map the challenge"] },
      { title: "Sketch", cards: ["Lightning demos", "Crazy 8s"] },
      { title: "Decide", cards: ["Vote on solutions", "Storyboard"] },
      { title: "Prototype", cards: [] },
      { title: "Test", cards: ["Recruit 5 users", "Run interviews"] },
    ],
  },
  {
    id: "design-system",
    title: "Design System",
    description: "Plan and ship the components of your design system.",
    category: "design",
    background: G.night,
    lists: [
      { title: "Foundations", cards: ["Color tokens", "Typography scale", "Spacing"] },
      { title: "Components", cards: ["Button", "Input", "Modal"] },
      { title: "In review", cards: [] },
      { title: "Published", cards: [] },
    ],
  },
  {
    id: "design-requests",
    title: "Design Requests",
    description: "Intake and triage design work from other teams.",
    category: "design",
    background: G.sunset,
    lists: [
      { title: "Requests", cards: ["Landing page hero", "Social banner"] },
      { title: "Brief approved", cards: [] },
      { title: "In design", cards: [] },
      { title: "Feedback", cards: [] },
      { title: "Delivered", cards: [] },
    ],
  },

  // Education
  {
    id: "education-course-planner",
    title: "Course Planner",
    description: "Organize lessons, assignments and exams for a semester.",
    category: "education",
    background: G.blue,
    lists: [
      { title: "Syllabus", cards: ["Week 1: Introduction", "Week 2: Fundamentals"] },
      { title: "Assignments", cards: ["Essay 1", "Problem set 1"] },
      { title: "Exams", cards: ["Midterm", "Final"] },
      { title: "Completed", cards: [] },
    ],
  },
  {
    id: "education-study-plan",
    title: "Student Study Plan",
    description: "Stay on top of classes, homework and revision.",
    category: "education",
    popular: true,
    background: G.green,
    lists: [
      { title: "To study", cards: ["Chapter 3 reading", "Flashcards: vocabulary"] },
      { title: "Homework", cards: ["Math worksheet"] },
      { title: "Doing", cards: [] },
      { title: "Done", cards: [] },
    ],
  },
  {
    id: "education-thesis",
    title: "Thesis Tracker",
    description: "Break a thesis into research, writing and review phases.",
    category: "education",
    background: G.night,
    lists: [
      { title: "Research", cards: ["Literature review", "Collect sources"] },
      { title: "Writing", cards: ["Introduction", "Methodology", "Results"] },
      { title: "Supervisor review", cards: [] },
      { title: "Final", cards: [] },
    ],
  },

  // Engineering-IT
  {
    id: "engineering-kanban",
    title: "Kanban Template",
    description: "Classic software kanban from backlog to done.",
    category: "engineering-it",
    popular: true,
    background: G.blue,
    lists: [
      { title: "Backlog", cards: ["Set up CI", "Write API docs"] },
      { title: "To do", cards: ["Implement login"] },
      { title: "In progress", cards: [] },
      { title: "Code review", cards: [] },
      { title: "Done", cards: [] },
    ],
  },
  {
    id: "engineering-sprint",
    title: "Agile Sprint Board",
    description: "Plan sprints, track stories and run retros.",
    category: "engineering-it",
    background: G.ember,
    lists: [
      { title: "Sprint backlog", cards: ["User story: signup", "User story: reset password"] },
      { title: "In progress", cards: [] },
      { title: "QA", cards: [] },
      { title: "Done", cards: [] },
      { title: "Retro notes", cards: ["What went well", "What to improve"] },
    ],
  },
  {
    id: "engineering-it-helpdesk",
    title: "IT Helpdesk",
    description: "Triage and resolve internal IT requests.",
    category: "engineering-it",
    background: G.night,
    lists: [
      { title: "New tickets", cards: ["Laptop won't boot", "VPN access request"] },
      { title: "Triaged", cards: [] },
      { title: "In progress", cards: [] },
      { title: "Waiting on user", cards: [] },
      { title: "Resolved", cards: [] },
    ],
  },

  // Marketing
  {
    id: "marketing-content-calendar",
    title: "Content Calendar",
    description: "Plan, write and publish content across channels.",
    category: "marketing",
    popular: true,
    background: G.sunset,
    lists: [
      { title: "Ideas", cards: ["How-to guide", "Customer story"] },
      { title: "Writing", cards: [] },
      { title: "Editing", cards: [] },
      { title: "Scheduled", cards: [] },
      { title: "Published", cards: [] },
    ],
  },
  {
    id: "marketing-campaign",
    title: "Campaign Launch",
    description: "Coordinate every piece of a marketing campaign.",
    category: "marketing",
    background: G.orange,
    lists: [
      { title: "Strategy", cards: ["Define audience", "Set KPIs"] },
      { title: "Assets", cards: ["Ad creatives", "Landing page", "Email copy"] },
      { title: "Launch", cards: [] },
      { title: "Results", cards: [] },
    ],
  },
  {
    id: "marketing-social",
    title: "Social Media Planner",
    description: "Schedule posts for every social network.",
    category: "marketing",
    background: G.violet,
    lists: [
      { title: "Post ideas", cards: ["Behind the scenes", "Product tip"] },
      { title: "Instagram", cards: [] },
      { title: "LinkedIn", cards: [] },
      { title: "X / Twitter", cards: [] },
      { title: "Posted", cards: [] },
    ],
  },

  // Human Resources
  {
    id: "hr-onboarding",
    title: "Employee Onboarding",
    description: "Give new hires a smooth first month.",
    category: "human-resources",
    popular: true,
    background: G.teal,
    lists: [
      { title: "Before day one", cards: ["Send welcome email", "Prepare laptop"] },
      { title: "First day", cards: ["Office tour", "Meet the team"] },
      { title: "First week", cards: ["Set up accounts", "Shadow a colleague"] },
      { title: "First month", cards: ["30-day check-in"] },
    ],
  },
  {
    id: "hr-recruiting",
    title: "Recruiting Pipeline",
    description: "Move candidates from application to offer.",
    category: "human-resources",
    background: G.blue,
    lists: [
      { title: "Applied", cards: ["Candidate A", "Candidate B"] },
      { title: "Phone screen", cards: [] },
      { title: "Interview", cards: [] },
      { title: "Offer", cards: [] },
      { title: "Hired", cards: [] },
    ],
  },
  {
    id: "hr-performance",
    title: "Performance Reviews",
    description: "Run review cycles for the whole team.",
    category: "human-resources",
    background: G.night,
    lists: [
      { title: "Self reviews", cards: [] },
      { title: "Peer feedback", cards: [] },
      { title: "Manager review", cards: [] },
      { title: "1:1 scheduled", cards: [] },
      { title: "Complete", cards: [] },
    ],
  },

  // Operations
  {
    id: "operations-project",
    title: "Project Management",
    description: "Track projects with owners and deadlines.",
    category: "operations",
    popular: true,
    background: G.night,
    lists: [
      { title: "Project resources", cards: ["Project brief", "Timeline"] },
      { title: "Questions", cards: [] },
      { title: "To do", cards: ["Kickoff meeting"] },
      { title: "Doing", cards: [] },
      { title: "Done", cards: [] },
    ],
  },
  {
    id: "operations-inventory",
    title: "Inventory Management",
    description: "Know what's in stock and what to reorder.",
    category: "operations",
    background: G.green,
    lists: [
      { title: "In stock", cards: [] },
      { title: "Low stock", cards: ["Item A"] },
      { title: "Reorder placed", cards: [] },
      { title: "Received", cards: [] },
    ],
  },
  {
    id: "operations-event",
    title: "Event Planning",
    description: "Plan venues, vendors and guests for any event.",
    category: "operations",
    background: G.ember,
    lists: [
      { title: "Venue", cards: ["Shortlist venues", "Sign contract"] },
      { title: "Vendors", cards: ["Catering", "AV equipment"] },
      { title: "Guests", cards: ["Send invitations", "Track RSVPs"] },
      { title: "Day of", cards: [] },
    ],
  },

  // CRM
  {
    id: "crm-sales-pipeline",
    title: "Sales Pipeline",
    description: "Move deals from lead to closed-won.",
    category: "crm",
    popular: true,
    background: G.ember,
    lists: [
      { title: "Leads", cards: ["Acme Corp", "Globex"] },
      { title: "Contacted", cards: [] },
      { title: "Proposal sent", cards: [] },
      { title: "Negotiation", cards: [] },
      { title: "Closed won", cards: [] },
      { title: "Closed lost", cards: [] },
    ],
  },
  {
    id: "crm-customer-success",
    title: "Customer Success",
    description: "Onboard customers and keep them healthy.",
    category: "crm",
    background: G.teal,
    lists: [
      { title: "Onboarding", cards: ["Kickoff call"] },
      { title: "Active", cards: [] },
      { title: "At risk", cards: [] },
      { title: "Renewal due", cards: [] },
      { title: "Renewed", cards: [] },
    ],
  },
  {
    id: "crm-contacts",
    title: "Contact Management",
    description: "A lightweight CRM for partners and clients.",
    category: "crm",
    background: G.blue,
    lists: [
      { title: "Prospects", cards: [] },
      { title: "Clients", cards: [] },
      { title: "Partners", cards: [] },
      { title: "Follow up", cards: [] },
    ],
  },
];

export function templatesFor(category: CategorySlug) {
  return category === "popular" ? TEMPLATES.filter((t) => t.popular) : TEMPLATES.filter((t) => t.category === category);
}

export function categoryName(slug: string) {
  return TEMPLATE_CATEGORIES.find((c) => c.slug === slug)?.name ?? slug;
}
