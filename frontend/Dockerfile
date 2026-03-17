# Stage 1: Build
FROM node:20-alpine AS build

WORKDIR /app

ARG VITE_API_URL=http://localhost:8000/api

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .
RUN VITE_API_URL=$VITE_API_URL npm run build

# Stage 2: Production — serve with nginx
FROM nginx:alpine AS prod

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3000

# Stage 3: Dev — base image for docker-compose override
FROM node:20-alpine AS dev

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY . .

EXPOSE 3000
