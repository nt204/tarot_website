'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

interface BlogItem {
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

export default function AdminBlogsPage() {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [adminUser, setAdminUser] = useState<string | null>(null);
  const [loginUsername, setLoginUsername] = useState('ndtri2004');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [blogs, setBlogs] = useState<BlogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Drag and drop state
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  // Form modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form values
  const [formData, setFormData] = useState({
    title: '',
    category: 'Góc nhìn & Tâm lý',
    date: '',
    image: '',
    imageCaption: '',
    excerpt: '',
    contentStr: '',
    hidden: false
  });

  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/blogs');
      if (res.status === 401) {
        setIsAuthenticated(false);
        return;
      }
      const data = await res.json();
      if (data.success && Array.isArray(data.blogs)) {
        setBlogs(data.blogs);
      }
    } catch (e) {
      console.error(e);
      showToast('Lỗi khi tải danh sách bài viết');
    } finally {
      setLoading(false);
    }
  };

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/admin/auth');
      const data = await res.json();
      if (data.authenticated) {
        setIsAuthenticated(true);
        setAdminUser(data.user || 'ndtri2004');
        fetchBlogs();
      } else {
        setIsAuthenticated(false);
      }
    } catch {
      setIsAuthenticated(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginLoading(true);

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: loginUsername.trim(),
          password: loginPassword
        })
      });

      const data = await res.json();
      if (data.success) {
        setIsAuthenticated(true);
        setAdminUser(data.user);
        showToast('Đăng nhập thành công! Chào mừng ' + data.user);
        fetchBlogs();
      } else {
        setLoginError(data.error || 'Tên đăng nhập hoặc mật khẩu không chính xác.');
      }
    } catch {
      setLoginError('Lỗi kết nối tới máy chủ. Vui lòng thử lại.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth', { method: 'DELETE' });
    } catch {
      // ignore
    }
    setIsAuthenticated(false);
    setAdminUser(null);
    setLoginPassword('');
    showToast('Đã đăng xuất.');
  };

  const openCreateModal = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormData({
      title: '',
      category: 'Góc nhìn & Tâm lý',
      date: new Date().toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      }),
      image: '',
      imageCaption: '',
      excerpt: '',
      contentStr: '',
      hidden: false
    });
    setIsModalOpen(true);
  };

  const openEditModal = (blog: BlogItem) => {
    setIsEditing(true);
    setEditingId(blog.id);
    setFormData({
      title: blog.title || '',
      category: blog.category || 'Góc nhìn & Tâm lý',
      date: blog.date || '',
      image: blog.image || '',
      imageCaption: blog.imageCaption || '',
      excerpt: blog.excerpt || '',
      contentStr: (blog.fullContent || []).join('\n\n'),
      hidden: Boolean(blog.hidden)
    });
    setIsModalOpen(true);
  };

  // 1-Click Bật / Tắt Ẩn bài viết
  const handleToggleHidden = async (blog: BlogItem) => {
    try {
      const res = await fetch('/api/admin/blogs', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: blog.id, action: 'toggle_hidden' })
      });
      const data = await res.json();
      if (data.success) {
        const isNowHidden = data.blog ? data.blog.hidden : !blog.hidden;
        setBlogs((prev) =>
          prev.map((b) => (b.id === blog.id ? { ...b, hidden: isNowHidden } : b))
        );
        showToast(isNowHidden ? 'Đã ẩn bài viết khỏi trang chủ' : 'Đã hiện bài viết lên trang chủ');
      } else {
        showToast(data.error || 'Cập nhật trạng thái thất bại');
      }
    } catch (err) {
      console.error(err);
      showToast('Có lỗi xảy ra khi đổi trạng thái bài viết');
    }
  };

  // Kéo thả sắp xếp thứ tự bài viết
  const handleReorder = async (fromId: string, toId: string) => {
    if (fromId === toId) return;
    const fromIdx = blogs.findIndex((b) => b.id === fromId);
    const toIdx = blogs.findIndex((b) => b.id === toId);
    if (fromIdx === -1 || toIdx === -1) return;

    const newBlogs = [...blogs];
    const [moved] = newBlogs.splice(fromIdx, 1);
    newBlogs.splice(toIdx, 0, moved);
    setBlogs(newBlogs);

    try {
      const res = await fetch('/api/admin/blogs', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reorder',
          orderedIds: newBlogs.map((b) => b.id)
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Đã lưu thứ tự bài viết thành công');
      }
    } catch (err) {
      console.error(err);
      showToast('Lỗi khi lưu thứ tự bài viết');
    }
  };

  // Nút di chuyển lên / xuống 1 vị trí
  const handleMoveStep = async (id: string, direction: 'up' | 'down') => {
    const idx = blogs.findIndex((b) => b.id === id);
    if (idx === -1) return;
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= blogs.length) return;

    const newBlogs = [...blogs];
    const temp = newBlogs[idx];
    newBlogs[idx] = newBlogs[targetIdx];
    newBlogs[targetIdx] = temp;
    setBlogs(newBlogs);

    try {
      const res = await fetch('/api/admin/blogs', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reorder',
          orderedIds: newBlogs.map((b) => b.id)
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Đã đổi thứ tự bài viết');
      }
    } catch (err) {
      console.error(err);
      showToast('Lỗi khi đổi thứ tự bài viết');
    }
  };

  // Upload ảnh trực tiếp từ máy tính
  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      const data = new FormData();
      data.append('file', file);

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: data
      });
      const result = await res.json();

      if (result.success && result.url) {
        setFormData((prev) => ({ ...prev, image: result.url }));
        showToast('Tải ảnh lên thành công');
      } else {
        showToast(result.error || 'Tải ảnh thất bại');
      }
    } catch (err) {
      console.error(err);
      showToast('Có lỗi xảy ra khi tải ảnh');
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showToast('Vui lòng nhập tiêu đề bài viết');
      return;
    }

    const payload = {
      title: formData.title.trim(),
      category: formData.category.trim(),
      date: formData.date.trim(),
      image: formData.image.trim(),
      imageCaption: formData.imageCaption.trim(),
      excerpt: formData.excerpt.trim(),
      hidden: Boolean(formData.hidden),
      fullContent: formData.contentStr
        .split('\n')
        .map((p) => p.trim())
        .filter(Boolean)
    };

    try {
      if (isEditing && editingId) {
        const res = await fetch('/api/admin/blogs', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingId, ...payload })
        });
        const data = await res.json();
        if (data.success) {
          showToast('Đã lưu bài viết thành công');
          setIsModalOpen(false);
          fetchBlogs();
        } else {
          showToast(data.error || 'Lưu thất bại');
        }
      } else {
        const res = await fetch('/api/admin/blogs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.success) {
          showToast('Đã tạo bài viết thành công');
          setIsModalOpen(false);
          fetchBlogs();
        } else {
          showToast(data.error || 'Tạo bài viết thất bại');
        }
      }
    } catch (e) {
      console.error(e);
      showToast('Có lỗi xảy ra, vui lòng thử lại');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/blogs?id=${encodeURIComponent(id)}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        showToast('Đã xóa bài viết thành công');
        setDeleteConfirmId(null);
        fetchBlogs();
      } else {
        showToast(data.error || 'Xóa thất bại');
      }
    } catch (e) {
      console.error(e);
      showToast('Lỗi khi xóa bài viết');
    }
  };

  const categories = Array.from(new Set(blogs.map((b) => b.category).filter(Boolean)));

  const filteredBlogs = blogs.filter((b) => {
    const matchSearch =
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.category.toLowerCase().includes(search.toLowerCase()) ||
      b.excerpt.toLowerCase().includes(search.toLowerCase());
    const matchCategory = selectedCategory === 'all' || b.category === selectedCategory;
    return matchSearch && matchCategory;
  });

  const visibleCount = blogs.filter((b) => !b.hidden).length;

  // 1. Màn hình đang kiểm tra đăng nhập
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-[#080708] flex items-center justify-center p-4 text-[#EEE6D8] font-sans">
        <div className="flex flex-col items-center gap-3.5">
          <div className="w-8 h-8 rounded-full border-2 border-[#C9A85C]/30 border-t-[#C9A85C] animate-spin" />
          <span className="text-xs text-[#A89882] font-mono tracking-wider">
            Đang xác thực quyền quản trị viên...
          </span>
        </div>
      </div>
    );
  }

  // 2. Màn hình Đăng nhập Quản trị viên
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#080708] text-[#EEE6D8] flex items-center justify-center p-4 relative overflow-hidden font-sans">
        {/* Vầng hào quang nền dịu nhẹ */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_60%_50%_at_50%_45%,rgba(201,168,92,0.08),rgba(0,0,0,0))] -z-10" />

        <div className="w-full max-w-md bg-[#100E13]/95 border border-[#2D2319] rounded-2xl p-7 sm:p-9 shadow-[0_20px_60px_rgba(0,0,0,0.9)] backdrop-blur-md space-y-6 text-left relative z-10">
          {/* Logo & Tiêu đề */}
          <div className="text-center space-y-2">
            <Link href="/" className="inline-flex items-center gap-2.5 group">
              <img
                src="/logo/logo_icon.png"
                alt="Logo Trạm Tarot"
                className="h-10 w-auto object-contain group-hover:scale-105 transition-transform"
              />
              <span className="font-heading tracking-[0.12em] text-xl font-normal text-[#EEE6D8] group-hover:text-[#C9A85C] transition-colors uppercase">
                Trạm Tarot
              </span>
            </Link>
            <h1 className="text-sm font-semibold tracking-wider uppercase text-[#C9A85C] font-mono pt-1">
              Đăng nhập quản trị viên
            </h1>
            <p className="text-xs text-[#8C7A65]">
              Hệ thống quản lý nội dung bài viết & blog
            </p>
          </div>

          {/* Form đăng nhập */}
          <form onSubmit={handleLogin} className="space-y-4">
            {loginError && (
              <div className="p-3 rounded-lg bg-red-950/60 border border-red-800/80 text-red-200 text-xs leading-relaxed flex items-center gap-2">
                <span className="text-red-400">⚠</span>
                <span>{loginError}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#C5B8A8] block">
                Tài khoản
              </label>
              <input
                type="text"
                required
                autoFocus
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                placeholder="Tên đăng nhập admin"
                className="w-full px-3.5 py-2.5 bg-[#17131D] border border-[#3A2F22] rounded-lg text-sm text-[#EEE6D8] placeholder-[#6A5A48] focus:border-[#C9A85C] focus:outline-none transition-colors font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#C5B8A8] block">
                Mật khẩu
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Nhập mật khẩu"
                  className="w-full px-3.5 py-2.5 pr-12 bg-[#17131D] border border-[#3A2F22] rounded-lg text-sm text-[#EEE6D8] placeholder-[#6A5A48] focus:border-[#C9A85C] focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#8C7A65] hover:text-[#C9A85C] transition-colors cursor-pointer select-none"
                >
                  {showPassword ? 'Ẩn' : 'Hiện'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-3 bg-[#C9A85C] hover:bg-[#D8B96E] disabled:opacity-50 text-[#14100D] font-medium text-sm rounded-lg transition-all shadow-[0_2px_15px_rgba(201,168,92,0.3)] hover:shadow-[0_4px_25px_rgba(201,168,92,0.5)] flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {loginLoading ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-[#14100D]/30 border-t-[#14100D] animate-spin" />
                  <span>Đang xác thực...</span>
                </>
              ) : (
                <>
                  <span>✦</span>
                  <span>Đăng nhập</span>
                </>
              )}
            </button>
          </form>

          {/* Quay về trang chủ */}
          <div className="pt-2 border-t border-[#221B15] text-center">
            <Link
              href="/"
              className="text-xs text-[#8C7A65] hover:text-[#C9A85C] transition-colors inline-flex items-center gap-1.5"
            >
              <span>←</span>
              <span>Trở về trang chủ Trạm Tarot</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 3. Màn hình Bảng điều khiển Quản trị Blog (Đã đăng nhập)
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      {/* Top Header Navbar */}
      <header className="sticky top-0 z-30 w-full bg-white border-b border-slate-200 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="font-semibold text-lg text-blue-600 group-hover:text-blue-700 transition-colors">
              Trạm Tarot
            </span>
          </Link>
          <span className="text-slate-300">/</span>
          <span className="text-xs uppercase tracking-wider font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
            Quản trị Blog
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Huy hiệu Admin User */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 rounded-md border border-slate-200 text-xs text-slate-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="font-mono text-[11px] font-semibold">{adminUser || 'ndtri2004'}</span>
          </div>

          <Link
            href="/"
            className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-300 rounded-md transition-colors"
          >
            Về trang chủ
          </Link>
          <button
            type="button"
            onClick={openCreateModal}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-md shadow-xs transition-colors cursor-pointer"
          >
            Thêm bài viết
          </button>
          <button
            type="button"
            onClick={handleLogout}
            title="Đăng xuất khỏi trang quản trị"
            className="px-3 py-1.5 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200 rounded-md transition-colors cursor-pointer"
          >
            Đăng xuất
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-8 py-8 space-y-4">
        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed top-5 right-5 z-50 px-4 py-2.5 bg-slate-900 text-white text-xs font-medium rounded-md shadow-lg">
            {toastMessage}
          </div>
        )}

        {/* Toolbar: Tìm kiếm, Lọc danh mục & Thống kê hiển thị */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white border border-slate-200 p-3.5 rounded-lg shadow-xs">
          <div className="flex flex-wrap items-center gap-2.5 flex-1">
            <input
              type="text"
              placeholder="Tìm kiếm bài viết..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-64 px-3 py-1.5 bg-slate-50 border border-slate-300 focus:border-blue-500 focus:bg-white rounded-md text-xs text-slate-800 placeholder-slate-400 outline-none transition-colors"
            />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-300 focus:border-blue-500 focus:bg-white rounded-md text-xs text-slate-700 outline-none transition-colors"
            >
              <option value="all">Tất cả chuyên mục</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Hiển thị số lượng hiển thị trên trang chủ & hướng dẫn kéo thả */}
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-50 border border-slate-200">
              <span className="text-slate-600">Trang chủ hiển thị:</span>
              <span className={`font-semibold ${visibleCount >= 3 ? 'text-emerald-600' : 'text-blue-600'}`}>
                {visibleCount} bài
              </span>
              <span className="text-slate-400 text-[11px]">
                (3 bài/lượt xem)
              </span>
            </div>

            <div className="text-slate-500 hidden sm:block">
              Tổng: <span className="font-semibold text-slate-700">{filteredBlogs.length}</span> bài
            </div>
          </div>
        </div>

        {/* Hướng dẫn kéo thả sắp xếp */}
        <div className="px-3.5 py-2 bg-blue-50/60 border border-blue-200/70 rounded-md text-[11px] text-blue-700 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold">✦ Kéo thả:</span>
            <span>Giữ chuột vào biểu tượng 6 chấm (⋮⋮) để kéo thả đổi thứ tự bài viết, hoặc bấm nút ▲ ▼. 3 bài đầu tiên (#1, #2, #3) sẽ hiển thị ngay khi tải trang.</span>
          </div>
          {search && (
            <button
              onClick={() => { setSearch(''); setSelectedCategory('all'); }}
              className="underline text-blue-800 hover:text-blue-900 font-medium ml-2 shrink-0"
            >
              Xem toàn bộ để kéo thả
            </button>
          )}
        </div>

        {/* Bảng danh sách bài viết */}
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
          {loading ? (
            <div className="p-12 text-center text-xs text-slate-500">Đang tải danh sách bài viết...</div>
          ) : filteredBlogs.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500">
              Không tìm thấy bài viết nào phù hợp.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse min-w-[820px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[11px] uppercase tracking-wider">
                    <th className="py-3 px-3 w-20 text-center whitespace-nowrap">Thứ tự</th>
                    <th className="py-3 px-4 w-16 whitespace-nowrap">Ảnh</th>
                    <th className="py-3 px-4">Tiêu đề</th>
                    <th className="py-3 px-4 w-44 whitespace-nowrap">Chuyên mục</th>
                    <th className="py-3 px-4 w-36 whitespace-nowrap">Ngày đăng</th>
                    <th className="py-3 px-4 w-28 text-center whitespace-nowrap">Trạng thái</th>
                    <th className="py-3 px-4 text-right w-44 whitespace-nowrap">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredBlogs.map((b) => {
                    const globalIdx = blogs.findIndex((item) => item.id === b.id);
                    const isDragging = draggedId === b.id;
                    const isOver = dragOverId === b.id;

                    return (
                      <tr
                        key={b.id}
                        draggable
                        onDragStart={(e) => {
                          setDraggedId(b.id);
                          e.dataTransfer.effectAllowed = 'move';
                          e.dataTransfer.setData('text/plain', b.id);
                        }}
                        onDragOver={(e) => {
                          e.preventDefault();
                          if (draggedId && draggedId !== b.id) {
                            setDragOverId(b.id);
                          }
                        }}
                        onDragLeave={() => {
                          if (dragOverId === b.id) {
                            setDragOverId(null);
                          }
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          if (draggedId && draggedId !== b.id) {
                            handleReorder(draggedId, b.id);
                          }
                          setDraggedId(null);
                          setDragOverId(null);
                        }}
                        onDragEnd={() => {
                          setDraggedId(null);
                          setDragOverId(null);
                        }}
                        className={`transition-colors select-none ${
                          isDragging ? 'opacity-30 bg-blue-100' : ''
                        } ${
                          isOver ? 'border-t-2 border-blue-600 bg-blue-50/70' : ''
                        } ${b.hidden ? 'bg-slate-50/50 opacity-75' : 'hover:bg-blue-50/30'}`}
                      >
                        {/* Cột Thứ tự + Kéo thả */}
                        <td className="py-2.5 px-3 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* Nút cầm nắm kéo */}
                            <div
                              title="Giữ chuột và kéo thả để đổi thứ tự"
                              className="cursor-grab active:cursor-grabbing p-1 text-slate-400 hover:text-blue-600 transition-colors"
                            >
                              <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
                                <circle cx="5" cy="4" r="1.5" />
                                <circle cx="11" cy="4" r="1.5" />
                                <circle cx="5" cy="8" r="1.5" />
                                <circle cx="11" cy="8" r="1.5" />
                                <circle cx="5" cy="12" r="1.5" />
                                <circle cx="11" cy="12" r="1.5" />
                              </svg>
                            </div>

                            {/* Huy hiệu thứ tự */}
                            <span
                              className={`inline-flex items-center justify-center min-w-6 h-5 px-1.5 rounded text-[10px] font-bold ${
                                globalIdx < 3
                                  ? 'bg-blue-600 text-white'
                                  : globalIdx < 6
                                  ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                              title={
                                globalIdx < 3
                                  ? 'Hiển thị 3 bài đầu tiên trên trang chủ'
                                  : 'Lướt sang để xem tiếp'
                              }
                            >
                              #{globalIdx + 1}
                            </span>

                            {/* Nút dịch chuyển 1 nấc */}
                            <div className="flex flex-col ml-0.5">
                              <button
                                type="button"
                                onClick={() => handleMoveStep(b.id, 'up')}
                                disabled={globalIdx === 0}
                                title="Đưa lên trên"
                                className="text-[9px] text-slate-400 hover:text-blue-600 disabled:opacity-20 leading-none py-0.5 cursor-pointer"
                              >
                                ▲
                              </button>
                              <button
                                type="button"
                                onClick={() => handleMoveStep(b.id, 'down')}
                                disabled={globalIdx === blogs.length - 1}
                                title="Đưa xuống dưới"
                                className="text-[9px] text-slate-400 hover:text-blue-600 disabled:opacity-20 leading-none py-0.5 cursor-pointer"
                              >
                                ▼
                              </button>
                            </div>
                          </div>
                        </td>

                        {/* Ảnh */}
                        <td className="py-2.5 px-4 whitespace-nowrap">
                          <div className="w-12 h-8 rounded bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center">
                            {b.image ? (
                              <img src={b.image} alt={b.title} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-[10px] text-slate-400">Không ảnh</span>
                            )}
                          </div>
                        </td>

                        {/* Tiêu đề & trích đoạn */}
                        <td className="py-2.5 px-4">
                          <div className="font-medium text-slate-900 line-clamp-1">{b.title}</div>
                          <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{b.excerpt}</div>
                        </td>

                        {/* Chuyên mục (không bị ngắt dòng chữ) */}
                        <td className="py-2.5 px-4 whitespace-nowrap">
                          <span className="inline-block whitespace-nowrap px-2.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded text-[11px] font-medium">
                            {b.category}
                          </span>
                        </td>

                        {/* Ngày đăng (không bị nhảy năm xuống dòng) */}
                        <td className="py-2.5 px-4 whitespace-nowrap text-slate-500">
                          {b.date}
                        </td>

                        {/* Trạng thái Ẩn / Hiện */}
                        <td className="py-2.5 px-4 whitespace-nowrap text-center">
                          {b.hidden ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-500 border border-slate-200">
                              Đã ẩn
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Hiển thị
                            </span>
                          )}
                        </td>

                        {/* Thao tác: Ẩn/Hiện, Sửa, Xóa */}
                        <td className="py-2.5 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleToggleHidden(b)}
                              title={b.hidden ? 'Bật hiển thị lên trang chủ' : 'Ẩn bài khỏi trang chủ'}
                              className={`px-2.5 py-1 text-[11px] font-medium rounded border transition-colors ${
                                b.hidden
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                  : 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
                              }`}
                            >
                              {b.hidden ? 'Hiện bài' : 'Ẩn bài'}
                            </button>
                            <button
                              type="button"
                              onClick={() => openEditModal(b)}
                              className="px-2.5 py-1 text-[11px] font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded transition-colors"
                            >
                              Sửa
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteConfirmId(b.id)}
                              className="px-2.5 py-1 text-[11px] font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded transition-colors"
                            >
                              Xóa
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Modal Thêm / Chỉnh sửa bài viết */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-xl p-6 shadow-xl max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h2 className="text-base font-semibold text-slate-900">
                {isEditing ? 'Chỉnh sửa bài viết' : 'Thêm bài viết mới'}
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Tiêu đề bài viết *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Nhập tiêu đề..."
                  className="w-full px-3 py-2 bg-white border border-slate-300 focus:border-blue-500 rounded-md text-slate-800 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Chuyên mục</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="Ví dụ: Tình cảm & Gắn kết"
                    className="w-full px-3 py-2 bg-white border border-slate-300 focus:border-blue-500 rounded-md text-slate-800 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Ngày hiển thị</label>
                  <input
                    type="text"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    placeholder="Ví dụ: 10 Tháng 10, 2026"
                    className="w-full px-3 py-2 bg-white border border-slate-300 focus:border-blue-500 rounded-md text-slate-800 outline-none"
                  />
                </div>
              </div>

              {/* Tải ảnh từ máy tính (Upload) */}
              <div>
                <label className="block text-slate-700 font-medium mb-1">Ảnh bìa bài viết</label>
                <div className="border border-slate-200 bg-slate-50 rounded-lg p-3 space-y-2">
                  {formData.image ? (
                    <div className="flex items-center gap-3">
                      <img
                        src={formData.image}
                        alt="Ảnh bài viết"
                        className="w-24 h-16 object-cover rounded border border-slate-300"
                      />
                      <div className="space-y-1">
                        <div className="text-[11px] text-slate-500 font-mono break-all">{formData.image}</div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploadingImage}
                            className="px-2.5 py-1 text-[11px] font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded"
                          >
                            {uploadingImage ? 'Đang tải...' : 'Đổi ảnh khác'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setFormData((prev) => ({ ...prev, image: '' }))}
                            className="px-2 py-1 text-[11px] text-rose-600 hover:bg-rose-50 rounded"
                          >
                            Xóa ảnh
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-4 border-2 border-dashed border-slate-300 rounded-md bg-white">
                      <p className="text-xs text-slate-600 mb-2 font-medium">
                        {uploadingImage ? 'Đang tải ảnh lên hệ thống...' : 'Chọn file ảnh từ máy tính của bạn'}
                      </p>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingImage}
                        className="px-3.5 py-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow-xs transition-colors"
                      >
                        {uploadingImage ? 'Đang tải...' : 'Tải ảnh từ máy'}
                      </button>
                    </div>
                  )}

                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleUploadImage}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Tùy chọn Ẩn / Hiện bài viết */}
              <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <input
                  type="checkbox"
                  id="modal-visibility-toggle"
                  checked={!formData.hidden}
                  onChange={(e) => setFormData({ ...formData, hidden: !e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                />
                <label
                  htmlFor="modal-visibility-toggle"
                  className="text-xs font-medium text-slate-700 cursor-pointer select-none"
                >
                  Hiển thị bài viết này ngoài trang chủ (Bỏ tích để ẩn bài viết)
                </label>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Tóm tắt ngắn (Excerpt)</label>
                <textarea
                  rows={2}
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  placeholder="Tóm tắt 1-2 câu hiển thị ở danh sách bài viết..."
                  className="w-full px-3 py-2 bg-white border border-slate-300 focus:border-blue-500 rounded-md text-slate-800 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Nội dung chi tiết (mỗi đoạn xuống dòng)</label>
                <textarea
                  rows={6}
                  value={formData.contentStr}
                  onChange={(e) => setFormData({ ...formData, contentStr: e.target.value })}
                  placeholder="Nhập nội dung bài viết..."
                  className="w-full px-3 py-2 bg-white border border-slate-300 focus:border-blue-500 rounded-md text-slate-800 outline-none leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-1.5 border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium rounded-md transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={uploadingImage}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md shadow-xs transition-colors"
                >
                  {isEditing ? 'Lưu bài viết' : 'Đăng bài viết'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal xác nhận xóa */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white border border-slate-200 rounded-xl p-5 space-y-3.5 text-center shadow-xl">
            <h3 className="text-sm font-semibold text-slate-900">Xác nhận xóa bài viết?</h3>
            <p className="text-xs text-slate-500">
              Bài viết sẽ bị xóa vĩnh viễn và không thể khôi phục lại.
            </p>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-3.5 py-1.5 border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-medium rounded-md transition-colors"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium rounded-md shadow-xs transition-colors"
              >
                Xóa bài viết
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
