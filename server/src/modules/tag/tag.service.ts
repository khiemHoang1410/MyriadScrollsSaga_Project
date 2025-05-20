// server/src/modules/tag/tag.service.ts
import TagModel, { ITag } from './tag.model'; // Thay GenreModel bằng TagModel, IGenre bằng ITag
import { CreateTagInput, UpdateTagInput } from './tag.schema'; // Thay schema types của Genre bằng của Tag
import { AppError } from '@/utils/errors';
import { HttpStatus, GeneralMessages } from '@/types';
import { logger } from '@/config';

/**
 * Tạo một Tag mới.
 * Slug sẽ được tự động tạo từ 'name' thông qua pre-save hook trong TagModel.
 * @param input - Dữ liệu để tạo Tag (name, description) từ Zod schema.
 * @returns Tag đã được tạo.
 * @throws AppError nếu tên Tag hoặc slug (tạo từ name) đã tồn tại, hoặc có lỗi khác.
 */
export const createTag = async (input: CreateTagInput): Promise<ITag> => {
  const { name, description } = input; // Tag không có isActive khi tạo từ client

  logger.debug('Service: Attempting to create tag with input:', input);

  try {
    const newTag = await TagModel.create({
      name,
      description,
      // usageCount sẽ có default là 0 trong model
    });

    logger.info(`Service: Tag created successfully - Name: ${newTag.name}, ID: ${newTag._id}`);
    return newTag;
  } catch (error: any) {
    logger.error('--- TAG SERVICE: CATCH BLOCK for createTag ---');
    logger.error('TAG SERVICE: Raw error object caught:', error);
    logger.error('TAG SERVICE: Error name:', error.name);
    logger.error('TAG SERVICE: Error message:', error.message);
    logger.error('TAG SERVICE: Error code (if any):', error.code);
    logger.error('TAG SERVICE: Error keyPattern (if any):', error.keyPattern);
    logger.error('TAG SERVICE: Input data that caused error:', input);

    if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map((val: any) => val.message).join('. ');
        throw new AppError(`Validation failed: ${messages}`, HttpStatus.BAD_REQUEST);
    }

    if (error.code === 11000 && error.keyPattern) {
      if (error.keyPattern.name) {
        throw new AppError(
          `Tag name '${name}' already exists. Please choose a different name.`,
          HttpStatus.CONFLICT
        );
      }
      if (error.keyPattern.slug) {
        throw new AppError(
          `A tag with a similar name (resulting in a duplicate slug) already exists. Please try a slightly different name.`,
          HttpStatus.CONFLICT
        );
      }
    }
    throw new AppError(
      GeneralMessages.ERROR + ' creating tag. Please check server logs for more details.',
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
};

/**
 * Lấy tất cả các Tags.
 * @returns Mảng các Tags.
 */
export const getAllTags = async (): Promise<ITag[]> => {
  try {
    const tags = await TagModel.find().sort({ name: 1 }).lean();
    return tags;
  } catch (error: any) {
    logger.error('Error fetching all tags:', { error });
    throw new AppError(
      GeneralMessages.ERROR + ' fetching tags.',
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
};

/**
 * Lấy một Tag theo ID.
 * @param tagId - ID của Tag cần lấy.
 * @returns Tag tìm thấy hoặc null.
 * @throws AppError nếu ID không hợp lệ hoặc có lỗi khác.
 */
export const getTagById = async (tagId: string): Promise<ITag | null> => {
  try {
    const tag = await TagModel.findById(tagId).lean();
    if (!tag) {
      throw new AppError(GeneralMessages.NOT_FOUND + ': Tag not found.', HttpStatus.NOT_FOUND);
    }
    return tag;
  } catch (error: any) {
    if (error instanceof AppError) throw error;
    logger.error(`Error fetching tag by ID ${tagId}:`, { error });
    if (error.name === 'CastError' && error.path === '_id') {
      throw new AppError(GeneralMessages.INVALID_ID_FORMAT + ': Invalid Tag ID format.', HttpStatus.BAD_REQUEST);
    }
    throw new AppError(
      GeneralMessages.ERROR + ` fetching tag with ID ${tagId}.`,
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
};

/**
 * Cập nhật một Tag theo ID.
 * @param tagId - ID của Tag cần cập nhật.
 * @param input - Dữ liệu cập nhật (name, description).
 * @returns Tag đã được cập nhật.
 * @throws AppError nếu không tìm thấy Tag, tên bị trùng hoặc có lỗi khác.
 */
export const updateTagById = async (
  tagId: string,
  input: UpdateTagInput
): Promise<ITag | null> => {
  const { name, description } = input; // Tag không có isActive để client cập nhật
  const updates: Partial<ITag> = {};
  if (name !== undefined) updates.name = name; // Nếu name thay đổi, pre-save hook sẽ cập nhật slug
  if (description !== undefined) updates.description = description;

  if (Object.keys(updates).length === 0) {
    throw new AppError(GeneralMessages.EMPTY_BODY_ERROR, HttpStatus.BAD_REQUEST);
  }

  try {
    const updatedTag = await TagModel.findByIdAndUpdate(
      tagId,
      updates,
      { new: true, runValidators: true } // runValidators để chạy Mongoose validation (vd: maxlength)
    ).lean();

    if (!updatedTag) {
      throw new AppError(GeneralMessages.NOT_FOUND + ': Tag not found for update.', HttpStatus.NOT_FOUND);
    }
    logger.info(`Service: Tag updated successfully - Name: ${updatedTag.name}, ID: ${updatedTag._id}`);
    return updatedTag;
  } catch (error: any) {
    if (error instanceof AppError) throw error;

    if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map((val: any) => val.message).join('. ');
        throw new AppError(`Validation failed during update: ${messages}`, HttpStatus.BAD_REQUEST);
    }

    if (error.code === 11000 && error.keyPattern) {
      if (error.keyPattern.name && updates.name) { // Chỉ báo lỗi nếu name thực sự được gửi để update
        throw new AppError(`Tag name '${updates.name}' already exists.`, HttpStatus.CONFLICT);
      }
      if (error.keyPattern.slug && updates.name) { // Chỉ báo lỗi nếu slug (từ name) bị trùng
        throw new AppError(`Generated slug from name '${updates.name}' already exists. Try a different name.`, HttpStatus.CONFLICT);
      }
    }
    logger.error(`Error updating tag by ID ${tagId}:`, { input, error });
    if (error.name === 'CastError' && error.path === '_id') {
      throw new AppError(GeneralMessages.INVALID_ID_FORMAT + ': Invalid Tag ID format.', HttpStatus.BAD_REQUEST);
    }
    throw new AppError(
      GeneralMessages.ERROR + ` updating tag with ID ${tagId}.`,
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
};

/**
 * Xóa một Tag theo ID.
 * @param tagId - ID của Tag cần xóa.
 * @returns True nếu xóa thành công.
 * @throws AppError nếu không tìm thấy Tag hoặc có lỗi khác.
 */
export const deleteTagById = async (tagId: string): Promise<boolean> => {
  try {
    const result = await TagModel.findByIdAndDelete(tagId);
    if (!result) {
      throw new AppError(GeneralMessages.NOT_FOUND + ': Tag not found for deletion.', HttpStatus.NOT_FOUND);
    }
    // Sau này có thể thêm logic: giảm usageCount ở các Book liên quan, hoặc kiểm tra usageCount trước khi xóa.
    // Hiện tại chỉ xóa đơn giản.
    logger.info(`Service: Tag deleted successfully - Name: ${result.name}, ID: ${result._id}`);
    return true;
  } catch (error: any) {
    if (error instanceof AppError) throw error;
    logger.error(`Error deleting tag by ID ${tagId}:`, { error });
    if (error.name === 'CastError' && error.path === '_id') {
      throw new AppError(GeneralMessages.INVALID_ID_FORMAT + ': Invalid Tag ID format.', HttpStatus.BAD_REQUEST);
    }
    throw new AppError(
      GeneralMessages.ERROR + ` deleting tag with ID ${tagId}.`,
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
};