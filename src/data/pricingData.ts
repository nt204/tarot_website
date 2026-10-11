import { PricingPackage } from '@/types/business';

export const PRICING_PACKAGES: PricingPackage[] = [
  {
    id: 'free',
    name: 'Khám phá',
    subtitle: 'Trải nghiệm lần đầu',
    tagline: 'Cảm nhận giá trị và sự đồng điệu cùng những thông điệp khởi nguyên',
    price: 0,
    priceUnit: 'trải nghiệm',
    features: [
      'Trải bài 3 lá kinh điển hoặc 1 lá ngày',
      'Giải nghĩa cơ bản có chiều sâu',
      'Câu hỏi chiêm nghiệm gợi mở góc nhìn',
      'Không giới hạn lượt trải nghiệm cơ bản',
      'Giao diện tương tác 3D tĩnh tâm'
    ],
    ctaText: 'Trải bài miễn phí'
  },
  {
    id: 'deep',
    name: 'Chuyên sâu',
    subtitle: 'Mỗi lượt trải bài',
    tagline: 'Gỡ rối từng nút thắt, phân tích đa chiều bám sát câu chuyện của bạn',
    price: 29000,
    priceUnit: 'mỗi lượt',
    badge: 'Được chọn nhiều nhất',
    highlight: true,
    features: [
      'Tất cả quyền lợi của gói Khám phá',
      'Phân tích chi tiết theo câu chuyện riêng của bạn',
      'Luận giải liên kết đa tầng giữa 3 lá bài',
      'Kế hoạch hành động cụ thể trong thực tế',
      'Hỏi thêm câu hỏi gợi mở tiếp theo',
      'Lưu kết quả & xuất bản ghi chiêm nghiệm'
    ],
    ctaText: 'Mở khóa chuyên sâu'
  },
  {
    id: 'companion',
    name: 'Đồng hành',
    subtitle: 'Gói thành viên tháng',
    tagline: 'Lắng nghe nội tâm đều đặn và theo dõi hành trình trưởng thành cá nhân',
    price: 99000,
    priceUnit: 'mỗi tháng',
    badge: 'Tiết kiệm 65%',
    features: [
      '10 lượt trải bài chuyên sâu chất lượng cao',
      'Nhật ký cá nhân & lưu trữ trọn đời',
      'Tra cứu toàn bộ lịch sử các phiên trải bài',
      'Ưu tiên xử lý AI siêu tốc độ',
      'Không giới hạn câu hỏi đối thoại làm rõ',
      'Hỗ trợ đối soát và tư vấn 1-1 khi cần'
    ],
    ctaText: 'Đăng ký đồng hành'
  }
];

export const BANK_CONFIG = {
  bankId: 'MB', // Military Commercial Joint Stock Bank
  bankName: 'MB Bank (Ngân hàng Quân Đội)',
  accountNo: '0988776655',
  accountName: 'TRAM TAROT ME',
  transferPrefix: 'TAROT'
};
