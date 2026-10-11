import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/server/adminAuth';
import {
  getBusinessMetrics,
  getRealSystemStats,
  getRecentOrders,
  getAiServiceStats,
  getSystemAuditLogs,
  runBusinessSimulation
} from '@/lib/server/businessStore';
import { PRICING_PACKAGES } from '@/data/pricingData';
import { BusinessSimulationParams } from '@/types/business';

export async function GET(req: NextRequest) {
  if (!isAdminAuthenticated(req)) {
    return NextResponse.json({ error: 'Chưa đăng nhập quyền quản trị' }, { status: 401 });
  }

  try {
    const metrics = getBusinessMetrics();
    const realStats = getRealSystemStats();
    const orders = getRecentOrders();
    const aiStats = getAiServiceStats();
    const auditLogs = getSystemAuditLogs();

    return NextResponse.json({
      success: true,
      metrics,
      realStats,
      orders,
      aiStats,
      auditLogs,
      pricing: PRICING_PACKAGES
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!isAdminAuthenticated(req)) {
    return NextResponse.json({ error: 'Chưa đăng nhập quyền quản trị' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { action, params } = body;

    if (action === 'simulate' && params) {
      const result = runBusinessSimulation(params as BusinessSimulationParams);
      return NextResponse.json({ success: true, result });
    }

    return NextResponse.json({ success: false, error: 'Hành động không hợp lệ' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
