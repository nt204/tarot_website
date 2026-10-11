import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import {
  ReadingSession,
  SpreadType,
  TopicType,
  OrientationType,
  ToneType,
  TarotCard,
  DrawnCard,
  ReadingStatus,
  AIReadingResult
} from '@/types/tarot';
import { SPREAD_DEFINITIONS, resolveCardMeaning } from '@/lib/resolver';

const DATA_DIR = path.join(process.cwd(), '.data');
const SESSIONS_FILE = path.join(DATA_DIR, 'sessions.json');
const DAILY_CACHE_FILE = path.join(DATA_DIR, 'daily_cache.json');
const CARDS_FILE = path.join(process.cwd(), 'src/data/tarot_cards.json');
const FALLBACK_CARDS_FILE = path.join(process.cwd(), 'tarot_cards.json');

// Ensure storage directory
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// In-memory cache + file sync
let sessionsCache: Record<string, ReadingSession> = {};
let dailyCache: Record<string, string> = {}; // key: `${userId}_${dateStr}` -> reading_id
let cardsCache: TarotCard[] | null = null;

// Load persisted sessions
if (fs.existsSync(SESSIONS_FILE)) {
  try {
    sessionsCache = JSON.parse(fs.readFileSync(SESSIONS_FILE, 'utf-8'));
  } catch (e) {
    console.error('Failed to load sessions.json:', e);
  }
}

// Load daily cache
if (fs.existsSync(DAILY_CACHE_FILE)) {
  try {
    dailyCache = JSON.parse(fs.readFileSync(DAILY_CACHE_FILE, 'utf-8'));
  } catch (e) {
    console.error('Failed to load daily_cache.json:', e);
  }
}

