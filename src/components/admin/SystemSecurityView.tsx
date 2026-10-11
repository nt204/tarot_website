'use client';

import React from 'react';
import { SystemAuditLog } from '@/types/business';

interface SystemSecurityViewProps {
  auditLogs: SystemAuditLog[];
}

export const SystemSecurityView: React.FC<SystemSecurityViewProps> = ({ auditLogs }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h2 className="text-xl font-bold font-heading text-slate-800">
          Hệ thống & Quyền Riêng Tư (System & Privacy Security)
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Chính sách bảo mật dữ liệu riêng tư cá nhân và nhật ký kiểm toán hệ thống
        </p>
      </div>

      {/* Privacy Architecture Box */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6 space-y-3">
        <div className="flex items-center gap-2 text-amber-800">
          <span className="text-lg">🛡️</span>
          <h3 className="font-heading font-bold text-sm sm:text-base">
            Nguyên tắc Vàng: Bảo vệ Tính Riêng Tư Tuyệt Đối cho Người Dùng
          </h3>
        </div>
        <p className="text-xs text-amber-900 leading-relaxed max-w-4xl">
          Vì trải bài Tarot chứa đựng những tâm sự, khúc mắc và góc khuất rất nhạy cảm của khách hàng, hệ thống Trạm Tarot áp dụng triệt để các tiêu chuẩn:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs text-amber-950">
          <div className="p-3 bg-white/80 rounded-xl border border-amber-200 space-y-1">
            <span className="font-bold text-amber-800 block">1. Ẩn danh nội dung</span>
            <span>Admin mặc định không đọc câu chuyện riêng tư; chỉ lưu mã hash và chủ đề lớn.</span>
          </div>
          <div className="p-3 bg-white/80 rounded-xl border border-amber-200 space-y-1">
            <span className="font-bold text-amber-800 block">2. Quyền xóa dữ liệu</span>
            <span>Khách hàng có thể nhấn nút xóa phiên bất kỳ lúc nào, dữ liệu sẽ được purge sạch khỏi server.</span>
          </div>
          <div className="p-3 bg-white/80 rounded-xl border border-amber-200 space-y-1">
            <span className="font-bold text-amber-800 block">3. Không dùng cho AI Train</span>
            <span>Dữ liệu tuyệt đối không được đưa vào huấn luyện mô hình bên ngoài hoặc mục đích marketing.</span>
          </div>
        </div>
      </div>

      {/* Audit Logs */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-3 p-6">
        <h3 className="text-base font-bold text-slate-800 font-heading">
          Nhật ký Kiểm toán Hệ thống (System Audit Logs)
        </h3>

        <div className="space-y-2">
          {auditLogs.map((log) => (
            <div
              key={log.id}
              className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700"
            >
              <span className="font-mono text-[11px] text-slate-400 flex-shrink-0 mt-0.5">
                {new Date(log.timestamp).toLocaleTimeString('vi-VN')}
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase flex-shrink-0 ${
                  log.status === 'success'
                    ? 'bg-emerald-100 text-emerald-700'
                    : log.status === 'warn'
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-blue-100 text-blue-700'
                }`}
              >
                {log.action}
              </span>
              <span className="flex-1 text-slate-800">{log.message}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
