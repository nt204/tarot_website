import { NextRequest, NextResponse } from 'next/server';
import { confirmOrder } from '@/lib/server/businessStore';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ success: false, error: 'Thiếu mã đơn hàng' }, { status: 400 });
    }

    const order = confirmOrder(id);
    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy đơn hàng cần xác nhận' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Xác nhận thanh toán thành công. Đã mở khóa phiên trải bài chuyên sâu!',
      order
    });
  } catch (error: any) {
    console.error('Error confirming order:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Lỗi xác nhận thanh toán' },
      { status: 500 }
    );
  }
}
