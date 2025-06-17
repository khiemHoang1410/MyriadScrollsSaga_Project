// client/vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { fileURLToPath, URL } from 'node:url'; // Sửa/Thêm dòng này

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: { // Thêm object này
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    hmr: {
      host: 'localhost',
      port: 5173, // Đảm bảo port này khớp với port client của bạn
    },
  },
})