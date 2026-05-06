## Repo Snapshot

- Tech: TypeScript + React (TSX) single-page client served with Vite. Server is a small Node/Express bundle built with esbuild.
- Layout: `client/` (Vite app, source), `server/` (server entry), `shared/` (shared types/code), top-level build outputs to `dist/`.
- Package manager: pnpm (see `packageManager` in `package.json`).

## Quick dev & build commands

- Install deps: `pnpm install`
- Run client dev server: `pnpm dev` (runs `vite --host` with `root` set to `client/`)
- Build production: `pnpm build` — runs `vite build` (client) then `esbuild server/index.ts` to `dist/`.
- Preview built site: `pnpm preview`
- Typecheck: `pnpm run check` (runs `tsc --noEmit`)
- Format: `pnpm run format` (prettier)

Note: package.json `start` uses `NODE_ENV=production node dist/index.js` (POSIX-style). On Windows PowerShell set the env var first: `($env:NODE_ENV = 'production'); node dist/index.js` or use a cross-env wrapper when adding scripts.

## Big-picture architecture & flow

- Vite dev server serves the client only. The Vite `root` is `client/` (see `vite.config.ts`).
- Production build places client assets into `dist/public` and the server bundle into `dist/` (build script runs both). The server entry is `server/index.ts` and is bundled by `esbuild`.
- Aliases: `@` -> `client/src`, `@shared` -> `shared` (defined in `tsconfig.json` and `vite.config.ts`). Use imports like `import { Button } from "@/components/ui/button";`.

## Project conventions & patterns to preserve

- UI primitives: `client/src/components/ui/*` are lightweight wrappers (Radix + Tailwind). Add new UI primitives following the same API shape (export default named components and small props).
- Component organization: pages under `client/src/pages/*`, reusable components under `client/src/components/`, hooks under `client/src/hooks/`, contexts under `client/src/contexts/`.
- Routing: app uses `wouter` (simple file-based routes in `App.tsx`) — use `Route`/`Switch` from `wouter` for new routes.
- Styling: Tailwind CSS and utility classes; `index.css` contains global palette and theme-related tokens — prefer adjusting palette there for global color changes.

## Integration notes & gotchas

- There is no single "dev" script that runs both client and server concurrently. `pnpm dev` only starts the Vite client. To develop server & client together, run server build/watch manually or create an npm script that runs both (e.g., via `concurrently` or `pnpm -w` tooling).
- Vite server `allowedHosts` is configured for several .manus*.computer hostnames — useful for local testing with host entries or previews.
- Plugins: `vite-plugin-manus-runtime` is included; be cautious when changing runtime assumptions.
- pnpm patches & overrides exist (see `pnpm.patchedDependencies` and `pnpm.overrides` in `package.json`) — don't remove those without validating downstream effects.

### Server presence note & running client+server in dev

- The `package.json` build script references `server/index.ts` (bundled by `esbuild`), but this repository copy does not contain a `server/` folder or `server/index.ts` file. If you add a server entry, follow the notes below.
- Two safe options to run client + server during development (pick one):

  Option A — add `concurrently` (explicit, cross-platform):

  1. Install: `pnpm add -D concurrently`
  2. Add scripts to `package.json`:

     ```json
     "scripts": {
       "dev": "vite --host",
       "dev:server": "tsx server/index.ts", // or your server watch command
       "dev:all": "concurrently \"pnpm dev\" \"pnpm run dev:server\""
     }
     ```

  3. Run: `pnpm run dev:all`

  Option B — use two terminals (no new deps) — recommended when server tooling varies:

  - Terminal 1 (PowerShell):

    ```powershell
    pnpm dev
    ```

  - Terminal 2 (PowerShell):

    ```powershell
    ($env:NODE_ENV = 'development'); pnpm run dev:server
    ```

  Replace `dev:server` with an appropriate watcher for your server (e.g., `tsx`, `ts-node-dev`, or `nodemon` + a compiled JS entry).

  Note about Windows env vars: `package.json` currently sets `NODE_ENV=production` in `start` which is POSIX-style; use PowerShell form `($env:NODE_ENV = 'production'); node dist/index.js` or add cross-env to scripts for cross-platform compatibility.

## Examples to copy/paste

- Import a UI primitive: `import { Dialog } from "@/components/ui/dialog";`
- Theme provider usage (see `client/src/App.tsx`):
  ` <ThemeProvider defaultTheme="light" switchable>...</ThemeProvider>`
- Example component pattern (local state + callbacks): `client/src/components/ManusDialog.tsx` — handle controlled vs uncontrolled `open` by accepting `open`, `onOpenChange`, and keeping internal state when `onOpenChange` is not supplied.

## What to avoid / not assume

- Don't assume tests are wired: `vitest` exists in devDependencies, but there's no `test` script. Run `pnpm exec vitest` to run tests if you add them.
- Do not assume a monorepo tool (like turborepo) — this repo uses pnpm and plain scripts.

## Where to look for more context

- Entrypoints: `client/src/main.tsx`, `server/index.ts` (server behavior and APIs)
- UI primitives & patterns: `client/src/components/ui/*`
- App-level wiring: `client/src/App.tsx`, `client/src/contexts/ThemeContext.tsx`

If anything above is unclear or you want this file to emphasize different areas (testing, API surface, or server structure), tell me what to expand and I'll iterate.
