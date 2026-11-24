# ContentRocket

ContentRocket is a React and Django creator workspace with JWT authentication, persistent data models, CRUD modules, and AI tools.

## Prerequisites

- Node.js 20+
- Python 3.14+
- A Gemini API key when using AI generation

## Backend

```powershell
cd D:\CreatorDesk\backend
copy .env.example .env
python -m pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 127.0.0.1:8000
```

ContentRocket uses a local Ollama model by default, so AI generation does not require a paid API key. Install Ollama, then run:

```powershell
ollama run gemma4
```

Keep Ollama running while using ContentRocket. To use Gemini instead, set `AI_PROVIDER=gemini` and `GEMINI_API_KEY` in `backend/.env`. Provider quotas still apply; the app reports provider errors rather than returning fake output. Restart Django after changing provider settings.

## Frontend

```powershell
cd D:\CreatorDesk\frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

## API

- `POST /api/auth/register/`
- `POST /api/auth/login/`
- `POST /api/auth/refresh/`
- `GET /api/auth/me/`
- `GET|POST|PATCH|DELETE /api/creators/profile/`
- `POST /api/ideas/generate/`
- `POST /api/scripts/generate/`
- `POST /api/captions/generate/`
- `/api/calendar/posts/`
- `/api/content/assets/`
- `/api/analytics/performance/`
- `/api/collaborations/brands/`
- `/api/tasks/tasks/`
- `/api/competitors/profiles/`
- `/api/competitors/observations/`

All private endpoints require `Authorization: Bearer <access-token>`. Django migrations and ownership filtering protect and persist user records.

## Deployment (Vercel + Render + Neon)

The frontend and Django API deploy separately. The local SQLite database is only for development. For a no-cost demo, use Vercel Free for the frontend, Render Free for Django, and Neon Free for PostgreSQL. Check current plan limits before launch: Render Free services sleep after 15 minutes without traffic, and Render Free Postgres expires after 30 days; Neon Free has usage and storage limits.

1. Push the project to GitHub. Keep `backend/.env` out of Git; it contains local secrets.
2. On Neon, create a PostgreSQL project and copy its connection string. On Render, create a Python web service using `backend` as the root directory.
   - Build command: `pip install -r requirements.txt && python manage.py migrate --noinput`
   - Start command: `gunicorn config.wsgi:application --bind 0.0.0.0:$PORT`
   - Set `DATABASE_URL` to the Neon connection string, `DATABASE_SSL_REQUIRE=true`, `DEBUG=False`, a unique `SECRET_KEY`, the backend hostname in `ALLOWED_HOSTS`, and the Vercel site origin in both `CORS_ALLOWED_ORIGINS` and `CSRF_TRUSTED_ORIGINS`.
   - For hosted Gemini generation, set `AI_PROVIDER=gemini` and add `GEMINI_API_KEY` as a secret environment variable on the backend service. Do not put this key in Vercel or frontend code. Provider quotas and terms apply.
3. On Vercel, import the same GitHub repository and set the root directory to `frontend`. Use the Vite preset, build command `npm run build`, and output directory `dist`.
4. Add `VITE_API_BASE_URL=https://<your-render-service>.onrender.com/api` to Vercel's environment variables, replacing the host with the URL Render gives you. Redeploy after setting it.

With the GitHub integration enabled, pushes to the connected production branch trigger new deployments. Local edits do not go live until they are committed and pushed.