function persistSessions() {
  try {
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify(sessionsCache, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed to persist sessions:', e);
  }
}

function persistDaily() {
  try {
    fs.writeFileSync(DAILY_CACHE_FILE, JSON.stringify(dailyCache, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed to persist daily cache:', e);
  }
}

export function getAllCards(): TarotCard[] {
  if (cardsCache) return cardsCache;
  const targetPath = fs.existsSync(CARDS_FILE) ? CARDS_FILE : FALLBACK_CARDS_FILE;
  try {
    cardsCache = JSON.parse(fs.readFileSync(targetPath, 'utf-8'));
    return cardsCache!;
  } catch (e) {
    console.error('Failed to load tarot cards:', e);
    return [];
  }
}

export function getCardById(id: number): TarotCard | undefined {
  const cards = getAllCards();
  return cards.find((c) => c.id === id);
}

/**
 * Fisher-Yates shuffle bằng crypto.randomInt (Secure RNG) theo Mục 4
 */
function secureFisherYatesShuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = crypto.randomInt(0, i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Lấy ngày theo múi giờ Asia/Ho_Chi_Minh theo Mục 2A
 */
export function getVietnamDateString(): string {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  return formatter.format(now); // YYYY-MM-DD
}

/**
 * Tạo phiên đọc bài mới (Mục 4 & 5)
 */
export function createReadingSession(params: {
  topic: TopicType;
  spread: SpreadType;
  allow_reversed: boolean;
  tone?: ToneType;
  question?: string;
  context?: string;
  user_fingerprint: string;
  idempotency_key?: string;
}): ReadingSession {
  // Kiểm tra Idempotency key (Mục 10)
  if (params.idempotency_key) {
    const existing = Object.values(sessionsCache).find(
      (s) => s.idempotency_key === params.idempotency_key
    );
    if (existing) {
      return existing;
    }
  }

  // Nếu là trải 1 lá hôm nay, kiểm tra xem người dùng đã rút hôm nay chưa (Mục 2A)
  if (params.spread === 'daily') {
    const dateStr = getVietnamDateString();
    const dailyKey = `${params.user_fingerprint}_${dateStr}`;
    const existingId = dailyCache[dailyKey];
    if (existingId && sessionsCache[existingId]) {
      return sessionsCache[existingId];
    }
  }

  const allCards = getAllCards();
  const allCardIds = allCards.map((c) => c.id);

  // Xào bài bảo mật
  const shuffledIds = secureFisherYatesShuffle(allCardIds);

  // Tạo các slot bí mật (chỉ trả slot token cho client)
  const shuffled_slots = shuffledIds.map((card_id, index) => {
    // Chiều bài: mặc định upright, nếu bật allow_reversed thì 50% ngẫu nhiên
    let orientation: OrientationType = 'upright';
    if (params.allow_reversed) {
      orientation = crypto.randomInt(0, 2) === 1 ? 'reversed' : 'upright';
    }
    return {
      slot_id: `slot_${index}_${crypto.randomBytes(4).toString('hex')}`,
      card_id,
      orientation
    };
  });

  const reading_id = crypto.randomUUID();
  const now = new Date().toISOString();

  const session: ReadingSession = {
    reading_id,
    created_at: now,
    updated_at: now,
    user_fingerprint: params.user_fingerprint,
    topic: params.topic,
    spread: params.spread,
    allow_reversed: params.allow_reversed,
    tone: params.tone || 'gentle',
    question: params.question?.trim().slice(0, 500),
    context: params.context?.trim().slice(0, 1000),
    status: 'selecting',
    shuffled_slots,
    drawn_cards: [],
    retry_count: 0,
    idempotency_key: params.idempotency_key
  };

  sessionsCache[reading_id] = session;
  persistSessions();

  return session;
}

/**
 * Khóa lá bài khi người dùng chọn đủ slot (Mục 4)
 */
export function lockDrawnCards(
  reading_id: string,
  selected_slot_ids: string[]
): { success: boolean; session?: ReadingSession; error?: string } {
  const session = sessionsCache[reading_id];
  if (!session) {
    return { success: false, error: 'Phiên trải bài không tồn tại.' };
  }

  // Nếu bài đã khóa trước đó (reload / gọi lại), giữ nguyên kết quả (Mục 4)
  if (session.status !== 'selecting' && session.drawn_cards.length > 0) {
    return { success: true, session };
  }

  const positions = SPREAD_DEFINITIONS[session.spread];
  const requiredCount = positions.length;

  if (selected_slot_ids.length !== requiredCount) {
    return {
      success: false,
      error: `Kiểu trải bài '${session.spread}' yêu cầu chọn đúng ${requiredCount} lá bài.`
    };
  }

  const drawn_cards: DrawnCard[] = [];
  const chosenCardIds = new Set<number>();

  for (let i = 0; i < requiredCount; i++) {
    const slotId = selected_slot_ids[i];
    const slot = session.shuffled_slots.find((s) => s.slot_id === slotId);

    if (!slot) {
      return { success: false, error: `Vị trí bài '${slotId}' không hợp lệ.` };
    }

    if (chosenCardIds.has(slot.card_id)) {
      return { success: false, error: 'Phát hiện lá bài trùng lặp trong phiên.' };
    }
    chosenCardIds.add(slot.card_id);

    const card = getCardById(slot.card_id);
    if (!card) {
      return { success: false, error: `Không tìm thấy lá bài ID ${slot.card_id}.` };
    }

    const pos = positions[i];
    const resolvedMeaning = resolveCardMeaning(card, session.topic, slot.orientation);

    drawn_cards.push({
      card_id: slot.card_id,
      position_id: pos.id,
      position_name: pos.name_vi,
      position_description: pos.description_vi,
      orientation: slot.orientation,
      card,
      resolved_meaning: resolvedMeaning
    });
  }

  session.drawn_cards = drawn_cards;
  session.status = 'drawn';
  session.updated_at = new Date().toISOString();

  // Lưu cache nếu là trải bài hàng ngày
  if (session.spread === 'daily') {
    const dateStr = getVietnamDateString();
    dailyCache[`${session.user_fingerprint}_${dateStr}`] = session.reading_id;
    persistDaily();
  }

  persistSessions();
  return { success: true, session };
}

export function getSession(reading_id: string): ReadingSession | undefined {
  return sessionsCache[reading_id];
}

export function updateSessionStatus(
  reading_id: string,
  status: ReadingStatus,
  error_message?: string
) {
  const session = sessionsCache[reading_id];
  if (session) {
    session.status = status;
    session.updated_at = new Date().toISOString();
    if (error_message) {
      session.error_message = error_message;
    }
    persistSessions();
  }
}

export function saveAIResult(reading_id: string, ai_result: AIReadingResult) {
  const session = sessionsCache[reading_id];
  if (session) {
    session.ai_result = ai_result;
    session.status = 'completed';
    session.updated_at = new Date().toISOString();
    persistSessions();
  }
}

export function getAllSessions(): ReadingSession[] {
  return Object.values(sessionsCache);
}

