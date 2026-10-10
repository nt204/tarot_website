import { NextRequest, NextResponse } from 'next/server';
import { getSession, updateSessionStatus, saveAIResult } from '@/lib/server/store';
import { generateAIReading } from '@/lib/server/ai-service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { reading_id } = body;

    if (!reading_id) {
      return NextResponse.json({ error: 'Thiếu reading_id.' }, { status: 400 });
    }

    const session = getSession(reading_id);
    if (!session) {
      return NextResponse.json({ error: 'Không tìm thấy phiên trải bài.' }, { status: 404 });
    }

    // Không tin client, chỉ lấy bài từ server đã khóa (Mục 7)
    if (!session.drawn_cards || session.drawn_cards.length === 0) {
      return NextResponse.json({ error: 'Phiên này chưa rút bài.' }, { status: 400 });
    }

    // Nếu đã có kết quả AI từ trước (idempotent / reload), trả về kết quả cũ (Mục 10, 11)
    if (session.status === 'completed' && session.ai_result) {
      return NextResponse.json({
        reading_id: session.reading_id,
        status: session.status,
        ai_result: session.ai_result
      });
    }

    // Kiểm tra câu hỏi bắt buộc khi gọi AI (Mục 3)
    if (!session.question || session.question.trim().length === 0) {
      return NextResponse.json(
        { error: 'Câu hỏi là bắt buộc khi yêu cầu luận giải AI cá nhân hóa.' },
        { status: 400 }
      );
    }

    // Cập nhật trạng thái generating (Mục 10)
    updateSessionStatus(reading_id, 'generating');

    try {
      const aiResult = await generateAIReading(session);
      saveAIResult(reading_id, aiResult);

      return NextResponse.json({
        reading_id: session.reading_id,
        status: 'completed',
        ai_result: aiResult
      });
    } catch (aiErr: any) {
      console.error('AI Generation error:', aiErr);
      const errMsg = aiErr.message || 'Dịch vụ AI phản hồi chậm hoặc tạm gián đoạn.';
      updateSessionStatus(reading_id, 'failed', errMsg);

      return NextResponse.json(
        {
          error: errMsg,
          reading_id: session.reading_id,
          status: 'failed',
          can_retry: true
        },
        { status: 502 }
      );
    }
  } catch (error: any) {
    console.error('API /ai error:', error);
    return NextResponse.json({ error: error.message || 'Lỗi xử lý yêu cầu AI.' }, { status: 500 });
  }
}
