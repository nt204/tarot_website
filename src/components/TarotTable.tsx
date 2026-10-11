'use client';

import React, { useState, useRef, useEffect } from 'react';
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

// 3 mẫu mặt lưng bài Tarot (ngẫu nhiên 1 trong 3 mỗi lần trải bài)
const BACK_CARDS = [
  '/cards/back/back_1.png',
  '/cards/back/back_2.png',
  '/cards/back/back_3.png'
];

// Thời lượng file question-prompt.wav (8,324 giây) để chữ chạy hết đúng lúc lời đọc kết thúc.
const QUESTION_AUDIO_DURATION_MS = 8324;
const QUESTION_PROMPT_DELAY_MS = 300;
const SHUFFLE_AUDIO_DELAY_MS = 500;
const GATHER_ANIMATION_DURATION_MS = 970;
const GATHER_SOUND_TAIL_MS = 700;
const GATHER_SOUND_DURATION_MS = GATHER_ANIMATION_DURATION_MS + GATHER_SOUND_TAIL_MS;
const FAN_DEAL_DURATION_MS = 2200;
const DEAL_SOUND_STOP_EARLY_MS = 600;
// Bật luận giải AI chuẩn
const AI_INTERPRETATION_ENABLED = true;

const CHAOS_LAYOUT = [
  { x: -92, y: -26, r: -22 },
  { x: 82, y: -28, r: 24 },
  { x: -50, y: 32, r: 16 },
  { x: 70, y: 28, r: -18 },
  { x: -82, y: 14, r: -26 },
  { x: 34, y: -36, r: -14 },
  { x: -22, y: -20, r: 22 },
  { x: 94, y: 10, r: 30 },
  { x: -64, y: -32, r: -16 },
  { x: 50, y: -14, r: 16 },
  { x: -26, y: 30, r: -24 },
  { x: 16, y: -8, r: 10 },
  { x: -72, y: -4, r: 14 },
  { x: 74, y: -20, r: -22 },
];

interface TarotTableProps {
  isDialogueOpen?: boolean;
  onOpenDialogue?: () => void;
  onCloseDialogue?: () => void;
  onSkipQuestionPrompt?: () => void;
  selectedTopic?: TopicType;
  selectedSpread?: SpreadType;
  resetKey?: number;
  onGoHome?: () => void;
}

