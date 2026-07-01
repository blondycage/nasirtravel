# Repository Guidelines

## Project Structure & Module Organization

This is a Next.js App Router project for Naasir Travel. Route pages, layouts, and API endpoints live in `app/`; examples include `app/packages/page.tsx`, `app/admin/*`, and `app/api/*/route.ts`. Reusable UI belongs in `components/`, with admin-specific pieces in `components/admin/`. Shared React hooks are in `hooks/`, while database, auth, email, Cloudinary, Stripe, PDF helpers, and Mongoose models are in `lib/` and `lib/models/`. Static assets are served from `public/`. Database seed utilities live in `scripts/`.

## Build, Test, and Development Commands

- `npm install`: install dependencies from `package-lock.json`.
- `npm run dev`: start the local Next.js server at `http://localhost:3000`.
- `npm run build`: run the production build and TypeScript checks.
- `npm run start`: serve the built production app.
- `npm run lint`: run the configured Next.js lint command.
- `npm run seed`: seed tours, users, bookings, and reviews.
- `npm run seed:test`: seed application-flow test data; this clears selected user, booking, and dependant data.

Both `package-lock.json` and `pnpm-lock.yaml` are present. Avoid changing both in one contribution unless you are intentionally updating package manager state.

## Coding Style & Naming Conventions

Use TypeScript with strict mode and the `@/*` path alias from `tsconfig.json`. Prefer functional React components, Tailwind CSS utility classes, and existing component patterns before adding abstractions. Name components in PascalCase (`BookingForm.tsx`), hooks in camelCase with a `use` prefix (`useAuth.ts`), and Mongoose model files in PascalCase (`User.ts`). Keep API logic grouped by route under `app/api`.

## Testing Guidelines

There is no dedicated test runner configured yet. For now, verify changes with `npm run lint` and `npm run build`, then manually exercise affected flows. Use `npm run seed:test` plus `TEST_PLAN.md` for application-system scenarios. When adding automated tests, colocate them near the feature as `*.test.ts` or `*.test.tsx` and document the new command in `package.json`.

## Commit & Pull Request Guidelines

Recent commits are short and informal (`fix`, `fixed`, lockfile updates). Use clearer imperative messages such as `fix booking payment status` or `add admin review filters`. Pull requests should describe the user-facing change, list verification steps, note database or environment changes, and include screenshots for UI updates.

## Security & Configuration Tips

Keep secrets in local `.env` files and never commit real credentials. Email, MongoDB, Stripe, Cloudinary, and auth-related changes should mention required environment variables in the PR. Treat seed scripts as destructive unless their scope is explicitly documented.
