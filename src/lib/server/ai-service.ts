import { ReadingSession, AIReadingResult, CardReadingAI } from '@/types/tarot';

const API_KEY = process.env.CHEAPKEYAI_API_KEY || 'sk-QRN8IP1KBrWdlv6ZujCBk471ZYcwJ8jehrsoITXyVaKPPGD2';
const BASE_URL = process.env.CHEAPKEYAI_BASE_URL || 'https://cheapkeyai.shop/v1';
const MODEL = process.env.AI_MODEL || 'gemini-3.7-flash';

/**
 * Xây dựng System Prompt & Context chuẩn theo yêu cầu:
 * Giọng ấm áp, tinh tế, gần gũi, có chiều sâu, dễ đồng cảm, thấu hiểu và hướng tới lời khuyên tích cực.
 */
function buildAIPrompt(session: ReadingSession): { system: string; user: string } {
  const system = `Bạn viết luận giải Tarot bằng tiếng Việt, có chiều sâu, ấm áp và sức hút. Người đọc đang tìm góc nhìn cho một điều khiến họ bối rối hoặc trăn trở. Lời văn cuốn hút, sắc sảo, trực diện, dễ hiểu và có lực.

ĐẦU VÀO
- Câu hỏi và bối cảnh người xem.
- Tên lá bài (tiếng Anh chuẩn), chiều xuôi/ngược và vị trí trong trải bài.
- Ý nghĩa tham chiếu của từng lá.

MỤC TIÊU
Giúp người đọc nhận ra:
- Mâu thuẫn nào đang khiến họ khó quyết định.
- Các lá bài gợi mở điều gì về mâu thuẫn đó.
- Họ có thể làm gì tiếp theo trong thực tế.

GIỌNG VĂN
- Trực diện, giàu cảm xúc nhưng không khoa trương.
- Kịch tính vừa phải bằng sự đối lập có căn cứ:
  mong muốn và giới hạn, giữ lại và thay đổi,
  cảm xúc và hành động.
- Dùng câu ngắn tại những điểm nhấn.
- Xưng “bạn”, không lên lớp, không tâng bốc.
- Không dùng liên tục các từ “năng lượng”, “vũ trụ”, “chữa lành”, “định mệnh”.
- Lời văn cuốn hút, bám sát cảm xúc thực tế, mạch lạc, dễ hiểu.

CÁCH PHÂN TÍCH
1. Mở đầu bằng mâu thuẫn cụ thể trong câu hỏi.
   Không mở đầu bằng lịch sử Tarot hoặc nghĩa lá bài.
   Nếu bối cảnh chưa đủ, trình bày đó là khả năng để người đọc đối chiếu, không khẳng định như sự thật.

2. Với mỗi lá bài, viết theo chuỗi:
   Ý nghĩa ở vị trí này → liên hệ với câu hỏi → một biểu hiện thực tế có thể nhận biết → điều người xem nên cân nhắc.

3. Phân biệt rõ:
   - Điều người xem đã chia sẻ.
   - Ý nghĩa biểu tượng của lá bài.
   - Giả thuyết cần người xem tự kiểm tra.
   Không biến biểu tượng thành bằng chứng về đời thực.

4. Kết nối các lá:
   Chúng bổ sung hoặc tạo mâu thuẫn với nhau thế nào?
   Điều đó làm thay đổi cách hiểu câu hỏi ra sao?
   Không ghép ba đoạn nghĩa độc lập.

5. Đưa ra lời khuyên cụ thể, phù hợp với bối cảnh.
   Tránh chỉ nói “hãy tin bản thân”, “hãy buông bỏ”, “hãy mở lòng”.
   Nêu rõ nên quan sát, hỏi, viết ra hoặc làm rõ điều gì.

GIỚI HẠN
- Không tự gán tổn thương, sang chấn, cô đơn hay tính cách cho người xem khi họ chưa chia sẻ.
- Không khẳng định người khác yêu, lừa dối, phản bội hoặc che giấu điều gì chỉ từ lá bài.
- Không dự báo chắc chắn, bịa ngày tháng hoặc xác suất.
- Không hù dọa, tạo cảm giác cấp bách hay thúc người xem rút thêm bài để tránh một kết quả xấu.
- Không giả danh chuyên gia con người.
- Không nhắc công nghệ trong phần luận giải.

ĐỘ DÀI & ĐỊNH DẠNG:
- Độ dài 400–600 từ cho toàn bài trải 3 lá. Mỗi đoạn phải giúp người đọc hiểu thêm một điều.
- Khi thiếu thông tin, giảm mức độ khẳng định và hỏi một câu làm rõ thay vì kéo dài bằng nhận xét chung chung.
- BẮT BUỘC trả lời DUY NHẤT một JSON Object hợp lệ (không kèm theo bất kỳ văn bản nào ngoài JSON), tuân thủ đúng schema cấu trúc được cung cấp.`;

  // Xây dựng thông tin từng lá đã rút
  const cardsContext = session.drawn_cards.map((dc, idx) => {
    const isUp = dc.orientation === 'upright';
    const c = dc.card;
    const meaning = dc.resolved_meaning.primary_text;
    const keywords = dc.resolved_meaning.keywords.join(', ');

    return `Lá ${idx + 1} tại vị trí [${dc.position_name}] (${dc.position_description}):
- Tên lá bài: ${c.name}
- Chiều bài: ${isUp ? 'Xuôi (Upright)' : 'Ngược (Reversed)'}
- Từ khóa chính: ${keywords}
- Ý nghĩa tham chiếu: ${meaning}`;
  }).join('\n\n');

  const topicName = session.topic === 'love' ? 'Tình cảm' : session.topic === 'career' ? 'Công việc' : 'Tổng quan';
  const spreadName = session.spread === 'daily' ? 'Thông điệp 1 lá hôm nay' : 'Trải bài 3 lá (Hiện tại · Điều cần chú ý · Hướng hành động)';

  const user = `THÔNG TIN NGƯỜI XEM & CÂU HỎI:
- Chủ đề: ${topicName}
- Kiểu trải bài: ${spreadName}
- Câu hỏi người xem đang băn khoăn: ${session.question || 'Tìm góc nhìn định hướng cho ngày hôm nay'}
${session.context ? `- Bối cảnh người xem chia sẻ: ${session.context}` : '- Bối cảnh: Chưa chia sẻ thêm (hãy trình bày dưới dạng khả năng để người đọc tự đối chiếu)'}

CÁC LÁ BÀI TRONG TRẢI BÀI:
${cardsContext}

HÃY XUẤT RA CHÍNH XÁC MỘT JSON OBJECT THEO SCHEMA SAU:
{
  "headline": "Tiêu đề lớn tóm tắt mâu thuẫn/tâm trạng cốt lõi (khoảng 6–12 từ, phong cách Cormorant Garamond như 'Giữa mong muốn gần nhau và những điều chưa nói').",
  "summary": "Đoạn 1 của Góc nhìn tổng thể: Nêu trực diện mâu thuẫn chính người xem đang bối rối, không phán xét, giàu cảm xúc và sắc sảo (khoảng 60-80 từ).",
  "synthesis": "Đoạn 2 của Góc nhìn tổng thể: Làm rõ mối liên hệ giữa các lá, gợi mở hướng nhìn nhận tích cực để người xem tìm thấy sự an tâm và thấu hiểu (khoảng 60-80 từ).",
  "card_readings": [
    ${session.drawn_cards.map(dc => `{
      "card_id": ${dc.card_id},
      "position_id": "${dc.position_id}",
      "card_name": "${dc.card.name}",
      "orientation": "${dc.orientation}",
      "interpretation": "Phân tích lá bài này ở vị trí [${dc.position_name}] đối với câu hỏi của người xem: Nêu thực tế cảm xúc/hành động họ có thể nhận biết và điều nên cân nhắc (khoảng 70-100 từ)."
    }`).join(',\n    ')}
  ],
  "actions": [
    "Hành động nhỏ, cụ thể 1 mà người xem có thể thực hiện ngay trong đời thực",
    "Hành động nhỏ, cụ thể 2 mà người xem có thể thực hiện ngay trong đời thực"
  ],
  "reflection_question": "Một câu hỏi suy ngẫm bám sát tình huống giúp người xem tự soi chiếu.",
  "limitations": ""
}`;

  return { system, user };
}

