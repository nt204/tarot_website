import { ReadingSession, AIReadingResult, CardReadingAI } from '@/types/tarot';

const API_KEY = process.env.CHEAPKEYAI_API_KEY || 'sk-QRN8IP1KBrWdlv6ZujCBk471ZYcwJ8jehrsoITXyVaKPPGD2';
const BASE_URL = process.env.CHEAPKEYAI_BASE_URL || 'https://cheapkeyai.shop/v1';
const MODEL = process.env.AI_MODEL || 'gemini-3.7-flash';

/**
 * Tạo System Prompt & Context chuẩn theo Mục 3, 7, 8
 */
function buildAIPrompt(session: ReadingSession): { system: string; user: string } {
  const toneDesc = session.tone === 'direct'
    ? 'thẳng thắn, thực tế, đi thẳng vào trọng tâm vấn đề, không né tránh điểm mù'
    : 'dịu dàng, thấu cảm, mang tính chữa lành, động viên và truyền cảm hứng tích cực';

  const system = `Bạn là một Chuyên gia Tarot (Tarot Reader) uyên thâm, đạo đức và sâu sắc.
Văn phong của bạn là tiếng Việt tự nhiên, ${toneDesc}.

QUY TẮC ĐẠO ĐỨC & NGUYÊN TẮC LUẬN GIẢI QUAN TRỌNG:
1. Tarot không phải là công cụ khẳng định tương lai cố định hay bói toán mê tín. Bạn phải hướng người hỏi về quyền tự quyết và trách nhiệm cá nhân.
2. NẾU người hỏi hỏi về "suy nghĩ, cảm xúc của người khác" (người yêu cũ, đồng nghiệp, đối tác): Bạn PHẢI nói rõ ràng rằng Tarot không thể xác minh hay đọc trộm suy nghĩ của bất kỳ ai khác, sau đó chuyển hướng diễn giải về góc nhìn, cảm xúc và sự lựa chọn của chính người hỏi.
3. Lá xuôi ở vị trí Trở ngại: Vẫn là lá xuôi, diễn giải sự thái quá hoặc mặt hạn chế/khó áp dụng của phẩm chất đó.
4. Lá ngược: Không đồng nghĩa với điềm xấu; diễn giải năng lượng bị nghẽn, sự nội tâm hóa hoặc lời nhắc nhở chuyển hóa.
5. Tuyệt đối tuân thủ cấu trúc JSON được yêu cầu, không thêm bớt trường, không bọc văn bản ngoài JSON.`;

  // Xây dựng thông tin từng lá đã rút
  const cardsContext = session.drawn_cards.map((dc, idx) => {
    const isUp = dc.orientation === 'upright';
    const c = dc.card;
    const meaning = dc.resolved_meaning.primary_text;
    const keywords = dc.resolved_meaning.keywords.join(', ');

    return `Lá ${idx + 1} tại vị trí [${dc.position_name}] (${dc.position_description}):
- Tên bài: ${c.name_vi} (${c.name})
- Chiều bài: ${isUp ? 'XUÔI (Upright)' : 'NGƯỢC (Reversed)'}
- Bộ / Ẩn: ${c.arcana === 'major' ? 'Bộ Ẩn Chính' : c.suit_vi || c.suit}
- Từ khóa chính: ${keywords}
- Ý nghĩa tham chiếu: ${meaning}`;
  }).join('\n\n');

  const topicName = session.topic === 'love' ? 'Tình cảm & Mối quan hệ' : session.topic === 'career' ? 'Công việc & Định hướng' : 'Tổng quan cuộc sống';
  const spreadName = session.spread === 'daily' ? 'Một lá hôm nay (Daily Focus)' : 'Ba lá định hướng (Hiện tại - Trở ngại - Hành động)';

  const user = `THÔNG TIN BUỔI TRẢI BÀI:
- Chủ đề: ${topicName}
- Kiểu trải bài: ${spreadName}
- Câu hỏi người dùng: ${session.question || 'Xin thông điệp định hướng tổng quan từ các lá bài.'}
${session.context ? `- Bối cảnh người dùng: ${session.context}` : ''}

CÁC LÁ BÀI ĐÃ KHÓA:
${cardsContext}

YÊU CẦU ĐẦU RA:
Hãy trả lời DUY NHẤT một JSON Object hợp lệ (không kèm lời chào mở đầu hay kết thúc) với cấu trúc sau:
{
  "summary": "Tóm tắt 2-3 câu ngắn gọn cô đọng thông điệp chính.",
  "card_readings": [
    ${session.drawn_cards.map(dc => `{
      "card_id": ${dc.card_id},
      "position_id": "${dc.position_id}",
      "card_name": "${dc.card.name_vi}",
      "orientation": "${dc.orientation}",
      "interpretation": "Phân tích lá bài này ở đúng vị trí ${dc.position_name}, liên kết với câu hỏi và bối cảnh (80-120 từ)."
    }`).join(',\n    ')}
  ],
  "synthesis": "Phần tổng hợp: kết nối dòng chảy năng lượng giữa các lá bài thành một bức tranh liền mạch (100-150 từ).",
  "actions": [
    "Hành động cụ thể 1 nên cân nhắc",
    "Hành động cụ thể 2 nên cân nhắc"
  ],
  "reflection_question": "Một câu hỏi gợi mở để người hỏi tự chiêm nghiệm nội tâm.",
  "limitations": "Lưu ý đạo đức hoặc giới hạn nếu người hỏi hỏi về suy nghĩ người khác hoặc sự kiện tương lai cố định (nếu không có thì để chuỗi rỗng)."
}`;

  return { system, user };
}

