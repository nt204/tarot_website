import {
  ReadingSession,
  AIReadingResult,
  CardReadingAI,
  DrawnCard,
  VipExtensionResult,
  NewCardReadingAI
} from '@/types/tarot';

const API_KEY = process.env.CHEAPKEYAI_API_KEY || process.env.AI_API_KEY || '';
const BASE_URL = process.env.CHEAPKEYAI_BASE_URL || 'https://cheapkeyai.shop/v1';
const MODEL = process.env.AI_MODEL || 'gemini-3.7-flash';

/**
 * 1. BASE SYSTEM PROMPT
 * Quy định chung về phong cách, giọng điệu, quy tắc bảo mật và guardrail sức khỏe
 */
const BASE_SYSTEM_PROMPT = `Bạn viết luận giải Tarot bằng tiếng Việt, có chiều sâu, ấm áp và sức hút. Người đọc đang tìm góc nhìn cho một điều khiến họ bối rối hoặc trăn trở. Lời văn cuốn hút, sắc sảo, trực diện, dễ hiểu và có lực.

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
- Xưng “Trạm”, gọi người đọc là “bạn”. Luôn giữ sự ấm áp, đồng hành và thấu cảm.
- Không dùng liên tục các từ “năng lượng”, “vũ trụ”, “chữa lành”, “định mệnh”.
- Lời văn cuốn hút, bám sát cảm xúc thực tế, mạch lạc, dễ hiểu.
- Tuyệt đối không nhắc tới AI, công nghệ, thuật toán hay máy tính trong mọi phần lời giải.

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
   Không ghép các đoạn nghĩa độc lập.

5. Đưa ra lời khuyên cụ thể, phù hợp với bối cảnh:
   Tránh chỉ nói “hãy tin bản thân”, “hãy buông bỏ”, “hãy mở lòng”.
   Nêu rõ nên quan sát, hỏi, viết ra hoặc làm rõ điều gì.

GIỚI HẠN & AN TOÀN TUYỆT ĐỐI
- SỨC KHỎE & Y TẾ: Với các câu hỏi về bệnh lý, đau ốm, triệu chứng thể chất (ví dụ: đau bụng, đầy bụng, bao giờ khỏi...), TUYỆT ĐỐI KHÔNG chẩn đoán nguyên nhân bệnh tật hay đoán định thời gian bình phục. Thông báo rõ Tarot không thể đưa ra kết luận y tế; chỉ tập trung vào việc thư giãn tinh thần, lắng nghe cảm xúc cơ thể và khuyến nghị người xem thăm khám y tế chuyên khoa.
- Không tự gán tổn thương, sang chấn, cô đơn hay tính cách cho người xem khi họ chưa chia sẻ.
- Không khẳng định người khác yêu, lừa dối, phản bội hoặc che giấu điều gì chỉ từ lá bài.
- Không dự báo chắc chắn, bịa ngày tháng hoặc xác suất.
- Không hù dọa, tạo cảm giác cấp bách hay thúc người xem rút thêm bài để tránh một kết quả xấu.
- Không giả danh chuyên gia con người.
- Không nhắc công nghệ trong phần luận giải.`;

/**
 * 2. FREE READING PROMPT
 * Tạo kết quả trải bài 3 lá (Hiện tại · Điều cần chú ý · Hướng hành động)
 * Tinh chỉnh: Rút ngắn phần "Mối liên kết giữa các quân bài" khoảng 20-30% (~60-80 từ)
 */
