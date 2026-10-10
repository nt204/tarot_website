import { NextRequest, NextResponse } from 'next/server';
import { lockDrawnCards } from '@/lib/server/store';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { reading_id, selected_slot_ids } = body;

    if (!reading_id || !Array.isArray(selected_slot_ids)) {
      return NextResponse.json({ error: 'Dữ liệu rút bài không hợp lệ.' }, { status: 400 });
    }

    const result = lockDrawnCards(reading_id, selected_slot_ids);

    if (!result.success || !result.session) {
      return NextResponse.json({ error: result.error || 'Không thể khóa bài.' }, { status: 400 });
    }

    const session = result.session;

    return NextResponse.json({
      reading_id: session.reading_id,
      status: session.status,
      drawn_cards: session.drawn_cards,
      spread: session.spread,
      topic: session.topic
    });
  } catch (error: any) {
    console.error('API /draw error:', error);
    return NextResponse.json({ error: error.message || 'Lỗi khi rút bài.' }, { status: 500 });
  }
}
