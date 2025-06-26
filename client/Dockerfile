# file: code/client/Dockerfile

# --- STAGE 1: Build ---
    FROM node:20-alpine AS builder
    WORKDIR /app/client
    COPY package*.json ./
    RUN npm ci
    COPY . .
    # Build code React ra các file tĩnh trong thư mục /dist
    RUN npm run build
    
    # --- STAGE 2: Serve ---
    # Sử dụng Nginx làm web server siêu nhẹ để phục vụ các file tĩnh
    FROM nginx:1.27-alpine
    
    # Copy các file tĩnh đã được build từ builder stage vào thư mục mặc định của Nginx
    COPY --from=builder /app/client/dist /usr/share/nginx/html
    
    # Copy file cấu hình Nginx (sẽ tạo ở bước sau)
    # COPY nginx.conf /etc/nginx/conf.d/default.conf
    
    # Expose port 80 cho Nginx
    EXPOSE 80
    
    # Lệnh mặc định của Nginx để khởi chạy server
    CMD ["nginx", "-g", "daemon off;"]