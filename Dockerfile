# syntax=docker/dockerfile:1
# lume-showcase 容器：lume-core HTTP server（/api/features /api/algorithms
# /api/apps + docroot 静态服务 web/dist）+ React 前端（构建产物）。
#
# 构建上下文必须是 work/lume（lume-core 与 lume-showcase 的父目录）：
#   cd work/lume
#   docker build -f lume-showcase/Dockerfile -t lume-showcase .
# 运行：
#   docker run --rm -p 18793:18793 lume-showcase
# 验证：curl http://127.0.0.1:18793/api/health

# ---- 1. UI build (React 18 + Vite + TS) ----
FROM node:20-alpine AS ui
WORKDIR /build
COPY lume-showcase/web ./web
RUN cd web && npm install --no-audit --no-fund && npm run build

# ---- 2. lume-core build (no libLLVM -> interpreter + text backends; the
#         showcase server runs on the interpreter, so the LLVM backend is
#         not required. openssl/sqlite are probed by the Makefile). ----
FROM alpine:3.20 AS core
ARG APK_MIRROR=https://mirrors.aliyun.com/alpine
RUN sed -i "s#https\?://[a-z0-9.-]*alpinelinux.org/alpine#$APK_MIRROR#g" /etc/apk/repositories \
 && apk add --no-cache build-base openssl-dev sqlite-dev pkgconf
WORKDIR /src
COPY lume-core ./lume-core
RUN cd lume-core && make -j"$(nproc)" && test -x bin/lume-core

# ---- 3. runtime ----
FROM alpine:3.20 AS runtime
ARG APK_MIRROR=https://mirrors.aliyun.com/alpine
RUN sed -i "s#https\?://[a-z0-9.-]*alpinelinux.org/alpine#$APK_MIRROR#g" /etc/apk/repositories \
 && apk add --no-cache libcrypto3 sqlite-libs libgcc wget
WORKDIR /app
COPY --from=core /src/lume-core/bin/lume-core ./bin/lume-core
COPY --from=ui /build/web/dist ./web/dist
COPY lume-showcase/server.lume ./server.lume
COPY lume-showcase/src ./src
ENV LUME_BIND=0.0.0.0
EXPOSE 18793
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q -O - http://127.0.0.1:18793/api/health | grep -q '"status":200' || exit 1
CMD ["./bin/lume-core", "server.lume"]
