export type ArcanaType = 'major' | 'minor';
export type SuitType = 'wands' | 'cups' | 'swords' | 'pentacles' | null;
export type TopicType = 'general' | 'love' | 'career';
export type SpreadType = 'daily' | 'three_cards';
export type OrientationType = 'upright' | 'reversed';
export type ToneType = 'gentle' | 'direct';

export interface TarotCard {
  id: number;
  name: string;
  name_vi: string;
  arcana: ArcanaType;
  suit: SuitType;
  suit_vi?: string;
  image: string;
  number_numerology?: number;
  element?: string;
  planet?: string;
  zodiac?: string;
  yes_no?: string;
  yes_no_reversed?: string;

  // Keywords
  keywords_upright: string[];
  keywords_reversed: string[];
  keywords_upright_vi?: string[];
  keywords_reversed_vi?: string[];

  // Meanings
  meaning_upright: string;
  meaning_reversed: string;
  meaning_upright_vi?: string;
  meaning_reversed_vi?: string;

  // Love
  love?: string;
  love_reversed?: string;
  love_vi?: string;
  love_reversed_vi?: string;

  // Career
  career?: string;
  career_reversed?: string;
  career_vi?: string;
  career_reversed_vi?: string;

  // Mood
  mood?: string;
  mood_reversed?: string;
  mood_vi?: string;
  mood_reversed_vi?: string;

  // Spiritual
  spiritual?: string;
  spiritual_reversed?: string;
  spiritual_vi?: string;
  spiritual_reversed_vi?: string;
}

export interface SpreadPositionDef {
  id: string;
  name_vi: string;
  name_en: string;
  description_vi: string;
}

export interface DrawnCard {
  card_id: number;
  position_id: string;
  position_name: string;
  position_description: string;
  orientation: OrientationType;
  card: TarotCard;
  resolved_meaning: {
    primary_text: string;
    is_vietnamese: boolean;
    fallback_note?: string;
    keywords: string[];
    topic: TopicType;
    orientation: OrientationType;
  };
}

export interface CardReadingAI {
  card_id: number;
  position_id: string;
  card_name: string;
  orientation: string;
  interpretation: string;
}

export interface AIReadingResult {
  summary: string;
  card_readings: CardReadingAI[];
  synthesis: string;
  actions: string[];
  reflection_question: string;
  limitations?: string;
  model_used: string;
  generated_at: string;
}

export type ReadingStatus = 'selecting' | 'drawn' | 'queued' | 'generating' | 'completed' | 'failed' | 'retry_wait';

export interface ReadingSession {
  reading_id: string;
  created_at: string;
  updated_at: string;
  user_fingerprint: string;
  topic: TopicType;
  spread: SpreadType;
  allow_reversed: boolean;
  tone: ToneType;
  question?: string;
  context?: string;
  status: ReadingStatus;
  
  // Shuffled slots (opaque tokens for frontend selection)
  shuffled_slots: {
    slot_id: string;
    card_id: number;
    orientation: OrientationType;
  }[];

  // Selected & locked cards
  drawn_cards: DrawnCard[];
  
  // AI result
  ai_result?: AIReadingResult;
  error_message?: string;
  retry_count: number;
  idempotency_key?: string;
}
