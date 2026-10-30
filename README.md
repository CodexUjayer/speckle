# Speckle

The cinematic landing page for **Speckle**, the satellite hazard-detection engine built by
team **Dancing with the SARs** for the **NASA Space Apps Challenge 2026**.

The page tells one continuous story in eleven chapters: from orbit, down through the
clouds, into the landscapes the engine watches, and through the machine itself. It is
built as a scroll-driven film: a WebGL Earth for the opening chapters, then pinned,
crossfading terrain sequences and exploded-architecture sequences for the rest.

Everything the page claims about the engine (pipeline names, codes, verdict vocabulary,
architecture stages) is taken from the
[engine repository](https://github.com/Tech-Doomsday/Dancing_With_SARs) so the landing
page can never promise a module that does not exist. If the engine changes, update the
data file listed below and the page stays honest.

---

## Quick start

```bash
bun install        # or npm install / pnpm install
bun run dev        # http://localhost:3000
```

Other scripts:

| Script | What it does |
| --- | --- |
| `bun run dev` | Dev server on port 3000 |
| `bun run build` | Production build (standalone output) |
| `bun run start` | Serve the production build |
| `bun run lint` | ESLint, includes Next.js rules |

Requires Node 20+ (or Bun 1.1+). No environment variables are needed to run the page.

---

## Where to edit what

This is the short tour for anyone joining the project. Almost everything you will
want to change lives in **one file**.

### All words on the page: `src/components/speckle/data.ts`

Every headline, paragraph, chapter label, button label, image alt text, footnote and
disclaimer is defined here as plain data. You should almost never need to touch a
component to change text. The main exports:

| Export | Controls |
| --- | --- |
| `HERO`, `CHAPTER_2` … `FINALE` | The chapter title cards and their copy |
| `SECTORS` | Chapter IV: the three terrain systems (quake / storm / river) |
| `PIPELINES`, `VERDICT_TIERS`, `EVIDENCE` | Chapter V: the engine watchlist, verdict vocabulary, compare slider |
| `INNOVATION` | Chapter VI: the three rules and the open-science ledger |
| `ARCHITECTURE` | Chapter VII: the five stages, their chips and side notes |
| `CORRELATIONS` | Chapter VIII: the six event → signature → consequence chains |
| `IMPACT` | Chapter IX: audiences and the life-of-an-answer strip |
| `HOME` | Chapter X: the Bangladesh watchlist |
| `FOOTER` | Footer blurb, disclaimer, credits |

### Links: `LINKS` in the same file

All external destinations (engine repo, architecture doc, Space Apps) are centralized
in `LINKS` at the top of `data.ts`. The "Start exploring" button follows
`NEXT_PUBLIC_SPECKLE_APP_URL` if you set it (for example `/console` once the app UI is
deployed); until then it points at the repository, which is the honest destination.

### Look and feel: `src/app/globals.css`

The whole site shares one accent and one deep-space dark (see the `THEMES` map in
`data.ts`). Fonts, the film grain, the vignette, the architecture slab styles and the
chapter spacing all live in `globals.css`. The layout of each chapter is in
`src/components/speckle/sections/*.tsx`.

### The 3D opening: `src/components/speckle/earth/`

`Stage.tsx` (camera and scene), `shaders.ts` (the Earth and cloud materials),
`choreo.ts` (what the overlays read). Textures are in `public/textures/`.

### Adding or reordering a chapter

Chapters VI to XI are mounted in **two** places, and both must stay in sync:

- `src/components/speckle/ScrollChapters.tsx` (the full experience)
- `src/components/speckle/StaticStory.tsx` (the no-WebGL fallback)

Add the copy to `data.ts` first, then mount the section component in both files in the
same order. The chapter kickers ("Chapter VII · How Speckle is built") are just strings,
so renumbering is a copy edit.

---

## How the experience is put together

```
src/app/page.tsx            mounts <Experience/>
src/components/speckle/
  Experience.tsx            the shell: loader, gate, Earth stage, story
  scroll.ts                 the scroll timeline (one damped progress for everything)
  Loader.tsx                the dark loading veil
  Nav.tsx                   the minimal fixed wordmark
  StoryTranscript.tsx       the whole story in reading order, for screen readers
  StaticStory.tsx           full static fallback when WebGL is unavailable
  ScrollChapters.tsx        chapters IV to XI as pinned scroll sequences
  earth/                    the WebGL Earth chapters (I to III)
  overlays/                 typography that floats over the Earth stage
  sections/                 the in-flow chapters (VI to XI)
  data.ts                   ALL copy, themes and links (edit here first)
```

A few principles worth keeping as the page evolves:

- **Nothing moves on its own.** Every animation is driven by scroll position (damped in
  `scroll.ts`), except the loader. If you add motion, drive it from the same progress.
- **One film, one grade.** One accent, one dark. Resist per-section colour schemes.
- **Two render paths, always.** Any new chapter must work in `StaticStory` and with
  `prefers-reduced-motion`, not only in the full WebGL experience. The compare slider,
  the architecture take-apart and the correlation chains all have quiet fallbacks
  already; follow that pattern.
- **Facts come from the repo.** Pipeline codes and names in `data.ts` mirror
  `engine/pipelines/*/manifest.yaml` in the engine repository. When a pipeline ships,
  flip its `live` flag in `PIPELINES` and the relevant `SECTORS` / `CORRELATIONS`
  entries in the same edit.

---

## Accessibility notes

- `StoryTranscript.tsx` renders the Earth chapters as plain reading order for
  assistive technology, visually hidden from sighted users.
- Every interactive control is keyboard reachable; the compare slider is draggable
  and arrow-key operable.
- All imagery has descriptive alt text (in `data.ts`).
- Reduced-motion visitors get the flat, readable versions of every pinned sequence.

---

## Infrastructure that is idle (on purpose)

- **Prisma + SQLite** (`prisma/`, `db/`) are configured but unused: the landing page is
  fully static and needs no database. They are left in place for future server-side
  features (for example a contact form or a launch-notice signup). Run
  `bun run db:push` after changing `prisma/schema.prisma`.
- **`examples/websocket/`** holds a tiny reference client + server for adding realtime
  features later (see the Next.js + socket.io pattern).
- **`mini-services/`** is an empty placeholder for side services, should the landing
  page ever need one.
- **`src/app/api/route.ts`** is a minimal health endpoint (`GET /api`), useful for
  uptime checks once deployed.

## Deploying

Any Node host that runs Next.js 16 works (Vercel is the path of least resistance).
Set `NEXT_PUBLIC_SPECKLE_APP_URL` at deploy time to send the final call-to-action to the
real console instead of the repository. Nothing else is required.

The page is heavy on media (WebGL textures, one background video, WebP landscapes), so
make sure your host serves `public/` with long cache headers; the filenames are stable.

---

*An Earth-observation story built for NASA Space Apps Challenge 2026, Dancing with the
SARs. Not affiliated with or endorsed by NASA. Earth imagery: NASA Visible Earth.*
