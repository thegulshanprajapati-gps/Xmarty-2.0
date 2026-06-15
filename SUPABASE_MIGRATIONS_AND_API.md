# Supabase migrations, seeds and CMS API

Files added:

- `supabase/migrations/001_create_pages.sql` - Creates `public.pages` table, indexes, updated_at trigger, and RLS policies (public select published pages + admin policy example).
- `supabase/seeds/001_seed_pages.sql` - Idempotent seed for default pages (ON CONFLICT DO NOTHING).
- `supportdomain/src/lib/cms.ts` - Server-side CMS helpers using Supabase service role key (`SUPABASE_SERVICE_ROLE_KEY`).
- `supportdomain/src/app/api/cms/pages/route.ts` - Next.js App Router API for pages (GET list or page by slug, POST/PUT upsert, PATCH ensure default pages). Writes require `x-admin-secret` header matching `ADMIN_API_SECRET`.
- `supportdomain/src/components/client/LastChecked.tsx` - Client-only component to render timestamps and avoid hydration mismatch.

Quick steps:

1. Run the migration in Supabase SQL editor or via your migration tooling using `supabase/migrations/001_create_pages.sql`.
2. Run the seed SQL (`supabase/seeds/001_seed_pages.sql`) once to insert default pages.
3. Set server env vars in Supabase / deployment environment:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY` (server only)
   - `ADMIN_API_SECRET` (server only) - used to authorize write operations to `/api/cms/pages`.

Example: seed & refresh

 - From Supabase SQL editor paste `001_create_pages.sql` and run.
 - Paste `001_seed_pages.sql` and run.
 - In the Supabase Dashboard, open Database → Tables and refresh schema list if the app still reports "table not found".

Using the CMS API:

 - GET all published pages (public): `GET /api/cms/pages`
 - GET a single page: `GET /api/cms/pages?slug=about`
 - Upsert a page (admin only): `POST /api/cms/pages` with JSON body containing at minimum `slug` and `title`, include header `x-admin-secret: <ADMIN_API_SECRET>`.
 - Ensure defaults: `PATCH /api/cms/pages` with header `x-admin-secret` will create a minimal home page if missing.
