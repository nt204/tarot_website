import { BusinessSimulationParams, BusinessSimulationResult } from '@/types/business';

export function runBusinessSimulation(
  params: BusinessSimulationParams
): BusinessSimulationResult {
  const startedReadings = Math.round(params.monthlyVisitors * (params.startRatePct / 100));
  const completedReadings = Math.round(startedReadings * (params.completionRatePct / 100));
  const estimatedOrders = Math.round(completedReadings * (params.paidConversionPct / 100));
  const estimatedRevenue = estimatedOrders * params.deepPrice;
  const estimatedAiCost = completedReadings * params.aiCostPerReading;
  const estimatedPaymentFee = Math.round(estimatedRevenue * (params.paymentFeePct / 100));
  const estimatedNetProfit =
    estimatedRevenue - estimatedAiCost - estimatedPaymentFee - params.fixedMonthlyCosts;
  const netMarginPct =
    estimatedRevenue > 0 ? (estimatedNetProfit / estimatedRevenue) * 100 : 0;

  return {
    startedReadings,
    completedReadings,
    estimatedOrders,
    estimatedRevenue,
    estimatedAiCost,
    estimatedPaymentFee,
    fixedCosts: params.fixedMonthlyCosts,
    estimatedNetProfit,
    netMarginPct
  };
}
