# syntax = docker/dockerfile:1
ARG NODE_VERSION=20.9.0
FROM node:${NODE_VERSION}-slim AS base
LABEL fly_launch_runtime="Vite"
WORKDIR /app
ENV NODE_ENV="production"

# Build stage
FROM base AS build
RUN apt-get update -qq && apt-get install -y build-essential
RUN pwd
RUN ls
RUN npm run build

# Final stage using Nginx
FROM nginx
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["/usr/sbin/nginx", "-g", "daemon off;"]