# Contributing to PUMP (ClimbCompare)

Thanks for helping build the app. This doc is the shared playbook for working together without stepping on each other’s changes.

**Production:** merges to `main` deploy automatically on Vercel.  
**Repo:** [github.com/afallden-ux/PUMP](https://github.com/afallden-ux/PUMP)

---

## Getting access

Ask the repo owner for:

1. **GitHub** — collaborator on `afallden-ux/PUMP` (Settings → Collaborators).
2. **Supabase** — invite to the shared project (or a copy of `.env.local` via a password manager — never Slack/email).
3. **Vercel** (optional) — team member on the project so you can open preview deploys and logs.

---

## Local setup

```bash
git clone https://github.com/afallden-ux/PUMP.git
cd PUMP
npm install
cp .env.local.example .env.local
```

Fill `.env.local` (see [Environment variables](#environment-variables)). Then:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Before starting work, sync with `main`:

```bash
git checkout main
git pull origin main
```

---

## Git workflow (required)

We use **short-lived branches** and **pull requests**. Do not push directly to `main` unless the owner explicitly asks for a hotfix.

```text
main ─────────────────────────────► production (Vercel)
  ▲
  │ merge PR (after review)
  │
feature/your-topic ──► open PR ──► preview URL ──► review ──► merge
```

### Steps

1. Create a branch from latest `main`:
   ```bash
   git checkout -b feature/short-description
   ```
   Examples: `feature/moonboard-ocr`, `fix/leaderboard-sort`.

2. Commit small, logical changes with clear messages (see recent history on `main`).

3. Push and open a **Pull Request** on GitHub:
   ```bash
   git push -u origin feature/short-description
   ```

4. Wait for the **Vercel preview** link on the PR. Test there before merge.

5. Request review from the other person. Address comments, push more commits to the same branch.

6. **Merge** when approved. Production updates after merge to `main`.

### Keeping your branch up to date

If `main` moved while you work:

```bash
git checkout main
git pull origin main
git checkout feature/your-topic
git merge main
# fix conflicts if any, then push
```

---

## Shipping UI changes

When you change anything users see in the app, bump the version in:

`src/lib/appVersion.ts`

Example: `2.18` → `2.19`

That number appears in the nav so we can confirm Vercel deployed the right build.

---

## Supabase / database

We use **one shared Supabase project**. Schema changes belong in the repo, not only in the dashboard.

### Adding or changing tables

1. Add a numbered file under `supabase/migrations/` (e.g. `023_my_feature.sql`).
2. Append the same SQL to the relevant run script if one exists:
   - `supabase/RUN_MOONBOARD.sql`
   - `supabase/RUN_CRAGS27.sql`
   - `supabase/RUN_EIGHTA.sql`
   - etc.
3. In the PR description, note: **“Run `RUN_….sql` in Supabase SQL Editor after merge.”**
4. Only **one person** should apply new SQL to production per migration (avoid duplicate/conflicting runs).

### Updating TypeScript types

If you add tables/columns, update `src/types/database.ts` to match.

### Do not commit

- `.env.local`
- API keys, service role keys, or session secrets

---

## Environment variables

Copy from `.env.local.example`. Get real values from the project owner or Supabase/Vercel dashboards.

| Variable | Required locally | Where used | Notes |
|----------|------------------|------------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | App, auth | Supabase → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | App, auth | Publishable or legacy anon key |
| `NEXT_PUBLIC_SITE_URL` | Yes | Auth emails, links | `http://localhost:3000` locally; production URL on Vercel |
| `SUPABASE_SERVICE_ROLE_KEY` | For uploads/cron | Server only | **Secret.** Also `SUPABASE_SECRET_KEY` alias. Not for browser code. |
| `MOONBOARD_SESSION_SECRET` | For MoonBoard login/sync | Server | 32+ random characters; encrypts session cookies |
| `LOGBOOK_SESSION_SECRET` | Optional | Server | 27crags / 8a.nu; falls back to `MOONBOARD_SESSION_SECRET` |
| `CRON_SECRET` | Optional | Cron route | Inactivity email job |
| `RESEND_API_KEY` | Optional | Email | Inactivity nudges |
| `EMAIL_FROM` | Optional | Email | Sender address for Resend |

Vercel sets `VERCEL_URL` automatically on deploys. Do not add that locally unless testing URL helpers.

**Sharing secrets:** use 1Password, Bitwarden, or similar — not GitHub issues, Discord, or email.

---

## What to work on

- Pick an **issue** or agree on a task in chat before a large refactor.
- Prefer **one feature per PR** (easier review and rollback).
- Match existing patterns in the folder you touch (`src/components/profile/`, `src/lib/moonboard/`, etc.).
- Keep diffs focused — avoid drive-by formatting or unrelated fixes.

### Integrations in this repo

| Feature | Main code | SQL run script |
|---------|-----------|----------------|
| MoonBoard | `src/lib/moonboard/`, profile panel | `RUN_MOONBOARD.sql` |
| 27crags | `src/lib/crags27/` | `RUN_CRAGS27.sql` |
| 8a.nu | `src/lib/eighta/` | `RUN_EIGHTA.sql` |
| Workout photos | `src/app/api/workout-photo/` | `RUN_WORKOUT_PHOTOS_STORAGE_FIX.sql` |

MoonBoard **server login** is often blocked (403). Logbook import via screenshot + manual grid is the supported path.

---

## Checks before requesting review

```bash
npm run build
npm run lint
```

Manually test the flows you changed on the **Vercel preview** URL.

---

## Deploy

- **Production:** automatic when a PR is merged to `main`.
- **Previews:** every PR gets its own Vercel URL.
- The owner may run `git push origin main` for releases; contributors should normally merge via PR only.

After deploy, confirm `APP_UI_VERSION` in the live app sidebar.

---

## Questions

- **Repo / process:** open a GitHub Discussion or comment on the PR.
- **Secrets / Supabase / Vercel access:** contact the repo owner.
- **“Is this on production?”** check nav version + Vercel deployment for `main`.
