'use client';

import React, { useState } from 'react';
import { X, FileUp, Sparkles, AlertCircle } from 'lucide-react';

interface ImportMatrixModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportMatrix: (content: string) => void;
}

export const ImportMatrixModal: React.FC<ImportMatrixModalProps> = ({
  isOpen,
  onClose,
  onImportMatrix,
}) => {
  const [content, setContent] = useState('');

  if (!isOpen) return null;

  const handleApply = () => {
    if (!content.trim()) return;
    onImportMatrix(content.trim());
    onClose();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setContent(event.target?.result as string || '');
    };
    reader.readAsText(file);
  };

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
        maxWidth: 580,
        width: '100%',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        overflow: 'hidden',
        border: '1px solid #e2e8f0',
      }}>
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
              backgroundColor: '#1e40af',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <FileUp size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#1e293b' }}>
                Tải / Dán Ma trận hoặc Bản đặc tả có sẵn
              </h3>
              <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b' }}>
                AI sẽ đọc chính xác ma trận và sinh đề tuân thủ tuyệt đối tỷ lệ
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#94a3b8' }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: '16px 20px' }}>
          <div style={{
            border: '2px dashed #cbd5e1',
            borderRadius: 10,
            padding: 12,
            textAlign: 'center',
            backgroundColor: '#f8fafc',
            marginBottom: 12,
          }}>
            <input
              type="file"
              accept=".txt,.csv,.json,.doc,.docx"
              onChange={handleFileUpload}
              style={{ fontSize: '0.8rem' }}
            />
            <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: 4 }}>
              Hỗ trợ tải tệp text, CSV hoặc JSON cấu trúc ma trận
            </div>
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
              Hoặc dán trực tiếp bảng ma trận/đặc tả văn bản vào đây:
            </label>
            <textarea
              rows={8}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Dán nội dung ma trận hoặc bản đặc tả của trường/tổ bộ môn tại đây..."
              style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
            />
          </div>

          <div style={{
            padding: '8px 12px',
            borderRadius: 8,
            backgroundColor: '#fffbeb',
            border: '1px solid #fde68a',
            fontSize: '0.75rem',
            color: '#92400e',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}>
            <AlertCircle size={15} />
            <span>Hệ thống cam kết giữ nguyên các tỷ lệ đã khai báo trong ma trận có sẵn.</span>
          </div>
        </div>

        <div style={{
          padding: '12px 20px',
          borderTop: '1px solid #f1f5f9',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 10,
          backgroundColor: '#f8fafc',
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '7px 16px',
              backgroundColor: '#ffffff',
              color: '#64748b',
              border: '1px solid #cbd5e1',
              borderRadius: 8,
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Hủy
          </button>
          <button
            onClick={handleApply}
            disabled={!content.trim()}
            style={{
              padding: '7px 18px',
              backgroundColor: '#1e40af',
              color: '#ffffff',
              border: 'none',
              borderRadius: 8,
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: content.trim() ? 'pointer' : 'not-allowed',
              opacity: content.trim() ? 1 : 0.6,
            }}
          >
            Áp dụng ma trận này
          </button>
        </div>
      </div>
    </div>
  );
};
