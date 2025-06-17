// client/src/shared/api/axiosInstance.ts

import axios from 'axios';
import { useAuthStore } from '../store/authStore';

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
});

// === REQUEST INTERCEPTOR (GẮN TOKEN VÀO HEADER) ===
// Phần này của sếp đã làm tốt rồi, mình giữ nguyên.
axiosInstance.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// === RESPONSE INTERCEPTOR (XỬ LÝ KHI TOKEN HẾT HẠN) ===
axiosInstance.interceptors.response.use(
  (response) => {
    // Nếu response thành công (status 2xx), cứ cho nó đi qua
    return response;
  },
  (error) => {
    // Check xem có phải lỗi từ server và có status code không
    if (error.response) {
      // Check có phải lỗi 401 (Unauthorized) không
      if (error.response.status === 401) {
        // Lấy state hiện tại để kiểm tra
        const state = useAuthStore.getState();
        // Chỉ logout nếu user đang "nghĩ" là mình đã đăng nhập
        // và request gây lỗi không phải là request login (để tránh vòng lặp)
        if (state.token && error.config.url !== '/auth/login') {
          console.log('Token expired or invalid. Logging out...');
          // Gọi action logout từ store để xóa token và user data
          state.logout();
          // Đá người dùng về trang login, reload lại toàn bộ state của app
          window.location.href = '/login';
        }
      }
    }
    // Đối với các lỗi khác, cứ trả về để component tự xử lý
    return Promise.reject(error);
  }
);

// Đảm bảo sếp export default cái instance này
export default axiosInstance;