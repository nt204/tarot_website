'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { OrientationType } from '@/types/tarot';

interface Card3DProps {
  cardId?: number;
  imageSrc?: string;
  backImage?: string;
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
  backImage,
  nameVi,
  nameEn,
  orientation = 'upright',
  positionName,
  isFlipped,
  onFlip,
  className = '',
  priority = false
}) => {
  const isReversed = orientation === 'reversed';
  const frontImage = imageSrc ? (imageSrc.startsWith('/') ? imageSrc : `/${imageSrc}`) : '/cards/00_Fool.jpg';

  return (
    <div
      onClick={onFlip}
      className={`card-scene cursor-pointer group select-none relative ${className}`}
      style={{ perspective: '1200px' }}
    >
      {/* Position Tag Header if provided - Be Vietnam Pro, no uppercase */}
      {positionName && (
        <div className="text-center mb-2.5">
          <span className="text-[13px] font-normal text-[#C9A85C] bg-[#161419] px-3 py-1 rounded border border-[#7C6339]/50 shadow-sm inline-block">
            {positionName}
          </span>
        </div>
      )}

      {/* 3D Flipper Container - Đúng tỷ lệ chuẩn bài Tarot 3:5 (720x1200) để không bao giờ bị cắt viền trên/dưới */}
      <div
        className={`w-full aspect-[3/5] relative rounded-xl transition-transform duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] transform-style-3d shadow-[0_10px_30px_rgba(0,0,0,0.8)] group-hover:shadow-[0_15px_35px_rgba(201,168,92,0.2)] ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
      >
        {/* Back Face (Mặt lưng) */}
        <div className="card-face absolute inset-0 w-full h-full backface-hidden rounded-xl overflow-hidden border border-[#7C6339]/80 bg-[#0C0B0E]">
          <Image
            src={backImage || '/cards/back_card/back_1.png'}
            alt="Mặt sau bài Tarot"
            fill
            sizes="(max-width: 768px) 224px, 280px"
            className="object-cover"
            priority={priority}
          />
          <div className="absolute inset-0 border border-[#C9A85C]/30 rounded-xl pointer-events-none" />
        </div>

        {/* Front Face (Mặt trước) - Hiển thị 100% toàn bộ lá bài đầy đủ viền số La Mã và tên lá bên dưới */}
        <div className="card-face absolute inset-0 w-full h-full backface-hidden rotate-y-180 rounded-xl overflow-hidden border border-[#C9A85C] bg-[#0E0D12]">
          <div className={`w-full h-full relative ${isReversed ? 'rotate-180' : ''}`}>
            <Image
              src={frontImage}
              alt={nameVi || 'Lá bài Tarot'}
              fill
              sizes="(max-width: 768px) 224px, 280px"
              className="object-contain"
              priority={priority}
            />
          </div>

          {/* Orientation Badge Overlay - Only show if reversed, per user request */}
          {isReversed && (
            <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 bg-[#080708]/85 backdrop-blur-sm border border-[#C9A85C]/50 rounded text-[11px] font-normal text-[#EEE6D8] shadow-md whitespace-nowrap">
              ↺ Ngược
            </div>
          )}

          <div className="absolute inset-0 border border-[#C9A85C]/40 rounded-xl pointer-events-none" />
        </div>
      </div>

      {/* Card Name footer - Only English name */}
      {isFlipped && (nameEn || nameVi) && (
        <div className="mt-3 text-center">
          <p className="font-heading card-name text-[18px] font-normal text-[#EEE6D8] uppercase tracking-[0.06em] leading-normal">
            {nameEn || nameVi}
          </p>
        </div>
      )}
    </div>
  );
};
