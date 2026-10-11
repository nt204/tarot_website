import { PricingPackage } from '@/types/business';

export const PRICING_PACKAGES: PricingPackage[] = [
  {
    id: 'free',
    name: 'Khám phá',
    subtitle: 'Trải nghiệm lần đầu',
    tagline: 'Cảm nhận giá trị và sự đồng điệu cùng những thông điệp khởi nguyên',
    price: 0,
    priceUnit: 'lần',
    features: [
      'Trải bài 3 lá kinh điển hoặc 1 lá ngày',
      'Giải nghĩa cơ bản có chiều sâu',
      'Câu hỏi chiêm nghiệm gợi mở góc nhìn',
      'Không giới hạn lượt trải nghiệm cơ bản',
      'Giao diện tương tác 3D tĩnh tâm'
    ],
    featuresMobile: [
      'Trải bài 3 lá kinh điển',
      'Giải nghĩa cơ bản',
      'Câu hỏi chiêm nghiệm',
      'Miễn phí 100%'
    ],
    ctaText: 'Trải bài miễn phí',
    ctaTextMobile: 'Trải bài'
  },
  {
    id: 'deep',
    name: 'Chuyên sâu (VIP)',
    subtitle: 'Mở rộng 5 lá',
    tagline: 'Mở rộng góc nhìn toàn cảnh, giải phóng điểm mù và định hình hành động',
    price: 29000,
    priceUnit: 'lượt',
    badge: 'Được chọn nhiều nhất',
    badgeMobile: 'Nổi bật',
    highlight: true,
    features: [
      'Mở rộng 5 lá bài toàn cảnh (kế thừa 3 lá ban đầu)',
      'Phân tích Điểm mù & Góc nhìn mới để tiến lên',
      '3 hành động thực tế tiếp theo tháo gỡ bế tắc',
      'Hỏi đáp và làm rõ thêm các băn khoăn trong phiên',
      'Lưu kết quả & xuất bản ghi chiêm nghiệm trọn đời'
    ],
    featuresMobile: [
      'Mở rộng 5 lá toàn cảnh',
      'Phân tích điểm mù & góc nhìn mới',
      '3 hành động thực tế',
      'Lưu kết quả trọn đời'
    ],
    ctaText: 'Mở khóa chuyên sâu',
    ctaTextMobile: 'Mở khóa'
  },
  {
    id: 'companion',
    name: 'Đồng hành (PREMIUM)',
    subtitle: 'Thành viên tháng',
    tagline: 'Trò chuyện cùng Trạm theo ngữ cảnh trải bài để tháo gỡ những băn khoăn còn lại',
    price: 99000,
    priceUnit: 'tháng',
    badge: 'Tiết kiệm 65%',
    badgeMobile: '-65%',
    features: [
      '10 lượt trải bài chuyên sâu 5 lá VIP',
      '100 tin nhắn trò chuyện cùng Trạm / tháng (tối đa 20 tin/ngày)',
      'Trò chuyện cùng Trạm theo ngữ cảnh trải bài',
      'Tiếp tục trao đổi để làm rõ những băn khoăn còn lại',
      'Tra cứu toàn bộ lịch sử các phiên trải bài',
      'Ưu tiên kết nối thông điệp siêu tốc độ'
    ],
    featuresMobile: [
      '10 lượt trải bài 5 lá VIP',
      '100 tin nhắn cùng Trạm',
      'Trò chuyện theo ngữ cảnh trải bài',
      'Tra cứu lịch sử trọn đời'
    ],
    ctaText: 'Đăng ký đồng hành',
    ctaTextMobile: 'Đăng ký'
  }
];

export const BANK_CONFIG = {
  bankId: 'MB', // Military Commercial Joint Stock Bank
  bankName: 'MB Bank (Ngân hàng Quân Đội)',
  accountNo: '0988776655',
  accountName: 'TRAM TAROT ME',
  transferPrefix: 'TAROT'
};
