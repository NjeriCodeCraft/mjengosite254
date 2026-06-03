# MjengoSite

A simple site management and attendance system with a Node.js backend and a Next.js frontend.

## Tech stack
- Backend: Node.js, Express
- Frontend: Next.js

## Prerequisites
- Node.js 16+ and npm

## Repository structure
- `backend/` — Express API and USSD integration
- `frontend/` — Next.js app and UI components

## Environment variables
Backend (create a `.env` in `backend/`):
- `PORT` — server port (default: 3001)
- `DATABASE_URL` — database connection string
- `AFRICASTALKING_API_KEY` — AfricasTalking API key (if used)
- `AFRICASTALKING_USERNAME` — AfricasTalking username

Frontend (create a `.env.local` in `frontend/`):
- `NEXT_PUBLIC_API_URL` — URL of the backend API (e.g. `http://localhost:3001`)

## Setup & run
Backend
```
cd backend
npm install
# create .env with variables above
npm start
```

Frontend
```
cd frontend
npm install
npm run dev
```

## Common scripts
- Backend: see `backend/package.json` for `start` and other scripts
- Frontend: see `frontend/package.json` for `dev`, `build`, and `start`

## Deployment notes
- Ensure environment variables are set in your production host.
- Build the frontend with `npm run build` then `npm start` (see `frontend/package.json`).

## Contributing
- Open an issue or PR with a clear description of the change.

## License
MIT
