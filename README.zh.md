# lume showcase（lume 展示）

**lume 语言**与 **lume-core** 运行时的公开展示：语言是什么、语言特性、算法现状、智能体循环与公共应用全景。React 前端渲染由真实 `lume-core` HTTP 服务器产生的数据——下面每个特性/算法 demo 都在 lume 解释器上实际运行过。

> 公开且中性：本仓库不包含任何行业/公司/内部信息。内容为通用数学、物理（热方程）、ML 与 Web 工具。

## 技术栈

| 层 | 技术 |
|---|---|
| 语言 | lume（静态类型 · 枚举/模式匹配 · 高阶函数 · Result·? · 模块） |
| 运行时 | lume-core（`server{}`/run() HTTP · docroot · sql_query · C 内核 matmul） |
| 前端 | React 18 + Vite + TypeScript |

## 快速开始

```sh
# 1. 后端（lume-core HTTP 服务器：7 个 /api/* 端点 + 静态 docroot）
cd work/lume/lume-showcase
../lume-core/bin/lume-core server.lume
# -> 服务 http://127.0.0.1:18793

# 2. 验证
curl http://127.0.0.1:18793/api/health
# -> {"status":200,...,"body":"{\"ok\":true,...}"}

# 3. 前端（生产：构建到 web/dist，由 lume-core docroot 服务）
cd web && npm install && npm run build
# 然后重新打开 http://127.0.0.1:18793/（同一进程服务 API + 静态）

# 4. 前端开发模式（Vite 代理 /api -> :18793）
cd web && npm run dev   # http://localhost:5173
```

### 访客统计

公开页每次加载向 `POST /api/visit` 上报一次 PV（前端 `recordVisit()`）；
`GET /api/visits` 返回 `total/today/uv/days/recent`，由 PIN 门禁保护。部署时
设置 `LUME_SHOWCASE_VISIT_PIN`，并把 SQLite 放到只读根之外
（`LUME_SHOWCASE_DATA_DIR`，容器内 `/app/data` 挂 named volume）。启动时清理
90 天前记录，运行中最多每 24h 再清一次；`/api/visit` 每 IP 60 秒最多 30 次，
超出返回 429。回环/内网 IP、`LUME_SHOWCASE_IGNORE_IPS`（逗号分隔，可填自己的出口
IP）、健康检查/探针/爬虫 UA 不计入汇总。`recent` 展示从 `remote_addr` 或可信代理头拿到的客户端 IP。
反代若记录 access log，请对 `/api/visits` 的 `?pin=` 打码或直接 `access_log off`，避免 PIN 落盘。

界面有**语言切换**（右上角·English / 中文）。lume-core API 保持英文（公共事实来源）；前端为中文视图翻译显示字符串，并在 `localStorage` 记住选择。无存储偏好时跟随浏览器语言（默认英文）。

**Agent** 页签展示自主 **计划 → 执行 → 观察 → 优化** 循环，用自包含的 lume 循环（确定性策略，无外部 LLM 调用）。lume-core 暴露智能体内省（`catalog`/`tools`/`mcps`/`skills`）与可选 LLM 钩子（`LLM_API_URL`/`LLM_MODEL`），但这些内建属解释器侧——demo 保持纯 lume，使解释器、文本与 LLVM 后端保持逐字节一致。

## 布局

```
server.lume            lume-core HTTP API + 静态 docroot（web/dist）
src/overview.lume      "lume 是什么" 导览（导出 overview_sections()）
src/features.lume      语言特性自检（导出 feature_list()）
src/algorithms.lume    算法 demo + wall-1/2/3 指标（导出 algorithm_list()）
src/agent.lume         智能体循环 demo（导出 agent_demo()）
src/visits.lume        访客 SQLite + PIN 门禁（导出 visits_summary()）
web/                   React 前端（Vite + TS）
  src/App.tsx          shell + 懒加载页签加载器（React.lazy + Suspense）
  src/tabs/            每页签一个 chunk（Overview/Features/Algorithms/Apps/Agent/Performance）
  src/Detail.tsx       可展开详情面板（懒加载——content.ts 按需加载）
  src/content.ts       双语详情条目 + 教学源码
  src/api.ts           抓取 /api/*（解析 lume-core {status,type,body}）
```

## 展示内容

