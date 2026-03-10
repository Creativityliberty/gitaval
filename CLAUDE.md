# Gitavale

Gitavale turns any public GitHub repository into an LLM-ready text digest.

## Skills

The following agent skills are available in `.agents/skills/`:

- **gitavale**: Full documentation for the Gitavale web app, REST API, and CLI.
  Read `.agents/skills/gitavale/SKILL.md` for all endpoints, database schema, env vars, and usage patterns.

## Key Commands

```bash
# CLI: Analyze a GitHub repo
cli-anything-gitavale --json analyze "https://github.com/owner/repo" -o digest.txt

# API: Analyze via REST
curl -X POST https://gitaval.vercel.app/api/v1/analyze \
  -H "Authorization: Bearer gta_YOUR_KEY" \
  -d '{"url": "https://github.com/owner/repo"}'
```

## Architecture

- **App**: Next.js 14 in `/app` directory
- **DB**: Prisma + PostgreSQL (Neon) — schema in `prisma/schema.prisma`
- **Auth**: NextAuth.js — config in `lib/auth.ts`
- **Payments**: Polar.sh — config in `lib/polar.ts`
- **API Keys**: SHA-256 hashed, prefix `gta_` — auth in `lib/apiAuth.ts`
- **CLI**: Python CLI in `cli-anything-gitavale/`

## Dev Setup

```bash
npm install
npm run dev
```

Requires `.env` with `DATABASE_URL`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`.
