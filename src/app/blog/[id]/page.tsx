import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getBlogById, getAllBlogs } from '@/lib/server/blogStore';
import { Header } from '@/components/Header';
import { FooterSection } from '@/components/FooterSection';
import { ConstellationEffect } from '@/components/ConstellationEffect';
import { ScrollToTop } from '@/components/ScrollToTop';

export const instant = false;

export async function generateStaticParams() {
  const blogs = getAllBlogs();
  return blogs.map((blog) => ({
    id: blog.id,
  }));
}

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const blog = getBlogById(id);

  if (!blog) {
    return {
      title: 'Không tìm thấy bài viết | Trạm Tarot',
      description: 'Bài viết không tồn tại hoặc đã được chuyển dời.',
    };
  }

  return {
    title: `${blog.title.replace(/\*/g, '')} | Trạm Tarot`,
    description: blog.excerpt.replace(/\*/g, ''),
    openGraph: {
      title: blog.title.replace(/\*/g, ''),
      description: blog.excerpt.replace(/\*/g, ''),
      images: blog.image ? [blog.image] : [],
    },
  };
}

export default async function BlogDetailPage({ params }: Props) {
  const { id } = await params;
  const blog = getBlogById(id);

  if (!blog) {
    notFound();
  }

  // Lấy các bài viết liên quan (loại trừ bài hiện tại)
  const allBlogs = getAllBlogs().filter((b) => !b.hidden && b.id !== id);
  const relatedBlogs = allBlogs.slice(0, 3);

  // Helper render định dạng đoạn văn (Xóa sạch toàn bộ dấu sao * và định dạng sạch sẽ)
  const renderParagraph = (text: string, index: number) => {
    const trimmed = text.trim();

    if (trimmed.startsWith('### ')) {
      const cleanHeader = trimmed.replace('### ', '').replace(/\*/g, '').trim();
      return (
        <h4
          key={index}
          className="font-heading text-lg sm:text-xl text-[#CA9D75] tracking-wide mt-6 mb-2 uppercase"
        >
          {cleanHeader}
        </h4>
      );
    }

    if (trimmed.startsWith('## ')) {
      const cleanHeader = trimmed.replace('## ', '').replace(/\*/g, '').trim();
      return (
        <h3
          key={index}
          className="font-heading text-xl sm:text-2xl text-[#C9A85C] tracking-wide mt-8 mb-3 uppercase border-b border-[#2B231B] pb-2"
        >
          {cleanHeader}
        </h3>
      );
    }

    // Đoạn trích dẫn / câu châm ngôn (bắt đầu bằng * hoặc đã từng có *)
    if (trimmed.startsWith('*') && trimmed.endsWith('*')) {
      const cleanQuote = trimmed.replace(/\*/g, '').replace(/^"+|"+$/g, '').trim();
      return (
        <blockquote
          key={index}
          className="italic text-[#E5D7C3] text-sm sm:text-base border-l-2 border-[#C9A85C] pl-4 py-2 my-4 bg-[#141017]/60 rounded-r"
        >
          {cleanQuote}
        </blockquote>
      );
    }

    // Format các thẻ in đậm **text**, xóa toàn bộ ký tự * thừa
    const parts = trimmed.split(/(\*\*.*?\*\*)/g);

    return (
      <p key={index} className="text-[#D8CEBE] text-[15px] sm:text-[17px] leading-[1.85] font-body">
        {parts.map((part, pIdx) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            const cleanBold = part.slice(2, -2).replace(/\*/g, '').trim();
            return (
              <strong key={pIdx} className="text-[#EEE6D8] font-semibold">
                {cleanBold}
              </strong>
            );
          }
          // Xóa mọi ký tự dấu sao * còn sót lại trong văn bản
          const cleanPart = part.replace(/\*/g, '');
          return cleanPart;
        })}
      </p>
    );
  };

  return (
    <div className="relative min-h-screen bg-[#080708] text-[#EEE6D8] flex flex-col selection:bg-[#C9A85C]/30 selection:text-[#EEE6D8]">
      {/* Đảm bảo vào trang là đứng ở đầu trang ngay lập tức, không bị trượt từ dưới lên */}
      <ScrollToTop />

      {/* Hiệu ứng chòm sao nhấp nháy nền */}
      <ConstellationEffect />

      {/* Header thương hiệu Trạm Tarot */}
      <Header />

      <main className="flex-1 w-full relative z-10">
        {/* Breadcrumb & Nút quay lại */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 pb-4">
          <div className="flex items-center justify-between text-xs sm:text-sm text-[#8C7A65]">
            <Link
              href="/#articles"
              className="inline-flex items-center gap-2 text-[#C9A85C] hover:text-[#F3DFB0] transition-colors group cursor-pointer"
            >
              <span className="transition-transform group-hover:-translate-x-1">←</span>
              <span>Góc chiêm nghiệm & bài viết</span>
            </Link>

            <span className="text-[#6E5943] hidden sm:inline">Trạm Tarot ✦ Chiêm nghiệm</span>
          </div>
        </div>

        {/* Nội dung bài viết */}
        <article className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8 sm:space-y-10">
          {/* Header bài viết */}
          <header className="space-y-4 sm:space-y-6 text-left">
            <div className="flex flex-wrap items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-[#18141E] border border-[#C9A85C]/60 text-xs text-[#C9A85C] uppercase tracking-wider font-heading">
                {blog.category}
              </span>
              <span className="text-xs text-[#8C7A65] font-mono">{blog.date}</span>
              <span className="text-xs text-[#6E5943]">·</span>
              <span className="text-xs text-[#8C7A65]">5 phút đọc</span>
            </div>

            <h1 className="font-heading text-2xl sm:text-4xl lg:text-[42px] text-[#EEE6D8] uppercase tracking-[0.04em] leading-[1.3] font-normal">
              {blog.title}
            </h1>

            {/* Hộp tóm tắt tinh tế */}
            {blog.excerpt && (
              <div className="p-4 sm:p-5 rounded-xl bg-[#120F16] border-l-2 border-[#C9A85C] text-[#BDB4A8] text-sm sm:text-base leading-relaxed italic">
                {blog.excerpt}
              </div>
            )}
          </header>

          {/* Ảnh bìa bài viết chuẩn tỉ lệ 16:9 */}
          {blog.image && (
            <div className="space-y-2">
              <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden border border-[#2B231B] shadow-[0_12px_40px_rgba(0,0,0,0.6)]">
                <Image
                  src={blog.image}
                  alt={blog.title}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 896px"
                  className="object-cover"
                />
              </div>
              {blog.imageCaption && (
                <p className="text-center text-xs text-[#8C7A65] italic">
                  {blog.imageCaption}
                </p>
              )}
            </div>
          )}

          {/* Nội dung chi tiết các đoạn văn */}
          <div className="space-y-5 pt-4 text-left border-t border-[#221A13]">
            {blog.fullContent.map((paragraph, idx) => renderParagraph(paragraph, idx))}
          </div>

          {/* CTA: Mời trải bài Tarot */}
          <div className="mt-12 p-8 sm:p-10 rounded-2xl bg-gradient-to-b from-[#14101A] to-[#0A080C] border border-[#3D3222] text-center space-y-5 shadow-[0_12px_40px_rgba(201,168,92,0.08)]">
            <span className="text-[#C9A85C] text-2xl block">✦</span>
            <h3 className="font-heading text-xl sm:text-2xl text-[#EEE6D8] uppercase tracking-wider">
              Lắng lòng & khám phá câu chuyện của riêng bạn
            </h3>
            <p className="text-sm sm:text-base text-[#BDB4A8] max-w-xl mx-auto leading-relaxed">
              Bạn đang đứng trước ngã rẽ hay trăn trở về mối quan hệ? Hãy để 78 lá bài Tarot cùng Trạm Tarot soi chiếu góc nhìn mới cho bạn.
            </p>
            <div className="pt-2">
              <Link
                href="/#tarot-table"
                className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-white text-black hover:bg-[#C9A85C] hover:text-[#080708] font-medium text-xs sm:text-sm tracking-widest uppercase transition-all duration-300 shadow-lg hover:shadow-[0_0_20px_rgba(201,168,92,0.3)] cursor-pointer"
              >
                <span>Bắt đầu trải bài ngay</span>
                <span>✦</span>
              </Link>
            </div>
          </div>
        </article>

        {/* Các bài viết liên quan */}
        {relatedBlogs.length > 0 && (
          <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-[#26201A] space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs uppercase tracking-[0.25em] text-[#C9A85C] font-heading block">
                  Đọc tiếp
                </span>
                <h2 className="font-heading text-xl sm:text-2xl text-[#EEE6D8] uppercase tracking-wide">
                  Bài viết cùng chuyên mục
                </h2>
              </div>
              <Link
                href="/#articles"
                className="text-xs text-[#C9A85C] hover:text-[#F3DFB0] transition-colors"
              >
                Xem tất cả bài viết →
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedBlogs.map((rel) => (
                <Link
                  key={rel.id}
                  href={`/blog/${rel.id}`}
                  className="group rounded-2xl overflow-hidden border border-[#2B231B] hover:border-[#C9A85C] transition-all duration-300 hover:shadow-[0_12px_36px_rgba(201,168,92,0.18)] hover:-translate-y-1 bg-[#0E0C12] flex flex-col h-full cursor-pointer"
                >
                  <div className="relative w-full aspect-[16/9] overflow-hidden bg-[#16121B]">
                    {rel.image && (
                      <Image
                        src={rel.image}
                        alt={rel.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 360px"
                        className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                      />
                    )}
                    <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-[#08070A]/85 border border-[#C9A85C]/50 text-[10px] text-[#C9A85C] uppercase tracking-wider font-heading">
                      {rel.category}
                    </span>
                  </div>

                  <div className="p-5 flex flex-col justify-between flex-1 text-left bg-[#0E0C12]">
                    <div className="space-y-3">
                      <span className="text-[11px] text-[#8C7A65] font-mono block">
                        {rel.date}
                      </span>
                      <h3
                        className="font-heading text-[15px] sm:text-base text-[#EEE6D8] group-hover:text-[#C9A85C] uppercase tracking-[0.03em] leading-[1.38] transition-colors"
                        style={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {rel.title}
                      </h3>
                      <p
                        className="text-xs leading-[1.65] text-[#A89882] font-body"
                        style={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {rel.excerpt}
                      </p>
                    </div>

                    <div className="pt-4 mt-3 border-t border-[#221A13] flex items-center justify-between">
                      <div className="relative inline-flex items-center gap-2">
                        <span className="relative text-xs font-heading font-medium tracking-wider text-[#C9A85C] pb-0.5">
                          Read more
                          <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-[#C9A85C] transition-all duration-300 ease-out group-hover:w-full" />
                        </span>
                        <span className="text-[#C9A85C] text-xs">✦</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <FooterSection />
    </div>
  );
}
