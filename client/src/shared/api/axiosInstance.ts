import axios from 'axios';
import { useAuthStore } from '../store/authStore';

export const axiosInstance = axios.create({
  baseURL: 'http://localhost:8000/api', // << Đảm bảo port này khớp với server của bạn
});


axiosInstance.interceptors.request.use(
  (config) => {
    // Lấy token từ Zustand store
    const token = useAuthStore.getState().token;

    // Nếu có token, thêm nó vào header Authorization
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config; // Trả về config đã được sửa đổi
  },
  (error) => {
    // Xử lý lỗi nếu có
    return Promise.reject(error);
  }
);