// Định nghĩa kiểu cho một lựa chọn font
export interface FontOption {
    name: string; // Tên hiển thị trong dropdown, ví dụ: "Cổ điển - Lora"
    value: string; // Giá trị lưu vào DB, phải khớp với tên trên Google Fonts / @fontsource, ví dụ: "Lora"
}

// Mảng chứa tất cả các font được hỗ trợ trong project
export const AVAILABLE_FONTS: FontOption[] = [
    { name: 'Lobster (Mượt mà)', value: 'Lobster' },
    { name: 'Cổ điển (Lora)', value: 'Lora Variable' },
    // Sau này sếp muốn thêm font nào thì chỉ cần thêm vào đây
];