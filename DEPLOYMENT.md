# 🚀 Production Deployment Guide — El Niño Preemption Engine

This document provides exact, battle-tested deployment instructions to run the **El Niño — Drought Intelligence & Optimizer** on any cloud host, container platform, or bare-metal VPS.

---

## 📌 Architecture Overview

- **Frontend**: React 19 + Tailwind CSS + Leaflet (built via Vite into `/dist`).
- **Backend**: Express on Node.js 22 with native TypeScript execution (`node server.ts`).
- **Database**: Zero-dependency atomic embedded JSON store (`/data/app_database.json`) or optional PostgreSQL/Supabase.
- **Port**: Listens on `process.env.PORT` (defaults to `3000`).
- **Health Check**: `GET /health` (returns `200 OK`).

---

## 🛠️ Root Causes of Previous Cloud Run Deployment Failure & Resolutions

| Issue | Root Cause | Fix Applied |
| :--- | :--- | :--- |
| **`ERR_MODULE_NOT_FOUND: Cannot find module '/workspace/server/routes.js'`** | Node 22 ESM type-stripping requires explicit `.ts` paths or bundled output. An import specified `routes.js` when only `routes.ts` existed. | Updated import in `server.ts` to `import { apiRouter } from './server/routes.ts';` with `allowImportingTsExtensions` in `tsconfig.json`. |
| **`SyntaxError: Named export 'Request' not found`** | `express` is a CommonJS module. Named type exports without the `type` keyword fail under Node ESM loader. | Changed to `import type { Request, Response } from 'express'`. |
| **`spawn python3 ENOENT`** | Legacy startup script attempted to fork `python3` for FastAPI in an environment without a Python runtime. | Removed Python sub-process spawning. All endpoints and optimization solvers run natively in Node.js. |
| **Stale 8081 health probe** | `/api/health` attempted a dead HTTP call to port 8081. | Converted to instant zero-latency internal health check. |

---

## Option 1: Docker / Container Deployment (Cloud Run, Fly.io, AWS ECS, DigitalOcean)

The repository includes a multi-stage `Dockerfile` running Node 22 Alpine:

### 1. Build the Docker Image
```bash
docker build -t elnino-optimizer:latest .
```

### 2. Run the Container
```bash
docker run -d \
  --name elnino-app \
  -p 3000:3000 \
  -e PORT=3000 \
  -e NODE_ENV=production \
  -e GEMINI_API_KEY="your-gemini-api-key" \
  elnino-optimizer:latest
```

### 3. Verify
```bash
curl http://localhost:3000/health
# Response: OK
```

---

## Option 2: Render.com

1. Create a **New Web Service** pointing to your Git repository.
2. Configure settings:
   - **Environment**: `Node`
   - **Node Version**: `22` (Set Environment Variable `NODE_VERSION=22.14.0`)
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start` (or `node server.ts`)
3. Add Environment Variables:
   - `NODE_ENV`: `production`
   - `GEMINI_API_KEY`: `<Your Gemini Key>`
4. Health Check Path: `/health`

---

## Option 3: Railway.app

1. Connect your GitHub repository to Railway.
2. Railway will automatically detect the `Dockerfile` or `package.json`.
3. In Service Settings:
   - Ensure Railway injects `PORT`.
   - Add variable `GEMINI_API_KEY`.
4. The deployment will automatically build Vite and serve the app on the assigned domain.

---

## Option 4: Linux VPS (Ubuntu/Debian with PM2 & Nginx)

### 1. Prerequisites
```bash
# Install Node.js 22 LTS
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs nginx

# Install PM2
sudo npm install -g pm2
```

### 2. Clone & Build
```bash
git clone <your-repo-url> /var/www/elnino
cd /var/www/elnino

npm install
npm run build
```

### 3. Configure Environment
```bash
cp .env.example .env
nano .env  # Enter your GEMINI_API_KEY and PORT=3000
```

### 4. Start with PM2
```bash
pm2 start server.ts --name "elnino-engine" --interpreter node
pm2 save
pm2 startup
```

### 5. Nginx Reverse Proxy Configuration (`/etc/nginx/sites-available/elnino`)
```nginx
server {
    listen 80;
    server_name drought.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```
Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/elnino /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

---

## 🔑 Environment Variables Reference

| Variable | Required | Default | Description |
| :--- | :--- | :--- | :--- |
| `PORT` | No | `3000` | Port for the HTTP server. Managed automatically by Cloud Run, Render, and Railway. |
| `NODE_ENV` | No | `development` | Set to `production` in live environments. |
| `GEMINI_API_KEY` | Recommended | `""` | Enables AI Cabinet Order memo generation and Search Grounding. |
| `APP_URL` | No | `""` | Public URL of the deployed instance. |
| `DATABASE_URL` | No | `""` | Optional external PostgreSQL connection string. |
