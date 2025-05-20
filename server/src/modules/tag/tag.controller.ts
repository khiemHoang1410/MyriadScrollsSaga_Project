// server/src/modules/tag/tag.controller.ts
import { Request, Response, NextFunction } from 'express';
import { tagService } from './'; // Import service từ barrel file của module tag
import {
  CreateTagInput,
  UpdateTagInput,
  UpdateTagParams,
  TagIdParams,
} from './tag.schema'; // Import các Zod input types
import { HttpStatus, GeneralMessages } from '@/types';
import { asyncHandler } from '@/utils'; // Import asyncHandler

// --- Tag Controller Handlers ---

export const createTagHandler = async (
  req: Request<{}, {}, CreateTagInput>,
  res: Response
): Promise<void> => {
  const tagData = req.body;
  const newTag = await tagService.createTag(tagData);
  res.status(HttpStatus.CREATED).json({
    message: 'Tag created successfully!',
    data: newTag,
  });
};

export const getAllTagsHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
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
  res.status(HttpStatus.OK).json({
    message: GeneralMessages.RETRIEVED_SUCCESS,
    data: tag,
  });
};

export const updateTagByIdHandler = async (
  req: Request<UpdateTagParams, {}, UpdateTagInput>,
  res: Response
): Promise<void> => {
  const { tagId } = req.params;
  const updateData = req.body;
  const updatedTag = await tagService.updateTagById(tagId, updateData);
  res.status(HttpStatus.OK).json({
    message: 'Tag updated successfully!',
    data: updatedTag,
  });
};

export const deleteTagByIdHandler = async (
  req: Request<TagIdParams>,
  res: Response
): Promise<void> => {
  const { tagId } = req.params;
  await tagService.deleteTagById(tagId);
  res.status(HttpStatus.OK).json({
    message: 'Tag deleted successfully!',
  });
};