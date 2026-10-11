'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

import initialBlogs from '@/data/blogs.json';

interface ArticleItem {
  id: string;
  title: string;
  image?: string;
  imageCaption?: string;
  imageSubcaption?: string;
  category: string;
  date: string;
  excerpt: string;
  fullContent: string[];
  hidden?: boolean;
}

interface ArticlesSectionProps {
  onOpenArticle?: (slug: string) => void;
}

export const ArticlesSection: React.FC<ArticlesSectionProps> = () => {
  const [articles, setArticles] = useState<ArticleItem[]>(initialBlogs as ArticleItem[]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Trạng thái kiểm soát nút cuộn trái/phải
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Kéo chuột ngang (Drag to scroll)
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollStart, setScrollStart] = useState(0);
  const [hasMoved, setHasMoved] = useState(false);

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    fetch('/api/admin/blogs')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.blogs) && data.blogs.length > 0) {
          setArticles(data.blogs);
        }
      })
      .catch(() => undefined);
  }, []);

  // Chỉ lấy các bài viết không bị ẩn
  const visibleArticles = articles.filter((b) => !b.hidden);

  const checkScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 10);

    const firstCard = el.firstElementChild as HTMLElement;
    if (firstCard) {
      const step = firstCard.offsetWidth + 16;
      const index = Math.round(el.scrollLeft / step);
      setCurrentIndex(Math.max(0, Math.min(visibleArticles.length - 1, index)));
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [visibleArticles]);

  const getScrollStep = () => {
    const el = scrollContainerRef.current;
    if (!el) return 320;
    const firstCard = el.firstElementChild as HTMLElement;
    if (firstCard) {
      return firstCard.offsetWidth + 16;
    }
    return 320;
  };

  const handleScrollPrev = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -getScrollStep(), behavior: 'smooth' });
    }
  };

  const handleScrollNext = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: getScrollStep(), behavior: 'smooth' });
    }
  };

  const handleScrollToSlide = (index: number) => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const step = getScrollStep();
    el.scrollTo({ left: index * step, behavior: 'smooth' });
  };

  // Drag-to-scroll bằng chuột
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return;
    setIsDragging(true);
    setHasMoved(false);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollStart(scrollContainerRef.current.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return;
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 1.2;
    if (Math.abs(walk) > 4) {
      setHasMoved(true);
      scrollContainerRef.current.scrollLeft = scrollStart - walk;
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <section id="articles" className="scroll-mt-20 py-10 sm:py-20 lg:py-28 px-4 sm:px-6 lg:px-8 bg-[#070506] border-t border-[#26201A] overflow-hidden">
      <div className="max-w-6xl mx-auto space-y-6 sm:space-y-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-3 max-w-2xl text-left"
          >
            <span className="text-xs uppercase tracking-[0.25em] text-[#C9A85C] font-heading block">
              Tri thức & Chiêm nghiệm
            </span>
            <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-normal text-[#C9A85C] tracking-[0.06em] leading-snug uppercase">
              GÓC CHIÊM NGHIỆM & BÀI VIẾT TAROT
            </h2>
            <p className="text-[14px] sm:text-[15px] leading-[1.7] text-[#BDB4A8] font-body">
              Góc nhìn sâu sắc, kinh nghiệm thực hành và triết lý sống qua lăng kính biểu tượng học của 78 lá bài Tarot.
            </p>
          </motion.div>

          {/* Nút lướt sang trái / phải trên Desktop */}
          <div className="hidden md:flex items-center gap-3 shrink-0 self-end">
            <span className="text-xs text-[#8C7A65] font-mono mr-2">
              Lướt ngang để đọc tiếp
            </span>

            <button
              type="button"
              onClick={handleScrollPrev}
              disabled={!canScrollLeft}
              aria-label="Lướt sang trái"
              className="w-10 h-10 rounded-full border border-[#3A3022] hover:border-[#C9A85C] bg-[#0E0C0F] text-[#CA9D75] hover:text-[#EEE6D8] disabled:opacity-30 disabled:border-[#231C16] disabled:cursor-not-allowed flex items-center justify-center transition-all duration-300 hover:shadow-[0_0_15px_rgba(201,168,92,0.2)] cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <button
              type="button"
              onClick={handleScrollNext}
              disabled={!canScrollRight}
              aria-label="Lướt sang phải"
              className="w-10 h-10 rounded-full border border-[#3A3022] hover:border-[#C9A85C] bg-[#0E0C0F] text-[#CA9D75] hover:text-[#EEE6D8] disabled:opacity-30 disabled:border-[#231C16] disabled:cursor-not-allowed flex items-center justify-center transition-all duration-300 hover:shadow-[0_0_15px_rgba(201,168,92,0.2)] cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Danh sách bài viết: Trên mobile thẻ căn giữa, chờm 2 bên mép màn hình */}
        <div className="relative -mx-4 sm:mx-0">
          <div
            ref={scrollContainerRef}
            onScroll={checkScroll}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className={`flex gap-4 sm:gap-6 overflow-x-auto pb-4 pt-2 px-[11vw] sm:px-0 snap-x snap-mandatory scrollbar-none touch-pan-y select-none scroll-smooth ${
              isDragging ? 'cursor-grabbing' : 'cursor-grab'
            }`}
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch',
            }}
          >
            {visibleArticles.map((art, idx) => (
              <motion.div
                key={art.id}
                initial={{ opacity: 0, y: 32, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ duration: 0.55, delay: Math.min(idx * 0.08, 0.32), ease: [0.22, 1, 0.36, 1] }}
                className="shrink-0 snap-center w-[78vw] max-w-[320px] sm:w-[345px] lg:w-[365px]"
              >
                <Link
                  href={`/blog/${art.id}`}
                  onClick={(e) => {
                    if (hasMoved) {
                      e.preventDefault();
                    }
                  }}
                  className="group w-full rounded-2xl overflow-hidden border border-[#2B231B] hover:border-[#C9A85C] transition-all duration-300 hover:shadow-[0_12px_36px_rgba(201,168,92,0.18)] hover:-translate-y-1 bg-[#0E0C12] flex flex-col h-full cursor-pointer"
                >
                  {/* 1. Ảnh đầu vào chuẩn 16:9 */}
                  <div className="relative w-full aspect-[16/9] overflow-hidden bg-[#16121B]">
                    {art.image ? (
                      <Image
                        src={art.image}
                        alt={art.title}
                        fill
                        sizes="(max-width: 640px) 80vw, (max-width: 1024px) 345px, 365px"
                        className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out pointer-events-none"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-[#181420] text-[#C9A85C]/40 text-xs">
                        ✦ Trạm Tarot ✦
                      </div>
                    )}
                    {/* Gradient nhẹ ở chân ảnh */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0E0C12] via-transparent to-transparent opacity-75 pointer-events-none" />

                    {/* Badge danh mục trên ảnh */}
                    <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-[#08070A]/85 border border-[#C9A85C]/50 text-[10px] text-[#C9A85C] uppercase tracking-wider font-heading backdrop-blur-md">
                      {art.category}
                    </span>
                  </div>

                  {/* 2. Nội dung bên dưới */}
                  <div className="p-4 sm:p-5 flex flex-col justify-between flex-1 text-left bg-[#0E0C12]">
                    <div className="space-y-2.5 sm:space-y-3">
                      {/* Ngày đăng */}
                      <span className="text-[10px] sm:text-[11px] text-[#8C7A65] font-mono block tracking-wider">
                        {art.date}
                      </span>

                      {/* Section Tiêu đề bài viết */}
                      <div className="min-h-[46px] sm:min-h-[50px] flex items-start">
                        <h3
                          className="font-heading text-sm sm:text-[17px] text-[#EEE6D8] group-hover:text-[#C9A85C] uppercase tracking-[0.03em] leading-[1.38] transition-colors"
                          style={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {art.title}
                        </h3>
                      </div>

                      {/* Section Tóm tắt bài viết */}
                      <div className="min-h-[38px] sm:min-h-[42px]">
                        <p
                          className="text-xs sm:text-[13px] leading-[1.65] text-[#A89882] font-body"
                          style={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {art.excerpt}
                        </p>
                      </div>
                    </div>

                    {/* Section Read more sang trọng */}
                    <div className="pt-3 sm:pt-4 mt-2 sm:mt-3 border-t border-[#221A13] flex items-center justify-between">
                      <div className="relative inline-flex items-center gap-2">
                        <span className="relative text-xs font-heading font-medium tracking-wider text-[#C9A85C] pb-0.5">
                          Read more
                          <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-[#C9A85C] transition-all duration-300 ease-out group-hover:w-full" />
                        </span>
                        <span className="text-[#C9A85C] text-sm leading-none select-none">
                          ✦
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Navigation Controls bên dưới trên Mobile */}
          <div className="flex md:hidden items-center justify-center gap-4 pt-3 pb-1">
            <button
              type="button"
              onClick={handleScrollPrev}
              disabled={!canScrollLeft}
              aria-label="Bài viết trước"
              className="w-10 h-10 rounded-full border border-[#3A3022] active:border-[#C9A85C] bg-[#110F15] text-[#CA9D75] active:text-[#EEE6D8] disabled:opacity-30 disabled:border-[#231C16] disabled:cursor-not-allowed flex items-center justify-center transition-all duration-200 active:scale-95 shadow-md cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Dots indicator */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#110F15]/90 border border-[#26201A]">
              {visibleArticles.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleScrollToSlide(i)}
                  aria-label={`Chuyển tới bài viết ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                    i === currentIndex
                      ? 'w-5 bg-[#C9A85C]'
                      : 'w-1.5 bg-[#4A3E31] hover:bg-[#7C6339]'
                  }`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={handleScrollNext}
              disabled={!canScrollRight}
              aria-label="Bài viết tiếp theo"
              className="w-10 h-10 rounded-full border border-[#3A3022] active:border-[#C9A85C] bg-[#110F15] text-[#CA9D75] active:text-[#EEE6D8] disabled:opacity-30 disabled:border-[#231C16] disabled:cursor-not-allowed flex items-center justify-center transition-all duration-200 active:scale-95 shadow-md cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
