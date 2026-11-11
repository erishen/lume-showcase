# lume showcase

A public showcase of the **lume language** and its **lume-core** runtime:
what the language is, its features, current algorithm status, the agent
loop, and the public application landscape. The React frontend renders data
produced by a real `lume-core` HTTP server — every feature and algorithm
demo below actually ran on the lume interpreter.

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
# 1. backend (lume-core HTTP server: 7 /api/* endpoints + static docroot)
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

The **Agent** tab demonstrates the autonomous plan → act → observe → refine
cycle with a self-contained lume loop (deterministic policy, no external LLM
call). lume-core exposes agent introspection (`catalog`/`tools`/`mcps`/
`skills`) and an optional LLM hook via `LLM_API_URL`/`LLM_MODEL`, but those
builtins are interpreter-side — the demo stays pure lume so the interpreter,
text and LLVM backends remain byte-identical.

## Layout

```
server.lume            lume-core HTTP API + static docroot (web/dist)
src/overview.lume      "what is lume" tour (export overview_sections())
src/features.lume      language feature self-checks (export feature_list())
src/algorithms.lume    algorithm demos + wall-1/2/3 metrics (export algorithm_list())
src/agent.lume         agent loop demo (export agent_demo())
web/                   React frontend (Vite + TS)
  src/App.tsx          shell + lazy tab loader (React.lazy + Suspense)
  src/tabs/            one chunk per tab (Overview/Features/Algorithms/Apps/Agent/Performance)
  src/Detail.tsx       expandable detail panel (lazy — content.ts loads on demand)
  src/content.ts       bilingual detail entries + teaching source
  src/api.ts           fetch /api/* (parses lume-core {status,type,body})
```

## What it shows

- **Overview (what is lume, 5 sections)**: the standalone statically typed
  language + one compiler (`lume-core`) with no build step or framework; the
  three backends (interpreter / hand-written IR text / libLLVM) agree
  byte-for-byte; core syntax (enum + match · HOF · modules · Result); builtin
  HTTP (`server{}` + `run()` — a capability, not a framework); quick start
  (one binary: interpret / `--check` / `--compile`).
- **Language features (12)**: static typing & inference, enum + match,
  higher-order + trailing closure, range, Result + `?`, string cast & concat,
  module import, list reference semantics (measured: `push` mutates in place),
  float division (`/` is always float), builtin HTTP server, builtin HTTP
  client with SSRF gate, C-kernel matmul.
- **Algorithm status (12)**: dense matmul (C kernel · wall 3 · 12×), PINN
  analytic gradients (wall 1 · 200×), MLP backprop, linalg, integration,
  gradient descent, k-means, 1D heat FDM, KL divergence, complex, signal
  smoothing, graph BFS.
- **Agent loop**: the autonomous plan → act → observe → refine cycle in a
  self-contained lume loop (deterministic policy, no external LLM) — the
  interpreter, text and LLVM backends stay byte-identical.
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

The lume-core static server is production-tuned: content-hashed `/assets/*`
(built by Vite) are served `Cache-Control: public, max-age=31536000,
immutable` (the filename is the content address), `index.html` stays
`no-cache`, and the build precompresses `.gz` siblings so clients that accept
gzip get `Content-Encoding: gzip` (~3x smaller bundle). The React app is
code-split: each tab is its own lazy chunk, and the 47-entry bilingual detail
table loads only when a card is expanded — first paint is ~53 KB gzip. Every
response carries `X-Content-Type-Options`, `X-Frame-Options: DENY`,
`Referrer-Policy` and a `Content-Security-Policy: default-src 'self'`
(overridable via `server { csp = "..." }`); the favicon is a same-origin
static SVG so the strict CSP permits it.

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
bash tests/smoke.sh        # server (interp + text + llvm backends) API counts + byte-identical
```

`tests/smoke.sh` asserts all six `/api/*` data endpoints (overview,
features, algorithms, apps, agent, bench), the static index, that the
interpreter, text-backend **and** libLLVM-backend servers produce
**byte-identical** JSON for every endpoint, and that each item's English name
is covered by both the `zhDict` translation and a `content.ts` detail entry
(a new feature/app that is not translated or lacks a detail panel fails the
run — `tests/check_coverage.py`). The LLVM backend runs only when lume-core
was built with libLLVM (the container image builds interpreter + text
backends only).

A GitHub Actions workflow (`.github/workflows/ci.yml`) is pre-wired for when
this repo is pushed: it builds `erishen/lume-core`, runs its gates, the
showcase smoke, the frontend build, and a Docker image build.

## Notes

- Requires a `lume-core` build at `../lume-core/bin/lume-core` (repo-relative).
- The `server.lume` docroot points to `web/dist`; build the frontend before
  visiting `/` in production mode.
- Frontend dev mode proxies `/api` to `127.0.0.1:18793` (see `vite.config.ts`).
- Port `18793`; change in `server.lume` and `vite.config.ts` together.
