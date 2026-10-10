import { TarotCard, TopicType, OrientationType } from '@/types/tarot';

export interface ResolvedMeaning {
  primary_text: string;
  is_vietnamese: boolean;
  fallback_note?: string;
  keywords: string[];
  topic: TopicType;
  orientation: OrientationType;
  general_meaning: string;
}

/**
 * Resolver giải nghĩa cơ bản theo đúng Mục 6:
 * - general + upright -> meaning_upright
 * - general + reversed -> meaning_reversed
 * - love + upright -> love
 * - love + reversed -> love_reversed
 * - career + upright -> career
 * - career + reversed -> career_reversed
 * 
 * Ưu tiên tiếng Việt có sẵn; nếu thiếu thì fallback về tiếng Anh với nhãn rõ ràng.
 * Nếu thiếu trường theo chủ đề thì fallback về nghĩa chung cùng chiều, KHÔNG fallback ngược sang xuôi mà không báo.
 */
export function resolveCardMeaning(
  card: TarotCard,
  topic: TopicType,
  orientation: OrientationType
): ResolvedMeaning {
  const isUpright = orientation === 'upright';

  // 1. Lấy từ khóa tương ứng chiều
  const keywordsVi = isUpright ? card.keywords_upright_vi : card.keywords_reversed_vi;
  const keywordsEn = isUpright ? card.keywords_upright : card.keywords_reversed;
  const keywords = (keywordsVi && keywordsVi.length > 0) ? keywordsVi : (keywordsEn || []);

  // 2. Nghĩa chung cùng chiều
  const generalVi = isUpright ? card.meaning_upright_vi : card.meaning_reversed_vi;
  const generalEn = isUpright ? card.meaning_upright : card.meaning_reversed;
  const generalText = generalVi || generalEn || '';

  let primaryText = '';
  let isVietnamese = true;
  let fallbackNote: string | undefined = undefined;

  if (topic === 'general') {
    if (generalVi) {
      primaryText = generalVi;
      isVietnamese = true;
    } else if (generalEn) {
      primaryText = generalEn;
      isVietnamese = false;
      fallbackNote = 'Nội dung nguyên bản tiếng Anh (Đang cập nhật bản dịch tiếng Việt chuẩn).';
    } else {
      primaryText = 'Chưa có dữ liệu giải nghĩa cho lá bài này.';
      isVietnamese = true;
      fallbackNote = 'Thiếu dữ liệu';
    }
  } else if (topic === 'love') {
    const loveVi = isUpright ? card.love_vi : card.love_reversed_vi;
    const loveEn = isUpright ? card.love : card.love_reversed;

    if (loveVi && loveVi.trim()) {
      primaryText = loveVi;
      isVietnamese = true;
    } else if (loveEn && loveEn.trim()) {
      primaryText = loveEn;
      isVietnamese = false;
      fallbackNote = 'Luận giải tình cảm nguyên bản tiếng Anh.';
    } else {
      // Fallback về nghĩa chung CÙNG CHIỀU
      primaryText = generalText;
      isVietnamese = !!generalVi;
      fallbackNote = `Chưa có mục giải nghĩa tình cảm riêng; hiển thị nghĩa tổng quan cùng chiều (${isUpright ? 'Xuôi' : 'Ngược'}).`;
    }
  } else if (topic === 'career') {
    const careerVi = isUpright ? card.career_vi : card.career_reversed_vi;
    const careerEn = isUpright ? card.career : card.career_reversed;

    if (careerVi && careerVi.trim()) {
      primaryText = careerVi;
      isVietnamese = true;
    } else if (careerEn && careerEn.trim()) {
      primaryText = careerEn;
      isVietnamese = false;
      fallbackNote = 'Luận giải sự nghiệp nguyên bản tiếng Anh.';
    } else {
      // Fallback về nghĩa chung CÙNG CHIỀU
      primaryText = generalText;
      isVietnamese = !!generalVi;
      fallbackNote = `Chưa có mục giải nghĩa sự nghiệp riêng; hiển thị nghĩa tổng quan cùng chiều (${isUpright ? 'Xuôi' : 'Ngược'}).`;
    }
  }

  return {
    primary_text: primaryText,
    is_vietnamese: isVietnamese,
    fallback_note: fallbackNote,
    keywords,
    topic,
    orientation,
    general_meaning: generalText
  };
}

/**
 * Định nghĩa các vị trí cho từng kiểu trải bài theo Mục 2
 */
export const SPREAD_DEFINITIONS = {
  daily: [
    {
      id: 'focus_today',
      name_vi: 'Điều nên chú ý hôm nay',
      name_en: 'Daily Focus',
      description_vi: 'Thông điệp năng lượng chủ đạo hướng dẫn bạn trong ngày hôm nay.'
    }
  ],
  three_cards: [
    {
      id: 'present',
      name_vi: 'Lá 1: Hiện tại',
      name_en: 'Present',
      description_vi: 'Năng lượng hiện thời, hoàn cảnh thực tế bạn đang đối diện.'
    },
    {
      id: 'obstacle',
      name_vi: 'Lá 2: Trở ngại hoặc điều cần chú ý',
      name_en: 'Obstacle or Caution',
      description_vi: 'Yếu tố cản trở, điểm mù hoặc điều bạn cần lưu tâm cẩn trọng.'
    },
    {
      id: 'action',
      name_vi: 'Lá 3: Hướng hành động nên cân nhắc',
      name_en: 'Recommended Action',
      description_vi: 'Lời khuyên hành động và hướng đi nên cân nhắc tiếp theo.'
    }
  ]
};
