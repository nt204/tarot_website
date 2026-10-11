'use client';

import React from 'react';
import Link from 'next/link';

interface HeaderProps {
  onScrollToTable?: () => void;
  onGoHome?: () => void;
  onNavigate?: (href: string) => void;
}

const navigationItems = [
  { href: '#topics', label: 'Chủ đề' },
  { href: '#about-tarot', label: 'Về Tarot' },
  { href: '#tarot-table', label: 'Trải bài' },
  { href: '#pricing', label: 'Bảng giá' },
  { href: '#articles', label: 'Blogs' },
  { href: '#faq', label: 'FAQ' },
];

export const Header: React.FC<HeaderProps> = ({
  onScrollToTable,
  onGoHome,
  onNavigate,
}) => {
  const handleLogoClick = (e: React.MouseEvent) => {
    if (typeof window !== 'undefined' && window.location.pathname !== '/') {
      return; // Let standard link href="/" handle navigation
    }
    e.preventDefault();
    if (onGoHome) {
      onGoHome();
    } else if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNavClick = (e: React.MouseEvent, href: string) => {
    if (typeof window !== 'undefined' && window.location.pathname !== '/') {
      // Let standard link navigate to /#section
      return;
    }
    e.preventDefault();
    if (onNavigate) {
      onNavigate(href);
    } else if (typeof window !== 'undefined') {
      const el = document.querySelector(href);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <header className="sticky top-0 z-[60] w-full bg-[#080708]/95 backdrop-blur-md border-b border-[#3D3222] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Left: Brand Logo "Trạm Tarot ✦" */}
        <a
          href="/"
          onClick={handleLogoClick}
          className="flex items-center gap-3.5 group cursor-pointer"
        >
          <img
            src="/logo/logo_icon.png"
            alt="Logo Trạm Tarot"
            className="h-12 sm:h-14 w-auto object-contain group-hover:scale-105 transition-transform drop-shadow-[0_0_12px_rgba(201,168,92,0.35)]"
          />
          <span className="font-heading tracking-[0.05em] text-2xl sm:text-[27px] font-normal text-[#EEE6D8] group-hover:text-[#C9A85C] transition-colors">
            Trạm Tarot
          </span>
        </a>

        {/* Điều hướng bám đúng trình tự các phần trên trang. */}
        <div className="flex items-center gap-4 sm:gap-6">
          <nav
            aria-label="Điều hướng nội dung"
            className="hidden md:flex items-center gap-2.5 lg:gap-3 xl:gap-4 2xl:gap-6 text-[11px] lg:text-[12px] xl:text-[13px] 2xl:text-[14px] font-normal text-[#EEE6D8] whitespace-nowrap"
          >
            {navigationItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={(e) => handleNavClick(e, item.href)}
                className="nav-link hover:text-[#C9A85C] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C9A85C]"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Nút "Bắt đầu trải bài" nền trắng ngà, bo nhẹ, hover vàng */}
          <button
            onClick={onScrollToTable}
            className="px-5 sm:px-6 py-2.5 bg-[#F7F3EB] hover:bg-[#C9A85C] text-[#14100D] font-medium text-sm rounded-[4px] transition-all duration-300 hover:-translate-y-0.5 shadow-[0_2px_12px_rgba(247,243,235,0.15)] hover:shadow-[0_4px_20px_rgba(201,168,92,0.4)] cursor-pointer"
          >
            Bắt đầu trải bài
          </button>
        </div>
      </div>
    </header>
  );
};
