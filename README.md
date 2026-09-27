# Barangay Poblacion - Admin Dashboard

Admin/staff portal for the Smart Profiling and Complaint Management System,
built with:

- **Backend:** Node.js + Express, PostgreSQL (Neon), JWT auth
- **Frontend:** React (Vite) + React Router + Tailwind

```
Admin-Poblacion/
├── backend/    Express API (port 4000)
└── frontend/   Admin Dashboard (port 5173)
```

> Note: this backend also powers a separate resident-facing app (pushed to
> the `Residents` repo) - they share the same database, so a complaint a
> resident files shows up here automatically, and status updates you make
> here flow back to their tracker. The backend code here and in `Residents`
> is currently the same; keep that in mind if you edit backend routes in one
> repo and want the change reflected in both.

## Setup

```bash
cd backend
npm install
cp .env.example .env     # set DATABASE_URL, JWT_SECRET, and SMTP settings
npm run migrate          # creates tables, seeds demo admin + sample data
npm start                # http://localhost:4000
```

```bash
cd frontend
npm install
npm run dev               # http://localhost:5173
```

Demo admin login: **admin@civicledger.gov** / **admin123**
Demo resident-portal login (for the `Residents` app): **elena.santos@example.com** / **password123**

### Admin email verification

Admin access requests accept Gmail, Yahoo, and other valid email providers. Applicants must verify
their address using the link emailed to them; the Institutional Board must still approve the request
before admin sign-in is enabled. Verification links expire after 24 hours, and the verification page
can send a replacement link.

To send verification emails, configure `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`,
`SMTP_PASS`, and `SMTP_FROM` in `backend/.env`. For Gmail, enable 2-Step Verification and create a
Google App Password; use that App Password as `SMTP_PASS`, not the normal Gmail password. Set
`FRONTEND_URL` to the admin portal's actual URL so verification links return to the right site. Never
commit `.env` or share its SMTP password. After configuring the backend, run `npm run migrate` to
add verification fields to existing databases.

## Pushing to GitHub (kentmamba/Admin-Poblacion)

From this folder:
```bash
git init
git add .
git commit -m "Initial commit: admin dashboard + backend"
git branch -M main
git remote add origin https://github.com/kentmamba/Admin-Poblacion.git
git push -u origin main
```

**Before you push**, run `git status` and confirm `.env` is NOT in the list
of files to be committed - it's in `.gitignore`, but double-check since it
holds your real Neon database password.

## What's included

- Overview dashboard, Resident Records (+ enroll/edit + photo upload),
  Complaints Record (editable status), Meeting Minutes, Escalation
  Management, Pending Access Requests, Settings (profile photo, change
  password)
- Backend covers both this admin portal (`/api/auth`, `/api/residents`,
  `/api/complaints`, `/api/meetings`, `/api/escalations`, `/api/dashboard`)
  and the resident portal (`/api/resident-auth`, `/api/resident/complaints`,
  `/api/announcements`) - the resident-facing frontend itself lives in the
  separate `Residents` repo.
- `/api/announcements` is intentionally public (no auth middleware) since
  both the resident dashboard and any public landing page read it before a
  resident is necessarily logged in.
