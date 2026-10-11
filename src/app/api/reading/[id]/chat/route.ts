import { NextRequest, NextResponse } from 'next/server';
import {
  getSession,
  getOrCreateChatSession,
  addChatMessage,
  getChatUsage
} from '@/lib/server/store';
import { generateChatReply } from '@/lib/server/ai-service';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = getSession(id);

    if (!session) {
      return NextResponse.json(
        { error: 'Không tìm thấy phiên trải bài tương ứng.' },
        { status: 404 }
      );
    }

    const chatSession = getOrCreateChatSession(
      id,
      session.topic,
      session.question,
      session.drawn_cards.length
    );

    return NextResponse.json({
      success: true,
      chatSession
    });
  } catch (error: any) {
    console.error('Error getting chat session:', error);
    return NextResponse.json(
      { error: error.message || 'Không thể tải phiên trò chuyện.' },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = getSession(id);

    if (!session) {
      return NextResponse.json(
        { error: 'Không tìm thấy phiên trải bài tương ứng.' },
        { status: 404 }
      );
    }

    const body = await req.json();
    const rawMessage = body?.message;

    if (!rawMessage || typeof rawMessage !== 'string' || !rawMessage.trim()) {
      return NextResponse.json(
        { error: 'Nội dung tin nhắn không được để trống.' },
        { status: 400 }
      );
    }

    const message = rawMessage.trim();
    if (message.length > 1000) {
      return NextResponse.json(
        { error: 'Tin nhắn quá dài (tối đa 1000 ký tự).' },
        { status: 400 }
      );
    }

    const chatSession = getOrCreateChatSession(
      id,
      session.topic,
      session.question,
      session.drawn_cards.length
    );

    // Kiểm tra hạn mức sử dụng (Quotas)
    if (chatSession.usage.daily_used >= chatSession.usage.daily_max) {
      return NextResponse.json(
        {
          error: 'QUOTA_EXCEEDED',
          message: 'Bạn đã đạt giới hạn 20 tin nhắn trong ngày hôm nay. Hãy quay lại vào ngày mai nhé!'
        },
        { status: 429 }
      );
    }

    if (chatSession.usage.messages_used >= chatSession.usage.max_messages) {
      return NextResponse.json(
        {
          error: 'MONTHLY_QUOTA_EXCEEDED',
          message: 'Bạn đã sử dụng hết hạn mức tin nhắn của gói. Bạn có thể mở khóa thêm lượt trò chuyện.'
        },
        { status: 403 }
      );
    }

    // 1. Lưu tin nhắn của người dùng
    const userMsg = addChatMessage(id, 'user', message);
    if (!userMsg) {
      throw new Error('Không thể lưu tin nhắn.');
    }

    // 2. Sinh câu trả lời từ Trạm
    const replyText = await generateChatReply(
      session,
      chatSession.messages,
      message
    );

    // 3. Lưu phản hồi của Trạm
    const assistantMsg = addChatMessage(id, 'assistant', replyText);

    return NextResponse.json({
      success: true,
      reply: assistantMsg,
      usage: chatSession.usage
    });
  } catch (error: any) {
    console.error('Error processing chat message:', error);
    return NextResponse.json(
      { error: error.message || 'Trạm tạm thời chưa thể phản hồi. Vui lòng thử lại sau.' },
      { status: 500 }
    );
  }
}
