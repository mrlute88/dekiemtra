'use client';

import React, { useState } from 'react';
import { X, History, FileText, Download, Trash2, FolderOpen, Calendar, Clock, Award } from 'lucide-react';
import { GeneratedExamPackage } from '@/types/exam';
import { exportExamToWord } from '@/lib/docxExporter';
import { formatExamTitle } from '@/lib/matrixCalculator';

interface SavedExamsModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedExams: GeneratedExamPackage[];
  onLoadExam: (pkg: GeneratedExamPackage) => void;
  onDeleteExam: (id: string) => void;
}

export const SavedExamsModal: React.FC<SavedExamsModalProps> = ({
  isOpen,
  onClose,
  savedExams,
  onLoadExam,
  onDeleteExam,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const filteredExams = savedExams.filter((pkg) => {
    const term = searchTerm.toLowerCase();
    const title = (pkg.config.examTitle || '').toLowerCase();
    const subject = (pkg.config.subject || '').toLowerCase();
    const grade = (pkg.config.grade || '').toLowerCase();
    return title.includes(term) || subject.includes(term) || grade.includes(term);
  });

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
        borderRadius: 12,
        maxWidth: 780,
        width: '100%',
        boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.2)',
        overflow: 'hidden',
        border: '1px solid #e2e8f0',
        display: 'flex',
        flexDirection: 'column',
        maxHeight: '85vh',
      }}>
        {/* Header */}
        <div style={{
          padding: '14px 20px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#f8fafc',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 34,
              height: 34,
              borderRadius: 8,
              backgroundColor: '#1e3a8a',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <History size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
                Danh sách đề thi đã lưu ({savedExams.length} bộ đề)
              </h3>
              <p style={{ margin: 0, fontSize: '0.76rem', color: '#64748b' }}>
                Bộ đề đã tạo được lưu cục bộ an toàn trong trình duyệt
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#64748b', padding: 4 }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Search */}
        <div style={{ padding: '10px 20px', borderBottom: '1px solid #e2e8f0', backgroundColor: '#ffffff' }}>
          <input
            type="text"
            placeholder="Tìm theo tên đề, môn học hoặc khối lớp..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '7px 12px',
              borderRadius: 6,
              border: '1px solid #cbd5e1',
              fontSize: '0.82rem',
            }}
          />
        </div>

        {/* List */}
        <div style={{ padding: '16px 20px', overflowY: 'auto', flex: 1 }}>
          {filteredExams.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8' }}>
              <FileText size={40} style={{ margin: '0 auto 10px', opacity: 0.4 }} />
              <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>Chưa có bộ đề nào được lưu</div>
              <div style={{ fontSize: '0.78rem', marginTop: 4 }}>
                Sau khi tạo đề, bấm nút <strong>Lưu đề</strong> ở thanh công cụ để lưu trữ tại đây.
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {filteredExams.map((pkg) => {
                const dateStr = pkg.createdAt
                  ? new Date(pkg.createdAt).toLocaleString('vi-VN')
                  : 'Gần đây';
                return (
                  <div
                    key={pkg.id}
                    style={{
                      padding: '12px 14px',
                      borderRadius: 8,
                      border: '1px solid #e2e8f0',
                      backgroundColor: '#ffffff',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 12,
                      transition: 'border-color 0.15s ease',
                    }}
                  >
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <h4 style={{
                          margin: 0,
                          fontSize: '0.9rem',
                          fontWeight: 700,
                          color: '#1e3a8a',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}>
                          {formatExamTitle(pkg.config.examTitle)}
                        </h4>
                        <span style={{
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          backgroundColor: '#eff6ff',
                          color: '#1d4ed8',
                          padding: '1px 7px',
                          borderRadius: 4,
                          flexShrink: 0,
                        }}>
                          {pkg.config.subject} ({pkg.config.grade})
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: '0.75rem', color: '#64748b' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Award size={13} color="#2563eb" />
                          Thang {pkg.config.maxScore || 10}đ ({pkg.questions.length} câu)
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Clock size={13} />
                          {pkg.config.durationMinutes} phút
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Calendar size={13} />
                          {dateStr}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                      <button
                        type="button"
                        onClick={() => {
                          onLoadExam(pkg);
                          onClose();
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                          padding: '6px 10px',
                          borderRadius: 6,
                          backgroundColor: '#1e3a8a',
                          color: '#ffffff',
                          border: 'none',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                        title="Tải bộ đề này vào màn hình làm việc"
                      >
                        <FolderOpen size={14} />
                        <span>Mở đề</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => exportExamToWord(pkg, '101', 13)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                          padding: '6px 9px',
                          borderRadius: 6,
                          backgroundColor: '#f1f5f9',
                          color: '#334155',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.78rem',
                          cursor: 'pointer',
                        }}
                        title="Xuất đề thi ra tệp Word"
                      >
                        <Download size={14} />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Xác nhận xóa bộ đề "${pkg.config.examTitle}" khỏi bộ nhớ?`)) {
                            onDeleteExam(pkg.id);
                          }
                        }}
                        style={{
                          padding: '6px 8px',
                          borderRadius: 6,
                          backgroundColor: '#fef2f2',
                          color: '#dc2626',
                          border: '1px solid #fecaca',
                          fontSize: '0.78rem',
                          cursor: 'pointer',
                        }}
                        title="Xóa đề này"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

