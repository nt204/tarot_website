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
      className="scroll-mt-20 py-16 sm:py-24 lg:py-28 px-4 sm:px-6 lg:px-8 bg-[#070608] border-t border-[#1F1914] relative overflow-hidden"
    >
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-[#C9A85C]/5 blur-[120px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto space-y-12 sm:space-y-16 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7 }}
          className="text-center space-y-3 max-w-2xl mx-auto"
        >
          <span className="text-[11px] sm:text-xs uppercase tracking-[0.25em] text-[#C9A85C] font-heading block">
            Minh bạch · Tôn trọng trải nghiệm
          </span>
          <h2 className="font-heading text-2xl sm:text-4xl lg:text-5xl font-normal text-[#EEE6D8] leading-tight">
            BẢNG GIÁ TRẠM TAROT
          </h2>
          <p className="text-sm sm:text-base text-[#A6998A] font-light leading-relaxed">
            Mô hình Freemium hướng tới giá trị thật. Bạn có thể bắt đầu hoàn toàn miễn phí, và mở khóa phân tích sâu hơn bất cứ khi nào bạn cần điểm tựa vững vàng.
          </p>
        </motion.div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
          {PRICING_PACKAGES.map((pkg, idx) => {
            const isHighlight = pkg.highlight;

            return (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.6, delay: idx * 0.12 }}
                className={`relative flex flex-col justify-between rounded-2xl p-6 sm:p-8 transition-all duration-300 ${
                  isHighlight
                    ? 'bg-[#15101A] border-2 border-[#C9A85C] shadow-[0_0_35px_rgba(201,168,92,0.18)] scale-[1.02] md:-translate-y-2'
                    : 'bg-[#0E0C12] border border-[#2B231B] hover:border-[#3D3222]'
                }`}
              >
                {/* Badge */}
                {pkg.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full bg-gradient-to-r from-[#C9A85C] to-[#E3C988] text-[#0A080C] text-[10px] sm:text-[11px] font-heading font-semibold uppercase tracking-wider shadow-md">
                    {pkg.badge}
                  </div>
                )}

                {/* Card Top: Info & Price */}
                <div className="space-y-6">
                  <div className="space-y-1">
                    <span className="text-[11px] uppercase tracking-wider text-[#A6998A]">
                      {pkg.subtitle}
                    </span>
                    <h3 className="font-heading text-2xl sm:text-3xl text-[#EEE6D8]">
                      {pkg.name}
                    </h3>
                    <p className="text-xs text-[#8E7E6E] pt-1">{pkg.tagline}</p>
                  </div>

                  {/* Price display */}
                  <div className="pt-2 border-t border-[#231C18]">
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-heading text-3xl sm:text-4xl lg:text-5xl font-light text-[#C9A85C]">
                        {pkg.price === 0 ? '0 đ' : `${pkg.price.toLocaleString('vi-VN')} đ`}
                      </span>
                      <span className="text-xs text-[#A6998A]">/ {pkg.priceUnit}</span>
                    </div>
                  </div>

                  {/* Features list */}
                  <div className="space-y-3 pt-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[#C5B8A8] block">
                      Đặc quyền bao gồm:
                    </span>
                    <ul className="space-y-2.5">
                      {pkg.features.map((feature, fIdx) => (
                        <li key={fIdx} className="flex items-start gap-2.5 text-xs text-[#C5B8A8]">
                          <span className="text-[#C9A85C] mt-0.5 text-sm flex-shrink-0">✦</span>
                          <span className="leading-relaxed">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Card Bottom: CTA Button */}
                <div className="pt-8">
                  <button
                    onClick={() => handleSelectPackage(pkg)}
                    className={`w-full py-3.5 px-5 rounded-xl font-heading text-xs sm:text-sm tracking-wider uppercase transition-all duration-300 flex items-center justify-center gap-2 ${
                      isHighlight
                        ? 'bg-gradient-to-r from-[#C9A85C] via-[#DEC078] to-[#C9A85C] text-[#0A080C] font-semibold hover:shadow-[0_0_20px_rgba(201,168,92,0.45)]'
                        : 'bg-[#1C1623] hover:bg-[#282030] text-[#EEE6D8] border border-[#3A2F22] hover:border-[#C9A85C]'
                    }`}
                  >
                    <span>{pkg.ctaText}</span>
                    <span>→</span>
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
