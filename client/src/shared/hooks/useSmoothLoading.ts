// client/src/shared/hooks/useSmoothLoading.ts
import { useState, useEffect, useRef } from 'react';

/**
 * Một custom hook để đảm bảo trạng thái loading hiển thị trong ít nhất một khoảng thời gian.
 * @param isLoading Trạng thái loading gốc từ react-query.
 * @param minDuration Thời gian hiển thị tối thiểu (miligiây). Mặc định 500ms.
 * @returns Trạng thái boolean cho biết có nên hiển thị UI loading hay không.
 */
export const useSmoothLoading = (isLoading: boolean, minDuration: number = 500): boolean => {
  const [isShowing, setIsShowing] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const requestStartRef = useRef<number | null>(null);

  useEffect(() => {
    if (isLoading) {
      // Khi bắt đầu loading, ghi lại thời gian và set isShowing thành true ngay lập tức
      requestStartRef.current = Date.now();
      setIsShowing(true);
    } else if (!isLoading && isShowing) {
      // Khi hết loading, nhưng UI vẫn đang hiển thị loading...
      const elapsedTime = Date.now() - (requestStartRef.current || 0);
      
      if (elapsedTime < minDuration) {
        // Nếu load quá nhanh, set một cái hẹn giờ để tắt loading sau
        const timeout = minDuration - elapsedTime;
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => setIsShowing(false), timeout);
      } else {
        // Nếu load đủ lâu rồi, tắt loading ngay
        setIsShowing(false);
      }
    }

    // Cleanup function để xóa timer nếu component unmount
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isLoading, isShowing, minDuration]);

  return isShowing;
};