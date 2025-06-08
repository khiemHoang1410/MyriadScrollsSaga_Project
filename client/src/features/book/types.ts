// src/features/book/types.ts
export interface Book {
  _id: string;
  slug: string; // <<< DÒNG QUAN TRỌNG NHẤT CẦN THÊM
  title: string;
  description?: string | null;
  coverImageUrl?: string | null;
  author: {
    _id: string;
    username: string;
  };
  // Các trường này có thể chưa có trong dữ liệu trả về từ API /books
  // nhưng chúng ta thêm vào để chuẩn bị cho các bước sau.
  // Nếu có lỗi, bạn có thể tạm thời comment chúng lại.
  genres?: { _id: string; name: string }[];
  tags?: { _id: string; name: string }[];
  status?: string;
  }