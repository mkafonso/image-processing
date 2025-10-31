FROM node:20-alpine AS build

WORKDIR /usr/src/app

ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

COPY package*.json ./
COPY packages ./packages

COPY frontend/package*.json ./frontend/

RUN npm install --workspaces --legacy-peer-deps

COPY frontend ./frontend
WORKDIR /usr/src/app/frontend
RUN npm run build

FROM nginx:alpine
COPY --from=build /usr/src/app/frontend/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
