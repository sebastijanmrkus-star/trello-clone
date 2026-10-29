# Trello Clone

Next.js 15 (App Router) + Supabase (Postgres, Auth, Row Level Security).

## Features
- Email/password sign-up and login (Supabase Auth)
- Boards landing page: board search, Create button, starred boards, recently viewed, and boards grouped by workspace
- Template gallery with categories: Popular, Small business, Design, Education, Engineering-IT, Marketing, Human Resources, Operations, CRM
- Boards with color or gradient backgrounds; create, rename, star, change background, delete
- Board switcher (header dropdown + collapsible sidebar on the board page)
- Responsive Kanban board: lists snap one-per-screen on phones, drag and drop on desktop and touch
- Lists: create, rename, reorder, copy, move all cards, sort, archive / restore
- Cards: create, edit, drag between lists, move / copy to any list and position, archive / restore, delete
- Color-coded labels (default set per board, create / rename / recolor / delete), shown on cards
- Due dates with complete / due soon / overdue states, checklists with progress, card covers
- Comments on cards, description, badges for description / comments / checklist progress
- Board filters by keyword, label and due date
- Each user only sees their own boards (RLS)

## Setup
```bash
cp .env.example .env.local   # fill in your Supabase URL + publishable key
npm install
npm run dev
```
Apply the SQL in `supabase/migrations/` to your Supabase project (in order).
