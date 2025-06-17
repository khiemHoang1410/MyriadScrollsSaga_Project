/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_API_BASE_URL: string;
    // Thêm các biến môi trường khác của sếp ở đây nếu có
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }