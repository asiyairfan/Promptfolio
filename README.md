# AI Portfolio Builder

A hackathon MVP that turns a resume PDF into a live, tailored portfolio site.

## Flow

1. **Upload** — drop a resume PDF (or use the sample).
2. **Review** — edit the AI-parsed profile, experience, education, projects, and skills.
3. **Style** — pick a layout and color preset; preview live.
4. **Publish** — deploy a static site to Vercel and get a public URL.

Optional: paste a job description on upload and the AI will re-weight experience, projects, and skills to match the role.

## Tech stack

- **Monorepo**: npm workspaces (`shared`, `backend`, `frontend`)
- **Backend**: Node.js + Express, `pdf-parse` for extraction, Groq OpenAI-compatible API for parsing
- **Frontend**: Vite 6 vanilla-JS SPA
- **Rendering**: pure JS/HTML/CSS string generation from design tokens
- **Publishing**: Vercel REST API (`/v13/deployments`) with inline base64 files

## Setup

Copy `backend/.env.example` to `backend/.env` and fill in:

```env
PORT=3003
FRONTEND_ORIGIN=http://localhost:5173
GROQ_API_KEY=your_groq_key
GROQ_BASE_URL=https://api.groq.com/openai/v1
GROQ_MODEL=qwen/qwen3.8-27b
VERCEL_TOKEN=your_vercel_token
PUBLIC_BASE_URL=http://localhost:3003
```

If `VERCEL_TOKEN` is omitted, publishing falls back to local files served from `backend/published`.

## Run locally

From the repo root:

```bash
npm install
npm run dev
```

This starts the backend on `http://localhost:3003` and the frontend on `http://localhost:5173`.

## Project structure

```
├── shared/
│   ├── resume-schema.js    # Empty resume + coercion
│   ├── style-presets.js    # Layouts + color presets
│   ├── render.js           # Portfolio HTML/CSS renderer
│   └── sample-resume.json
├── backend/
│   ├── server.js
│   ├── routes/             # extract, parse, publish
│   └── services/           # pdf, ai, deploy
└── frontend/
    └── src/
        ├── main.js         # App shell + state
        ├── api.js          # Backend wrappers
        ├── dom.js          # `el()` helper
        └── steps/          # upload, review, style, publish
```

## API endpoints

- `GET /api/ping` — health check
- `POST /api/extract-text` — multipart PDF upload → `{ text }`
- `POST /api/parse-resume` — `{ text, jobDescription?, suggestStyle? }` → `{ resume, styleSuggestion?, warnings? }`
- `POST /api/publish` — `{ resume, layout, preset }` → `{ url, provider, deploymentId }`

## Notes

- New Vercel projects created by this app are automatically patched to disable SSO protection so the deployment URL is public.
- Deployments expire after 30 days on Vercel's hobby plan unless linked to a permanent project.
