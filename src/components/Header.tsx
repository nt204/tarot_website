'use client';

import React from 'react';
import Link from 'next/link';

interface HeaderProps {
  onOpenCatalog?: () => void;
  onScrollToTable?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenCatalog, onScrollToTable }) => {
  return (
    <header className="sticky top-0 z-50 w-full bg-[#080708]/90 backdrop-blur-md border-b border-[#2A231C]/60 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Left: Brand Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <span className="font-serif tracking-[0.2em] text-xl sm:text-2xl font-bold uppercase text-[#F3E7D3] group-hover:text-[#D4AF37] transition-colors">
            TAROT READER
          </span>
          <span className="text-[#D4AF37] text-sm animate-pulse">✦</span>
        </Link>

        {/* Center: Nav links */}
        <nav className="hidden md:flex items-center space-x-8 text-xs lg:text-sm font-medium tracking-wide">
          <button
            onClick={onScrollToTable}
            className="text-[#D4AF37] hover:text-[#F3E7D3] transition-colors cursor-pointer"
          >
            Xem bài
          </button>
          <button
            onClick={onOpenCatalog}
            className="text-[#B3A492] hover:text-[#D4AF37] transition-colors cursor-pointer"
          >
            Khám phá lá bài
          </button>
          <a
            href="#about"
            className="text-[#B3A492] hover:text-[#D4AF37] transition-colors"
          >
            Về Tarot
          </a>
        </nav>

        {/* Right: Auth (Nút phụ) */}
        <div className="flex items-center gap-3">
          <button
            onClick={onScrollToTable}
            className="px-3.5 py-1.5 border border-[#3E3428] hover:border-[#7C6339] text-[#9E8E7C] hover:text-[#D4AF37] text-xs font-serif tracking-wider transition-colors rounded-sm cursor-pointer"
          >
            Đăng nhập
          </button>
        </div>
      </div>
    </header>
  );
};
