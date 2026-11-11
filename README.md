# lume showcase

A public showcase of the **lume language** and its **lume-core** runtime:
language features, current algorithm status, and the public application
landscape. The React frontend renders data produced by a real `lume-core`
HTTP server — every feature and algorithm demo below actually ran on the lume
interpreter.

> Public & neutral by design: no industry/company/internal information anywhere
> in this repository. Content is generic math, physics (heat equation), ML,
> and web tooling.

## Stack

| Layer | Tech |
|---|---|
| Language | lume (static typing · enum/match · HOF · Result·? · modules) |
| Runtime | lume-core (`server{}`/run() HTTP · docroot · sql_query · C-kernel matmul) |
| Frontend | React 18 + Vite + TypeScript |

## Quick start

```sh
# 1. backend (lume-core HTTP server: /api/features /api/algorithms /api/apps + static)
cd work/lume/lume-showcase
../lume-core/bin/lume-core server.lume
# -> serving http://127.0.0.1:18793

# 2. verify
curl http://127.0.0.1:18793/api/health
# -> {"status":200,...,"body":"{\"ok\":true,...}"}

# 3. frontend (production: build into web/dist, served by lume-core docroot)
cd web && npm install && npm run build
# then reopen http://127.0.0.1:18793/ (same process serves API + static)

# 4. frontend dev mode (Vite proxy /api -> :18793)
cd web && npm run dev   # http://localhost:5173
```

## Layout

```
server.lume            lume-core HTTP API + static docroot (web/dist)
src/features.lume      language feature self-checks (export feature_list())
src/algorithms.lume    algorithm demos + wall-1/2/3 metrics (export algorithm_list())
web/                   React frontend (Vite + TS)
  src/App.tsx          three tabs: features / algorithms / applications
  src/api.ts           fetch /api/* (parses lume-core {status,type,body})
```

## What it shows

- **Language features (12)**: static typing & inference, enum + match,
  higher-order + trailing closure, range, Result + `?`, string cast & concat,
  module import, list reference semantics (measured: `push` mutates in place),
  float division (`/` is always float), builtin HTTP server, builtin HTTP
  client with SSRF gate, C-kernel matmul.
- **Algorithm status (12)**: dense matmul (C kernel · wall 3 · 12×), PINN
  analytic gradients (wall 1 · 200×), MLP backprop, linalg, integration,
  gradient descent, k-means, 1D heat FDM, KL divergence, complex, signal
  smoothing, graph BFS.
- **Applications (12)**: HTTP API / web service, scientific CLI, ML training,
  PINN solver, PDE numerics, data pipelines, static site + API same process,
  MCP server, graph/signal/stats tools, SQLite storage, crypto/hash, optimization.

## Docker

Container: lume-core (built in-image from `../lume-core`, interpreter + text
backends — no libLLVM needed) serving the API + the built React app.

```sh
cd work/lume                 # build context must be the parent of both dirs
docker build -f lume-showcase/Dockerfile -t lume-showcase .
docker run --rm -p 18793:18793 --read-only lume-showcase
curl http://127.0.0.1:18793/api/health
# -> {"status":200,...,"body":"{\"ok\":true,...}"}
```

- Runs as non-root `app` (uid 100); `--read-only` is safe (the server writes
  nothing — `/tmp` is the only writable mount point).
- `LUME_BIND=0.0.0.0` is set in the image (container needs all interfaces);
  local runs default to `127.0.0.1`.
- The apk mirror defaults to `mirrors.aliyun.com` (override with
  `--build-arg APK_MIRROR=<url>`).
- `work/lume/.dockerignore` trims the context (sibling projects, git dirs,
  build artifacts).

## Notes

- Requires a `lume-core` build at `../lume-core/bin/lume-core` (repo-relative).
- The `server.lume` docroot points to `web/dist`; build the frontend before
  visiting `/` in production mode.
- Frontend dev mode proxies `/api` to `127.0.0.1:18793` (see `vite.config.ts`).
- Port `18793`; change in `server.lume` and `vite.config.ts` together.
