# file: code/server/Dockerfile

# --- STAGE 1: Build ---
# Sử dụng một image Node.js phiên bản 20 làm "builder"
FROM node:20-alpine AS builder

# Set thư mục làm việc trong container
WORKDIR /app/server

# Copy package.json và package-lock.json vào trước
# Docker sẽ cache layer này, giúp lần build sau nhanh hơn nếu dependencies không đổi
COPY package*.json ./

# Cài đặt tất cả dependencies, bao gồm cả devDependencies để build
RUN npm ci

# Copy toàn bộ source code còn lại
COPY . .

# Build code TypeScript ra JavaScript trong thư mục /dist
RUN npm run build

# Xóa devDependencies để chuẩn bị cho production
RUN npm prune --production


# --- STAGE 2: Production ---
# Sử dụng một image Node.js phiên bản 20 siêu nhẹ cho production
FROM node:20-alpine

WORKDIR /app/server

# Copy package.json và node_modules đã được prune từ builder stage
COPY --from=builder /app/server/package.json ./
COPY --from=builder /app/server/node_modules ./

# Copy thư mục "dist" chứa code JavaScript đã build từ builder stage
COPY --from=builder /app/server/dist ./

# Expose port mà ứng dụng sẽ chạy (lấy từ .env sau này)
EXPOSE 5000

# Lệnh để khởi chạy ứng dụng khi container bắt đầu
CMD [ "node", "dist/server.js" ]