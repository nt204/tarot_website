'use client';

import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TopicType,
  SpreadType,
  ToneType,
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
  const [spread, setSpread] = useState<SpreadType>('three_cards');
  const [allowReversed, setAllowReversed] = useState<boolean>(false);
  const [tone, setTone] = useState<ToneType>('gentle');
  const [question, setQuestion] = useState<string>('');
  const [context, setContext] = useState<string>('');

  // Flow & Reading Session state
  const [readingId, setReadingId] = useState<string | null>(null);
  const [step, setStep] = useState<'config' | 'shuffling' | 'picking' | 'drawn'>('config');
  const [slots, setSlots] = useState<OpaqueSlot[]>([]);
  const [selectedSlotIds, setSelectedSlotIds] = useState<string[]>([]);
  const [drawnCards, setDrawnCards] = useState<DrawnCard[]>([]);
  const [flippedCards, setFlippedCards] = useState<Record<number, boolean>>({});

  // AI Reading state
  const [aiStatus, setAiStatus] = useState<'idle' | 'generating' | 'completed' | 'failed'>('idle');
  const [aiResult, setAiResult] = useState<AIReadingResult | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  // GSAP animation refs
  const shuffleDeckRef = useRef<HTMLDivElement>(null);
  const cardProxyRefs = useRef<(HTMLDivElement | null)[]>([]);

  const requiredCount = spread === 'daily' ? 1 : 3;

  // Question suggestions
  const questionSuggestions: Record<TopicType, string[]> = {
    general: [
      'Tôi nên chú ý điều gì để có tuần mới thuận lợi và bình an?',
      'Năng lượng chủ đạo của tôi hiện tại đang phản ánh điều gì?',
      'Điều gì đang khiến tôi khó đưa ra quyết định quan trọng lúc này?'
    ],
    love: [
      'Tôi nên chú ý điều gì trong mối quan hệ tình cảm hiện tại?',
      'Tôi cần chuyển hóa điều gì ở bản thân để đón nhận tình yêu lành mạnh?',
      'Bài học lớn nhất tôi cần thấu hiểu trong chuyện tình cảm lúc này là gì?'
    ],
    career: [
      'Tôi cần cân nhắc những yếu tố nào trước khi quyết định chuyển việc?',
      'Hướng đi nào phù hợp nhất với năng lực và mục tiêu sự nghiệp của tôi?',
      'Trở ngại tiềm ẩn nào trong công việc mà tôi cần nhận diện sớm?'
    ]
  };

  // 1. Khởi tạo phiên & Bắt đầu xào bài (Mục 4)
  const handleStartSession = async () => {
    try {
      setStep('shuffling');
      setSelectedSlotIds([]);
      setDrawnCards([]);
      setFlippedCards({});
      setAiResult(null);
      setAiStatus('idle');
      setAiError(null);

      // Lấy fingerprint từ localStorage
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
          tone,
          question: question.trim(),
          context: context.trim(),
          user_fingerprint: fingerprint
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lỗi tạo phiên.');

      setReadingId(data.reading_id);
      setSlots(data.slots || []);

      // Nếu là Daily và đã có bài rút từ trước (Mục 2A reload/same day)
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
          setAiStatus('completed');
        }
        return;
      }

      // Kích hoạt GSAP animation xào bài nhịp nhàng (Section 3.3 tarot-animation-engine)
      runShuffleAnimation();
    } catch (err: any) {
      alert(err.message || 'Không thể khởi tạo trải bài.');
      setStep('config');
    }
  };

  // GSAP Shuffle Animation Sequence
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

    // Phase 1: Xào xáo ngẫu nhiên (Shuffle chaos)
    tl.to(proxies, {
      x: () => gsap.utils.random(-90, 90),
      y: () => gsap.utils.random(-40, 40),
      rotation: () => gsap.utils.random(-30, 30),
      duration: 0.5,
      ease: 'power2.out',
      stagger: { amount: 0.25, from: 'random' }
    });

    // Phase 2: Gom tụ về giữa bàn
    tl.to(proxies, {
      x: 0,
      y: 0,
      rotation: 0,
      duration: 0.4,
      ease: 'back.out(1.2)',
      stagger: 0.02
    });

    // Phase 3: Nhẹ nhàng chuẩn bị trải
    tl.to(proxies, {
      scale: 1.05,
      duration: 0.3,
      yoyo: true,
      repeat: 1
    });
  };

  // 2. Chạm chọn lá trên quạt bài
  const handleSelectSlot = async (slotId: string) => {
    if (selectedSlotIds.includes(slotId)) return;
    if (selectedSlotIds.length >= requiredCount) return;

    const newSelected = [...selectedSlotIds, slotId];
    setSelectedSlotIds(newSelected);

    // Khi chọn đủ số lá theo spread -> Tự động khóa bài và chuyển sang bàn trải
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
        alert(e.message || 'Lỗi khi khóa bài.');
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

  // 4. Yêu cầu AI Luận giải chuyên sâu (Gemini 3.7 Flash)
  const handleRequestAI = async () => {
    if (!readingId) return;

    // Yêu cầu câu hỏi nếu chưa nhập (Mục 3)
    if (!question.trim()) {
      alert('Vui lòng nhập câu hỏi của bạn để AI có thể luận giải cá nhân hóa.');
      return;
    }

    setAiStatus('generating');
    setAiError(null);

    try {
      const res = await fetch('/api/reading/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reading_id: readingId })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Dịch vụ AI tạm thời gián đoạn.');
      }

      setAiResult(data.ai_result);
      setAiStatus('completed');
    } catch (err: any) {
      setAiStatus('failed');
      setAiError(err.message || 'Không thể tạo luận giải AI lúc này.');
    }
  };

  // Danh sách lá đại diện khi xào (Virtual Deck: 16 lá)
  const proxyCards = Array.from({ length: 16 });
  // Số lá hiển thị hình quạt cho người dùng chọn (22 lá)
  const fanCards = slots.slice(0, 22);

  return (
    <div id="tarot-table" className="relative w-full min-h-[700px] py-12 px-4 sm:px-6 lg:px-8 bg-[#09080A] text-[#F3E7D3]">
      {/* Background celestial particles & glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(212,175,55,0.06),transparent_70%)] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Stage 1: CONFIGURATION */}
        {step === 'config' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#121014]/90 border border-[#3A3226] rounded-2xl p-6 sm:p-10 shadow-[0_10px_40px_rgba(0,0,0,0.6)] backdrop-blur-md max-w-3xl mx-auto"
          >
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs uppercase tracking-[0.25em] text-[#D4AF37] font-serif">
                ✦ BẮT ĐẦU BUỔI TRẢI BÀI ✦
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#F3E7D3]">
                Thiết Lập Câu Hỏi & Bối Cảnh
              </h2>
              <p className="text-xs sm:text-sm text-[#A89885] max-w-lg mx-auto">
                Chọn chủ đề và tập trung tâm trí vào điều bạn đang trăn trở trước khi rút bài.
              </p>
            </div>

            <div className="space-y-6">
              {/* Chọn Chủ đề (Mục 2) */}
              <div>
                <label className="block text-xs uppercase tracking-wider text-[#D4AF37] mb-2 font-serif">
                  1. Chọn Chủ Đề
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'general', label: 'Tổng Quan', icon: '✦' },
                    { id: 'love', label: 'Tình Cảm', icon: '♥' },
                    { id: 'career', label: 'Công Việc', icon: '⚔' }
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTopic(t.id as TopicType)}
                      className={`p-3 rounded-lg border text-xs sm:text-sm font-serif tracking-wide flex flex-col items-center gap-1 transition-all cursor-pointer ${
                        topic === t.id
                          ? 'bg-[#2A2216] border-[#D4AF37] text-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.2)]'
                          : 'bg-[#18161D] border-[#2A241E] text-[#B0A391] hover:border-[#7C6339]'
                      }`}
                    >
                      <span className="text-base">{t.icon}</span>
                      <span>{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Chọn Kiểu Trải Bài (Mục 2) */}
              <div>
                <label className="block text-xs uppercase tracking-wider text-[#D4AF37] mb-2 font-serif">
                  2. Kiểu Trải Bài
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSpread('daily')}
                    className={`p-4 rounded-lg border text-left transition-all cursor-pointer ${
                      spread === 'daily'
                        ? 'bg-[#2A2216] border-[#D4AF37] text-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.2)]'
                        : 'bg-[#18161D] border-[#2A241E] text-[#B0A391] hover:border-[#7C6339]'
                    }`}
                  >
                    <p className="font-serif font-bold text-sm">✦ Một Lá Hôm Nay (Daily)</p>
                    <p className="text-xs text-[#8C7A65] mt-1">
                      Thông điệp định hướng và điều nên chú ý trong ngày (cố định trong ngày).
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSpread('three_cards')}
                    className={`p-4 rounded-lg border text-left transition-all cursor-pointer ${
                      spread === 'three_cards'
                        ? 'bg-[#2A2216] border-[#D4AF37] text-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.2)]'
                        : 'bg-[#18161D] border-[#2A241E] text-[#B0A391] hover:border-[#7C6339]'
                    }`}
                  >
                    <p className="font-serif font-bold text-sm">✦ Ba Lá Định Hướng (3 Cards)</p>
                    <p className="text-xs text-[#8C7A65] mt-1">
                      Lá 1: Hiện tại • Lá 2: Trở ngại cần lưu tâm • Lá 3: Hướng hành động nên chọn.
                    </p>
                  </button>
                </div>
              </div>

              {/* Bật/Tắt Lá Ngược & Giọng văn (Mục 5 & 7) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="flex items-center justify-between p-3 rounded-lg bg-[#18161D] border border-[#2A241E]">
                  <div>
                    <span className="text-xs font-serif text-[#F3E7D3] block">Cho phép lá ngược (Reversed)</span>
                    <span className="text-[11px] text-[#8C7A65]">Mặc định: chỉ lá xuôi</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={allowReversed}
                    onChange={(e) => setAllowReversed(e.target.checked)}
                    className="w-5 h-5 accent-[#D4AF37] cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-[#18161D] border border-[#2A241E]">
                  <div>
                    <span className="text-xs font-serif text-[#F3E7D3] block">Giọng văn AI</span>
                    <span className="text-[11px] text-[#8C7A65]">{tone === 'gentle' ? 'Dịu dàng, chữa lành' : 'Thẳng thắn, sắc bén'}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setTone(tone === 'gentle' ? 'direct' : 'gentle')}
                    className="text-xs px-2.5 py-1 border border-[#7C6339] rounded text-[#D4AF37] bg-[#14100D]"
                  >
                    {tone === 'gentle' ? 'Dịu dàng' : 'Thẳng thắn'}
                  </button>
                </div>
              </div>

              {/* Nhập Câu Hỏi (Mục 3) */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs uppercase tracking-wider text-[#D4AF37] font-serif">
                    3. Câu Hỏi Của Bạn (Bắt buộc nếu muốn AI luận giải)
                  </label>
                  <span className="text-[11px] text-[#8C7A65]">{question.length}/500</span>
                </div>
                <input
                  type="text"
                  maxLength={500}
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Ví dụ: Tôi nên chú ý điều gì trong mối quan hệ hiện tại?"
                  className="w-full px-4 py-3 bg-[#16141A] border border-[#3A3226] rounded-lg text-sm text-[#F3E7D3] placeholder-[#6E6252] focus:outline-none focus:border-[#D4AF37]"
                />

                {/* Gợi ý câu hỏi nhanh */}
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <span className="text-[11px] text-[#8C7A65] py-0.5">Gợi ý:</span>
                  {questionSuggestions[topic].map((q, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setQuestion(q)}
                      className="text-[11px] text-[#A89885] hover:text-[#D4AF37] bg-[#1C1820] px-2 py-0.5 rounded border border-[#2E271F] cursor-pointer"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bối Cảnh Tùy Chọn (Mục 3) */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs uppercase tracking-wider text-[#A89885] font-serif">
                    4. Bối Cảnh Thêm (Tùy chọn, tối đa 1.000 ký tự)
                  </label>
                  <span className="text-[11px] text-[#8C7A65]">{context.length}/1000</span>
                </div>
                <textarea
                  rows={2}
                  maxLength={1000}
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  placeholder="Ví dụ: Tôi đang làm quản lý 3 năm, đang cân nhắc nhận lời mời sang công ty mới nhưng còn phân vân..."
                  className="w-full px-4 py-2.5 bg-[#16141A] border border-[#3A3226] rounded-lg text-xs sm:text-sm text-[#F3E7D3] placeholder-[#6E6252] focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              {/* Submit CTA */}
              <div className="pt-4 text-center">
                <button
                  type="button"
                  onClick={handleStartSession}
                  className="w-full sm:w-auto px-10 py-4 bg-[#D4AF37] hover:bg-[#E5C158] text-[#14100D] font-serif font-bold text-sm tracking-[0.2em] uppercase rounded-lg transition-all shadow-[0_4px_25px_rgba(212,175,55,0.3)] hover:shadow-[0_6px_35px_rgba(212,175,55,0.5)] cursor-pointer"
                >
                  ✦ BẮT ĐẦU XÀO BÀI ✦
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Stage 2: SHUFFLING ANIMATION */}
        {step === 'shuffling' && (
          <div className="flex flex-col items-center justify-center min-h-[450px] space-y-6">
            <div className="text-center space-y-2">
              <p className="text-xs uppercase tracking-[0.25em] text-[#D4AF37] font-serif animate-pulse">
                ✦ ĐANG XÀO BÀI BẢO MẬT (FISHER-YATES) ✦
              </p>
              <h3 className="text-2xl font-serif text-[#F3E7D3]">
                Hòa Nhịp Cùng Năng Lượng Vũ Trụ...
              </h3>
            </div>

            {/* GSAP Virtual Deck Container */}
            <div
              ref={shuffleDeckRef}
              className="relative w-44 h-64 sm:w-52 sm:h-76 flex items-center justify-center my-6"
            >
              {proxyCards.map((_, i) => (
                <div
                  key={i}
                  ref={(el) => { cardProxyRefs.current[i] = el; }}
                  className="absolute w-36 h-56 sm:w-44 sm:h-64 rounded-xl border border-[#7C6339] overflow-hidden shadow-2xl bg-[#0F0E14] will-change-transform"
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

            <p className="text-xs text-[#8C7A65] italic font-serif">
              Hệ thống đang chuẩn bị bung quạt để bạn tự tay chọn lá bài định mệnh...
            </p>
          </div>
        )}

        {/* Stage 3: PICKING (Trải quạt chọn lá) */}
        {step === 'picking' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center space-y-6"
          >
            <div className="text-center space-y-1">
              <span className="text-xs uppercase tracking-[0.2em] text-[#D4AF37] font-serif">
                ✦ HÃY CHỌN {requiredCount} LÁ BÀI ✦
              </span>
              <h3 className="text-xl sm:text-2xl font-serif text-[#F3E7D3]">
                Đã chọn: <span className="text-[#D4AF37] font-bold">{selectedSlotIds.length}</span> / {requiredCount} lá
              </h3>
              <p className="text-xs text-[#A89885]">
                Dùng trực giác rê chuột và nhấp vào lá bài bạn cảm thấy thu hút nhất.
              </p>
            </div>

            {/* Fan of Cards Container */}
            <div className="relative w-full max-w-4xl h-80 sm:h-96 flex items-end justify-center overflow-x-auto overflow-y-visible px-4 py-8">
              <div className="relative w-full h-full flex items-end justify-center min-w-[650px]">
                {fanCards.map((slot, index) => {
                  const total = fanCards.length;
                  const isSelected = selectedSlotIds.includes(slot.slot_id);
                  // Fan calculation formula
                  const maxAngle = 60;
                  const stepAngle = maxAngle / (total - 1);
                  const angle = -maxAngle / 2 + index * stepAngle;
                  const normalized = (index - (total - 1) / 2) / ((total - 1) / 2);
                  const offsetY = Math.pow(normalized, 2) * 35;
                  const offsetX = (index - (total - 1) / 2) * 22;

                  return (
                    <motion.div
                      key={slot.slot_id}
                      onClick={() => handleSelectSlot(slot.slot_id)}
                      whileHover={{ y: -35, scale: 1.1, zIndex: 50 }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                      className={`absolute w-28 h-44 sm:w-32 sm:h-52 rounded-xl cursor-pointer will-change-transform shadow-xl ${
                        isSelected
                          ? 'border-2 border-[#D4AF37] -translate-y-12 ring-4 ring-[#D4AF37]/40 shadow-[0_0_25px_rgba(212,175,55,0.6)]'
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

            {selectedSlotIds.length > 0 && selectedSlotIds.length < requiredCount && (
              <p className="text-xs text-[#D4AF37] font-serif animate-pulse">
                Hãy chọn thêm {requiredCount - selectedSlotIds.length} lá nữa để hoàn tất trải bài...
              </p>
            )}
          </motion.div>
        )}

        {/* Stage 4: DRAWN CARDS & READINGS */}
        {step === 'drawn' && (
          <div className="space-y-12">
            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#2A241E] pb-4">
              <div>
                <span className="text-xs font-serif text-[#D4AF37] uppercase tracking-wider block">
                  ✦ {topic === 'love' ? 'TÌNH CẢM' : topic === 'career' ? 'CÔNG VIỆC' : 'TỔNG QUAN'} • {spread === 'daily' ? '1 LÁ HÔM NAY' : '3 LÁ ĐỊNH HƯỚNG'}
                </span>
                {question && (
                  <p className="text-sm text-[#F3E7D3] font-serif italic mt-0.5">
                    &ldquo;{question}&rdquo;
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleFlipAll}
                  className="px-4 py-2 text-xs font-serif tracking-wider uppercase border border-[#7C6339] hover:border-[#D4AF37] bg-[#18161D] text-[#D4AF37] rounded-sm cursor-pointer transition-colors"
                >
                  ✦ LẬT TẤT CẢ LÁ
                </button>
                <button
                  onClick={() => setStep('config')}
                  className="px-4 py-2 text-xs font-serif tracking-wider uppercase border border-[#3A3226] hover:border-[#A89885] bg-[#121014] text-[#A89885] rounded-sm cursor-pointer transition-colors"
                >
                  RÚT QUẺ MỚI
                </button>
              </div>
            </div>

            {/* Bàn trải các lá bài (Card Slots) */}
            <div
              className={`grid gap-8 justify-center items-start ${
                spread === 'daily'
                  ? 'grid-cols-1 max-w-sm mx-auto'
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
                    className="w-56 sm:w-64"
                  />
                  {!flippedCards[idx] && (
                    <span className="text-[11px] text-[#A89885] font-serif italic mt-2 animate-pulse">
                      (Bấm vào thẻ để lật bài)
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Phần 1: LUẬN GIẢI CƠ BẢN (0ms, không cần AI - Mục 6) */}
            <div className="bg-[#121014]/80 border border-[#2A241E] rounded-2xl p-6 sm:p-8 space-y-6">
              <div className="border-b border-[#2A241E] pb-3">
                <span className="text-xs uppercase tracking-widest text-[#D4AF37] font-serif block">
                  CHẾ ĐỘ ĐỌC NGHĨA CƠ BẢN (DỮ LIỆU CHUẨN ĐÃ LƯU)
                </span>
                <h3 className="text-xl font-serif font-bold text-[#F3E7D3] mt-1">
                  Ý Nghĩa Chi Tiết Từng Lá Bài
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {drawnCards.map((dc) => {
                  const m = dc.resolved_meaning;
                  return (
                    <div
                      key={dc.card_id}
                      className="p-5 rounded-xl bg-[#17141C] border border-[#2D2620] space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-serif text-[#D4AF37] font-semibold">
                          {dc.position_name}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-[#0A090C] border border-[#3A3226] text-[#A89885]">
                          {dc.orientation === 'upright' ? 'Xuôi' : 'Ngược'}
                        </span>
                      </div>

                      <h4 className="font-serif text-base font-bold text-[#F3E7D3]">
                        {dc.card.name_vi}
                      </h4>

                      {/* Từ khóa */}
                      <div className="flex flex-wrap gap-1">
                        {m.keywords.map((kw, i) => (
                          <span
                            key={i}
                            className="text-[10px] px-2 py-0.5 bg-[#221D28] text-[#C5B5A1] rounded-full border border-[#3A3226]"
                          >
                            {kw}
                          </span>
                        ))}
                      </div>

                      {/* Nghĩa hiển thị */}
                      <p className="text-xs text-[#D8CDC0] leading-relaxed font-sans pt-1">
                        {m.primary_text}
                      </p>

                      {/* Fallback ghi chú nếu có (Mục 1 & 6) */}
                      {m.fallback_note && (
                        <p className="text-[10px] text-[#A89885] italic pt-1 border-t border-[#26201B]">
                          [Lưu ý: {m.fallback_note}]
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Phần 2: LUẬN GIẢI AI CHUYÊN SÂU (GEMINI 3.7 FLASH - Mục 7, 8, 9, 10) */}
            <div className="bg-[#121014]/90 border border-[#4A3D2A] rounded-2xl p-6 sm:p-10 space-y-6 shadow-[0_15px_50px_rgba(0,0,0,0.8)] relative overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="text-xs uppercase tracking-[0.2em] text-[#D4AF37] font-serif block">
                    ✦ TRÍ TUỆ NHÂN TẠO CAO CẤP ✦
                  </span>
                  <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#F3E7D3] mt-1">
                    Luận Giải Chuyên Sâu Từng Câu Hỏi Với Gemini 3.7
                  </h3>
                </div>

                {aiStatus !== 'completed' && aiStatus !== 'generating' && (
                  <button
                    onClick={handleRequestAI}
                    className="px-6 py-3 bg-[#D4AF37] hover:bg-[#E5C158] text-[#14100D] font-serif font-bold text-xs tracking-widest uppercase rounded-lg transition-all shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:shadow-[0_0_30px_rgba(212,175,55,0.5)] cursor-pointer"
                  >
                    ✦ XIN THÔNG ĐIỆP TỪ AI ✦
                  </button>
                )}
              </div>

              {/* Trạng thái đang sinh lời giải AI (Mục 10) */}
              {aiStatus === 'generating' && (
                <div className="py-12 flex flex-col items-center justify-center space-y-4 text-center">
                  <div className="w-12 h-12 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
                  <p className="font-serif text-sm text-[#D4AF37] tracking-wider animate-pulse">
                    Gemini 3.7 Flash đang kết nối dòng năng lượng giữa các lá bài và câu hỏi của bạn...
                  </p>
                  <p className="text-xs text-[#8C7A65]">
                    Đang xử lý phân tích biểu tượng, vị trí và góc nhìn chuyển hóa...
                  </p>
                </div>
              )}

              {/* Lỗi AI (Mục 10) */}
              {aiStatus === 'failed' && (
                <div className="p-4 rounded-xl bg-[#2D1616] border border-[#8B2626] text-center space-y-3">
                  <p className="text-xs text-[#FF9B9B] font-medium">
                    {aiError || 'Không thể kết nối tới dịch vụ AI lúc này.'}
                  </p>
                  <p className="text-xs text-[#C4B7A6]">
                    Toàn bộ kết quả bài rút và nghĩa cơ bản vẫn được bảo toàn nguyên vẹn.
                  </p>
                  <button
                    onClick={handleRequestAI}
                    className="px-5 py-2 bg-[#8B2626] hover:bg-[#A33030] text-white text-xs font-serif uppercase tracking-wider rounded cursor-pointer"
                  >
                    ✦ Thử Giải Lại ✦
                  </button>
                </div>
              )}

              {/* Kết quả AI Hoàn Thành (Schema 6 phần chuẩn theo Mục 8) */}
              {aiStatus === 'completed' && aiResult && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  className="space-y-6 pt-2"
                >
                  {/* 1. Tóm tắt cốt lõi (Summary) */}
                  <div className="p-5 rounded-xl bg-[#1C1820] border-l-4 border-[#D4AF37] border-y border-r border-[#3A3226]">
                    <span className="text-[11px] font-serif uppercase tracking-wider text-[#D4AF37] block mb-1">
                      1. Tóm Tắt Thông Điệp Cốt Lõi
                    </span>
                    <p className="text-sm sm:text-base text-[#F3E7D3] font-serif italic leading-relaxed">
                      &ldquo;{aiResult.summary}&rdquo;
                    </p>
                  </div>

                  {/* 2. Diễn giải chi tiết từng lá (Card Readings) */}
                  <div>
                    <span className="text-xs font-serif uppercase tracking-wider text-[#D4AF37] block mb-3">
                      2. Phân Tích Từng Vị Trí Lá Bài
                    </span>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {aiResult.card_readings.map((cr) => (
                        <div
                          key={cr.card_id}
                          className="p-4 rounded-lg bg-[#16131B] border border-[#2E271F] space-y-2"
                        >
                          <div className="flex items-center justify-between text-xs font-serif">
                            <span className="text-[#D4AF37] font-semibold">{cr.card_name}</span>
                            <span className="text-[10px] text-[#A89885] uppercase">
                              {cr.orientation === 'upright' ? 'Xuôi' : 'Ngược'}
                            </span>
                          </div>
                          <p className="text-xs text-[#D8CDC0] leading-relaxed font-sans">
                            {cr.interpretation}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 3. Bức tranh kết nối năng lượng (Synthesis) */}
                  <div className="p-5 rounded-xl bg-[#16131B] border border-[#2E271F] space-y-2">
                    <span className="text-xs font-serif uppercase tracking-wider text-[#D4AF37] block">
                      3. Dòng Chảy Kết Nối Năng Lượng (Synthesis)
                    </span>
                    <p className="text-xs sm:text-sm text-[#D8CDC0] leading-relaxed font-sans">
                      {aiResult.synthesis}
                    </p>
                  </div>

                  {/* 4. Hành động nên cân nhắc (Actions) */}
                  <div className="p-5 rounded-xl bg-[#16131B] border border-[#2E271F] space-y-2">
                    <span className="text-xs font-serif uppercase tracking-wider text-[#D4AF37] block">
                      4. Hướng Hành Động Cụ Thể Nên Cân Nhắc
                    </span>
                    <ul className="space-y-1.5">
                      {aiResult.actions.map((act, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs sm:text-sm text-[#E5DCD0]">
                          <span className="text-[#D4AF37] text-xs mt-0.5">✦</span>
                          <span>{act}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* 5. Câu hỏi tự suy ngẫm (Reflection Question) */}
                  <div className="p-4 rounded-lg bg-[#1B1720] border border-[#7C6339]/50 flex items-center gap-3">
                    <span className="text-xl text-[#D4AF37]">◈</span>
                    <div>
                      <span className="text-[11px] font-serif uppercase tracking-wider text-[#D4AF37] block">
                        5. Câu Hỏi Tự Suy Ngẫm
                      </span>
                      <p className="text-xs sm:text-sm text-[#F3E7D3] font-serif italic">
                        {aiResult.reflection_question}
                      </p>
                    </div>
                  </div>

                  {/* 6. Lưu ý đạo đức & giới hạn (Limitations - nếu có) */}
                  {aiResult.limitations && (
                    <div className="p-3 rounded-lg bg-[#141217] border border-[#3A3226] text-[11px] text-[#A89885] italic">
                      <span className="font-semibold text-[#B3A492]">Ghi chú đạo đức Tarot:</span> {aiResult.limitations}
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
