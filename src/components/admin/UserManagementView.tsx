'use client';

import React from 'react';

interface MockUser {
  id: string;
  email: string;
  plan: 'Khám phá (0đ)' | 'Chuyên sâu (VIP)' | 'Đồng hành (Tháng)';
  deepCredits: number;
  totalReadings: number;
  lastActive: string;
}

const MOCK_USERS: MockUser[] = [
  {
    id: 'u_1',
    email: 'th***@gmail.com',
    plan: 'Chuyên sâu (VIP)',
    deepCredits: 1,
    totalReadings: 4,
    lastActive: '10 phút trước'
  },
  {
    id: 'u_2',
    email: 'ng***@gmail.com',
    plan: 'Đồng hành (Tháng)',
    deepCredits: 8,
    totalReadings: 12,
    lastActive: '1 giờ trước'
  },
  {
    id: 'u_3',
    email: 'ha***@gmail.com',
    plan: 'Chuyên sâu (VIP)',
    deepCredits: 0,
    totalReadings: 3,
    lastActive: '3 giờ trước'
  },
  {
    id: 'u_4',
    email: 'khach_an_danh_189@tarot.me',
    plan: 'Khám phá (0đ)',
    deepCredits: 0,
    totalReadings: 1,
    lastActive: '15 phút trước'
  },
  {
    id: 'u_5',
    email: 'khach_an_danh_192@tarot.me',
    plan: 'Khám phá (0đ)',
    deepCredits: 0,
    totalReadings: 2,
    lastActive: '25 phút trước'
  }
];

export const UserManagementView: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-heading text-slate-800">
            Quản lý Người dùng & Hạn mức (User & Quota Management)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Theo dõi người dùng, gói thành viên đang kích hoạt và hạn mức lượt chuyên sâu còn lại
          </p>
        </div>
        <div className="text-xs text-slate-500 font-medium">
          Tổng người dùng trong tháng: <span className="font-bold text-slate-800">10.000+</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Tài khoản (Đã che danh tính)</th>
                <th className="py-3 px-4">Gói dịch vụ</th>
                <th className="py-3 px-4">Lượt chuyên sâu còn lại</th>
                <th className="py-3 px-4">Tổng lượt trải bài</th>
                <th className="py-3 px-4">Hoạt động gần nhất</th>
                <th className="py-3 px-4 text-right">Quyền lợi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {MOCK_USERS.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-4 font-mono font-medium text-slate-800">{user.email}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${
                        user.plan.includes('Đồng hành')
                          ? 'bg-purple-50 text-purple-700 border border-purple-200'
                          : user.plan.includes('Chuyên sâu')
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {user.plan}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-blue-600">
                    {user.deepCredits} lượt
                  </td>
                  <td className="py-3 px-4 font-mono">{user.totalReadings}</td>
                  <td className="py-3 px-4 text-slate-400">{user.lastActive}</td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => alert(`Đã cấp thêm 1 lượt chuyên sâu cho ${user.email}`)}
                      className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium transition-colors"
                    >
                      + Tặng lượt
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
