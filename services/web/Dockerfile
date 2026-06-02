FROM node:22-alpine AS builder

WORKDIR /app
COPY services/web/package*.json ./
RUN npm ci
COPY services/web/ ./
RUN npm run build

FROM nginx:alpine

RUN apk add --no-cache openssl
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx/nginx.conf /etc/nginx/nginx.conf
COPY nginx/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 80 443
ENTRYPOINT ["/entrypoint.sh"]
