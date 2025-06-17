// client/src/features/tag/api.tag.ts
import { axiosInstance } from '@/shared/api/axiosInstance';
import type { Tag } from './types';

export const getTags = async (): Promise<Tag[]> => {
  const { data } = await axiosInstance.get<{ data: Tag[] }>('/tags');
  return data.data;
};