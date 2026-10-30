export const TEMPLATE_CATEGORIES = [
  { slug: "popular", name: "Popular" },
  { slug: "business", name: "Business" },
  { slug: "design", name: "Design" },
  { slug: "education", name: "Education" },
  { slug: "engineering", name: "Engineering" },
  { slug: "marketing", name: "Marketing" },
  { slug: "hr-operations", name: "HR & Operations" },
  { slug: "personal", name: "Personal" },
  { slug: "productivity", name: "Productivity" },
  { slug: "product-management", name: "Product management" },
  { slug: "project-management", name: "Project management" },
  { slug: "remote-work", name: "Remote work" },
  { slug: "sales", name: "Sales" },
  { slug: "support", name: "Support" },
  { slug: "team-management", name: "Team management" },
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

// A CSS `background` value for a cover photo. The colour shows while the photo
// loads, and stays if it ever fails to load.
export function photoBackground(url: string, color: string) {
  return `${color} url("${url}") center / cover no-repeat`;
}

const unsplash = (id: string) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1920&q=70`;

// Unsplash photos (free to use under the Unsplash License), each with a fallback colour.
const PHOTOS = {
  yosemite: ["1506744038136-46273834b3fb", "#4a6b5d", "Mountain valley"],
  lake: ["1501785888041-af3ef285b470", "#5b7c8d", "Mountain lake"],
  fog: ["1470071459604-3b5ec3a7fe05", "#6b7f6e", "Foggy hills"],
  forest: ["1441974231531-c6227db76b6e", "#2f4a2f", "Forest light"],
  beach: ["1507525428034-b723cf961d3e", "#3d8fb5", "Beach"],
  sunrise: ["1469474968028-56623f02e42e", "#c78a4a", "Sunrise"],
  hills: ["1472214103451-9374bd1c798e", "#5d8a3a", "Green hills"],
  road: ["1500530855697-b586d89ba3ee", "#6d6a5a", "Open road"],
  stars: ["1519681393784-d120267933ba", "#1d2b4a", "Night sky"],
  alpine: ["1476514525535-07fb3b4ae5f1", "#3e6c7a", "Alpine lake"],
  mist: ["1418065460487-3e41a6c84dc5", "#56685a", "Misty forest"],
  waterfall: ["1433086966358-54859d0ed716", "#3f5f4f", "Waterfall"],
  path: ["1447752875215-b2761acb3c5d", "#4e6b3b", "Forest path"],
  office: ["1497366216548-37526070297c", "#9a9a92", "Bright office"],
  office2: ["1497366811353-6870744d04b2", "#8c8c84", "Open office"],
  team: ["1522071820081-009f0129c71c", "#7a6a5a", "Team at work"],
  meeting: ["1517245386807-bb43f82c33c4", "#5a5a6a", "Meeting room"],
  laptop: ["1531297484001-80022131f5a1", "#2a2f3a", "Laptop"],
  circuit: ["1518770660439-4636190af475", "#1f3a2f", "Circuit board"],
  code: ["1555066931-4365d14bab8c", "#1e1e2a", "Code"],
  macbook: ["1498050108023-c5249f4df085", "#3a3a3a", "Developer desk"],
  analytics: ["1460925895917-afdab827c52f", "#5a6a7a", "Analytics"],
  docs: ["1454165804606-c3d57bc86b40", "#8a7a6a", "Documents"],
  writing: ["1434030216411-0b793f4b4173", "#9a8a7a", "Writing notes"],
  classroom: ["1524178232363-1fb2b075b655", "#6a6a5a", "Classroom"],
  swatches: ["1561070791-2526d30994b5", "#c47a5a", "Colour swatches"],
  uiDesign: ["1558655146-9f40138edfeb", "#6a5a8a", "UI design"],
  workshop: ["1542744173-8e7e53415bb0", "#5a6a6a", "Workshop"],
  teamwork: ["1521737604893-d14cc237f11d", "#6a7a8a", "Teamwork"],
  handshake: ["1556761175-5973dc0f32e7", "#4a5a6a", "Client meeting"],
  sales: ["1553877522-43269d4ea984", "#5a5a5a", "Sales call"],
  typing: ["1486312338219-ce68d2c6f44d", "#4a4a4a", "Typing"],
  desk: ["1499951360447-b19be8fe80f5", "#7a7a6a", "Workspace"],
  notebook: ["1517842645767-c639042777db", "#8a8a7a", "Notebook"],
  planner: ["1506784983877-45594efa4cbe", "#b0a090", "Planner"],
  remote: ["1593642632559-0c6d3fc62b89", "#3a4a5a", "Home office"],
  dashboard: ["1551288049-bebda4e38f71", "#2a3a5a", "Dashboard"],
  students: ["1503676260728-1c00da094a0b", "#7a8a6a", "Learning"],
  todo: ["1484480974693-6ca0a78fb36b", "#9a9080", "To-do list"],
  coworking: ["1504384308090-c894fdcc538d", "#6a6050", "Coworking"],
  remote2: ["1515378791036-0648a3ef77b2", "#7a7a7a", "Remote work"],
  marketing: ["1557804506-669a67965ba0", "#4a5a7a", "Strategy"],
  marketing2: ["1432888498266-38ffec3eaf0a", "#5a5a5a", "Content work"],
  startup: ["1559136555-9303baea8ebd", "#5a6a7a", "Startup"],
  whiteboard: ["1552664730-d307ca884978", "#7a7a8a", "Whiteboard session"],
  people: ["1529156069898-49953e39b3ac", "#c09060", "Friends"],
  writingDesk: ["1488190211105-8b0e65b80b4e", "#8a7a6a", "Writing desk"],
} as const;

type PhotoKey = keyof typeof PHOTOS;
const bg = (key: PhotoKey) => photoBackground(unsplash(PHOTOS[key][0]), PHOTOS[key][1]);

export const BACKGROUND_PHOTOS = (Object.keys(PHOTOS) as PhotoKey[]).map((key) => ({
  key,
  label: PHOTOS[key][2],
  background: bg(key),
}));

export const BACKGROUND_COLORS = [
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

const t = (
  id: string,
  title: string,
  category: Template["category"],
  photo: PhotoKey,
  description: string,
  lists: [string, string[]][],
  popular = false,
): Template => ({
  id,
  title,
  description,
  category,
  popular,
  background: bg(photo),
  lists: lists.map(([title, cards]) => ({ title, cards })),
});

export const TEMPLATES: Template[] = [
  // Business
  t("small-business-crm-lite", "Small Business Operations", "business", "startup",
    "Track orders, suppliers and day-to-day tasks for a small shop.",
    [["New orders", ["Order #1001", "Order #1002"]], ["In progress", ["Pack shipment for Order #998"]], ["Suppliers", ["Reorder packaging", "Confirm delivery dates"]], ["Done", []]], true),
  t("small-business-bookkeeping", "Bookkeeping Tracker", "business", "docs",
    "Keep invoices, expenses and tax deadlines in one place.",
    [["Invoices to send", ["Invoice client A", "Invoice client B"]], ["Awaiting payment", []], ["Expenses to file", ["Office supplies receipt"]], ["Tax deadlines", ["Quarterly VAT return"]], ["Paid / Filed", []]]),
  t("small-business-launch", "Business Launch Checklist", "business", "handshake",
    "Everything you need to open your doors.",
    [["Legal", ["Register business", "Open bank account"]], ["Branding", ["Logo", "Website domain"]], ["Launch", ["Soft opening", "Announce on social media"]], ["Done", []]]),
  t("business-plan", "Business Plan", "business", "analytics",
    "Work through each section of a business plan with your team.",
    [["Research", ["Market size", "Competitor analysis"]], ["Drafting", ["Executive summary", "Financial projections"]], ["Review", []], ["Final", []]]),

  // Design
  t("design-sprint", "Design Sprint", "design", "whiteboard",
    "Run a five-day design sprint from mapping to testing.",
    [["Map", ["Define long-term goal", "Map the challenge"]], ["Sketch", ["Lightning demos", "Crazy 8s"]], ["Decide", ["Vote on solutions", "Storyboard"]], ["Prototype", []], ["Test", ["Recruit 5 users", "Run interviews"]]], true),
  t("design-system", "Design System", "design", "uiDesign",
    "Plan and ship the components of your design system.",
    [["Foundations", ["Color tokens", "Typography scale", "Spacing"]], ["Components", ["Button", "Input", "Modal"]], ["In review", []], ["Published", []]]),
  t("design-requests", "Design Requests", "design", "swatches",
    "Intake and triage design work from other teams.",
    [["Requests", ["Landing page hero", "Social banner"]], ["Brief approved", []], ["In design", []], ["Feedback", []], ["Delivered", []]]),
  t("brand-guidelines", "Brand Guidelines", "design", "desk",
    "Collect logos, colours, fonts and voice in one shared board.",
    [["Logo", ["Primary logo", "Icon mark"]], ["Colours", ["Primary palette", "Accessibility checks"]], ["Typography", ["Headings", "Body text"]], ["Voice & tone", ["Writing principles"]]]),

  // Education
  t("education-course-planner", "Course Planner", "education", "classroom",
    "Organize lessons, assignments and exams for a semester.",
    [["Syllabus", ["Week 1: Introduction", "Week 2: Fundamentals"]], ["Assignments", ["Essay 1", "Problem set 1"]], ["Exams", ["Midterm", "Final"]], ["Completed", []]]),
  t("education-study-plan", "Student Study Plan", "education", "writing",
    "Stay on top of classes, homework and revision.",
    [["To study", ["Chapter 3 reading", "Flashcards: vocabulary"]], ["Homework", ["Math worksheet"]], ["Doing", []], ["Done", []]], true),
  t("education-thesis", "Thesis Tracker", "education", "writingDesk",
    "Break a thesis into research, writing and review phases.",
    [["Research", ["Literature review", "Collect sources"]], ["Writing", ["Introduction", "Methodology", "Results"]], ["Supervisor review", []], ["Final", []]]),
  t("lesson-plans", "Lesson Plans", "education", "students",
    "Plan lessons, materials and follow-ups for your class.",
    [["Ideas", ["Field trip", "Guest speaker"]], ["Planned", ["Fractions intro"]], ["Taught", []], ["Follow up", []]]),

  // Engineering
  t("engineering-kanban", "Kanban Template", "engineering", "code",
    "Classic software kanban from backlog to done.",
    [["Backlog", ["Set up CI", "Write API docs"]], ["To do", ["Implement login"]], ["In progress", []], ["Code review", []], ["Done", []]], true),
  t("engineering-sprint", "Agile Sprint Board", "engineering", "macbook",
    "Plan sprints, track stories and run retros.",
    [["Sprint backlog", ["User story: signup", "User story: reset password"]], ["In progress", []], ["QA", []], ["Done", []], ["Retro notes", ["What went well", "What to improve"]]]),
  t("engineering-it-helpdesk", "IT Helpdesk", "engineering", "laptop",
    "Triage and resolve internal IT requests.",
    [["New tickets", ["Laptop won't boot", "VPN access request"]], ["Triaged", []], ["In progress", []], ["Waiting on user", []], ["Resolved", []]]),
  t("bug-tracker", "Bug Tracker", "engineering", "circuit",
    "Report, prioritise and fix bugs.",
    [["Reported", ["Crash on save", "Wrong date format"]], ["Confirmed", []], ["Fixing", []], ["Ready to release", []], ["Closed", []]]),
  t("release-planning", "Release Planning", "engineering", "dashboard",
    "Coordinate what ships in each release.",
    [["Next release", ["Feature flag cleanup"]], ["In testing", []], ["Release notes", ["Draft changelog"]], ["Shipped", []]]),

  // Marketing
  t("marketing-content-calendar", "Content Calendar", "marketing", "marketing2",
    "Plan, write and publish content across channels.",
    [["Ideas", ["How-to guide", "Customer story"]], ["Writing", []], ["Editing", []], ["Scheduled", []], ["Published", []]], true),
  t("marketing-campaign", "Campaign Launch", "marketing", "marketing",
    "Coordinate every piece of a marketing campaign.",
    [["Strategy", ["Define audience", "Set KPIs"]], ["Assets", ["Ad creatives", "Landing page", "Email copy"]], ["Launch", []], ["Results", []]]),
  t("marketing-social", "Social Media Planner", "marketing", "people",
    "Schedule posts for every social network.",
    [["Post ideas", ["Behind the scenes", "Product tip"]], ["Instagram", []], ["LinkedIn", []], ["X / Twitter", []], ["Posted", []]]),
  t("event-marketing", "Event Marketing", "marketing", "workshop",
    "Promote an event from announcement to follow-up.",
    [["Before", ["Save the date", "Speaker promo"]], ["During", ["Live posts"]], ["After", ["Recap blog", "Thank-you email"]]]),

  // HR & Operations
  t("hr-onboarding", "Employee Onboarding", "hr-operations", "team",
    "Give new hires a smooth first month.",
    [["Before day one", ["Send welcome email", "Prepare laptop"]], ["First day", ["Office tour", "Meet the team"]], ["First week", ["Set up accounts", "Shadow a colleague"]], ["First month", ["30-day check-in"]]], true),
  t("hr-recruiting", "Recruiting Pipeline", "hr-operations", "handshake",
    "Move candidates from application to offer.",
    [["Applied", ["Candidate A", "Candidate B"]], ["Phone screen", []], ["Interview", []], ["Offer", []], ["Hired", []]]),
  t("hr-performance", "Performance Reviews", "hr-operations", "meeting",
    "Run review cycles for the whole team.",
    [["Self reviews", []], ["Peer feedback", []], ["Manager review", []], ["1:1 scheduled", []], ["Complete", []]]),
  t("operations-inventory", "Inventory Management", "hr-operations", "office2",
    "Know what's in stock and what to reorder.",
    [["In stock", []], ["Low stock", ["Item A"]], ["Reorder placed", []], ["Received", []]]),
  t("operations-event", "Event Planning", "hr-operations", "coworking",
    "Plan venues, vendors and guests for any event.",
    [["Venue", ["Shortlist venues", "Sign contract"]], ["Vendors", ["Catering", "AV equipment"]], ["Guests", ["Send invitations", "Track RSVPs"]], ["Day of", []]]),

  // Personal
  t("personal-goals", "Personal Goals", "personal", "yosemite",
    "Set goals for the year and track progress.",
    [["This year", ["Run a half marathon", "Read 20 books"]], ["This month", []], ["In progress", []], ["Achieved", []]]),
  t("travel-planning", "Travel Planning", "personal", "beach",
    "Plan trips: ideas, bookings and packing.",
    [["Destinations", ["Lisbon", "Kyoto"]], ["To book", ["Flights", "Hotel"]], ["Packing list", ["Passport", "Adapters"]], ["Booked", []]], true),
  t("home-renovation", "Home Renovation", "personal", "alpine",
    "Organise rooms, contractors and budget.",
    [["Ideas", ["Kitchen colours"]], ["Quotes", ["Painter", "Electrician"]], ["In progress", []], ["Done", []]]),
  t("meal-planner", "Weekly Meal Planner", "personal", "hills",
    "Plan meals and the shopping list for the week.",
    [["Recipes to try", ["Lentil soup"]], ["Monday–Wednesday", []], ["Thursday–Sunday", []], ["Shopping list", ["Vegetables", "Rice"]]]),
  t("reading-list", "Reading List", "personal", "fog",
    "Track books to read, reading and finished.",
    [["Want to read", ["Book A", "Book B"]], ["Reading", []], ["Finished", []], ["Favourites", []]]),

  // Productivity
  t("getting-things-done", "Getting Things Done", "productivity", "todo",
    "Capture, clarify and organise everything on your plate.",
    [["Inbox", ["Reply to Anna", "Renew insurance"]], ["Next actions", []], ["Waiting for", []], ["Someday / maybe", []], ["Done", []]]),
  t("weekly-planner", "Weekly Planner", "productivity", "planner",
    "Plan each day of your week at a glance.",
    [["Monday", []], ["Tuesday", []], ["Wednesday", []], ["Thursday", []], ["Friday", []], ["Weekend", []]], true),
  t("habit-tracker", "Habit Tracker", "productivity", "sunrise",
    "Build habits one day at a time.",
    [["Habits", ["Drink water", "10 min walk", "Read 20 pages"]], ["Today", []], ["Streak > 7 days", []]]),
  t("eisenhower-matrix", "Eisenhower Matrix", "productivity", "notebook",
    "Prioritise by urgency and importance.",
    [["Urgent & important", []], ["Important, not urgent", []], ["Urgent, not important", []], ["Neither", []]]),

  // Product management
  t("product-roadmap", "Product Roadmap", "product-management", "stars",
    "Share what's planned now, next and later.",
    [["Now", ["Onboarding revamp"]], ["Next", ["Team plans"]], ["Later", ["Mobile app"]], ["Shipped", []]], true),
  t("feature-requests", "Feature Requests", "product-management", "mist",
    "Collect and prioritise ideas from customers.",
    [["New requests", ["Dark mode", "CSV export"]], ["Under review", []], ["Planned", []], ["Declined", []]]),
  t("user-research", "User Research", "product-management", "teamwork",
    "Plan studies, run interviews and share insights.",
    [["Questions", ["Why do users churn?"]], ["Recruiting", []], ["Interviews", []], ["Insights", []]]),
  t("product-launch", "Product Launch", "product-management", "road",
    "Bring a product to market across every team.",
    [["Product", ["Final QA"]], ["Marketing", ["Launch post"]], ["Sales", ["Pitch deck"]], ["Support", ["Help articles"]], ["Launched", []]]),

  // Project management
  t("operations-project", "Project Management", "project-management", "office",
    "Track projects with owners and deadlines.",
    [["Project resources", ["Project brief", "Timeline"]], ["Questions", []], ["To do", ["Kickoff meeting"]], ["Doing", []], ["Done", []]], true),
  t("simple-project", "Simple Project Board", "project-management", "forest",
    "To do, doing, done — nothing more.",
    [["To do", ["First task"]], ["Doing", []], ["Done", []]]),
  t("milestone-tracker", "Milestone Tracker", "project-management", "waterfall",
    "Plan a project around its key milestones.",
    [["Milestone 1: Plan", ["Scope agreed"]], ["Milestone 2: Build", []], ["Milestone 3: Launch", []], ["Complete", []]]),
  t("risk-register", "Risk Register", "project-management", "lake",
    "Spot, rate and mitigate project risks.",
    [["Identified", ["Vendor delay"]], ["Assessing", []], ["Mitigating", []], ["Closed", []]]),

  // Remote work
  t("remote-team-hub", "Remote Team Hub", "remote-work", "remote",
    "One place for links, rituals and updates for a distributed team.",
    [["Start here", ["Team handbook", "Time zones"]], ["This week", []], ["Announcements", []], ["Wins", []]], true),
  t("async-standups", "Async Standups", "remote-work", "remote2",
    "Share yesterday, today and blockers without a meeting.",
    [["Yesterday", []], ["Today", []], ["Blockers", []]]),
  t("remote-onboarding", "Remote Onboarding", "remote-work", "desk",
    "Welcome new teammates from anywhere.",
    [["Before start", ["Ship equipment"]], ["Week 1", ["Video intros"]], ["Week 2", ["First project"]], ["Done", []]]),
  t("team-rituals", "Team Rituals", "remote-work", "path",
    "Plan the moments that keep a remote team connected.",
    [["Weekly", ["Demo day"]], ["Monthly", ["Virtual lunch"]], ["Quarterly", ["Offsite"]], ["Ideas", []]]),

  // Sales
  t("crm-sales-pipeline", "Sales Pipeline", "sales", "sales",
    "Move deals from lead to closed-won.",
    [["Leads", ["Acme Corp", "Globex"]], ["Contacted", []], ["Proposal sent", []], ["Negotiation", []], ["Closed won", []], ["Closed lost", []]], true),
  t("crm-customer-success", "Customer Success", "sales", "teamwork",
    "Onboard customers and keep them healthy.",
    [["Onboarding", ["Kickoff call"]], ["Active", []], ["At risk", []], ["Renewal due", []], ["Renewed", []]]),
  t("crm-contacts", "Contact Management", "sales", "typing",
    "A lightweight CRM for partners and clients.",
    [["Prospects", []], ["Clients", []], ["Partners", []], ["Follow up", []]]),
  t("lead-generation", "Lead Generation", "sales", "analytics",
    "Find, qualify and hand over new leads.",
    [["Sources", ["Webinar", "Referrals"]], ["New leads", []], ["Qualified", []], ["Handed to sales", []]]),

  // Support
  t("support-queue", "Customer Support Queue", "support", "laptop",
    "Triage and answer customer tickets.",
    [["New", ["Can't log in", "Billing question"]], ["In progress", []], ["Waiting on customer", []], ["Solved", []]], true),
  t("knowledge-base", "Knowledge Base", "support", "writing",
    "Write and maintain help articles.",
    [["Article ideas", ["Getting started", "Reset password"]], ["Drafting", []], ["Review", []], ["Published", []]]),
  t("support-bug-triage", "Bug Triage", "support", "circuit",
    "Pass customer-reported bugs to engineering.",
    [["Reported by customers", []], ["Reproduced", []], ["Sent to engineering", []], ["Fixed & replied", []]]),
  t("feedback-inbox", "Feedback Inbox", "support", "people",
    "Gather customer feedback and close the loop.",
    [["Praise", []], ["Ideas", []], ["Complaints", []], ["Responded", []]]),

  // Team management
  t("team-tasks", "Team Tasks", "team-management", "teamwork",
    "See who's working on what across the team.",
    [["Unassigned", ["Update wiki"]], ["Alex", []], ["Sam", []], ["Done", []]], true),
  t("one-on-ones", "1-on-1 Meetings", "team-management", "meeting",
    "Keep agendas and notes for one-on-ones.",
    [["Agenda", ["Career goals", "Feedback"]], ["Discussed", []], ["Action items", []]]),
  t("team-okrs", "Team Goals (OKRs)", "team-management", "stars",
    "Set objectives and track key results.",
    [["Objectives", ["Delight new users"]], ["Key results", ["Activation 40%"]], ["On track", []], ["At risk", []], ["Achieved", []]]),
  t("weekly-team-meeting", "Weekly Team Meeting", "team-management", "workshop",
    "Collect topics before the meeting and track decisions.",
    [["Topics", ["Hiring update"]], ["Discussed", []], ["Decisions", []], ["Follow-ups", []]]),
];

export function templatesFor(category: CategorySlug) {
  return category === "popular" ? TEMPLATES.filter((t) => t.popular) : TEMPLATES.filter((t) => t.category === category);
}

export function categoryName(slug: string) {
  return TEMPLATE_CATEGORIES.find((c) => c.slug === slug)?.name ?? slug;
}
