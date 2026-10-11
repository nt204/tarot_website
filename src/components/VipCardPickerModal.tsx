'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DrawnCard, VipExtensionResult } from '@/types/tarot';

interface VipCardPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  readingId: string;
  availableSlotIds: string[];
  onExtensionSuccess: (newCards: DrawnCard[], vipExtension: VipExtensionResult) => void;
}

export const VipCardPickerModal: React.FC<VipCardPickerModalProps> = ({
  isOpen,
  onClose,
  readingId,
  availableSlotIds,
  onExtensionSuccess
}) => {
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Lấy danh sách 30 slot từ các lá còn lại để hiển thị quạt bài tương tác
  const displaySlots = availableSlotIds.slice(0, 36);

  const handleCardClick = (slotId: string) => {
    if (isGenerating) return;

    if (selectedSlots.includes(slotId)) {
      setSelectedSlots(selectedSlots.filter((id) => id !== slotId));
    } else {
      if (selectedSlots.length < 2) {
        setSelectedSlots([...selectedSlots, slotId]);
      }
    }
  };

  const handleConfirmDraw = async () => {
    if (selectedSlots.length !== 2) return;
    setIsGenerating(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/reading/extend-vip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reading_id: readingId,
          selected_slot_ids: selectedSlots
        })
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Có lỗi xảy ra khi tạo bản mở rộng VIP.');
      }

      onExtensionSuccess(data.new_cards, data.vip_extension);
      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Lỗi kết nối khi mở rộng trải bài.');
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[90] flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3 }}
          className="relative w-full max-w-3xl bg-[#110E15] border-2 border-[#C9A85C]/60 rounded-3xl p-5 sm:p-8 shadow-[0_0_60px_rgba(0,0,0,0.95)] text-[#EEE6D8] space-y-6 my-auto"
        >
          {/* Close button */}
          {!isGenerating && (
            <button
              onClick={onClose}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#1C1622] border border-[#3A2F22] text-[#A6998A] hover:text-[#EEE6D8] hover:border-[#C9A85C] flex items-center justify-center text-sm transition-colors cursor-pointer"
            >
              ✕
            </button>
          )}

          {/* Header */}
          <div className="text-center space-y-2">
            <span className="text-[11px] uppercase tracking-[0.25em] text-[#C9A85C] font-heading font-semibold block">
              ✦ TRẢI BÀI MỞ RỘNG 5 LÁ · VIP ✦
            </span>
            <h3 className="font-heading text-xl sm:text-2xl text-[#EEE6D8] font-normal">
              Rút thêm 2 lá bài bổ sung
            </h3>
            <p className="text-xs sm:text-sm text-[#A6998A] max-w-lg mx-auto">
              Ba lá ban đầu đã được giữ nguyên. Hãy lắng lại trực giác và chọn 2 lá bài bạn cảm thấy kết nối nhất từ bộ bài còn lại.
            </p>
          </div>

          {/* 2 Target Slots for Card 4 & Card 5 */}
          <div className="flex items-center justify-center gap-4 sm:gap-6 py-2">
            {/* Slot IV */}
            <div
              className={`w-32 sm:w-36 h-44 sm:h-50 rounded-xl flex flex-col items-center justify-between p-3 transition-all duration-300 relative ${
                selectedSlots.length >= 1
                  ? 'bg-[#18131F] border-2 border-[#C9A85C] shadow-[0_0_25px_rgba(201,168,92,0.35)]'
                  : 'bg-[#0E0B12] border border-dashed border-[#5A4530]'
              }`}
            >
              <div className="w-full flex items-center justify-between text-xs">
                <span className="font-heading text-[#C9A85C] font-bold">IV</span>
                <span className="text-[10px] text-[#8C7A65]">Lá 4</span>
              </div>

              {selectedSlots.length >= 1 ? (
                <div className="text-center space-y-1">
                  <span className="text-2xl block text-[#C9A85C]">✦</span>
                  <span className="text-xs font-semibold text-[#DEC078] block">Đã chọn lá 4</span>
                </div>
              ) : (
                <div className="text-center space-y-1 text-[#6C5B4A]">
                  <span className="text-xl block">🎴</span>
                  <span className="text-[10px] block">Chưa chọn</span>
                </div>
              )}

              <div className="text-center border-t border-[#2C2117] w-full pt-1">
                <span className="text-[10px] text-[#A6998A] block font-heading">
                  Điều chưa xem xét
                </span>
              </div>
            </div>

            {/* Slot V */}
            <div
              className={`w-32 sm:w-36 h-44 sm:h-50 rounded-xl flex flex-col items-center justify-between p-3 transition-all duration-300 relative ${
                selectedSlots.length >= 2
                  ? 'bg-[#18131F] border-2 border-[#C9A85C] shadow-[0_0_25px_rgba(201,168,92,0.35)]'
                  : 'bg-[#0E0B12] border border-dashed border-[#5A4530]'
              }`}
            >
              <div className="w-full flex items-center justify-between text-xs">
                <span className="font-heading text-[#C9A85C] font-bold">V</span>
                <span className="text-[10px] text-[#8C7A65]">Lá 5</span>
              </div>

              {selectedSlots.length >= 2 ? (
                <div className="text-center space-y-1">
                  <span className="text-2xl block text-[#C9A85C]">✦</span>
                  <span className="text-xs font-semibold text-[#DEC078] block">Đã chọn lá 5</span>
                </div>
              ) : (
                <div className="text-center space-y-1 text-[#6C5B4A]">
                  <span className="text-xl block">🎴</span>
                  <span className="text-[10px] block">Chưa chọn</span>
                </div>
              )}

              <div className="text-center border-t border-[#2C2117] w-full pt-1">
                <span className="text-[10px] text-[#A6998A] block font-heading">
                  Góc nhìn tiến lên
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Card Selection Deck */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-[#8C7A65] px-1">
              <span>Bấm vào lá bài bên dưới để chọn ({selectedSlots.length}/2 lá):</span>
              {selectedSlots.length > 0 && !isGenerating && (
                <button
                  onClick={() => setSelectedSlots([])}
                  className="text-[#C9A85C] hover:underline cursor-pointer"
                >
                  Chọn lại
                </button>
              )}
            </div>

            <div className="max-h-48 sm:max-h-56 overflow-y-auto p-2 bg-[#0A080E] rounded-2xl border border-[#261E16] scrollbar-thin">
              <div className="grid grid-cols-6 sm:grid-cols-9 md:grid-cols-12 gap-2">
                {displaySlots.map((slotId, index) => {
                  const isSelected = selectedSlots.includes(slotId);
                  const selectedIndex = selectedSlots.indexOf(slotId);

                  return (
                    <motion.button
                      key={slotId}
                      type="button"
                      whileHover={{ scale: 1.08, y: -4 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleCardClick(slotId)}
                      disabled={isGenerating}
                      className={`relative aspect-[2/3] rounded-md overflow-hidden border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#C9A85C] ring-2 ring-[#C9A85C] shadow-[0_0_15px_rgba(201,168,92,0.5)] bg-[#2A1F13]'
                          : 'border-[#3D3021] bg-[#141017] hover:border-[#C9A85C]/60'
                      }`}
                    >
                      {/* Back card texture */}
                      <img
                        src="/cards/back/back_1.png"
                        alt="Lá bài Tarot"
                        className="w-full h-full object-cover opacity-85"
                      />

                      {/* Number badge if selected */}
                      {isSelected && (
                        <div className="absolute inset-0 bg-[#C9A85C]/25 backdrop-blur-[1px] flex items-center justify-center">
                          <span className="w-5 h-5 rounded-full bg-[#C9A85C] text-[#0A080C] text-[10px] font-bold flex items-center justify-center font-heading">
                            {selectedIndex === 0 ? 'IV' : 'V'}
                          </span>
                        </div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Error Message if any */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-800 text-xs text-red-300 text-center">
              {errorMsg}
            </div>
          )}

          {/* Action button */}
          <div className="pt-2 text-center">
            <button
              onClick={handleConfirmDraw}
              disabled={selectedSlots.length !== 2 || isGenerating}
              className={`w-full py-3.5 sm:py-4 px-6 rounded-xl font-heading text-sm sm:text-base font-semibold tracking-wide uppercase transition-all flex items-center justify-center gap-2 ${
                selectedSlots.length === 2 && !isGenerating
                  ? 'bg-gradient-to-r from-[#C9A85C] via-[#DEC078] to-[#C9A85C] text-[#0A080C] hover:shadow-[0_0_25px_rgba(201,168,92,0.45)] cursor-pointer'
                  : 'bg-[#221A26] text-[#7A6A5C] cursor-not-allowed border border-[#3A2E22]'
              }`}
            >
              {isGenerating ? (
                <>
                  <span className="w-4 h-4 border-2 border-[#0A080C] border-t-transparent rounded-full animate-spin" />
                  <span>Trạm đang kết nối thông điệp 5 lá bài toàn cảnh...</span>
                </>
              ) : selectedSlots.length === 2 ? (
                <>
                  <span>Xác nhận & Mở rộng 5 lá toàn cảnh</span>
                  <span>✨</span>
                </>
              ) : (
                <span>Vui lòng chọn đủ 2 lá bài ({selectedSlots.length}/2)</span>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
