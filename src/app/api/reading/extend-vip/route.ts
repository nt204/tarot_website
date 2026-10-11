import { NextRequest, NextResponse } from 'next/server';
import { getSession, extendSessionWithVipCards, saveVIPExtensionResult } from '@/lib/server/store';
import { generateVIPExtension } from '@/lib/server/ai-service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { reading_id, selected_slot_ids } = body;

    if (!reading_id || !Array.isArray(selected_slot_ids) || selected_slot_ids.length !== 2) {
      return NextResponse.json(
        { success: false, error: 'Vui lòng cung cấp mã phiên và chọn đúng 2 lá bài mới.' },
        { status: 400 }
      );
    }

    const session = getSession(reading_id);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Phiên trải bài không tồn tại.' },
        { status: 404 }
      );
    }

    if (!session.ai_result) {
      return NextResponse.json(
        { success: false, error: 'Phiên trải bài cần hoàn tất bản luận giải 3 lá trước khi mở rộng.' },
        { status: 400 }
      );
    }

    // Nếu phiên này đã được mở rộng và có kết quả VIP trước đó (idempotent retry)
    if (session.vip_extension) {
      const existingNewCards = session.drawn_cards.slice(3, 5);
      return NextResponse.json({
        success: true,
        reading_id: session.reading_id,
        new_cards: existingNewCards,
        vip_extension: session.vip_extension
      });
    }

    // Khóa 2 lá mới vào phiên
    const extendResult = extendSessionWithVipCards(reading_id, selected_slot_ids);
    if (!extendResult.success || !extendResult.newCards || !extendResult.session) {
      return NextResponse.json(
        { success: false, error: extendResult.error || 'Không thể mở rộng lá bài.' },
        { status: 400 }
      );
    }

    const updatedSession = extendResult.session;
    const newCards = extendResult.newCards;

    const freeResult = session.ai_result!;

    // Sinh bản mở rộng VIP thông qua AI (kế thừa kết quả 3 lá cũ + giải 2 lá mới + tổng hợp 5 lá)
    const vipExtension = await generateVIPExtension(
      updatedSession,
      freeResult,
      newCards
    );

    // Lưu kết quả mở rộng vào server
    saveVIPExtensionResult(reading_id, vipExtension);

    return NextResponse.json({
      success: true,
      reading_id: updatedSession.reading_id,
      new_cards: newCards,
      vip_extension: vipExtension
    });
  } catch (error: any) {
    console.error('API /api/reading/extend-vip error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Lỗi khi tạo bản mở rộng VIP.' },
      { status: 500 }
    );
  }
}
