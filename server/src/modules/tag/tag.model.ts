// server/src/modules/tag/tag.model.ts
import mongoose, { Document, Schema, model } from 'mongoose';
import { logger } from '@/config';
import { generateSlug } from '@/utils/slugify.util';

export interface ITag extends Document {
  name: string;
  slug: string;
  description?: string | null;
  usageCount: number;
  isActive: boolean; // << THÊM VÀO INTERFACE
  // createdAt, updatedAt
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
    usageCount: {
      type: Number,
      default: 0,
      min: [0, 'Usage count cannot be negative.'],
    },
    isActive: { // << THÊM TRƯỜNG isActive
      type: Boolean,
      default: true, // Mặc định là true khi tạo mới
      index: true,   // Nên index nếu thường xuyên query/filter theo trường này
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true, getters: true },
    toObject: { virtuals: true, getters: true },
  }
);

// --- Indexes ---
TagSchema.index({ name: 1 });
TagSchema.index({ usageCount: -1 });
// TagSchema.index({ isActive: 1 }); // Đã có trong định nghĩa trường isActive ở trên

// --- Pre-save Hook "chuẩn" (giữ nguyên như phiên bản hoạt động tốt trước đó) ---
TagSchema.pre<ITag>('save', function(next) {
  // Đảm bảo LOG_LEVEL trong logger.ts là 'debug' để thấy log này
  logger.debug(`[TagModel Pre-Save Hook] Triggered. isNew: ${this.isNew}, isNameModified: ${this.isModified('name')}`);

  if (this.isModified('name') || this.isNew) {
    if (typeof this.name === 'string' && this.name.trim() !== '') {
      const generatedSlug = generateSlug(this.name);
      if (generatedSlug) {
        this.slug = generatedSlug;
        logger.debug(`[TagModel Pre-Save Hook] Slug generated and assigned: '${this.slug}' for name: '${this.name}'`);
        return next();
      } else {
        const errMsg = `Critical: Slug could not be generated from name "${this.name}" because the name likely results in an empty slug. Zod validation should have caught this.`;
        logger.error(`[TagModel Pre-Save Hook] ${errMsg}`);
        return next(new Error(errMsg));
      }
    } else {
      const errMsg = 'Critical: Tag name is invalid (not a string or empty) for slug generation. Zod validation should have caught this.';
      logger.error(`[TagModel Pre-Save Hook] ${errMsg}`);
      return next(new Error(errMsg));
    }
  }
  if (!this.slug && this.isNew) {
      const errMsg = `Critical Fallback: Slug is still missing for NEW tag with name "${this.name}" after attempting generation. This indicates a flaw in previous checks or invalid initial name.`;
      logger.error(`[TagModel Pre-Save Hook] ${errMsg}`);
      return next(new Error(errMsg));
  }
  return next();
});

const TagModel = model<ITag>('Tag', TagSchema);
// const TagModel = model<ITag>('Tag_WorkingModel', TagSchema); // Hoặc giữ tên test nếu chưa muốn đổi

export default TagModel;