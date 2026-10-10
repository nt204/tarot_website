import { ReadingSession, AIReadingResult, CardReadingAI } from '@/types/tarot';

const API_KEY = process.env.CHEAPKEYAI_API_KEY || 'sk-QRN8IP1KBrWdlv6ZujCBk471ZYcwJ8jehrsoITXyVaKPPGD2';
const BASE_URL = process.env.CHEAPKEYAI_BASE_URL || 'https://cheapkeyai.shop/v1';
const MODEL = process.env.AI_MODEL || 'gemini-3.7-flash';

/**
 * Tạo System Prompt & Context chuẩn theo Mục 3, 7, 8
 */
function buildAIPrompt(session: ReadingSession): { system: string; user: string } {
  const system = `Bạn là một người diễn giải Tarot có hiểu biết sâu sắc, điềm đạm, lắng nghe và tôn trọng người hỏi.
Văn phong của bạn là tiếng Việt tự nhiên, gãy gọn, thấu đáo và thực tế.

NGUYÊN TẮC LUẬN GIẢI CẦN TUÂN THỦ:
1. KHÔNG tự xưng "Tarot Master", "chuyên gia", và KHÔNG lạm dụng các từ sáo rỗng như "tần số", "năng lượng rung động", "vũ trụ gửi tín hiệu".
2. Tập trung giải thích và liên hệ trực tiếp vào câu hỏi và bối cảnh người hỏi chia sẻ.
3. Phân biệt rõ vai trò vị trí trải bài:
   - Cùng một lá bài nhưng ở vị trí "Trở ngại / Điều cần chú ý" phải được giải thích dưới góc nhìn của điểm mù, sự quá mức, hoặc thách thức trong việc áp dụng phẩm chất đó.
   - Ở vị trí "Hướng hành động", hãy gợi mở cách vận dụng phẩm chất của lá bài một cách thiết thực.
4. Nếu người hỏi hỏi về "suy nghĩ hay cảm xúc của người khác" (người yêu cũ, sếp, đồng nghiệp...): Hãy giải thích ngắn gọn, từ tốn rằng Tarot không thể xác minh hay đọc trộm suy nghĩ của ai khác, rồi hướng sự chú ý về cảm xúc, trải nghiệm và quyền lựa chọn của chính người hỏi.
5. Tuyệt đối không phán xét tương lai chắc chắn; hãy giữ vai trò gợi mở để người hỏi tự nhìn nhận bản thân.
6. Trả lời duy nhất một JSON Object hợp lệ, không bọc văn bản bên ngoài.`;

  // Xây dựng thông tin từng lá đã rút
  const cardsContext = session.drawn_cards.map((dc, idx) => {
    const isUp = dc.orientation === 'upright';
    const c = dc.card;
    const meaning = dc.resolved_meaning.primary_text;
    const keywords = dc.resolved_meaning.keywords.join(', ');

    return `Lá ${idx + 1} tại vị trí [${dc.position_name}] (${dc.position_description}):
- Tên bài: ${c.name_vi} (${c.name})
- Chiều bài: ${isUp ? 'Xuôi' : 'Ngược'}
- Từ khóa chính: ${keywords}
- Ý nghĩa cốt lõi: ${meaning}`;
  }).join('\n\n');

  const topicName = session.topic === 'love' ? 'Tình cảm' : session.topic === 'career' ? 'Công việc' : 'Tổng quan';
  const spreadName = session.spread === 'daily' ? 'Thông điệp hôm nay' : 'Góc nhìn cho câu hỏi (Hiện tại · Điều cần chú ý · Hướng hành động)';

  const user = `THÔNG TIN TRẢI BÀI:
- Chủ đề: ${topicName}
- Kiểu trải bài: ${spreadName}
- Điều người dùng muốn hỏi: ${session.question || 'Gợi mở góc nhìn cho ngày hôm nay'}
${session.context ? `- Bối cảnh chia sẻ thêm: ${session.context}` : ''}

CÁC LÁ BÀI TRONG TRẢI BÀI:
${cardsContext}

HÃY TRẢ LỜI ĐÚNG ĐỊNH DẠNG JSON SAU (không có văn bản nào ngoài JSON):
{
  "summary": "Nhận định tổng quan 2-3 câu về mối liên hệ giữa các lá bài và câu hỏi của người hỏi.",
  "card_readings": [
    ${session.drawn_cards.map(dc => `{
      "card_id": ${dc.card_id},
      "position_id": "${dc.position_id}",
      "card_name": "${dc.card.name_vi}",
      "orientation": "${dc.orientation}",
      "interpretation": "Phân tích lá bài này ở đúng vị trí [${dc.position_name}], gắn liền chặt chẽ với câu hỏi và bối cảnh người hỏi (70-110 từ)."
    }`).join(',\n    ')}
  ],
  "synthesis": "Phần kết nối: xâu chuỗi thông điệp từ hiện tại qua điều cần chú ý đến hướng hành động (90-130 từ).",
  "actions": [
    "Hành động cụ thể thứ nhất người hỏi có thể cân nhắc",
    "Hành động cụ thể thứ hai người hỏi có thể cân nhắc"
  ],
  "reflection_question": "Một câu hỏi chân thành để người hỏi tự lắng lại và chiêm nghiệm bản thân.",
  "limitations": "Lưu ý nhẹ nhàng nếu người hỏi hỏi về suy nghĩ người khác hoặc ngày xảy ra sự kiện (nếu không có thì để chuỗi rỗng)."
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
