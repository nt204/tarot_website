import { NextRequest, NextResponse } from 'next/server';

const API_KEY = process.env.CHEAPKEYAI_API_KEY || 'sk-QRN8IP1KBrWdlv6ZujCBk471ZYcwJ8jehrsoITXyVaKPPGD2';
const BASE_URL = process.env.CHEAPKEYAI_BASE_URL || 'https://cheapkeyai.shop/v1';
const MODEL = process.env.AI_MODEL || 'gemini-3.7-flash';

interface QAHistory {
  question: string;
  answer: string;
}

// Bộ câu hỏi dự phòng sâu sắc theo chủ đề nếu AI phản hồi chậm
const FALLBACK_QUESTIONS: Record<number, string[]> = {
  2: [
    'Điều gì bên trong bạn đang cảm thấy lo lắng hoặc tiếc nuối nhất nếu đưa ra quyết định?',
    'Trong tình huống này, bạn cảm thấy mình đang cần sự lắng nghe, sự rõ ràng hay một điểm tựa?',
    'Có điều gì bạn muốn bày tỏ nhưng vẫn đang giữ kín trong lòng chưa thể nói ra?'
  ],
  3: [
    'Nếu được lắng nghe tiếng nói thật nhất từ trái tim mình lúc này, bạn mong muốn kết quả sẽ như thế nào?',
    'Điều gì sẽ giúp bạn cảm thấy bình yên và nhẹ nhõm nhất trong tâm trí?',
    'Bạn muốn lá bài Tarot hôm nay mang đến cho bạn một lời thức tỉnh hay một sự vỗ về?'
  ]
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { history = [], step = 2 } = body as { history: QAHistory[]; step: number };

    const lastAnswer = history[history.length - 1]?.answer?.trim() || '';

    // Nếu câu trả lời quá ngắn hoặc không có
    if (!lastAnswer) {
      const fallbackList = FALLBACK_QUESTIONS[step] || FALLBACK_QUESTIONS[2];
      return NextResponse.json({
        question: fallbackList[Math.floor(Math.random() * fallbackList.length)]
      });
    }

    try {
      const promptMessages = [
        {
          role: 'system',
          content: `Bạn là một Tarot Reader tinh tế, lắng nghe và giàu lòng trắc ẩn tại Trạm Tarot.
Người xem đang có một cuộc trò chuyện riêng tư, tĩnh lặng với bạn trước khi rút bài Tarot.
Họ vừa chia sẻ câu trả lời cho câu hỏi trước.

NHIỆM VỤ CỦA BẠN:
- Đọc kỹ những lời tâm sự của người xem.
- Đặt DUY NHẤT 1 câu hỏi ngắn tiếp theo (tối đa 25-30 từ) để khơi gợi thêm cảm xúc, mâu thuẫn bên trong hoặc điều họ thực sự mong muốn.
- Giọng điệu ấm áp, xưng "bạn", không phán xét, không đưa ra lời khuyên lúc này, không trắc nghiệm A/B, mà là câu hỏi mở chạm vào chiều sâu cảm xúc.

Ví dụ:
Người xem: "Mình đang phân vân có nên chia tay không."
-> "Điều khiến bạn chưa thể rời đi là vì bạn vẫn còn yêu, hay vì bạn sợ phải đối diện với sự trống trải sau đó?"

Người xem: "Công việc hiện tại quá áp lực, mình muốn nghỉ việc nhưng chưa có chỗ mới."
-> "Áp lực lớn nhất lúc này là sự kiệt sức với công việc hiện tại, hay là nỗi sợ bấp bênh tài chính nếu bạn dừng lại?"

CHỈ TRẢ VỀ DUY NHẤT NỘI DUNG CÂU HỎI, KHÔNG KÈM LỜI DẪN, KHÔNG DÙNG NGOẶC KÉP.`
        },
        ...history.map((item) => ([
          { role: 'assistant', content: item.question },
          { role: 'user', content: item.answer }
        ])).flat(),
        {
          role: 'user',
          content: `Dựa vào những gì tôi vừa chia sẻ ở trên, hãy đặt câu hỏi tâm sự tiếp theo bước ${step}/3 cho tôi.`
        }
      ];

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout để giao diện không phải chờ lâu

      const res = await fetch(`${BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
          model: MODEL,
          messages: promptMessages,
          temperature: 0.8,
          max_tokens: 100
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        let generatedQuestion = data.choices?.[0]?.message?.content?.trim();
        if (generatedQuestion) {
          // Bỏ ngoặc kép nếu có
          generatedQuestion = generatedQuestion.replace(/^["'«]+|["'»]+$/g, '');
          return NextResponse.json({ question: generatedQuestion });
        }
      }
    } catch (apiErr) {
      console.warn('AI next-question API timed out or errored, using contextual fallback:', apiErr);
    }

    // Fallback thông minh dựa trên từ khóa trong câu trả lời
    const lower = lastAnswer.toLowerCase();
    let fallbackQuestion = '';

    if (lower.includes('chia tay') || lower.includes('người yêu') || lower.includes('yêu') || lower.includes('tình cảm')) {
      fallbackQuestion = step === 2
        ? 'Điều khiến bạn chưa thể dứt khoát là vì bạn vẫn còn hy vọng, hay vì sợ đối diện với sự mất mát?'
        : 'Sâu thẳm bên trong, bạn mong muốn được lắng nghe một lời xác nhận hay một hướng đi mới cho mối quan hệ này?';
    } else if (lower.includes('công việc') || lower.includes('nghỉ việc') || lower.includes('sếp') || lower.includes('tiền') || lower.includes('sự nghiệp')) {
      fallbackQuestion = step === 2
        ? 'Điều đang níu giữ bạn lúc này là nỗi lo lắng về tài chính, hay sự tiếc nuối những nỗ lực bạn từng bỏ ra?'
        : 'Nếu gạt bỏ mọi nỗi sợ, điều bạn thực sự muốn thấy mình làm trong 6 tháng tới là gì?';
    } else {
      const list = FALLBACK_QUESTIONS[step] || FALLBACK_QUESTIONS[2];
      fallbackQuestion = list[Math.floor(Math.random() * list.length)];
    }

    return NextResponse.json({ question: fallbackQuestion });
  } catch (error: any) {
    return NextResponse.json({
      question: 'Điều bạn thực sự hy vọng lá bài Tarot hôm nay làm sáng tỏ giúp bạn là gì?'
    });
  }
}
