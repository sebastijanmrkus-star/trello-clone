# Trello Clone

Next.js 15 (App Router) + Supabase (Postgres, Auth, Row Level Security).

Live: https://trello-clone-smd.netlify.app

## Architecture
The app uses Next.js 15 (React 19, TypeScript, Tailwind CSS) on Netlify: server components load each board's data, and client components handle the interactive board, including drag-and-drop with `@hello-pangea/dnd` and instant on-screen updates as each change is written to the database. Supabase provides Postgres storage and email/password sign-in, with Row Level Security so each user can only reach their own workspaces, boards, lists, cards, labels, checklists and comments, plus SQL functions for creating boards from templates and copying cards and lists.

## Features
- Accounts (Supabase Auth): email/password sign-up with email confirmation (check-your-inbox screen and resend), sign-in, sign-out, and sessions that persist across visits; signed-out visitors are sent back to the page they wanted after signing in
- Password safety: a live checklist (length, upper/lowercase, number, symbol, no surrounding spaces) on sign-up and password changes, and Show/Hide on every password field
- Password reset: "Forgot password?" emails a one-time link to choose a new password; signed-in users can change it from the account menu
- Four one-click demo accounts (fictional people) with two sample teams; demo passwords can't be changed
- Teams: create teams and switch between them from the top bar; everyone in a team can open its boards
- Roles: Admins rename or delete the team, add members, change roles and remove members; Members can leave. A team always keeps at least one Admin (enforced in the database)
- Adding members: Admins add people who already have an account, by the email they signed up with
- Boards landing page: board search, Create button, starred boards, recently viewed, and boards grouped by workspace
- Template gallery (59 templates, each with its own photo) in Trello's categories: Popular, Business, Design, Education, Engineering, Marketing, HR & Operations, Personal, Productivity, Product management, Project management, Remote work, Sales, Support, Team management
- Boards with photo, color or gradient backgrounds, or your own uploaded image (Supabase Storage); create, rename, star, change background, delete
- Board switcher (header dropdown + collapsible sidebar on the board page)
- Responsive Kanban board: lists snap one-per-screen on phones, drag and drop on desktop and touch
- Lists: create, rename, reorder, copy, move all cards, sort, archive / restore
- Cards: create, edit, drag between lists, move / copy to any list and position, archive / restore, delete
- Finish task: mark cards finished from the card or its detail window; filter by finished / not finished
- Color-coded labels (default set per board, create / rename / recolor / delete), shown on cards
- Due dates with complete / due soon / overdue states, checklists with progress, card covers
- Comments on cards, description, badges for description / comments / checklist progress
- Board sharing: the owner invites registered users by email from the Share button; members can work on lists, cards, labels, checklists and comments, while renaming, starring, background, deleting and sharing stay with the owner. Members can leave a board, and shared boards appear under "Shared with you"
- Card members: from the card window, assign members of the board's team to cards (only team members, enforced in the database); avatars show on card tiles, comments show their author, and the filter can show cards assigned to anyone (including "assigned to me")
- Board filters by keyword, member, label, due date and finished status
- Each user only sees boards they own, boards of their teams, and boards shared with them (RLS)

## Setup
```bash
cp .env.example .env.local   # fill in your Supabase URL + publishable key
npm install
npm run dev
```
Apply the SQL in `supabase/migrations/` to your Supabase project (in order).

In Supabase → Authentication → URL Configuration, add `https://<your-site>/**` to Redirect URLs so confirmation and password-reset links can return to `/auth/confirm`.

Demo accounts (password `Demo-Pass-2026!`, also one click on the login page): `ava.admin@demo.example.com` (Admin of Demo Studio, Member of Marketing Crew), `leo.member@demo.example.com`, `mia.member@demo.example.com`, `noah.newcomer@demo.example.com` (only a personal team; add him to a team from the team page).