function buildFreeAIPrompt(session: ReadingSession): { system: string; user: string } {
  const system = `${BASE_SYSTEM_PROMPT}

ĐỘ DÀI & ĐỊNH DẠNG FREE:
- Toàn bài trải 3 lá súc tích, mạch lạc.
- Mục "Mối liên kết giữa các quân bài" (synthesis) được đúc kết ngắn gọn, tinh tế (khoảng 60-80 từ), tránh lặp lại chi tiết từng lá mà nhấn mạnh dòng chảy chuyển hóa xuyên suốt.
- BẮT BUỘC trả lời DUY NHẤT một JSON Object hợp lệ tuân thủ đúng schema cấu trúc được cung cấp.`;

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
  const spreadName = session.spread === 'daily'
    ? 'Thông điệp 1 lá hôm nay'
    : 'Trải bài 3 lá (Hiện tại · Điều cần chú ý · Hướng hành động)';

  const user = `THÔNG TIN NGƯỜI XEM & CÂU HỎI:
- Chủ đề: ${topicName}
- Kiểu trải bài: ${spreadName}
- Câu hỏi người xem đang băn khoăn: ${session.question || 'Tìm góc nhìn định hướng'}
${session.context ? `- Bối cảnh người xem chia sẻ: ${session.context}` : '- Bối cảnh: Chưa chia sẻ thêm (trình bày dưới dạng khả năng để người đọc tự đối chiếu)'}

CÁC LÁ BÀI TRONG TRẢI BÀI:
${cardsContext}

HÃY XUẤT RA CHÍNH XÁC MỘT JSON OBJECT THEO SCHEMA SAU:
{
  "headline": "Tiêu đề lớn tóm tắt mâu thuẫn/tâm trạng cốt lõi (khoảng 6–12 từ, sâu lắng và cuốn hút).",
  "summary": "Góc nhìn tổng thể: Nêu trực diện thông điệp cốt lõi và mâu thuẫn chính người xem đang băn khoăn, giọng văn thấu cảm, sắc sảo (khoảng 60-90 từ).",
  "synthesis": "Mối liên kết giữa các quân bài: Đúc kết nhanh sự đối trọng và dòng chảy chuyển hóa giữa 3 lá bài (khoảng 60-80 từ, súc tích, tránh lặp lại từng lá).",
  "card_readings": [
    ${session.drawn_cards.map(dc => `{
      "card_id": ${dc.card_id},
      "position_id": "${dc.position_id}",
      "card_name": "${dc.card.name}",
      "orientation": "${dc.orientation}",
      "interpretation": "Phân tích lá bài này ở vị trí [${dc.position_name}] đối với câu hỏi của người xem: Nêu cảm xúc/hành động họ có thể nhận biết và điều nên cân nhắc (khoảng 70-95 từ)."
    }`).join(',\n    ')}
  ],
  "actions": [
    "Hành động nhỏ, cụ thể 1 mà người xem có thể thử thực hiện ngay",
    "Hành động nhỏ, cụ thể 2 mà người xem có thể thử thực hiện ngay"
  ],
  "reflection_question": "Một câu hỏi suy ngẫm bám sát tình huống giúp người xem tự soi chiếu.",
  "limitations": ""
}`;

  return { system, user };
}

/**
 * 3. VIP EXTENSION PROMPT
 * Tiếp nối phiên trải bài 3 lá lên 5 lá:
 * Kế thừa kết quả FREE đã tạo, giải nghĩa lá 4 & lá 5, và tổng hợp toàn diện cả 5 lá.
 */
