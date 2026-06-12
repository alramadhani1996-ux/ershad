# Ershad

Ershad is a bilingual Arabic/English Next.js platform that connects certified guides with companies, powered by Supabase authentication, Postgres, row-level security, and private file storage.

## Features

- Guide registration with Supabase Auth, profile creation, application record, and license/certification upload.
- Company registration with Supabase Auth, profile creation, application record, and commercial document upload.
- Role-based authentication for `admin`, `guide`, and `company` profiles.
- Admin dashboard for approving or rejecting guide applications, company applications, and company guide requests, with guide assignment for approved requests.
- Approved company workflow for submitting guide requests with optional attachments.
- Public approved-guide directory and guide dashboards for assigned requests.
- Supabase session middleware that refreshes auth cookies for protected server-rendered pages.
- Private Supabase Storage buckets for guide documents, company documents, and request attachments.
- Arabic/English language switcher that stores the selected language in a cookie and updates page direction.

## Getting Started

Install dependencies:

```bash
npm install
```

Create `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

> `SUPABASE_SERVICE_ROLE_KEY` is required only on the server for application review operations and private file upload orchestration. Never expose it to the browser.

Set up Supabase by running the SQL in [`supabase/schema.sql`](supabase/schema.sql) from the Supabase SQL editor. Then create the first admin by signing up once and running:

```sql
update public.profiles
set role = 'admin', status = 'approved'
where email = 'admin@example.com';
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the app.

## Available Scripts

- `npm run dev` - Start the development server with Turbopack.
- `npm run build` - Create a production build.
- `npm run start` - Start the production server.
- `npm run lint` - Run ESLint.
