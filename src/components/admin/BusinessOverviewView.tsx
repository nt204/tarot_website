'use client';

import React, { useState } from 'react';
import {
  BusinessMetrics,
  BusinessSimulationParams,
  BusinessSimulationResult
} from '@/types/business';
import { runBusinessSimulation } from '@/lib/businessCalculator';

interface BusinessOverviewViewProps {
  metrics: BusinessMetrics;
  onRefresh?: () => void;
}

export const BusinessOverviewView: React.FC<BusinessOverviewViewProps> = ({ metrics }) => {
  // Simulator State
  const [simParams, setSimParams] = useState<BusinessSimulationParams>({
    monthlyVisitors: 10000,
    startRatePct: 40,
    completionRatePct: 75,
    paidConversionPct: 5,
    deepPrice: 29000,
    aiCostPerReading: 800,
    fixedMonthlyCosts: 1500000,
    paymentFeePct: 3
  });

  const [simResult, setSimResult] = useState<BusinessSimulationResult>(() =>
    runBusinessSimulation(simParams)
  );

  const handleParamChange = (field: keyof BusinessSimulationParams, value: number) => {
    const updated = { ...simParams, [field]: value };
    setSimParams(updated);
    setSimResult(runBusinessSimulation(updated));
  };

  return (
    <div className="space-y-8">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 sm:p-8 text-white border border-indigo-900/60 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <span>✦ Vận hành sản phẩm</span>
            <span>•</span>
            <span className="bg-indigo-500/20 text-indigo-300 px-2.5 py-0.5 rounded-full border border-indigo-500/30">
              Mô hình Freemium
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-amber-200">
            Trạm Tarot · Business Overview
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl">
            {metrics.period} · Chuyển dịch từ tư duy quản lý website sang vận hành một sản phẩm công nghệ có doanh thu bền vững.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-right">
            <span className="text-[11px] text-slate-400 block uppercase">Trạng thái</span>
            <span className="text-emerald-400 text-xs font-semibold flex items-center gap-1.5 justify-end">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
              Vận hành ổn định
            </span>
          </div>
        </div>
      </div>

      {/* 2. Top 4 Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-2">
            <span>Người dùng truy cập</span>
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600 font-semibold text-xs">Users</span>
          </div>
          <div className="text-3xl font-bold text-slate-800">
            {metrics.visitors.toLocaleString('vi-VN')}
          </div>
          <div className="text-xs text-slate-400 mt-1">Visitors / Tháng</div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center text-xs text-emerald-600 font-medium">
            <span>↑ 100% tự nhiên từ SEO & Blog</span>
          </div>
        </div>

        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-2">
            <span>Lượt trải bài hoàn thành</span>
            <span className="p-1.5 rounded-lg bg-purple-50 text-purple-600 font-semibold text-xs">Readings</span>
          </div>
          <div className="text-3xl font-bold text-slate-800">
            {metrics.readings.toLocaleString('vi-VN')}
          </div>
          <div className="text-xs text-slate-400 mt-1">Tỷ lệ hoàn thành 75%</div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center text-xs text-slate-500">
            <span>Chi phí AI ước tính: ~800đ/lượt</span>
          </div>
        </div>

        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-2">
            <span>Đơn thanh toán</span>
            <span className="p-1.5 rounded-lg bg-amber-50 text-amber-700 font-semibold text-xs">Paid</span>
          </div>
          <div className="text-3xl font-bold text-slate-800">
            {metrics.paidOrders.toLocaleString('vi-VN')}
          </div>
          <div className="text-xs text-slate-400 mt-1">Gói Chuyên sâu & Đồng hành</div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center text-xs text-emerald-600 font-medium">
            <span>Tỷ lệ chuyển đổi: 5.0% (sau hoàn thành)</span>
          </div>
        </div>

        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-2">
            <span>Doanh thu gộp</span>
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 font-semibold text-xs">Revenue</span>
          </div>
          <div className="text-3xl font-bold text-emerald-700 font-heading">
            {(metrics.grossRevenue / 1000000).toFixed(2)} triệu
          </div>
          <div className="text-xs text-slate-400 mt-1">{metrics.grossRevenue.toLocaleString('vi-VN')} đ</div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center text-xs text-emerald-600 font-medium">
            <span>Lợi nhuận ròng ước tính: ~319k đ</span>
          </div>
        </div>
      </div>

      {/* 3. Phễu chuyển đổi mẫu (Conversion Funnel) */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-800 font-heading">
              Phễu chuyển đổi mẫu (Conversion Funnel)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Hành trình chuyển đổi từ người truy cập tự nhiên đến khách hàng trả phí cho bản chuyên sâu
            </p>
          </div>
          <span className="text-xs font-mono px-3 py-1 bg-slate-100 text-slate-600 rounded-lg self-start">
            Tổng chuyển đổi: 1.5% trên lượt truy cập
          </span>
        </div>

        <div className="space-y-4">
          {/* Step 1: Truy cập website */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold text-slate-700">
              <span className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px]">1</span>
                Truy cập website
              </span>
              <span>10.000 người (100%)</span>
            </div>
            <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full transition-all duration-700" style={{ width: '100%' }} />
            </div>
          </div>

          {/* Step 2: Bắt đầu trải bài */}
          <div className="space-y-1.5 pl-4 border-l-2 border-slate-200">
            <div className="flex justify-between text-xs font-semibold text-slate-700">
              <span className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px]">2</span>
                Bắt đầu trải bài (Click chọn chủ đề / xào bài)
              </span>
              <span>4.000 người (40% trên khách truy cập)</span>
            </div>
            <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 rounded-full transition-all duration-700" style={{ width: '40%' }} />
            </div>
            <div className="text-[11px] text-slate-400 pl-1">
              Rơi rụng (Drop-off): 60% rời đi trước khi bắt đầu
            </div>
          </div>

          {/* Step 3: Hoàn thành trải bài */}
          <div className="space-y-1.5 pl-8 border-l-2 border-slate-200">
            <div className="flex justify-between text-xs font-semibold text-slate-700">
              <span className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px]">3</span>
                Hoàn thành trải bài (Rút đủ lá & nhận kết quả AI miễn phí)
              </span>
              <span>3.000 người (75% người bắt đầu / 30% khách)</span>
            </div>
            <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-purple-500 rounded-full transition-all duration-700" style={{ width: '30%' }} />
            </div>
            <div className="text-[11px] text-slate-400 pl-1">
              Chi phí AI trực tiếp tại bước này: 3.000 lượt × 800đ = 2.400.000 đ
            </div>
          </div>

          {/* Step 4: Thanh toán */}
          <div className="space-y-1.5 pl-12 border-l-2 border-emerald-400">
            <div className="flex justify-between text-xs font-semibold text-emerald-800">
              <span className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px]">4</span>
                Thanh toán mở khóa chuyên sâu (29k) hoặc gói tháng (99k)
              </span>
              <span className="text-emerald-700 font-bold">150 đơn (5% người hoàn thành)</span>
            </div>
            <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full transition-all duration-700" style={{ width: '1.5%' }} />
            </div>
            <div className="text-[11px] text-emerald-600 font-medium pl-1">
              Doanh thu tạo ra: 150 đơn × 29.000đ = 4.350.000 đ
            </div>
          </div>
        </div>
      </div>

      {/* 4. Bảng các chỉ số quan trọng (KPIs Table) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 font-heading">
            Bảng chỉ số vận hành & tài chính cốt lõi (KPIs)
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            10 chỉ số quyết định sống còn của mô hình AI Tarot Freemium
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Chỉ số</th>
                <th className="py-3 px-4">Giá trị hiện tại</th>
                <th className="py-3 px-4">Mục tiêu chuẩn</th>
                <th className="py-3 px-4">Mục đích theo dõi</th>
                <th className="py-3 px-4 text-center">Đánh giá</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {metrics.kpis.map((kpi) => (
                <tr key={kpi.key} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-4 font-semibold text-slate-800">{kpi.label}</td>
                  <td className="py-3 px-4 font-mono font-bold text-blue-600">{kpi.value}</td>
                  <td className="py-3 px-4 text-slate-400 font-mono">{kpi.target || '—'}</td>
                  <td className="py-3 px-4 text-slate-600">{kpi.purpose}</td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Tối ưu
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Công cụ mô phỏng kinh doanh hàng tháng (Interactive Simulation) */}
      <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-2xl p-6 sm:p-8 border border-indigo-900 shadow-xl space-y-6">
        <div>
          <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider block">
            Công cụ giả lập trực quan
          </span>
          <h3 className="text-xl sm:text-2xl font-bold font-heading text-white mt-1">
            Mô phỏng doanh thu và lợi nhuận hàng tháng
          </h3>
          <p className="text-xs text-slate-300 mt-1">
            Điều chỉnh các biến số bên dưới để thấy tác động trực tiếp lên doanh thu, chi phí AI và lợi nhuận ròng.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Controls (7 Cols) */}
          <div className="lg:col-span-7 space-y-4 bg-slate-950/60 p-5 rounded-xl border border-slate-800">
            {/* Visitors Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">Lượt truy cập / tháng</span>
                <span className="font-mono text-amber-300 font-bold">
                  {simParams.monthlyVisitors.toLocaleString('vi-VN')} khách
                </span>
              </div>
              <input
                type="range"
                min="1000"
                max="50000"
                step="1000"
                value={simParams.monthlyVisitors}
                onChange={(e) => handleParamChange('monthlyVisitors', Number(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer"
              />
            </div>

            {/* Start Rate Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">Tỷ lệ bắt đầu trải bài</span>
                <span className="font-mono text-amber-300 font-bold">{simParams.startRatePct}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="80"
                step="5"
                value={simParams.startRatePct}
                onChange={(e) => handleParamChange('startRatePct', Number(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer"
              />
            </div>

            {/* Completion Rate Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">Tỷ lệ hoàn thành</span>
                <span className="font-mono text-amber-300 font-bold">{simParams.completionRatePct}%</span>
              </div>
              <input
                type="range"
                min="30"
                max="95"
                step="5"
                value={simParams.completionRatePct}
                onChange={(e) => handleParamChange('completionRatePct', Number(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer"
              />
            </div>

            {/* Paid Conversion Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">Tỷ lệ mua sau khi hoàn thành</span>
                <span className="font-mono text-amber-300 font-bold">{simParams.paidConversionPct}%</span>
              </div>
              <input
                type="range"
                min="1"
                max="20"
                step="1"
                value={simParams.paidConversionPct}
                onChange={(e) => handleParamChange('paidConversionPct', Number(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer"
              />
            </div>

            {/* Price & Costs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Giá chuyên sâu (đ)</label>
                <input
                  type="number"
                  step="5000"
                  value={simParams.deepPrice}
                  onChange={(e) => handleParamChange('deepPrice', Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs font-mono text-amber-200"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Chi phí AI/lượt (đ)</label>
                <input
                  type="number"
                  step="100"
                  value={simParams.aiCostPerReading}
                  onChange={(e) => handleParamChange('aiCostPerReading', Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs font-mono text-amber-200"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Chi phí cố định (đ)</label>
                <input
                  type="number"
                  step="500000"
                  value={simParams.fixedMonthlyCosts}
                  onChange={(e) => handleParamChange('fixedMonthlyCosts', Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs font-mono text-amber-200"
                />
              </div>
            </div>
          </div>

          {/* Results Summary Box (5 Cols) */}
          <div className="lg:col-span-5 bg-gradient-to-b from-indigo-900/60 to-slate-900/90 p-6 rounded-xl border border-indigo-500/40 space-y-4">
            <h4 className="font-heading text-base font-semibold text-amber-300 uppercase tracking-wider border-b border-indigo-800/80 pb-2">
              Kết quả dự phóng theo tháng
            </h4>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Đơn hàng dự kiến:</span>
                <span className="font-mono font-bold text-white">
                  {simResult.estimatedOrders.toLocaleString('vi-VN')} đơn
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Doanh thu dự kiến:</span>
                <span className="font-mono font-bold text-amber-300 text-sm">
                  {simResult.estimatedRevenue.toLocaleString('vi-VN')} đ
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">
                  Chi phí AI ({simResult.completedReadings.toLocaleString('vi-VN')} lượt × {simParams.aiCostPerReading}đ):
                </span>
                <span className="font-mono text-red-300">
                  - {simResult.estimatedAiCost.toLocaleString('vi-VN')} đ
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Phí cổng thanh toán (3%):</span>
                <span className="font-mono text-slate-400">
                  - {simResult.estimatedPaymentFee.toLocaleString('vi-VN')} đ
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Chi phí cố định (Hosting/Domain):</span>
                <span className="font-mono text-slate-400">
                  - {simResult.fixedCosts.toLocaleString('vi-VN')} đ
                </span>
              </div>
            </div>

            <div className="pt-2 p-3 rounded-lg bg-emerald-950/70 border border-emerald-500/40">
              <span className="text-[11px] text-emerald-300 block uppercase font-medium">
                Lợi nhuận ròng ước tính
              </span>
              <div className="font-heading text-2xl font-bold text-emerald-400 mt-0.5">
                {simResult.estimatedNetProfit.toLocaleString('vi-VN')} đ
              </div>
              <div className="text-[11px] text-emerald-300/80 mt-1">
                Biên lợi nhuận ròng: {simResult.netMarginPct.toFixed(1)}%
              </div>
            </div>

            <p className="text-[10px] text-slate-400 italic">
              * Giả định chưa tính thuế, hoàn tiền, chi phí marketing trả phí và doanh thu từ gói thành viên 99.000đ/tháng.
            </p>
          </div>
        </div>
      </div>

      {/* 6. Kế hoạch vận hành 90 ngày đầu */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div>
          <span className="text-xs uppercase tracking-wider text-blue-600 font-semibold block">
            Chiến lược thực thi
          </span>
          <h3 className="text-lg sm:text-xl font-bold text-slate-800 font-heading mt-1">
            Kế hoạch vận hành 90 ngày đầu cho Trạm Tarot
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Lộ trình từng giai đoạn đảm bảo tối ưu chi phí AI và tạo ra dòng tiền bền vững
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-100 text-blue-700">
                Giai đoạn 1
              </span>
              <span className="text-xs text-slate-400 font-mono">Ngày 1 – 30</span>
            </div>
            <h4 className="font-bold text-sm text-slate-800 font-heading">
              Đo lường & Kiểm chứng
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Tập trung kiểm tra trải nghiệm thực tế, thời gian tải, lỗi AI, chất lượng giải bài và tỷ lệ hoàn thành. Cài tracking analytics: <code>reading_started</code>, <code>reading_completed</code>, <code>paywall_viewed</code>, <code>payment_succeeded</code>.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-amber-50/60 border border-amber-200/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-200 text-amber-800">
                Giai đoạn 2
              </span>
              <span className="text-xs text-slate-400 font-mono">Ngày 31 – 60</span>
            </div>
            <h4 className="font-bold text-sm text-slate-800 font-heading">
              Bắt đầu bán lượt Chuyên sâu
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Ra mắt gói 29.000đ/lượt. Thử nghiệm thông điệp bán hàng và thu thập phản hồi. Kiểm tra đối soát chuyển khoản VietQR, hoàn tiền, giới hạn lượt và cơ chế xử lý khi AI quá tải.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-emerald-50/60 border border-emerald-200/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-200 text-emerald-800">
                Giai đoạn 3
              </span>
              <span className="text-xs text-slate-400 font-mono">Ngày 61 – 90</span>
            </div>
            <h4 className="font-bold text-sm text-slate-800 font-heading">
              Tăng trưởng & Giữ chân khách
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Tập trung SEO, xuất bản Blog đều đặn, đo nguồn khách hàng tự nhiên và tỷ lệ mua lại. Triển khai gói thành viên 99.000đ/tháng khi dữ liệu cho thấy nhu cầu quay lại thường xuyên.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
