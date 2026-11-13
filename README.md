# CIPHER CHRONICLES

An interactive, page-turning information-security notebook with a public read-only reading experience and a private Supabase-powered author workspace.

## Stack
- Vite + vanilla JavaScript
- Supabase Auth and PostgreSQL with Row Level Security
- Vercel hosting
- DOMPurify for sanitising article HTML

## Run locally
1. Install Node.js (LTS).
2. Copy `.env.example` to `.env.local`.
3. Add your Supabase project URL and anon/publishable key.
4. Run:
   ```bash
   npm install
   npm run dev
   ```

Without Supabase configuration, the public notebook displays sample content. The private admin route requires Supabase setup.

## Supabase setup
1. Create a Supabase project.
2. Open SQL Editor and run `supabase/schema.sql`.
3. In Authentication > Users, create your own administrator account.
4. Copy that user's UUID.
5. In SQL Editor, run this, replacing the UUID:
   ```sql
   insert into public.admin_users (user_id)
   values ('YOUR-AUTH-USER-UUID');
   ```
6. Put the Project URL and publishable/anon key in `.env.local`:
   ```
   VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
   VITE_SUPABASE_ANON_KEY=YOUR-PUBLISHABLE-OR-ANON-KEY
   ```
7. Restart the local dev server.

The anon/publishable key is intended for browser use when Row Level Security is correctly configured. **Never put a Supabase service-role key in frontend code or in GitHub.**

## Admin and public views
- Public notebook: `/`
- Private sign-in and dashboard: `/#admin`
- Visitors can read only rows with `status = 'published'`.
- Admin privileges are granted only to user IDs inserted into `public.admin_users`.
- Draft pages are protected by RLS and are not returned to anonymous visitors.

## Deploy to Vercel
1. Push this project to your GitHub repository.
2. In Vercel, import `ruvani/cipher-chronicles`.
3. Framework preset: Vite. Build command: `npm run build`. Output directory: `dist`.
4. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in Vercel Project Settings > Environment Variables.
5. Redeploy after adding environment variables.

## Important security notes
- Keep the repository free of `.env` files and credentials. `.env.local` is ignored by git.
- Use Supabase RLS policies in `supabase/schema.sql`; do not rely on hiding admin buttons.
- The public frontend only queries published pages. RLS is the actual security boundary.
- Use a strong unique password and enable MFA for the Supabase account if available.
- Review Supabase policies before storing sensitive personal research notes. This starter is an initial publication scaffold, not a substitute for a security review.
