from oven/bun:latest as builder
WORKDIR /app

COPY package.json bun.lock ./

RUN bun install --frozen-lockfile

COPY . .

RUN bun build src/index.ts --outdir dist --target bun

from oven/bun:alpine as runner

COPY --from=builder /app/package.json ./ 
COPY --from=builder /app/bun.lock ./

# installe seulement les dépendances de production
RUN bun install --frozen-lockfile --production

COPY --from=builder /app/dist ./dist
#Nécessaire car pas inclus dans le build
COPY --from=builder /app/src/db/init.sql ./dist/init.sql
CMD ["bun", "run", "dist/index.js"]

