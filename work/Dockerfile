FROM node:22-bookworm-slim AS client-build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY frontend ./frontend
RUN npm run build:client

FROM node:22-bookworm-slim

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev

COPY src ./src
COPY public ./public
COPY views ./views
COPY --from=client-build /app/dist ./dist

EXPOSE 3000

CMD ["npm", "start"]
