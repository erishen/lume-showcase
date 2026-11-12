# syntax=docker/dockerfile:1
# lume-showcase container: lume-core HTTP server (/api/features /api/algorithms
# /api/apps + docroot static serving of web/dist) + React frontend (built).
#
# Build context MUST be work/lume (parent of lume-core and lume-showcase):
#   cd work/lume
#   docker build -f lume-showcase/Dockerfile -t lume-showcase .
# Run:
#   docker run --rm -p 18793:18793 lume-showcase
# Check: curl http://127.0.0.1:18793/api/health

# ---- 1. UI build (React 18 + Vite + TS) ----
# Layered cache: COPY the dep manifests first -> npm ci (skips download on
# cache hit) -> then COPY the source.
FROM node:24-alpine AS ui
WORKDIR /build
COPY lume-showcase/web/package.json lume-showcase/web/package-lock.json ./
RUN npm ci --no-audit --no-fund --include=optional
COPY lume-showcase/web ./
RUN npm run build
# Precompress hashed assets for the static server's `.gz` sibling
# negotiation (Content-Encoding: gzip + immutable caching in lume-core).
RUN find /build/dist -type f \( -name '*.js' -o -name '*.css' \) -exec gzip -k {} \;

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
# 访客统计 SQLite：数据目录必须可写；容器以 --read-only 运行时用 named
# volume 挂到 /app/data（镜像内先建目录并交给 app 用户，volume 首挂继承权限）。
RUN mkdir -p /app/data && chown app:app /app/data
USER app
ENV LUME_BIND=0.0.0.0
ENV LUME_SHOWCASE_DATA_DIR=/app/data
# Alpine 默认 UTC；SQLite 的 localtime() 走 libc，这里用 POSIX TZ 固定东八区。
ENV TZ=CST-8
# 除数据卷外不写文件；/tmp 保持 tmpfs，/app/data 由部署卷提供。
VOLUME /tmp
VOLUME /app/data
LABEL org.opencontainers.image.title="lume-showcase" \
      org.opencontainers.image.description="lume language + lume-core runtime showcase (API + React UI)" \
      org.opencontainers.image.licenses="MIT"
EXPOSE 18793
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q -O - http://127.0.0.1:18793/api/health | grep -q '"status":200' || exit 1
CMD ["./bin/lume-core", "server.lume"]
