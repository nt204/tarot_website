'use client';

import React from 'react';
import { AiServiceStat } from '@/types/business';

interface AiManagementViewProps {
  aiStats: AiServiceStat;
}

export const AiManagementView: React.FC<AiManagementViewProps> = ({ aiStats }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h2 className="text-xl font-bold font-heading text-slate-800">
          Quản lý Mô hình AI & Tối ưu Chi phí (AI Management)
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Theo dõi mức tiêu thụ tokens, chi phí trên mỗi lượt trải bài và kiểm soát lỗi
        </p>
      </div>

      {/* 4 Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <span className="text-[11px] text-slate-400 block uppercase">Mô hình vận hành</span>
          <span className="text-base font-bold text-slate-800 mt-1 block">
            {aiStats.model.split('/')[0]}
          </span>
          <span className="text-[11px] text-emerald-600 mt-1 block">Active (Sẵn sàng)</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <span className="text-[11px] text-slate-400 block uppercase">Chi phí AI / Lượt</span>
          <span className="text-2xl font-bold text-amber-600 font-mono mt-1 block">
            ~{aiStats.aiCostPerReading} đ
          </span>
          <span className="text-[11px] text-slate-400 mt-1 block">Dưới ngưỡng trần 1.000đ</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <span className="text-[11px] text-slate-400 block uppercase">Thời gian phản hồi TB</span>
          <span className="text-2xl font-bold text-blue-600 font-mono mt-1 block">
            {(aiStats.avgResponseTimeMs / 1000).toFixed(2)} giây
          </span>
          <span className="text-[11px] text-emerald-600 mt-1 block">Rất mượt mà</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <span className="text-[11px] text-slate-400 block uppercase">Tỷ lệ lỗi (Error Rate)</span>
          <span className="text-2xl font-bold text-emerald-600 font-mono mt-1 block">
            {aiStats.errorRatePct}%
          </span>
          <span className="text-[11px] text-slate-400 mt-1 block">Ổn định &gt; 99.6%</span>
        </div>
      </div>

      {/* Cost Guardrail Strategy */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
        <h3 className="text-base font-bold text-slate-800 font-heading">
          Cơ chế Chống Đốt Chi phí AI & Bảo vệ Tài nguyên (AI Guardrails)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-600">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="font-bold text-slate-800 block text-sm">1. Rate Limiting & Chống Spam Bot</span>
            <p className="leading-relaxed">
              Mỗi thiết bị/phiên chỉ được yêu cầu AI tối đa 1 lần/lượt trải bài. Nếu chưa hoàn tất rút bài hợp lệ trên server, API sẽ chặn cuộc gọi AI để ngăn chặn bot quét tiêu hao token.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="font-bold text-slate-800 block text-sm">2. Cắt giảm Token thừa trong Prompt</span>
            <p className="leading-relaxed">
              System Prompt version <code>{aiStats.promptVersion}</code> được tối ưu xúc tích, giới hạn <code>max_output_tokens: 1500</code> để giữ chi phí cố định ~800đ/lượt trong khi vẫn giữ lời văn ấm áp, sâu sắc.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
