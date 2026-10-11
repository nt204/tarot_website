'use client';

import React from 'react';
import { RealDataSummary } from '@/types/business';

interface UserManagementViewProps {
  realUsers?: RealDataSummary['realUsers'];
}

export const UserManagementView: React.FC<UserManagementViewProps> = ({ realUsers = [] }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Quản lý Người dùng & Hạn mức (User & Quota Management)
          </h2>
          <p className="text-sm text-slate-600 mt-0.5">
            Trích xuất trực tiếp từ danh sách thiết bị và phiên trải bài thực tế trong cơ sở dữ liệu
          </p>
        </div>
        <div className="text-sm text-slate-700 bg-slate-100 px-3.5 py-1.5 rounded-xl border border-slate-200 font-medium">
          Người dùng hoạt động: <span className="font-bold text-slate-900">{realUsers.length} tài khoản/thiết bị</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold text-xs uppercase tracking-wider">
                <th className="py-3 px-4">Định danh người dùng</th>
                <th className="py-3 px-4">Gói dịch vụ</th>
                <th className="py-3 px-4">Tổng lượt trải bài</th>
                <th className="py-3 px-4">Hoàn tất AI</th>
                <th className="py-3 px-4">Chủ đề quan tâm</th>
                <th className="py-3 px-4">Câu hỏi gần nhất</th>
                <th className="py-3 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {realUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Chưa có dữ liệu người dùng
                  </td>
                </tr>
              ) : (
                realUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-900">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span>{user.displayId}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                          user.plan.includes('VIP')
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {user.plan}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-700 text-sm">
                      {user.sessionsCount} lượt
                    </td>
                    <td className="py-3.5 px-4 font-mono text-purple-700 font-semibold">
                      {user.completedCount} lượt
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 text-xs font-medium">
                        {user.topTopic}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-600 italic max-w-xs truncate">
                      &ldquo;{user.lastQuestion}&rdquo;
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => alert(`Đã cấp thêm 1 lượt trải bài chuyên sâu cho ${user.displayId}`)}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-medium transition-colors cursor-pointer"
                      >
                        + Tặng lượt
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
