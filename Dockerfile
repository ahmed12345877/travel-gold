FROM node:20-alpine

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 -G nodejs

WORKDIR /app

RUN npm install -g pnpm@10.10.0

# Copy manifests first for better layer caching
COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

# Source code
COPY . .

# Railway passes service variables as Docker build args.
# Declare each VITE_* var so Vite can embed it into the frontend bundle at build time.
ARG VITE_FIREBASE_API_KEY
ARG VITE_FIREBASE_AUTH_DOMAIN
ARG VITE_FIREBASE_PROJECT_ID
ARG VITE_FIREBASE_STORAGE_BUCKET
ARG VITE_FIREBASE_MESSAGING_SENDER_ID
ARG VITE_FIREBASE_APP_ID
ARG VITE_FIREBASE_MEASUREMENT_ID
ARG VITE_API_URL

ENV VITE_FIREBASE_API_KEY=$VITE_FIREBASE_API_KEY \
    VITE_FIREBASE_AUTH_DOMAIN=$VITE_FIREBASE_AUTH_DOMAIN \
    VITE_FIREBASE_PROJECT_ID=$VITE_FIREBASE_PROJECT_ID \
    VITE_FIREBASE_STORAGE_BUCKET=$VITE_FIREBASE_STORAGE_BUCKET \
    VITE_FIREBASE_MESSAGING_SENDER_ID=$VITE_FIREBASE_MESSAGING_SENDER_ID \
    VITE_FIREBASE_APP_ID=$VITE_FIREBASE_APP_ID \
    VITE_FIREBASE_MEASUREMENT_ID=$VITE_FIREBASE_MEASUREMENT_ID \
    VITE_API_URL=$VITE_API_URL

# vite build (frontend → dist/public/) + esbuild (server → dist/index.js)
RUN pnpm run build

ENV NODE_ENV=production
EXPOSE 8080
USER nodejs

CMD ["node", "dist/index.js"]
