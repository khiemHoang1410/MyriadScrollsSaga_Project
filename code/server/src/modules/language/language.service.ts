// server/src/modules/language/language.service.ts
import LanguageModel, { ILanguage } from './language.model'; // Import model và interface
import { CreateLanguageInput, UpdateLanguageInput } from './language.schema'; // Import Zod input types
import { AppError } from '@/utils/errors'; // Custom error class
import { HttpStatus, GeneralMessages } from '@/types/api.types'; // HTTP status codes và general messages
import { logger } from '@/config'; // Logger

// --- Service Functions for Language ---

/**
 * Tạo một Language mới.
 * @param input - Dữ liệu để tạo Language (name, code, nativeName, flagIconUrl, isActive) từ Zod schema.
 * @returns Language đã được tạo.
 * @throws AppError nếu mã 'code' đã tồn tại hoặc có lỗi khác.
 */
export const createLanguage = async (input: CreateLanguageInput): Promise<ILanguage> => {
  const { name, code, nativeName, flagIconUrl, isActive } = input;
  logger.debug('Service: Attempting to create language with input:', input);

  try {
    // Kiểm tra xem 'code' đã tồn tại chưa (vì code là unique trong model)
    // Mongoose unique constraint sẽ tự báo lỗi E11000, nhưng check sớm ở đây có thể cho message thân thiện hơn.
    // Tuy nhiên, để đơn giản và nhất quán, mình có thể dựa vào lỗi E11000 từ Mongoose.

    const languageData: Partial<ILanguage> = { name, code, nativeName, flagIconUrl };
    if (isActive !== undefined) {
      languageData.isActive = isActive;
    }
    // Nếu không truyền isActive, model sẽ dùng default là true

    const newLanguage = await LanguageModel.create(languageData);
    logger.info(`Service: Language created successfully - Code: ${newLanguage.code}, Name: ${newLanguage.name}, ID: ${newLanguage._id}`);
    return newLanguage;
  } catch (error: any) {
    logger.error('--- LANGUAGE SERVICE: CATCH BLOCK for createLanguage ---');
    logger.error('LANGUAGE SERVICE: Raw error object caught:', error);

    if (error.name === 'ValidationError') { // Lỗi từ Mongoose validation (ví dụ name/code required)
        const messages = Object.values(error.errors).map((val: any) => val.message).join('. ');
        throw new AppError(`Validation failed: ${messages}`, HttpStatus.BAD_REQUEST);
    }
    if (error.code === 11000 && error.keyPattern) { // Lỗi unique constraint (E11000)
      if (error.keyPattern.code) {
        throw new AppError(
          `Language code '${code}' already exists. Please choose a different code.`,
          HttpStatus.CONFLICT
        );
      }
      // Có thể thêm check cho 'name' nếu 'name' cũng là unique
    }
    throw new AppError(
      GeneralMessages.ERROR + ' creating language. Please check server logs.',
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
};

/**
 * Lấy tất cả các Languages.
 * Có thể tùy chọn filter theo isActive.
 * @param queryParams - Đối tượng chứa các query params, ví dụ { isActive?: boolean }
 * @returns Mảng các Languages.
 */
export const getAllLanguages = async (queryParams?: { isActive?: boolean }): Promise<ILanguage[]> => {
  try {
    const filter: any = {};
    if (queryParams && queryParams.isActive !== undefined) {
      filter.isActive = queryParams.isActive;
    }
    // Sắp xếp theo tên cho dễ nhìn
    const languages = await LanguageModel.find(filter).sort({ name: 1 }).lean();
    return languages;
  } catch (error: any) {
    logger.error('Error fetching all languages:', { error });
    throw new AppError(
      GeneralMessages.ERROR + ' fetching languages.',
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
};

/**
 * Lấy một Language theo ID.
 * @param languageId - ID của Language cần lấy.
 * @returns Language tìm thấy hoặc null.
 * @throws AppError nếu ID không hợp lệ hoặc có lỗi khác.
 */
export const getLanguageById = async (languageId: string): Promise<ILanguage | null> => {
  try {
    const language = await LanguageModel.findById(languageId).lean();
    if (!language) {
      throw new AppError(GeneralMessages.NOT_FOUND + ': Language not found.', HttpStatus.NOT_FOUND);
    }
    return language;
  } catch (error: any) {
    if (error instanceof AppError) throw error;
    logger.error(`Error fetching language by ID ${languageId}:`, { error });
    if (error.name === 'CastError' && error.path === '_id') {
      throw new AppError(GeneralMessages.INVALID_ID_FORMAT + ': Invalid Language ID format.', HttpStatus.BAD_REQUEST);
    }
    throw new AppError(
      GeneralMessages.ERROR + ` fetching language with ID ${languageId}.`,
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
};

/**
 * Cập nhật một Language theo ID.
 * @param languageId - ID của Language cần cập nhật.
 * @param input - Dữ liệu cập nhật (name, code, nativeName, flagIconUrl, isActive).
 * @returns Language đã được cập nhật.
 * @throws AppError nếu không tìm thấy Language, mã 'code' bị trùng hoặc có lỗi khác.
 */
export const updateLanguageById = async (
  languageId: string,
  input: UpdateLanguageInput
): Promise<ILanguage | null> => {
  const { name, code, nativeName, flagIconUrl, isActive } = input;
  const updates: Partial<ILanguage> = {};

  // Chỉ thêm vào object 'updates' nếu trường đó được cung cấp trong input
  if (name !== undefined) updates.name = name;
  if (code !== undefined) updates.code = code.toLowerCase(); // Luôn đảm bảo code là lowercase khi update
  if (nativeName !== undefined) updates.nativeName = nativeName;
  if (flagIconUrl !== undefined) updates.flagIconUrl = flagIconUrl;
  if (isActive !== undefined) updates.isActive = isActive;


  if (Object.keys(updates).length === 0) {
    throw new AppError(GeneralMessages.EMPTY_BODY_ERROR, HttpStatus.BAD_REQUEST);
  }

  logger.debug(`Service: Attempting to update language ID ${languageId} with updates:`, updates);

  try {
    const updatedLanguage = await LanguageModel.findByIdAndUpdate(
      languageId,
      updates,
      { new: true, runValidators: true } // runValidators để chạy Mongoose validation
    ).lean();

    if (!updatedLanguage) {
      throw new AppError(GeneralMessages.NOT_FOUND + ': Language not found for update.', HttpStatus.NOT_FOUND);
    }
    logger.info(`Service: Language updated successfully - Code: ${updatedLanguage.code}, ID: ${updatedLanguage._id}`);
    return updatedLanguage;
  } catch (error: any) {
    if (error instanceof AppError) throw error; // Re-throw AppError đã được ném từ trên (ví dụ EMPTY_BODY_ERROR)
    logger.error('--- LANGUAGE SERVICE: CATCH BLOCK for updateLanguageById ---');
    logger.error('LANGUAGE SERVICE: Raw error object caught during update:', error);

    if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map((val: any) => val.message).join('. ');
        throw new AppError(`Validation failed during update: ${messages}`, HttpStatus.BAD_REQUEST);
    }
    if (error.code === 11000 && error.keyPattern && error.keyPattern.code && updates.code) {
      throw new AppError(
        `Language code '${updates.code}' already exists. Please choose a different code.`,
        HttpStatus.CONFLICT
      );
    }
    if (error.name === 'CastError' && error.path === '_id') {
      throw new AppError(GeneralMessages.INVALID_ID_FORMAT + ': Invalid Language ID format.', HttpStatus.BAD_REQUEST);
    }
    throw new AppError(
      GeneralMessages.ERROR + ` updating language with ID ${languageId}.`,
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
};

/**
 * Xóa một Language theo ID.
 * @param languageId - ID của Language cần xóa.
 * @returns True nếu xóa thành công.
 * @throws AppError nếu không tìm thấy Language hoặc có lỗi khác.
 */
export const deleteLanguageById = async (languageId: string): Promise<boolean> => {
  try {
    const result = await LanguageModel.findByIdAndDelete(languageId);
    if (!result) {
      throw new AppError(GeneralMessages.NOT_FOUND + ': Language not found for deletion.', HttpStatus.NOT_FOUND);
    }
    // Cân nhắc: Khi xóa một Language, có cần kiểm tra xem nó có đang được Book nào sử dụng không?
    // Nếu có, có thể không cho xóa hoặc có cơ chế xử lý khác (ví dụ: gán Book sang một language default).
    // Hiện tại, service này chỉ thực hiện xóa đơn giản.
    logger.info(`Service: Language deleted successfully - Code: ${result.code}, ID: ${result._id}`);
    return true;
  } catch (error: any) {
    if (error instanceof AppError) throw error;
    logger.error(`Error deleting language by ID ${languageId}:`, { error });
    if (error.name === 'CastError' && error.path === '_id') {
      throw new AppError(GeneralMessages.INVALID_ID_FORMAT + ': Invalid Language ID format.', HttpStatus.BAD_REQUEST);
    }
    throw new AppError(
      GeneralMessages.ERROR + ` deleting language with ID ${languageId}.`,
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
};