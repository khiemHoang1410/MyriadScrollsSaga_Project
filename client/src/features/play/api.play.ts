// client/src/features/play/api.play.ts

import { axiosInstance } from '@/shared/api/axiosInstance';
import type { PlayState } from './types';

/**
 * Bắt đầu chơi hoặc lấy lại trạng thái chơi của một cuốn sách.
 * @param slug - Slug của cuốn sách.
 */
export const getPlayState = async (slug: string): Promise<PlayState> => {
  const { data } = await axiosInstance.get<{ data: PlayState }>(`/books/${slug}/play`);
  return data.data;
};

/**
 * Gửi lựa chọn của người dùng lên server.
 * @param params - Bao gồm slug, nodeId hiện tại và choiceId đã chọn.
 */
export const makeChoice = async (params: { slug: string; nodeId: string; choiceId: string }): Promise<PlayState> => {
  const { slug, nodeId, choiceId } = params;
  const url = `/books/${slug}/play/nodes/${nodeId}/choices/${choiceId}`;
  const { data } = await axiosInstance.post<{ data: PlayState }>(url);
  return data.data;
};