// server/src/modules/language/language.model.ts
import mongoose, { Document, Schema, model } from 'mongoose';

// Interface định nghĩa cấu trúc cho một Language document
export interface ILanguage extends Document {
  name: string;         // Tên ngôn ngữ bằng tiếng Anh, ví dụ: "English", "Vietnamese"
  code: string;         // Mã ngôn ngữ theo chuẩn (ví dụ: ISO 639-1 như "en", "vi"), duy nhất
  nativeName?: string | null;  // Tên ngôn ngữ bằng tiếng bản địa, ví dụ: "English", "Tiếng Việt"
  flagIconUrl?: string | null; // URL đến icon lá cờ (tùy chọn)
  isActive: boolean;    // Ngôn ngữ này có đang được kích hoạt để sử dụng không (ví dụ: cho phép tạo sách mới bằng ngôn ngữ này)
  // createdAt, updatedAt sẽ được Mongoose tự động thêm
}

const LanguageSchema = new Schema<ILanguage>(
  {
    name: {
      type: String,
      required: [true, 'Language name is required.'],
      trim: true,
      maxlength: [100, 'Language name cannot exceed 100 characters.'],
    },
    code: { // Mã ngôn ngữ (ví dụ: 'en', 'vi', 'ja')
      type: String,
      required: [true, 'Language code is required.'],
      unique: true,
      trim: true,
      lowercase: true,
      minlength: [2, 'Language code should be at least 2 characters.'],
      maxlength: [10, 'Language code cannot exceed 10 characters.'], // ISO 639-1, 639-2, etc.
    },
    nativeName: { // Tên ngôn ngữ bằng tiếng bản địa
      type: String,
      trim: true,
      maxlength: [100, 'Native language name cannot exceed 100 characters.'],
    },
    flagIconUrl: {
      type: String,
      trim: true,
    },
    isActive: { // Admin có thể bật/tắt ngôn ngữ này cho việc tạo sách mới
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true, getters: true },
    toObject: { virtuals: true, getters: true },
  }
);

// --- Indexes ---

const LanguageModel = model<ILanguage>('Language', LanguageSchema);

export default LanguageModel;