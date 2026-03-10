---
name: gitavale
description: >
  Gitavale is a SaaS tool that turns any public GitHub repository into an LLM-ready
  text digest. Use this skill whenever the user wants to: analyze a GitHub repo, 
  generate a codebase context for an LLM, use the Gitavale web app or API, manage 
  their Gitavale archives, upgrade to Pro, manage API keys, integrate Gitavale into 
  CI/CD, call the Gitavale REST API programmatically, or work with the Gitavale CLI.
  Trigger on: "gitavale", "analyze repo", "LLM digest", "codebase context", 
  "repo to text", "gitavale CLI", "gitavale API", "gitavale archive".
---

# Gitavale

> Turn any GitHub repository into an LLM-ready text digest. Supports web app, REST API, and CLI.

Gitavale fetches a GitHub repo's file tree, concatenates source files, and produces a
single optimized markdown digest ready to paste into any LLM context window.

**Live app**: <https://gitaval.vercel.app>  
**Stack**: Next.js 14, Prisma, PostgreSQL (Neon), NextAuth.js, Polar.sh (payments)

---

## Web App — Quick Reference

### Authentication

- Register: `POST /api/auth/register` — `{ name, email, password }`
- Login: NextAuth credentials at `/login`
- Session: `getServerSession(authOptions)` in server components

### Analyze a Repo (UI)

1. Go to the homepage or `/dashboard`
2. Paste a GitHub URL: `https://github.com/owner/repo`
3. Click **Analyze** → Download digest or copy to clipboard

### Usage Limits

| Plan | Analyses/month | Archives | API Access |
|------|---------------|----------|------------|
| Anonymous | 1 (localStorage) | — | — |
| Free | 3 | ✅ | — |
| Pro (€5/mo) | Unlimited | ✅ | ✅ |

---

## REST API — Public `/api/v1`

All endpoints require: `Authorization: Bearer gta_<your_key>`  
API keys are managed at `/dashboard/api-keys` (Pro only).

### Analyze a Repository

```bash
POST /api/v1/analyze
Content-Type: application/json

{ "url": "https://github.com/owner/repo" }
```

Response: `{ archiveId, digest, summary, fileCount, tokenCount }`

### List Archives

```bash
GET /api/v1/archives?page=1&limit=20
```

Response: `{ archives: [...], pagination: { page, limit, total, pages } }`

### Get Archive (with full digest)

```bash
GET /api/v1/archives/:id
```

Response: `{ id, repoUrl, owner, repoName, digest, promptTemplate, timestamp }`

### Error Codes

| Code | Meaning |
|------|---------|
| 401 | Invalid or missing API key |
| 403 | Pro subscription required |
| 429 | Monthly analysis limit reached |
| 500 | Analysis failed (repo not found / private) |

---

## CLI — `cli-anything-gitavale`

### Installation

```bash
cd cli-anything-gitavale
pip install -e .
```

### Authentication

```bash
cli-anything-gitavale --json auth login --key <YOUR_API_KEY>
```

Get your API key from `/dashboard/api-keys` on the web app.

### Analyze a Repository

```bash
# Save digest to file
cli-anything-gitavale --json analyze "https://github.com/owner/repo" -o digest.txt

# Print to stdout
cli-anything-gitavale --json analyze "https://github.com/owner/repo"
```

### List Previous Projects

```bash
cli-anything-gitavale --json projects list
```

### Interactive REPL

```bash
cli-anything-gitavale
```

---

## Database Schema (Prisma)

Key models:

```prisma
model User {
  id            String    @id @default(cuid())
  email         String?   @unique
  plan          String    @default("free")   // "free" | "pro"
  analysisCount Int       @default(0)
  apiKeys       ApiKey[]
  projects      Project[]
}

model Project {
  id             String   @id @default(cuid())
  userId         String
  repoUrl        String
  owner          String
  repoName       String
  fileCount      Int
  tokenCount     Int
  promptTemplate String?
  exportFormat   String?
  digest         String?  @db.Text
  timestamp      DateTime @default(now())
}

model ApiKey {
  id         String    @id @default(cuid())
  name       String
  keyHash    String    @unique   // SHA-256 — never stored in plain text
  keyPrefix  String              // "gta_xxxxxxxx..."
  userId     String
  lastUsedAt DateTime?
  createdAt  DateTime  @default(now())
}
```

---

## Key API Routes (Internal)

| Route | Method | Auth | Description |
|-------|--------|------|-------------|
| `/api/analyze` | POST | Optional | Analyze repo (rate-limited) |
| `/api/projects` | GET/POST | Session | List/save archives |
| `/api/projects/[id]/download` | GET | Session | Download digest as .txt |
| `/api/api-keys` | GET/POST | Session | List/generate API keys |
| `/api/api-keys/[id]` | DELETE | Session | Revoke API key |
| `/api/checkout` | GET | Session | Redirect to Polar.sh checkout |
| `/api/billing/portal` | GET | Session | Redirect to Polar billing portal |
| `/api/webhook/polar` | POST | — | Polar webhook (updates plan) |
| `/api/profile` | PATCH | Session | Update name/password/avatar |

---

## Environment Variables

```env
DATABASE_URL=            # PostgreSQL connection string (Neon)
NEXTAUTH_URL=            # App base URL (e.g. https://gitaval.vercel.app)
NEXTAUTH_SECRET=         # Random secret for JWT
GITHUB_TOKEN=            # Optional: GitHub PAT for higher rate limits
POLAR_ACCESS_TOKEN=      # Polar.sh organization access token
POLAR_PRODUCT_ID=        # 918ecf9f-efe1-4e6b-a3d5-7a034aef67d8
POLAR_WEBHOOK_SECRET=    # polar_whs_V28K...
POLAR_SERVER=            # "production" | "sandbox"
```

---

## Agent Usage Pattern

When a user needs to analyze a GitHub repo in your current session:

```bash
# 1. Authenticate (one time)
cli-anything-gitavale --json auth login --key gta_YOUR_KEY

# 2. Analyze and write to context file
cli-anything-gitavale --json analyze "https://github.com/owner/repo" -o /tmp/repo_context.txt

# 3. Read the context file and answer user questions
cat /tmp/repo_context.txt
```

Or via the REST API directly:

```bash
curl -X POST https://gitaval.vercel.app/api/v1/analyze \
  -H "Authorization: Bearer gta_YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://github.com/owner/repo"}'
```
