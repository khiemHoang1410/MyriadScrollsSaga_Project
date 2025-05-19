// server/src/modules/genre/genre.model.ts
import mongoose, { Document, Schema, model } from 'mongoose';

// Interface định nghĩa cấu trúc cho một Genre document
export interface IGenre extends Document {
  name: string;        // Tên thể loại, ví dụ: "Fantasy", "Kinh Dị Hiện Đại"
  slug: string;        // Slug cho URL thân thiện, ví dụ: "fantasy", "kinh-di-hien-dai"
  description?: string; // Mô tả thêm về thể loại (tùy chọn)
  // Có thể thêm các trường khác nếu bro muốn, ví dụ: iconUrl, colorCode, etc.
  // createdAt, updatedAt sẽ được Mongoose tự động thêm
}

const GenreSchema = new Schema<IGenre>(
  {
    name: {
      type: String,
      required: [true, 'Genre name is required.'], // Bắt buộc phải có tên
      unique: true, // Tên thể loại phải là duy nhất
      trim: true,   // Xóa khoảng trắng thừa
      maxlength: [100, 'Genre name cannot exceed 100 characters.'],
    },
    slug: {
      type: String,
      required: [true, 'Genre slug is required.'],
      unique: true,
      trim: true,
      lowercase: true, // Slug nên là chữ thường
      // Slug thường được tạo tự động từ 'name' ở tầng service hoặc pre-save hook
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Genre description cannot exceed 500 characters.'],
    },
    // Ví dụ thêm một trường:
    // isActive: { type: Boolean, default: true }, // Để admin có thể ẩn/hiện một thể loại
  },
  {
    timestamps: true, // Tự động thêm createdAt và updatedAt
    toJSON: { virtuals: true, getters: true },
    toObject: { virtuals: true, getters: true },
  }
);

// --- Indexes ---
GenreSchema.index({ name: 1 }); // Index theo tên để tìm kiếm nhanh
GenreSchema.index({ slug: 1 }); // Index theo slug

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