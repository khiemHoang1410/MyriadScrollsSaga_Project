// server/src/utils/slugify.util.ts
// (Nếu dùng thư viện thì import ở đây, ví dụ: import slugifyLib from 'slugify';)

export const generateSlug = (text: string): string => {
    if (typeof text !== 'string' || text.trim() === '') {
      return ''; // Trả về rỗng nếu input không hợp lệ
    }
  
    let slug = text
      .toLowerCase()
      .trim()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Bỏ dấu tiếng Việt
      .replace(/[đĐ]/g, 'd') // Xử lý chữ đ/Đ
      .replace(/\s+/g, '-') // Thay khoảng trắng bằng gạch nối
      .replace(/[^\w-]+/g, ''); // Loại bỏ các ký tự không phải chữ, số, gạch dưới, gạch nối
  
    // Giới hạn độ dài slug nếu cần
    if (slug.length > 100) {
      slug = slug.substring(0, 100);
    }
    // Loại bỏ dấu gạch nối ở đầu/cuối (nếu có sau khi replace)
    slug = slug.replace(/^-+|-+$/g, '');
  
    return slug;
  };