'use client';

import { useEffect } from 'react';

export function ScrollToTop() {
  useEffect(() => {
    // Đảm bảo cuộn ngay lập tức về đầu trang (0, 0) không có hiệu ứng trượt trễ
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  return null;
}
