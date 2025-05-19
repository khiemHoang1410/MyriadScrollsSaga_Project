// server/src/controllers/authController.ts
import { Request, Response, NextFunction } from 'express';
import UserModel, { UserRole, IUser } from '@/models/UserModel';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken'; // Đảm bảo SignOptions được import
import { HttpStatus, AuthMessages, GeneralMessages, AuthenticatedUserPayload } from '@/types/api.types';
import logger from '@/config/logger';
import { AppError, AuthError } from '@/utils/errors';

interface RegisterUserRequestBody {
  username?: string;
  email?: string;
  password?: string;
  roles?: UserRole[];
}

interface LoginUserRequestBody {
  email?: string;
  password?: string;
}

const generateToken = (user: IUser): string => {
  const jwtSecret = process.env.JWT_SECRET;

  // Logging để kiểm tra giá trị thực tế của jwtSecret khi chạy
  // console.log('--- generateToken: JWT_SECRET ---', jwtSecret);
  // console.log('--- generateToken: typeof JWT_SECRET ---', typeof jwtSecret);

  if (!jwtSecret) { // Check này quan trọng, bao gồm cả undefined, null, và chuỗi rỗng ""
    logger.error(AuthMessages.JWT_SECRET_MISSING + ' Ensure .env file is loaded and JWT_SECRET is set.');
    // Đây là lỗi cấu hình server, không phải lỗi client có thể sửa
    throw new AppError(AuthMessages.SERVER_ERROR_VERIFY_TOKEN, HttpStatus.INTERNAL_SERVER_ERROR, false);
  }

  // Cố gắng lấy userId và đảm bảo nó là string
  // Dùng (user as any) để tạm thời bỏ qua kiểm tra kiểu của TypeScript nếu nó quá "cứng đầu"
  // với _id, mặc dù IUser extends Document phải có _id.
  const userIdFromDB = (user as any)?._id;
  let userIdString: string | undefined;

  if (userIdFromDB && typeof userIdFromDB.toString === 'function') {
    userIdString = userIdFromDB.toString();
  }
  
  // console.log('--- generateToken: user._id (from DB) ---', userIdFromDB);
  // console.log('--- generateToken: userIdString (after toString) ---', userIdString);


  if (!userIdString || typeof userIdString !== 'string') {
    logger.error('User ID is missing, not an ObjectId, or could not be converted to string for JWT payload.', {
      username: user.username, // Log username để dễ debug
      userIdRaw: userIdFromDB,
    });
    throw new AppError('Cannot generate token: Valid User ID is missing or invalid.', HttpStatus.INTERNAL_SERVER_ERROR, false);
  }

  const payload: AuthenticatedUserPayload = {
    userId: userIdString,
    username: user.username,
    roles: user.roles,
  };

  const expiresInValue: string | number = process.env.JWT_ACCESS_TOKEN_EXPIRES_IN || '1h';
  // console.log('--- generateToken: expiresInValue ---', expiresInValue);


  const tokenOptions: SignOptions = {
    expiresIn: expiresInValue as any, // Vẫn dùng 'as any' ở đây như một giải pháp tình thế cho lỗi TS2322
                                     // Nếu không còn lỗi TS2322, có thể bỏ 'as any'
  };

  try {
    const token = jwt.sign(payload, jwtSecret, tokenOptions);
    // console.log('--- generateToken: Token generated successfully ---', token.substring(0, 15) + "...");
    return token;
  } catch (error: any) {
    logger.error('Failed to sign JWT token in generateToken.', {
      errorMessage: error.message,
      errorStack: error.stack,
      payloadUsed: payload,
      secretExists: !!jwtSecret, // true nếu jwtSecret có giá trị
      optionsUsed: tokenOptions,
    });
    // Ném lỗi để global error handler có thể bắt và xử lý
    throw new AppError('Failed to generate authentication token.', HttpStatus.INTERNAL_SERVER_ERROR, false);
  }
};

export const registerUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { username, email, password, roles }: RegisterUserRequestBody = req.body;

    if (!username || !email || !password) {
      throw new AppError(GeneralMessages.VALIDATION_ERROR + ': Username, email, and password are required.', HttpStatus.BAD_REQUEST);
    }

    const existingUser = await UserModel.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      const field = existingUser.email === email ? 'Email' : 'Username';
      throw new AppError(`${field} already exists.`, HttpStatus.BAD_REQUEST);
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = new UserModel({
      username,
      email,
      passwordHash,
      roles: roles || [UserRole.USER],
    });

    const savedUser = await newUser.save();

    const userResponse = {
      _id: savedUser._id,
      username: savedUser.username,
      email: savedUser.email,
      roles: savedUser.roles,
      createdAt: savedUser.createdAt,
    };

    res.status(HttpStatus.CREATED).json({
      user: userResponse,
      message: 'User registered successfully! Please log in.',
    });
  } catch (error) {
    if (error instanceof AppError) return next(error);
    // Xử lý lỗi từ Mongoose validation
    if ((error as any).name === 'ValidationError') {
      // Lấy thông điệp lỗi cụ thể hơn từ Mongoose nếu có thể
      let messages = (error as any).message;
      if ((error as any).errors) {
        messages = Object.values((error as any).errors).map((val: any) => val.message).join(', ');
      }
      return next(new AppError(GeneralMessages.VALIDATION_ERROR + ': ' + messages, HttpStatus.BAD_REQUEST));
    }
    logger.error('Error during user registration:', { errorMessage: (error as Error).message, errorStack: (error as Error).stack });
    next(new AppError('Server error during registration.', HttpStatus.INTERNAL_SERVER_ERROR, false));
  }
};

export const loginUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password }: LoginUserRequestBody = req.body;

    if (!email || !password) {
      throw new AppError(GeneralMessages.VALIDATION_ERROR + ': Email and password are required.', HttpStatus.BAD_REQUEST);
    }

    const user = await UserModel.findOne({ email });
    if (!user) {
      throw new AuthError(AuthMessages.INVALID_CREDENTIALS, HttpStatus.UNAUTHORIZED);
    }

    // Kiểm tra xem user có passwordHash không (phòng trường hợp dữ liệu DB bị lỗi)
    if (!user.passwordHash) {
        logger.error(`User ${email} found but has no passwordHash.`);
        throw new AppError('User account is improperly configured.', HttpStatus.INTERNAL_SERVER_ERROR, false);
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new AuthError(AuthMessages.INVALID_CREDENTIALS, HttpStatus.UNAUTHORIZED);
    }

    const token = generateToken(user);

    res.status(HttpStatus.OK).json({
      message: 'Login successful!',
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        roles: user.roles,
      },
    });
  } catch (error) {
    if (error instanceof AppError) return next(error); // Bao gồm cả AuthError vì nó extends AppError
    logger.error('Error during user login:', { errorMessage: (error as Error).message, errorStack: (error as Error).stack });
    next(new AppError('Server error during login.', HttpStatus.INTERNAL_SERVER_ERROR, false));
  }
};