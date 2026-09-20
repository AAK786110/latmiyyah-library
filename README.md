# Nauha Library

A searchable library of Shia latmiyyahs/qasidas with Arabic lyrics, English
translations, smart search, an "Explore" mode for non-technical users, a
public submission/edit-suggestion system, and a creator dashboard - all
backed by Supabase.

## 1. Project structure

```
latmiyyah-library/
├── src/
│   ├── app/                     Next.js pages (App Router)
│   │   ├── page.tsx              Homepage
│   │   ├── search/                Advanced filter/search page
│   │   ├── explore/               Simple guided "Explore" mode
│   │   │   └── [category]/[value]/  Explore results page
│   │   ├── favourites/            Favourites page (localStorage-backed)
│   │   ├── submit/                Public "Add Your Own Submission"
│   │   ├── latmiyyah/[slug]/      Individual latmiyyah page
│   │   ├── login/                 Creator login
│   │   ├── dashboard/             Creator dashboard
│   │   │   ├── new/                 Create a latmiyyah
│   │   │   ├── edit/[id]/           Edit a latmiyyah
│   │   │   ├── submissions/         Review public submissions
│   │   │   └── edits/               Review suggested edits
│   │   └── random/                Random latmiyyah redirect
│   ├── components/                Shared UI components
│   ├── lib/
│   │   ├── supabase/               Browser + server Supabase clients
│   │   ├── search/                 Normalization, alias dictionary, fuzzy ranking
│   │   ├── types.ts                 Shared TypeScript types + stanza parsing
│   │   ├── validation.ts            Arabic/English alignment validator
│   │   ├── favourites.ts            localStorage favourites helper
│   │   └── useRequireAuth.ts        Dashboard auth guard
│   └── middleware.ts               Refreshes the Supabase session cookie
├── supabase/
│   ├── schema.sql                  Tables, indexes, starter tags
│   └── policies.sql                Row Level Security policies
├── package.json
└── .env.local.example
```

## 2. Install & run locally (VS Code)

Requires Node.js 18+.

```bash
npm install
cp .env.local.example .env.local
# then fill in .env.local with your Supabase values - see step 3
npm run dev
```

Open http://localhost:3000.

## 3. Connect Supabase

1. Create a project at https://supabase.com (free tier is fine to start).
2. In **Project Settings → API**, copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   Put both into `.env.local`. Never copy the **service_role** key into the
   frontend - it's not used anywhere in this project.
3. In **SQL Editor**, run `supabase/schema.sql`, then run
   `supabase/policies.sql`.
4. Create your creator account: **Authentication → Users → Add user**,
   enter an email/password. This is done privately in the Supabase
   dashboard - there is no public signup page, and your email is never
   shown anywhere on the site.
5. Restart `npm run dev` after editing `.env.local`.

Log in at `/login` with the account you just created - you'll be taken to
`/dashboard`.

## 4. How the important parts work

**Auth & permissions.** The frontend never trusts its own auth state to
decide what's allowed - Postgres Row Level Security does that (see
`supabase/policies.sql`). Any authenticated user counts as "the creator"
since you said you'll only ever have one account; the frontend's
`useRequireAuth` hook only exists to redirect logged-out visitors to
`/login` for a good UX, not as the actual security boundary.

**Search.** `src/lib/search/aliases.ts` holds a canonical-name dictionary
(e.g. "husayn" ↔ "hussain"/"hussein"/"حسين"). `normalize.ts` strips Arabic
diacritics and letter variants and punctuation. `fuzzySearch.ts` combines
alias expansion with a small Levenshtein fallback for minor typos, then
ranks results. To teach the site a new spelling variant, just add it to the
relevant array in `aliases.ts` - no other code changes needed.

**Filters vs. Explore.** Both read from the same `tags` table. The
`/search` page implements OR-within-category, AND-across-category logic.
The `/explore` page is a simplified, one-tap-per-category version aimed at
less technical users, built from the same tags.

**Arabic/English alignment.** `src/lib/validation.ts` splits both texts into
stanzas (blank line = new stanza) and checks stanza counts and per-stanza
line counts match, surfacing specific errors like "Arabic stanza 4 has 5
lines but English stanza 4 has 4." Publishing is blocked while errors
remain; drafts can still be saved.

**Favourites.** Since anonymous visitors don't have accounts, favourites
are stored in `localStorage` (`src/lib/favourites.ts`) and persist across
refreshes on the same device/browser.

**Spam protection.** The public submission form includes a honeypot field
(invisible to real visitors, filled in by most bots). This is a lightweight
first line of defence, not a complete solution - see the note at the
bottom of `supabase/policies.sql` for how to add stronger protection
(Cloudflare Turnstile/reCAPTCHA, or an Edge Function rate-limiter) once the
site gets real traffic.

## 5. Deployment

The easiest path is [Vercel](https://vercel.com) (made by the Next.js
team):

1. Push this project to a GitHub repo.
2. In Vercel, "New Project" → import the repo.
3. Add the same two environment variables from `.env.local` in Vercel's
   project settings (Environment Variables).
4. Deploy. Vercel builds and hosts it automatically on every push.

## 6. Values you need to replace yourself

- `.env.local`: your real Supabase URL + anon key (never commit this file -
  it's already gitignored).
- Your creator email/password, created directly in the Supabase dashboard.
- The starter tags in `schema.sql` are a reasonable starting set - add,
  rename, or remove them anytime from the dashboard's tag manager in the
  latmiyyah form, no SQL required after initial setup.

## 7. Extending later

- Swap `src/lib/types.ts`'s placeholder `Database = any` for real generated
  types once your schema stabilizes:
  `npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/lib/types.ts`
  (then re-add the `parseStanzas` helper and convenience types below it).
- Components are split by responsibility (LyricsView, TranslationView,
  FilterPanel, etc.) specifically so you can redesign one piece - e.g. "only
  redesign the homepage" - without touching data-fetching or database code.
