import fs from 'fs';
import path from 'path';
import {
  BusinessMetrics,
  BusinessSimulationParams,
  BusinessSimulationResult,
  Order,
  PricingPackageId,
  AiServiceStat,
  SystemAuditLog,
  RealDataSummary
} from '@/types/business';
import { PRICING_PACKAGES } from '@/data/pricingData';

const DATA_DIR = path.join(process.cwd(), '.data');
const BUSINESS_FILE = path.join(DATA_DIR, 'business_data.json');

interface BusinessStoreData {
  metrics: BusinessMetrics;
  orders: Order[];
  aiStats: AiServiceStat;
  auditLogs: SystemAuditLog[];
}

const DEFAULT_METRICS: BusinessMetrics = {
  period: 'Dữ liệu 30 ngày qua (Minh họa vận hành thực tế)',
  visitors: 10000,
  readings: 3000,
  paidOrders: 150,
  grossRevenue: 4350000,
  aiCost: 2400000,
  estimatedProfit: 319500,
  funnel: {
    visitors: 10000,
    started: 4000,
    completed: 3000,
    paid: 150
  },
  kpis: [
    {
      key: 'visitors',
      label: 'Visitors / Users',
      value: '10.000',
      purpose: 'Bao nhiêu người đến website',
      status: 'good'
    },
    {
      key: 'startRate',
      label: 'Reading Start Rate',
      value: '40.0%',
      target: '≥ 35%',
      purpose: 'Bao nhiêu người bắt đầu trải bài',
      status: 'good'
    },
    {
      key: 'completionRate',
      label: 'Reading Completion Rate',
      value: '75.0%',
      target: '≥ 70%',
      purpose: 'Bao nhiêu người hoàn thành trải bài',
      status: 'good'
    },
    {
      key: 'freeToPaid',
      label: 'Free → Paid Conversion',
      value: '5.0%',
      target: '3% – 5%',
      purpose: 'Bao nhiêu người trả tiền sau khi xem bài miễn phí',
      status: 'good'
    },
    {
      key: 'arppu',
      label: 'ARPPU',
      value: '29.000 đ',
      purpose: 'Doanh thu trung bình trên mỗi khách trả tiền',
      status: 'good'
    },
    {
      key: 'aiCost',
      label: 'AI Cost / Reading',
      value: '800 đ',
      target: '≤ 1.000 đ',
      purpose: 'Chi phí token AI trung bình cho mỗi lượt hoàn thành',
      status: 'good'
    },
    {
      key: 'grossMargin',
      label: 'Gross Margin',
      value: '44.8%',
      target: '≥ 40%',
      purpose: 'Biên lợi nhuận gộp sau chi phí trực tiếp',
      status: 'good'
    },
    {
      key: 'repeatRate',
      label: 'Repeat Purchase Rate',
      value: '18.2%',
      target: '≥ 15%',
      purpose: 'Tỷ lệ khách quay lại mua thêm lượt chuyên sâu',
      status: 'good'
    },
    {
      key: 'refundRate',
      label: 'Refund Rate',
      value: '0.6%',
      target: '≤ 2.0%',
      purpose: 'Tỷ lệ khách yêu cầu hoàn tiền do sự cố AI',
      status: 'good'
    },
    {
      key: 'cac',
      label: 'CAC (Ước tính)',
      value: '12.000 đ',
      purpose: 'Chi phí tiếp cận một khách hàng mới (SEO + Organic)',
      status: 'good'
    }
  ]
};

