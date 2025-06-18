// client/src/features/play/usePlayState.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPlayState, makeChoice } from './api.play';
import type { PlayState } from './types'; // Import PlayState

/**
 * Custom hook để quản lý toàn bộ trạng thái của màn chơi game.
 * @param slug - Slug của cuốn sách đang chơi.
 */
export const usePlayState = (slug: string | undefined) => {
  const queryClient = useQueryClient();
  const queryKey = ['playState', slug];

  // Dùng useQuery để lấy state game ban đầu và mỗi khi nó thay đổi
  const query = useQuery({
    queryKey,
    queryFn: () => getPlayState(slug!),
    enabled: !!slug,
  });

  // Dùng useMutation để xử lý hành động "chọn một lựa chọn"
  const mutation = useMutation({
    mutationFn: makeChoice,

    onSuccess: (newPlayState: PlayState) => {
      // FIX 1: setQueryData giờ sẽ nhận thẳng object PlayState
      // thay vì { data: PlayState }
      queryClient.setQueryData(queryKey, newPlayState);
      console.log('Choice successful! New state set to cache.');
    },
    onError: (error) => {
      console.error("Lỗi khi đưa ra lựa chọn:", error);
    }
  });

  return {
    // FIX 2: query.data giờ đã là object PlayState, không cần .data nữa
    playState: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    makeChoice: mutation.mutate,
    isMakingChoice: mutation.isPending,
  };
};