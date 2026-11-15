# Development image for the Workforce Board monorepo.
FROM node:22-slim

RUN corepack enable
WORKDIR /app

# Install deps first (cached unless manifests/lockfile change)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/web/package.json apps/web/
COPY apps/api/package.json apps/api/
COPY apps/admin/package.json apps/admin/
COPY packages/shared/package.json packages/shared/
RUN pnpm install --frozen-lockfile

COPY . .

EXPOSE 5173
CMD ["pnpm", "--filter", "@workforce/web", "exec", "vite", "--host", "0.0.0.0", "--port", "5173"]
