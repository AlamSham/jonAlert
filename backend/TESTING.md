# Backend Testing Guide

## 1) Start Backend

```bash
cd backend
npm install
npm run dev
```

## 2) Import Postman Collection

Import:
- `backend/postman/job-automation-backend-tests.postman_collection.json`

Set collection variables:
- `baseUrl`: `http://localhost:5000`
- `cronSecret`: same as `CRON_SECRET` from `.env` (leave blank if `CRON_SECRET` is not set)

## 3) Required API Tests

- `GET /health`
- `GET /api/jobs`
- `POST /api/cron/run`

## 4) Error Testing

### Invalid inputs
- `GET /api/jobs?limit=9999` => expected `400`
- `GET /api/jobs/search?q=a` => expected `400`

### Missing API keys
- `GET /api/test/keys?scope=all`
- Returns `503` if any required key is missing.

### Rate limit
- Endpoint limit: `100 requests / 15 minutes / IP`
- Run `GET /api/test/ping` quickly 101+ times (Postman Runner)
- Expected after threshold: `429 Too many requests`

## 5) Telegram Integration Test

```bash
curl -X POST http://localhost:5000/api/test/telegram \
  -H 'Content-Type: application/json' \
  -d '{"message":"Telegram test from curl"}'
```

## 6) OpenAI Integration Test

```bash
curl -X POST http://localhost:5000/api/test/ai \
  -H 'Content-Type: application/json' \
  -d '{"title":"UP Police Recruitment 2026","description":"UP Police ne nayi recruitment notice jari ki hai.","category":"job"}'
```

## 7) Console Logs You Will See

- Request blocked by CORS
- Invalid input blocked
- Rate limit triggered
- Test ping started/completed
- AI test started/completed
- Telegram test started/completed
- Required keys test started/completed

These logs help verify each testing step and security behavior.
