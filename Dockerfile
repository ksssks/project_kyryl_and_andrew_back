# =========================
# Stage 1: Build
# =========================
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy source code
COPY . .

# Run build if needed (наприклад, для babel)
# RUN npm run build

# =========================
# Stage 2: Production
# =========================
FROM node:20-alpine

WORKDIR /usr/src/app

# Copy node_modules та додаток з stage 1
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app ./

# Set environment variables (можна також через docker-compose)
ENV PORT=4000

EXPOSE 4000

# Command to start the app
CMD ["node", "server.js"]