function buildVIPExtensionPrompt(
  session: ReadingSession,
  freeResult: AIReadingResult,
  newCards: DrawnCard[]
): { system: string; user: string } {
  const system = `${BASE_SYSTEM_PROMPT}

VAI TRÒ & NHIỆM VỤ:
Bạn đang tiếp tục một phiên trải bài Tarot đã được giải nghĩa trước đó.
Người dùng đã nhận kết quả FREE với 3 lá bài. Sau khi nâng cấp VIP, họ đã tự tay rút thêm 2 lá để mở rộng góc nhìn từ 3 lá lên 5 lá.
Nhiệm vụ của bạn là mở rộng góc nhìn và chiều sâu của trải bài. TUYỆT ĐỐI KHÔNG TẠO LẠI TOÀN BỘ KẾT QUẢ CŨ.

QUY TẮC BẮT BUỘC:
1. KẾ THỪA KẾT QUẢ FREE:
- Xem kết quả FREE là bối cảnh nền tảng đã diễn ra.
- Không lặp lại toàn bộ phân tích của 3 lá cũ.
- Không phủ nhận kết quả trước đó nếu không có cơ sở xác thực.
- Nếu thấy bản FREE có giả định hẹp, mở rộng nhẹ nhàng và thấu cảm.

2. GIẢI NGHĨA LÁ THỨ 4:
- Vị trí: "Lá thứ 4 · Điều bạn chưa xem xét" (Hidden Aspect).
- Giải nghĩa biểu tượng của lá bài, liên hệ chặt chẽ với câu hỏi và 3 lá ban đầu.
- Gợi mở điểm mù hoặc yếu tố ẩn giấu người xem có thể đang vô tình bỏ qua.

3. GIẢI NGHĨA LÁ THỨ 5:
- Vị trí: "Lá thứ 5 · Một góc nhìn khác để tiến về phía trước" (Alternative Path).
- Phân tích lá bài theo đúng vị trí, liên kết với lá thứ 4 và 3 lá trước.
- Đưa ra một hướng tiếp cận mới mẻ, tự tin và giải phóng bế tắc. Không dự đoán định mệnh cố định.

4. TỔNG HỢP CẢ 5 LÁ (Expanded Synthesis):
- Khi cả năm lá cùng lên tiếng: Hai lá mới bổ sung điều gì cho câu chuyện?
- Góc nhìn nào trở nên sáng tỏ và vững vàng hơn?
- Điều gì người xem cần tiếp tục tự chiêm nghiệm?

5. BA ĐIỀU BẠN CÓ THỂ THỬ TIẾP THEO (Actions):
- Đưa ra 3 gợi ý hành động cụ thể, sâu sắc hơn dựa trên toàn bộ 5 lá bài.
- Không lặp lại nguyên văn 2 gợi ý của bản FREE.

ĐỊNH DẠNG:
BẮT BUỘC trả lời DUY NHẤT một JSON Object hợp lệ theo schema VIP.`;

  // Thông tin 3 lá ban đầu
  const initialCardsContext = session.drawn_cards.slice(0, 3).map((dc, idx) => {
    return `- Lá ${idx + 1} [${dc.position_name}]: ${dc.card.name} (${dc.orientation === 'upright' ? 'Xuôi' : 'Ngược'})`;
  }).join('\n');

  // Thông tin 2 lá mới rút
  const newCardsContext = newCards.map((dc, idx) => {
    const isUp = dc.orientation === 'upright';
    const c = dc.card;
    const meaning = dc.resolved_meaning.primary_text;
    const keywords = dc.resolved_meaning.keywords.join(', ');

    return `Lá thứ ${idx + 4} tại vị trí [${dc.position_name}] (${dc.position_description}):
- Tên lá bài: ${c.name} (card_id: ${dc.card_id}, position_id: ${dc.position_id})
- Chiều bài: ${isUp ? 'Xuôi (Upright)' : 'Ngược (Reversed)'}
- Từ khóa chính: ${keywords}
- Ý nghĩa tham chiếu: ${meaning}`;
  }).join('\n\n');

  const user = `BỐI CẢNH & CÂU HỎI BAN ĐẦU:
- Câu hỏi người xem: "${session.question || 'Góc nhìn định hướng'}"
${session.context ? `- Bối cảnh chia sẻ: ${session.context}` : ''}

KẾT QUẢ BẢN FREE ĐÃ ĐỌC:
- 3 lá ban đầu:
${initialCardsContext}
- Tiêu đề bản FREE: "${freeResult.headline || ''}"
- Góc nhìn tổng thể bản FREE: "${freeResult.summary}"
- Mối liên kết 3 lá bản FREE: "${freeResult.synthesis}"
- 2 hành động FREE đã gợi ý: ${JSON.stringify(freeResult.actions)}

HAI LÁ VIP MỚI RÚT THÊM ĐỂ MỞ RỘNG:
${newCardsContext}

HÃY XUẤT RA CHÍNH XÁC MỘT JSON OBJECT THEO SCHEMA VIP SAU:
{
  "extension_headline": "Tiêu đề ấn tượng cho phần mở rộng VIP (khoảng 6-12 từ, ví dụ: 'Khi góc nhìn mở lối cho hành động mới')",
  "new_card_readings": [
    ${newCards.map(dc => `{
      "card_id": ${dc.card_id},
      "position_id": "${dc.position_id}",
      "card_name": "${dc.card.name}",
      "orientation": "${dc.orientation}",
      "interpretation": "Phân tích lá bài này ở vị trí [${dc.position_name}] bổ sung cho 3 lá ban đầu (khoảng 80-110 từ)."
    }`).join(',\n    ')}
  ],
  "expanded_synthesis": "Khi cả năm lá cùng lên tiếng: Phân tích hai lá mới làm thay đổi và hoàn thiện góc nhìn từ ba lá ban đầu như thế nào (khoảng 100-140 từ, giàu sức gợi mở).",
  "new_insights": [
    "Góc nhìn mới thứ nhất mở ra từ lá thứ 4",
    "Góc nhìn mới thứ hai mở ra từ lá thứ 5"
  ],
  "actions": [
    "Gợi ý hành động thực tế 1 dựa trên trải bài mở rộng 5 lá",
    "Gợi ý hành động thực tế 2 dựa trên trải bài mở rộng 5 lá",
    "Gợi ý hành động thực tế 3 dựa trên trải bài mở rộng 5 lá"
  ],
  "reflection_question": "Một câu hỏi suy ngẫm sâu sắc cho hành trình dài hạn của người xem.",
  "limitations": ""
}`;

  return { system, user };
}

