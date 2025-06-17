// server/src/modules/tag/tag.controller.ts
import { Request, Response } from 'express'; // NextFunction không cần nếu dùng asyncHandler hết
import { tagService } from './';
import {
  CreateTagInput,
  UpdateTagInput,
  UpdateTagParams,
  TagIdParams,
} from './tag.schema';
import { HttpStatus, GeneralMessages } from '@/types';
// asyncHandler đã được dùng ở tag.route.ts rồi

export const createTagHandler = async (
  req: Request<{}, {}, CreateTagInput>, // CreateTagInput giờ có thể chứa isActive
  res: Response
): Promise<void> => {
  const tagData = req.body;
  const newTag = await tagService.createTag(tagData);
  res.status(HttpStatus.CREATED).json({
    message: 'Tag created successfully!', // Có thể thêm "isActive: newTag.isActive" nếu muốn
    data: newTag,
  });
};

export const getAllTagsHandler = async (
  req: Request, // Sau này có thể nhận query params để filter isActive
  res: Response
): Promise<void> => {
  // const { isActive } = req.query; // Ví dụ
  // const tags = await tagService.getAllTags({ isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined });
  const tags = await tagService.getAllTags();
  res.status(HttpStatus.OK).json({
    message: GeneralMessages.RETRIEVED_SUCCESS,
    count: tags.length,
    data: tags,
  });
};

export const getTagByIdHandler = async (
  req: Request<TagIdParams>,
  res: Response
): Promise<void> => {
  const { tagId } = req.params;
  const tag = await tagService.getTagById(tagId);
  // Nếu muốn, có thể thêm logic: nếu tag.isActive === false thì trả về 404 cho user thường,
  // nhưng admin vẫn xem được. Hiện tại service đang trả về tag bất kể isActive.
  res.status(HttpStatus.OK).json({
    message: GeneralMessages.RETRIEVED_SUCCESS,
    data: tag,
  });
};

export const updateTagByIdHandler = async (
  req: Request<UpdateTagParams, {}, UpdateTagInput>, // UpdateTagInput giờ có thể chứa isActive
  res: Response
): Promise<void> => {
  const { tagId } = req.params;
  const updateData = req.body;
  const updatedTag = await tagService.updateTagById(tagId, updateData);
  res.status(HttpStatus.OK).json({
    message: 'Tag updated successfully!', // Có thể thêm "isActive: updatedTag.isActive"
    data: updatedTag,
  });
};

export const deleteTagByIdHandler = async (
  req: Request<TagIdParams>,
  res: Response
): Promise<void> => {
  const { tagId } = req.params;
  await tagService.deleteTagById(tagId);
  res.status(HttpStatus.OK).json({ // Hoặc NO_CONTENT (204)
    message: 'Tag deleted successfully!',
  });
};