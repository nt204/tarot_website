'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { TarotCard } from '@/types/tarot';

interface CardCatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartReading?: () => void;
  initialCardId?: number | null;
}

export const CardCatalogModal: React.FC<CardCatalogModalProps> = ({
  isOpen,
  onClose,
  onStartReading,
  initialCardId
}) => {
  const [cards, setCards] = useState<TarotCard[]>([]);
  const [filter, setFilter] = useState<'all' | 'major' | 'wands' | 'cups' | 'swords' | 'pentacles'>('all');
  const [search, setSearch] = useState('');
  const [selectedCard, setSelectedCard] = useState<TarotCard | null>(null);

  useEffect(() => {
    if (isOpen && cards.length === 0) {
      fetch('/api/cards')
        .then((res) => res.json())
        .then((data) => {
          if (data.cards) {
            setCards(data.cards);
            if (initialCardId !== undefined && initialCardId !== null) {
              const target = data.cards.find((c: TarotCard) => c.id === initialCardId);
              if (target) setSelectedCard(target);
            }
          }
        })
        .catch((e) => console.error('Failed to load cards catalog:', e));
    }
  }, [isOpen, cards.length, initialCardId]);

  if (!isOpen) return null;

  const filtered = cards.filter((c) => {
    if (filter === 'major' && c.arcana !== 'major') return false;
    if (filter !== 'all' && filter !== 'major' && c.suit !== filter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = c.name.toLowerCase().includes(q) || c.name_vi.toLowerCase().includes(q);
      const matchKw = (c.keywords_upright_vi || []).some((k) => k.toLowerCase().includes(q));
      return matchName || matchKw;
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 md:p-8 bg-black/85 backdrop-blur-md overflow-y-auto">
      {selectedCard ? (() => {
        const currentIndex = cards.findIndex((c) => c.id === selectedCard.id);
        const prevCard = currentIndex > 0 ? cards[currentIndex - 1] : cards[cards.length - 1];
        const nextCard = currentIndex < cards.length - 1 ? cards[currentIndex + 1] : cards[0];

        return (
          <div className="relative w-full max-w-4xl max-h-[88vh] md:h-[620px] my-auto bg-[#0E0D11] border border-[#3A3226] rounded-2xl shadow-2xl flex flex-col md:flex-row gap-3.5 md:gap-6 p-3.5 sm:p-6 z-20 animate-fade-in text-left text-[#EEE6D8] overflow-hidden">
            {/* Nút đóng */}
            <button
              onClick={() => setSelectedCard(null)}
              aria-label="Đóng chi tiết lá bài"
              className="absolute top-3 right-3 sm:top-4 sm:right-4 w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-[#18141D] border border-[#3A2E20] text-[#BDB4A8] hover:text-[#EEE6D8] hover:border-[#C9A85C] flex items-center justify-center cursor-pointer transition-colors z-30 text-xs sm:text-base"
            >
              ✕
            </button>

            {/* Khối hình ảnh lá bài & thông số: Trên mobile xếp cạnh nhau (flex-row), trên desktop xếp dọc (md:flex-col) */}
            <div className="shrink-0 flex flex-row md:flex-col items-center gap-3 md:gap-2.5 w-full md:max-w-[220px] pb-3 md:pb-0 border-b md:border-b-0 border-[#251D15]">
              {/* Hình ảnh lá bài */}
              <div className="w-[100px] sm:w-28 md:w-44 aspect-[3/5] relative rounded-xl overflow-hidden border border-[#5A462E] shadow-xl bg-[#080709] shrink-0">
                <Image
                  src={selectedCard.image.startsWith('/') ? selectedCard.image : `/${selectedCard.image}`}
                  alt={selectedCard.name}
                  fill
                  sizes="(max-width: 640px) 110px, 176px"
                  className="object-contain"
                  priority
                />
              </div>

              {/* Cột thông số & điều hướng nằm bên cạnh ảnh trên mobile */}
              <div className="flex-1 md:w-full flex flex-col gap-1.5 justify-center min-w-0">
                {/* Điều hướng lá bài */}
                <div className="flex items-center justify-between w-full text-xs font-heading text-[#8C7A65] shrink-0">
                  <button
                    type="button"
                    onClick={() => prevCard && setSelectedCard(prevCard)}
                    className="px-2 py-0.5 rounded border border-[#33281D] hover:border-[#C9A85C] hover:text-[#C9A85C] transition-colors cursor-pointer text-[10px] sm:text-[11px]"
                  >
                    ← Lá trước
                  </button>
                  <span className="font-mono text-[10px] sm:text-[11px] text-[#A89882]">
                    #{selectedCard.id} / {cards.length}
                  </span>
                  <button
                    type="button"
                    onClick={() => nextCard && setSelectedCard(nextCard)}
                    className="px-2 py-0.5 rounded border border-[#33281D] hover:border-[#C9A85C] hover:text-[#C9A85C] transition-colors cursor-pointer text-[10px] sm:text-[11px]"
                  >
                    Lá tiếp →
                  </button>
                </div>

                <div className="text-[10px] sm:text-[11px] font-mono text-[#8C7A65] text-center bg-[#141018]/80 px-2 py-0.5 rounded border border-[#2E2419] w-full shrink-0 truncate">
                  {selectedCard.arcana === 'major' ? 'Bộ Ẩn Chính (Major Arcana)' : 'Bộ Ẩn Phụ (Minor Arcana)'}
                </div>

                {/* Khối chú thích các thông số rộng rãi, thoáng chữ */}
                <div className="w-full p-2 sm:p-2.5 rounded-xl bg-[#130F17]/90 border border-[#2A2118] text-[10.5px] sm:text-[11px] text-[#A89882] space-y-1 font-body shrink-0">
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                    {selectedCard.element && (
                      <div className="truncate">
                        <span className="text-[#C9A85C] font-medium mr-1">Nguyên tố:</span>
                        <span className="text-[#EEE6D8] font-medium">{selectedCard.element}</span>
                      </div>
                    )}
                    {selectedCard.zodiac && (
                      <div className="truncate">
                        <span className="text-[#C9A85C] font-medium mr-1">Cung:</span>
                        <span className="text-[#EEE6D8] font-medium">{selectedCard.zodiac}</span>
                      </div>
                    )}
                    {selectedCard.planet && (
                      <div className="truncate">
                        <span className="text-[#C9A85C] font-medium mr-1">Hành tinh:</span>
                        <span className="text-[#EEE6D8] font-medium">{selectedCard.planet}</span>
                      </div>
                    )}
                    {selectedCard.number_numerology !== undefined && (
                      <div className="truncate">
                        <span className="text-[#C9A85C] font-medium mr-1">Thần số:</span>
                        <span className="text-[#EEE6D8] font-medium">Số {selectedCard.number_numerology}</span>
                      </div>
                    )}
                  </div>

                  {selectedCard.yes_no && (
                    <div className="border-t border-[#221B14] pt-1 leading-snug">
                      <span className="text-[#C9A85C] font-medium mr-1">Câu trả lời:</span>
                      <span className="text-[#E0D2C0]">
                        {selectedCard.yes_no === 'yes' ? 'Có (Thuận lợi)' : selectedCard.yes_no === 'no' ? 'Chưa phù hợp' : 'Cởi mở / Tùy duyên'}
                      </span>
                    </div>
                  )}

                  {(selectedCard.mood_vi || selectedCard.mood) && (
                    <div className="border-t border-[#221B14] pt-1 leading-snug truncate">
                      <span className="text-[#C9A85C] font-medium mr-1">Tần số cảm xúc:</span>
                      <span className="text-[#D4C8B8]">{selectedCard.mood_vi || selectedCard.mood}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Cột phải: Khung nội dung cuộn linh hoạt và nút bấm luôn neo ở chân */}
            <div className="flex-1 flex flex-col min-h-0 justify-between font-body text-[#EEE6D8]">
              {/* Vùng nội dung có thanh cuộn riêng biệt */}
              <div className="flex-1 overflow-y-auto pr-1 sm:pr-2 space-y-3.5">
                {/* Header */}
                <div>
                  <span className="text-xs uppercase tracking-wider text-[#C9A85C] font-heading block">
                    {selectedCard.arcana === 'major' ? 'Bộ Ẩn Chính' : `${selectedCard.suit_vi} (${selectedCard.suit})`}
                  </span>
                  <h3 className="font-heading text-2xl sm:text-3xl font-normal text-[#C9A85C] uppercase tracking-[0.05em] leading-snug mt-0.5">
                    {selectedCard.name}
                  </h3>
                  <p className="text-sm sm:text-base text-[#BDB4A8] italic font-body mt-0.5">
                    {selectedCard.name_vi}
                  </p>
                </div>

                {/* Từ khóa */}
                {(selectedCard.keywords_upright_vi || selectedCard.keywords_upright) && (
                  <div className="text-xs text-[#BDB4A8] leading-relaxed pt-0.5">
                    <span className="text-[#C9A85C] font-medium mr-2">Từ khóa xuôi:</span>
                    <span className="text-[#D8C7B0]">
                      {(selectedCard.keywords_upright_vi || selectedCard.keywords_upright || []).join(' · ')}
                    </span>
                  </div>
                )}
                {(selectedCard.keywords_reversed_vi || selectedCard.keywords_reversed) && (
                  <div className="text-xs text-[#BDB4A8] leading-relaxed">
                    <span className="text-[#C9A85C] font-medium mr-2">Từ khóa ngược:</span>
                    <span className="text-[#D8C7B0]">
                      {(selectedCard.keywords_reversed_vi || selectedCard.keywords_reversed || []).join(' · ')}
                    </span>
                  </div>
                )}

                {/* Đường kẻ mỏng tinh tế */}
                <div className="w-full h-[1px] bg-[#2A231C]" />

                {/* Ý nghĩa chi tiết dạng đoạn văn thanh lịch */}
                <div className="space-y-2.5 text-[13.5px] sm:text-[14px] leading-[1.65] text-[#D4C8B8]">
                  <p>
                    <strong className="text-[#C9A85C] font-medium mr-1.5">Ý nghĩa xuôi:</strong>
                    {selectedCard.meaning_upright_vi || selectedCard.meaning_upright}
                  </p>

                  <p>
                    <strong className="text-[#C9A85C] font-medium mr-1.5">Ý nghĩa ngược:</strong>
                    {selectedCard.meaning_reversed_vi || selectedCard.meaning_reversed}
                  </p>

                  {(selectedCard.love_vi || selectedCard.love) && (
                    <p>
                      <strong className="text-[#C9A85C] font-medium mr-1.5">Tình cảm:</strong>
                      {selectedCard.love_vi || selectedCard.love}
                    </p>
                  )}

                  {(selectedCard.career_vi || selectedCard.career) && (
                    <p>
                      <strong className="text-[#C9A85C] font-medium mr-1.5">Sự nghiệp:</strong>
                      {selectedCard.career_vi || selectedCard.career}
                    </p>
                  )}
                </div>

                {/* Khối Lời khuyên & Thông điệp vũ trụ */}
                <div className="p-3.5 rounded-xl bg-[#141018]/70 border border-[#3A2E1F] space-y-1">
                  <div className="flex items-center gap-2 text-xs text-[#C9A85C] font-heading font-medium tracking-wider uppercase">
                    <span>✦</span>
                    <span>LỜI KHUYÊN & THÔNG ĐIỆP VŨ TRỤ</span>
                  </div>
                  <p className="text-[13px] leading-[1.6] text-[#EEE6D8]/90 italic font-body">
                    "{selectedCard.spiritual_vi || selectedCard.spiritual || 'Hãy dũng cảm bước ra khỏi vùng an toàn, giữ một trái tim thuần khiết và tin tưởng vào hành trình phía trước.'}"
                  </p>
                </div>
              </div>

              {/* Hàng nút hành động dưới cùng: Neo cố định (shrink-0), KHÔNG BAO GIỜ BỊ ẨN HAY BỊ CHE KHUẤT */}
              <div className="shrink-0 flex items-center gap-3 pt-3 mt-2 border-t border-[#251D15] bg-[#0E0D11]">
                <button
                  type="button"
                  onClick={() => setSelectedCard(null)}
                  className="px-4 py-2 border border-[#3A2E1F] hover:border-[#C9A85C] text-[#BDB4A8] hover:text-[#EEE6D8] rounded text-xs transition-colors cursor-pointer"
                >
                  ← Quay lại 78 lá
                </button>
                {onStartReading && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCard(null);
                      onClose();
                      onStartReading();
                    }}
                    className="px-4 py-2 bg-[#C9A85C] hover:bg-[#D8B96E] text-[#14100D] font-medium rounded text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-[0_2px_12px_rgba(201,168,92,0.25)]"
                  >
                    <span>✦</span>
                    <span>Bắt đầu trải bài ngay</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })() : (
        <div className="relative w-full max-w-5xl h-[80vh] sm:h-[82vh] max-h-[82vh] my-auto bg-[#0E0D11] border border-[#3A3226] rounded-2xl shadow-2xl flex flex-col overflow-hidden text-[#EEE6D8]">
          {/* Header */}
          <div className="p-6 border-b border-[#2A241E] flex items-center justify-between">
            <div>
              <h3 className="font-heading text-2xl font-medium text-[#C9A85C] leading-snug">
                Bách khoa 78 lá bài Tarot (Rider-Waite)
              </h3>
              <p className="text-sm text-[#BDB4A8] mt-1 font-body">
                Tra cứu hình ảnh, từ khóa và ý nghĩa chi tiết từng lá bài chuẩn tiếng Việt.
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-[#1A161D] hover:bg-[#2A241E] text-[#BDB4A8] hover:text-[#EEE6D8] flex items-center justify-center cursor-pointer transition-colors text-lg"
            >
              ✕
            </button>
          </div>

          {/* Filter & Search Bar */}
          <div className="p-4 sm:p-6 border-b border-[#2A241E] bg-[#120F16]/50 flex flex-wrap gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {[
                { id: 'all', label: 'Tất cả 78 lá' },
                { id: 'major', label: 'Bộ Ẩn Chính' },
                { id: 'wands', label: 'Gậy (Wands)' },
                { id: 'cups', label: 'Cốc (Cups)' },
                { id: 'swords', label: 'Kiếm (Swords)' },
                { id: 'pentacles', label: 'Tiền (Pentacles)' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilter(tab.id as any)}
                  className={`px-3 py-1.5 rounded-full text-xs font-heading tracking-wider transition-colors cursor-pointer ${
                    filter === tab.id
                      ? 'bg-[#C9A85C] text-[#080708] font-semibold'
                      : 'bg-[#1D1823] text-[#BDB4A8] hover:text-[#EEE6D8] border border-[#352B1E]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <input
              type="text"
              placeholder="Tìm theo tên lá bài hoặc từ khóa..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-64 px-3.5 py-1.5 bg-[#17131D] border border-[#382E21] rounded-lg text-xs text-[#EEE6D8] placeholder-[#706456] focus:outline-none focus:border-[#C9A85C] transition-colors"
            />
          </div>

          {/* Cards Grid */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 sm:gap-4">
            {filtered.map((c) => (
              <div
                key={c.id}
                onClick={() => setSelectedCard(c)}
                className="p-2.5 rounded-xl bg-[#16131A] border border-[#2A231C] hover:border-[#C9A85C] transition-all cursor-pointer group flex flex-col items-center text-center"
              >
                <div className="w-full aspect-[2/3] relative rounded-lg overflow-hidden mb-2 bg-[#0A090D]">
                  <Image
                    src={c.image.startsWith('/') ? c.image : `/${c.image}`}
                    alt={c.name_vi}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <p className="font-heading text-sm font-medium text-[#EEE6D8] truncate leading-snug">
                  {c.name}
                </p>
                <p className="text-[11px] text-[#C9A85C] italic truncate font-body">
                  {c.name_vi}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
