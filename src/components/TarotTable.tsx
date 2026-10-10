'use client';

import React, { useState, useRef } from 'react';
import gsap from 'gsap';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TopicType,
  SpreadType,
  DrawnCard,
  AIReadingResult
} from '@/types/tarot';
import { Card3D } from '@/components/Card3D';

interface OpaqueSlot {
  slot_id: string;
}

export const TarotTable: React.FC = () => {
  // Config state
  const [topic, setTopic] = useState<TopicType>('general');
  const [spread, setSpread] = useState<SpreadType>('three_cards'); // Ba lá mặc định
  const [allowReversed, setAllowReversed] = useState<boolean>(false);
  const [question, setQuestion] = useState<string>('');
  const [context, setContext] = useState<string>('');
  const [showAdvancedOptions, setShowAdvancedOptions] = useState<boolean>(false);
  const [showContextInput, setShowContextInput] = useState<boolean>(false);

  // Flow & Reading Session state
  const [readingId, setReadingId] = useState<string | null>(null);
  const [step, setStep] = useState<'config' | 'shuffling' | 'picking' | 'drawn'>('config');
  const [slots, setSlots] = useState<OpaqueSlot[]>([]);
  const [selectedSlotIds, setSelectedSlotIds] = useState<string[]>([]);
  const [drawnCards, setDrawnCards] = useState<DrawnCard[]>([]);
  const [flippedCards, setFlippedCards] = useState<Record<number, boolean>>({});

  // Interpretation state
  const [readingStatus, setReadingStatus] = useState<'idle' | 'generating' | 'completed' | 'failed'>('idle');
  const [aiResult, setAiResult] = useState<AIReadingResult | null>(null);
  const [readingError, setReadingError] = useState<string | null>(null);

  // GSAP animation refs
  const shuffleDeckRef = useRef<HTMLDivElement>(null);
  const cardProxyRefs = useRef<(HTMLDivElement | null)[]>([]);

  const requiredCount = spread === 'daily' ? 1 : 3;

  // Gợi ý câu hỏi tự nhiên theo từng chủ đề
  const suggestions: Record<TopicType, string[]> = {
    general: [
      'Tôi cần chú ý điều gì lúc này?',
      'Điều gì đang khiến tôi chần chừ đưa ra quyết định?',
      'Tôi nên nhìn nhận hoàn cảnh hiện tại như thế nào?'
    ],
    love: [
      'Tôi nên hiểu và ứng xử thế nào trong mối quan hệ hiện tại?',
      'Tôi cần chuyển hóa điều gì ở bản thân để đón nhận tình cảm lành mạnh?',
      'Bài học tôi cần thấu hiểu lúc này là gì?'
    ],
    career: [
      'Tôi cần chú ý điều gì trong công việc lúc này?',
      'Điều gì đang khiến tôi chần chừ trước cơ hội nghề nghiệp?',
      'Hướng hành động nào giúp tôi cảm thấy vững vàng hơn?'
    ]
  };

  const placeholders: Record<TopicType, string> = {
    general: 'Tôi cần chú ý điều gì lúc này?',
    love: 'Tôi nên hiểu và ứng xử thế nào trong mối quan hệ hiện tại?',
    career: 'Tôi cần cân nhắc những gì trước khi quyết định thay đổi công việc?'
  };

  // 1. Khởi tạo phiên & Bắt đầu xào bài
  const handleStartSession = async () => {
    // Với 3 lá: yêu cầu câu hỏi để phần luận giải có trọng tâm
    if (spread === 'three_cards' && !question.trim()) {
      alert('Vui lòng chia sẻ điều bạn muốn hỏi để trải bài có trọng tâm rõ ràng.');
      return;
    }

    try {
      setStep('shuffling');
      setSelectedSlotIds([]);
      setDrawnCards([]);
      setFlippedCards({});
      setAiResult(null);
      setReadingStatus('idle');
      setReadingError(null);

      let fingerprint = 'guest_user';
      if (typeof window !== 'undefined') {
        fingerprint = localStorage.getItem('tarot_fp') || '';
        if (!fingerprint) {
          fingerprint = 'fp_' + Math.random().toString(36).substring(2, 10);
          localStorage.setItem('tarot_fp', fingerprint);
        }
      }

      const res = await fetch('/api/reading/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          spread,
          allow_reversed: allowReversed,
          tone: 'gentle',
          question: question.trim(),
          context: context.trim(),
          user_fingerprint: fingerprint
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Không thể tạo phiên trải bài.');

      setReadingId(data.reading_id);
      setSlots(data.slots || []);

      // Nếu đã có bài rút từ trước (chế độ một lá cùng ngày)
      if (data.drawn_cards && data.drawn_cards.length > 0) {
        setDrawnCards(data.drawn_cards);
        setStep('drawn');
        const autoFlipped: Record<number, boolean> = {};
        data.drawn_cards.forEach((_: any, idx: number) => {
          autoFlipped[idx] = true;
        });
        setFlippedCards(autoFlipped);
        if (data.ai_result) {
          setAiResult(data.ai_result);
          setReadingStatus('completed');
        }
        return;
      }

      runShuffleAnimation();
    } catch (err: any) {
      alert(err.message || 'Không thể bắt đầu trải bài.');
      setStep('config');
    }
  };

  // Hiệu ứng xào bài nhẹ nhàng
  const runShuffleAnimation = () => {
    const proxies = cardProxyRefs.current.filter(Boolean) as HTMLElement[];
    if (proxies.length === 0) {
      setTimeout(() => setStep('picking'), 1200);
      return;
    }

    const tl = gsap.timeline({
      onComplete: () => {
        setStep('picking');
      }
    });

    tl.to(proxies, {
      x: () => gsap.utils.random(-80, 80),
      y: () => gsap.utils.random(-35, 35),
      rotation: () => gsap.utils.random(-25, 25),
      duration: 0.55,
      ease: 'power2.out',
      stagger: { amount: 0.2, from: 'random' }
    });

    tl.to(proxies, {
      x: 0,
      y: 0,
      rotation: 0,
      duration: 0.45,
      ease: 'back.out(1.1)',
      stagger: 0.015
    });
  };

  // 2. Chạm chọn lá trên quạt bài
  const handleSelectSlot = async (slotId: string) => {
    if (selectedSlotIds.includes(slotId)) return;
    if (selectedSlotIds.length >= requiredCount) return;

    const newSelected = [...selectedSlotIds, slotId];
    setSelectedSlotIds(newSelected);

    if (newSelected.length === requiredCount && readingId) {
      try {
        const res = await fetch('/api/reading/draw', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            reading_id: readingId,
            selected_slot_ids: newSelected
          })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Lỗi khi rút bài.');

        setDrawnCards(data.drawn_cards);
        setStep('drawn');
      } catch (e: any) {
        alert(e.message || 'Lỗi khi ghi nhận lá bài.');
      }
    }
  };

  // 3. Lật bài
  const handleFlipCard = (idx: number) => {
    setFlippedCards((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handleFlipAll = () => {
    const all: Record<number, boolean> = {};
    drawnCards.forEach((_, idx) => (all[idx] = true));
    setFlippedCards(all);
  };

  // 4. Luận giải chi tiết gắn liền với câu hỏi
  const handleRequestInterpretation = async () => {
    if (!readingId) return;

    setReadingStatus('generating');
    setReadingError(null);

    try {
      const res = await fetch('/api/reading/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reading_id: readingId })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Tạm thời chưa thể tạo bản luận giải.');
      }

      setAiResult(data.ai_result);
      setReadingStatus('completed');
    } catch (err: any) {
      setReadingStatus('failed');
      setReadingError(err.message || 'Không thể tạo bản luận giải lúc này.');
    }
  };

  const proxyCards = Array.from({ length: 16 });
  const fanCards = slots.slice(0, 22);

  return (
    <div id="tarot-table" className="relative w-full min-h-[700px] py-12 px-4 sm:px-6 lg:px-8 bg-[#09080A] text-[#F3E7D3]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(212,175,55,0.05),transparent_70%)] pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">
        {/* ================= STAGE 1: BẮT ĐẦU TRẢI BÀI ================= */}
        {step === 'config' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#121014]/90 border border-[#30271E] rounded-2xl p-6 sm:p-10 shadow-2xl backdrop-blur-md space-y-8"
          >
            {/* Header Form */}
            <div className="text-center space-y-2">
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#F3E7D3]">
                Bạn muốn tìm góc nhìn cho điều gì?
              </h2>
              <p className="text-xs sm:text-sm text-[#A89885] max-w-lg mx-auto">
                Hãy chọn chủ đề và đặt câu hỏi rõ ràng. Sự tập trung của bạn giúp buổi trải bài có ý nghĩa hơn.
              </p>
            </div>

            <div className="space-y-6">
              {/* 1. Chủ đề */}
              <div>
                <label className="block text-xs font-serif tracking-wider text-[#D4AF37] mb-2 uppercase">
                  Chủ đề bạn quan tâm
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'general', label: 'Tổng quan' },
                    { id: 'love', label: 'Tình cảm' },
                    { id: 'career', label: 'Công việc' }
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTopic(t.id as TopicType)}
                      className={`py-3 px-4 rounded-lg border text-sm font-medium transition-all cursor-pointer ${
                        topic === t.id
                          ? 'bg-[#261E14] border-[#D4AF37] text-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.15)]'
                          : 'bg-[#18161D] border-[#2A241E] text-[#B0A391] hover:border-[#5C4A33]'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Điều bạn muốn hỏi */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-serif tracking-wider text-[#D4AF37] uppercase">
                    Điều bạn muốn hỏi {spread === 'three_cards' && <span className="text-[#C4B7A6] lowercase font-sans font-normal">(cần thiết cho 3 lá)</span>}
                  </label>
                  <span className="text-[11px] text-[#7A6B5B]">{question.length}/500</span>
                </div>
                <input
                  type="text"
                  maxLength={500}
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder={placeholders[topic]}
                  className="w-full px-4 py-3 bg-[#16141A] border border-[#3A3226] rounded-lg text-sm text-[#F3E7D3] placeholder-[#6E6252] focus:outline-none focus:border-[#D4AF37]"
                />

                {/* Gợi ý bấm nhanh theo chủ đề */}
                <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] text-[#8C7A65]">Gợi ý:</span>
                  {suggestions[topic].map((q, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setQuestion(q)}
                      className="text-[11px] text-[#B3A492] hover:text-[#D4AF37] bg-[#1C1820] px-2.5 py-1 rounded border border-[#2E271F] cursor-pointer transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Bối cảnh thu gọn: Bạn muốn chia sẻ thêm? */}
              <div className="border border-[#26211B] rounded-lg overflow-hidden bg-[#161419]/50">
                <button
                  type="button"
                  onClick={() => setShowContextInput(!showContextInput)}
                  className="w-full px-4 py-3 text-left text-xs text-[#C4B7A6] hover:text-[#D4AF37] flex items-center justify-between transition-colors cursor-pointer"
                >
                  <span className="font-medium font-serif">Bạn muốn chia sẻ thêm hoàn cảnh hiện tại?</span>
                  <span className="text-sm text-[#7A6B5B]">{showContextInput ? '−' : '+'}</span>
                </button>
                {showContextInput && (
                  <div className="px-4 pb-4 pt-1 border-t border-[#26211B] space-y-2">
                    <p className="text-[11px] text-[#8C7A65]">
                      Một vài chi tiết có thể giúp phần luận giải sát với tình huống của bạn hơn.
                    </p>
                    <textarea
                      rows={2}
                      maxLength={1000}
                      value={context}
                      onChange={(e) => setContext(e.target.value)}
                      placeholder="Ví dụ: Chúng tôi đang tạm xa nhau / Tôi đang làm tại công ty hiện tại được 3 năm và đang có lời mời mới..."
                      className="w-full px-3 py-2 bg-[#141217] border border-[#302820] rounded text-xs text-[#F3E7D3] placeholder-[#6E6252] focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>
                )}
              </div>

              {/* 4. Kiểu trải bài: Giải thích ngắn gọn ngay tại chỗ */}
              <div>
                <label className="block text-xs font-serif tracking-wider text-[#D4AF37] mb-2 uppercase">
                  Kiểu trải bài
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSpread('three_cards')}
                    className={`p-4 rounded-lg border text-left transition-all cursor-pointer ${
                      spread === 'three_cards'
                        ? 'bg-[#261E14] border-[#D4AF37] text-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.15)]'
                        : 'bg-[#18161D] border-[#2A241E] text-[#B0A391] hover:border-[#5C4A33]'
                    }`}
                  >
                    <p className="font-serif font-semibold text-sm">Góc nhìn cho câu hỏi của bạn</p>
                    <p className="text-xs text-[#8C7A65] mt-1">
                      Ba lá: Hiện tại · Điều cần chú ý · Hướng hành động
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSpread('daily')}
                    className={`p-4 rounded-lg border text-left transition-all cursor-pointer ${
                      spread === 'daily'
                        ? 'bg-[#261E14] border-[#D4AF37] text-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.15)]'
                        : 'bg-[#18161D] border-[#2A241E] text-[#B0A391] hover:border-[#5C4A33]'
                    }`}
                  >
                    <p className="font-serif font-semibold text-sm">Thông điệp hôm nay</p>
                    <p className="text-xs text-[#8C7A65] mt-1">
                      Một lá: Một góc nhìn để bắt đầu ngày mới (không bắt buộc câu hỏi)
                    </p>
                  </button>
                </div>
              </div>

              {/* 5. Tùy chọn trải bài thu gọn (Lá ngược) */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                  className="text-[11px] text-[#7A6B5B] hover:text-[#B3A492] transition-colors cursor-pointer flex items-center gap-1"
                >
                  <span>{showAdvancedOptions ? '▾' : '▸'} Tùy chọn trải bài</span>
                </button>
                {showAdvancedOptions && (
                  <div className="mt-2 p-3 rounded-lg bg-[#151318] border border-[#26211B] flex items-center justify-between">
                    <div>
                      <span className="text-xs text-[#D8CDC0] block">Bao gồm lá bài ngược (Reversed)</span>
                      <span className="text-[10px] text-[#7A6B5B]">Mặc định chỉ dùng lá xuôi</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={allowReversed}
                      onChange={(e) => setAllowReversed(e.target.checked)}
                      className="w-4 h-4 accent-[#D4AF37] cursor-pointer"
                    />
                  </div>
                )}
              </div>

              {/* CTA Tiếp tục chọn bài */}
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={handleStartSession}
                  className="px-10 py-3.5 bg-[#FAF6EE] hover:bg-[#D4AF37] text-[#14100D] font-serif font-bold text-sm tracking-[0.15em] uppercase rounded-sm transition-all shadow-[0_4px_25px_rgba(212,175,55,0.25)] hover:shadow-[0_6px_30px_rgba(212,175,55,0.45)] cursor-pointer"
                >
                  Tiếp tục chọn bài
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ================= STAGE 2: XÀO BÀI (TĨNH TÂM) ================= */}
        {step === 'shuffling' && (
          <div className="flex flex-col items-center justify-center min-h-[420px] space-y-6">
            <div className="text-center space-y-2">
              <h3 className="text-xl sm:text-2xl font-serif text-[#F3E7D3]">
                Dành vài giây lắng lại tâm trí...
              </h3>
              <p className="text-xs sm:text-sm text-[#A89885] max-w-md mx-auto">
                Hãy nghĩ về điều bạn đang băn khoăn trong khi các lá bài được xáo trộn.
              </p>
            </div>

            {/* GSAP Virtual Deck Container */}
            <div
              ref={shuffleDeckRef}
              className="relative w-44 h-64 sm:w-48 sm:h-72 flex items-center justify-center my-4"
            >
              {proxyCards.map((_, i) => (
                <div
                  key={i}
                  ref={(el) => { cardProxyRefs.current[i] = el; }}
                  className="absolute w-36 h-56 sm:w-40 sm:h-60 rounded-xl border border-[#7C6339]/80 overflow-hidden shadow-2xl bg-[#0F0E14] will-change-transform"
                  style={{ zIndex: i }}
                >
                  <img
                    src="/cards/card_back.jpg"
                    alt="Lá bài xào"
                    className="w-full h-full object-cover select-none"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= STAGE 3: CHỌN BÀI HÌNH QUẠT ================= */}
        {step === 'picking' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center space-y-6"
          >
            <div className="text-center space-y-1">
              <h3 className="text-xl sm:text-2xl font-serif text-[#F3E7D3]">
                Hãy chọn {requiredCount} lá bài bạn cảm thấy thu hút nhất
              </h3>
              <p className="text-xs sm:text-sm text-[#A89885]">
                Đã chọn: <span className="text-[#D4AF37] font-semibold">{selectedSlotIds.length}</span> / {requiredCount} lá
              </p>
            </div>

            {/* Trải quạt */}
            <div className="relative w-full max-w-4xl h-80 sm:h-96 flex items-end justify-center overflow-x-auto overflow-y-visible px-4 py-8">
              <div className="relative w-full h-full flex items-end justify-center min-w-[650px]">
                {fanCards.map((slot, index) => {
                  const total = fanCards.length;
                  const isSelected = selectedSlotIds.includes(slot.slot_id);
                  const maxAngle = 55;
                  const stepAngle = maxAngle / (total - 1);
                  const angle = -maxAngle / 2 + index * stepAngle;
                  const normalized = (index - (total - 1) / 2) / ((total - 1) / 2);
                  const offsetY = Math.pow(normalized, 2) * 32;
                  const offsetX = (index - (total - 1) / 2) * 22;

                  return (
                    <motion.div
                      key={slot.slot_id}
                      onClick={() => handleSelectSlot(slot.slot_id)}
                      whileHover={{ y: -30, scale: 1.08, zIndex: 50 }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                      className={`absolute w-28 h-44 sm:w-32 sm:h-52 rounded-xl cursor-pointer will-change-transform shadow-xl ${
                        isSelected
                          ? 'border-2 border-[#D4AF37] -translate-y-10 ring-4 ring-[#D4AF37]/30 shadow-[0_0_25px_rgba(212,175,55,0.5)]'
                          : 'border border-[#7C6339]/80 hover:border-[#D4AF37]'
                      }`}
                      style={{
                        transformOrigin: 'bottom center',
                        transform: `translateX(${offsetX}px) translateY(${offsetY}px) rotate(${angle}deg)`,
                        zIndex: isSelected ? 40 : index
                      }}
                    >
                      <div className="w-full h-full rounded-xl overflow-hidden bg-[#0C0B0E]">
                        <img
                          src="/cards/card_back.jpg"
                          alt="Lá bài úp"
                          className="w-full h-full object-cover select-none"
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* ================= STAGE 4: KẾT QUẢ TRẢI BÀI ================= */}
        {step === 'drawn' && (
          <div className="space-y-10">
            {/* Thanh tiêu đề câu hỏi của người dùng */}
            <div className="p-5 rounded-xl bg-[#121014] border border-[#2E271F] flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-serif text-[#D4AF37] uppercase tracking-wider block">
                  {spread === 'daily' ? 'Thông điệp hôm nay' : 'Góc nhìn cho câu hỏi của bạn'}
                </span>
                {question ? (
                  <h3 className="text-base sm:text-lg font-serif text-[#F3E7D3] font-semibold mt-0.5">
                    &ldquo;{question}&rdquo;
                  </h3>
                ) : (
                  <h3 className="text-sm font-serif text-[#F3E7D3] mt-0.5">
                    Thông điệp định hướng cho ngày hôm nay
                  </h3>
                )}
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={handleFlipAll}
                  className="px-3.5 py-1.5 text-xs font-serif tracking-wider border border-[#5C4A33] hover:border-[#D4AF37] text-[#D4AF37] rounded-sm cursor-pointer transition-colors"
                >
                  Lật tất cả lá
                </button>
                <button
                  onClick={() => setStep('config')}
                  className="px-3.5 py-1.5 text-xs font-serif tracking-wider border border-[#2E271F] text-[#9E8E7C] hover:text-[#F3E7D3] rounded-sm cursor-pointer transition-colors"
                >
                  Trải bài mới
                </button>
              </div>
            </div>

            {/* Các lá bài 3D trên bàn */}
            <div
              className={`grid gap-6 justify-center items-start ${
                spread === 'daily'
                  ? 'grid-cols-1 max-w-xs mx-auto'
                  : 'grid-cols-1 md:grid-cols-3 max-w-4xl mx-auto'
              }`}
            >
              {drawnCards.map((dc, idx) => (
                <div key={dc.card_id} className="flex flex-col items-center">
                  <Card3D
                    cardId={dc.card_id}
                    imageSrc={dc.card.image}
                    nameVi={dc.card.name_vi}
                    nameEn={dc.card.name}
                    orientation={dc.orientation}
                    positionName={dc.position_name}
                    isFlipped={Boolean(flippedCards[idx])}
                    onFlip={() => handleFlipCard(idx)}
                    priority
                    className="w-52 sm:w-60"
                  />
                  {!flippedCards[idx] && (
                    <span className="text-[11px] text-[#8C7A65] italic font-serif mt-2">
                      (Bấm để lật lá bài)
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Ý nghĩa từng lá bài (Căn bản) */}
            <div className="space-y-4">
              <h4 className="font-serif text-base text-[#D4AF37] font-semibold">
                Ý nghĩa từng lá bài ở vị trí của bạn
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {drawnCards.map((dc) => {
                  const m = dc.resolved_meaning;
                  return (
                    <div
                      key={dc.card_id}
                      className="p-5 rounded-xl bg-[#141217] border border-[#2A231C] space-y-2.5"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-serif text-[#D4AF37] font-medium">
                          {dc.position_name}
                        </span>
                        <span className="text-[10px] text-[#8C7A65]">
                          {dc.orientation === 'upright' ? 'Xuôi' : 'Ngược'}
                        </span>
                      </div>

                      <p className="font-serif text-sm font-bold text-[#F3E7D3]">
                        {dc.card.name_vi}
                      </p>

                      <div className="flex flex-wrap gap-1">
                        {m.keywords.map((kw, i) => (
                          <span
                            key={i}
                            className="text-[10px] px-2 py-0.5 bg-[#1F1A24] text-[#B8A896] rounded border border-[#2E271F]"
                          >
                            {kw}
                          </span>
                        ))}
                      </div>

                      <p className="text-xs text-[#CFC3B4] leading-relaxed font-sans pt-1">
                        {m.primary_text}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Khối Luận Giải Chi Tiết Cho Câu Hỏi */}
            <div className="p-6 sm:p-8 rounded-2xl bg-[#141218] border border-[#3A3024] space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h4 className="font-serif text-lg font-bold text-[#F3E7D3]">
                    Luận giải chi tiết cho câu hỏi của bạn
                  </h4>
                  <p className="text-xs text-[#8C7A65] mt-0.5">
                    Phân tích mối liên hệ giữa các lá bài và câu hỏi bạn đang băn khoăn.
                  </p>
                </div>

                {readingStatus !== 'completed' && readingStatus !== 'generating' && (
                  <button
                    onClick={handleRequestInterpretation}
                    className="px-6 py-2.5 bg-[#D4AF37] hover:bg-[#E5C158] text-[#14100D] font-serif font-bold text-xs tracking-wider uppercase rounded transition-all cursor-pointer"
                  >
                    Đọc luận giải chi tiết
                  </button>
                )}
              </div>

              {/* Trạng thái đang tổng hợp */}
              {readingStatus === 'generating' && (
                <div className="py-10 text-center space-y-3">
                  <div className="w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs text-[#D4AF37] font-serif">
                    Đang kết nối ý nghĩa các lá bài với câu hỏi của bạn...
                  </p>
                </div>
              )}

              {/* Lỗi */}
              {readingStatus === 'failed' && (
                <div className="p-4 rounded-lg bg-[#241515] border border-[#5C2323] text-center space-y-2">
                  <p className="text-xs text-[#E8A5A5]">{readingError}</p>
                  <button
                    onClick={handleRequestInterpretation}
                    className="text-xs text-[#D4AF37] underline cursor-pointer"
                  >
                    Thử lại
                  </button>
                </div>
              )}

              {/* Kết quả luận giải hoàn chỉnh */}
              {readingStatus === 'completed' && aiResult && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="space-y-6 pt-2"
                >
                  {/* Nhận định tổng thể */}
                  <div className="p-4 rounded-xl bg-[#1C1822] border-l-3 border-[#D4AF37] border-y border-r border-[#2C241C]">
                    <span className="text-[11px] font-serif text-[#D4AF37] uppercase block mb-1">
                      Nhận định tổng quan
                    </span>
                    <p className="text-sm text-[#F3E7D3] font-serif leading-relaxed italic">
                      {aiResult.summary}
                    </p>
                  </div>

                  {/* Giải thích từng lá theo vị trí */}
                  <div className="space-y-3">
                    <span className="text-xs font-serif text-[#D4AF37] uppercase block">
                      Góc nhìn ở từng vị trí
                    </span>
                    <div className="space-y-3">
                      {aiResult.card_readings.map((cr) => (
                        <div
                          key={cr.card_id}
                          className="p-4 rounded-lg bg-[#18151D] border border-[#2A231C] space-y-1"
                        >
                          <div className="flex items-center justify-between text-xs font-serif">
                            <span className="text-[#D4AF37] font-semibold">{cr.card_name}</span>
                            <span className="text-[#8C7A65]">{cr.orientation === 'upright' ? 'Xuôi' : 'Ngược'}</span>
                          </div>
                          <p className="text-xs text-[#D8CDC0] leading-relaxed font-sans pt-1">
                            {cr.interpretation}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Xâu chuỗi thông điệp */}
                  <div className="p-4 rounded-lg bg-[#18151D] border border-[#2A231C] space-y-1">
                    <span className="text-xs font-serif text-[#D4AF37] uppercase block">
                      Mối liên hệ giữa các lá bài
                    </span>
                    <p className="text-xs text-[#D8CDC0] leading-relaxed font-sans">
                      {aiResult.synthesis}
                    </p>
                  </div>

                  {/* Bước cụ thể có thể cân nhắc */}
                  <div className="p-4 rounded-lg bg-[#18151D] border border-[#2A231C] space-y-2">
                    <span className="text-xs font-serif text-[#D4AF37] uppercase block">
                      Gợi ý hướng đi bạn có thể cân nhắc
                    </span>
                    <ul className="space-y-1.5">
                      {aiResult.actions.map((act, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-[#D8CDC0]">
                          <span className="text-[#D4AF37] text-xs">✦</span>
                          <span>{act}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Câu hỏi tự suy ngẫm */}
                  <div className="p-4 rounded-lg bg-[#1C1822] border border-[#5C4A33]/50 flex items-start gap-3">
                    <span className="text-base text-[#D4AF37] mt-0.5">◈</span>
                    <div>
                      <span className="text-[11px] font-serif text-[#D4AF37] uppercase block">
                        Câu hỏi để bạn tự suy ngẫm
                      </span>
                      <p className="text-xs text-[#F3E7D3] font-serif italic mt-0.5">
                        {aiResult.reflection_question}
                      </p>
                    </div>
                  </div>

                  {/* Lưu ý đạo đức nhẹ nhàng nếu có */}
                  {aiResult.limitations && (
                    <div className="p-3 rounded bg-[#131116] border border-[#26201B] text-[11px] text-[#8C7A65] italic">
                      {aiResult.limitations}
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
