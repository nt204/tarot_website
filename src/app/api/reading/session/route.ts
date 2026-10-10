import { NextRequest, NextResponse } from 'next/server';
import { createReadingSession } from '@/lib/server/store';
import { TopicType, SpreadType, ToneType } from '@/types/tarot';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      topic = 'general',
      spread = 'daily',
      allow_reversed = false,
      tone = 'gentle',
      question = '',
      context = '',
      user_fingerprint = 'anonymous_guest',
      idempotency_key
    } = body;

    // Validate chủ đề & spread hợp lệ (Mục 2)
    if (!['general', 'love', 'career'].includes(topic)) {
      return NextResponse.json({ error: 'Chủ đề không hợp lệ.' }, { status: 400 });
    }
    if (!['daily', 'three_cards'].includes(spread)) {
      return NextResponse.json({ error: 'Kiểu trải bài không hợp lệ.' }, { status: 400 });
    }

    const session = createReadingSession({
      topic: topic as TopicType,
      spread: spread as SpreadType,
      allow_reversed: Boolean(allow_reversed),
      tone: tone as ToneType,
      question: typeof question === 'string' ? question : '',
      context: typeof context === 'string' ? context : '',
      user_fingerprint: String(user_fingerprint || 'anonymous_guest'),
      idempotency_key: idempotency_key ? String(idempotency_key) : undefined
    });

    // Theo Mục 4: "Không gửi danh sách lá chưa mở xuống trình duyệt"
    // Chỉ gửi slot_id dạng opaque token, giấu card_id và orientation cho đến khi rút bài
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
      slots: opaqueSlots,
      drawn_cards: session.drawn_cards,
      ai_result: session.ai_result
    });
  } catch (error: any) {
    console.error('API /session error:', error);
    return NextResponse.json({ error: error.message || 'Lỗi tạo phiên trải bài.' }, { status: 500 });
  }
}
