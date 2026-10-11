import { NextResponse } from 'next/server';
import { getAllBlogs, createBlog, updateBlog, deleteBlog, toggleBlogHidden, reorderBlogs } from '@/lib/server/blogStore';
import { isAdminAuthenticated } from '@/lib/server/adminAuth';

export async function GET() {
  try {
    const blogs = getAllBlogs();
    return NextResponse.json({ success: true, blogs, total: blogs.length });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Lỗi khi tải danh sách bài viết.' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    if (!isAdminAuthenticated(req)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Vui lòng đăng nhập quyền quản trị viên.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    if (!body.title || !body.title.trim()) {
      return NextResponse.json(
        { success: false, error: 'Tiêu đề bài viết không được để trống.' },
        { status: 400 }
      );
    }

    const created = createBlog({
      title: body.title.trim(),
      category: body.category?.trim() || 'Góc nhìn & Tâm lý',
      date: body.date?.trim() || '',
      excerpt: body.excerpt?.trim() || '',
      image: body.image?.trim() || '',
      imageCaption: body.imageCaption?.trim() || '',
      imageSubcaption: body.imageSubcaption?.trim() || '',
      hidden: Boolean(body.hidden),
      fullContent: Array.isArray(body.fullContent)
        ? body.fullContent.filter((p: string) => p && p.trim())
        : (body.fullContent || '').split('\n').filter((p: string) => p && p.trim())
    });

    return NextResponse.json({ success: true, blog: created });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Lỗi khi tạo bài viết.' },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    if (!isAdminAuthenticated(req)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Vui lòng đăng nhập quyền quản trị viên.' },
        { status: 401 }
      );
    }

    const body = await req.json();

    // Sắp xếp lại thứ tự bài viết (Kéo thả)
    if (body.action === 'reorder' && Array.isArray(body.orderedIds)) {
      const updatedList = reorderBlogs(body.orderedIds);
      return NextResponse.json({ success: true, blogs: updatedList });
    }

    if (!body.id) {
      return NextResponse.json(
        { success: false, error: 'Thiếu mã ID bài viết cần sửa.' },
        { status: 400 }
      );
    }

    // Nếu chỉ gửi toggleHidden
    if (body.action === 'toggle_hidden') {
      const updated = toggleBlogHidden(body.id);
      return NextResponse.json({ success: true, blog: updated });
    }

    const updated = updateBlog(body.id, {
      title: body.title !== undefined ? body.title.trim() : undefined,
      category: body.category !== undefined ? body.category.trim() : undefined,
      date: body.date !== undefined ? body.date.trim() : undefined,
      excerpt: body.excerpt !== undefined ? body.excerpt.trim() : undefined,
      image: body.image !== undefined ? body.image.trim() : undefined,
      imageCaption: body.imageCaption !== undefined ? body.imageCaption.trim() : undefined,
      imageSubcaption: body.imageSubcaption !== undefined ? body.imageSubcaption.trim() : undefined,
      hidden: typeof body.hidden === 'boolean' ? body.hidden : undefined,
      fullContent: body.fullContent !== undefined
        ? (Array.isArray(body.fullContent)
          ? body.fullContent.filter((p: string) => p && p.trim())
          : (body.fullContent || '').split('\n').filter((p: string) => p && p.trim()))
        : undefined
    });

    return NextResponse.json({ success: true, blog: updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Lỗi khi cập nhật bài viết.' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    if (!isAdminAuthenticated(req)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Vui lòng đăng nhập quyền quản trị viên.' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Thiếu mã ID bài viết cần xóa.' },
        { status: 400 }
      );
    }

    const ok = deleteBlog(id);
    if (!ok) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy bài viết để xóa.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: 'Đã xóa bài viết thành công.' });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Lỗi khi xóa bài viết.' },
      { status: 500 }
    );
  }
}
