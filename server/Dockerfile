# Multi-stage Dockerfile for IconsUniverse Backend API on Northflank
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

# Production Runner Stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Copy built application and production node_modules
COPY --from=builder /app ./

EXPOSE 5000

USER node

CMD ["node", "server.js"]
