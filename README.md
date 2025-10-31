## Image Processing Pipeline

Simple, modern image-processing pipeline with a Fastify API, Redis-backed worker, and a Vite + React frontend. Real-time job updates are delivered via Firebase.

### Demo

https://github.com/user-attachments/assets/da4541a5-8679-4092-8fe4-43c2fdb8889e

### Highlights

- **Fast API**: Fastify with CORS and static file serving (`/uploads`).
- **Background processing**: Worker connected to **Redis** for queued jobs.
- **Real-time updates**: Job progress and status via **Firebase** listeners.
- **Modern frontend**: Vite + React UI for creating and tracking jobs.
- **Docker-first**: One command to build and run everything.

### Requirements

- **Docker** and **Docker Compose**
- Ports available: `5173` (frontend), `3000` (API), `6379` (Redis)

### Quick Start (Docker)

Run all services (Redis, API, Worker, Frontend):

```bash
docker compose up -d --build
```

- Frontend: `http://localhost:5173`
- API base: `http://localhost:3000/api`
- Health check: `http://localhost:3000/api/health`

Stop everything:

```bash
docker compose down
```

Rebuild after changes:

```bash
docker compose build --no-cache && docker compose up -d
```

### Useful Notes

- Static files are served from the API at `/uploads/`.
- The frontend expects the API at `http://localhost:3000/api`
- Redis is used internally by the API/worker containers and exposed on `6379` locally for debugging.

### License

MIT