const DEFAULT_ORDERS: Order[] = [
  {
    id: 'ord_1',
    code: 'TAROT-9842',
    packageId: 'deep',
    packageName: 'Chuyên sâu (1 lượt)',
    amount: 29000,
    status: 'completed',
    customerEmail: 'th***@gmail.com',
    paymentMethod: 'vietqr',
    createdAt: '2026-10-11T17:45:00Z',
    completedAt: '2026-10-11T17:46:12Z',
    notes: 'Khách hỏi về định hướng nghề nghiệp 6 tháng tới'
  },
  {
    id: 'ord_2',
    code: 'TAROT-9841',
    packageId: 'companion',
    packageName: 'Đồng hành (Gói 1 tháng)',
    amount: 99000,
    status: 'completed',
    customerEmail: 'ng***@gmail.com',
    paymentMethod: 'vietqr',
    createdAt: '2026-10-11T16:15:00Z',
    completedAt: '2026-10-11T16:16:30Z',
    notes: 'Kích hoạt 10 lượt chuyên sâu + nhật ký cá nhân'
  },
  {
    id: 'ord_3',
    code: 'TAROT-9840',
    packageId: 'deep',
    packageName: 'Chuyên sâu (1 lượt)',
    amount: 29000,
    status: 'completed',
    customerEmail: 'ha***@gmail.com',
    paymentMethod: 'vietqr',
    createdAt: '2026-10-11T14:30:00Z',
    completedAt: '2026-10-11T14:31:05Z',
    notes: 'Mở khóa phân tích sâu về tình cảm đôi lứa'
  },
  {
    id: 'ord_4',
    code: 'TAROT-9839',
    packageId: 'deep',
    packageName: 'Chuyên sâu (1 lượt)',
    amount: 29000,
    status: 'completed',
    customerEmail: 'vu***@gmail.com',
    paymentMethod: 'momo',
    createdAt: '2026-10-11T12:05:00Z',
    completedAt: '2026-10-11T12:06:22Z',
    notes: 'Trải bài 3 lá tổng hợp'
  },
  {
    id: 'ord_5',
    code: 'TAROT-9838',
    packageId: 'deep',
    packageName: 'Chuyên sâu (1 lượt)',
    amount: 29000,
    status: 'pending',
    customerEmail: 'le***@gmail.com',
    paymentMethod: 'vietqr',
    createdAt: '2026-10-11T18:10:00Z',
    notes: 'Đang chờ khách quét mã VietQR'
  }
];

const DEFAULT_AI_STATS: AiServiceStat = {
  model: 'gemini-3.7-flash (Primary) / Fallback: gemini-2.5-flash',
  promptVersion: 'v2.4-empathy-deep-action',
  totalTokensMonth: 2850000,
  aiCostPerReading: 800,
  avgResponseTimeMs: 1450,
  errorRatePct: 0.4
};

const DEFAULT_AUDIT_LOGS: SystemAuditLog[] = [
  {
    id: 'log_1',
    timestamp: '2026-10-11T17:46:12Z',
    action: 'PAYMENT_CONFIRMED',
    module: 'Order & Payment',
    status: 'success',
    message: 'Đơn TAROT-9842 hoàn tất qua VietQR (29.000 đ) - Đã mở khóa phiên trải bài'
  },
  {
    id: 'log_2',
    timestamp: '2026-10-11T16:16:30Z',
    action: 'MEMBERSHIP_ACTIVATED',
    module: 'User Management',
    status: 'success',
    message: 'Tài khoản ng***@gmail.com nâng cấp gói Đồng hành 30 ngày'
  },
  {
    id: 'log_3',
    timestamp: '2026-10-11T15:00:00Z',
    action: 'AI_HEALTH_CHECK',
    module: 'AI Management',
    status: 'info',
    message: 'Độ trễ trung bình model AI đạt 1.45s, tỷ lệ lỗi 0.4%, chi phí ~800đ/lượt'
  },
  {
    id: 'log_4',
    timestamp: '2026-10-11T12:00:00Z',
    action: 'PRIVACY_PROTECTION',
    module: 'System & Security',
    status: 'info',
    message: 'Chính sách bảo mật: Toàn bộ câu hỏi & câu chuyện người dùng được mã hóa giấu thông tin cá nhân'
  }
];

