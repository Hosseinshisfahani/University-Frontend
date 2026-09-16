ARG BASE_IMAGE=node:22-slim
FROM ${BASE_IMAGE} AS base

FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --prefer-offline --no-audit --no-fund

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
ARG NEXT_PUBLIC_API_BASE_URL=/api/v1
ARG NEXT_PUBLIC_UNIVERSITY_HOST=
ARG NEXT_PUBLIC_PSY_HOST=
ARG NEXT_PUBLIC_PSY_ORIGIN=
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_UNIVERSITY_HOST=$NEXT_PUBLIC_UNIVERSITY_HOST
ENV NEXT_PUBLIC_PSY_HOST=$NEXT_PUBLIC_PSY_HOST
ENV NEXT_PUBLIC_PSY_ORIGIN=$NEXT_PUBLIC_PSY_ORIGIN
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
RUN groupadd --system --gid 1001 nodejs \
  && useradd --system --uid 1001 --gid nodejs nextjs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
