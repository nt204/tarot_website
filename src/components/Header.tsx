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
        <nav className="hidden md:flex items-center space-x-6 text-xs lg:text-sm font-medium tracking-wider uppercase">
          <button
            onClick={onScrollToTable}
            className="flex items-center gap-1.5 text-[#D4AF37] hover:text-[#F3E7D3] transition-colors"
          >
            <span className="text-[10px]">✦</span> XEM TAROT
          </button>
          <button
            onClick={onOpenCatalog}
            className="flex items-center gap-1.5 text-[#C4B7A6] hover:text-[#D4AF37] transition-colors"
          >
            <span className="text-[10px] text-[#8C7A65]">✦</span> Ý NGHĨA LÁ BÀI
          </button>
          <a
            href="#spreads"
            className="flex items-center gap-1.5 text-[#C4B7A6] hover:text-[#D4AF37] transition-colors"
          >
            <span className="text-[10px] text-[#8C7A65]">✦</span> KIỂU TRẢI BÀI
          </a>
          <a
            href="#about"
            className="flex items-center gap-1.5 text-[#C4B7A6] hover:text-[#D4AF37] transition-colors"
          >
            <span className="text-[10px] text-[#8C7A65]">✦</span> GIỚI THIỆU
          </a>
          <a
            href="#faq"
            className="flex items-center gap-1.5 text-[#C4B7A6] hover:text-[#D4AF37] transition-colors"
          >
            <span className="text-[10px] text-[#8C7A65]">✦</span> HỎI ĐÁP
          </a>
        </nav>

        {/* Right: Auth / Action Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={onScrollToTable}
            className="px-4 py-2 border border-[#7C6339] hover:border-[#D4AF37] bg-[#14100D] hover:bg-[#1E1712] text-[#D4AF37] text-xs font-semibold tracking-widest uppercase transition-all shadow-sm hover:shadow-[0_0_15px_rgba(212,175,55,0.2)] rounded-sm"
          >
            ĐĂNG NHẬP
          </button>
        </div>
      </div>
    </header>
  );
};
