// Fictional demo accounts seeded by migration 20261031000008_demo_accounts.sql.
// The password is public on purpose; the database keeps demo passwords from changing.
export const DEMO_PASSWORD = "Demo-Pass-2026!";

export const DEMO_ACCOUNTS = [
  { name: "Ava Admin", email: "ava.admin@demo.example.com", about: "Team Admin" },
  { name: "Leo Member", email: "leo.member@demo.example.com", about: "Member, 2 teams" },
  { name: "Mia Member", email: "mia.member@demo.example.com", about: "Team Member" },
  { name: "Noah New", email: "noah.newcomer@demo.example.com", about: "Not in a team yet" },
];

export const isDemoEmail = (email: string | null | undefined) => !!email?.endsWith("@demo.example.com");