/**
 * Gọi API CheapKeyAI với timeout linh hoạt
 */
async function callModelWithTimeout(
  system: string,
  user: string,
  timeoutMs: number = 25000,
  maxTokens: number = 2500
): Promise<string> {
  if (!API_KEY) {
    throw new Error('Chưa cấu hình CHEAPKEYAI_API_KEY trong biến môi trường.');
  }

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
        max_tokens: maxTokens
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
 * Kiểm định Output AI cho bản FREE (3 lá)
 */
function validateAIResult(parsed: any, session: ReadingSession): AIReadingResult {
  if (!parsed.summary || typeof parsed.summary !== 'string') {
    throw new Error('Dữ liệu AI thiếu trường tóm tắt (summary).');
  }

  const freeCards = session.drawn_cards.slice(0, 3);
  if (!Array.isArray(parsed.card_readings) || parsed.card_readings.length < freeCards.length) {
    throw new Error(`Số lượng diễn giải lá bài không khớp với số lá (${freeCards.length}).`);
  }

  const validatedReadings: CardReadingAI[] = freeCards.map((dc) => {
    const aiItem = parsed.card_readings.find((r: any) => Number(r.card_id) === dc.card_id);
    const interpretation = aiItem?.interpretation || `Diễn giải cho lá ${dc.card.name_vi} tại vị trí ${dc.position_name}.`;
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
 * Kiểm định Output AI cho bản VIP Extension (2 lá mới)
 */
function validateVIPExtensionResult(parsed: any, newCards: DrawnCard[]): VipExtensionResult {
  if (!parsed.expanded_synthesis || typeof parsed.expanded_synthesis !== 'string') {
    throw new Error('Dữ liệu AI VIP thiếu phần tổng hợp mở rộng (expanded_synthesis).');
  }

  if (!Array.isArray(parsed.new_card_readings) || parsed.new_card_readings.length !== newCards.length) {
    throw new Error(`Số lượng diễn giải lá mới (${parsed.new_card_readings?.length}) không khớp với 2 lá VIP.`);
  }

  const validatedNewReadings: NewCardReadingAI[] = newCards.map((dc) => {
    const aiItem = parsed.new_card_readings.find((r: any) => Number(r.card_id) === dc.card_id);
    const interpretation = aiItem?.interpretation || `Góc nhìn mở rộng cho lá ${dc.card.name_vi} tại vị trí ${dc.position_name}.`;
    return {
      card_id: dc.card_id,
      position_id: dc.position_id,
      card_name: dc.card.name,
      orientation: dc.orientation,
      interpretation: interpretation.replace(/<[^>]*>/g, '').trim()
    };
  });

  const actions = Array.isArray(parsed.actions)
    ? parsed.actions.slice(0, 3).map((a: any) => String(a).replace(/<[^>]*>/g, '').trim())
    : [
        'Dành thời gian ghi nhận yếu tố mới vừa được hé mở.',
        'Thảo luận hoặc tự viết lại kế hoạch theo góc nhìn thứ 5.',
        'Kiên định với lựa chọn của bản thân.'
      ];

  const new_insights = Array.isArray(parsed.new_insights)
    ? parsed.new_insights.slice(0, 2).map((i: any) => String(i).replace(/<[^>]*>/g, '').trim())
    : [
        'Một khía cạnh tiềm ẩn đang dần được làm sáng tỏ.',
        'Một lối đi khả thi hơn mở ra thay vì bế tắc cũ.'
      ];

  return {
    extension_headline: String(parsed.extension_headline || 'Khi bức tranh năm lá cùng lên tiếng').replace(/<[^>]*>/g, '').trim(),
    new_card_readings: validatedNewReadings,
    expanded_synthesis: parsed.expanded_synthesis.replace(/<[^>]*>/g, '').trim(),
    new_insights,
    actions,
    reflection_question: String(parsed.reflection_question || 'Lối đi này mang lại cho bạn cảm giác an tâm như thế nào?').replace(/<[^>]*>/g, '').trim(),
    limitations: (parsed.limitations || '').replace(/<[^>]*>/g, '').trim(),
    model_used: MODEL,
    generated_at: new Date().toISOString()
  };
}

/**
 * Thực thi sinh lời giải FREE (3 lá) với tối đa 1 lần retry tự động
 */
export async function generateAIReading(session: ReadingSession): Promise<AIReadingResult> {
  const { system, user } = buildFreeAIPrompt(session);
  let lastError: any = null;

  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const rawOutput = await callModelWithTimeout(system, user, 25000, 2200);
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

  throw new Error(lastError?.message || 'Trạm tạm thời chưa thể kết nối thông điệp sau 2 lần thử.');
}

/**
 * Thực thi sinh lời giải VIP Extension (kế thừa FREE + giải 2 lá mới + tổng hợp 5 lá)
 */
export async function generateVIPExtension(
  session: ReadingSession,
  freeResult: AIReadingResult,
  newCards: DrawnCard[]
): Promise<VipExtensionResult> {
  const { system, user } = buildVIPExtensionPrompt(session, freeResult, newCards);
  let lastError: any = null;

  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      // Cho phép timeout 30s và max_tokens: 3000 cho phần mở rộng 5 lá
      const rawOutput = await callModelWithTimeout(system, user, 30000, 3000);
      const parsed = cleanAndParseJSON(rawOutput);
      return validateVIPExtensionResult(parsed, newCards);
    } catch (err: any) {
      lastError = err;
      console.warn(`Attempt ${attempt} VIP Extension generation failed:`, err.message);
      if (attempt === 1) {
        await new Promise((r) => setTimeout(r, 1000));
      }
    }
  }

  throw new Error(lastError?.message || 'Trạm tạm thời chưa thể tạo bản mở rộng sau 2 lần thử.');
}