export const TarotTable: React.FC<TarotTableProps> = ({
  isDialogueOpen: externalIsDialogueOpen,
  onOpenDialogue: externalOnOpenDialogue,
  onCloseDialogue: externalOnCloseDialogue,
  onSkipQuestionPrompt,
  selectedTopic = 'general',
  selectedSpread = 'three_cards',
  resetKey,
  onGoHome
}) => {
  const [internalIsDialogueOpen, setInternalIsDialogueOpen] = useState(false);
  const isDialogueOpen = externalIsDialogueOpen !== undefined ? externalIsDialogueOpen : internalIsDialogueOpen;

  const handleOpenDialogue = () => {
    if (externalOnOpenDialogue) externalOnOpenDialogue();
    else setInternalIsDialogueOpen(true);
  };

  const resetTableState = () => {
    const shuffleAudio = shuffleAudioRef.current;
    if (shuffleAudio) {
      shuffleAudio.pause();
      shuffleAudio.currentTime = 0;
      shuffleAudio.loop = false;
    }
    setStep('config');
    setReadingId(null);
    setSlots([]);
    setSelectedSlotIds([]);
    setFlyingSlotIds([]);
    setDrawnCards([]);
    setFlippedCards({});
    setRevealedCardIndexes([]);
    setReadingStatus('idle');
    setAiResult(null);
    setReadingError(null);
    setFanDealt(false);
    setIsZoomingIn(false);
    setUserConcern('');
    setSavedToast(false);
    if (externalOnCloseDialogue) {
      externalOnCloseDialogue();
    } else {
      setInternalIsDialogueOpen(false);
    }
  };

  const handleResetToHome = () => {
    resetTableState();
    if (onGoHome) {
      onGoHome();
    } else if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleCloseDialogue = () => {
    if (externalOnCloseDialogue) {
      externalOnCloseDialogue();
    } else {
      setInternalIsDialogueOpen(false);
    }
  };

  // 1 câu hỏi tâm sự duy nhất
  const SINGLE_QUESTION = 'Ai trong chúng ta... cũng có những điều khó nói thành lời. Vậy còn bạn? Lúc này... điều gì đang khiến trái tim bạn bận lòng?';
  const [userConcern, setUserConcern] = useState<string>('');
  const [displayedQuestion, setDisplayedQuestion] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [isQuestionComplete, setIsQuestionComplete] = useState<boolean>(false);
  const questionTypingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const questionTypingDelayRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shuffleAudioRef = useRef<HTMLAudioElement | null>(null);
  const pickAudioRef = useRef<HTMLAudioElement | null>(null);
  const flipAudioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const lightCardBufferRef = useRef<AudioBuffer | null>(null);
  const lightCardPoolRef = useRef<HTMLAudioElement[]>([]);
  const lightCardPoolIndexRef = useRef(0);
  const lastLightCardPlayTimeRef = useRef(0);
  const activeLightCardSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const activeLightCardGainRef = useRef<GainNode | null>(null);
  const hoverSwitchTimeRef = useRef(0);

  // Mẫu mặt lưng bài ngẫu nhiên cho lần trải bài hiện tại
  const [currentBackCard, setCurrentBackCard] = useState<string>(BACK_CARDS[0]);

  // Config state
  const [topic, setTopic] = useState<TopicType>('general');
  const [spread, setSpread] = useState<SpreadType>('three_cards');
  const [allowReversed, setAllowReversed] = useState<boolean>(false);
  const [question, setQuestion] = useState<string>('');
  const [context, setContext] = useState<string>('');
  const [showAdvancedOptions, setShowAdvancedOptions] = useState<boolean>(false);
  const [showContextInput, setShowContextInput] = useState<boolean>(false);

  // Flow state:
  // Flow state: 'config' -> 'shuffling' -> 'picking' -> 'drawn'
  const [readingId, setReadingId] = useState<string | null>(null);
  const [step, setStep] = useState<'config' | 'shuffling' | 'picking' | 'drawn'>('config');

  // Proxy cards cho hiệu ứng xào bài ảo ở giữa bàn
  const proxyCards = Array.from({ length: 14 });
  const cardProxyRefs = useRef<(HTMLDivElement | null)[]>([]);

  const [slots, setSlots] = useState<OpaqueSlot[]>([]);
  const [selectedSlotIds, setSelectedSlotIds] = useState<string[]>([]);
  const [flyingSlotIds, setFlyingSlotIds] = useState<string[]>([]);
  const [drawnCards, setDrawnCards] = useState<DrawnCard[]>([]);
  const [flippedCards, setFlippedCards] = useState<Record<number, boolean>>({});
  // Theo dõi các lá bài đã từng được lật mở ít nhất một lần (lật úp lại vẫn tính là đã mở)
  const [revealedCardIndexes, setRevealedCardIndexes] = useState<number[]>([]);

  // Toast thông báo lưu trải bài
  const [savedToast, setSavedToast] = useState<boolean>(false);

  // Interpretation state
  const [readingStatus, setReadingStatus] = useState<'idle' | 'generating' | 'completed' | 'failed'>('idle');
  const [aiResult, setAiResult] = useState<AIReadingResult | null>(null);
  const [readingError, setReadingError] = useState<string | null>(null);

  // Áp dụng chủ đề và kiểu trải của thẻ mà người dùng vừa chọn.
  useEffect(() => {
    if (isDialogueOpen) {
      setTopic(selectedTopic);
      setSpread(selectedSpread);
    }
  }, [isDialogueOpen, selectedSpread, selectedTopic]);

  // Lắng nghe reset từ bên ngoài (nhấn logo / navbar)
  useEffect(() => {
    if (resetKey !== undefined && resetKey > 0) {
      resetTableState();
    }
  }, [resetKey]);



  // Refs DOM
  const slotTargetRefs = useRef<(HTMLDivElement | null)[]>([]);
  const fanCardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const targetSlotsContainerRef = useRef<HTMLDivElement | null>(null);
  const fanContainerRef = useRef<HTMLDivElement | null>(null);
  const [hoveredCardIndex, setHoveredCardIndex] = useState<number | null>(null);
  const [fanDealt, setFanDealt] = useState<boolean>(false);
  const isSelectingRef = useRef<boolean>(false);
  const [isZoomingIn, setIsZoomingIn] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 640;
    }
    return false;
  });

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 640;
      setIsMobile((prev) => (prev !== mobile ? mobile : prev));
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const requiredCount = spread === 'daily' ? 1 : 3;

  // Gợi ý câu hỏi tự nhiên theo từng chủ đề (Được chọn lọc từ top câu hỏi tìm kiếm nhiều nhất)
  const suggestions: Record<TopicType, string[]> = {
    general: [
      'Thông điệp bạn cần nghe lúc này là gì?',
      'May mắn nào đang tới với bạn?',
      'Ngày này năm sau bạn đang như thế nào?',
      'Quý nhân của bạn là người như thế nào?',
      'Điều gì đang khiến tôi chần chừ đưa ra quyết định?'
    ],
    love: [
      'Chuyện tình cảm của bạn sắp tới thế nào?',
      'Sau khi chia tay họ có suy nghĩ về bạn không?',
      'Chuyện tình cảm của bạn từ giờ cho tới cuối năm?',
      'Mức độ tình cảm người bạn nghĩ tới dành cho bạn?',
      'Tình cảm này đã chấm dứt hay chưa?',
      'Gặp gỡ người yêu mới trong thời điểm thế nào?',
      'Chồng / vợ tương lai của bạn là ai?',
      'Họ nghĩ gì mỗi khi nhìn vào khuôn mặt của bạn?'
    ],
    career: [
      'Công việc từ giờ đến cuối năm ra sao?',
      'Khi nào sự nghiệp có bước ngoặt lớn?',
      'Khi nào bứt phá trong sự nghiệp?',
      'Tôi cần chú ý điều gì trong công việc lúc này?',
      'Hướng hành động nào giúp tôi vững vàng hơn?'
    ]
  };

  const placeholders: Record<TopicType, string> = {
    general: 'Tôi cần chú ý điều gì lúc này?',
    love: 'Tôi nên hiểu và ứng xử thế nào trong mối quan hệ hiện tại?',
    career: 'Tôi cần cân nhắc những gì trước khi quyết định thay đổi công việc?'
  };

  // 19 lá bài trên quạt - vừa vặn hoàn hảo, xòe cánh cung đầy đặn
  const fanCards = slots.slice(0, 19);

  // Hiệu ứng chữ chạy ra từ từ từng ký tự (Typewriter) khi mở hộp thoại tâm sự
  useEffect(() => {
    if (isDialogueOpen) {
      setDisplayedQuestion('');
      setIsTyping(true);
      setIsQuestionComplete(false);

      questionTypingDelayRef.current = setTimeout(() => {
        questionTypingDelayRef.current = null;
        let charIndex = 0;
        const typingInterval = Math.round(QUESTION_AUDIO_DURATION_MS / SINGLE_QUESTION.length);
        questionTypingIntervalRef.current = setInterval(() => {
          charIndex++;
          setDisplayedQuestion(SINGLE_QUESTION.slice(0, charIndex));
          if (charIndex >= SINGLE_QUESTION.length) {
            if (questionTypingIntervalRef.current) {
              clearInterval(questionTypingIntervalRef.current);
              questionTypingIntervalRef.current = null;
            }
            setIsTyping(false);
            setIsQuestionComplete(true);
          }
        }, typingInterval);
      }, QUESTION_PROMPT_DELAY_MS);

      return () => {
        if (questionTypingDelayRef.current) {
          clearTimeout(questionTypingDelayRef.current);
          questionTypingDelayRef.current = null;
        }
        if (questionTypingIntervalRef.current) {
          clearInterval(questionTypingIntervalRef.current);
          questionTypingIntervalRef.current = null;
        }
      };
    } else {
      setDisplayedQuestion('');
      setIsTyping(false);
      setIsQuestionComplete(false);
    }
  }, [isDialogueOpen]);

  // Khởi tạo Web Audio API + HTML5 Audio Pool cho tiếng light card (/audio/card-pick.mp3?v=light-card-v3)
  useEffect(() => {
    // 1. Web Audio API để phát tức thì 0ms latency không bao giờ bị nghẽn khi lia bài
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        audioContextRef.current = ctx;
        fetch('/audio/card-pick.mp3?v=light-card-v6')
          .then((r) => r.arrayBuffer())
          .then((buf) => ctx.decodeAudioData(buf))
          .then((decoded) => {
            lightCardBufferRef.current = decoded;
          })
          .catch(() => undefined);
      }
    } catch {
      // ignore
    }

    // 2. HTML5 Audio Pool làm backup chắc chắn 100% phát được trên mọi thiết bị
    const pool: HTMLAudioElement[] = [];
    for (let i = 0; i < 6; i++) {
      const a = new Audio('/audio/card-pick.mp3?v=light-card-v6');
      a.volume = 0.4; // Giảm thêm 10% nữa cho cực kỳ êm tai
      a.preload = 'auto';
      pool.push(a);
    }
    lightCardPoolRef.current = pool;
  }, []);

  const playLightCardSound = (volumeScale: number = 0.32) => {
    const now = Date.now();
    // Giới hạn tối thiểu 115ms giữa các lần phát để âm thanh tinh tế, không bị dồn dập, lách cách khi lia chuột nhanh
    if (now - lastLightCardPlayTimeRef.current < 115) return;
    lastLightCardPlayTimeRef.current = now;

    // Ưu tiên Web Audio API: Đơn âm tinh gọn (voice stealing), ngắt êm âm trước để không chồng lấn vang vọng
    const ctx = audioContextRef.current;
    const buffer = lightCardBufferRef.current;
    if (ctx && buffer) {
      if (ctx.state === 'suspended') {
        void ctx.resume();
      }
      try {
        // Hạ âm lượng âm trước nhanh chóng (fade out 20ms) để không bị cắt đột ngột gây click, nhưng không để 2 âm vang cùng lúc
        if (activeLightCardGainRef.current) {
          try {
            activeLightCardGainRef.current.gain.cancelScheduledValues(ctx.currentTime);
            activeLightCardGainRef.current.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.02);
          } catch {}
        }
        if (activeLightCardSourceRef.current) {
          try {
            activeLightCardSourceRef.current.stop(ctx.currentTime + 0.025);
          } catch {}
        }

        const source = ctx.createBufferSource();
        source.buffer = buffer;
        const gainNode = ctx.createGain();
        gainNode.gain.setValueAtTime(volumeScale, ctx.currentTime);
        source.connect(gainNode);
        gainNode.connect(ctx.destination);
        source.start(0);

        activeLightCardSourceRef.current = source;
        activeLightCardGainRef.current = gainNode;

        source.onended = () => {
          if (activeLightCardSourceRef.current === source) {
            activeLightCardSourceRef.current = null;
            activeLightCardGainRef.current = null;
          }
        };
        return;
      } catch {
        // Fallback sang pool
      }
    }

    // Backup: HTML5 Audio Pool (dừng âm cũ trước khi phát âm mới)
    const pool = lightCardPoolRef.current;
    if (pool.length > 0) {
      pool.forEach((a) => {
        if (!a.paused) {
          a.pause();
          a.currentTime = 0;
        }
      });
      const audio = pool[lightCardPoolIndexRef.current];
      lightCardPoolIndexRef.current = (lightCardPoolIndexRef.current + 1) % pool.length;
      try {
        audio.currentTime = 0;
        audio.volume = volumeScale;
        void audio.play().catch(() => undefined);
      } catch {
        // ignore
      }
    }
  };

  // Chống nhấp nháy/dao động qua lại giữa 2 lá bài liền kề khi chuột nằm ở vùng tiếp giáp
  const handleCardHover = (targetIndex: number) => {
    if (hoveredCardIndex === targetIndex) return;
    const now = Date.now();
    if (now - hoverSwitchTimeRef.current < 75) return;
    hoverSwitchTimeRef.current = now;

    playLightCardSound();
    setHoveredCardIndex(targetIndex);
  };

  const handleContinueToForm = () => {
    if (questionTypingDelayRef.current) {
      clearTimeout(questionTypingDelayRef.current);
      questionTypingDelayRef.current = null;
    }
    if (questionTypingIntervalRef.current) {
      clearInterval(questionTypingIntervalRef.current);
      questionTypingIntervalRef.current = null;
    }

    onSkipQuestionPrompt?.();
    setDisplayedQuestion(SINGLE_QUESTION);
    setIsTyping(false);
    setIsQuestionComplete(true);
  };

  // 1. Bắt đầu phiên trải bài
  const handleStartSession = async (
    customQuestion?: string,
    customContext?: string,
    customTopic?: TopicType
  ) => {
    const finalQ = (customQuestion !== undefined ? customQuestion : question).trim();
    const finalC = (customContext !== undefined ? customContext : context).trim();
    const finalT = customTopic !== undefined ? customTopic : topic;

    if (!finalQ) {
      alert('Vui lòng chia sẻ đôi điều bạn đang băn khoăn để trải bài có định hướng rõ ràng.');
      return;
    }

    try {
      // Chọn ngẫu nhiên 1 trong 3 mẫu mặt lưng bài cho mỗi lần trải bài
      const randomBack = BACK_CARDS[Math.floor(Math.random() * BACK_CARDS.length)];
      setCurrentBackCard(randomBack);

      setSelectedSlotIds([]);
      setFlyingSlotIds([]);
      setDrawnCards([]);
      setFlippedCards({});
      setAiResult(null);
      setReadingStatus('idle');
      setReadingError(null);
      setFanDealt(false);
      isSelectingRef.current = false;
      setIsZoomingIn(false);
      setStep('shuffling');

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
          topic: finalT,
          spread,
          allow_reversed: allowReversed,
          tone: 'gentle',
          question: finalQ,
          context: finalC,
          user_fingerprint: fingerprint
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Không thể tạo phiên trải bài.');

      setReadingId(data.reading_id);
      setSlots(data.slots || []);
    } catch (err: any) {
      alert(err.message || 'Không thể bắt đầu trải bài.');
      setStep('config');
    }
  };

  // Xác nhận câu băn khoăn từ hộp thoại tâm sự và bắt đầu bói bài
  const handleConfirmStartReading = async () => {
    const trimmed = userConcern.trim();
    if (!trimmed) {
      alert('Vui lòng chia sẻ đôi lời băn khoăn của bạn trước khi bắt đầu trải bài nhé.');
      return;
    }

    // Đóng hộp thoại để lộ ra bàn trải bài
    handleCloseDialogue();

    // Tự động phân loại chủ đề sát thực
    const lower = trimmed.toLowerCase();
    let detectedTopic: TopicType = 'general';
    if (lower.includes('yêu') || lower.includes('chia tay') || lower.includes('người yêu') || lower.includes('tình cảm') || lower.includes('hẹn hò') || lower.includes('hôn nhân')) {
      detectedTopic = 'love';
    } else if (lower.includes('công việc') || lower.includes('nghỉ việc') || lower.includes('sự nghiệp') || lower.includes('tiền') || lower.includes('sếp') || lower.includes('kinh doanh') || lower.includes('lương')) {
      detectedTopic = 'career';
    }

    setTopic(detectedTopic);
    setQuestion(trimmed);
    setContext('Lời băn khoăn của người xem: ' + trimmed);

    await handleStartSession(trimmed, 'Lời băn khoăn của người xem: ' + trimmed, detectedTopic);
  };

  // Giữ bàn trải bài ở giữa màn hình khi xào bài
  useEffect(() => {
    if (step === 'shuffling') {
      const scrollTimer = setTimeout(() => {
        const target = document.getElementById('tarot-table');
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        target?.scrollIntoView({
          behavior: reduceMotion ? 'auto' : 'smooth',
          block: 'center'
        });
      }, 50);

      return () => clearTimeout(scrollTimer);
    }

    if (step === 'picking') {
      setFanDealt(false);
      setHoveredCardIndex(null);

      // Sau khi quạt bài xòe ra hoàn tất (~2.2s), chuyển sang chế độ tương tác siêu nhạy (zero delay khi hover/unhover)
      const timer = setTimeout(() => {
        setFanDealt(true);
      }, FAN_DEAL_DURATION_MS);
      return () => clearTimeout(timer);
    } else {
      setFanDealt(false);
      setHoveredCardIndex(null);
    }
  }, [step]);

  // Hai nhịp âm thanh: khi gom cọc bài và khi chia quạt bài.
  useEffect(() => {
    const shuffleAudio = shuffleAudioRef.current;
    if (!shuffleAudio) return;

    const stopSound = () => {
      shuffleAudio.pause();
      shuffleAudio.currentTime = 0;
      shuffleAudio.loop = false;
    };

    if (step === 'shuffling') {
      let stopTimer: ReturnType<typeof setTimeout> | null = null;
      const startTimer = setTimeout(() => {
        shuffleAudio.currentTime = 0;
        shuffleAudio.volume = 0.9;
        shuffleAudio.loop = false;
        void shuffleAudio.play().catch(() => undefined);
        stopTimer = setTimeout(stopSound, GATHER_SOUND_DURATION_MS);
      }, SHUFFLE_AUDIO_DELAY_MS);

      return () => {
        clearTimeout(startTimer);
        if (stopTimer) clearTimeout(stopTimer);
        stopSound();
      };
    }

    if (step === 'picking') {
      shuffleAudio.currentTime = 0;
      shuffleAudio.volume = 0.9;
      shuffleAudio.loop = true;
      void shuffleAudio.play().catch(() => undefined);

      const stopTimer = setTimeout(
        stopSound,
        FAN_DEAL_DURATION_MS - DEAL_SOUND_STOP_EARLY_MS
      );

      return () => {
        clearTimeout(stopTimer);
        stopSound();
      };
    }

    stopSound();
  }, [step]);

  useEffect(() => {
    const shuffleAudio = shuffleAudioRef.current;
    const isDealingComplete = step === 'picking' && fanDealt;
    const isReadingInactive = step === 'config' || step === 'drawn';

    if (shuffleAudio && (isDealingComplete || isReadingInactive)) {
      shuffleAudio.pause();
      shuffleAudio.currentTime = 0;
      shuffleAudio.loop = false;
    }
  }, [fanDealt, step]);

  // 2. Hiệu ứng xào bài ảo GSAP: Mới đầu bài đang ở trạng thái rối sẵn -> Sau đó gom lại thành 1 bộ -> Tráo cọc bài -> Rồi mới chia

  useEffect(() => {
    if (step === 'shuffling') {
      const proxies = cardProxyRefs.current.filter(Boolean) as HTMLElement[];
      if (proxies.length === 0) {
        const timer = setTimeout(() => {
          setFanDealt(false);
          setStep('picking');
        }, 2500);
        return () => clearTimeout(timer);
      }

      // Đặt ngay các lá bài ở trạng thái đang rối sẵn trên mặt bàn (không cần chạy hiệu ứng xáo rối)
      gsap.set(proxies, {
        x: (i) => CHAOS_LAYOUT[i % CHAOS_LAYOUT.length].x,
        y: (i) => CHAOS_LAYOUT[i % CHAOS_LAYOUT.length].y,
        rotation: (i) => CHAOS_LAYOUT[i % CHAOS_LAYOUT.length].r,
        opacity: 1
      });

      const tl = gsap.timeline({
        delay: 0.5, // Dừng nửa giây để người xem thấy các lá bài đang nằm rối sẵn trên mặt bàn
        onComplete: () => {
          setFanDealt(false);
          setStep('picking');
        }
      });

      // BƯỚC 1: Gom toàn bộ các lá bài đang rối lại về trung tâm thành 1 bộ phẳng phiu
      tl.to(proxies, {
        x: 0,
        y: 0,
        rotation: 0,
        duration: 0.75,
        ease: 'power3.inOut',
        stagger: { amount: 0.22, from: 'edges' }
      });

      // BƯỚC 2: Tráo cọc bài vừa gom lại
      // 2.1. Chẻ cọc bài thành 2 nửa sang 2 bên
      tl.to(proxies.filter((_, i) => i % 2 === 0), {
        x: -44,
        rotation: -4.5,
        duration: 0.38,
        ease: 'power2.out'
      }, '+=0.06');
      tl.to(proxies.filter((_, i) => i % 2 !== 0), {
        x: 44,
        rotation: 4.5,
        duration: 0.38,
        ease: 'power2.out'
      }, '<');

      // 2.2. Lồng so le tráo các lá bài vào nhau
      tl.to(proxies, {
        x: (i) => (i % 2 === 0 ? -12 : 12),
        rotation: (i) => (i % 2 === 0 ? -1.5 : 1.5),
        duration: 0.32,
        ease: 'power1.in',
        stagger: 0.016
      });

      // 2.3. Nhập phẳng lại thành 1 cọc duy nhất (gối đầu liền mạch vào nhịp lồng, không bị khựng)
      tl.to(proxies, {
        x: 0,
        rotation: 0,
        duration: 0.36,
        ease: 'power2.out',
        stagger: 0.01
      }, '-=0.18');

      // 2.4. Gõ nhẹ cọc bài xuống bàn căn chỉnh
      tl.to(proxies, {
        y: -12,
        duration: 0.16,
        ease: 'power1.out'
      });
      tl.to(proxies, {
        y: 0,
        duration: 0.22,
        ease: 'bounce.out'
      });

      // Kết thúc: Cọc bài đã gom phẳng và tráo xong -> onComplete tự động chuyển sang 'picking' để chia bài bung quạt
      return () => {
        tl.kill();
      };
    }
  }, [step]);

  // 3. Chọn lá bài: Lá bay từ từ, mượt mà vào ô mục tiêu bằng GPU transform, không giật/nháy hình
  const handleSelectSlot = (slotId: string, cardIndex: number) => {
    if (isSelectingRef.current || isZoomingIn) return;
    if (selectedSlotIds.includes(slotId) || flyingSlotIds.includes(slotId)) return;
    if (selectedSlotIds.length >= requiredCount) return;

    // Ngắt ngay trạng thái hover của các lá bài khác
    setHoveredCardIndex(null);
    playLightCardSound();

    const targetSlotIndex = selectedSlotIds.length;
    const cardEl = fanCardRefs.current[cardIndex];
    const targetEl = slotTargetRefs.current[targetSlotIndex];

    if (cardEl && targetEl) {
      isSelectingRef.current = true;
      setFlyingSlotIds((prev) => [...prev, slotId]);

      // Lấy thẻ bài thực tế bên trong
      const innerCard = (cardEl.querySelector('[data-fan-card-inner]') as HTMLElement) || (cardEl.querySelector('.rounded-xl') as HTMLElement) || cardEl;
      const sourceRect = innerCard.getBoundingClientRect();
      const targetRect = targetEl.getBoundingClientRect();

      // Tâm hiện tại của lá bài được click (bao gồm độ nhô khi hover)
      const sourceCenterX = sourceRect.left + sourceRect.width / 2;
      const sourceCenterY = sourceRect.top + sourceRect.height / 2;

      // Góc nghiêng ban đầu của lá bài trên quạt
      const totalCards = fanCards.length;
      const currentMaxAngle = isMobile ? 36 : 54;
      const stepAngle = totalCards > 1 ? currentMaxAngle / (totalCards - 1) : 0;
      const cardAngle = -currentMaxAngle / 2 + cardIndex * stepAngle;

      const cardWidth = targetRect.width;
      const cardHeight = targetRect.height;
      const initialScale = (innerCard.offsetWidth || cardWidth) / cardWidth;

      // Tạo phần tử lá bài bay trực tiếp trên DOM, thiết kế giống hệt 100% lá bài trong ô
      const flyEl = document.createElement('div');
      flyEl.style.position = 'fixed';
      flyEl.style.top = '0px';
      flyEl.style.left = '0px';
      flyEl.style.width = `${cardWidth}px`;
      flyEl.style.height = `${cardHeight}px`;
      flyEl.style.zIndex = '9999';
      flyEl.style.borderRadius = '12px';
      flyEl.style.overflow = 'hidden';
      flyEl.style.border = '1px solid #C9A85C';
      flyEl.style.boxShadow = '0 0 25px rgba(201, 168, 92, 0.45)';
      flyEl.style.pointerEvents = 'none';
      flyEl.style.willChange = 'transform, box-shadow';
      flyEl.innerHTML = `
        <div style="width:100%;height:100%;position:relative;">
          <img src="${currentBackCard}" alt="Lá bài bay" style="width:100%;height:100%;object-fit:cover;display:block;" />
          <div style="position:absolute;inset:0;border:1px solid rgba(201,168,92,0.7);border-radius:12px;pointer-events:none;"></div>
        </div>
      `;
      document.body.appendChild(flyEl);

      // Đặt vị trí xuất phát chính xác 100% tại tâm, tỷ lệ và góc nghiêng của lá bài vừa click
      gsap.set(flyEl, {
        x: sourceCenterX - cardWidth / 2,
        y: sourceCenterY - cardHeight / 2,
        rotation: cardAngle,
        scale: initialScale,
        transformOrigin: 'center center'
      });

      // Ẩn ngay lá bài gốc trên quạt để không bóng chồng (Framer Motion cũng tự động opacity: 0 nhờ flyingSlotIds)
      cardEl.style.opacity = '0';

      // Bay mượt mà vào ô mục tiêu bằng GPU transform (x, y, rotation, scale)
      gsap.to(flyEl, {
        x: targetRect.left,
        y: targetRect.top,
        rotation: 0,
        scale: 1,
        boxShadow: '0 0 25px rgba(201, 168, 92, 0.4)',
        duration: 0.65,
        ease: 'power3.out',
        onComplete: () => {
          // 1. Cập nhật state chọn thẻ
          finishCardSelection(slotId);

          // 2. Chờ React hoàn tất render thẻ bài bên dưới trước khi gỡ flyEl (triệt tiêu 100% giật đen / nhấp nháy)
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              flyEl.remove();
              isSelectingRef.current = false;
            });
          });
        }
      });
    } else {
      finishCardSelection(slotId);
    }
  };

  const finishCardSelection = async (slotId: string) => {
    const newSelected = [...selectedSlotIds, slotId];
    setSelectedSlotIds(newSelected);
    setFlyingSlotIds((prev) => prev.filter((id) => id !== slotId));

    if (newSelected.length === requiredCount && readingId) {
      try {
        // Cho người xem nhìn thấy lá bài thứ 3 khớp vào ô trọn vẹn trước khi chuyển cảnh
        await new Promise((resolve) => setTimeout(resolve, 200));

        // Khởi động fetch API song song với hiệu ứng zoom
        const drawPromise = fetch('/api/reading/draw', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            reading_id: readingId,
            selected_slot_ids: newSelected
          })
        });

        // Kích hoạt hiệu ứng Zoom-in điện ảnh (Fake Zoom liền mạch từ 3 ô nhỏ lên 3 lá lớn)
        setIsZoomingIn(true);

        // 1. Quạt bài mờ dần và trôi nhẹ xuống
        if (fanContainerRef.current) {
          gsap.to(fanContainerRef.current, {
            opacity: 0,
            y: 55,
            scale: 0.92,
            duration: 0.65,
            ease: 'power2.in'
          });
        }

        // 2. Tiêu đề sảnh bốc bài mờ nhẹ bay lên
        const titleArea = document.querySelector('#picking-title-area');
        if (titleArea) {
          gsap.to(titleArea, { opacity: 0, y: -25, duration: 0.5, ease: 'power2.in' });
        }

        // 3. Ô 3 lá đã bốc phóng to mượt mà (scale 1.95) tiến sát góc nhìn người xem
        if (targetSlotsContainerRef.current) {
          gsap.to(targetSlotsContainerRef.current, {
            scale: 1.95,
            y: 75,
            duration: 0.8,
            ease: 'power2.inOut'
          });
        }

        const [res] = await Promise.all([
          drawPromise,
          new Promise((resolve) => setTimeout(resolve, 800))
        ]);

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Lỗi khi rút bài.');

        setDrawnCards(data.drawn_cards);
        setFlippedCards({}); // Giữ nguyên trạng thái úp ban đầu để người xem tự tay lật mở 3D
        setRevealedCardIndexes([]);
        setStep('drawn');
        setIsZoomingIn(false);
        // Tự động gọi luận giải AI ngay trong nền để chuẩn bị sẵn
        if (AI_INTERPRETATION_ENABLED && readingId) {
          fetchInterpretation(readingId);
        }
      } catch (e: any) {
        setIsZoomingIn(false);
        alert(e.message || 'Lỗi khi ghi nhận lá bài.');
      }
    }
  };

  // Helper hiển thị tên vị trí chuẩn theo phong cách Trạm Tarot
  const getPositionDisplay = (idx: number) => {
    if (spread === 'daily') return 'Thông điệp hôm nay';
    if (idx === 0) return 'Hiện tại';
    if (idx === 1) return 'Điều cần chú ý';
    if (idx === 2) return 'Hướng hành động';
    return `Vị trí ${idx + 1}`;
  };

  // 4. Lật bài: Đánh dấu lá bài đã được mở (lật úp lại vẫn tính là đã mở)
  const handleFlipCard = (idx: number) => {
    const flipAudio = flipAudioRef.current;
    if (flipAudio) {
      flipAudio.currentTime = 0;
      flipAudio.volume = 0.9;
      void flipAudio.play().catch(() => undefined);
    }

    setFlippedCards((prev) => ({ ...prev, [idx]: !prev[idx] }));
    setRevealedCardIndexes((prev) => (prev.includes(idx) ? prev : [...prev, idx]));
  };

  // 5. Luận giải AI
  const fetchInterpretation = async (id: string) => {
    setReadingStatus('generating');
    setReadingError(null);

    try {
      const res = await fetch('/api/reading/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reading_id: id })
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

  // 6. Lưu kết quả trải bài (Sao chép toàn bộ văn bản và lưu vào localStorage)
  const handleSaveReading = () => {
    if (!drawnCards.length) return;
    const cardsText = drawnCards
      .map((c, i) => `${getPositionDisplay(i)} · ${c.card.name}`)
      .join('\n');

    const content = `✦ TRẠM TAROT · KẾT QUẢ TRẢI BÀI ✦

CÂU HỎI:
"${question || 'Thông điệp định hướng cho bạn'}"

CÁC LÁ BÀI ĐÃ RÚT:
${cardsText}

GÓC NHÌN TỔNG THỂ:
${aiResult?.headline || 'Chiêm nghiệm nội tâm'}
${aiResult?.summary || ''}

PHÂN TÍCH TỪNG LÁ:
${aiResult?.card_readings?.map((cr, i) => `${getPositionDisplay(i)} · ${cr.card_name}\n${cr.interpretation}`).join('\n\n') || ''}

MỐI LIÊN KẾT GIỮA CÁC QUÂN BÀI:
${aiResult?.synthesis || ''}

HAI ĐIỀU BẠN CÓ THỂ THỬ:
1. ${aiResult?.actions?.[0] || ''}
2. ${aiResult?.actions?.[1] || ''}

© 2026 Trạm Tarot (tramtarot.vn)`;

    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(content);
    }
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 3500);
  };

  return (
    <div
      id="tarot-table"
      className={`relative w-full scroll-mt-20 px-4 sm:px-6 lg:px-8 bg-[#080708] text-[#EEE6D8] overflow-hidden ${
        step === 'picking'
          ? 'min-h-[calc(100vh-76px)] flex items-center justify-center py-2 sm:py-6'
          : step === 'config'
          ? 'pt-8 sm:pt-20 md:pt-28 pb-4 sm:pb-14'
          : 'min-h-[560px] pt-10 sm:pt-20 pb-12 sm:pb-20'
      }`}
    >
      <audio ref={shuffleAudioRef} src="/audio/card-shuffle.mp3?v=shuffle-original" preload="auto" />
      <audio ref={pickAudioRef} src="/audio/card-pick.mp3?v=light-card-v6" preload="auto" />
      <audio ref={flipAudioRef} src="/audio/card-flip.mp3?v=flip-card" preload="auto" />

      <div className="w-full max-w-5xl mx-auto relative z-10">
        {/* ================= HỘP THOẠI TÂM SỰ TOÀN MÀN HÌNH TỐI ĐEN (BLACK SANCTUARY MODAL) ================= */}
        <AnimatePresence>
          {isDialogueOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.45, ease: 'easeInOut' }}
              className="fixed inset-0 z-50 bg-[#080708]/98 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
            >
              {/* Vầng hào quang bàn thờ tâm sự thiêng liêng */}
              <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,rgba(201,168,92,0.08),rgba(0,0,0,0))] -z-10" />

              {/* Nút Trở về trang chủ */}
              <button
                type="button"
                onClick={handleResetToHome}
                className="absolute top-6 left-6 text-[#A89882] hover:text-[#C9A85C] border border-[#33281D] hover:border-[#C9A85C]/60 bg-[#120F16]/90 px-3.5 py-1.5 rounded-full transition-colors text-xs flex items-center gap-1.5 font-body cursor-pointer z-30 shadow-md"
              >
                <span>←</span>
                <span>Trở về trang chủ</span>
              </button>

              {/* Nút đóng / Thoát */}
              <button
                type="button"
                onClick={handleResetToHome}
                className="absolute top-6 right-6 text-[#8C7A65] hover:text-[#C9A85C] transition-colors p-2 text-sm flex items-center gap-1.5 font-body cursor-pointer z-30"
              >
                <span>✕</span>
                <span className="hidden sm:inline text-xs uppercase tracking-wider">Đóng</span>
              </button>

              {/* Góc tâm sự ở chính giữa màn hình tối đen */}
              <motion.div
                initial={{ opacity: 0, scale: 0.94, y: 18 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.94, y: 18 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="relative w-full max-w-xl mx-auto bg-[#100E13]/95 border border-[#2B231B] rounded-2xl p-6 sm:p-10 shadow-[0_20px_70px_rgba(0,0,0,0.95)] backdrop-blur-md space-y-6 text-center sm:text-left"
              >
                {!isQuestionComplete && (
                  <motion.button
                    type="button"
                    onClick={handleContinueToForm}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.25 }}
                    className="absolute right-4 bottom-2 sm:right-6 sm:bottom-3 z-10 inline-flex items-center gap-1.5 px-2 py-1 text-[11px] font-body tracking-wide text-[#C9A85C] transition-all duration-200 hover:-translate-y-0.5 hover:text-[#EEE6D8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C9A85C]"
                    aria-label="Tiếp tục để điền câu hỏi"
                  >
                    Tiếp tục
                    <span aria-hidden="true">→</span>
                  </motion.button>
                )}

                {/* Header nhỏ */}
                <div className="flex items-center justify-between border-b border-[#221B15] pb-3.5">
                  <button
                    type="button"
                    onClick={handleResetToHome}
                    className="flex items-center gap-2.5 group cursor-pointer text-left"
                  >
                    <img
                      src="/logo/logo_icon.png"
                      alt="Logo Trạm Tarot"
                      className="h-6.5 w-auto object-contain group-hover:scale-105 transition-transform"
                    />
                    <span className="font-heading tracking-[0.15em] text-xs sm:text-sm text-[#EEE6D8] group-hover:text-[#C9A85C] transition-colors uppercase">
                      Trạm Tarot
                    </span>
                    <span className="text-[#C9A85C] text-xs">✦</span>
                  </button>
                  <span className="text-[11px] text-[#C9A85C] font-body tracking-wider uppercase bg-[#18151D] px-2.5 py-0.5 rounded-full border border-[#3A2F22]">
                    Khoảng lặng tâm sự
                  </span>
                </div>

                {/* Tiêu đề & Dòng câu hỏi chạy từng chữ */}
                <div className="space-y-3 pt-1">
                  <span className="text-[11px] uppercase tracking-[0.25em] text-[#C9A85C]/90 font-heading block">
                    ✧ MỘT CHÚT TÂM SỰ ✧
                  </span>

                  <div className="min-h-[112px] sm:min-h-[120px] flex items-center select-none">
                    <h2 className="text-xl sm:text-2xl md:text-[25px] font-heading font-normal text-[#EEE6D8] leading-relaxed tracking-wide">
                      {displayedQuestion}
                      {isTyping && (
                        <span className="inline-block w-1.5 h-5 bg-[#C9A85C] ml-1.5 animate-pulse align-middle" />
                      )}
                    </h2>
                  </div>

                </div>

                <AnimatePresence>
                  {isQuestionComplete && (
                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                      className="space-y-5"
                    >
                      {/* Ô nhập chỉ xuất hiện sau khi lời hỏi đã kết thúc. */}
                      <div>
                        <label htmlFor="tarot-concern" className="mb-2 block text-xs sm:text-sm text-[#8C7A65] font-body italic">
                          Hãy viết điều bạn thực sự đang nghĩ. Không có câu trả lời đúng hay sai.
                        </label>
                        <textarea
                          id="tarot-concern"
                          rows={4}
                          value={userConcern}
                          onChange={(e) => setUserConcern(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleConfirmStartReading();
                            }
                          }}
                          className="w-full px-4 py-3.5 bg-[#141217] border border-[#2E271F] rounded-xl text-base text-[#EEE6D8] focus:outline-none focus:border-[#C9A85C] focus:shadow-[0_0_25px_rgba(201,168,92,0.2)] font-body transition-all leading-relaxed resize-none"
                          autoFocus
                        />
                      </div>

                      {/* Hàng nút bấm */}
                      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={handleResetToHome}
                            className="text-xs text-[#8C7A65] hover:text-[#C9A85C] underline-offset-4 hover:underline cursor-pointer transition-colors"
                          >
                            ← Trở về
                          </button>
                          <span className="text-[#3A2F22]">|</span>
                          <div className="flex items-center gap-2 text-xs font-body text-[#8C7A65]">
                            <span>Kiểu trải:</span>
                            <button
                              type="button"
                              onClick={() => setSpread(spread === 'three_cards' ? 'daily' : 'three_cards')}
                              className="text-[#C9A85C] hover:underline underline-offset-4 cursor-pointer"
                            >
                              {spread === 'three_cards' ? '3 lá (Khuyên dùng)' : '1 lá'}
                            </button>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={handleConfirmStartReading}
                          className="w-full sm:w-auto px-8 py-3.5 bg-white hover:bg-[#C9A85C] text-[#14100D] font-medium text-xs rounded-sm transition-all shadow-[0_2px_15px_rgba(255,255,255,0.15)] hover:shadow-[0_4px_25px_rgba(201,168,92,0.4)] flex items-center justify-center gap-2 group cursor-pointer"
                        >
                          <span className="text-[#936D42] group-hover:text-[#14100D] transition-colors text-xs">✦</span>
                          <span className="tracking-wider uppercase font-body font-semibold">
                            Bắt đầu bói bài
                          </span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ================= BÀN TRẢI BÀI TRÊN TRANG (KHI CHƯA MỞ HỘP THOẠI) ================= */}
        {step === 'config' && (
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-4xl mx-auto text-center py-3 sm:py-14 space-y-4 sm:space-y-6"
          >
            <div className="space-y-3">
              <span className="text-xs uppercase tracking-[0.25em] text-[#C9A85C] font-heading block">
                ✦ Khoảng lặng chiêm nghiệm ✦
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-normal text-[#C9A85C] uppercase tracking-[0.05em] leading-[1.2]">
                Lắng lòng và bắt đầu trải bài
              </h2>
              <p className="text-[16px] leading-[1.7] text-[#BDB4A8] max-w-lg mx-auto font-body">
                Dừng lại một chút giữa bộn bề, gửi gắm nỗi niềm của bạn và đón nhận thông điệp sâu sắc từ 78 lá bài Tarot.
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleOpenDialogue}
                className="px-10 py-3.5 bg-white hover:bg-[#C9A85C] text-[#14100D] font-medium text-sm rounded-sm transition-all shadow-[0_4px_25px_rgba(255,255,255,0.2)] hover:shadow-[0_6px_30px_rgba(201,168,92,0.45)] hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 group mx-auto cursor-pointer"
              >
                <span className="text-[#936D42] group-hover:text-[#14100D] transition-colors text-xs">✦</span>
                <span className="tracking-wider uppercase font-body font-semibold">Bắt đầu trải bài</span>
              </button>
            </div>
          </motion.div>
        )}

        {/* ================= STAGE 2A: HIỆU ỨNG XÀO BÀI (SHUFFLING) ================= */}
        {step === 'shuffling' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center min-h-[460px] space-y-6 py-6"
          >
            <div className="text-center space-y-2">
              <span className="text-xs uppercase tracking-[0.25em] text-[#C9A85C] font-heading block animate-pulse">
                ✦ ĐANG XÀO BÀI THEO NĂNG LƯỢNG VŨ TRỤ ✦
              </span>
              <h3 className="text-2xl sm:text-3xl font-heading text-[#EEE6D8] font-normal">
                Lắng lại tâm trí và hít thở thật sâu...
              </h3>
            </div>

            {/* GSAP Virtual Shuffling Deck */}
            <div className="relative w-72 h-64 sm:w-96 sm:h-76 flex items-center justify-center my-6 overflow-visible">
              {/* Sacred glowing aura around deck */}
              <div className="absolute inset-0 rounded-2xl bg-[radial-gradient(circle,rgba(201,168,92,0.25),transparent_70%)] animate-pulse pointer-events-none" />

              {proxyCards.map((_, i) => {
                const chaos = CHAOS_LAYOUT[i % CHAOS_LAYOUT.length];
                return (
                  <div
                    key={i}
                    ref={(el) => { cardProxyRefs.current[i] = el; }}
                    className="absolute w-34 h-50 sm:w-40 sm:h-60 rounded-xl border border-[#7C6339] overflow-hidden shadow-2xl bg-[#0F0E14] will-change-transform"
                    style={{
                      zIndex: i,
                      transform: `translate3d(${chaos.x}px, ${chaos.y}px, 0px) rotate(${chaos.r}deg)`
                    }}
                  >
                    <img
                      src={currentBackCard}
                      alt="Lá bài xào"
                      className="w-full h-full object-cover select-none pointer-events-none"
                    />
                    <div className="absolute inset-0 border border-[#C9A85C]/40 rounded-xl pointer-events-none" />
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* ================= STAGE 2B: QUY TRÌNH BUNG QUẠT BÀI & BỐC 3 LÁ ================= */}
        {step === 'picking' && (
          <div id="tarot-picking-board" className="relative w-full flex flex-col items-center justify-center space-y-3 sm:space-y-6 animate-fade-in py-1">
            {/* Vầng hào quang bàn trải bài thiêng liêng (Sacred Altar Aura) */}
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_70%_60%_at_50%_60%,rgba(201,168,92,0.07),rgba(0,0,0,0))] -z-10" />

            {/* Thanh điều hướng quay lại & trạng thái */}
            <div className="w-full flex items-center justify-between pb-0.5 max-w-4xl px-2 z-20">
              <button
                type="button"
                onClick={handleResetToHome}
                className="inline-flex items-center gap-2 text-xs font-heading text-[#A89882] hover:text-[#C9A85C] border border-[#33281D] hover:border-[#C9A85C]/60 bg-[#120F16]/90 px-3.5 py-1.5 rounded-full transition-colors cursor-pointer shadow-md"
              >
                <span>←</span>
                <span>Trở về trang chủ</span>
              </button>
              <span className="text-[11px] font-mono text-[#7A6A55] tracking-wider uppercase hidden sm:inline">
                ✦ Trải bài: {topic === 'love' ? 'Tình cảm' : topic === 'career' ? 'Sự nghiệp' : 'Tổng quan'} ({spread === 'three_cards' ? '3 lá' : '1 lá'})
              </span>
            </div>

            {/* Tiêu đề sảnh bốc bài */}
            <div id="picking-title-area" className="text-center space-y-1">
              <h2 className="text-xl sm:text-3xl md:text-4xl font-heading font-normal text-[#C9A85C] uppercase tracking-[0.05em] leading-tight">
                Hãy chọn {requiredCount} lá bài bạn cảm thấy thu hút nhất
              </h2>
              <div className="min-h-[20px] flex items-center justify-center">
                <p className="text-xs sm:text-base text-[#BDB4A8] font-body transition-opacity duration-500">
                  Đã chọn: <span className="text-[#C9A85C] font-semibold">{selectedSlotIds.length}</span> / {requiredCount} lá · Bấm vào từng lá bài để rút lên ô
                </p>
              </div>
            </div>

            {/* ================= 3 Ô MỤC TIÊU (NÉT LIỀN HOÀN TOÀN, VIỀN KÉP ÁNH KIM SANG TRỌNG) ================= */}
            <div
              ref={targetSlotsContainerRef}
              className="flex items-center justify-center gap-2 sm:gap-5 py-1 sm:py-2 will-change-transform"
            >
              {Array.from({ length: requiredCount }).map((_, idx) => {
                const isPicked = selectedSlotIds.length > idx;
                return (
                  <div
                    key={idx}
                    ref={(el) => { slotTargetRefs.current[idx] = el; }}
                    className={`relative w-[92px] sm:w-30 md:w-34 h-[126px] sm:h-44 md:h-50 rounded-xl transition-all duration-500 flex flex-col items-center justify-center overflow-hidden ${isPicked
                        ? 'border border-[#C9A85C] bg-[#121016] shadow-[0_0_25px_rgba(201,168,92,0.4)]'
                        : 'border border-[#5A4732] bg-[#0E0C10]/85 shadow-[inset_0_0_20px_rgba(0,0,0,0.8)]'
                      }`}
                  >
                    {!isPicked && (
                      <div className="flex flex-col items-center justify-center p-1.5 sm:p-3 text-center space-y-1 sm:space-y-2 w-full h-full select-none">
                        {/* Viền trang trí kép bên trong - hoàn toàn liền nét */}
                        <div className="absolute inset-1.5 sm:inset-2 border border-[#C9A85C]/20 rounded-lg pointer-events-none" />
                        <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border border-[#7C6339] bg-[#181410] flex items-center justify-center text-[10px] sm:text-xs text-[#C9A85C] font-heading font-medium">
                          {idx + 1}
                        </div>
                        <span className="text-[9px] sm:text-xs text-[#E0D2C0] font-heading uppercase tracking-wide px-0.5 text-center leading-tight">
                          {idx === 0 ? 'Hiện tại' : idx === 1 ? 'Cần chú ý' : 'Hành động'}
                        </span>
                        <div className="w-6 sm:w-8 h-[1px] bg-[#5A4732]" />
                        <span className="text-[8px] sm:text-[10px] text-[#8C7A65] font-body">
                          {idx === 0 ? 'Năng lượng' : idx === 1 ? 'Thử thách' : 'Lời khuyên'}
                        </span>
                      </div>
                    )}
                    {isPicked && (
                      <div className="w-full h-full relative">
                        <img
                          src={currentBackCard}
                          alt="Lá đã chọn"
                          className="w-full h-full object-cover select-none"
                        />
                        <div className="absolute inset-0 border border-[#C9A85C]/70 rounded-xl pointer-events-none" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* ================= QUẠT BÀI CĂN GIỮA CHUẨN XÁC, XÒE CÁNH CUNG TUYỆT ĐẸP ================= */}
            <div
              key={`fan-board-${readingId || 'active'}`}
              ref={fanContainerRef}
              className="relative w-full max-w-4xl h-44 sm:h-80 md:h-92 flex items-center justify-center px-1 sm:px-4 overflow-visible mt-1 sm:mt-6 will-change-transform"
            >
              <div className="relative w-full h-full flex items-center justify-center">
                {fanCards.map((slot, index) => {
                  const total = fanCards.length;
                  const isSelected = selectedSlotIds.includes(slot.slot_id) || flyingSlotIds.includes(slot.slot_id);
                  // Chỉ cho phép tương tác/hover khi quạt đã chia xong, chưa đủ 3 lá và không có lá nào đang bay
                  const isFanInteractive =
                    fanDealt &&
                    !isSelectingRef.current &&
                    !isZoomingIn &&
                    selectedSlotIds.length < requiredCount;
                  const isHovered = isFanInteractive && hoveredCardIndex === index && !isSelected;
                  const maxAngle = isMobile ? 36 : 54;
                  const stepAngle = maxAngle / (total - 1);
                  const angle = -maxAngle / 2 + index * stepAngle;
                  const normalized = (index - (total - 1) / 2) / ((total - 1) / 2);
                  const arcHeight = isMobile ? 10 : 26;
                  const offsetY = Math.pow(normalized, 2) * arcHeight;
                  const spacing = isMobile ? 11 : 28;
                  const offsetX = (index - (total - 1) / 2) * spacing;

                  return (
                    <motion.div
                      key={slot.slot_id}
                      ref={(el) => { fanCardRefs.current[index] = el; }}
                      onClick={() => {
                        if (isSelectingRef.current || isZoomingIn || isSelected || !fanDealt) return;
                        if (selectedSlotIds.length >= requiredCount) return;
                        handleSelectSlot(slot.slot_id, index);
                      }}
                      // Sự kiện chuột chỉ kích hoạt một lần khi di chuyển vào lá bài mới, không spam onMouseMove
                      onMouseEnter={() => {
                        if (isSelectingRef.current || isZoomingIn || isSelected || !fanDealt) return;
                        if (selectedSlotIds.length >= requiredCount) return;
                        handleCardHover(index);
                      }}
                      onMouseLeave={() => {
                        setHoveredCardIndex((prev) => (prev === index ? null : prev));
                      }}
                      initial={{ x: 0, y: isMobile ? 25 : 50, rotate: 0, opacity: 0 }}
                      animate={{
                        x: offsetX,
                        y: offsetY, // Khung neo giữ nguyên tọa độ, chống tuyệt đối việc tụt chuột khỏi mép dưới
                        rotate: angle,
                        opacity: isSelected ? 0 : 1
                      }}
                      whileTap={{ scale: 0.96 }}
                      transition={
                        fanDealt
                          ? {
                            type: 'tween',
                            duration: 0.16,
                            ease: 'easeOut',
                            delay: 0
                          }
                          : {
                            duration: isMobile ? 0.9 : 1.1,
                            ease: [0.22, 1, 0.36, 1],
                            delay: index * (isMobile ? 0.05 : 0.065)
                          }
                      }
                      className={`absolute will-change-transform cursor-pointer select-none ${
                        isSelected || !isFanInteractive ? 'pointer-events-none' : ''
                      }`}
                      style={{
                        zIndex: index + 10,
                        transformOrigin: 'bottom center'
                      }}
                    >
                      {/* Vùng nhận diện chuột chỉ mở rộng nhẹ phía trên để bắt đầu nhô của lá bài */}
                      <div className="absolute -top-7 inset-x-0 bottom-0 pointer-events-auto" />

                      {/* Nhấc vừa vặn theo khe quạt bài (-14px trên mobile / -25px trên desktop) */}
                      <motion.div
                        data-fan-card-inner="true"
                        animate={{
                          y: isHovered ? (isMobile ? -14 : -25) : 0
                        }}
                        transition={{
                          type: 'spring',
                          stiffness: 450,
                          damping: 32
                        }}
                        className={`w-[70px] sm:w-30 md:w-36 h-[110px] sm:h-46 md:h-56 rounded-lg sm:rounded-xl border bg-[#0C0B0E] overflow-hidden shadow-2xl transition-colors duration-150 relative ${
                          isHovered ? 'border-[#C9A85C]' : 'border-[#7C6339]'
                        }`}
                      >
                        <img
                          src={currentBackCard}
                          alt="Lá bài úp"
                          className={`w-full h-full object-cover select-none pointer-events-none transition-all duration-150 ${
                            isHovered ? 'brightness-105' : 'brightness-95'
                          }`}
                        />
                        <div
                          className={`absolute inset-0 border rounded-xl pointer-events-none transition-colors duration-150 ${
                            isHovered ? 'border-[#C9A85C]/80' : 'border-[#C9A85C]/20'
                          }`}
                        />
                      </motion.div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ================= STAGE 3: MÀN HÌNH KẾT QUẢ RIÊNG BIỆT ================= */}
        {step === 'drawn' && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-[#080708] text-[#EEE6D8] animate-fade-in selection:bg-[#C9A85C]/30 selection:text-[#EEE6D8]">
            {/* Header bar cố định của màn hình kết quả riêng */}
            <header className="sticky top-0 z-40 w-full bg-[#080708]/95 backdrop-blur-md border-b border-[#2A231C]">
              <div className="max-w-4xl sm:max-w-5xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleResetToHome}
                  className="flex items-center gap-3 group cursor-pointer text-left"
                >
                  <img
                    src="/logo/logo_icon.png"
                    alt="Logo Trạm Tarot"
                    className="h-10 sm:h-11 w-auto object-contain group-hover:scale-105 transition-transform drop-shadow-[0_0_10px_rgba(201,168,92,0.3)]"
                  />
                  <span className="font-heading tracking-[0.05em] text-xl font-normal text-[#EEE6D8] group-hover:text-[#C9A85C] transition-colors">
                    Trạm Tarot
                  </span>
                  <span className="text-[#C9A85C] text-sm">✦</span>
                  <span className="text-xs text-[#8C7A65] font-body ml-2 hidden sm:inline">
                    Kết quả trải bài
                  </span>
                </button>

                <div className="flex items-center gap-2.5 sm:gap-3">
                  <button
                    type="button"
                    onClick={handleResetToHome}
                    className="px-3 sm:px-3.5 py-2 border border-[#3A3022] hover:border-[#C9A85C] text-[#BDB4A8] hover:text-[#EEE6D8] font-body text-xs rounded transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <span>←</span>
                    <span className="hidden sm:inline">Trở về</span>
                    <span>Trang chủ</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveReading}
                    className="px-3.5 sm:px-4 py-2 bg-[#C9A85C] hover:bg-[#D8B96E] text-[#14100D] font-body font-medium text-xs rounded transition-all flex items-center gap-1.5 cursor-pointer shadow-[0_2px_12px_rgba(201,168,92,0.3)]"
                  >
                    <span>✦</span>
                    <span>{savedToast ? 'Đã lưu' : 'Lưu trải bài'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setStep('config');
                      handleOpenDialogue();
                    }}
                    className="px-3.5 sm:px-4 py-2 border border-[#3A3022] hover:border-[#C9A85C] text-[#BDB4A8] hover:text-[#EEE6D8] font-body text-xs rounded transition-colors cursor-pointer"
                  >
                    Trải bài mới
                  </button>
                </div>
              </div>
            </header>

            {/* Nội dung màn hình kết quả: Câu hỏi → Ba lá bài → Tổng quan → Phân tích từng lá → Hai bước gợi ý → Lưu trải bài */}
            <main className="max-w-4xl sm:max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-12 pb-28 text-left">
              {/* 1. CÂU HỎI */}
              <motion.div
                initial={{ opacity: 0, y: -16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15, ease: 'easeOut' }}
                className="text-center space-y-2 border-b border-[#261E18] pb-8"
              >
                <span className="text-xs uppercase tracking-[0.25em] text-[#C9A85C] font-heading block">
                  Câu hỏi của bạn
                </span>
                <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl text-[#EEE6D8] font-normal italic leading-snug">
                  &ldquo;{question || 'Thông điệp định hướng cho bạn lúc này'}&rdquo;
                </h2>
              </motion.div>

              {/* 2. BA LÁ BÀI (TRẢI NGHIỆM LẬT BÀI 3D TO RÕ RÀNG, TIẾP NỐI ZOOM MƯỢT MÀ KHÔNG GIẬT) */}
              <motion.div
                initial={{ opacity: 0.65, scale: 0.91 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-6"
              >
                <div
                  className={`grid gap-8 sm:gap-10 md:gap-12 justify-center items-start ${spread === 'daily'
                      ? 'grid-cols-1 max-w-sm mx-auto'
                      : 'grid-cols-1 sm:grid-cols-3 max-w-4xl sm:max-w-5xl mx-auto'
                    }`}
                >
                  {drawnCards.map((dc, idx) => (
                    <div key={dc.card_id} className="flex flex-col items-center w-full">
                      <Card3D
                        cardId={dc.card_id}
                        imageSrc={dc.card.image}
                        nameEn={dc.card.name}
                        backImage={currentBackCard}
                        orientation={dc.orientation}
                        positionName={getPositionDisplay(idx)}
                        isFlipped={Boolean(flippedCards[idx])}
                        onFlip={() => handleFlipCard(idx)}
                        priority
                        className="w-full max-w-[260px] sm:max-w-[280px]"
                      />
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Kiểm tra điều kiện mở đủ các lá bài:
                  - 3 lá đối với trải 3 lá (hoặc 1 lá đối với trải hàng ngày)
                  - Lật mở xong rồi lật úp lại vẫn tính là đã mở */}
              {(() => {
                const targetCardsCount = spread === 'daily' ? 1 : 3;
                const allCardsRevealed = drawnCards.length > 0 && revealedCardIndexes.length >= Math.min(targetCardsCount, drawnCards.length);

                return (
                  <>
                    {/* Hướng dẫn khi chưa mở đủ các lá bài: 1 dòng chú thích ngắn gọn */}
                    {!allCardsRevealed && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="pt-6 pb-2 text-center"
                      >
                        <p className="text-xs sm:text-sm text-[#C9A85C] font-heading tracking-wider">
                          ✦ {spread === 'daily'
                            ? `Lật mở lá bài để xem lời luận giải chi tiết (${revealedCardIndexes.length}/1 lá)`
                            : `Lật mở cả 3 lá bài để xem lời luận giải chi tiết (${revealedCardIndexes.length}/3 lá)`} ✦
                        </p>
                      </motion.div>
                    )}

                    {/* Trạng thái đang tải AI khi đã mở đủ bài */}
                    {allCardsRevealed && readingStatus === 'generating' && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="py-14 text-center space-y-3.5 border-t border-[#261E18]"
                      >
                        <div className="w-9 h-9 border-2 border-[#C9A85C] border-t-transparent rounded-full animate-spin mx-auto" />
                        <p className="text-base text-[#C9A85C] font-body">
                          Đang lắng đọng và kết nối ý nghĩa các lá bài với câu hỏi của bạn...
                        </p>
                      </motion.div>
                    )}

                    {/* Lỗi AI khi đã mở đủ bài */}
                    {allCardsRevealed && readingStatus === 'failed' && (
                      <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-5 rounded-xl bg-[#241515] border border-[#5C2323] text-center space-y-2"
                      >
                        <p className="text-sm text-[#E8A5A5] font-body">{readingError || 'Tạm thời chưa thể tạo bản luận giải.'}</p>
                        <button
                          type="button"
                          onClick={() => fetchInterpretation(readingId!)}
                          className="px-5 py-2 bg-[#C9A85C] text-[#14100D] font-medium text-xs rounded font-body cursor-pointer"
                        >
                          Thử lại
                        </button>
                      </motion.div>
                    )}

                    {/* NỘI DUNG LUẬN GIẢI CHI TIẾT (Chỉ hiển thị khi đã mở đủ tất cả lá bài, có animation khi lướt xem) */}
                    {allCardsRevealed && (readingStatus === 'completed' || aiResult) && (
                      <div className="space-y-12">
                        {/* 3. TỔNG QUAN (GÓC NHÌN TỔNG THỂ) - Animation mượt mà */}
                        <motion.div
                          initial={{ opacity: 0, y: 35 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true, margin: '-50px' }}
                          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                          className="space-y-4 border-t border-[#261E18] pt-10 text-left"
                        >
                          <div className="space-y-2">
                            <span className="text-xs uppercase tracking-[0.2em] text-[#C9A85C] font-heading block">
                              Góc nhìn tổng thể
                            </span>
                            <h3 className="font-heading text-3xl sm:text-4xl text-[#EEE6D8] font-normal leading-snug">
                              {aiResult?.headline || 'Chiêm nghiệm và thấu hiểu hoàn cảnh'}
                            </h3>
                          </div>

                          {aiResult?.summary && (
                            <p className="text-[18px] text-[#BDB4A8] font-body leading-[1.8]">
                              {aiResult.summary}
                            </p>
                          )}
                        </motion.div>

                        {/* 4. PHÂN TÍCH TỪNG LÁ - Animation staggered theo từng lá */}
                        <div className="space-y-8 pt-2 text-left">
                          {drawnCards.map((dc, idx) => {
                            const cr = aiResult?.card_readings?.find((r) => r.card_id === dc.card_id);
                            return (
                              <motion.div
                                key={dc.card_id}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: '-40px' }}
                                transition={{ duration: 0.65, delay: idx * 0.12, ease: [0.22, 1, 0.36, 1] }}
                                className="flex flex-col sm:flex-row items-start gap-5 sm:gap-6 p-5 sm:p-6 rounded-2xl bg-[#120F16]/60 border border-[#2B231B] hover:border-[#C9A85C]/50 transition-all duration-300"
                              >
                                {/* Ảnh thumbnail lá bài bên trái */}
                                <div className="w-24 sm:w-28 shrink-0 aspect-[2/3] relative rounded-lg overflow-hidden border border-[#52412E] shadow-md bg-[#0C0B0E]">
                                  <img
                                    src={dc.card.image}
                                    alt={dc.card.name}
                                    className={`w-full h-full object-cover ${dc.orientation === 'reversed' ? 'rotate-180' : ''}`}
                                  />
                                </div>

                                {/* Vị trí · Tên lá + Đoạn văn phân tích bên phải */}
                                <div className="space-y-2 flex-1">
                                  <h4 className="font-heading text-2xl sm:text-[26px] text-[#EEE6D8] font-normal leading-snug">
                                    <span className="text-[#CA9D75]">{getPositionDisplay(idx)}</span>
                                    {' · '}
                                    <span>{dc.card.name}</span>
                                  </h4>
                                  <p className="text-[18px] text-[#BDB4A8] font-body leading-[1.75]">
                                    {cr?.interpretation || dc.resolved_meaning.primary_text}
                                  </p>
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>

                        {/* 4.5. MỐI LIÊN KẾT GIỮA CÁC QUÂN BÀI (DÒNG CHẢY KẾT NỐI NĂNG LƯỢNG) */}
                        {aiResult?.synthesis && (
                          <motion.div
                            initial={{ opacity: 0, y: 35 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-40px' }}
                            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                            className="p-6 sm:p-8 rounded-2xl bg-[#14101A]/85 border border-[#3E2F20] shadow-[0_10px_35px_rgba(0,0,0,0.5)] space-y-3.5 text-left"
                          >
                            <div className="flex items-center gap-2.5">
                              <span className="text-[#C9A85C] text-base">✦</span>
                              <span className="text-xs uppercase tracking-[0.2em] text-[#C9A85C] font-heading font-medium">
                                Mối liên kết giữa các quân bài
                              </span>
                            </div>
                            <h4 className="font-heading text-2xl sm:text-[26px] text-[#EEE6D8] font-normal leading-snug">
                              Dòng chảy năng lượng & Sự tương tác
                            </h4>
                            <p className="text-[18px] text-[#DDD0BE] font-body leading-[1.8]">
                              {aiResult.synthesis}
                            </p>
                          </motion.div>
                        )}

                        {/* 5. HAI BƯỚC GỢI Ý - Animation khi lướt tới */}
                        {aiResult?.actions && aiResult.actions.length > 0 && (
                          <motion.div
                            initial={{ opacity: 0, y: 35 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-50px' }}
                            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                            className="p-6 sm:p-8 rounded-2xl bg-[#1C1712] border border-[#4A3824] shadow-[0_12px_40px_rgba(0,0,0,0.6)] space-y-5 text-left"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-[#C9A85C] text-xl">🌿</span>
                              <h3 className="font-heading text-2xl text-[#E8D4B0] font-normal">
                                Hai điều bạn có thể thử
                              </h3>
                            </div>

                            <div className="space-y-4 pt-1">
                              {aiResult.actions.slice(0, 2).map((act, index) => (
                                <div key={index} className="flex items-start gap-4">
                                  <span className="w-7 h-7 rounded-full bg-[#332519] border border-[#5C452E] text-[#D4B58A] flex items-center justify-center text-sm font-semibold shrink-0 mt-0.5">
                                    {index + 1}
                                  </span>
                                  <p className="text-[17px] sm:text-[18px] text-[#DDD0BE] font-body leading-[1.75]">
                                    {act}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}

                        {/* 6. CÂU HỎI SUY NGẪM (NẾU CÓ) */}
                        {aiResult?.reflection_question && (
                          <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-40px' }}
                            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                            className="p-6 sm:p-7 rounded-2xl bg-[#14101A] border-l-2 border-[#C9A85C] border-y border-r border-[#2A2030] text-left space-y-2"
                          >
                            <span className="text-xs uppercase tracking-widest text-[#C9A85C] font-heading block">
                              Câu hỏi suy ngẫm
                            </span>
                            <p className="text-[17px] text-[#EEE6D8] font-body italic leading-relaxed">
                              &ldquo;{aiResult.reflection_question}&rdquo;
                            </p>
                          </motion.div>
                        )}

                        {/* 7. LƯU TRẢI BÀI & TRẢI BÀI MỚI */}
                        <motion.div
                          initial={{ opacity: 0, y: 25 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true, margin: '-30px' }}
                          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                          className="pt-8 flex flex-wrap items-center justify-center gap-4 border-t border-[#261E18]"
                        >
                          <button
                            type="button"
                            onClick={handleSaveReading}
                            className="px-8 py-3.5 bg-[#C9A85C] hover:bg-[#D8B96E] text-[#14100D] font-body font-medium text-sm rounded-sm transition-all shadow-[0_4px_20px_rgba(201,168,92,0.35)] flex items-center gap-2 cursor-pointer"
                          >
                            <span>✦</span>
                            <span>{savedToast ? 'Đã lưu trải bài!' : 'Lưu trải bài'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setStep('config');
                              handleOpenDialogue();
                            }}
                            className="px-7 py-3.5 border border-[#3A3022] hover:border-[#C9A85C] text-[#EEE6D8] font-body text-sm rounded-sm transition-colors cursor-pointer"
                          >
                            Trải bài mới
                          </button>
                          <button
                            type="button"
                            onClick={handleResetToHome}
                            className="px-7 py-3.5 border border-[#3A3022] hover:border-[#C9A85C] text-[#BDB4A8] hover:text-[#EEE6D8] font-body text-sm rounded-sm transition-colors cursor-pointer"
                          >
                            ← Trở về trang chủ
                          </button>
                        </motion.div>
                      </div>
                    )}
                  </>
                );
              })()}
            </main>

            {/* Toast thông báo lưu thành công */}
            {savedToast && (
              <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-full bg-[#C9A85C] text-[#14100D] font-medium text-sm shadow-[0_10px_35px_rgba(0,0,0,0.85)] animate-fade-in flex items-center gap-2">
                <span>✦</span>
                <span>Đã sao chép nội dung trải bài để bạn lưu lại!</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
