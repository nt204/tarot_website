import { NextResponse } from 'next/server';
import { verifyCredentials, createAdminToken, isAdminAuthenticated, ADMIN_USERNAME } from '@/lib/server/adminAuth';

export async function GET(req: Request) {
  const isAuth = isAdminAuthenticated(req);
  return NextResponse.json({
    authenticated: isAuth,
    user: isAuth ? ADMIN_USERNAME : null
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { username, password } = body;

    if (!verifyCredentials(username, password)) {
      return NextResponse.json(
        { success: false, error: 'Tên đăng nhập hoặc mật khẩu không chính xác.' },
        { status: 401 }
      );
    }

    const token = createAdminToken();

    const response = NextResponse.json({
      success: true,
      user: ADMIN_USERNAME,
      token
    });

    // Đặt HttpOnly cookie an toàn trong 7 ngày
    response.cookies.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 // 7 ngày
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Lỗi xử lý đăng nhập.' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  const response = NextResponse.json({
    success: true,
    message: 'Đã đăng xuất thành công.'
  });

  // Xóa cookie admin_token
  response.cookies.set('admin_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0
  });

  return response;
}