/**
 * Gọi API CheapKeyAI với timeout 25s
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
 * Kiểm định Output AI
 */
function validateAIResult(parsed: any, session: ReadingSession): AIReadingResult {
  if (!parsed.summary || typeof parsed.summary !== 'string') {
    throw new Error('Dữ liệu AI thiếu trường tóm tắt (summary).');
  }

  if (!Array.isArray(parsed.card_readings) || parsed.card_readings.length !== session.drawn_cards.length) {
    throw new Error(`Số lượng diễn giải lá bài (${parsed.card_readings?.length}) không khớp với số lá đã rút (${session.drawn_cards.length}).`);
  }

  // Khớp chính xác từng card_id và position_id đã khóa trên server
  const validatedReadings: CardReadingAI[] = session.drawn_cards.map((dc) => {
    const aiItem = parsed.card_readings.find((r: any) => Number(r.card_id) === dc.card_id);
    const interpretation = aiItem?.interpretation || `Diễn giải cho lá ${dc.card.name_vi} tại vị trí ${dc.position_name}.`;

    // Sanitize chống XSS
    const cleanInterp = interpretation.replace(/<[^>]*>/g, '');

    return {
      card_id: dc.card_id,
      position_id: dc.position_id,
      card_name: dc.card.name,
      orientation: dc.orientation,
      interpretation: cleanInterp
    };
  });

  const actions = Array.isArray(parsed.actions)
    ? parsed.actions.slice(0, 3).map((a: any) => String(a).replace(/<[^>]*>/g, ''))
    : ['Hãy dành thời gian tĩnh lặng để suy xét cảm xúc bản thân.'];

  const rawHeadline = parsed.headline || (session.question ? `Góc nhìn cho: "${session.question}"` : 'Giữa mong muốn và những điều cần thấu hiểu');

  return {
    headline: String(rawHeadline).replace(/<[^>]*>/g, '').trim(),
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
 * Thực thi sinh lời giải AI với tối đa 1 lần retry tự động
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
        await new Promise((r) => setTimeout(r, 1000));
      }
    }
  }

  throw new Error(lastError?.message || 'Không thể kết nối với dịch vụ AI sau 2 lần thử.');
}