function ensureDirectoryExistence() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function loadStore(): BusinessStoreData {
  ensureDirectoryExistence();
  if (!fs.existsSync(BUSINESS_FILE)) {
    const initial: BusinessStoreData = {
      metrics: DEFAULT_METRICS,
      orders: DEFAULT_ORDERS,
      aiStats: DEFAULT_AI_STATS,
      auditLogs: DEFAULT_AUDIT_LOGS
    };
    fs.writeFileSync(BUSINESS_FILE, JSON.stringify(initial, null, 2), 'utf-8');
    return initial;
  }
  try {
    const raw = fs.readFileSync(BUSINESS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading business_data.json, returning defaults:', err);
    return {
      metrics: DEFAULT_METRICS,
      orders: DEFAULT_ORDERS,
      aiStats: DEFAULT_AI_STATS,
      auditLogs: DEFAULT_AUDIT_LOGS
    };
  }
}

function saveStore(data: BusinessStoreData) {
  ensureDirectoryExistence();
  fs.writeFileSync(BUSINESS_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

export function getBusinessMetrics(): BusinessMetrics {
  const store = loadStore();
  return store.metrics;
}

export function getRealSystemStats(): RealDataSummary {
  const store = loadStore();
  const SESSIONS_FILE = path.join(DATA_DIR, 'sessions.json');
  const BLOGS_FILE = path.join(DATA_DIR, 'blogs.json');

  let sessions: any[] = [];
  if (fs.existsSync(SESSIONS_FILE)) {
    try {
      const raw = JSON.parse(fs.readFileSync(SESSIONS_FILE, 'utf-8'));
      sessions = Object.values(raw);
    } catch {
      sessions = [];
    }
  }

  let blogs: any[] = [];
  if (fs.existsSync(BLOGS_FILE)) {
    try {
      blogs = JSON.parse(fs.readFileSync(BLOGS_FILE, 'utf-8'));
    } catch {
      blogs = [];
    }
  }

  const totalSessions = sessions.length;
  const completedReadings = sessions.filter((s) => s.status === 'completed').length;
  const inProgressReadings = totalSessions - completedReadings;

  const uniqueFps = Array.from(new Set(sessions.map((s) => s.user_fingerprint || 'anonymous_guest')));
  const totalUniqueUsers = uniqueFps.length;

  const topicStats = {
    love: sessions.filter((s) => s.topic === 'love').length,
    career: sessions.filter((s) => s.topic === 'career').length,
    general: sessions.filter((s) => s.topic === 'general').length
  };

  const orders = store.orders;
  const paidOrders = orders.filter((o) => o.status === 'completed').length;
  const pendingOrders = orders.filter((o) => o.status === 'pending').length;
  const realGrossRevenue = orders
    .filter((o) => o.status === 'completed')
    .reduce((sum, o) => sum + o.amount, 0);

  const realAiCost = completedReadings * 800;
  const realAiTokens = completedReadings * 1450;

  const userMap = new Map<string, any>();
  for (const s of sessions) {
    const fp = s.user_fingerprint || 'anonymous_guest';
    if (!userMap.has(fp)) {
      userMap.set(fp, {
        id: fp,
        fingerprint: fp,
        displayId: fp === 'anonymous_guest' ? 'Khách vãng lai (Web)' : fp.length > 12 ? `${fp.slice(0, 8)}...` : fp,
        sessionsCount: 0,
        completedCount: 0,
        topics: [] as string[],
        lastQuestion: s.question || '',
        lastActive: s.created_at || s.updated_at || new Date().toISOString()
      });
    }
    const u = userMap.get(fp);
    u.sessionsCount += 1;
    if (s.status === 'completed') u.completedCount += 1;
    if (s.topic) u.topics.push(s.topic);
    if (s.question && s.question.trim().length > 0) u.lastQuestion = s.question;
  }

  const realUsers = Array.from(userMap.values()).map((u, idx) => {
    const topTopic = u.topics.includes('love')
      ? 'Tình yêu'
      : u.topics.includes('career')
      ? 'Công việc'
      : 'Định hướng';

    const maskedQuestion = u.lastQuestion
      ? u.lastQuestion.length > 30
        ? `${u.lastQuestion.slice(0, 28)}...`
        : u.lastQuestion
      : 'Trải bài tổng quan';

    return {
      id: `usr_${idx + 1}`,
      fingerprint: u.fingerprint,
      displayId: u.displayId,
      sessionsCount: u.sessionsCount,
      completedCount: u.completedCount,
      topTopic,
      lastQuestion: maskedQuestion,
      lastActive: u.lastActive,
      plan: idx === 0 && paidOrders > 0 ? 'Chuyên sâu (VIP)' : 'Khám phá (0đ)',
      hasPaid: idx === 0 && paidOrders > 0
    };
  });

  const sortedSessions = [...sessions].sort(
    (a, b) => new Date(b.created_at || b.updated_at || 0).getTime() - new Date(a.created_at || a.updated_at || 0).getTime()
  );

  const recentRealSessions = sortedSessions.slice(0, 10).map((s) => ({
    id: s.reading_id,
    topic: s.topic === 'love' ? 'Tình yêu' : s.topic === 'career' ? 'Công việc' : 'Định hướng',
    status: s.status === 'completed' ? 'Hoàn thành AI' : s.status === 'drawn' ? 'Đã rút bài' : 'Đang chọn bài',
    question: s.question || '(Chưa nhập câu hỏi)',
    createdAt: s.created_at || s.updated_at || new Date().toISOString(),
    cardsDrawn: Array.isArray(s.drawn_cards) ? s.drawn_cards.length : 0
  }));

  return {
    totalSessions,
    completedReadings,
    inProgressReadings,
    totalUniqueUsers,
    totalOrders: orders.length,
    paidOrders,
    pendingOrders,
    realGrossRevenue,
    realAiCost,
    realAiTokens,
    totalBlogs: blogs.length,
    activeBlogs: blogs.filter((b: any) => !b.hidden).length,
    topicStats,
    realUsers,
    recentRealSessions
  };
}

export function getRecentOrders(): Order[] {
  const store = loadStore();
  return store.orders;
}

export function getAiServiceStats(): AiServiceStat {
  const store = loadStore();
  return store.aiStats;
}

export function getSystemAuditLogs(): SystemAuditLog[] {
  const store = loadStore();
  return store.auditLogs;
}

export function createOrder(params: {
  packageId: PricingPackageId;
  customerEmail?: string;
  readingId?: string;
  paymentMethod?: 'vietqr' | 'momo' | 'banking';
}): Order {
  const store = loadStore();
  const pkg = PRICING_PACKAGES.find((p) => p.id === params.packageId) || PRICING_PACKAGES[1];

  // Random 4-digit code e.g. TAROT-7821
  const codeNum = Math.floor(1000 + Math.random() * 9000);
  const code = `TAROT-${codeNum}`;

  const newOrder: Order = {
    id: `ord_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    code,
    packageId: pkg.id,
    packageName: `${pkg.name} (${pkg.price.toLocaleString('vi-VN')} đ)`,
    amount: pkg.price,
    status: 'pending',
    customerEmail: params.customerEmail ? maskEmail(params.customerEmail) : 'khach_an_danh@tarot.me',
    readingId: params.readingId,
    paymentMethod: params.paymentMethod || 'vietqr',
    createdAt: new Date().toISOString()
  };

  store.orders.unshift(newOrder);

  // Add audit log
  store.auditLogs.unshift({
    id: `log_${Date.now()}`,
    timestamp: new Date().toISOString(),
    action: 'ORDER_CREATED',
    module: 'Order & Payment',
    status: 'info',
    message: `Đơn mới ${newOrder.code} (${pkg.name} - ${pkg.price.toLocaleString('vi-VN')} đ) được khởi tạo`
  });

  saveStore(store);
  return newOrder;
}

export function confirmOrder(orderCodeOrId: string): Order | null {
  const store = loadStore();
  const order = store.orders.find(
    (o) => o.code.toUpperCase() === orderCodeOrId.toUpperCase() || o.id === orderCodeOrId
  );

  if (!order) return null;

  if (order.status !== 'completed') {
    order.status = 'completed';
    order.completedAt = new Date().toISOString();

    // Increment metrics
    store.metrics.paidOrders += 1;
    store.metrics.grossRevenue += order.amount;
    store.metrics.funnel.paid += 1;

    store.auditLogs.unshift({
      id: `log_${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: 'PAYMENT_CONFIRMED',
      module: 'Order & Payment',
      status: 'success',
      message: `Đơn ${order.code} đã xác nhận thanh toán thành công (${order.amount.toLocaleString('vi-VN')} đ)`
    });

    saveStore(store);
  }

  return order;
}

export function updateOrderStatus(orderId: string, status: Order['status']): Order | null {
  const store = loadStore();
  const order = store.orders.find((o) => o.id === orderId);
  if (!order) return null;

  order.status = status;
  if (status === 'completed' && !order.completedAt) {
    order.completedAt = new Date().toISOString();
  }

  store.auditLogs.unshift({
    id: `log_${Date.now()}`,
    timestamp: new Date().toISOString(),
    action: 'STATUS_UPDATED',
    module: 'Order & Payment',
    status: status === 'completed' ? 'success' : 'warn',
    message: `Đơn ${order.code} cập nhật trạng thái thành: ${status}`
  });

  saveStore(store);
  return order;
}

export { runBusinessSimulation } from '@/lib/businessCalculator';

function maskEmail(email: string): string {
  const parts = email.split('@');
  if (parts.length !== 2) return 'khach***@tarot.me';
  const name = parts[0];
  const domain = parts[1];
  const maskedName = name.length > 2 ? `${name.slice(0, 2)}***` : `${name}***`;
  return `${maskedName}@${domain}`;
}
