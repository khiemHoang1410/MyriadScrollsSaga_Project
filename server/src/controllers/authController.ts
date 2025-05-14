// server/src/controllers/authController.ts
import { Request, Response } from 'express';
import UserModel from '@/models/UserModel'; // Dùng alias @/ cho "chuyên nghiệp"
import bcrypt from 'bcryptjs'; 
import jwt from 'jsonwebtoken';

interface RegisterUserRequestBody {
  username?: string;
  email?: string;
  password?: string;
}

interface LoginUserRequestBody {
  email?: string;
  password?: string;
}

export const registerUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password }: RegisterUserRequestBody = req.body; // Lấy username, email, password từ request body

    // 1. Kiểm tra xem thông tin có đầy đủ không
    if (!username || !email || !password) {
      res.status(400).json({ message: 'Please provide username, email, and password' });
      return;
    }

    // 2. Kiểm tra xem username hoặc email đã tồn tại chưa
    const existingUserByUsername = await UserModel.findOne({ username });
    if (existingUserByUsername) {
      res.status(400).json({ message: 'Username already exists' });
      return;
    }

    const existingUserByEmail = await UserModel.findOne({ email });
    if (existingUserByEmail) {
      res.status(400).json({ message: 'Email already registered' });
      return;
    }

    // 3. Băm mật khẩu (Hash password)
    const salt = await bcrypt.genSalt(10); // Tạo "muối" với độ phức tạp 10
    const passwordHash = await bcrypt.hash(password, salt); // Băm mật khẩu với "muối"

    // 4. Tạo người dùng mới
    const newUser = new UserModel({
      username,
      email,
      passwordHash, // Lưu mật khẩu đã băm
    });

    // 5. Lưu người dùng vào database
    const savedUser = await newUser.save();

    // 6. Phản hồi thành công (không gửi lại passwordHash)
    // Mình có thể tùy chỉnh thông tin trả về sau này, ví dụ thêm token JWT
    res.status(201).json({
      _id: savedUser._id,
      username: savedUser.username,
      email: savedUser.email,
      createdAt: savedUser.createdAt,
      updatedAt: savedUser.updatedAt,
      message: 'User registered successfully!',
    });

  } catch (error: any) {
    console.error('Error during user registration:', error);
    // Xử lý lỗi do validate của Mongoose (ví dụ: email không đúng định dạng, username quá ngắn)
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((val: any) => val.message);
      res.status(400).json({ message: messages.join(', ') });
      return;
    }
    res.status(500).json({ message: 'Server error during registration', error: error.message });
  }
};

export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password }: LoginUserRequestBody = req.body;

    // 1. Kiểm tra thông tin đăng nhập có đầy đủ không
    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required' });
      return;
    }

    // 2. Tìm người dùng bằng email
    const user = await UserModel.findOne({ email });
    if (!user) {
      res.status(401).json({ message: 'Invalid credentials - User not found' }); // Không nên nói rõ là user hay pass sai
      return;
    }

    // 3. So sánh mật khẩu người dùng nhập với passwordHash trong database
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ message: 'Invalid credentials - Password mismatch' }); // Không nên nói rõ là user hay pass sai
      return;
    }

    // 4. Nếu thông tin hợp lệ, tạo JWT token
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('FATAL ERROR: JWT_SECRET is not defined in .env file');
      res.status(500).json({ message: 'Server configuration error' }); // Lỗi server, không phải lỗi người dùng
      return;
    }

    const payload = {
      userId: user._id,
      username: user.username,
      // Bạn có thể thêm các thông tin khác vào payload nếu cần (ví dụ: role)
    };

    const token = jwt.sign(
      payload,
      jwtSecret,
      { expiresIn: '1h' } // Token hết hạn sau 1 giờ (có thể là '1d', '7d',...)
    );

    // 5. Phản hồi thành công, gửi token về cho client
    res.status(200).json({
      message: 'Login successful!',
      token,
      user: { // Gửi lại một vài thông tin user cơ bản (không gửi passwordHash)
        _id: user._id,
        username: user.username,
        email: user.email,
      },
    });

  } catch (error: any) {
    console.error('Error during user login:', error);
    res.status(500).json({ message: 'Server error during login', error: error.message });
  }
};

// (Sau này mình sẽ thêm các controller khác cho login, logout,... ở đây)