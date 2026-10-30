# Trello Clone

Next.js 15 (App Router) + Supabase (Postgres, Auth, Row Level Security).

Live: https://trello-clone-smd.netlify.app

## Architecture
The app uses Next.js 15 (React 19, TypeScript, Tailwind CSS) on Netlify: server components load each board's data, and client components handle the interactive board, including drag-and-drop with `@hello-pangea/dnd` and instant on-screen updates as each change is written to the database. Supabase provides Postgres storage and email/password sign-in, with Row Level Security so each user can only reach their own workspaces, boards, lists, cards, labels, checklists and comments, plus SQL functions for creating boards from templates and copying cards and lists.

## Features
- Email/password sign-up and login (Supabase Auth)
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
- Card members: assign board members to cards from the card window; avatars show on card tiles, comments show their author, and the filter can show cards assigned to anyone (including "assigned to me")
- Board filters by keyword, member, label, due date and finished status
- Each user only sees boards they own or that were shared with them (RLS)

## Setup
```bash
cp .env.example .env.local   # fill in your Supabase URL + publishable key
npm install
npm run dev
```
Apply the SQL in `supabase/migrations/` to your Supabase project (in order).
