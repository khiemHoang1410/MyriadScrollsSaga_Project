// server/src/controllers/adminController.ts
import { Request, Response, NextFunction } from 'express';
import UserModel, { IUser, UserRole } from '@/models/UserModel';
import { AuthenticatedRequest, HttpStatus, AuthMessages, GeneralMessages } from '@/types/api.types';
import { AppError } from '@/utils/errors';
import logger from '@/config/logger';
import mongoose from 'mongoose';


// Interface cho request body khi cập nhật user (ví dụ)
interface UpdateUserByAdminRequestBody {
    username?: string;
    email?: string;
    roles?: UserRole[];
    // isBanned?: boolean; // Ví dụ
}


export const getAllUsers = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        // Thêm phân trang nếu cần
        const users = await UserModel.find().select('-passwordHash'); // Loại bỏ passwordHash
        res.status(HttpStatus.OK).json({
            message: 'Users retrieved successfully.',
            count: users.length,
            data: users,
        });
    } catch (error) {
        logger.error('Error fetching all users:', error);
        next(new AppError(GeneralMessages.ERROR, HttpStatus.INTERNAL_SERVER_ERROR, false));
    }
};

export const getUserById = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.params.userId;
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            throw new AppError('Invalid user ID format.', HttpStatus.BAD_REQUEST);
        }

        const user = await UserModel.findById(userId).select('-passwordHash');
        if (!user) {
            throw new AppError(AuthMessages.USER_NOT_FOUND, HttpStatus.NOT_FOUND);
        }
        res.status(HttpStatus.OK).json({
            message: 'User retrieved successfully.',
            data: user,
        });
    } catch (error) {
        if (error instanceof AppError) return next(error);
        logger.error('Error fetching user by ID:', error);
        next(new AppError(GeneralMessages.ERROR, HttpStatus.INTERNAL_SERVER_ERROR, false));
    }
};

export const updateUserByAdmin = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.params.userId;
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            throw new AppError('Invalid user ID format.', HttpStatus.BAD_REQUEST);
        }

        const updates: UpdateUserByAdminRequestBody = req.body;

        // Không cho phép admin tự ý thay đổi password của user qua API này
        // Nếu cần thì phải có API riêng và quy trình phức tạp hơn.
        // if (updates.password) delete updates.password;


        // Nếu admin đang cố gắng gỡ bỏ role cuối cùng của chính mình và đó là admin role
        if (req.user?.userId === userId && updates.roles) {
            const currentAdminUser = await UserModel.findById(userId);
            if (currentAdminUser && currentAdminUser.roles.includes(UserRole.ADMIN) && !updates.roles.includes(UserRole.ADMIN)) {
                 const otherAdminsCount = await UserModel.countDocuments({ _id: { $ne: userId }, roles: UserRole.ADMIN });
                 if (otherAdminsCount === 0) {
                    throw new AppError('Cannot remove the last admin role.', HttpStatus.BAD_REQUEST);
                 }
            }
        }


        const updatedUser = await UserModel.findByIdAndUpdate(userId, updates, {
            new: true, // Trả về document đã được cập nhật
            runValidators: true, // Chạy các validators đã định nghĩa trong schema
        }).select('-passwordHash');

        if (!updatedUser) {
            throw new AppError(AuthMessages.USER_NOT_FOUND, HttpStatus.NOT_FOUND);
        }

        logger.info(`User ${updatedUser.username} (ID: ${userId}) updated by admin ${req.user?.username}`);
        res.status(HttpStatus.OK).json({
            message: 'User updated successfully by admin.',
            data: updatedUser,
        });
    } catch (error) {
        if (error instanceof AppError) return next(error);
        logger.error('Error updating user by admin:', error);
        next(new AppError(GeneralMessages.ERROR, HttpStatus.INTERNAL_SERVER_ERROR, false));
    }
};

export const deleteUserByAdmin = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.params.userId;
         if (!mongoose.Types.ObjectId.isValid(userId)) {
            throw new AppError('Invalid user ID format.', HttpStatus.BAD_REQUEST);
        }

        // Không cho phép admin tự xóa chính mình qua API này nếu là admin cuối cùng
        if (req.user?.userId === userId) {
            const userToDelete = await UserModel.findById(userId);
            if(userToDelete && userToDelete.roles.includes(UserRole.ADMIN)){
                const otherAdminsCount = await UserModel.countDocuments({ _id: { $ne: userId }, roles: UserRole.ADMIN });
                if(otherAdminsCount === 0){
                    throw new AppError('Cannot delete the last admin account.', HttpStatus.BAD_REQUEST);
                }
            }
        }

        const deletedUser = await UserModel.findByIdAndDelete(userId);

        if (!deletedUser) {
            throw new AppError(AuthMessages.USER_NOT_FOUND, HttpStatus.NOT_FOUND);
        }

        logger.info(`User ${deletedUser.username} (ID: ${userId}) deleted by admin ${req.user?.username}`);
        res.status(HttpStatus.OK).json({ message: 'User deleted successfully by admin.' });
    } catch (error) {
        if (error instanceof AppError) return next(error);
        logger.error('Error deleting user by admin:', error);
        next(new AppError(GeneralMessages.ERROR, HttpStatus.INTERNAL_SERVER_ERROR, false));
    }
};