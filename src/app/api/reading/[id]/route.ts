import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/server/store';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = getSession(id);

    if (!session) {
      return NextResponse.json({ error: 'Không tìm thấy phiên trải bài.' }, { status: 404 });
    }

    // Nếu chưa rút bài, ẩn chi tiết card_id
    const opaqueSlots = session.shuffled_slots.map((s) => ({
      slot_id: s.slot_id
    }));

    return NextResponse.json({
      reading_id: session.reading_id,
      topic: session.topic,
      spread: session.spread,
      status: session.status,
      allow_reversed: session.allow_reversed,
      tone: session.tone,
      question: session.question,
      context: session.context,
      slots: session.status === 'selecting' ? opaqueSlots : undefined,
      drawn_cards: session.drawn_cards,
      ai_result: session.ai_result,
      error_message: session.error_message,
      created_at: session.created_at
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Lỗi lấy thông tin phiên.' }, { status: 500 });
  }
}
