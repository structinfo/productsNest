############################
# 1. Dependencies
############################
FROM node:20-alpine AS deps

WORKDIR /app

COPY package.json package-lock.json ./

RUN --mount=type=cache,target=/root/.npm \
    npm ci

############################
# 2. Build
############################
FROM node:20-alpine AS build

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

############################
# 3. Production dependencies
############################
FROM node:20-alpine AS prod-deps

WORKDIR /app

COPY package.json package-lock.json ./

RUN --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev

############################
# 4. Runtime (distroless)
############################
FROM gcr.io/distroless/nodejs20-debian12 AS runtime

WORKDIR /app
ENV NODE_ENV=production

COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist

EXPOSE 3000

CMD ["dist/main.js"]
