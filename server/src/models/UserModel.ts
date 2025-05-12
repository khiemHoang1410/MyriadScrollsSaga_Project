// server/src/models/UserModel.ts
import mongoose, { Document, Schema } from 'mongoose';

// Định nghĩa interface cho User document (để TypeScript hiểu rõ hơn)
export interface IUser extends Document {
  username: string;
  email: string;
  passwordHash: string; // Sẽ lưu mật khẩu đã được băm (hashed)
  // registrationDate?: Date; // Mongoose timestamps sẽ tự xử lý createdAt
  // lastLoginDate?: Date;    // Mongoose timestamps sẽ tự xử lý updatedAt (có thể dùng cho lastLogin)
  // Mongoose tự tạo _id làm Khóa chính (PK)
}

const UserSchema: Schema<IUser> = new Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required'], // Bắt buộc phải có username
      unique: true, // Username phải là duy nhất
      trim: true, // Xóa khoảng trắng thừa ở đầu và cuối
      minlength: [3, 'Username must be at least 3 characters long'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true, // Lưu email dưới dạng chữ thường
      match: [ // Kiểm tra định dạng email cơ bản
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please fill a valid email address',
      ],
    },
    passwordHash: {
      // Đổi tên từ HashedPassword cho nó "chuẩn Mongoose" hơn một chút
      // và bỏ Salt vì thư viện băm mật khẩu như bcryptjs sẽ tự quản lý salt
      type: String,
      required: [true, 'Password is required'],
      // Không lưu salt riêng, bcryptjs sẽ nhúng salt vào trong chuỗi hash
    },
    // registrationDate và lastLoginDate có thể dùng timestamps của Mongoose
  },
  {
    timestamps: true, // Tự động thêm hai trường: createdAt (registrationDate) và updatedAt (có thể dùng cho lastLoginDate)
  }
);

// Tạo và export User model
const UserModel = mongoose.model<IUser>('User', UserSchema);

export default UserModel;