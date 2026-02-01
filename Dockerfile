# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration (optional - using default)
# If you need custom nginx config, uncomment and create nginx.conf
# COPY nginx.conf /etc/nginx/nginx.conf

# Expose port 8082
EXPOSE 8082

# Start nginx on port 8082
CMD ["sh", "-c", "sed -i 's/listen       80;/listen       8082;/' /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]
