// file: client/src/shared/store/themeStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Định nghĩa "hình dạng" của store
interface ThemeState {
  mode: 'light' | 'dark';
  toggleMode: () => void;
}

// Tạo store, có persist để lưu lựa chọn của người dùng vào localStorage
export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      mode: 'light', // Mặc định là theme sáng
      toggleMode: () =>
        set((state) => ({
          mode: state.mode === 'light' ? 'dark' : 'light',
        })),
    }),
    {
      name: 'theme-storage', // Tên để lưu trong localStorage
    }
  )
);