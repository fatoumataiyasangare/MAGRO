# Stage 1: Build
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source files
COPY . .

# Build TypeScript
RUN npm run build

# Stage 2: Run
FROM node:22-alpine

WORKDIR /app
ENV NODE_ENV=production

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm install --omit=dev && npm cache clean --force

# Copy built files from builder stage
COPY --from=builder /app/dist ./dist

# Copy Prisma files
COPY prisma ./prisma

# Generate Prisma client
RUN npx prisma generate

# Expose port 4000
EXPOSE 4000

USER node

# Start the application
CMD ["node", "dist/index.js"]
