# Build React app
FROM node:18-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# In Docker we prefer same-origin /api and let nginx proxy to backend.
ENV REACT_APP_API_BASE_URL=/api
RUN npm run build

# Serve with nginx + proxy /api to backend
FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
