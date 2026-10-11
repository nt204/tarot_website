export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
}

export interface ChatUsage {
  messages_used: number;
  max_messages: number;
  daily_used: number;
  daily_max: number;
  is_premium_unlocked: boolean;
}

export interface ChatSessionData {
  id: string;
  reading_id: string;
  created_at: string;
  updated_at: string;
  messages: ChatMessage[];
  usage: ChatUsage;
}

export interface ChatReplyResponse {
  reply: ChatMessage;
  usage: ChatUsage;
}
