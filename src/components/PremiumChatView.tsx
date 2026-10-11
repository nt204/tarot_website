'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatMessage, ChatUsage } from '@/types/chat';
import { PRICING_PACKAGES } from '@/data/pricingData';
import { PaymentModal } from '@/components/PaymentModal';

interface PremiumChatViewProps {
  readingId: string;
  topic?: string;
  question?: string;
  cardCount?: number;
}

const TOPIC_LABELS: Record<string, string> = {
  general: 'Tổng quan đời sống',
  love: 'Tình cảm & Mối quan hệ',
  career: 'Công việc & Sự nghiệp',
  finance: 'Tài chính & Quyết định',
  mind: 'Nội tâm & Tinh thần'
};

const SUGGESTION_CHIPS = [
  'Lá thứ 2 nói lên điều gì rõ hơn?',
  'Có điều gì mình đang vô tình bỏ sót không?',
  'Mình nên bắt đầu từ hành động nhỏ nào?',
  'Làm sao để giải tỏa bớt lo âu lúc này?'
];

export const PremiumChatView: React.FC<PremiumChatViewProps> = ({
  readingId,
  topic = 'general',
  question,
  cardCount = 3
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [usage, setUsage] = useState<ChatUsage | null>(null);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);

  const chatScrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const topicName = TOPIC_LABELS[topic] || 'Tổng quan đời sống';

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTo({
        top: chatScrollRef.current.scrollHeight,
        behavior
      });
    }
  };

  // 1. Tải lịch sử chat và hạn mức ban đầu
  useEffect(() => {
    let isMounted = true;
    setIsInitialLoading(true);

    fetch(`/api/reading/${readingId}/chat`)
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        if (data.success && data.chatSession) {
          setMessages(data.chatSession.messages || []);
          setUsage(data.chatSession.usage || null);
        } else if (data.error) {
          setErrorMessage(data.error);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error('Lỗi tải cuộc trò chuyện:', err);
          setErrorMessage('Không thể kết nối tới Trạm. Bạn vui lòng tải lại trang.');
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsInitialLoading(false);
          setTimeout(() => scrollToBottom('auto'), 100);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [readingId]);

  // Cuộn xuống khi có tin nhắn mới hoặc đang chờ
  useEffect(() => {
    if (!isInitialLoading) {
      scrollToBottom('smooth');
    }
  }, [messages, isLoading, isInitialLoading]);

  // 2. Gửi tin nhắn
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    // Kiểm tra giới hạn hàng ngày
    if (usage && usage.daily_used >= usage.daily_max) {
      setErrorMessage(
        'Bạn đã dùng hết 20 tin nhắn trong ngày hôm nay. Hãy quay lại vào ngày mai nhé!'
      );
      return;
    }

    // Tạm hiển thị tin nhắn của user ngay lập tức trên UI
    const tempUserMsg: ChatMessage = {
      id: `temp_${Date.now()}`,
      role: 'user',
      content: text,
      created_at: new Date().toISOString()
    };

    setMessages((prev) => [...prev, tempUserMsg]);
    setInputText('');
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const res = await fetch(`/api/reading/${readingId}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        if (data.error === 'QUOTA_EXCEEDED' || data.error === 'MONTHLY_QUOTA_EXCEEDED') {
          setErrorMessage(data.message || 'Bạn đã đạt hạn mức tin nhắn của gói.');
        } else {
          setErrorMessage(data.error || 'Trạm tạm thời bị gián đoạn. Bạn thử gửi lại nhé.');
        }
        return;
      }

      if (data.reply) {
        setMessages((prev) => [...prev, data.reply]);
      }
      if (data.usage) {
        setUsage(data.usage);
      }
    } catch (err: any) {
      console.error('Lỗi gửi tin nhắn:', err);
      setErrorMessage('Không thể kết nối. Vui lòng kiểm tra mạng và gửi lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleChipClick = (suggestion: string) => {
    setInputText(suggestion);
    textareaRef.current?.focus();
  };

  return (
    <div className="mt-12 rounded-3xl bg-gradient-to-b from-[#14101A] via-[#0E0C13] to-[#0A080E] border-2 border-[#3A2D1F] p-5 sm:p-8 lg:p-10 shadow-[0_0_45px_rgba(201,168,92,0.12)] text-left relative overflow-hidden">
      {/* Background ambient light */}
      <div className="absolute top-0 right-1/4 w-[450px] h-[250px] bg-[#C9A85C]/6 blur-[110px] rounded-full pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#2A2118] gap-4 relative z-10">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-[#C9A85C] text-sm animate-pulse">✦</span>
            <span className="text-xs font-heading font-semibold uppercase tracking-[0.25em] text-[#C9A85C]">
              TRÒ CHUYỆN CÙNG TRẠM · PREMIUM
            </span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-heading text-[#EEE6D8] font-normal">
            Tiếp nối câu chuyện của bạn
          </h3>
          <p className="text-xs sm:text-sm text-[#A6998A] font-light">
            Không chỉ là những lá bài. Trạm ở đây để cùng bạn tháo gỡ băn khoăn và định hình hành động tiếp theo.
          </p>
        </div>

        {/* Reference Context Badge & Quota */}
        <div className="flex flex-col sm:items-end gap-2 shrink-0">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1A1420] border border-[#3E3020] text-[#DEC078] text-xs font-mono font-medium">
            <span className="text-[#C9A85C]">✧</span>
            <span>
              {topicName} · {cardCount} lá bài
            </span>
          </div>
          {usage && (
            <div className="text-[11px] text-[#8C7E72] font-mono flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/80" />
              <span>
                {usage.daily_used}/{usage.daily_max} tin nhắn hôm nay
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Chat Messages Box */}
      <div className="mt-6 flex flex-col h-[380px] sm:h-[440px] rounded-2xl bg-[#09080C]/90 border border-[#261E16] overflow-hidden relative">
        <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 scroll-smooth">
          {isInitialLoading ? (
            <div className="h-full flex flex-col items-center justify-center space-y-3 text-[#A6998A]">
              <div className="w-6 h-6 border-2 border-[#C9A85C] border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-light">Đang mở không gian trò chuyện cùng Trạm...</p>
            </div>
          ) : (
            <>
              {messages.map((msg) => {
                const isAssistant = msg.role === 'assistant';

                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex items-start gap-3 ${
                      isAssistant ? 'justify-start' : 'justify-end'
                    }`}
                  >
                    {isAssistant && (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2D2115] to-[#141016] border border-[#C9A85C]/60 flex items-center justify-center shrink-0 shadow-sm text-xs text-[#DEC078] font-heading">
                        ✦
                      </div>
                    )}

                    <div
                      className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 sm:px-5 sm:py-3.5 text-xs sm:text-sm leading-relaxed shadow-md ${
                        isAssistant
                          ? 'bg-[#15111B] border border-[#382B1E] text-[#E8DFD3] rounded-tl-sm'
                          : 'bg-[#291F14] border border-[#C9A85C]/40 text-[#F9F5EE] rounded-tr-sm ml-auto'
                      }`}
                    >
                      {isAssistant && (
                        <div className="text-[10px] font-heading font-semibold text-[#C9A85C] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                          <span>TRẠM</span>
                        </div>
                      )}
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>

                    {!isAssistant && (
                      <div className="w-8 h-8 rounded-full bg-[#1C1620] border border-[#4A3B2B] flex items-center justify-center shrink-0 text-xs text-[#A6998A] font-mono">
                        Bạn
                      </div>
                    )}
                  </motion.div>
                );
              })}

              {/* Typing / Waiting Indicator */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-3"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2D2115] to-[#141016] border border-[#C9A85C]/60 flex items-center justify-center shrink-0 text-xs text-[#DEC078]">
                    ✦
                  </div>
                  <div className="bg-[#15111B] border border-[#382B1E] rounded-2xl rounded-tl-sm px-4 py-3 text-xs text-[#A6998A] flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C9A85C] animate-bounce" />
                    <span
                      className="w-1.5 h-1.5 rounded-full bg-[#C9A85C] animate-bounce"
                      style={{ animationDelay: '0.2s' }}
                    />
                    <span
                      className="w-1.5 h-1.5 rounded-full bg-[#C9A85C] animate-bounce"
                      style={{ animationDelay: '0.4s' }}
                    />
                    <span className="ml-1 text-[11px] font-light">Trạm đang lắng nghe và suy ngẫm...</span>
                  </div>
                </motion.div>
              )}
            </>
          )}
        </div>

        {/* Suggestion Chips */}
        {messages.length <= 3 && !isLoading && (
          <div className="px-4 py-2 border-t border-[#1C161E] bg-[#0E0C12]/80 flex items-center gap-2 overflow-x-auto no-scrollbar">
            <span className="text-[10px] uppercase tracking-wider text-[#8A7969] shrink-0 font-mono">
              Gợi ý:
            </span>
            {SUGGESTION_CHIPS.map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleChipClick(chip)}
                className="shrink-0 text-[11px] px-2.5 py-1 rounded-full bg-[#18131E] border border-[#33271C] text-[#C9A85C] hover:border-[#C9A85C] hover:bg-[#221A2A] transition-all cursor-pointer whitespace-nowrap"
              >
                {chip}
              </button>
            ))}
          </div>
        )}

        {/* Error message banner */}
        {errorMessage && (
          <div className="px-4 py-2 bg-rose-950/40 border-t border-rose-800/40 text-rose-300 text-xs flex items-center justify-between">
            <span>{errorMessage}</span>
            {usage && usage.daily_used >= usage.daily_max && (
              <button
                type="button"
                onClick={() => setIsPaymentOpen(true)}
                className="underline hover:text-white font-medium ml-2"
              >
                Mở khóa thêm
              </button>
            )}
          </div>
        )}

        {/* Input Controls */}
        <div className="p-3 sm:p-4 bg-[#0F0D14] border-t border-[#261E16] flex items-end gap-2.5 relative z-10">
          <textarea
            ref={textareaRef}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Chia sẻ điều bạn đang băn khoăn cùng Trạm..."
            rows={1}
            maxLength={1000}
            disabled={isLoading || isInitialLoading}
            className="flex-1 bg-[#16121D] border border-[#35281D] focus:border-[#C9A85C] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[#EEE6D8] placeholder-[#736657] outline-none resize-none transition-all max-h-24 min-h-[42px]"
          />

          <button
            type="button"
            onClick={() => handleSendMessage()}
            disabled={!inputText.trim() || isLoading || isInitialLoading}
            className={`px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
              inputText.trim() && !isLoading
                ? 'bg-[#C9A85C] hover:bg-[#D8B96E] text-[#120F0C] shadow-[0_0_15px_rgba(201,168,92,0.35)]'
                : 'bg-[#201A24] text-[#695C4F] cursor-not-allowed border border-[#33261C]'
            }`}
          >
            <span>Gửi</span>
            <span>✦</span>
          </button>
        </div>
      </div>

      {/* Footer Disclaimer */}
      <div className="mt-3 flex flex-col sm:flex-row items-start sm:items-center justify-between text-[11px] text-[#786C60] gap-2">
        <p>
          Trạm giúp bạn nhìn nhận rõ hơn, không quyết định thay bạn · Nhấn Enter để gửi, Shift+Enter để xuống dòng
        </p>
        <button
          type="button"
          onClick={() => setIsPaymentOpen(true)}
          className="text-[#C9A85C] hover:underline cursor-pointer font-medium self-end sm:self-auto"
        >
          Nâng cấp gói Đồng hành (100 lượt chat) →
        </button>
      </div>

      {/* Payment Modal if user wants to upgrade */}
      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        packageItem={PRICING_PACKAGES[2]} // Gói Đồng hành
        readingId={readingId}
        onPaymentSuccess={() => {
          setIsPaymentOpen(false);
          // Reload chat usage
          fetch(`/api/reading/${readingId}/chat`)
            .then((res) => res.json())
            .then((data) => {
              if (data.success && data.chatSession) {
                setUsage(data.chatSession.usage);
              }
            });
        }}
      />
    </div>
  );
};
