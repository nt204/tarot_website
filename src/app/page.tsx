'use client';

import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { HeroSection } from '@/components/HeroSection';
import { AboutTarotSection } from '@/components/AboutTarotSection';
import { TopicsSection } from '@/components/TopicsSection';
import { TarotTable } from '@/components/TarotTable';
import { PricingSection } from '@/components/PricingSection';
import { ArticlesSection } from '@/components/ArticlesSection';
import { BenefitsSection } from '@/components/BenefitsSection';
import { FAQSection } from '@/components/FAQSection';
import { FooterSection } from '@/components/FooterSection';
import { CardCatalogModal } from '@/components/CardCatalogModal';
import { ConstellationEffect } from '@/components/ConstellationEffect';
import { SpreadType, TopicType } from '@/types/tarot';

const QUESTION_PROMPT_DELAY_MS = 300;
const QUESTION_PROMPT_FADE_IN_MS = 800;

export default function Home() {
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [isDialogueOpen, setIsDialogueOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<TopicType>('general');
  const [selectedSpread, setSelectedSpread] = useState<SpreadType>('three_cards');
  const [resetKey, setResetKey] = useState(0);
  const questionPromptAudioRef = React.useRef<HTMLAudioElement>(null);
  const questionPromptTimerRef = React.useRef<number | null>(null);
  const questionPromptFadeFrameRef = React.useRef<number | null>(null);

  const stopQuestionPromptAudio = () => {
    if (questionPromptTimerRef.current !== null) {
      window.clearTimeout(questionPromptTimerRef.current);
      questionPromptTimerRef.current = null;
    }
    if (questionPromptFadeFrameRef.current !== null) {
      window.cancelAnimationFrame(questionPromptFadeFrameRef.current);
      questionPromptFadeFrameRef.current = null;
    }

    const questionPromptAudio = questionPromptAudioRef.current;
    if (questionPromptAudio) {
      questionPromptAudio.pause();
      questionPromptAudio.currentTime = 0;
      questionPromptAudio.volume = 0;
    }
  };

  const handleGoHome = () => {
    stopQuestionPromptAudio();
    setIsDialogueOpen(false);
    setResetKey((prev) => prev + 1);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNavigate = (href: string) => {
    stopQuestionPromptAudio();
    setIsDialogueOpen(false);
    setResetKey((prev) => prev + 1);
    if (typeof window !== 'undefined') {
      const el = document.querySelector(href);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleStartReading = (
    topic: TopicType = 'general',
    spread: SpreadType = 'three_cards'
  ) => {
    stopQuestionPromptAudio();

    questionPromptTimerRef.current = window.setTimeout(() => {
      const questionPromptAudio = questionPromptAudioRef.current;
      if (!questionPromptAudio) return;

      questionPromptAudio.currentTime = 0;
      questionPromptAudio.volume = 0.8;
      void questionPromptAudio.play().catch(() => undefined);

      const fadeStartedAt = performance.now();
      const fadeIn = (now: number) => {
        const progress = Math.min((now - fadeStartedAt) / QUESTION_PROMPT_FADE_IN_MS, 1);
        questionPromptAudio.volume = 0.8 + progress * 0.2;

        if (progress < 1) {
          questionPromptFadeFrameRef.current = window.requestAnimationFrame(fadeIn);
        } else {
          questionPromptFadeFrameRef.current = null;
        }
      };
      questionPromptFadeFrameRef.current = window.requestAnimationFrame(fadeIn);
      questionPromptTimerRef.current = null;
    }, QUESTION_PROMPT_DELAY_MS);

    setSelectedTopic(topic);
    setSelectedSpread(spread);
    setIsDialogueOpen(true);
  };

  const handleCloseReading = () => {
    stopQuestionPromptAudio();
    setIsDialogueOpen(false);
  };

  const handleSkipQuestionPrompt = () => {
    stopQuestionPromptAudio();
  };

  const handleSelectTopicFromSection = (topic: TopicType, spread: SpreadType = 'three_cards') => {
    handleStartReading(topic, spread);
  };

  return (
    <div className="relative min-h-screen bg-[#080708] text-[#EEE6D8] flex flex-col selection:bg-[#C9A85C]/30 selection:text-[#EEE6D8]">
      <audio ref={questionPromptAudioRef} src="/audio/question-prompt.wav" preload="auto" />

      {/* Hiệu ứng đồ họa các chòm sao toạ độ và vì sao nhấp nháy nền */}
      <ConstellationEffect />

      {/* 1. Header chuẩn phong cách Trạm Tarot */}
      <Header
        onScrollToTable={handleStartReading}
        onGoHome={handleGoHome}
        onNavigate={handleNavigate}
      />

      <main className="flex-1 w-full">
        {/* 2. Hero Section: Tiêu đề TAROTREADER.ME & giữ nguyên quả cầu hoàng đạo xoay */}
        <HeroSection onStartReading={handleStartReading} />

        {/* 3. Section CÁC CHỦ ĐỀ BÓI BÀI TAROT (4 thẻ tương tác) */}
        <TopicsSection onSelectTopic={handleSelectTopicFromSection} />

        {/* 4. Section TAROT LÀ GÌ? (Đưa xuống sau phần chủ đề) */}
        <AboutTarotSection onLearnMore={() => setIsCatalogOpen(true)} />

        {/* 5. Khu vực Trải bài Tarot tương tác (Bàn bài 3D + Luận giải AI ấm áp, tích cực) */}
        <TarotTable
          isDialogueOpen={isDialogueOpen}
          onOpenDialogue={handleStartReading}
          onCloseDialogue={handleCloseReading}
          onSkipQuestionPrompt={handleSkipQuestionPrompt}
          selectedTopic={selectedTopic}
          selectedSpread={selectedSpread}
          resetKey={resetKey}
          onGoHome={handleGoHome}
        />

        {/* 5.5 Bảng giá & Gói dịch vụ Trạm Tarot (Freemium Model) */}
        <PricingSection onScrollToTable={handleStartReading} />

        {/* 6. Section HÀNH TRÌNH CÁC LÁ BÀI (Bài viết tiêu biểu & kiến thức Tarot) */}
        <ArticlesSection />

        {/* 7. Section LỢI ÍCH KHI SỬ DỤNG DỊCH VỤ BÓI BÀI TAROT ONLINE TẠI TAROTREADER.ME */}
        <BenefitsSection onStartReading={handleStartReading} />

        {/* 8. Section CÂU HỎI THƯỜNG GẶP (Accordion) */}
        <FAQSection />
      </main>

      {/* 9. Footer chuẩn */}
      <FooterSection
        onOpenCatalog={() => setIsCatalogOpen(true)}
        onScrollToTable={handleStartReading}
      />

      {/* 10. Bách khoa toàn thư Modal tra cứu 78 lá */}
      <CardCatalogModal
        isOpen={isCatalogOpen}
        onClose={() => setIsCatalogOpen(false)}
        onStartReading={() => {
          setIsCatalogOpen(false);
          handleStartReading();
        }}
      />
    </div>
  );
}
