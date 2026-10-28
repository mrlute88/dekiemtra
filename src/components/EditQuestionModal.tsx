'use client';

import React, { useState, useEffect } from 'react';
import { X, Check, Edit3, Plus, Trash2 } from 'lucide-react';
import { CognitiveLevel, Question, QuestionType } from '@/types/exam';

interface EditQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  question: Question | null;
  onSaveQuestion: (updatedQuestion: Question) => void;
}

export const EditQuestionModal: React.FC<EditQuestionModalProps> = ({
  isOpen,
  onClose,
  question,
  onSaveQuestion,
}) => {
  const [formData, setFormData] = useState<Question | null>(null);

  useEffect(() => {
    if (question) {
      setFormData({ ...question });
    }
  }, [question]);

  if (!isOpen || !formData) return null;

  const handleOptionChange = (idx: number, value: string) => {
    const updatedOptions = [...(formData.options || [])];
    updatedOptions[idx] = value;
    setFormData({ ...formData, options: updatedOptions });
  };

  const handleAddOption = () => {
    const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
    const nextLetter = letters[formData.options?.length || 0] || 'X';
    const updatedOptions = [...(formData.options || []), `${nextLetter}. Phương án mới`];
    setFormData({ ...formData, options: updatedOptions });
  };

  const handleRemoveOption = (idx: number) => {
    const updatedOptions = (formData.options || []).filter((_, i) => i !== idx);
    setFormData({ ...formData, options: updatedOptions });
  };

  const handleSave = () => {
    onSaveQuestion(formData);
    onClose();
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
        maxWidth: 650,
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
              backgroundColor: '#1e40af',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Edit3 size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#1e293b' }}>
                Chỉnh sửa câu hỏi ({formData.id})
              </h3>
              <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b' }}>
                Giáo viên có toàn quyền điều chỉnh nội dung, điểm số và đáp án
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#94a3b8' }}>
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '16px 20px', maxHeight: '72vh', overflowY: 'auto' }}>
          {/* Topic & Subtopic */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                Chủ đề:
              </label>
              <input
                type="text"
                value={formData.topic || ''}
                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                Đơn vị kiến thức:
              </label>
              <input
                type="text"
                value={formData.subtopic || ''}
                onChange={(e) => setFormData({ ...formData, subtopic: e.target.value })}
                style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
              />
            </div>
          </div>

          {/* Level & Score */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                Mức độ nhận thức:
              </label>
              <select
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: e.target.value as CognitiveLevel })}
                style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
              >
                <option value="nhan_biet">Nhận biết</option>
                <option value="thong_hieu">Thông hiểu</option>
                <option value="van_dung">Vận dụng</option>
                <option value="van_dung_cao">Vận dụng cao</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                Điểm số câu này:
              </label>
              <input
                type="number"
                step="0.05"
                min="0.1"
                max="10"
                value={formData.score}
                onChange={(e) => setFormData({ ...formData, score: parseFloat(e.target.value) || 0.25 })}
                style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.82rem', fontWeight: 700 }}
              />
            </div>
          </div>

          {/* Question Text */}
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
              Nội dung câu hỏi:
            </label>
            <textarea
              rows={3}
              value={formData.question}
              onChange={(e) => setFormData({ ...formData, question: e.target.value })}
              style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
            />
          </div>

          {/* Options for MCQ */}
          {formData.options && formData.options.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569' }}>
                  Các phương án lựa chọn:
                </label>
                <button
                  type="button"
                  onClick={handleAddOption}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    fontSize: '0.72rem',
                    color: '#1e40af',
                    backgroundColor: '#eff6ff',
                    border: '1px solid #bfdbfe',
                    borderRadius: 4,
                    padding: '2px 6px',
                    cursor: 'pointer',
                  }}
                >
                  <Plus size={12} /> Thêm phương án
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {formData.options.map((opt, optIdx) => (
                  <div key={optIdx} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => handleOptionChange(optIdx, e.target.value)}
                      style={{ flex: 1, padding: '6px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(optIdx)}
                      style={{ border: 'none', background: 'transparent', color: '#dc2626', cursor: 'pointer', padding: 4 }}
                      title="Xóa phương án này"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Correct Answer */}
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
              Đáp án chính xác:
            </label>
            <input
              type="text"
              value={Array.isArray(formData.correctAnswer) ? formData.correctAnswer.join(', ') : String(formData.correctAnswer)}
              onChange={(e) => setFormData({ ...formData, correctAnswer: e.target.value })}
              placeholder="Ví dụ: A (đối với trắc nghiệm) hoặc nội dung kết quả"
              style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.85rem', fontWeight: 700, color: '#1e40af' }}
            />
          </div>

          {/* Explanation */}
          <div style={{ marginBottom: 10 }}>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
              Lời giải chi tiết / Hướng dẫn chấm:
            </label>
            <textarea
              rows={3}
              value={formData.explanation || ''}
              onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
              style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
            />
          </div>
        </div>

        {/* Footer */}
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
            onClick={handleSave}
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
            Lưu thay đổi
          </button>
        </div>
      </div>
    </div>
  );
};
