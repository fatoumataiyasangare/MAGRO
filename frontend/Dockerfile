# Stage 1: Build
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source files
COPY index.html vite.config.ts tsconfig.json postcss.config.mjs ./
COPY frontend ./frontend
COPY default_shadcn_theme.css ./

# Build the application
RUN npm run build

# Stage 2: Serve with nginx
FROM nginxinc/nginx-unprivileged:1.27-alpine

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Expose unprivileged port
EXPOSE 8080

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
