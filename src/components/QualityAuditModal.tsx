'use client';

import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, X, ShieldCheck } from 'lucide-react';

interface QualityAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  audit: {
    passed: boolean;
    items: {
      id: string;
      name: string;
      status: 'pass' | 'warning' | 'error';
      message: string;
    }[];
  };
}

export const QualityAuditModal: React.FC<QualityAuditModalProps> = ({
  isOpen,
  onClose,
  audit,
}) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.65)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      backdropFilter: 'blur(4px)',
      padding: 16,
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: 16,
        maxWidth: 620,
        width: '100%',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        overflow: 'hidden',
        border: '1px solid #e2e8f0',
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid #f1f5f9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              backgroundColor: '#16a34a',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <ShieldCheck size={22} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#1e293b' }}>
                Báo cáo kiểm tra chất lượng đề thi (12 tiêu chí)
              </h3>
              <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b' }}>
                Hệ thống tự động rà soát chuẩn sư phạm & quy chế khảo thí
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#94a3b8' }}>
            <X size={20} />
          </button>
        </div>

        {/* Audit Checklist */}
        <div style={{ padding: '16px 20px', maxHeight: '65vh', overflowY: 'auto' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {audit.items.map((item, idx) => {
              const isPass = item.status === 'pass';
              const isWarning = item.status === 'warning';
              return (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 12,
                    padding: '10px 14px',
                    borderRadius: 10,
                    backgroundColor: isPass ? '#f0fdf4' : isWarning ? '#fffbeb' : '#fef2f2',
                    border: `1px solid ${isPass ? '#bbf7d0' : isWarning ? '#fde68a' : '#fecaca'}`,
                  }}
                >
                  <div style={{ marginTop: 2 }}>
                    {isPass ? (
                      <CheckCircle2 size={18} color="#16a34a" />
                    ) : isWarning ? (
                      <AlertTriangle size={18} color="#d97706" />
                    ) : (
                      <XCircle size={18} color="#dc2626" />
                    )}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1e293b' }}>
                      {idx + 1}. {item.name}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: isPass ? '#166534' : isWarning ? '#92400e' : '#991b1b', marginTop: 2 }}>
                      {item.message}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '12px 20px',
          borderTop: '1px solid #f1f5f9',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#f8fafc',
        }}>
          <span style={{ fontSize: '0.78rem', color: '#16a34a', fontWeight: 600 }}>
            ✓ Đề thi đạt chuẩn các quy định hiện hành của Bộ GD&ĐT
          </span>
          <button
            onClick={onClose}
            style={{
              padding: '7px 18px',
              backgroundColor: '#1e40af',
              color: '#ffffff',
              border: 'none',
              borderRadius: 8,
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Đã hiểu & Tiếp tục
          </button>
        </div>
      </div>
    </div>
  );
};
