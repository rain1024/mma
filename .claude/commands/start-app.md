# Start App

Start both the web application and backend service concurrently.

## Instructions

1. Kill any existing processes on ports 3000 and 4000:
```bash
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
lsof -ti:4000 | xargs kill -9 2>/dev/null || true
```

2. Start the web application (Next.js) on port 3000:
```bash
cd web && PORT=3000 yarn dev
```

3. Start the backend service on port 4000:
```bash
cd service && yarn dev
```

The web app will run on http://localhost:3000 and the service will run on http://localhost:4000.

To run both concurrently in the background:
```bash
lsof -ti:3000 | xargs kill -9 2>/dev/null || true && lsof -ti:4000 | xargs kill -9 2>/dev/null || true && (cd web && PORT=3000 yarn dev) & (cd service && yarn dev)
```
