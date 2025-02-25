FROM node:23-alpine AS base

LABEL maintainer="Stephane Segning <selastlambou@gmail.com>"
LABEL org.opencontainers.image.description="NextJS frontend for the Vymalo Project"

#
WORKDIR /app

COPY package.json yarn.lock .yarnrc.yml ./

RUN corepack enable && corepack prepare yarn@4.6.0 --activate
RUN apk add --no-cache libc6-compat

FROM base AS deps

RUN yarn install --immutable

# Rebuild the source code only when needed
FROM base AS builder

ENV NODE_ENV=production
ENV NEXT_SHARP_PATH="/app/node_modules/sharp"
ENV NEXT_TELEMETRY_DISABLED=1
ENV SKIP_ENV_VALIDATION=1

ENV S3_ENDPOINT=localhost
ENV S3_PORT=19000
ENV S3_SCHEME=https

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npx prisma generate
RUN yarn build

FROM base AS runner

ENV NODE_ENV=production
ENV PORT=3000
ENV NEXT_SHARP_PATH="/app/node_modules/sharp"

# Uncomment the following line in case you want to disable telemetry during runtime.
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup -S -g 1001 nodejs && adduser -S nextjs -G nodejs -u 1001

RUN mkdir -p .yarn
#RUN chown -R nextjs:nodejs yarn* .yarn*

COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

# set hostname to enable access from outside the container
ENV HOSTNAME="0.0.0.0"

# server.js is created by next build from the standalone output
# https://nextjs.org/docs/pages/api-reference/next-config-js/output
CMD ["node", "server.js"]