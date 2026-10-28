'use client';

import React, { useState } from 'react';
import { 
  FileText, 
  CheckSquare, 
  BookMarked, 
  Grid, 
  Table, 
  Printer, 
  Copy, 
  Download, 
  Save, 
  ShieldCheck, 
  RotateCw, 
  Edit3, 
  Trash2, 
  Plus, 
  BookmarkPlus, 
  AlertTriangle,
  FileCheck2,
  Check,
  Settings
} from 'lucide-react';
import { ExamConfig, GeneratedExamPackage, Question, QuestionBankItem } from '@/types/exam';
import { MatrixTable } from './MatrixTable';
import { SpecificationTable } from './SpecificationTable';
import { exportAnswerKeyToWord, exportExamToWord } from '@/lib/docxExporter';
import { formatExamTitle, LEVEL_NAMES } from '@/lib/matrixCalculator';

interface PreviewTabsProps {
  examPackage: GeneratedExamPackage | null;
  onOpenAuditModal: () => void;
  onOpenEditQuestion: (q: Question) => void;
  onDeleteQuestion: (qId: string) => void;
  onRegenerateQuestion: (q: Question) => void;
  onAddQuestion: () => void;
  onSaveToQuestionBank: (item: QuestionBankItem) => void;
  onSaveExamPackage: (pkg: GeneratedExamPackage) => void;
  onUpdateExamConfig?: (newConfig: Partial<ExamConfig>) => void;
}

