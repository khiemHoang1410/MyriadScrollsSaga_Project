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

axiosInstance.interceptors.response.use(
  (response) => {
    // Nếu request thành công, không làm gì cả, chỉ trả về response
    return response;
  },
  (error) => {
    // Nếu có lỗi, kiểm tra xem có phải lỗi 401 Unauthorized không
    if (error.response?.status === 401) {
      console.log('Token expired or invalid, logging out...');
      // Gọi hành động logout từ authStore để xóa token và user info
      useAuthStore.getState().logout();
      // Điều hướng người dùng về trang đăng nhập
      window.location.href = '/login';
    }

    // Với các lỗi khác, chỉ cần trả về error để các nơi khác (như React Query) tự xử lý
    return Promise.reject(error);
  },
);

export default axiosInstance;
