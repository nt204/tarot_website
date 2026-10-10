'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { TarotCard } from '@/types/tarot';

interface CardCatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CardCatalogModal: React.FC<CardCatalogModalProps> = ({ isOpen, onClose }) => {
  const [cards, setCards] = useState<TarotCard[]>([]);
  const [filter, setFilter] = useState<'all' | 'major' | 'wands' | 'cups' | 'swords' | 'pentacles'>('all');
  const [search, setSearch] = useState<string>('');
  const [selectedCard, setSelectedCard] = useState<TarotCard | null>(null);

  useEffect(() => {
    if (isOpen && cards.length === 0) {
      fetch('/api/cards')
        .then((res) => res.json())
        .then((data) => {
          if (data.cards) setCards(data.cards);
        })
        .catch((e) => console.error('Failed to load cards catalog:', e));
    }
  }, [isOpen, cards.length]);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-5xl max-h-[90vh] bg-[#0E0D11] border border-[#3A3226] rounded-2xl shadow-2xl flex flex-col overflow-hidden text-[#F3E7D3]">
        {/* Header */}
        <div className="p-6 border-b border-[#2A241E] flex items-center justify-between">
          <div>
            <h3 className="font-serif text-2xl font-bold text-[#D4AF37]">
              Bách Khoa 78 Lá Bài Tarot (Rider-Waite)
            </h3>
            <p className="text-xs text-[#A89885] mt-0.5">
              Tra cứu hình ảnh, từ khóa và ý nghĩa chi tiết từng lá bài chuẩn tiếng Việt.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#1A161D] hover:bg-[#2A241E] text-[#C5B5A1] flex items-center justify-center cursor-pointer transition-colors text-lg"
          >
            ✕
          </button>
        </div>

        {/* Filter Toolbar */}
        <div className="px-6 py-4 bg-[#141217] border-b border-[#2A241E] flex flex-wrap gap-3 items-center justify-between">
          <div className="flex flex-wrap gap-1.5 text-xs font-serif">
            {[
              { id: 'all', label: 'Tất Cả (78)' },
              { id: 'major', label: 'Bộ Ẩn Chính (22)' },
              { id: 'wands', label: 'Gậy (Wands)' },
              { id: 'cups', label: 'Ly (Cups)' },
              { id: 'swords', label: 'Kiếm (Swords)' },
              { id: 'pentacles', label: 'Tiền (Pentacles)' }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id as any)}
                className={`px-3 py-1.5 rounded border transition-colors cursor-pointer ${
                  filter === f.id
                    ? 'bg-[#2A2216] border-[#D4AF37] text-[#D4AF37]'
                    : 'bg-[#1A1720] border-[#2E271F] text-[#A89885] hover:text-[#F3E7D3]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên lá hoặc từ khóa..."
            className="px-3 py-1.5 bg-[#1C1822] border border-[#3A3226] rounded text-xs text-[#F3E7D3] focus:outline-none focus:border-[#D4AF37] w-64"
          />
        </div>

        {/* Body Grid */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
          {filtered.map((c) => (
            <div
              key={c.id}
              onClick={() => setSelectedCard(c)}
              className="p-2 rounded-xl bg-[#16131A] border border-[#2A231C] hover:border-[#D4AF37] transition-all cursor-pointer group flex flex-col items-center text-center"
            >
              <div className="w-full aspect-[2/3] relative rounded-lg overflow-hidden mb-2 bg-[#0A090D]">
                <Image
                  src={c.image.startsWith('/') ? c.image : `/${c.image}`}
                  alt={c.name_vi}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <p className="font-serif text-xs font-semibold text-[#F3E7D3] line-clamp-1">
                {c.name_vi}
              </p>
              <p className="text-[10px] text-[#8C7A65] italic line-clamp-1 font-serif">
                {c.name}
              </p>
            </div>
          ))}
        </div>

        {/* Card Detail Popup */}
        {selectedCard && (
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md p-6 flex flex-col md:flex-row gap-6 overflow-y-auto z-20">
            <button
              onClick={() => setSelectedCard(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#1E1922] text-[#D4AF37] flex items-center justify-center cursor-pointer"
            >
              ✕
            </button>

            <div className="w-48 sm:w-64 aspect-[2/3] relative rounded-xl overflow-hidden border border-[#D4AF37] shadow-2xl shrink-0 mx-auto md:mx-0">
              <Image
                src={selectedCard.image.startsWith('/') ? selectedCard.image : `/${selectedCard.image}`}
                alt={selectedCard.name_vi}
                fill
                className="object-cover"
              />
            </div>

            <div className="flex-1 space-y-4">
              <div>
                <span className="text-xs uppercase tracking-widest text-[#D4AF37] font-serif">
                  {selectedCard.arcana === 'major' ? 'Bộ Ẩn Chính' : selectedCard.suit_vi}
                </span>
                <h4 className="font-serif text-2xl font-bold text-[#F3E7D3]">
                  {selectedCard.name_vi} ({selectedCard.name})
                </h4>
              </div>

              {/* Keywords */}
              <div className="space-y-1">
                <span className="text-xs text-[#A89885] font-serif">Từ khóa xuôi:</span>
                <div className="flex flex-wrap gap-1.5">
                  {(selectedCard.keywords_upright_vi || selectedCard.keywords_upright || []).map((k, i) => (
                    <span key={i} className="text-xs px-2.5 py-0.5 rounded-full bg-[#201B27] text-[#D4AF37] border border-[#3A3226]">
                      {k}
                    </span>
                  ))}
                </div>
              </div>

              {/* Meanings */}
              <div className="space-y-2 text-xs leading-relaxed text-[#D8CDC0]">
                <p>
                  <strong className="text-[#D4AF37]">Ý nghĩa xuôi:</strong> {selectedCard.meaning_upright_vi || selectedCard.meaning_upright}
                </p>
                <p>
                  <strong className="text-[#A89885]">Ý nghĩa ngược:</strong> {selectedCard.meaning_reversed_vi || selectedCard.meaning_reversed}
                </p>
                <p>
                  <strong className="text-[#C5A059]">Tình cảm:</strong> {selectedCard.love_vi || selectedCard.love}
                </p>
                <p>
                  <strong className="text-[#C5A059]">Sự nghiệp:</strong> {selectedCard.career_vi || selectedCard.career}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
