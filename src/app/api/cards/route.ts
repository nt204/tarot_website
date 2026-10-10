import { NextResponse } from 'next/server';
import { getAllCards } from '@/lib/server/store';

export async function GET() {
  try {
    const cards = getAllCards();
    return NextResponse.json({ cards, total: cards.length });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Lỗi lấy danh mục bài.' }, { status: 500 });
  }
}
