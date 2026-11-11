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
# 分层缓存：先 COPY 依赖清单 → npm ci（命中缓存即跳过下载）→ 再 COPY 源码。
FROM node:20-alpine AS ui
WORKDIR /build
COPY lume-showcase/web/package.json lume-showcase/web/package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY lume-showcase/web ./
RUN npm run build

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

# ---- 3. runtime (no node·non-root·slim) ----
FROM alpine:3.20 AS runtime
ARG APK_MIRROR=https://mirrors.aliyun.com/alpine
RUN sed -i "s#https\?://[a-z0-9.-]*alpinelinux.org/alpine#$APK_MIRROR#g" /etc/apk/repositories \
 && apk add --no-cache libcrypto3 sqlite-libs libgcc wget \
 && addgroup -S app && adduser -S app -G app
WORKDIR /app
COPY --from=core --chown=app:app /src/lume-core/bin/lume-core ./bin/lume-core
COPY --from=ui --chown=app:app /build/dist ./web/dist
COPY --chown=app:app lume-showcase/server.lume ./server.lume
COPY --chown=app:app lume-showcase/src ./src
USER app
ENV LUME_BIND=0.0.0.0
# server 不写文件：--read-only 运行安全（/tmp 是唯一可写挂载点）。
VOLUME /tmp
LABEL org.opencontainers.image.title="lume-showcase" \
      org.opencontainers.image.description="lume language + lume-core runtime showcase (API + React UI)" \
      org.opencontainers.image.licenses="MIT"
EXPOSE 18793
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q -O - http://127.0.0.1:18793/api/health | grep -q '"status":200' || exit 1
CMD ["./bin/lume-core", "server.lume"]
