// server/src/modules/tag/tag.service.ts
import TagModel, { ITag } from './tag.model'; // Đảm bảo import đúng TagModel
import { CreateTagInput, UpdateTagInput } from './tag.schema';
import { AppError } from '@/utils/errors';
import { HttpStatus, GeneralMessages } from '@/types';
import { logger } from '@/config';

export const createTag = async (input: CreateTagInput): Promise<ITag> => {
  // isActive sẽ được lấy từ input, nếu không có thì model sẽ dùng default là true
  const { name, description, isActive } = input; 

  logger.debug('Service: Attempting to create tag with input:', { name, description, isActive });

  try {
    const tagData: Partial<ITag> = { name, description };
    if (isActive !== undefined) { // Chỉ gán nếu isActive được cung cấp
      tagData.isActive = isActive;
    }
    // Pre-save hook sẽ tự động tạo slug

    const newTag = await TagModel.create(tagData);

    logger.info(`Service: Tag created successfully - Name: ${newTag.name}, ID: ${newTag._id}, isActive: ${newTag.isActive}`);
    return newTag;
  } catch (error: any) {
    // ... (phần catch error giữ nguyên như phiên bản "chuẩn" trước đó)
    logger.error('--- TAG SERVICE: CATCH BLOCK for createTag ---');
    logger.error('TAG SERVICE: Raw error object caught:', error);
    logger.error('TAG SERVICE: Error name:', error.name);
    logger.error('TAG SERVICE: Error message:', error.message);
    logger.error('TAG SERVICE: Error code (if any):', error.code);
    logger.error('TAG SERVICE: Error keyPattern (if any):', error.keyPattern);
    logger.error('TAG SERVICE: Input data that caused error:', input);

    if (error.name === 'ValidationError') { // Lỗi từ Mongoose validation (ví dụ name required) hoặc từ hook ném ra
        const messages = Object.values(error.errors).map((val: any) => val.message).join('. ');
        throw new AppError(`Validation failed: ${messages}`, HttpStatus.BAD_REQUEST);
    }
    if (error.code === 11000 && error.keyPattern) { // Lỗi unique constraint (E11000)
      if (error.keyPattern.name) {
        throw new AppError(
          `Tag name '${name}' already exists. Please choose a different name.`,
          HttpStatus.CONFLICT
        );
      }
      if (error.keyPattern.slug) {
        // Lỗi này ít khi xảy ra trực tiếp nếu name là unique và slug tạo từ name
        throw new AppError(
          `A tag with a similar name (resulting in a duplicate slug) already exists. Please try a slightly different name.`,
          HttpStatus.CONFLICT
        );
      }
    }
    // Lỗi từ hook (ví dụ: không tạo được slug)
    if (error.message && (error.message.startsWith('Critical: Slug could not be generated') || error.message.startsWith('Critical: Tag name is invalid') || error.message.startsWith('Critical Fallback: Slug is still missing'))) {
        throw new AppError(error.message, HttpStatus.INTERNAL_SERVER_ERROR); // Hoặc BAD_REQUEST tùy ngữ cảnh
    }
    throw new AppError(
      GeneralMessages.ERROR + ' creating tag. Please check server logs for more details.',
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
};

export const getAllTags = async (/* queryParams: ví dụ { isActive?: boolean } */): Promise<ITag[]> => {
  try {
    // Sau này có thể thêm filter theo queryParams, ví dụ:
    // const filter: any = {};
    // if (queryParams.isActive !== undefined) filter.isActive = queryParams.isActive;
    // const tags = await TagModel.find(filter).sort({ name: 1 }).lean();

    // Hiện tại lấy tất cả
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

export const getTagById = async (tagId: string): Promise<ITag | null> => {
  // ... (giữ nguyên, có thể thêm filter isActive nếu muốn)
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

export const updateTagById = async (
  tagId: string,
  input: UpdateTagInput
): Promise<ITag | null> => {
  const { name, description, isActive } = input;
  const updates: Partial<ITag> = {};
  if (name !== undefined) updates.name = name;
  if (description !== undefined) updates.description = description;
  if (isActive !== undefined) updates.isActive = isActive; // << XỬ LÝ isActive

  if (Object.keys(updates).length === 0) {
    throw new AppError(GeneralMessages.EMPTY_BODY_ERROR, HttpStatus.BAD_REQUEST);
  }

  try {
    // Pre-save hook sẽ tự cập nhật slug nếu 'name' thay đổi
    const updatedTag = await TagModel.findByIdAndUpdate(
      tagId,
      updates,
      { new: true, runValidators: true }
    ).lean();

    if (!updatedTag) {
      throw new AppError(GeneralMessages.NOT_FOUND + ': Tag not found for update.', HttpStatus.NOT_FOUND);
    }
    logger.info(`Service: Tag updated successfully - Name: ${updatedTag.name}, ID: ${updatedTag._id}, isActive: ${updatedTag.isActive}`);
    return updatedTag;
  } catch (error: any) {
    // ... (phần catch error giữ nguyên như phiên bản "chuẩn" trước đó, có thể bổ sung thêm xử lý lỗi unique cho slug nếu name thay đổi)
     if (error instanceof AppError) throw error;

    if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map((val: any) => val.message).join('. ');
        throw new AppError(`Validation failed during update: ${messages}`, HttpStatus.BAD_REQUEST);
    }

    if (error.code === 11000 && error.keyPattern) {
      if (error.keyPattern.name && updates.name) {
        throw new AppError(`Tag name '${updates.name}' already exists.`, HttpStatus.CONFLICT);
      }
      if (error.keyPattern.slug && updates.name) {
        throw new AppError(`Generated slug from name '${updates.name}' already exists. Try a different name.`, HttpStatus.CONFLICT);
      }
    }
     // Lỗi từ hook (ví dụ: không tạo được slug khi name thay đổi)
    if (error.message && (error.message.startsWith('Critical: Slug could not be generated') || error.message.startsWith('Critical: Tag name is invalid'))) {
        throw new AppError(error.message, HttpStatus.INTERNAL_SERVER_ERROR); // Hoặc BAD_REQUEST
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

export const deleteTagById = async (tagId: string): Promise<boolean> => {
  // ... (giữ nguyên)
  try {
    const result = await TagModel.findByIdAndDelete(tagId);
    if (!result) {
      throw new AppError(GeneralMessages.NOT_FOUND + ': Tag not found for deletion.', HttpStatus.NOT_FOUND);
    }
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