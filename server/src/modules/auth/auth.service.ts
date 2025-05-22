// src/modules/auth/auth.service.ts
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import UserModel, { IUser, UserRole } from '@/modules/user/user.model';
import { RegisterUserInput, LoginUserInput } from './auth.schema';
import { AppError, AuthError } from '@/utils';
import { HttpStatus, AuthMessages, GeneralMessages, AuthenticatedUserPayload } from '@/types';
import { logger } from '@/config';

const generateToken = (user: IUser): string => {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    logger.error(AuthMessages.JWT_SECRET_MISSING + ' Ensure .env file is loaded and JWT_SECRET is set.');
    throw new AppError(AuthMessages.SERVER_ERROR_VERIFY_TOKEN, HttpStatus.INTERNAL_SERVER_ERROR, false);
  }

  const userIdFromDB = (user as any)?._id;
  let userIdString: string | undefined;

  if (userIdFromDB && typeof userIdFromDB.toString === 'function') {
    userIdString = userIdFromDB.toString();
  }

  if (!userIdString || typeof userIdString !== 'string') {
    logger.error('User ID is missing or could not be converted to string for JWT payload.', {
      username: user.username,
      userIdRaw: userIdFromDB,
    });
    throw new AppError(AuthMessages.USERID_MISSING_FOR_TOKEN, HttpStatus.INTERNAL_SERVER_ERROR, false);
  }

  const payload: AuthenticatedUserPayload = {
    userId: userIdString,
    username: user.username,
    roles: user.roles,
  };

  const expiresInSetting: string = process.env.JWT_ACCESS_TOKEN_EXPIRES_IN || '1h';

  const tokenOptions: SignOptions = {
    expiresIn: expiresInSetting as any,
  };

  try {
    const token = jwt.sign(payload, jwtSecret, tokenOptions);
    return token;
  } catch (error: any) {
    logger.error('Failed to sign JWT token in generateToken.', {
      errorMessage: error.message,
      payloadUsed: payload,
      optionsUsed: tokenOptions,
    });
    throw new AppError(AuthMessages.TOKEN_GENERATION_FAILED, HttpStatus.INTERNAL_SERVER_ERROR, false);
  }
};

export const register = async (input: RegisterUserInput): Promise<Partial<IUser>> => {
  const { username, email, password, roles } = input;

  const existingUser = await UserModel.findOne({ $or: [{ email }, { username }] }).lean();
  if (existingUser) {
    const field = existingUser.email === email ? 'Email' : 'Username';
    const messageKey = field.toLowerCase() as keyof typeof AuthMessages;
    // @ts-ignore
    const specificMessage = AuthMessages[messageKey] || `${field} already exists.`;
    throw new AppError(specificMessage, HttpStatus.CONFLICT);
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  const newUser = new UserModel({
    username,
    email,
    passwordHash,
    roles: roles && roles.length > 0 ? roles : [UserRole.USER],
  });

  const savedUser = await newUser.save();
  return savedUser.toObject();
};

export const login = async (input: LoginUserInput): Promise<{ token: string; user: Partial<IUser> }> => {
  const { email, password } = input;

  const user = await UserModel.findOne({ email }).select('+passwordHash').lean();
  if (!user) {
    throw new AuthError(AuthMessages.INVALID_CREDENTIALS, HttpStatus.UNAUTHORIZED);
  }

  if (!user.passwordHash) {
      logger.error(`User ${email} found but has no passwordHash.`);
      throw new AppError(AuthMessages.ACCOUNT_CONFIG_ERROR, HttpStatus.INTERNAL_SERVER_ERROR, false);
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    throw new AuthError(AuthMessages.INVALID_CREDENTIALS, HttpStatus.UNAUTHORIZED);
  }

  const token = generateToken(user as IUser);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordHash: _, ...userResponse } = user;
  return { token, user: userResponse };
};