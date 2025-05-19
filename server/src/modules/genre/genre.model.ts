// server/src/modules/genre/genre.model.ts
import mongoose, { Document, Schema, model } from 'mongoose';

// Interface định nghĩa cấu trúc cho một Genre document
export interface IGenre extends Document {
  name: string;        // Tên thể loại, ví dụ: "Fantasy", "Kinh Dị Hiện Đại"
  slug: string;        // Slug cho URL thân thiện, ví dụ: "fantasy", "kinh-di-hien-dai"
  description?: string| null; // Mô tả thêm về thể loại (tùy chọn)
  // Có thể thêm các trường khác nếu bro muốn, ví dụ: iconUrl, colorCode, etc.
  // createdAt, updatedAt sẽ được Mongoose tự động thêm
  isActive: Boolean;
}

const GenreSchema = new Schema<IGenre>(
  {
    name: {
      type: String,
      required: [true, 'Genre name is required.'],
      unique: true,
      trim: true,
      maxlength: [100, 'Genre name cannot exceed 100 characters.'],
    },
    slug: {
      type: String,
      required: [true, 'Genre slug is required.'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Genre description cannot exceed 500 characters.'],
      default: null,
    },
    isActive: { // << THÊM isActive VÀO SCHEMA
      type: Boolean,
      default: true, // Mặc định là true khi tạo mới
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true, getters: true },
    toObject: { virtuals: true, getters: true },
  }
);


// --- Indexes ---
GenreSchema.index({ name: 1 }); // Index theo tên để tìm kiếm nhanh
GenreSchema.index({ slug: 1 }); // Index theo slug
GenreSchema.index({ isActive: 1 }); // Thêm index cho isActive nếu hay query theo trường này

// --- Pre-save Hook to auto-generate slug from name (Ví dụ) ---
// (Nếu không muốn tự động ở đây, thì sẽ xử lý ở service layer khi tạo/cập nhật genre)
GenreSchema.pre<IGenre>('save', function (next) {
  if (this.isModified('name') || this.isNew) {
    // Tạo slug đơn giản: chuyển thành chữ thường, thay khoảng trắng bằng gạch nối, loại bỏ ký tự đặc biệt
    this.slug = this.name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-') // Thay thế khoảng trắng bằng '-'
      .replace(/[^\w-]+/g, ''); // Loại bỏ các ký tự không phải chữ, số, gạch dưới, gạch nối
    // Có thể cần một thư viện tạo slug "xịn" hơn nếu tên có nhiều ký tự đặc biệt hoặc tiếng Việt có dấu
  }
  next();
});

const GenreModel = model<IGenre>('Genre', GenreSchema);

export default GenreModel;