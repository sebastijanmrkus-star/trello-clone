# Trello Clone

Next.js 15 (App Router) + Supabase (Postgres, Auth, Row Level Security).

## Features
- Email/password sign-up and login (Supabase Auth)
- Boards with colors; create, rename, delete
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