export const PreviewTabs: React.FC<PreviewTabsProps> = ({
  examPackage,
  onOpenAuditModal,
  onOpenEditQuestion,
  onDeleteQuestion,
  onRegenerateQuestion,
  onAddQuestion,
  onSaveToQuestionBank,
  onSaveExamPackage,
  onUpdateExamConfig,
}) => {
  const [activeTab, setActiveTab] = useState<'de_thi' | 'dap_an' | 'huong_dan_cham' | 'ma_tran' | 'ban_dac_ta'>('de_thi');
  const [selectedCode, setSelectedCode] = useState<string>('101');
  const [copiedNotification, setCopiedNotification] = useState(false);
  const [savedNotification, setSavedNotification] = useState(false);
  const [isHeaderConfigOpen, setIsHeaderConfigOpen] = useState(false);
  const [wordFontSize, setWordFontSize] = useState<13 | 14>(13);

  if (!examPackage) {
    return (
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: 16,
        border: '1px solid #e2e8f0',
        padding: '60px 24px',
        textAlign: 'center',
        boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
      }}>
        <div style={{
          width: 64,
          height: 64,
          borderRadius: 20,
          backgroundColor: '#eff6ff',
          color: '#2563eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px',
        }}>
          <FileText size={32} />
        </div>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1e3a8a', marginBottom: 8 }}>
          Sẵn sàng tạo đề kiểm tra AI
        </h3>
        <p style={{ fontSize: '0.88rem', color: '#64748b', maxWidth: 440, margin: '0 auto 20px', lineHeight: 1.6 }}>
          Vui lòng thiết lập thông số ở cột bên trái và bấm <strong>✨ TẠO ĐỀ KIỂM TRA</strong> để xem trước Ma trận, Bản đặc tả, Đề thi và Hướng dẫn chấm.
        </p>
      </div>
    );
  }

  const config = examPackage.config;
  const currentVariant = examPackage.variantCodes[selectedCode] || { code: '101', questions: examPackage.questions };
  const questions = currentVariant.questions;

  // Copy text to clipboard
  const handleCopyExamText = () => {
    let text = `${config.schoolName || 'TRƯỜNG THCS NGUYỄN DU'}\n${formatExamTitle(config.examTitle)} - MÃ ĐỀ: ${currentVariant.code}\n`;
    text += `Môn: ${config.subject} - ${config.grade} | Thời gian: ${config.durationMinutes} phút\n\n`;
    questions.forEach((q, idx) => {
      const cleanQ = q.question.replace(/^\[(Nhận biết|Thông hiểu|Vận dụng cao|Vận dụng|NB|TH|VD|VDC)\]\s*:?\s*/i, '').trim();
      text += `Câu ${idx + 1} (${q.score} điểm): ${cleanQ}\n`;
      if (q.options && q.options.length > 0) {
        q.options.forEach((opt, optIdx) => {
          const letter = String.fromCharCode(65 + optIdx);
          const cleanOpt = opt.replace(/^[A-Z]\.\s*/i, '').trim();
          text += `   ${letter}. ${cleanOpt}\n`;
        });
      }
      text += '\n';
    });
    navigator.clipboard.writeText(text);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2500);
  };

  const handlePrint = () => {
    const originalTitle = document.title;
    document.title = '';
    window.print();
    setTimeout(() => {
      document.title = originalTitle;
    }, 1000);
  };

  const handleSaveExam = () => {
    onSaveExamPackage(examPackage);
    setSavedNotification(true);
    setTimeout(() => setSavedNotification(false), 2500);
  };

  return (
    <div className="exam-preview-container exam-paper-canvas" style={{
      borderRadius: 10,
      border: '1px solid #e2e8f0',
      overflow: 'hidden',
    }}>
      {/* Top Action Toolbar */}
      <div className="tab-toolbar no-print" style={{
        padding: '10px 16px',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 10,
      }}>
        {/* Navigation tabs as clean segmented control */}
        <div style={{
          display: 'flex',
          backgroundColor: '#f1f5f9',
          padding: 3,
          borderRadius: 8,
          gap: 2,
          flexWrap: 'wrap',
        }}>
          {[
            { id: 'de_thi', label: 'Đề kiểm tra', icon: FileText },
            { id: 'dap_an', label: 'Đáp án', icon: CheckSquare },
            { id: 'huong_dan_cham', label: 'Hướng dẫn chấm', icon: BookMarked },
            { id: 'ma_tran', label: 'Ma trận đề', icon: Grid },
            { id: 'ban_dac_ta', label: 'Bản đặc tả', icon: Table },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 12px',
                  borderRadius: 6,
                  border: 'none',
                  backgroundColor: isActive ? '#ffffff' : 'transparent',
                  color: isActive ? '#1e3a8a' : '#64748b',
                  fontSize: '0.8rem',
                  fontWeight: isActive ? 700 : 500,
                  cursor: 'pointer',
                  boxShadow: isActive ? '0 1px 3px rgba(15, 23, 42, 0.08)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                <Icon size={14} color={isActive ? '#1e3a8a' : '#64748b'} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Toolbar Buttons: Export, Print, Audit */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={onOpenAuditModal}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              padding: '6px 10px',
              borderRadius: 6,
              border: '1px solid #bbf7d0',
              backgroundColor: '#f0fdf4',
              color: '#166534',
              fontSize: '0.76rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
            title="Kiểm tra 12 tiêu chí chất lượng đề thi"
          >
            <ShieldCheck size={14} />
            <span>Tiêu chí ({examPackage.qualityAudit.items.filter(i => i.status === 'pass').length}/12)</span>
          </button>

          <button
            type="button"
            onClick={() => setIsHeaderConfigOpen(!isHeaderConfigOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              padding: '6px 10px',
              borderRadius: 6,
              border: '1px solid #cbd5e1',
              backgroundColor: isHeaderConfigOpen ? '#eff6ff' : '#ffffff',
              color: isHeaderConfigOpen ? '#1e40af' : '#334155',
              fontSize: '0.76rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
            title="Cấu hình tên trường, tiêu đề, thời gian làm bài & cỡ chữ Word"
          >
            <Settings size={14} />
            <span>Đầu đề & Cỡ chữ</span>
          </button>

          <button
            type="button"
            onClick={handleCopyExamText}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              padding: '6px 10px',
              borderRadius: 6,
              border: '1px solid #cbd5e1',
              backgroundColor: '#ffffff',
              color: '#334155',
              fontSize: '0.76rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {copiedNotification ? <Check size={14} color="#16a34a" /> : <Copy size={14} />}
            <span>{copiedNotification ? 'Đã chép' : 'Sao chép'}</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              padding: '6px 10px',
              borderRadius: 6,
              border: '1px solid #cbd5e1',
              backgroundColor: '#ffffff',
              color: '#334155',
              fontSize: '0.76rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <Printer size={14} />
            <span>In A4</span>
          </button>

          <button
            type="button"
            onClick={() => exportExamToWord(examPackage, selectedCode, wordFontSize)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              padding: '6px 12px',
              borderRadius: 6,
              border: '1px solid #1e3a8a',
              backgroundColor: '#1e3a8a',
              color: '#ffffff',
              fontSize: '0.76rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <Download size={14} />
            <span>Xuất Word ({wordFontSize}pt)</span>
          </button>

          <button
            type="button"
            onClick={handleSaveExam}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '6px 9px',
              borderRadius: 6,
              border: '1px solid #cbd5e1',
              backgroundColor: '#ffffff',
              color: '#334155',
              fontSize: '0.76rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
            title="Lưu vào bộ nhớ trình duyệt"
          >
            <Save size={14} color="#2563eb" />
            <span>{savedNotification ? 'Đã lưu' : 'Lưu'}</span>
          </button>
        </div>
      </div>

      {/* Code Variant Selector */}
      {config.numberOfCodes > 1 && (
        <div className="no-print" style={{
          padding: '8px 16px',
          backgroundColor: '#f8fafc',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569' }}>
            Mã đề hiển thị:
          </span>
          <div style={{ display: 'flex', gap: 6 }}>
            {Object.keys(examPackage.variantCodes).map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => setSelectedCode(code)}
                style={{
                  padding: '3px 10px',
                  borderRadius: 4,
                  border: `1px solid ${selectedCode === code ? '#1e3a8a' : '#cbd5e1'}`,
                  backgroundColor: selectedCode === code ? '#1e3a8a' : '#ffffff',
                  color: selectedCode === code ? '#ffffff' : '#334155',
                  fontSize: '0.76rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.12s ease',
                }}
              >
                Mã {code}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Content Body */}
      <div style={{ padding: '24px' }}>
        {/* ================= TAB 1: ĐỀ KIỂM TRA ================= */}
        {activeTab === 'de_thi' && (
          <div>
            {/* Quick Header Config Panel (no-print) */}
            {isHeaderConfigOpen && (
              <div className="no-print" style={{
                padding: '16px 18px',
                backgroundColor: '#f0fdf4',
                borderRadius: 12,
                border: '1px solid #86efac',
                marginBottom: 20,
                boxShadow: '0 4px 12px rgba(22, 163, 74, 0.08)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Settings size={18} color="#15803d" />
                    <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#166534' }}>
                      Cấu hình thông tin đầu đề & Xuất Word
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsHeaderConfigOpen(false)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: 6,
                      border: '1px solid #bbf7d0',
                      backgroundColor: '#ffffff',
                      color: '#15803d',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    ✕ Đóng cấu hình
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 12 }}>
                  {/* Tên trường */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#374151', marginBottom: 4 }}>
                      Tên trường / Cơ sở GD:
                    </label>
                    <input
                      type="text"
                      value={config.schoolName || ''}
                      onChange={(e) => onUpdateExamConfig?.({ schoolName: e.target.value })}
                      placeholder="Ví dụ: TRƯỜNG THCS NGUYỄN DU"
                      style={{
                        width: '100%',
                        padding: '6px 10px',
                        borderRadius: 6,
                        border: '1px solid #cbd5e1',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        backgroundColor: '#ffffff',
                      }}
                    />
                  </div>

                  {/* Đơn vị chủ quản / Dòng phụ */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#374151', marginBottom: 4 }}>
                      Đơn vị chủ quản (Tùy chọn):
                    </label>
                    <input
                      type="text"
                      value={config.subHeader || ''}
                      onChange={(e) => onUpdateExamConfig?.({ subHeader: e.target.value })}
                      placeholder="Để trống nếu không dùng"
                      style={{
                        width: '100%',
                        padding: '6px 10px',
                        borderRadius: 6,
                        border: '1px solid #cbd5e1',
                        fontSize: '0.82rem',
                        backgroundColor: '#ffffff',
                      }}
                    />
                  </div>

                  {/* Thời gian làm bài */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#374151', marginBottom: 4 }}>
                      Thời gian làm bài:
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <input
                        type="number"
                        min="1"
                        max="300"
                        value={config.durationMinutes || ''}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          onUpdateExamConfig?.({ durationMinutes: isNaN(val) ? 0 : val });
                        }}
                        placeholder="Số phút"
                        style={{
                          width: 80,
                          padding: '6px 8px',
                          borderRadius: 6,
                          border: '1px solid #cbd5e1',
                          fontSize: '0.82rem',
                          fontWeight: 800,
                          color: '#15803d',
                          textAlign: 'center',
                          backgroundColor: '#ffffff',
                        }}
                      />
                      <span style={{ fontSize: '0.8rem', color: '#4b5563', fontWeight: 600 }}>phút</span>
                    </div>
                  </div>

                  {/* Cỡ chữ khi xuất Word */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#374151', marginBottom: 4 }}>
                      Cỡ chữ xuất Word:
                    </label>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        type="button"
                        onClick={() => setWordFontSize(13)}
                        style={{
                          flex: 1,
                          padding: '6px 8px',
                          borderRadius: 6,
                          border: `1px solid ${wordFontSize === 13 ? '#16a34a' : '#cbd5e1'}`,
                          backgroundColor: wordFontSize === 13 ? '#dcfce7' : '#ffffff',
                          color: wordFontSize === 13 ? '#166534' : '#4b5563',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        13pt (Chuẩn)
                      </button>
                      <button
                        type="button"
                        onClick={() => setWordFontSize(14)}
                        style={{
                          flex: 1,
                          padding: '6px 8px',
                          borderRadius: 6,
                          border: `1px solid ${wordFontSize === 14 ? '#16a34a' : '#cbd5e1'}`,
                          backgroundColor: wordFontSize === 14 ? '#dcfce7' : '#ffffff',
                          color: wordFontSize === 14 ? '#166534' : '#4b5563',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        14pt
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Standard Exam Paper Header (A4 Header) */}
            <div className="exam-header-print" style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 20,
              borderBottom: '2px solid #1e293b',
              paddingBottom: 16,
              marginBottom: 20,
            }}>
              {/* Left Header */}
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#1e293b', textTransform: 'uppercase' }}>
                  {config.schoolName || 'TRƯỜNG THCS NGUYỄN DU'}
                </div>
                {config.subHeader && config.subHeader.trim() !== '' && (
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>
                    {config.subHeader}
                  </div>
                )}
                <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: 4 }}>
                  Năm học: {config.academicYear || '2026 - 2027'}
                </div>
              </div>

              {/* Right Header */}
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1e3a8a', textTransform: 'uppercase' }}>
                  {formatExamTitle(config.examTitle)}
                </div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1e293b', marginTop: 2 }}>
                  Môn: {config.subject} ({config.grade})
                </div>
                <div style={{ fontSize: '0.82rem', fontStyle: 'italic', color: '#475569' }}>
                  Thời gian làm bài: {config.durationMinutes} phút (Không kể phát đề)
                </div>
                <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#dc2626', marginTop: 4 }}>
                  MÃ ĐỀ: {currentVariant.code}
                </div>
              </div>
            </div>

            {/* Student Info Bar */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '0.85rem',
              color: '#334155',
              paddingBottom: 14,
              borderBottom: '1px dashed #cbd5e1',
              marginBottom: 20,
              fontStyle: 'italic',
            }}>
              <span>Họ và tên học sinh: ............................................................................</span>
              <span>Lớp: ....................</span>
              <span>SBD: ....................</span>
            </div>

            {/* Questions List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {questions.map((q, idx) => (
                <div
                  key={q.id}
                  className="question-item"
                  style={{
                    padding: '14px 16px',
                    borderRadius: 10,
                    border: '1px solid #e2e8f0',
                    backgroundColor: '#ffffff',
                    position: 'relative',
                  }}
                >
                  {/* Question Header & Action buttons */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: 8,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#1e40af' }}>
                        Câu {idx + 1} ({q.score} điểm):
                      </span>
                      <span className="no-print" style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: 12,
                        backgroundColor: '#eff6ff',
                        color: '#1d4ed8',
                      }}>
                        {LEVEL_NAMES[q.level] || q.level}
                      </span>
                      {q.topic && (
                        <span className="no-print" style={{ fontSize: '0.72rem', color: '#64748b' }}>
                          [{q.topic}]
                        </span>
                      )}
                      {q.needsTeacherReview && (
                        <span style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          backgroundColor: '#fef3c7',
                          color: '#b45309',
                          padding: '2px 8px',
                          borderRadius: 10,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                        }}>
                          <AlertTriangle size={12} /> Cần giáo viên kiểm tra
                        </span>
                      )}
                    </div>

                    {/* Action buttons on question (no-print) */}
                    <div className="no-print" style={{ display: 'flex', gap: 4 }}>
                      <button
                        type="button"
                        onClick={() => onRegenerateQuestion(q)}
                        style={{
                          padding: '4px 8px',
                          borderRadius: 6,
                          border: '1px solid #cbd5e1',
                          backgroundColor: '#ffffff',
                          color: '#0284c7',
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 3,
                        }}
                        title="Tạo lại riêng câu hỏi này"
                      >
                        <RotateCw size={12} />
                        <span>Tạo lại</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onOpenEditQuestion(q)}
                        style={{
                          padding: '4px 8px',
                          borderRadius: 6,
                          border: '1px solid #cbd5e1',
                          backgroundColor: '#ffffff',
                          color: '#475569',
                          fontSize: '0.72rem',
                          cursor: 'pointer',
                        }}
                        title="Chỉnh sửa câu hỏi này"
                      >
                        <Edit3 size={12} />
                      </button>

                      <button
                        type="button"
                        onClick={() => onSaveToQuestionBank({ ...q, bankId: `bank-${Date.now()}-${idx}`, savedAt: new Date().toISOString() })}
                        style={{
                          padding: '4px 8px',
                          borderRadius: 6,
                          border: '1px solid #cbd5e1',
                          backgroundColor: '#ffffff',
                          color: '#16a34a',
                          fontSize: '0.72rem',
                          cursor: 'pointer',
                        }}
                        title="Lưu câu này vào ngân hàng câu hỏi"
                      >
                        <BookmarkPlus size={12} />
                      </button>

                      <button
                        type="button"
                        onClick={() => onDeleteQuestion(q.id)}
                        style={{
                          padding: '4px 8px',
                          borderRadius: 6,
                          border: '1px solid #fecaca',
                          backgroundColor: '#fef2f2',
                          color: '#dc2626',
                          fontSize: '0.72rem',
                          cursor: 'pointer',
                        }}
                        title="Xóa câu hỏi này"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>

                  {/* Question body text */}
                  <div style={{ fontSize: '0.9rem', color: '#1e293b', lineHeight: 1.6, marginBottom: 10, whiteSpace: 'pre-line' }}>
                    {q.question}
                  </div>

                  {/* Options (MCQ) */}
                  {q.options && q.options.length > 0 && (
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: q.options.some(o => o.length > 40) ? '1fr' : '1fr 1fr',
                      gap: 8,
                      marginLeft: 12,
                    }}>
                      {q.options.map((opt, optIdx) => {
                        const letter = String.fromCharCode(65 + optIdx); // A, B, C, D...
                        const cleanOpt = opt.replace(/^[A-Z]\.\s*/i, '').trim();
                        return (
                          <div key={optIdx} style={{ fontSize: '0.88rem', color: '#334155' }}>
                            <strong style={{ fontWeight: 700, color: '#1e293b' }}>{letter}. </strong>
                            <span>{cleanOpt}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Matching pairs if any */}
                  {q.matchingPairs && q.matchingPairs.length > 0 && (
                    <div style={{ marginLeft: 16, marginTop: 8 }}>
                      {q.matchingPairs.map((pair, pIdx) => (
                        <div key={pIdx} style={{ fontSize: '0.85rem', color: '#475569', fontStyle: 'italic' }}>
                          {pIdx + 1}. {pair.left}  &lt;---&gt;  {pair.right}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Bottom Add Question Button (no-print) */}
            <div className="no-print" style={{ marginTop: 20, textAlign: 'center' }}>
              <button
                type="button"
                onClick={onAddQuestion}
                style={{
                  padding: '8px 18px',
                  borderRadius: 8,
                  border: '1px dashed #2563eb',
                  backgroundColor: '#eff6ff',
                  color: '#1d4ed8',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <Plus size={16} /> Thêm câu hỏi mới
              </button>
            </div>
          </div>
        )}

        {/* ================= TAB 2: ĐÁP ÁN ================= */}
        {activeTab === 'dap_an' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#1e3a8a' }}>
                BẢNG ĐÁP ÁN & HƯỚNG DẪN GIẢI CHI TIẾT (MÃ ĐỀ: {currentVariant.code})
              </h3>
              <button
                type="button"
                onClick={() => exportAnswerKeyToWord(examPackage, selectedCode, wordFontSize)}
                className="no-print"
                style={{
                  padding: '6px 12px',
                  borderRadius: 6,
                  border: '1px solid #1e40af',
                  backgroundColor: '#1e40af',
                  color: '#ffffff',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                }}
              >
                <Download size={14} /> Xuất đáp án (.docx)
              </button>
            </div>

            {/* Answer Table */}
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '0.85rem',
            }}>
              <thead>
                <tr style={{ backgroundColor: '#f1f5f9', color: '#1e293b', textAlign: 'center' }}>
                  <th style={{ border: '1px solid #cbd5e1', padding: '10px 8px', width: '8%' }}>Câu</th>
                  <th style={{ border: '1px solid #cbd5e1', padding: '10px 8px', width: '15%' }}>Đáp án đúng</th>
                  <th style={{ border: '1px solid #cbd5e1', padding: '10px 8px', width: '10%' }}>Điểm</th>
                  <th style={{ border: '1px solid #cbd5e1', padding: '10px 8px', width: '67%', textAlign: 'left' }}>Hướng dẫn giải chi tiết</th>
                </tr>
              </thead>
              <tbody>
                {questions.map((q, idx) => {
                  const ans = Array.isArray(q.correctAnswer) ? q.correctAnswer.join(', ') : String(q.correctAnswer || '');
                  return (
                    <tr key={q.id} style={{ backgroundColor: idx % 2 === 0 ? '#ffffff' : '#fafafa' }}>
                      <td style={{ border: '1px solid #cbd5e1', padding: '8px', textAlign: 'center', fontWeight: 700 }}>
                        {idx + 1}
                      </td>
                      <td style={{ border: '1px solid #cbd5e1', padding: '8px', textAlign: 'center', fontWeight: 800, color: '#1e40af', fontSize: '0.95rem' }}>
                        {ans}
                      </td>
                      <td style={{ border: '1px solid #cbd5e1', padding: '8px', textAlign: 'center', fontWeight: 600 }}>
                        {q.score}
                      </td>
                      <td style={{ border: '1px solid #cbd5e1', padding: '8px', color: '#334155', lineHeight: 1.5 }}>
                        {q.explanation || 'Theo quy chuẩn đáp án.'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* ================= TAB 3: HƯỚNG DẪN CHẤM ================= */}
        {activeTab === 'huong_dan_cham' && (
          <div>
            <h3 style={{ margin: '0 0 14px', fontSize: '1.05rem', fontWeight: 800, color: '#1e3a8a' }}>
              HƯỚNG DẪN CHẤM BÀI THI & BIỂU ĐIỂM CHI TIẾT
            </h3>

            {/* General notes */}
            <div style={{
              padding: '12px 16px',
              borderRadius: 10,
              backgroundColor: '#eff6ff',
              border: '1px solid #bfdbfe',
              marginBottom: 18,
            }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e40af', marginBottom: 6 }}>
                📌 Lưu ý chung khi chấm bài:
              </div>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: '0.82rem', color: '#1e3a8a', lineHeight: 1.6 }}>
                {examPackage.gradingGuide.generalNotes.map((note, idx) => (
                  <li key={idx}>{note}</li>
                ))}
              </ul>
            </div>

            {/* Rubrics table */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {examPackage.gradingGuide.rubrics.map((rb, idx) => (
                <div key={idx} style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: 10,
                  padding: '12px 16px',
                  backgroundColor: '#ffffff',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1e3a8a' }}>
                      {rb.questionTitle}
                    </div>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#15803d', backgroundColor: '#f0fdf4', padding: '2px 8px', borderRadius: 6 }}>
                      Tổng: {rb.totalScore} điểm
                    </span>
                  </div>

                  <div style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: 10 }}>
                    Yêu cầu cần đạt: {rb.learningOutcome}
                  </div>

                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f8fafc', color: '#475569' }}>
                        <th style={{ border: '1px solid #e2e8f0', padding: '6px 8px', textAlign: 'left', width: '80%' }}>Nội dung tiêu chí cần đạt</th>
                        <th style={{ border: '1px solid #e2e8f0', padding: '6px 8px', textAlign: 'center', width: '20%' }}>Điểm thành phần</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rb.breakdown.map((b, bIdx) => (
                        <tr key={bIdx}>
                          <td style={{ border: '1px solid #e2e8f0', padding: '6px 8px', color: '#334155' }}>{b.criteria}</td>
                          <td style={{ border: '1px solid #e2e8f0', padding: '6px 8px', textAlign: 'center', fontWeight: 700, color: '#1e40af' }}>{b.score}đ</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 4: MA TRẬN ================= */}
        {activeTab === 'ma_tran' && (
          <MatrixTable
            matrix={examPackage.matrix}
            examTitle={config.examTitle}
            subject={config.subject}
            grade={config.grade}
          />
        )}

        {/* ================= TAB 5: BẢN ĐẶC TẢ ================= */}
        {activeTab === 'ban_dac_ta' && (
          <SpecificationTable specifications={examPackage.specification} />
        )}
      </div>
    </div>
  );
};
