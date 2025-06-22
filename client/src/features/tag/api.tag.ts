// client/src/features/Tag/api.Tag.ts
import { axiosInstance } from '@/shared/api/axiosInstance';
import type { Tag, CreateTagInput, UpdateTagInput } from './types';

// GET ALL
export const getTags = async (): Promise<Tag[]> => {
  const { data } = await axiosInstance.get<{ data: Tag[] }>('/Tags');
  return data.data;
};

// CREATE
export const createTag = async (TagData: CreateTagInput): Promise<Tag> => {
  const { data } = await axiosInstance.post<{ data: Tag }>('/Tags', TagData);
  return data.data;
};

// UPDATE
export const updateTag = async (TagId: string, TagData: UpdateTagInput): Promise<Tag> => {
  const { data } = await axiosInstance.put<{ data: Tag }>(`/Tags/${TagId}`, TagData);
  return data.data;
};

// DELETE
export const deleteTag = async (TagId: string): Promise<void> => {
  await axiosInstance.delete(`/Tags/${TagId}`);
};