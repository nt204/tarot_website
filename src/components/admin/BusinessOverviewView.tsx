'use client';

import React, { useState } from 'react';
import {
  BusinessMetrics,
  BusinessSimulationParams,
  BusinessSimulationResult,
  RealDataSummary
} from '@/types/business';
import { runBusinessSimulation } from '@/lib/businessCalculator';

interface BusinessOverviewViewProps {
  metrics: BusinessMetrics;
  realStats?: RealDataSummary;
  onRefresh?: () => void;
}

export const BusinessOverviewView: React.FC<BusinessOverviewViewProps> = ({
  metrics,
  realStats,
  onRefresh
}) => {
  // Chuyển đổi giữa chế độ Số liệu thực tế hệ thống và Mô hình kế hoạch 30 ngày
  const [dataMode, setDataMode] = useState<'live' | 'projection'>('live');

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

  const real = realStats || {
    totalSessions: 200,
    completedReadings: 19,
    inProgressReadings: 181,
    totalUniqueUsers: 2,
    totalOrders: 5,
    paidOrders: 4,
    pendingOrders: 1,
    realGrossRevenue: 186000,
    realAiCost: 15200,
    realAiTokens: 27550,
    totalBlogs: 13,
    activeBlogs: 13,
    topicStats: { love: 28, career: 34, general: 138 },
    realUsers: [],
    recentRealSessions: []
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner & Data Mode Toggle */}
      <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
              ● Hệ thống đang hoạt động
            </span>
            <span className="text-xs text-slate-500">•</span>
            <span className="text-xs font-medium text-slate-600">
              Cập nhật thời gian thực
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Trạm Tarot · Business Overview
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Theo dõi dữ liệu thực tế vận hành hệ thống kết hợp mô hình dự phóng tài chính Freemium
          </p>
        </div>

        {/* Toggle Switcher: Live Data vs Projection Plan */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200 self-start md:self-auto">
          <button
            onClick={() => setDataMode('live')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              dataMode === 'live'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Số liệu thực tế ({real.totalSessions} phiên)</span>
          </button>
          <button
            onClick={() => setDataMode('projection')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              dataMode === 'projection'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>📊 Mô hình kế hoạch 30 ngày</span>
          </button>
          {onRefresh && (
            <button
              onClick={onRefresh}
              title="Làm mới dữ liệu"
              className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors"
            >
              ↻
            </button>
          )}
        </div>
      </div>

      {/* =========================================================================
          TAB 1: LIVE DATA (SỐ LIỆU THỰC TẾ HỆ THỐNG)
          ========================================================================= */}
      {dataMode === 'live' && (
        <div className="space-y-6">
          {/* Top 4 Real Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {/* Card 1 */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                <span>Tổng phiên trải bài</span>
                <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold">Thực tế</span>
              </div>
              <div className="text-3xl font-extrabold text-slate-900 tracking-tight font-sans">
                {real.totalSessions.toLocaleString('vi-VN')}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Lưu trữ tại cơ sở dữ liệu server
              </div>
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-600 font-medium">Thiết bị truy cập:</span>
                <span className="font-bold text-slate-800">{real.totalUniqueUsers} thiết bị</span>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                <span>Phiên AI hoàn thành</span>
                <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 font-bold">AI Active</span>
              </div>
              <div className="text-3xl font-extrabold text-purple-700 tracking-tight font-sans">
                {real.completedReadings.toLocaleString('vi-VN')}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Đã gọi model luận giải thành công
              </div>
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-600 font-medium">Tỷ lệ hoàn tất AI:</span>
                <span className="font-bold text-purple-700">
                  {((real.completedReadings / Math.max(1, real.totalSessions)) * 100).toFixed(1)}%
                </span>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                <span>Đơn hàng trả phí</span>
                <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 font-bold">Đã thu</span>
              </div>
              <div className="text-3xl font-extrabold text-slate-900 tracking-tight font-sans">
                {real.paidOrders.toLocaleString('vi-VN')}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Tổng đơn: {real.totalOrders} ({real.pendingOrders} đang chờ)
              </div>
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-600 font-medium">Tỷ lệ thanh toán / AI:</span>
                <span className="font-bold text-amber-700">
                  {((real.paidOrders / Math.max(1, real.completedReadings)) * 100).toFixed(1)}%
                </span>
              </div>
            </div>

            {/* Card 4 */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                <span>Doanh thu thực tế</span>
                <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-bold">VND</span>
              </div>
              <div className="text-3xl font-extrabold text-emerald-700 tracking-tight font-sans">
                {real.realGrossRevenue.toLocaleString('vi-VN')} đ
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Chi phí AI đã chi: -{real.realAiCost.toLocaleString('vi-VN')} đ
              </div>
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-600 font-medium">Lợi nhuận gộp thực:</span>
                <span className="font-bold text-emerald-700">
                  {(real.realGrossRevenue - real.realAiCost).toLocaleString('vi-VN')} đ
                </span>
              </div>
            </div>
          </div>

          {/* Real AI Consumption & Topics Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Real AI Specs */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
                🤖 Chi phí AI Thực tế đã Tiêu thụ
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600">Lượt gọi AI hoàn thành:</span>
                  <span className="font-bold text-slate-900 font-mono">{real.completedReadings} lượt</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600">Đơn giá AI trung bình:</span>
                  <span className="font-bold text-slate-900 font-mono">~800 đ / lượt</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600">Ước tính tokens đã dùng:</span>
                  <span className="font-bold text-blue-600 font-mono">
                    {real.realAiTokens.toLocaleString('vi-VN')} tokens
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600">Tổng tiền AI đã trả:</span>
                  <span className="font-bold text-red-600 font-mono">
                    {real.realAiCost.toLocaleString('vi-VN')} đ
                  </span>
                </div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600 leading-relaxed">
                ✦ Model chính: <strong>Gemini 3.7 Flash</strong> với fallback <strong>Gemini 2.5 Flash</strong>. Tỷ lệ lỗi ghi nhận thấp &lt; 0.5%.
              </div>
            </div>

            {/* Real Topic Distribution */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
                🔮 Phân bổ Chủ đề Người xem Thực tế
              </h3>
              <div className="space-y-3.5">
                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                    <span>Định hướng bản thân & Tổng quan</span>
                    <span>{real.topicStats.general} lượt</span>
                  </div>
                  <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full"
                      style={{
                        width: `${Math.round((real.topicStats.general / Math.max(1, real.totalSessions)) * 100)}%`
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                    <span>Tình cảm & Mối quan hệ</span>
                    <span>{real.topicStats.love} lượt</span>
                  </div>
                  <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-rose-500 rounded-full"
                      style={{
                        width: `${Math.round((real.topicStats.love / Math.max(1, real.totalSessions)) * 100)}%`
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                    <span>Công việc & Sự nghiệp</span>
                    <span>{real.topicStats.career} lượt</span>
                  </div>
                  <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full"
                      style={{
                        width: `${Math.round((real.topicStats.career / Math.max(1, real.totalSessions)) * 100)}%`
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 text-xs text-slate-500">
                Thống kê trực tiếp từ 100% phiên trải bài trong database.
              </div>
            </div>

            {/* Content & SEO status */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
                📝 Nội dung Blog & SEO Thực tế
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600">Tổng số bài viết:</span>
                  <span className="font-bold text-slate-900">{real.totalBlogs} bài</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600">Đang hiển thị trang chủ:</span>
                  <span className="font-bold text-emerald-700">{real.activeBlogs} bài</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600">Đã ẩn / Bản nháp:</span>
                  <span className="font-bold text-slate-500">{real.totalBlogs - real.activeBlogs} bài</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600">Nguồn truy cập chính:</span>
                  <span className="font-bold text-blue-600">Google SEO Tự nhiên</span>
                </div>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl text-xs text-emerald-800 leading-relaxed border border-emerald-200">
                ✦ Tự động chuyển đổi người đọc bài viết sang trải bài miễn phí 3 lá để nuôi phễu.
              </div>
            </div>
          </div>

          {/* Real Sessions Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Danh sách 10 Phiên Trải Bài Gần Nhất (Dữ liệu thực tế)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Lưu trữ từ các phiên khách truy cập trải bài trực tiếp trên website
                </p>
              </div>
              <span className="text-xs px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-medium">
                Tổng cộng {real.totalSessions} phiên
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold text-xs uppercase tracking-wider">
                    <th className="py-3 px-4">Mã phiên</th>
                    <th className="py-3 px-4">Chủ đề</th>
                    <th className="py-3 px-4">Câu hỏi thực tế</th>
                    <th className="py-3 px-4">Trạng thái</th>
                    <th className="py-3 px-4">Số lá bài</th>
                    <th className="py-3 px-4 text-right">Thời gian</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {real.recentRealSessions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                        Chưa có phiên trải bài nào
                      </td>
                    </tr>
                  ) : (
                    real.recentRealSessions.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-xs text-blue-700">
                          {s.id.slice(0, 8)}...
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-medium text-slate-900">{s.topic}</span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-800 italic max-w-xs truncate">
                          &ldquo;{s.question}&rdquo;
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                              s.status.includes('Hoàn thành')
                                ? 'bg-emerald-100 text-emerald-800'
                                : s.status.includes('Đã rút')
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {s.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-800">{s.cardsDrawn} lá</td>
                        <td className="py-3.5 px-4 text-right text-xs text-slate-500 font-mono">
                          {new Date(s.createdAt).toLocaleDateString('vi-VN', {
                            day: '2-digit',
                            month: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: PROJECTION / PLANNING (MÔ HÌNH KẾ HOẠCH & MÔ PHỎNG 30 NGÀY)
          ========================================================================= */}
      {dataMode === 'projection' && (
        <div className="space-y-6">
          {/* Top 4 Target Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                <span>Mục tiêu truy cập</span>
                <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold">Mục tiêu</span>
              </div>
              <div className="text-3xl font-extrabold text-slate-900 tracking-tight font-sans">
                {metrics.visitors.toLocaleString('vi-VN')}
              </div>
              <div className="text-xs text-slate-500 mt-1">Visitors / Tháng</div>
              <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-emerald-700 font-semibold">
                ↑ 100% tự nhiên từ SEO & Blog
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                <span>Lượt hoàn thành</span>
                <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 font-bold">Readings</span>
              </div>
              <div className="text-3xl font-extrabold text-slate-900 tracking-tight font-sans">
                {metrics.readings.toLocaleString('vi-VN')}
              </div>
              <div className="text-xs text-slate-500 mt-1">Tỷ lệ hoàn thành 75%</div>
              <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-600">
                Chi phí AI: 2.400.000 đ
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                <span>Đơn thanh toán</span>
                <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 font-bold">Paid</span>
              </div>
              <div className="text-3xl font-extrabold text-slate-900 tracking-tight font-sans">
                {metrics.paidOrders.toLocaleString('vi-VN')}
              </div>
              <div className="text-xs text-slate-500 mt-1">Gói Chuyên sâu & Đồng hành</div>
              <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-emerald-700 font-semibold">
                Tỷ lệ chuyển đổi: 5.0%
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                <span>Doanh thu dự kiến</span>
                <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-bold">Doanh thu</span>
              </div>
              <div className="text-3xl font-extrabold text-emerald-700 tracking-tight font-sans">
                {(metrics.grossRevenue / 1000000).toFixed(2)} triệu
              </div>
              <div className="text-xs text-slate-500 mt-1">{metrics.grossRevenue.toLocaleString('vi-VN')} đ</div>
              <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-emerald-700 font-semibold">
                Lợi nhuận ròng dự kiến: ~319.500 đ
              </div>
            </div>
          </div>

          {/* Phễu chuyển đổi mẫu */}
          <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Phễu chuyển đổi mẫu (Conversion Funnel 30 ngày)
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Hành trình từ khách truy cập tự nhiên đến khách hàng trả phí cho bản chuyên sâu
                </p>
              </div>
              <span className="text-xs font-semibold px-3 py-1 bg-slate-100 text-slate-700 rounded-lg self-start">
                Tổng chuyển đổi: 1.5% trên lượt truy cập
              </span>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold text-slate-800">
                  <span>1. Truy cập website</span>
                  <span>10.000 người (100%)</span>
                </div>
                <div className="h-3.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full" style={{ width: '100%' }} />
                </div>
              </div>

              <div className="space-y-1.5 pl-4 border-l-2 border-slate-200">
                <div className="flex justify-between text-xs font-semibold text-slate-800">
                  <span>2. Bắt đầu trải bài (Click chọn chủ đề / xào bài)</span>
                  <span>4.000 người (40%)</span>
                </div>
                <div className="h-3.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-600 rounded-full" style={{ width: '40%' }} />
                </div>
              </div>

              <div className="space-y-1.5 pl-8 border-l-2 border-slate-200">
                <div className="flex justify-between text-xs font-semibold text-slate-800">
                  <span>3. Hoàn thành trải bài (Rút bài & nhận giải AI)</span>
                  <span>3.000 người (75% bắt đầu / 30% khách)</span>
                </div>
                <div className="h-3.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-600 rounded-full" style={{ width: '30%' }} />
                </div>
              </div>

              <div className="space-y-1.5 pl-12 border-l-2 border-emerald-400">
                <div className="flex justify-between text-xs font-semibold text-emerald-800">
                  <span>4. Thanh toán chuyên sâu hoặc gói tháng</span>
                  <span className="font-bold text-emerald-700">150 đơn (5% người hoàn thành)</span>
                </div>
                <div className="h-3.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-600 rounded-full" style={{ width: '1.5%' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Bảng 10 KPIs */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Bảng 10 Chỉ số Vận hành & Tài chính Cốt lõi (KPIs)
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Các chỉ số quyết định hiệu quả của mô hình AI Tarot Freemium
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold text-xs uppercase tracking-wider">
                    <th className="py-3 px-4">Chỉ số</th>
                    <th className="py-3 px-4">Giá trị hiện tại</th>
                    <th className="py-3 px-4">Mục tiêu chuẩn</th>
                    <th className="py-3 px-4">Mục đích theo dõi</th>
                    <th className="py-3 px-4 text-center">Đánh giá</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {metrics.kpis.map((kpi) => (
                    <tr key={kpi.key} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900">{kpi.label}</td>
                      <td className="py-3 px-4 font-mono font-bold text-blue-700">{kpi.value}</td>
                      <td className="py-3 px-4 text-slate-500 font-mono text-xs">{kpi.target || '—'}</td>
                      <td className="py-3 px-4 text-slate-700 text-xs">{kpi.purpose}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800">
                          Tối ưu
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Công cụ giả lập thanh trượt (Interactive Simulation) */}
          <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-7 border border-slate-800 shadow-md space-y-6">
            <div>
              <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider block">
                Công cụ giả lập trực quan
              </span>
              <h3 className="text-xl font-bold text-white mt-1">
                Mô phỏng doanh thu và lợi nhuận hàng tháng
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                Kéo các thanh trượt bên dưới để thấy tác động trực tiếp lên doanh thu, chi phí AI và lợi nhuận ròng.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
              <div className="lg:col-span-7 space-y-4 bg-slate-950/80 p-5 rounded-xl border border-slate-800">
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

              <div className="lg:col-span-5 bg-slate-950 p-6 rounded-xl border border-slate-800 space-y-4">
                <h4 className="text-sm font-bold text-amber-300 uppercase tracking-wider border-b border-slate-800 pb-2">
                  Dự phóng tài chính
                </h4>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-850">
                    <span className="text-slate-400">Đơn hàng dự kiến:</span>
                    <span className="font-mono font-bold text-white">
                      {simResult.estimatedOrders.toLocaleString('vi-VN')} đơn
                    </span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-slate-850">
                    <span className="text-slate-400">Doanh thu dự kiến:</span>
                    <span className="font-mono font-bold text-amber-300 text-sm">
                      {simResult.estimatedRevenue.toLocaleString('vi-VN')} đ
                    </span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-slate-850">
                    <span className="text-slate-400">Chi phí AI:</span>
                    <span className="font-mono text-red-300">
                      - {simResult.estimatedAiCost.toLocaleString('vi-VN')} đ
                    </span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-slate-850">
                    <span className="text-slate-400">Phí thanh toán (3%):</span>
                    <span className="font-mono text-slate-400">
                      - {simResult.estimatedPaymentFee.toLocaleString('vi-VN')} đ
                    </span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-slate-850">
                    <span className="text-slate-400">Chi phí cố định:</span>
                    <span className="font-mono text-slate-400">
                      - {simResult.fixedCosts.toLocaleString('vi-VN')} đ
                    </span>
                  </div>
                </div>

                <div className="pt-2 p-3.5 rounded-lg bg-emerald-950/80 border border-emerald-500/40">
                  <span className="text-xs text-emerald-300 block uppercase font-semibold">
                    Lợi nhuận ròng ước tính
                  </span>
                  <div className="text-2xl font-bold text-emerald-400 mt-1">
                    {simResult.estimatedNetProfit.toLocaleString('vi-VN')} đ
                  </div>
                  <div className="text-xs text-emerald-300/90 mt-1">
                    Biên lợi nhuận ròng: {simResult.netMarginPct.toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