- **导览（lume 是什么，5 节）**：独立静态类型语言 + 一个编译器（`lume-core`），无构建步骤或框架；三后端（解释器 / 手写 IR 文本 / libLLVM）逐字节一致；核心语法（枚举 + 模式匹配 · 高阶函数 · 模块 · Result）；内建 HTTP（`server{}` + `run()`——能力而非框架）；快速上手（一个二进制：interpret / `--check` / `--compile`）。
- **语言特性（12）**：静态类型与推断、枚举 + 模式匹配、高阶 + 尾闭包、range、Result + `?`、字符串转换与拼接、模块导入、list 引用语义（实测：`push` 原地修改）、浮点除法（`/` 恒为浮点）、内建 HTTP 服务器、带 SSRF 闸门的内建 HTTP 客户端、C 内核 matmul。
- **算法现状（12）**：稠密 matmul（C 内核 · wall 3 · 12×）、PINN 解析梯度（wall 1 · 200×）、MLP 反向传播、linalg、积分、梯度下降、k-means、1D 热方程 FDM、KL 散度、复数、信号平滑、图 BFS。
- **智能体循环**：自主 **计划 → 执行 → 观察 → 优化** 循环，自包含 lume 循环（确定性策略，无外部 LLM）——解释器、文本与 LLVM 后端保持逐字节一致。
- **性能（wall 1/2/3）**：实测加速比——207×（PINN 解析梯度）、1.02×（codegen = C 速度）、12×（blas C 内核），对数刻度柱状图，来自 `/api/bench`。
- **应用（12）**：HTTP API / Web 服务、科学 CLI、ML 训练、PINN 求解器、PDE 数值、数据管道、同进程静态站 + API、MCP 服务器、图/信号/统计工具、SQLite 存储、crypto/hash、优化。

## Docker

容器：lume-core（镜像内从 `../lume-core` 构建，解释器 + 文本后端——无需 libLLVM）服务 API + 构建后的 React 应用。

```sh
cd work/lume                 # 构建上下文必须是两目录的父目录
docker build -f lume-showcase/Dockerfile -t lume-showcase .
docker run --rm -p 18793:18793 --read-only lume-showcase
curl http://127.0.0.1:18793/api/health
# -> {"status":200,...,"body":"{\"ok\":true,...}"}
```

或用 compose（一条命令，含资源限制）：

```sh
cd work/lume/lume-showcase
docker compose up -d --build
```

lume-core 静态服务器已生产调优：内容哈希的 `/assets/*`（Vite 构建）以 `Cache-Control: public, max-age=31536000, immutable` 服务（文件名即内容地址），`index.html` 保持 `no-cache`，构建预压缩 `.gz` 兄弟文件，接受 gzip 的客户端获得 `Content-Encoding: gzip`（约小 3 倍）。React 应用已代码分割：每个页签独立懒加载 chunk，47 条双语详情表仅在展开卡片时加载——首屏约 53 KB gzip。每个响应带 `X-Content-Type-Options`、`X-Frame-Options: DENY`、`Referrer-Policy` 与 `Content-Security-Policy: default-src 'self'`（可用 `server { csp = "..." }` 覆盖）；favicon 是同源静态 SVG，严格 CSP 放行。

- 以非 root `app`（uid 100）运行；`--read-only` 安全（服务器不写任何东西——`/tmp` 是唯一可写挂载点）。
- 镜像设 `LUME_BIND=0.0.0.0`（容器需要所有接口）；本地运行默认 `127.0.0.1`。
- apk 镜像默认 `mirrors.aliyun.com`（用 `--build-arg APK_MIRROR=<url>` 覆盖）。
- `work/lume/.dockerignore` 精简上下文（兄弟项目、git 目录、构建产物）。

## 测试

```sh
cd work/lume/lume-showcase
bash tests/smoke.sh        # 服务器（interp + text + llvm 后端）API 计数 + 逐字节一致
```

`tests/smoke.sh` 断言全部六个 `/api/*` 数据端点（overview、features、algorithms、apps、agent、bench）、静态 index、解释器/文本后端**与** libLLVM 后端服务器对每个端点产生**逐字节一致**的 JSON，以及每个条目的英文名同时被 `zhDict` 翻译与 `content.ts` 详情条目覆盖（未翻译或缺详情面板的新特性/应用会使运行失败——`tests/check_coverage.py`）。LLVM 后端仅在 lume-core 以 libLLVM 构建时运行（容器镜像只构建解释器 + 文本后端）。

GitHub Actions 工作流（`.github/workflows/ci.yml`）已预置：构建 `erishen/lume-core`、跑其门禁、showcase smoke、前端构建与 Docker 镜像构建。

## 备注

- 需要 `../lume-core/bin/lume-core` 构建（仓库相对路径）。
- `server.lume` 的 docroot 指向 `web/dist`；生产模式访问 `/` 前先构建前端。
- 前端开发模式代理 `/api` 到 `127.0.0.1:18793`（见 `vite.config.ts`）。
- 端口 `18793`；需在 `server.lume` 与 `vite.config.ts` 中一并修改。
