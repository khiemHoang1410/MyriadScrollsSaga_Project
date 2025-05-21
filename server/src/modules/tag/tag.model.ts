// server/src/modules/tag/tag.model.ts
import { generateSlug } from '@/utils/slugify.util'; // Import hàm tạo slug "thần thánh"
import { logger } from '@/config'; // Hoặc dùng console.log nếu muốn trong hook
import mongoose, { Document, Schema, model } from 'mongoose';

// Interface định nghĩa cấu trúc cho một Tag document
export interface ITag extends Document {
  name: string;        // Tên tag, ví dụ: "Action", "Dark Fantasy", "Female Protagonist"
  slug: string;        // Slug cho URL, ví dụ: "action", "dark-fantasy", "female-protagonist"
  description?: string | null; // Mô tả thêm về tag (tùy chọn)
  usageCount: number;  // Số lượng sách sử dụng tag này
  // createdAt, updatedAt sẽ được Mongoose tự động thêm
}

const TagSchema = new Schema<ITag>(
  {
    name: {
      type: String,
      required: [true, 'Tag name is required.'],
      unique: true,
      trim: true,
      maxlength: [100, 'Tag name cannot exceed 100 characters.'],
    },
    slug: {
      type: String,
      required: [true, 'Internal: Tag slug could not be generated and is required.'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Tag description cannot exceed 500 characters.'],
      default: null,
    },
    usageCount: { // Số lần tag này được sử dụng
      type: Number,
      default: 0,
      min: [0, 'Usage count cannot be negative.'],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true, getters: true }, // Để virtual 'id' hoạt động
    toObject: { virtuals: true, getters: true },
  }
);

// --- Indexes ---

TagSchema.index({ usageCount: -1 }); // Index usageCount để sau này lấy tag phổ biến

// --- Pre-save Hook to auto-generate slug from name ---
TagSchema.pre<ITag>('save', function (next) {
  // Log để theo dõi (có thể dùng logger.debug thay console.log)
  console.log('[Tag Pre-Save Hook] Triggered.', { isNew: this.isNew, isNameModified: this.isModified('name'), currentName: this.name });

  if (this.isModified('name') || this.isNew) {
    if (typeof this.name === 'string' && this.name.trim() !== '') {
      const generated = generateSlug(this.name); // Dùng hàm generateSlug từ utils
      if (generated) {
        this.slug = generated;
        console.log('[Tag Pre-Save Hook] Generated slug:', this.slug);
        return next();
      } else {
        console.error('[Tag Pre-Save Hook] Slug generation resulted in empty string for name:', this.name);
        return next(new Error(`Cannot generate a valid (non-empty) slug for the tag name: "${this.name}".`));
      }
    } else {
      console.error('[Tag Pre-Save Hook] Name is invalid or empty for slug generation.');
      return next(new Error('Tag name is required and must be a non-empty string to generate a slug.'));
    }
  }
  return next();
});

const TagModel = model<ITag>('Tag', TagSchema);

export default TagModel;