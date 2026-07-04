# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `pnpm run dev` - start dev server (http://localhost:3000)
- `pnpm run build` - production build
- `pnpm run start` - run production build (run `build` first)
- `pnpm run lint` - ESLint

There is no test suite/framework configured in this project.

Package manager is `pnpm` (see `pnpm-lock.yaml`); use it instead of npm/yarn for installs.

Requires a `.env` file (see `.env.example`) with `ADMIN_USER` and `ADMIN_PASSWORD` for the master admin login. `NEXT_PUBLIC_API_URL` can stay empty for local dev (requests hit relative `/api/...`).

## Architecture

Next.js 16 App Router + React 19 app. **No database** — all persistence is flat JSON files in `data/` (`bd_board.json`, `bd_users.json`, `bd_logs.json`), read/written directly via `fs/promises` inside Next.js Route Handlers (`app/api/**/route.ts`). Each route does its own `ensureFile()`-then-read-modify-write; there is no shared data-access layer, no transactions, and no auth/role check on the API routes themselves — access control is enforced client-side only (see below).

### Auth model (client-trusted session)

- `POST /api/auth/login` ([app/api/auth/login/route.ts](app/api/auth/login/route.ts)) checks the submitted credentials against `ADMIN_USER`/`ADMIN_PASSWORD` env vars (role `admin`) or against entries in `data/bd_users.json` (role `user`, each tied to one `assignedBoardId`). On success it sets a `session_token` cookie that is just base64-encoded JSON (`{ user, role, assignedBoardId, expiresAt }`) — **not signed/encrypted**, `httpOnly: false`.
- [components/auth/app-shell.tsx](components/auth/app-shell.tsx) reads/decodes that cookie client-side (`getSessionFromCookie`) to decide whether to show `LoginForm`, the admin panel, or a board. `session.role` gates UI features throughout (e.g. `session.role === "user"` restricts a standard user to their `assignedBoardId` and hides column-editing controls in `kanban-board.tsx`).
- Because API routes don't independently verify the cookie/role, any server-side authorization work must be added to the route handlers themselves, not just the UI.

### Data model

Types live in [lib/kanban-types.ts](lib/kanban-types.ts):
- `AppState` = `KanbanBoardData[]` (multiple independent boards), each board has `columns: KanbanColumn[]`, each column has `stories: UserStory[]`.
- The whole `AppState` array is the unit of persistence for `/api/board` — the client fetches the entire tree and POSTs the entire tree back on every mutation (no per-entity endpoints for boards/columns/stories).

### State flow

- [hooks/use-kanban-storage.ts](hooks/use-kanban-storage.ts) is the single source of truth for board data on the client: fetches `AppState` from `/api/board` on mount, then re-POSTs the full state to `/api/board` on every change via a `useEffect` watching `boards` (guarded by an `initialized` ref so the initial load doesn't immediately re-save). `addBoard`/`deleteBoard`/`renameBoard`/`updateBoardColumns` all mutate local state; persistence follows automatically.
- [hooks/use-users.ts](hooks/use-users.ts) and [hooks/use-logs.ts](hooks/use-logs.ts) follow the analogous pattern against `/api/users` and `/api/logs`.
- `lib/utils.ts` exports `API_URL` (from `NEXT_PUBLIC_API_URL`), prefixed onto every client fetch call — needed for deployments where the app is served from a different origin than its API.

### Audit logging

Mutating actions in `kanban-board.tsx` (create/edit/delete/move story, etc.) call `createLog({ userId, action, details })` from `use-logs.ts`, which POSTs to `/api/logs`. Logs are prepended (newest first) and capped at 1000 entries server-side. Viewed via the admin panel (`components/admin/logs-viewer.tsx`).

### Images

`POST /api/upload` ([app/api/upload/route.ts](app/api/upload/route.ts)) accepts up to 5 image files via `FormData`, writes them to `public/uploads/` with a `Date.now()`-prefixed sanitized filename, and returns their public URLs to be stored in a `UserStory.images` array.

### UI layer

- shadcn/ui ("new-york" style, Radix UI primitives) in `components/ui/` — treat these as generated/vendored; prefer composing them over editing, unless a genuine upstream bug needs fixing.
- Feature components are organized by domain: `components/kanban/` (board/column/story CRUD + `@dnd-kit`-based drag-and-drop reordering), `components/admin/` (user management + log viewer), `components/auth/` (login + the top-level `AppShell` router described above).
- `next.config.mjs` sets `typescript.ignoreBuildErrors: true` and `images.unoptimized: true` — production builds will not fail on type errors, so rely on `pnpm run lint` / editor diagnostics, not the build, to catch type issues.
