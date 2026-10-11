'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PricingPackage, Order } from '@/types/business';
import { BANK_CONFIG } from '@/data/pricingData';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  packageItem: PricingPackage;
  readingId?: string;
  onPaymentSuccess: (order: Order) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  packageItem,
  readingId,
  onPaymentSuccess
}) => {
  const [loadingOrder, setLoadingOrder] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [qrUrl, setQrUrl] = useState<string>('');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Khởi tạo đơn hàng khi mở modal
  useEffect(() => {
    if (!isOpen) {
      setCurrentOrder(null);
      setIsSuccess(false);
      setIsConfirming(false);
      return;
    }

    let isMounted = true;
    setLoadingOrder(true);

    fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        packageId: packageItem.id,
        readingId,
        paymentMethod: 'vietqr'
      })
    })
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data.success) {
          setCurrentOrder(data.order);
          setQrUrl(data.qrUrl);
        }
      })
      .catch((err) => console.error('Error initiating order:', err))
      .finally(() => {
        if (isMounted) setLoadingOrder(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, packageItem.id, readingId]);

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleConfirmPayment = async () => {
    if (!currentOrder) return;
    setIsConfirming(true);

    try {
      const res = await fetch(`/api/orders/${currentOrder.code}/confirm`, {
        method: 'POST'
      });
      const data = await res.json();
      if (data.success) {
        setIsSuccess(true);
        setTimeout(() => {
          onPaymentSuccess(data.order);
          onClose();
        }, 1500);
      } else {
        alert(data.error || 'Chưa nhận được giao dịch. Vui lòng kiểm tra lại.');
      }
    } catch (err) {
      console.error(err);
      alert('Có lỗi xảy ra khi xác nhận giao dịch.');
    } finally {
      setIsConfirming(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.25 }}
          className="relative w-full max-w-lg bg-[#141017] border border-[#3A2F22] rounded-2xl p-5 sm:p-7 shadow-2xl text-[#EEE6D8] my-auto"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#1F1924] border border-[#3D3222] text-[#A6998A] hover:text-[#EEE6D8] hover:border-[#C9A85C] flex items-center justify-center text-sm transition-colors"
            title="Đóng"
          >
            ✕
          </button>

          {isSuccess ? (
            <div className="py-10 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#C9A85C]/20 border border-[#C9A85C] text-[#C9A85C] flex items-center justify-center text-3xl mx-auto animate-pulse">
                ✓
              </div>
              <h3 className="font-heading text-2xl text-[#C9A85C]">Thanh toán thành công!</h3>
              <p className="text-sm text-[#A6998A] max-w-sm mx-auto">
                Trạm đang mở khóa toàn bộ phân tích chuyên sâu cho phiên trải bài của bạn...
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Header */}
              <div>
                <span className="text-[11px] uppercase tracking-wider text-[#C9A85C] font-semibold block">
                  Cổng thanh toán tự động · VietQR
                </span>
                <h3 className="font-heading text-xl sm:text-2xl text-[#EEE6D8] mt-1">
                  Mở khóa {packageItem.name}
                </h3>
                <p className="text-xs text-[#A6998A] mt-1">{packageItem.tagline}</p>
              </div>

              {loadingOrder || !currentOrder ? (
                <div className="py-16 text-center space-y-3">
                  <div className="w-8 h-8 border-2 border-[#C9A85C] border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs text-[#A6998A]">Đang tạo mã đơn hàng VietQR...</p>
                </div>
              ) : (
                <>
                  {/* QR Code and Bank Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center bg-[#0C0A0E] p-4 rounded-xl border border-[#2B231B]">
                    {/* QR Image */}
                    <div className="flex flex-col items-center justify-center text-center p-2 bg-white rounded-lg shadow-inner">
                      {qrUrl ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={qrUrl}
                          alt="VietQR Chuyển khoản"
                          className="w-44 h-44 object-contain rounded"
                        />
                      ) : (
                        <div className="w-44 h-44 bg-gray-100 flex items-center justify-center text-gray-400 text-xs">
                          Đang tải QR...
                        </div>
                      )}
                      <span className="text-[10px] text-gray-600 mt-1 font-mono">
                        Quét mã bằng app ngân hàng
                      </span>
                    </div>

                    {/* Bank Transfer Details */}
                    <div className="space-y-3 text-xs">
                      <div>
                        <span className="text-[#8E7E6E] block text-[11px]">Số tiền cần thanh toán</span>
                        <span className="font-heading text-xl text-[#C9A85C] font-semibold">
                          {currentOrder.amount.toLocaleString('vi-VN')} đ
                        </span>
                      </div>

                      <div>
                        <span className="text-[#8E7E6E] block text-[11px]">Ngân hàng nhận</span>
                        <span className="font-medium text-[#EEE6D8]">{BANK_CONFIG.bankName}</span>
                      </div>

                      <div>
                        <span className="text-[#8E7E6E] block text-[11px]">Số tài khoản</span>
                        <div className="flex items-center justify-between gap-1 mt-0.5">
                          <span className="font-mono text-[#EEE6D8] font-bold">
                            {BANK_CONFIG.accountNo}
                          </span>
                          <button
                            onClick={() => copyToClipboard(BANK_CONFIG.accountNo, 'stk')}
                            className="px-2 py-0.5 rounded bg-[#1D1722] hover:bg-[#2B2332] text-[#C9A85C] border border-[#3A2F22] text-[10px] transition-colors"
                          >
                            {copiedField === 'stk' ? '✓ Đã chép' : 'Sao chép'}
                          </button>
                        </div>
                      </div>

                      <div>
                        <span className="text-[#8E7E6E] block text-[11px]">Chủ tài khoản</span>
                        <span className="font-medium text-[#EEE6D8]">{BANK_CONFIG.accountName}</span>
                      </div>

                      <div className="p-2 rounded bg-[#1A1420] border border-[#3D3020]">
                        <span className="text-[#C9A85C] block text-[10px] font-semibold uppercase">
                          Nội dung chuyển khoản (bắt buộc)
                        </span>
                        <div className="flex items-center justify-between gap-1 mt-1">
                          <span className="font-mono text-[#F4EBD9] font-bold text-sm tracking-wider">
                            {currentOrder.code}
                          </span>
                          <button
                            onClick={() => copyToClipboard(currentOrder.code, 'syntax')}
                            className="px-2 py-0.5 rounded bg-[#C9A85C] text-[#0A080C] font-semibold text-[10px] hover:bg-[#DEC078] transition-colors"
                          >
                            {copiedField === 'syntax' ? '✓ Đã chép' : 'Sao chép mã'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Note */}
                  <div className="text-[11px] text-[#A6998A] flex items-start gap-2 bg-[#1B1621] p-2.5 rounded-lg border border-[#2E2430]">
                    <span className="text-[#C9A85C] mt-0.5">ⓘ</span>
                    <span>
                      Trạm tự động đối soát trong 10-30 giây. Sau khi chuyển khoản, bấm nút bên dưới để mở khóa ngay lập tức.
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                    <button
                      onClick={handleConfirmPayment}
                      disabled={isConfirming}
                      className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-[#C9A85C] via-[#DEC078] to-[#C9A85C] text-[#0D0B10] font-heading font-medium text-sm hover:shadow-[0_0_20px_rgba(201,168,92,0.4)] transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                      {isConfirming ? (
                        <>
                          <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                          <span>Đang kiểm tra giao dịch...</span>
                        </>
                      ) : (
                        <>
                          <span>✓ Tôi đã chuyển khoản xong</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={onClose}
                      className="py-3 px-4 rounded-xl bg-[#1D1722] border border-[#3A2F22] text-[#A6998A] hover:text-[#EEE6D8] text-xs transition-colors"
                    >
                      Đóng
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
