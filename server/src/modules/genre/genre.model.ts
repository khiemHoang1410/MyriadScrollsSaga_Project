// server/src/modules/genre/genre.model.ts
import { logger } from '@/config';
import mongoose, { Document, Schema, model } from 'mongoose';
import { generateSlug } from '@/utils';

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
      // required: [true, 'Genre slug is required.'], // << TẠM THỜI COMMENT DÒNG NÀY
      default: () => `temp-slug-<span class="math-inline">\{Date\.now\(\)\}\-</span>{Math.random().toString(36).substring(7)}`, // HOẶC THÊM DEFAULT TẠM
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

GenreSchema.pre<IGenre>('save', function (next) {
  logger.debug('[Genre Pre-Save Hook] Triggered.', { /* ... */ });

  if ((this.isModified('name') || this.isNew)) {
    if (typeof this.name === 'string' && this.name.trim() !== '') {
      const generated = generateSlug(this.name); // << DÙNG generateSlug Ở ĐÂY
      if (generated) {
        this.slug = generated;
        logger.debug('[Genre Pre-Save Hook] Generated slug:', this.slug);
        return next();
      } else {
        logger.error('[Genre Pre-Save Hook] Slug generation resulted in empty string for name:', this.name);
        // Vì Zod đã check ở tầng trên, trường hợp này rất hiếm khi xảy ra
        // Nhưng nếu vẫn xảy ra, và slug là required, Mongoose sẽ tự báo lỗi
        // Hoặc mình có thể ném lỗi tường minh hơn:
        return next(new Error(`Cannot generate a valid (non-empty) slug for the genre name: "${this.name}".`));
      }
    } else {
      logger.error('[Genre Pre-Save Hook] Name is invalid or empty for slug generation.');
      return next(new Error('Genre name is required and must be a non-empty string to generate a slug.'));
    }
  }
  return next();
});



const GenreModel = model<IGenre>('Genre', GenreSchema);

export default GenreModel;