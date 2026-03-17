FROM node:22-alpine

WORKDIR /app

COPY ./backend/package*.json /app/backend/

RUN cd /app/backend && npm install

COPY ./backend /app/backend
COPY ./frontend/dist /app/frontend/dist

EXPOSE 3000

CMD ["node", "/app/backend/server.js"]