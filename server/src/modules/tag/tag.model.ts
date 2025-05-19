// server/src/modules/tag/tag.model.ts
import mongoose, { Document, Schema, model } from 'mongoose';

// Interface định nghĩa cấu trúc cho một Tag document
export interface ITag extends Document {
  name: string;        // Tên tag, ví dụ: "Kinh Dị", "Hành Động", "Cổ Tích Hiện Đại"
  slug: string;        // Slug cho URL, ví dụ: "kinh-di", "hanh-dong"
  description?: string; // Mô tả thêm về tag (tùy chọn)
  usageCount?: number;  // Số lần tag này được sử dụng trong các cuốn sách (để biết tag phổ biến)
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
      required: [true, 'Tag slug is required.'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Tag description cannot exceed 500 characters.'],
    },
    usageCount: { // Số lần tag này được gắn vào sách
      type: Number,
      default: 0,
      min: 0,
    },
    // Ví dụ:
    // isFeatured: { type: Boolean, default: false }, // Tag nổi bật do admin chọn
  },
  {
    timestamps: true,
    toJSON: { virtuals: true, getters: true },
    toObject: { virtuals: true, getters: true },
  }
);

// --- Indexes ---
TagSchema.index({ name: 1 });
TagSchema.index({ slug: 1 });
TagSchema.index({ usageCount: -1 }); // Để tiện sắp xếp tag theo độ phổ biến

// --- Pre-save Hook to auto-generate slug from name ---
TagSchema.pre<ITag>('save', function (next) {
  if (this.isModified('name') || this.isNew) {
    this.slug = this.name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '');
  }
  next();
});

// (Optional) Nếu bro muốn cập nhật usageCount tự động khi Book được save/delete,
// nó sẽ phức tạp hơn và thường được xử lý ở service layer của Book hoặc Tag,
// hoặc bằng DB triggers/scheduled jobs để tránh logic phức tạp trong model hooks.
// For now, usageCount can be manually updated by admin or via a specific service function.

const TagModel = model<ITag>('Tag', TagSchema);

export default TagModel;