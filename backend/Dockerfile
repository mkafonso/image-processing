FROM node:22-alpine

WORKDIR /usr/src/app

COPY package*.json ./

COPY backend ./backend
COPY packages ./packages

RUN npm install --workspaces --legacy-peer-deps

WORKDIR /usr/src/app/backend

CMD ["npm", "run", "start"]
