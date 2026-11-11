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

The UI has an **EN / 中文 toggle** (top-right). The lume-core API stays
English (the public source of truth); the frontend translates display strings
for the Chinese view and remembers your choice in `localStorage`. Without a
stored preference it follows the browser language (default English).

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
- **Performance (wall 1/2/3)**: measured speedups — 207× (PINN analytic
  gradient), 1.02× (codegen = C speed), 12× (blas C kernel), as a log-scaled
  bar chart from `/api/bench`.
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

Or with compose (one command, resource limits included):

```sh
cd work/lume/lume-showcase
docker compose up -d --build
```

- Runs as non-root `app` (uid 100); `--read-only` is safe (the server writes
  nothing — `/tmp` is the only writable mount point).
- `LUME_BIND=0.0.0.0` is set in the image (container needs all interfaces);
  local runs default to `127.0.0.1`.
- The apk mirror defaults to `mirrors.aliyun.com` (override with
  `--build-arg APK_MIRROR=<url>`).
- `work/lume/.dockerignore` trims the context (sibling projects, git dirs,
  build artifacts).

## Tests

```sh
cd work/lume/lume-showcase
bash tests/smoke.sh        # server (interp + text backend) API counts + byte-identical
```

`tests/smoke.sh` asserts all four API endpoints, the static index, and that
the interpreter and text-backend servers produce **byte-identical** JSON for
`/api/features` and `/api/algorithms`. The LLVM backend also compiles and
runs `server.lume` locally (when libLLVM is present); the container image
builds without it (interpreter + text backends only).

A GitHub Actions workflow (`.github/workflows/ci.yml`) is pre-wired for when
this repo is pushed: it builds `erishen/lume-core`, runs its gates, the
showcase smoke, the frontend build, and a Docker image build.

## Notes

- Requires a `lume-core` build at `../lume-core/bin/lume-core` (repo-relative).
- The `server.lume` docroot points to `web/dist`; build the frontend before
  visiting `/` in production mode.
- Frontend dev mode proxies `/api` to `127.0.0.1:18793` (see `vite.config.ts`).
- Port `18793`; change in `server.lume` and `vite.config.ts` together.
