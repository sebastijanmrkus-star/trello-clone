# Trello Clone

Next.js 15 (App Router) + Supabase (Postgres, Auth, Row Level Security).

## Features
- Email/password sign-up and login (Supabase Auth)
- Boards landing page: board search, Create button, starred boards, recently viewed, and boards grouped by workspace
- Template gallery with categories: Popular, Small business, Design, Education, Engineering-IT, Marketing, Human Resources, Operations, CRM
- Boards with color or gradient backgrounds; create, rename, star, delete
- Lists and cards; create, rename, delete
- Drag and drop cards between lists and reorder lists (`@hello-pangea/dnd`, fractional positions)
- Card detail modal with description
- Each user only sees their own boards (RLS)

## Setup
```bash
cp .env.example .env.local   # fill in your Supabase URL + publishable key
npm install
npm run dev
```
Apply the SQL in `supabase/migrations/` to your Supabase project (in order).
