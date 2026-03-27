FROM node:24-slim AS build
WORKDIR /usr/src/app

ENV NPM_CONFIG_AUDIT=false \
	NPM_CONFIG_FUND=false

COPY package*.json ./
RUN npm ci --ignore-scripts

COPY tsconfig.json ./
COPY src ./src

RUN npm run build

FROM node:24-slim AS deps
WORKDIR /usr/src/app

ENV NODE_ENV=production \
	NPM_CONFIG_AUDIT=false \
	NPM_CONFIG_FUND=false

COPY package*.json ./
RUN npm ci --omit=dev --ignore-scripts && npm cache clean --force

FROM node:24-slim AS production
WORKDIR /usr/src/app

ENV NODE_ENV=production

COPY --from=deps /usr/src/app/package*.json ./
COPY --from=deps /usr/src/app/node_modules ./node_modules

COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/src/api-docs ./src/api-docs

# Security: non-root user
RUN addgroup --system app && adduser --system --ingroup app app
USER app

EXPOSE 3000

CMD ["node", "dist/server.js"]
