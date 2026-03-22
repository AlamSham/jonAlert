# Job Automation System (Node.js + Next.js + MongoDB + OpenAI)

Production-ready automation system that fetches job notifications, rewrites them in SEO-friendly Hinglish using AI, stores unique entries in MongoDB, and publishes them via a Next.js frontend.

## Full Folder Structure

```text
jobNotification/
├─ backend/
│  ├─ .env.example
│  ├─ package.json
│  └─ src/
│     ├─ app.js
│     ├─ server.js
│     ├─ config/
│     │  ├─ db.js
│     │  └─ env.js
│     ├─ controllers/
│     │  └─ job.controller.js
│     ├─ cron/
│     │  └─ job.cron.js
│     ├─ data/
│     │  └─ sampleJobs.json
│     ├─ models/
│     │  └─ Job.js
│     ├─ middleware/
│     │  ├─ cronAuth.js
│     │  ├─ security.js
│     │  └─ validation.js
│     ├─ routes/
│     │  └─ job.routes.js
│     ├─ scripts/
│     │  └─ runCronOnce.js
│     ├─ services/
│     │  ├─ ai.service.js
│     │  ├─ job.service.js
│     │  ├─ jobSource.service.js
│     │  └─ telegram.service.js
│     ├─ validators/
│     │  └─ job.validator.js
│     └─ utils/
│        ├─ catchAsync.js
│        ├─ logger.js
│        └─ slugify.js
├─ frontend/
│  ├─ .env.example
│  ├─ package.json
│  ├─ next.config.ts
│  ├─ tailwind.config.ts
│  ├─ postcss.config.js
│  ├─ tsconfig.json
│  └─ src/
│     ├─ app/
│     │  ├─ globals.css
│     │  ├─ layout.tsx
│     │  ├─ page.tsx
│     │  ├─ jobs/page.tsx
│     │  ├─ result/page.tsx
│     │  ├─ admit-card/page.tsx
│     │  └─ job/[slug]/page.tsx
│     ├─ components/
│     │  ├─ Header.tsx
│     │  ├─ JobCard.tsx
│     │  ├─ SearchForm.tsx
│     │  └─ SectionHeader.tsx
│     └─ lib/
│        ├─ api.ts
│        └─ types.ts
├─ .gitignore
└─ README.md
```

## Features Implemented

### Backend (Node.js + Express)
- `node-cron` schedule: every 10 minutes (`*/10 * * * *`)
- Fetch jobs from configurable multi-source scrapers (`RSS + HTML`)
- Automatic fallback to sample JSON source (`src/data/sampleJobs.json`) if all live sources fail
- Duplicate prevention via MongoDB unique `sourceId` (+ slug uniqueness)
- AI rewrite with OpenAI `gpt-4o-mini`
- Stores all required fields:
  - `title`
  - `slug`
  - `content`
  - `category` (`job`, `result`, `admit-card`)
  - `createdAt`
- Additional AI fields stored: `summary`, `eligibility`, `importantDates`
- Telegram notification sent after each new job is saved
- Cron success/failure logs with counts and duration

### AI Integration
- OpenAI model: `gpt-4o-mini`
- Generates:
  - SEO-friendly Hinglish title + content
  - short summary
  - eligibility
  - important dates
- Response constrained by `max_tokens: 200`
- Fallback generator if OpenAI key is missing/fails

### Frontend (Next.js App Router + Tailwind)
Pages implemented:
- `/` Home (latest jobs)
- `/jobs`
- `/result`
- `/admit-card`
- `/job/[slug]`

Also includes:
- ISR with `revalidate = 60` across pages/data fetches
- SEO metadata for each page + dynamic metadata for slug page
- Clean Tailwind UI
- Search form integrated with backend search API

### APIs
- `GET /health`
- `GET /api/jobs?limit=20&category=job`
- `GET /api/jobs/latest?limit=12`
- `GET /api/jobs/category/:category?limit=20`
- `GET /api/jobs/:slug`
- `GET /api/jobs/search?q=keyword`
- `POST /api/cron/run` (manual trigger)
- `GET /api/test/ping`
- `GET /api/test/config`
- `GET /api/test/keys?scope=all|ai|telegram`
- `POST /api/test/telegram`
- `POST /api/test/ai`

## Setup Instructions

## 1) Backend Setup

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

Set these in `backend/.env`:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/job_automation
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4o-mini
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-1.5-flash
GROK_API_KEY=your_grok_api_key
GROK_MODEL=grok-2-latest
GROK_BASE_URL=https://api.x.ai/v1
AI_ENABLED=true
AI_QUOTA_COOLDOWN_MINUTES=60
GEMINI_QUOTA_COOLDOWN_MINUTES=60
GROK_QUOTA_COOLDOWN_MINUTES=60
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
TELEGRAM_CHAT_ID=your_telegram_chat_id
CRON_ENABLED=true
FRONTEND_URL=http://localhost:3000
SCRAPER_USER_AGENT=JobAutomationBot/1.0 (+https://example.com/bot)
JOB_SOURCES_JSON=[{"name":"Sarkari Result RSS","type":"rss","url":"https://example.com/rss/jobs.xml","category":"job"}]
JOB_SOURCES_FILE=src/data/jobSources.india-starter.json
CRON_SECRET=replace_with_strong_random_secret
```

`JOB_SOURCES_JSON` supports:
- `rss`: `name`, `type`, `url`, `category`
- `html`: `name`, `type`, `url`, `category`, `itemSelector`, `titleSelector`, `linkSelector`, `descriptionSelector`, `dateSelector`

For larger source lists, prefer `JOB_SOURCES_FILE` and keep JSON in a file.
Starter source file included:
- `backend/src/data/jobSources.india-starter.json`
- `backend/src/data/jobSources.india-aggressive.json` (central + all states + UT, priority-based)

Optional manual cron run:

```bash
npm run cron:once
```

## 2) Frontend Setup

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

Set in `frontend/.env.local`:

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
```

Open:
- Frontend: `http://localhost:3000`
- Backend health: `http://localhost:5000/health`

## Deployment

### Frontend on Vercel
- Import `frontend` folder as a Vercel project
- Add env: `NEXT_PUBLIC_BACKEND_URL=https://your-backend-domain`
- Build command: `npm run build`
- Output handled by Next.js automatically

### Backend on Node Server / Serverless
- Deploy `backend` on Railway/Render/EC2/Fly.io or serverless function platform
- Provide all backend env vars
- Ensure MongoDB and outbound internet access (OpenAI + Telegram)
- Keep one active cron runner process (avoid duplicate schedulers across replicas)

## Production Notes
- For multiple backend replicas, disable in-app cron for extra instances (`CRON_ENABLED=false`) and run one dedicated worker.
- Replace sample source with real API/scraper logic in `src/services/jobSource.service.js`.
- Add rate limiting and auth if exposing admin/trigger endpoints publicly.

## Testing
- Detailed local testing steps: `backend/TESTING.md`
- Postman collection: `backend/postman/job-automation-backend-tests.postman_collection.json`
