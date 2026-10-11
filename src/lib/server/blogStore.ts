import fs from 'fs';
import path from 'path';

export interface BlogItem {
  id: string;
  title: string;
  image?: string;
  imageCaption?: string;
  imageSubcaption?: string;
  category: string;
  date: string;
  excerpt: string;
  fullContent: string[];
  hidden?: boolean; // true nếu bài viết bị ẩn khỏi trang chủ
}

const BLOGS_FILE = path.join(process.cwd(), 'src/data/blogs.json');

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

export function getAllBlogs(): BlogItem[] {
  try {
    if (fs.existsSync(BLOGS_FILE)) {
      const data = fs.readFileSync(BLOGS_FILE, 'utf-8');
      return JSON.parse(data) as BlogItem[];
    }
  } catch (error) {
    console.error('Lỗi khi đọc file blogs.json:', error);
  }
  return [];
}

export function getBlogById(id: string): BlogItem | undefined {
  const blogs = getAllBlogs();
  return blogs.find((b) => b.id === id);
}

export function saveBlogs(blogs: BlogItem[]): void {
  try {
    const dir = path.dirname(BLOGS_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(BLOGS_FILE, JSON.stringify(blogs, null, 2), 'utf-8');
  } catch (error) {
    console.error('Lỗi khi lưu file blogs.json:', error);
    throw new Error('Không thể lưu dữ liệu bài viết.');
  }
}

export function createBlog(data: Omit<BlogItem, 'id'> & { id?: string }): BlogItem {
  const blogs = getAllBlogs();
  const id = data.id?.trim() || slugify(data.title) || `blog-${Date.now()}`;

  // Kiểm tra trùng id
  const existingIdx = blogs.findIndex((b) => b.id === id);
  const finalId = existingIdx >= 0 ? `${id}-${Date.now().toString().slice(-4)}` : id;

  const newBlog: BlogItem = {
    ...data,
    id: finalId,
    hidden: data.hidden ?? false,
    date: data.date?.trim() || new Date().toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })
  };

  blogs.unshift(newBlog);
  saveBlogs(blogs);
  return newBlog;
}

export function updateBlog(id: string, data: Partial<BlogItem>): BlogItem {
  const blogs = getAllBlogs();
  const idx = blogs.findIndex((b) => b.id === id);
  if (idx === -1) {
    throw new Error(`Không tìm thấy bài viết với mã ID: ${id}`);
  }

  const updatedBlog: BlogItem = {
    ...blogs[idx],
    ...data,
    id // Giữ nguyên ID
  };

  blogs[idx] = updatedBlog;
  saveBlogs(blogs);
  return updatedBlog;
}

export function toggleBlogHidden(id: string): BlogItem {
  const blogs = getAllBlogs();
  const idx = blogs.findIndex((b) => b.id === id);
  if (idx === -1) {
    throw new Error(`Không tìm thấy bài viết với mã ID: ${id}`);
  }

  blogs[idx].hidden = !blogs[idx].hidden;
  saveBlogs(blogs);
  return blogs[idx];
}

export function deleteBlog(id: string): boolean {
  const blogs = getAllBlogs();
  const filtered = blogs.filter((b) => b.id !== id);
  if (filtered.length === blogs.length) {
    return false;
  }
  saveBlogs(filtered);
  return true;
}

export function reorderBlogs(orderedIds: string[]): BlogItem[] {
  const blogs = getAllBlogs();
  const map = new Map<string, BlogItem>();
  blogs.forEach((b) => map.set(b.id, b));

  const reordered: BlogItem[] = [];
  orderedIds.forEach((id) => {
    const item = map.get(id);
    if (item) {
      reordered.push(item);
      map.delete(id);
    }
  });

  // Giữ lại các bài không nằm trong danh sách truyền vào (nếu có)
  map.forEach((item) => reordered.push(item));

  saveBlogs(reordered);
  return reordered;
}
