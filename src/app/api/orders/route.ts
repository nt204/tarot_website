import { NextRequest, NextResponse } from 'next/server';
import { createOrder, getRecentOrders } from '@/lib/server/businessStore';
import { BANK_CONFIG } from '@/data/pricingData';
import { PricingPackageId } from '@/types/business';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { packageId = 'deep', customerEmail, readingId, paymentMethod = 'vietqr' } = body;

    const order = createOrder({
      packageId: packageId as PricingPackageId,
      customerEmail,
      readingId,
      paymentMethod
    });

    // Tạo link QR VietQR tiêu chuẩn
    // Format: https://img.vietqr.io/image/<BANK_ID>-<ACCOUNT_NO>-compact2.png?amount=<AMOUNT>&addInfo=<TRANSFER_NOTE>&accountName=<ACCOUNT_NAME>
    const addInfo = encodeURIComponent(order.code);
    const accountName = encodeURIComponent(BANK_CONFIG.accountName);
    const qrUrl = `https://img.vietqr.io/image/${BANK_CONFIG.bankId}-${BANK_CONFIG.accountNo}-compact2.png?amount=${order.amount}&addInfo=${addInfo}&accountName=${accountName}`;

    return NextResponse.json({
      success: true,
      order,
      bankInfo: {
        ...BANK_CONFIG,
        transferSyntax: order.code,
        amount: order.amount,
        amountFormatted: `${order.amount.toLocaleString('vi-VN')} đ`
      },
      qrUrl
    });
  } catch (error: any) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Lỗi khi tạo đơn hàng' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    const readingId = searchParams.get('readingId');

    const orders = getRecentOrders();

    if (code) {
      const order = orders.find((o) => o.code.toUpperCase() === code.toUpperCase());
      if (!order) {
        return NextResponse.json({ success: false, error: 'Không tìm thấy đơn hàng' }, { status: 404 });
      }
      return NextResponse.json({ success: true, order });
    }

    if (readingId) {
      const order = orders.find((o) => o.readingId === readingId && o.status === 'completed');
      return NextResponse.json({ success: true, hasPaid: Boolean(order), order });
    }

    return NextResponse.json({ success: true, orders: orders.slice(0, 10) });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