/**
 * Gọi API CheapKeyAI với timeout 25s và xử lý kiểm tra (Mục 9, 10)
 */
async function callModelWithTimeout(system: string, user: string, timeoutMs: number = 25000): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(`${BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user }
        ],
        temperature: 0.7,
        max_tokens: 2500
      }),
      signal: controller.signal
    });

    clearTimeout(timer);

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`API HTTP Error ${res.status}: ${errText}`);
    }

    const data = await res.json();
    return data.choices?.[0]?.message?.content || '';
  } catch (err: any) {
    clearTimeout(timer);
    if (err.name === 'AbortError') {
      throw new Error(`AI Request Timeout vượt quá ${timeoutMs / 1000}s`);
    }
    throw err;
  }
}

/**
 * Trích xuất và làm sạch JSON
 */
function cleanAndParseJSON(raw: string): any {
  let text = raw.trim();
  const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (match) {
    text = match[1].trim();
  }
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1) {
    text = text.substring(firstBrace, lastBrace + 1);
  }
  return JSON.parse(text);
}

/**
 * Kiểm định Output AI theo Mục 9
 */
function validateAIResult(parsed: any, session: ReadingSession): AIReadingResult {
  if (!parsed.summary || typeof parsed.summary !== 'string') {
    throw new Error('Dữ liệu AI thiếu trường tóm tắt (summary).');
  }

  if (!Array.isArray(parsed.card_readings) || parsed.card_readings.length !== session.drawn_cards.length) {
    throw new Error(`Số lượng diễn giải lá bài (${parsed.card_readings?.length}) không khớp với số lá đã rút (${session.drawn_cards.length}).`);
  }

  // Khớp chính xác từng card_id và position_id đã khóa trên server (Mục 9)
  const validatedReadings: CardReadingAI[] = session.drawn_cards.map((dc) => {
    const aiItem = parsed.card_readings.find((r: any) => Number(r.card_id) === dc.card_id);
    const interpretation = aiItem?.interpretation || `Diễn giải cho lá ${dc.card.name_vi} tại vị trí ${dc.position_name}.`;
    
    // Sanitize chống XSS
    const cleanInterp = interpretation.replace(/<[^>]*>/g, '');

    return {
      card_id: dc.card_id,
      position_id: dc.position_id,
      card_name: dc.card.name_vi,
      orientation: dc.orientation,
      interpretation: cleanInterp
    };
  });

  const actions = Array.isArray(parsed.actions)
    ? parsed.actions.slice(0, 3).map((a: any) => String(a).replace(/<[^>]*>/g, ''))
    : ['Hãy dành thời gian tĩnh lặng để suy xét cảm xúc bản thân.'];

  return {
    summary: parsed.summary.replace(/<[^>]*>/g, '').trim(),
    card_readings: validatedReadings,
    synthesis: (parsed.synthesis || '').replace(/<[^>]*>/g, '').trim(),
    actions,
    reflection_question: (parsed.reflection_question || 'Bạn học được điều gì về bản thân qua trải bài này?').replace(/<[^>]*>/g, '').trim(),
    limitations: (parsed.limitations || '').replace(/<[^>]*>/g, '').trim(),
    model_used: MODEL,
    generated_at: new Date().toISOString()
  };
}

/**
 * Thực thi sinh lời giải AI với tối đa 1 lần retry tự động (Mục 10)
 */
export async function generateAIReading(session: ReadingSession): Promise<AIReadingResult> {
  const { system, user } = buildAIPrompt(session);

  let lastError: any = null;

  // Thực hiện tối đa 2 lần (1 lần gốc + 1 retry tự động)
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const rawOutput = await callModelWithTimeout(system, user, 25000);
      const parsed = cleanAndParseJSON(rawOutput);
      return validateAIResult(parsed, session);
    } catch (err: any) {
      lastError = err;
      console.warn(`Attempt ${attempt} AI generation failed:`, err.message);
      if (attempt === 1) {
        // Nghỉ 1 giây trước khi thử lại lần 2
        await new Promise((r) => setTimeout(r, 1000));
      }
    }
  }

  throw new Error(lastError?.message || 'Không thể kết nối với dịch vụ AI sau 2 lần thử.');
}
