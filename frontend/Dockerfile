from oven/bun:latest AS builder

workdir /app

COPY package.json bun.lock ./

RUN bun install 

copy . .

RUN bun run build


from nginx:stable-alpine AS production

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

COPY nginx.conf /etc/nginx/conf.d/default.conf

ENTRYPOINT ["nginx", "-g", "daemon off;"]
