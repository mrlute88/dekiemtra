'use client';

import React from 'react';
import { Key, BookOpen, Database, History, RotateCcw, Trash2, CheckCircle2 } from 'lucide-react';
import { ApiSettings } from '@/types/exam';

interface HeaderProps {
  apiSettings: ApiSettings;
  onOpenApiKeyModal: () => void;
  onOpenQuestionBank: () => void;
  onOpenSavedExams: () => void;
  onRestoreLastConfig: () => void;
  onClearConfig: () => void;
  onLoadPreset: (presetKey: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  apiSettings,
  onOpenApiKeyModal,
  onOpenQuestionBank,
  onOpenSavedExams,
  onRestoreLastConfig,
  onClearConfig,
  onLoadPreset,
}) => {
  const isKeyActive = Boolean(apiSettings.apiKey && apiSettings.apiKey.trim().length > 5);

  return (
    <header className="no-print" style={{
      backgroundColor: '#ffffff',
      borderBottom: '1px solid #e2e8f0',
      position: 'sticky',
      top: 0,
      zIndex: 40,
    }}>
      <div style={{
        maxWidth: 1600,
        margin: '0 auto',
        padding: '10px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
      }}>
        {/* Brand & Academic Identity */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: 8,
            backgroundColor: '#1e3a8a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            flexShrink: 0,
          }}>
            <BookOpen size={20} strokeWidth={2.2} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{
                fontSize: '1.05rem',
                fontWeight: 700,
                color: '#0f172a',
                letterSpacing: '-0.01em',
              }}>
                Hệ thống Tạo Đề thi GDPT 2018
              </span>
              <span style={{
                fontSize: '0.68rem',
                fontWeight: 600,
                color: '#1e40af',
                backgroundColor: '#eff6ff',
                padding: '2px 8px',
                borderRadius: 4,
                border: '1px solid #dbeafe',
              }}>
                Tiểu học • THCS • THPT
              </span>
            </div>
            <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0 }}>
              Ma trận kiến thức, bản đặc tả & đề kiểm tra định kỳ chuẩn Bộ GD&ĐT
            </p>
          </div>
        </div>

        {/* Quick Presets */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          backgroundColor: '#f8fafc',
          padding: '3px 8px',
          borderRadius: 8,
          border: '1px solid #e2e8f0',
        }}>
          <span style={{ fontSize: '0.74rem', fontWeight: 600, color: '#64748b', marginRight: 2 }}>
            Mẫu nhanh:
          </span>
          <button
            type="button"
            onClick={() => onLoadPreset('toan6')}
            style={{
              padding: '4px 9px',
              fontSize: '0.75rem',
              fontWeight: 600,
              backgroundColor: '#ffffff',
              color: '#1e40af',
              border: '1px solid #cbd5e1',
              borderRadius: 6,
              cursor: 'pointer',
              transition: 'background 0.15s ease',
            }}
          >
            Toán 6
          </button>
          <button
            type="button"
            onClick={() => onLoadPreset('van9')}
            style={{
              padding: '4px 9px',
              fontSize: '0.75rem',
              fontWeight: 600,
              backgroundColor: '#ffffff',
              color: '#047857',
              border: '1px solid #cbd5e1',
              borderRadius: 6,
              cursor: 'pointer',
              transition: 'background 0.15s ease',
            }}
          >
            Ngữ văn 9
          </button>
          <button
            type="button"
            onClick={() => onLoadPreset('anh10')}
            style={{
              padding: '4px 9px',
              fontSize: '0.75rem',
              fontWeight: 600,
              backgroundColor: '#ffffff',
              color: '#4338ca',
              border: '1px solid #cbd5e1',
              borderRadius: 6,
              cursor: 'pointer',
              transition: 'background 0.15s ease',
            }}
          >
            Tiếng Anh 10
          </button>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {/* Question Bank */}
          <button
            type="button"
            onClick={onOpenQuestionBank}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              padding: '6px 11px',
              backgroundColor: '#ffffff',
              color: '#334155',
              border: '1px solid #cbd5e1',
              borderRadius: 6,
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
            title="Mở ngân hàng câu hỏi đã lưu"
          >
            <Database size={14} color="#2563eb" />
            <span>Ngân hàng câu hỏi</span>
          </button>

          {/* Saved Exams */}
          <button
            type="button"
            onClick={onOpenSavedExams}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              padding: '6px 11px',
              backgroundColor: '#ffffff',
              color: '#334155',
              border: '1px solid #cbd5e1',
              borderRadius: 6,
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
            title="Xem danh sách đề đã lưu"
          >
            <History size={14} color="#475569" />
            <span>Đề đã lưu</span>
          </button>

          {/* API Key Settings Button */}
          <button
            type="button"
            onClick={onOpenApiKeyModal}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 12px',
              backgroundColor: isKeyActive ? '#f0fdf4' : '#fffbeb',
              color: isKeyActive ? '#166534' : '#92400e',
              border: `1px solid ${isKeyActive ? '#bbf7d0' : '#fde68a'}`,
              borderRadius: 6,
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {isKeyActive ? (
              <>
                <span style={{
                  display: 'inline-block',
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  backgroundColor: '#16a34a',
                }} />
                <span>AI: {apiSettings.provider.toUpperCase()}</span>
              </>
            ) : (
              <>
                <Key size={13} color="#b45309" />
                <span>Cấu hình API</span>
              </>
            )}
          </button>

          {/* Restore / Clear */}
          <button
            type="button"
            onClick={onRestoreLastConfig}
            style={{
              padding: '6px 8px',
              backgroundColor: '#ffffff',
              color: '#64748b',
              border: '1px solid #cbd5e1',
              borderRadius: 6,
              fontSize: '0.78rem',
              cursor: 'pointer',
            }}
            title="Khôi phục cấu hình gần nhất"
          >
            <RotateCcw size={14} />
          </button>
          <button
            type="button"
            onClick={onClearConfig}
            style={{
              padding: '6px 8px',
              backgroundColor: '#ffffff',
              color: '#dc2626',
              border: '1px solid #fecaca',
              borderRadius: 6,
              fontSize: '0.78rem',
              cursor: 'pointer',
            }}
            title="Xóa toàn bộ cấu hình về mặc định"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </header>
  );
};
