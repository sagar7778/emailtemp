# Temp Mail Clone

## Getting Started

Run the dev server:

```bash
npm run dev
```

Open http://localhost:3000

## Environment Variables

- NEXT_PUBLIC_SITE_URL: Your site URL (used for canonical and social tags)
- TEMPMAIL_API_KEY (optional): Enables the paid provider stub

Create a .env.local as needed:

```
NEXT_PUBLIC_SITE_URL=http://localhost:3000
# TEMPMAIL_API_KEY=your-key
```

## Smoke Test

With the dev server running:

```bash
npm run smoke
```

This script checks:
- GET /api/providers → returns providers array
- GET /api/qr?text=... → returns a PNG buffer

## Troubleshooting

- Tailwind unknown utility: ensure `src/app/globals.css` uses `@import "tailwindcss";`
- Module alias `@/` not resolving: check `tsconfig.json` paths include `"./src/*"` and `"./*"`, or move `lib/` under `src/`
- Providers failing: most errors become PROVIDER_UNAVAILABLE; check server logs for `API_ERROR` codes (no secrets logged)

## Deploy on Vercel

- Set `NEXT_PUBLIC_SITE_URL` in project env
- Optionally set `TEMPMAIL_API_KEY` to enable the paid provider
- Deploy as Next.js App Router project. No special build steps beyond `npm run build`
