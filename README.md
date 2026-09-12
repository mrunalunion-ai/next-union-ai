<<<<<<< HEAD
# next-unionai
=======
# UnionAI-Web

Production-ready Next.js (App Router) + TypeScript starter.

## Structure

- `app/` — routes (App Router), including `(auth)` and `(dashboard)` route groups and `api/` route handlers
- `components/ui/` — base UI primitives (button, card, input, label, dialog)
- `components/layouts/` — page shells (main layout, dashboard/sidebar layout)
- `components/provider/` — app-wide providers (Redux, theme, toasts)
- `components/auth/` — auth guards
- `redux/` — Redux Toolkit store and feature slices
- `services/rest/` — HTTP client and API request helpers
- `services/socket/` — WebSocket client/context
- `lib/` — shared utilities (`cn`, fonts)
- `hooks/` — shared React hooks
- `utils/` — helper functions, zod schemas, shared types
- `constant/` — route and site-wide constants
- `styles/` — global CSS

## Getting started

```bash
npm run dev
```

Open http://localhost:3000.
>>>>>>> 99c0888 (Initial commit)
