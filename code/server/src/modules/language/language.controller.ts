// server/src/modules/language/language.controller.ts
import { Request, Response } from 'express';
import * as languageService from './language.service'; // Import tất cả các hàm từ service
import {
  CreateLanguageInput,
  UpdateLanguageInput,
  UpdateLanguageParams,
  LanguageIdParams,
} from './language.schema'; // Import các Zod input/params types
import { HttpStatus, GeneralMessages } from '@/types/api.types';
// asyncHandler sẽ được dùng ở file route

// --- Language Controller Handlers ---

/**
 * @description Tạo một Language mới
 * @route POST /api/languages
 * @access Private (Admin) - Sẽ được bảo vệ ở tầng route
 */
export const createLanguageHandler = async (
  req: Request<{}, {}, CreateLanguageInput>, // Request body type
  res: Response
): Promise<void> => {
  const languageData = req.body;
  const newLanguage = await languageService.createLanguage(languageData);
  res.status(HttpStatus.CREATED).json({
    message: 'Language created successfully!',
    data: newLanguage,
  });
};

/**
 * @description Lấy danh sách tất cả các Languages
 * @route GET /api/languages
 * @access Public (Hoặc có thể filter theo isActive cho user thường)
 */
export const getAllLanguagesHandler = async (
  req: Request<{}, {}, {}, { isActive?: string }>, // Query params type for isActive
  res: Response
): Promise<void> => {
  const isActiveQuery = req.query.isActive;
  const queryParams: { isActive?: boolean } = {};

  if (isActiveQuery === 'true') {
    queryParams.isActive = true;
  } else if (isActiveQuery === 'false') {
    queryParams.isActive = false;
  }
  // Nếu isActiveQuery không phải 'true' hoặc 'false', service sẽ lấy tất cả

  const languages = await languageService.getAllLanguages(queryParams);
  res.status(HttpStatus.OK).json({
    message: GeneralMessages.RETRIEVED_SUCCESS,
    count: languages.length,
    data: languages,
  });
};

/**
 * @description Lấy thông tin chi tiết một Language theo ID
 * @route GET /api/languages/:languageId
 * @access Public
 */
export const getLanguageByIdHandler = async (
  req: Request<LanguageIdParams>, // Request params type
  res: Response
): Promise<void> => {
  const { languageId } = req.params;
  const language = await languageService.getLanguageById(languageId);
  // Service đã throw AppError(HttpStatus.NOT_FOUND) nếu không tìm thấy
  res.status(HttpStatus.OK).json({
    message: GeneralMessages.RETRIEVED_SUCCESS,
    data: language,
  });
};

/**
 * @description Cập nhật một Language theo ID
 * @route PUT /api/languages/:languageId
 * @access Private (Admin) - Sẽ được bảo vệ ở tầng route
 */
export const updateLanguageByIdHandler = async (
  req: Request<UpdateLanguageParams, {}, UpdateLanguageInput>, // Params và Body types
  res: Response
): Promise<void> => {
  const { languageId } = req.params;
  const updateData = req.body;
  const updatedLanguage = await languageService.updateLanguageById(languageId, updateData);
  // Service đã throw AppError(HttpStatus.NOT_FOUND) nếu không tìm thấy
  res.status(HttpStatus.OK).json({
    message: 'Language updated successfully!',
    data: updatedLanguage,
  });
};

/**
 * @description Xóa một Language theo ID
 * @route DELETE /api/languages/:languageId
 * @access Private (Admin) - Sẽ được bảo vệ ở tầng route
 */
export const deleteLanguageByIdHandler = async (
  req: Request<LanguageIdParams>, // Request params type
  res: Response
): Promise<void> => {
  const { languageId } = req.params;
  await languageService.deleteLanguageById(languageId);
  // Service đã throw AppError(HttpStatus.NOT_FOUND) nếu không tìm thấy
  res.status(HttpStatus.OK).json({ // Hoặc HttpStatus.NO_CONTENT (204) với body rỗng
    message: 'Language deleted successfully!',
  });
};