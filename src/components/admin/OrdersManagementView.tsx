'use client';

import React, { useState } from 'react';
import { Order, OrderStatus } from '@/types/business';

interface OrdersManagementViewProps {
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  onRefresh: () => void;
}

export const OrdersManagementView: React.FC<OrdersManagementViewProps> = ({
  orders,
  onUpdateOrderStatus,
  onRefresh
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchCode, setSearchCode] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [isCreatingTestOrder, setIsCreatingTestOrder] = useState(false);

  const filteredOrders = orders.filter((o) => {
    if (filterStatus !== 'all' && o.status !== filterStatus) return false;
    if (searchCode && !o.code.toLowerCase().includes(searchCode.toLowerCase())) return false;
    return true;
  });

  const totalRevenue = orders
    .filter((o) => o.status === 'completed')
    .reduce((sum, o) => sum + o.amount, 0);

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    setUpdatingId(orderId);
    try {
      await onUpdateOrderStatus(orderId, newStatus);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCreateTestOrder = async (packageId: 'deep' | 'companion') => {
    setIsCreatingTestOrder(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageId,
          customerEmail: 'khach_test_admin@tarot.me',
          paymentMethod: 'vietqr'
        })
      });
      const data = await res.json();
      if (data.success) {
        onRefresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsCreatingTestOrder(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Stats Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Quản lý Đơn hàng & Thanh toán Thực tế (Order & Payment)
          </h2>
          <p className="text-sm text-slate-600 mt-0.5">
            Theo dõi giao dịch VietQR, đối soát thủ công và hoàn tiền thời gian thực
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-xl text-right">
            <span className="text-xs text-emerald-700 block uppercase font-semibold">Doanh thu đã thu</span>
            <span className="text-lg font-bold text-emerald-800 font-mono">
              {totalRevenue.toLocaleString('vi-VN')} đ
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleCreateTestOrder('deep')}
              disabled={isCreatingTestOrder}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              + Tạo đơn test 29k
            </button>
            <button
              onClick={onRefresh}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors cursor-pointer"
            >
              ↻ Làm mới
            </button>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Tìm theo mã đơn (TAROT-...)"
            value={searchCode}
            onChange={(e) => setSearchCode(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 w-full sm:w-64"
          />
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto overflow-x-auto w-full sm:w-auto">
          {['all', 'completed', 'pending', 'refunded'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors capitalize cursor-pointer ${
                filterStatus === st
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {st === 'all'
                ? 'Tất cả'
                : st === 'completed'
                ? 'Đã thanh toán'
                : st === 'pending'
                ? 'Chờ thanh toán'
                : 'Đã hoàn tiền'}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold text-xs uppercase tracking-wider">
                <th className="py-3 px-4">Mã đơn</th>
                <th className="py-3 px-4">Gói dịch vụ</th>
                <th className="py-3 px-4">Số tiền</th>
                <th className="py-3 px-4">Khách hàng</th>
                <th className="py-3 px-4">Phương thức</th>
                <th className="py-3 px-4">Trạng thái</th>
                <th className="py-3 px-4">Thời gian</th>
                <th className="py-3 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 text-xs">
                    Không tìm thấy đơn hàng nào phù hợp
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-700 text-xs">{ord.code}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">{ord.packageName}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {ord.amount.toLocaleString('vi-VN')} đ
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-mono text-xs">
                      {ord.customerEmail || 'khach_an_danh@tarot.me'}
                    </td>
                    <td className="py-3.5 px-4 uppercase text-xs font-semibold text-slate-700">
                      {ord.paymentMethod}
                    </td>
                    <td className="py-3.5 px-4">
                      {ord.status === 'completed' ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                          ✓ Đã thanh toán
                        </span>
                      ) : ord.status === 'pending' ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                          ⏳ Chờ chuyển khoản
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                          {ord.status}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 text-xs font-mono">
                      {new Date(ord.createdAt).toLocaleDateString('vi-VN', {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {ord.status === 'pending' && (
                          <button
                            disabled={updatingId === ord.id}
                            onClick={() => handleStatusChange(ord.id, 'completed')}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors cursor-pointer"
                          >
                            Xác nhận đã nhận tiền
                          </button>
                        )}
                        {ord.status === 'completed' && (
                          <button
                            disabled={updatingId === ord.id}
                            onClick={() => handleStatusChange(ord.id, 'refunded')}
                            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors cursor-pointer"
                          >
                            Hoàn tiền
                          </button>
                        )}
                      </div>
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
