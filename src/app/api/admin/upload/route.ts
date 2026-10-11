import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { isAdminAuthenticated } from '@/lib/server/adminAuth';

export async function POST(req: Request) {
  try {
    if (!isAdminAuthenticated(req)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Vui lòng đăng nhập quyền quản trị viên.' },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy file ảnh để tải lên.' },
        { status: 400 }
      );
    }

    // Kiểm tra định dạng ảnh
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { success: false, error: 'Vui lòng chọn file định dạng hình ảnh.' },
        { status: 400 }
      );
    }

    // Giới hạn dung lượng tối đa 5MB
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: 'Dung lượng ảnh không được vượt quá 5MB.' },
        { status: 400 }
      );
    }

    const uploadsDir = path.join(process.cwd(), 'public/uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Tạo tên file an toàn
    const ext = path.extname(file.name) || '.jpg';
    const cleanName = path.basename(file.name, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const fileName = `blog_${Date.now()}_${cleanName}${ext}`;
    const filePath = path.join(uploadsDir, fileName);

    await fs.promises.writeFile(filePath, buffer);

    const publicUrl = `/uploads/${fileName}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName
    });
  } catch (error: any) {
    console.error('Lỗi khi tải ảnh lên:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Lỗi trong quá trình lưu ảnh.' },
      { status: 500 }
    );
  }
}
