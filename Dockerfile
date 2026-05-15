FROM node:22-alpine AS frontend-builder

WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm install

COPY frontend ./
RUN npm run build

FROM node:22-alpine

WORKDIR /app

COPY backend/package*.json ./backend/
RUN cd /app/backend && npm install

COPY backend ./backend
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

EXPOSE 3000

CMD ["node", "/app/backend/server.js"]