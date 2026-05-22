# PUMP

A humorous, high-energy bouldering workout tracker for you and your crew. Log sessions in ~3 seconds, grow your avatar ("Popeye effect"), flash panic tickers when friends train, and exile idle climbers to the **Couch of Shame** (96h without a session).

## Stack

- **Next.js** (App Router, TypeScript)
- **Tailwind CSS** + **Framer Motion**
- **shadcn/ui** + **Lucide**
- **Supabase** (Auth, Postgres, Storage, Realtime)

## Quick start

### 1. Supabase project

1. Create a project at [supabase.com](https://supabase.com).
2. In **SQL Editor**, run the full migration:
   `supabase/migrations/001_initial_schema.sql`
3. **Authentication → Providers**: enable Email (open signup — anyone with the link).
4. **Database → Replication**: enable Realtime for `workout_logs` (powers live ticker + leaderboard).
5. Copy **Project URL** and **anon key** from **Settings → API**.

### 2. Environment

```bash
cp .env.local.example .env.local
```

Fill in:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 3. Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scoring

| Metric | Rule |
|--------|------|
| **Session points** | `(duration_minutes / 30) × intensity × 10` (also enforced in DB) |
| **Lifetime pump** | Sum of all session points on `profiles.current_pump_score` |
| **Winner of the Week** | Sum of points from logs in the last 7 days |
| **Couch of Shame** | No log in **96 hours** |

## Intensity labels

1. Mostly drinking coffee  
2. Warm-up vibes only  
3. Solid friction  
4. Forearms entering beast mode  
5. Can't open my car door afterwards  

## Project structure

See `src/components/` for UI modules: `Leaderboard`, `LogWorkoutModal`, `AvatarEvolution`, `CouchOfShame`, `LiveTicker`, etc.

## Deploy: Vercel + one.com subdomain (recommended)

PUMP does **not** run on PHP/WordPress hosting. Use **Vercel** (free) for the app and **one.com** only for DNS + WordPress.

Example layout:

| Address | Hosts |
|---------|--------|
| `https://www.yourdomain.se` | WordPress (one.com, unchanged) |
| `https://pump.yourdomain.se` | PUMP (Vercel) |

### A. Deploy to Vercel

1. Push this repo to **GitHub** (do not commit `.env.local`).
2. [vercel.com](https://vercel.com) → **Add New Project** → import the repo.
3. **Environment variables:**
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy. Note the `*.vercel.app` URL and test signup there first.

### B. Add subdomain in Vercel

1. Vercel → your project → **Settings** → **Domains**.
2. Add: `pump.yourdomain.se` (replace with your real domain).
3. Vercel shows DNS instructions — usually a **CNAME** for `pump` → `cname.vercel-dns.com` (copy the exact value Vercel shows).

### C. DNS at one.com

1. [one.com control panel](https://www.one.com/admin/) → your domain → **DNS settings**.
2. **Create** a new record:
   - **Type:** CNAME  
   - **Host / name:** `pump`  
   - **Points to / value:** what Vercel gave you (often `cname.vercel-dns.com`)
3. Save. Do **not** change records used by WordPress (`www`, `@`, etc.) unless you know what they do.

DNS can take 5 minutes–48 hours; Vercel shows **Valid** when ready and issues HTTPS automatically.

### D. Supabase Auth (required)

[Supabase](https://supabase.com/dashboard/project/yvvoubtmciphgynuahnn/auth/url-configuration) → **Authentication** → **URL configuration**:

- **Site URL:** `https://pump.yourdomain.se`
- **Redirect URLs** (add both while testing):
  - `https://pump.yourdomain.se/**`
  - `https://*.vercel.app/**` (optional, for preview deploys)

Share `https://pump.yourdomain.se` with your crew.

## Migrations after first deploy

If you added features later, run new SQL files in Supabase SQL Editor (in order):

- `supabase/migrations/002_workout_photos.sql` — session photos + storage bucket
- `supabase/migrations/003_social_grades_bonuses.sql` — Moonboard/Outdoors bonuses, Font grades, comments, kudos
- `supabase/migrations/004_private_crews.sql` — private crews with invite codes (required to use the app)
- `supabase/migrations/005_session_types_and_battles.sql` — session types + crew vs crew battles
