FROM node:20-bullseye-slim AS builder
WORKDIR /app
RUN npm install -g pnpm
COPY package.json pnpm-workspace.yaml .
COPY tsconfig.json .
COPY server/package.json server/tsconfig.json server/prisma ./server/
RUN pnpm install
COPY . .
RUN pnpm --filter ./ install
RUN pnpm --filter server exec prisma generate
RUN pnpm --filter server exec tsc -p server/tsconfig.json
RUN pnpm build

FROM node:20-bullseye-slim AS runner
WORKDIR /app
RUN npm install -g pnpm
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-workspace.yaml ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server/dist ./server/dist
COPY --from=builder /app/.env.example ./
EXPOSE 4000
CMD ["node", "server/dist/index.js"]
