'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PRICING_PACKAGES } from '@/data/pricingData';
import { PricingPackage, Order } from '@/types/business';
import { PaymentModal } from '@/components/PaymentModal';

interface PricingSectionProps {
  onScrollToTable: () => void;
  onPaymentSuccess?: (order: Order) => void;
}

export const PricingSection: React.FC<PricingSectionProps> = ({
  onScrollToTable,
  onPaymentSuccess
}) => {
  const [selectedPkg, setSelectedPkg] = useState<PricingPackage | null>(null);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);

  const handleSelectPackage = (pkg: PricingPackage) => {
    if (pkg.id === 'free') {
      onScrollToTable();
    } else {
      setSelectedPkg(pkg);
      setIsPaymentOpen(true);
    }
  };

  return (
    <section
      id="pricing"
      className="scroll-mt-20 py-12 sm:py-24 lg:py-28 px-2 sm:px-6 lg:px-8 bg-[#070608] border-t border-[#1F1914] relative overflow-hidden"
    >
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-[#C9A85C]/5 blur-[120px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto space-y-8 sm:space-y-16 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7 }}
          className="text-center space-y-2 sm:space-y-3 max-w-2xl mx-auto px-2"
        >
          <span className="text-[10px] sm:text-xs uppercase tracking-[0.25em] text-[#C9A85C] font-heading block">
            Minh bạch · Tôn trọng trải nghiệm
          </span>
          <h2 className="font-heading text-xl sm:text-4xl lg:text-5xl font-normal text-[#EEE6D8] leading-tight">
            BẢNG GIÁ TRẠM TAROT
          </h2>
          <p className="text-xs sm:text-base text-[#A6998A] font-light leading-relaxed">
            Mô hình Freemium hướng tới giá trị thật. Bạn có thể bắt đầu hoàn toàn miễn phí, và mở khóa phân tích sâu hơn bất cứ khi nào bạn cần điểm tựa vững vàng.
          </p>
        </motion.div>

        {/* Pricing Cards Grid - 3 gói nằm gọn trên 1 hàng ở mobile */}
        <div className="grid grid-cols-3 gap-1.5 sm:gap-6 lg:gap-8 items-stretch">
          {PRICING_PACKAGES.map((pkg, idx) => {
            const isHighlight = pkg.highlight;

            return (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className={`relative flex flex-col justify-between rounded-lg sm:rounded-2xl p-2 sm:p-7 lg:p-8 transition-all duration-300 min-w-0 ${
                  isHighlight
                    ? 'bg-[#15101A] border sm:border-2 border-[#C9A85C] shadow-[0_0_20px_rgba(201,168,92,0.18)] sm:scale-[1.02] sm:md:-translate-y-2'
                    : 'bg-[#0E0C12] border border-[#2B231B] hover:border-[#3D3222]'
                }`}
              >
                {/* Badge */}
                {pkg.badge && (
                  <div className="absolute -top-2 sm:-top-3.5 left-1/2 -translate-x-1/2 px-1 sm:px-3.5 py-0.5 sm:py-1 rounded-full bg-gradient-to-r from-[#C9A85C] to-[#E3C988] text-[#0A080C] text-[7.5px] sm:text-[11px] font-heading font-semibold uppercase tracking-wider shadow-md whitespace-nowrap">
                    <span className="sm:hidden">{pkg.badgeMobile || pkg.badge}</span>
                    <span className="hidden sm:inline">{pkg.badge}</span>
                  </div>
                )}

                {/* Card Top: Info & Price */}
                <div className="space-y-2 sm:space-y-6">
                  <div className="space-y-0.5 sm:space-y-1">
                    <span className="text-[8px] sm:text-[11px] uppercase tracking-wider text-[#A6998A] block truncate">
                      {pkg.subtitle}
                    </span>
                    <h3 className="font-heading text-xs sm:text-2xl lg:text-3xl text-[#EEE6D8] font-semibold sm:font-normal truncate">
                      {pkg.name}
                    </h3>
                    <p className="hidden sm:block text-xs text-[#8E7E6E] pt-1">{pkg.tagline}</p>
                  </div>

                  {/* Price display */}
                  <div className="pt-1 sm:pt-2 border-t border-[#231C18]">
                    <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-1.5">
                      <span className="font-heading text-xs sm:text-4xl lg:text-5xl font-light text-[#C9A85C] whitespace-nowrap">
                        {pkg.price === 0 ? '0 đ' : `${pkg.price.toLocaleString('vi-VN')} đ`}
                      </span>
                      <span className="text-[8px] sm:text-xs text-[#A6998A]">/ {pkg.priceUnit}</span>
                    </div>
                  </div>

                  {/* Features list */}
                  <div className="space-y-1 sm:space-y-3 pt-0.5 sm:pt-2">
                    <span className="hidden sm:block text-[11px] font-semibold uppercase tracking-wider text-[#C5B8A8]">
                      Đặc quyền bao gồm:
                    </span>
                    {/* Desktop full list */}
                    <ul className="hidden sm:block space-y-2.5">
                      {pkg.features.map((feature, fIdx) => (
                        <li key={fIdx} className="flex items-start gap-2.5 text-xs text-[#C5B8A8]">
                          <span className="text-[#C9A85C] mt-0.5 text-sm shrink-0">✦</span>
                          <span className="leading-relaxed">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    {/* Mobile concise list */}
                    <ul className="sm:hidden space-y-1">
                      {(pkg.featuresMobile || pkg.features.slice(0, 4)).map((feature, fIdx) => (
                        <li key={fIdx} className="flex items-start gap-1 text-[8px] text-[#C5B8A8] leading-tight">
                          <span className="text-[#C9A85C] text-[8px] shrink-0 mt-0.5">✦</span>
                          <span className="break-words line-clamp-2">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Card Bottom: CTA Button */}
                <div className="pt-2.5 sm:pt-8">
                  <button
                    onClick={() => handleSelectPackage(pkg)}
                    className={`w-full py-1.5 sm:py-3.5 px-1 sm:px-5 rounded-md sm:rounded-xl font-heading text-[9px] sm:text-sm tracking-tight sm:tracking-wider uppercase transition-all duration-300 flex items-center justify-center gap-1 sm:gap-2 cursor-pointer ${
                      isHighlight
                        ? 'bg-gradient-to-r from-[#C9A85C] via-[#DEC078] to-[#C9A85C] text-[#0A080C] font-semibold hover:shadow-[0_0_20px_rgba(201,168,92,0.45)]'
                        : 'bg-[#1C1623] hover:bg-[#282030] text-[#EEE6D8] border border-[#3A2F22] hover:border-[#C9A85C]'
                    }`}
                  >
                    <span className="sm:hidden">{pkg.ctaTextMobile || pkg.ctaText}</span>
                    <span className="hidden sm:inline">{pkg.ctaText}</span>
                    <span className="hidden sm:inline">→</span>
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Commitment note */}
        <div className="p-4 sm:p-5 rounded-xl bg-[#0E0C12] border border-[#241D17] text-center max-w-3xl mx-auto space-y-1.5">
          <p className="text-xs text-[#C9A85C] font-heading">
            ✦ Cam kết nguyên tắc giá trị thực từ Trạm Tarot
          </p>
          <p className="text-[11px] sm:text-xs text-[#8E7E6E] leading-relaxed">
            Bản miễn phí luôn có giá trị tự thân và hoàn toàn không bị cắt ngắn gây lo lắng hay ép buộc trả phí. Bản chuyên sâu tạo sự khác biệt ở độ sắc nét, liên kết bối cảnh cá nhân và các hướng hành động thực tiễn.
          </p>
        </div>
      </div>

      {/* Payment Modal */}
      {selectedPkg && (
        <PaymentModal
          isOpen={isPaymentOpen}
          onClose={() => setIsPaymentOpen(false)}
          packageItem={selectedPkg}
          onPaymentSuccess={(order) => {
            if (onPaymentSuccess) onPaymentSuccess(order);
          }}
        />
      )}
    </section>
  );
};
