export type PricingPackageId = 'free' | 'deep' | 'companion';

export interface PricingPackage {
  id: PricingPackageId;
  name: string;
  subtitle: string;
  badge?: string;
  price: number; // in VND (e.g. 0, 29000, 99000)
  priceUnit: string; // 'trải nghiệm', 'mỗi lượt', 'mỗi tháng'
  highlight?: boolean;
  features: string[];
  ctaText: string;
  tagline: string;
}

export type OrderStatus = 'pending' | 'completed' | 'cancelled' | 'refunded';

export interface Order {
  id: string;
  code: string; // TAROT-XXXX
  packageId: PricingPackageId;
  packageName: string;
  amount: number;
  status: OrderStatus;
  customerEmail?: string;
  readingId?: string;
  paymentMethod: 'vietqr' | 'momo' | 'banking';
  createdAt: string;
  completedAt?: string;
  notes?: string;
}

export interface FunnelStep {
  label: string;
  count: number;
  percentageFromPrevious: number;
  percentageFromTotal: number;
}

export interface BusinessFunnel {
  visitors: number;
  started: number;
  completed: number;
  paid: number;
}

export interface BusinessKpiItem {
  key: string;
  label: string;
  value: string;
  target?: string;
  purpose: string;
  status?: 'good' | 'warning' | 'alert';
}

export interface BusinessMetrics {
  period: string;
  visitors: number;
  readings: number;
  paidOrders: number;
  grossRevenue: number;
  aiCost: number;
  estimatedProfit: number;
  funnel: BusinessFunnel;
  kpis: BusinessKpiItem[];
}

export interface BusinessSimulationParams {
  monthlyVisitors: number;
  startRatePct: number;
  completionRatePct: number;
  paidConversionPct: number;
  deepPrice: number;
  aiCostPerReading: number;
  fixedMonthlyCosts: number;
  paymentFeePct: number;
}

export interface BusinessSimulationResult {
  startedReadings: number;
  completedReadings: number;
  estimatedOrders: number;
  estimatedRevenue: number;
  estimatedAiCost: number;
  estimatedPaymentFee: number;
  fixedCosts: number;
  estimatedNetProfit: number;
  netMarginPct: number;
}

export interface AiServiceStat {
  model: string;
  promptVersion: string;
  totalTokensMonth: number;
  aiCostPerReading: number;
  avgResponseTimeMs: number;
  errorRatePct: number;
}

export interface SystemAuditLog {
  id: string;
  timestamp: string;
  action: string;
  module: string;
  status: 'info' | 'success' | 'warn';
  message: string;
}

export interface RealDataSummary {
  totalSessions: number;
  completedReadings: number;
  inProgressReadings: number;
  totalUniqueUsers: number;
  totalOrders: number;
  paidOrders: number;
  pendingOrders: number;
  realGrossRevenue: number;
  realAiCost: number;
  realAiTokens: number;
  totalBlogs: number;
  activeBlogs: number;
  topicStats: {
    love: number;
    career: number;
    general: number;
  };
  realUsers: Array<{
    id: string;
    fingerprint: string;
    displayId: string;
    sessionsCount: number;
    completedCount: number;
    topTopic: string;
    lastQuestion: string;
    lastActive: string;
    plan: string;
    hasPaid: boolean;
  }>;
  recentRealSessions: Array<{
    id: string;
    topic: string;
    status: string;
    question: string;
    createdAt: string;
    cardsDrawn: number;
  }>;
}

