import axios from 'axios';
import { useAuthStore } from '../store/authStore';

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
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


// THÊM INTERCEPTOR CHO RESPONSE (LÍNH GÁC 401)
axiosInstance.interceptors.response.use(
  (response) => {
    // Bất kỳ status code nào trong khoảng 2xx sẽ đi vào đây
    return response;
  },
  (error) => {
    // Bất kỳ status code nào ngoài 2xx sẽ đi vào đây
    if (error.response && error.response.status === 401) {
      console.error("Unauthorized! Logging out...");
      // Lấy action logout từ store và thực thi
      useAuthStore.getState().logout();

      // Redirect về trang login, có thể cần reload để đảm bảo UI cập nhật
      // (Cách redirect có thể khác nhau tùy vào bro dùng React Router v6 hay v7)
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default axiosInstance; // Đổi tên export mặc định