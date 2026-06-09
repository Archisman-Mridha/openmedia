FROM oven/bun:1 AS base
WORKDIR /usr/src/app

FROM base AS dependencies-installer
RUN \
  --mount=type=bind,source=package.json,target=package.json \
  --mount=type=bind,source=bun.lock,target=bun.lock \
  --mount=type=bind,source=bunfig.toml,target=bunfig.toml \
  --mount=type=cache,target=/root/.bun/install/cache \
  bun install --frozen-lockfile

FROM base AS builder
COPY --from=dependencies-installer /usr/src/app/node_modules node_modules
COPY . .
ENV NODE_ENV=production
RUN \
  --mount=type=cache,target=/root/.bun/install/cache \
  --mount=type=cache,target=/usr/src/app/.nx/cache \
  bun run nx run backend:build
RUN \
  bun build --compile --minify --sourcemap --bytecode ./dist/backend/main.js --outfile openmedia-backend \
  --external @nestjs/websockets \
  --external nats \
  --external ioredis \
  --external mqtt \
  --external amqplib \
  --external amqp-connection-manager \
  --external @nestjs/sequelize \
  --external @mikro-orm/core \
  --external @fastify/static \
  --external @fastify/view \
  --external @as-integrations/express5 \
  --external class-transformer

# Package the application.

FROM scratch AS packager

WORKDIR /

LABEL org.opencontainers.image.authors="archismanmridha12345@gmail.com"
LABEL org.opencontainers.image.url="https://github.com/Archisman-Mridha/openmedia"
LABEL org.opencontainers.image.source="https://github.com/Archisman-Mridha/openmedia"
LABEL org.opencontainers.image.vendor="Archisman-Mridha"
LABEL org.opencontainers.image.licenses="MIT"

COPY --from=builder /usr/src/app/openmedia-backend /usr/lib/

USER bun

ENTRYPOINT [ "/usr/lib/openmedia-backend" ]
