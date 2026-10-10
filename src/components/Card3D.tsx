'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { OrientationType } from '@/types/tarot';

interface Card3DProps {
  cardId?: number;
  imageSrc?: string;
  nameVi?: string;
  nameEn?: string;
  orientation?: OrientationType;
  positionName?: string;
  isFlipped: boolean;
  onFlip?: () => void;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
}

export const Card3D: React.FC<Card3DProps> = ({
  imageSrc,
  nameVi,
  nameEn,
  orientation = 'upright',
  positionName,
  isFlipped,
  onFlip,
  className = '',
  priority = false
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  // Preload front image when card is assigned (Section 3.4 tarot-animation-engine)
  useEffect(() => {
    if (imageSrc) {
      const img = new window.Image();
      img.src = imageSrc.startsWith('/') ? imageSrc : `/${imageSrc}`;
      img.onload = () => setImageLoaded(true);
      img.onerror = () => setImageLoaded(true);
    }
  }, [imageSrc]);

  const isReversed = orientation === 'reversed';
  const frontImage = imageSrc ? (imageSrc.startsWith('/') ? imageSrc : `/${imageSrc}`) : '/cards/00_Fool.jpg';

  return (
    <div
      onClick={onFlip}
      className={`card-scene cursor-pointer group select-none relative ${className}`}
      style={{ perspective: '1200px' }}
    >
      {/* Position Tag Header if provided */}
      {positionName && (
        <div className="text-center mb-2">
          <span className="text-[11px] uppercase tracking-widest font-serif text-[#D4AF37] bg-[#1A1612] px-2.5 py-0.5 rounded border border-[#7C6339]/50 shadow-sm">
            {positionName}
          </span>
        </div>
      )}

      {/* 3D Flipper Container */}
      <div
        className={`w-full aspect-[2/3] relative rounded-xl transition-transform duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] transform-style-3d shadow-[0_10px_30px_rgba(0,0,0,0.8)] group-hover:shadow-[0_15px_35px_rgba(212,175,55,0.2)] ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
      >
        {/* Back Face (Mặt lưng thần bí) */}
        <div className="card-face absolute inset-0 w-full h-full backface-hidden rounded-xl overflow-hidden border border-[#7C6339]/80 bg-[#0C0B0E]">
          <Image
            src="/cards/card_back.jpg"
            alt="Mặt sau bài Tarot"
            fill
            sizes="(max-width: 768px) 224px, 256px"
            className="object-cover"
            priority={priority}
          />
          {/* Subtle inner gold rim */}
          <div className="absolute inset-0 border border-[#D4AF37]/30 rounded-xl pointer-events-none" />
        </div>

        {/* Front Face (Mặt trước lá bài) */}
        <div className="card-face absolute inset-0 w-full h-full backface-hidden rotate-y-180 rounded-xl overflow-hidden border border-[#D4AF37] bg-[#0E0D12]">
          <div className={`w-full h-full relative ${isReversed ? 'rotate-180' : ''}`}>
            <Image
              src={frontImage}
              alt={nameVi || 'Lá bài Tarot'}
              fill
              sizes="(max-width: 768px) 224px, 256px"
              className="object-cover"
              priority={priority}
            />
          </div>

          {/* Orientation Badge Overlay */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-[#080708]/85 backdrop-blur-sm border border-[#D4AF37]/50 rounded text-[10px] uppercase font-serif tracking-wider text-[#F3E7D3] shadow-md whitespace-nowrap">
            {isReversed ? '↺ Ngược (Reversed)' : '↑ Xuôi (Upright)'}
          </div>

          {/* Inner frame */}
          <div className="absolute inset-0 border border-[#D4AF37]/40 rounded-xl pointer-events-none" />
        </div>
      </div>

      {/* Card Name footer when revealed */}
      {isFlipped && nameVi && (
        <div className="mt-2.5 text-center">
          <p className="font-serif text-sm font-semibold text-[#F3E7D3] tracking-wide">
            {nameVi}
          </p>
          {nameEn && (
            <p className="text-[11px] text-[#A89885] italic font-serif">
              {nameEn}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
