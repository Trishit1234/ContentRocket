# ContentRocket

ContentRocket is a React and Django creator workspace with JWT authentication, persistent data models, CRUD modules, and AI tools.

## Prerequisites

- Node.js 20+
- Python 3.14+
- A Gemini API key for hosted AI generation (recommended)

## Backend

```powershell
cd D:\CreatorDesk\backend
copy .env.example .env
python -m pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 127.0.0.1:8000
```

In local development, password reset emails are written to the backend console, and the reset page also shows a local reset link. For a deployed site, set `FRONTEND_URL` and configure `EMAIL_BACKEND`, `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_HOST_USER`, `EMAIL_HOST_PASSWORD`, `EMAIL_USE_TLS`, and `DEFAULT_FROM_EMAIL` for your SMTP provider.

Hosted AI generation uses Gemini from the Django backend. Configure `AI_PROVIDER=gemini`, `GEMINI_MODEL=gemini-3.8-flash`, and a Gemini key with available quota as `GEMINI_API_KEY` or `GEMINI_API_KEYS`. Keep keys in backend environment secrets only. Public generators are rate-limited by IP; signed-in generation has its own rate limit. Provider quotas can change.

To use a local Ollama model during development, set `AI_PROVIDER=ollama` in `backend/.env`, install Ollama, then run:

```powershell
ollama run gemma4
```

Keep Ollama running while using ContentRocket locally. For the online site, set `AI_PROVIDER=gemini` and add a key with available quota to the hosted backend environment. Provider errors are shown to users rather than replaced with fake output. Restart the backend after changing provider settings.

## Frontend

```powershell
cd D:\CreatorDesk\frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

Set `VITE_SUPPORT_EMAIL` in `frontend/.env` to show a direct email link in the landing page’s Contact section. Without it, the Contact button links to the Help & Support questions.

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

The three `/generate/` endpoints are public and rate-limited. Other private endpoints require `Authorization: Bearer <access-token>`. Django ownership filtering protects and persists user records.

## Deployment (Vercel + Render + Neon)

The frontend and Django API deploy separately. The local SQLite database is only for development. For a no-cost demo, use Vercel Free for the frontend, Render Free for Django, and Neon Free for PostgreSQL. Check current plan limits before launch: Render Free services sleep after 15 minutes without traffic, and Render Free Postgres expires after 30 days; Neon Free has usage and storage limits.

1. Push the project to GitHub. Keep `backend/.env` out of Git; it contains local secrets.
2. On Neon, create a PostgreSQL project and copy its connection string. On Render, create a Python web service using `backend` as the root directory.
   - Build command: `pip install -r requirements.txt && python manage.py migrate --noinput`
   - Start command: `gunicorn config.wsgi:application --bind 0.0.0.0:$PORT`
   - Set `DATABASE_URL` to the Neon connection string, `DATABASE_SSL_REQUIRE=true`, `DEBUG=False`, a unique `SECRET_KEY`, the backend hostname in `ALLOWED_HOSTS`, and `https://contentrocket-coral.vercel.app` in both `CORS_ALLOWED_ORIGINS` and `CSRF_TRUSTED_ORIGINS`.
   - Set `AI_PROVIDER=gemini`, `GEMINI_MODEL=gemini-3.8-flash`, and add a Gemini key with available quota as the secret `GEMINI_API_KEY` or `GEMINI_API_KEYS` environment variable on Render. Every visitor uses this hosted backend; never put the key in Vercel or frontend code. A local `.env` key is not included in the hosted service.
3. On Vercel, import the same GitHub repository and set the root directory to `frontend`. Use the Vite preset, build command `npm run build`, and output directory `dist`.
4. Add `VITE_API_BASE_URL=https://<your-render-service>.onrender.com/api` to Vercel's environment variables, replacing the host with the URL Render gives you. Use `frontend/.env.production.example` as a template. Redeploy after setting it.

The frontend uses localhost only during local development. In a production build it uses the configured hosted API URL (or same-origin `/api` if omitted) and shows a configuration error when AI cannot reach the API. After deployment, confirm the API service is awake, CORS includes the Vercel origin, and the backend's Gemini key has remaining quota.

With the GitHub integration enabled, pushes to the connected production branch trigger new deployments. Local edits do not go live until they are committed and pushed.
