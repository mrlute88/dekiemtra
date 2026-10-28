'use client';

import React, { useState, useRef } from 'react';
import { 
  X, 
  Search, 
  Database, 
  Trash2, 
  Copy, 
  Plus, 
  Download, 
  Upload, 
  RotateCcw, 
  Check, 
  Layers, 
  BookOpen,
  CheckCircle2
} from 'lucide-react';
import { CognitiveLevel, Question, QuestionBankItem, QuestionType } from '@/types/exam';
import { LEVEL_NAMES } from '@/lib/matrixCalculator';
import { exportQuestionBankJSON, importQuestionBankJSON, resetQuestionBankToSeed } from '@/lib/storage';

interface QuestionBankModalProps {
  isOpen: boolean;
  onClose: () => void;
  bankItems: QuestionBankItem[];
  onRemoveItem: (bankId: string) => void;
  onInsertIntoExam: (question: Question) => void;
  onDuplicateItem: (item: QuestionBankItem) => void;
  onSaveNewItem: (item: QuestionBankItem) => void;
  onReloadBank: () => void;
}

export const QuestionBankModal: React.FC<QuestionBankModalProps> = ({
  isOpen,
  onClose,
  bankItems,
  onRemoveItem,
  onInsertIntoExam,
  onDuplicateItem,
  onSaveNewItem,
  onReloadBank,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [filterSubject, setFilterSubject] = useState<string>('all');
  const [filterGrade, setFilterGrade] = useState<string>('all');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // New Question Form state
  const [newSubject, setNewSubject] = useState('Toán');
  const [newGrade, setNewGrade] = useState('Lớp 6');
  const [newTopic, setNewTopic] = useState('');
  const [newQuestionType, setNewQuestionType] = useState<QuestionType>('trac_nghiem_4');
  const [newLevel, setNewLevel] = useState<CognitiveLevel>('nhan_biet');
  const [newQuestionText, setNewQuestionText] = useState('');
  const [newOptionA, setNewOptionA] = useState('');
  const [newOptionB, setNewOptionB] = useState('');
  const [newOptionC, setNewOptionC] = useState('');
  const [newOptionD, setNewOptionD] = useState('');
  const [newCorrectAnswer, setNewCorrectAnswer] = useState('A');
  const [newExplanation, setNewExplanation] = useState('');
  const [newScore, setNewScore] = useState(0.25);
  const [newOutcome, setNewOutcome] = useState('');

  if (!isOpen) return null;

  // Filter collections
  const subjects = Array.from(new Set(bankItems.map((q) => q.subject).filter(Boolean)));
  const grades = Array.from(new Set(bankItems.map((q) => q.grade).filter(Boolean)));

  const filteredItems = bankItems.filter((q) => {
    const matchSearch =
      q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (q.topic && q.topic.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchLevel = filterLevel === 'all' || q.level === filterLevel;
    const matchSubject = filterSubject === 'all' || q.subject === filterSubject;
    const matchGrade = filterGrade === 'all' || q.grade === filterGrade;
    return matchSearch && matchLevel && matchSubject && matchGrade;
  });

  const handleExportJSON = () => {
    const jsonStr = exportQuestionBankJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ngan_hang_cau_hoi_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setStatusMessage('Đã tải xuống tệp sao lưu JSON!');
    setTimeout(() => setStatusMessage(''), 2500);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = importQuestionBankJSON(content);
      if (res.success) {
        onReloadBank();
        setStatusMessage(`Đã nhập thành công ${res.count} câu hỏi mới!`);
      } else {
        alert(`Lỗi nhập tệp: ${res.error}`);
      }
      setTimeout(() => setStatusMessage(''), 3000);
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleResetSeed = () => {
    if (confirm('Khôi phục ngân hàng câu hỏi chuẩn GDPT 2018 mặc định? (Các câu hỏi trùng sẽ được làm mới)')) {
      resetQuestionBankToSeed();
      onReloadBank();
      setStatusMessage('Đã khôi phục ngân hàng câu hỏi mẫu chuẩn!');
      setTimeout(() => setStatusMessage(''), 2500);
    }
  };

  const handleCreateQuestionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestionText.trim()) {
      alert('Vui lòng nhập nội dung câu hỏi.');
      return;
    }

    const options = newQuestionType === 'trac_nghiem_4'
      ? [
          newOptionA.trim() || 'A. Phương án A',
          newOptionB.trim() || 'B. Phương án B',
          newOptionC.trim() || 'C. Phương án C',
          newOptionD.trim() || 'D. Phương án D',
        ]
      : newQuestionType === 'dung_sai'
      ? ['Đúng', 'Sai']
      : undefined;

    const item: QuestionBankItem = {
      bankId: `bank-${Date.now()}`,
      id: `QB-${Date.now().toString().slice(-4)}`,
      subject: newSubject,
      grade: newGrade,
      topic: newTopic || 'Chủ đề chung',
      questionType: newQuestionType,
      level: newLevel,
      question: newQuestionText.trim(),
      options,
      correctAnswer: newCorrectAnswer,
      explanation: newExplanation.trim(),
      score: newScore,
      learningOutcome: newOutcome.trim(),
      savedAt: new Date().toISOString(),
      tags: [newSubject, newGrade],
    };

    onSaveNewItem(item);
    setIsAddingNew(false);
    setNewQuestionText('');
    setNewOptionA('');
    setNewOptionB('');
    setNewOptionC('');
    setNewOptionD('');
    setNewExplanation('');
    setStatusMessage('Đã thêm câu hỏi mới vào ngân hàng!');
    setTimeout(() => setStatusMessage(''), 2500);
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
        borderRadius: 12,
        maxWidth: 960,
        width: '100%',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        overflow: 'hidden',
        border: '1px solid #e2e8f0',
        display: 'flex',
        flexDirection: 'column',
        maxHeight: '88vh',
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
              width: 36,
              height: 36,
              borderRadius: 8,
              backgroundColor: '#1e3a8a',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Database size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>
                Ngân hàng câu hỏi giáo viên ({bankItems.length} câu)
              </h3>
              <p style={{ margin: 0, fontSize: '0.76rem', color: '#64748b' }}>
                Lưu trữ, lọc theo môn & lớp, sao lưu JSON và tái sử dụng cho các đề thi
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {statusMessage && (
              <span style={{ fontSize: '0.78rem', color: '#16a34a', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                <CheckCircle2 size={14} /> {statusMessage}
              </span>
            )}
            <button
              type="button"
              onClick={onClose}
              style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#64748b', padding: 4 }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Toolbar: Add, Export, Import, Reset */}
        <div style={{
          padding: '10px 20px',
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 8,
        }}>
          <button
            type="button"
            onClick={() => setIsAddingNew(!isAddingNew)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 12px',
              borderRadius: 6,
              backgroundColor: isAddingNew ? '#eff6ff' : '#1e3a8a',
              color: isAddingNew ? '#1e40af' : '#ffffff',
              border: `1px solid ${isAddingNew ? '#bfdbfe' : '#1e3a8a'}`,
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <Plus size={15} />
            <span>{isAddingNew ? 'Đóng biểu mẫu nhập' : 'Thêm câu hỏi mới'}</span>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              style={{ display: 'none' }}
              onChange={handleImportFile}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                padding: '6px 10px',
                borderRadius: 6,
                backgroundColor: '#ffffff',
                color: '#334155',
                border: '1px solid #cbd5e1',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
              title="Nhập câu hỏi từ tệp JSON sao lưu"
            >
              <Upload size={14} />
              <span>Nhập JSON</span>
            </button>

            <button
              type="button"
              onClick={handleExportJSON}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                padding: '6px 10px',
                borderRadius: 6,
                backgroundColor: '#ffffff',
                color: '#334155',
                border: '1px solid #cbd5e1',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
              title="Tải toàn bộ ngân hàng câu hỏi về máy tính (JSON)"
            >
              <Download size={14} />
              <span>Xuất JSON</span>
            </button>

            <button
              type="button"
              onClick={handleResetSeed}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                padding: '6px 10px',
                borderRadius: 6,
                backgroundColor: '#ffffff',
                color: '#64748b',
                border: '1px solid #cbd5e1',
                fontSize: '0.78rem',
                cursor: 'pointer',
              }}
              title="Khôi phục lại các câu hỏi chuẩn mẫu"
            >
              <RotateCcw size={14} />
              <span>Khôi phục mẫu</span>
            </button>
          </div>
        </div>

        {/* Form: Add New Question (Collapsible) */}
        {isAddingNew && (
          <form onSubmit={handleCreateQuestionSubmit} style={{
            padding: '16px 20px',
            backgroundColor: '#f8fafc',
            borderBottom: '1px solid #e2e8f0',
            maxHeight: '340px',
            overflowY: 'auto',
          }}>
            <h4 style={{ margin: '0 0 10px', fontSize: '0.88rem', fontWeight: 700, color: '#1e3a8a' }}>
              Nhập câu hỏi mới vào ngân hàng
            </h4>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 10 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 600, color: '#475569', marginBottom: 3 }}>Môn học:</label>
                <input
                  type="text"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  style={{ width: '100%', padding: '5px 8px', borderRadius: 4, border: '1px solid #cbd5e1', fontSize: '0.78rem' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 600, color: '#475569', marginBottom: 3 }}>Khối lớp:</label>
                <input
                  type="text"
                  value={newGrade}
                  onChange={(e) => setNewGrade(e.target.value)}
                  style={{ width: '100%', padding: '5px 8px', borderRadius: 4, border: '1px solid #cbd5e1', fontSize: '0.78rem' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 600, color: '#475569', marginBottom: 3 }}>Dạng câu:</label>
                <select
                  value={newQuestionType}
                  onChange={(e) => setNewQuestionType(e.target.value as QuestionType)}
                  style={{ width: '100%', padding: '5px 8px', borderRadius: 4, border: '1px solid #cbd5e1', fontSize: '0.78rem' }}
                >
                  <option value="trac_nghiem_4">Trắc nghiệm 4 lựa chọn</option>
                  <option value="dung_sai">Đúng / Sai</option>
                  <option value="tra_loi_ngan">Trả lời ngắn</option>
                  <option value="tu_luan_ngan">Tự luận ngắn</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 600, color: '#475569', marginBottom: 3 }}>Mức độ:</label>
                <select
                  value={newLevel}
                  onChange={(e) => setNewLevel(e.target.value as CognitiveLevel)}
                  style={{ width: '100%', padding: '5px 8px', borderRadius: 4, border: '1px solid #cbd5e1', fontSize: '0.78rem' }}
                >
                  <option value="nhan_biet">Nhận biết</option>
                  <option value="thong_hieu">Thông hiểu</option>
                  <option value="van_dung">Vận dụng</option>
                  <option value="van_dung_cao">Vận dụng cao</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom: 10 }}>
              <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 600, color: '#475569', marginBottom: 3 }}>Chủ đề kiến thức:</label>
              <input
                type="text"
                placeholder="VD: Tập hợp các số tự nhiên, Hệ thống máy tính..."
                value={newTopic}
                onChange={(e) => setNewTopic(e.target.value)}
                style={{ width: '100%', padding: '5px 8px', borderRadius: 4, border: '1px solid #cbd5e1', fontSize: '0.78rem' }}
              />
            </div>

            <div style={{ marginBottom: 10 }}>
              <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 600, color: '#475569', marginBottom: 3 }}>Nội dung câu hỏi:</label>
              <textarea
                rows={2}
                value={newQuestionText}
                onChange={(e) => setNewQuestionText(e.target.value)}
                style={{ width: '100%', padding: '6px 8px', borderRadius: 4, border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
                placeholder="Nhập nội dung câu hỏi..."
                required
              />
            </div>

            {newQuestionType === 'trac_nghiem_4' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
                <input
                  type="text"
                  placeholder="Phương án A"
                  value={newOptionA}
                  onChange={(e) => setNewOptionA(e.target.value)}
                  style={{ padding: '5px 8px', borderRadius: 4, border: '1px solid #cbd5e1', fontSize: '0.78rem' }}
                />
                <input
                  type="text"
                  placeholder="Phương án B"
                  value={newOptionB}
                  onChange={(e) => setNewOptionB(e.target.value)}
                  style={{ padding: '5px 8px', borderRadius: 4, border: '1px solid #cbd5e1', fontSize: '0.78rem' }}
                />
                <input
                  type="text"
                  placeholder="Phương án C"
                  value={newOptionC}
                  onChange={(e) => setNewOptionC(e.target.value)}
                  style={{ padding: '5px 8px', borderRadius: 4, border: '1px solid #cbd5e1', fontSize: '0.78rem' }}
                />
                <input
                  type="text"
                  placeholder="Phương án D"
                  value={newOptionD}
                  onChange={(e) => setNewOptionD(e.target.value)}
                  style={{ padding: '5px 8px', borderRadius: 4, border: '1px solid #cbd5e1', fontSize: '0.78rem' }}
                />
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 10, marginBottom: 10 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 600, color: '#475569', marginBottom: 3 }}>Đáp án đúng:</label>
                <input
                  type="text"
                  placeholder="VD: A, B, Đúng, hoặc nội dung đáp án"
                  value={newCorrectAnswer}
                  onChange={(e) => setNewCorrectAnswer(e.target.value)}
                  style={{ width: '100%', padding: '5px 8px', borderRadius: 4, border: '1px solid #cbd5e1', fontSize: '0.78rem' }}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 600, color: '#475569', marginBottom: 3 }}>Lời giải / Hướng dẫn chấm:</label>
                <input
                  type="text"
                  placeholder="Giải thích vì sao đáp án đúng..."
                  value={newExplanation}
                  onChange={(e) => setNewExplanation(e.target.value)}
                  style={{ width: '100%', padding: '5px 8px', borderRadius: 4, border: '1px solid #cbd5e1', fontSize: '0.78rem' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button
                type="button"
                onClick={() => setIsAddingNew(false)}
                style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '0.78rem', cursor: 'pointer' }}
              >
                Hủy
              </button>
              <button
                type="submit"
                style={{ padding: '6px 16px', borderRadius: 6, border: 'none', backgroundColor: '#1e3a8a', color: '#ffffff', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}
              >
                Lưu vào ngân hàng
              </button>
            </div>
          </form>
        )}

        {/* Filter Bar */}
        <div style={{
          padding: '10px 20px',
          backgroundColor: '#f8fafc',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          gap: 10,
          flexWrap: 'wrap',
          alignItems: 'center',
        }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Tìm kiếm nội dung câu hỏi hoặc chủ đề..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '5px 10px 5px 30px',
                borderRadius: 6,
                border: '1px solid #cbd5e1',
                fontSize: '0.8rem',
              }}
            />
          </div>

          <select
            value={filterSubject}
            onChange={(e) => setFilterSubject(e.target.value)}
            style={{ padding: '5px 8px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.78rem' }}
          >
            <option value="all">Tất cả môn</option>
            {subjects.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          <select
            value={filterGrade}
            onChange={(e) => setFilterGrade(e.target.value)}
            style={{ padding: '5px 8px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.78rem' }}
          >
            <option value="all">Tất cả lớp</option>
            {grades.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>

          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
            style={{ padding: '5px 8px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.78rem' }}
          >
            <option value="all">Tất cả mức độ</option>
            <option value="nhan_biet">Nhận biết</option>
            <option value="thong_hieu">Thông hiểu</option>
            <option value="van_dung">Vận dụng</option>
            <option value="van_dung_cao">Vận dụng cao</option>
          </select>
        </div>

        {/* Question List */}
        <div style={{ padding: '16px 20px', overflowY: 'auto', flex: 1 }}>
          {filteredItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8' }}>
              <Database size={40} style={{ margin: '0 auto 10px', opacity: 0.4 }} />
              <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>Không tìm thấy câu hỏi phù hợp</div>
              <div style={{ fontSize: '0.78rem', marginTop: 4 }}>
                Bấm <strong>Khôi phục mẫu</strong> hoặc <strong>Thêm câu hỏi mới</strong> để bổ sung câu hỏi vào ngân hàng.
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {filteredItems.map((item, idx) => (
                <div
                  key={item.bankId}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 8,
                    border: '1px solid #e2e8f0',
                    backgroundColor: '#ffffff',
                    transition: 'border-color 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#1e40af' }}>
                        #{idx + 1}
                      </span>
                      <span style={{
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        backgroundColor: '#eff6ff',
                        color: '#1d4ed8',
                        padding: '1px 6px',
                        borderRadius: 4,
                      }}>
                        {item.subject} • {item.grade}
                      </span>
                      <span style={{
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        backgroundColor:
                          item.level === 'nhan_biet' ? '#f1f5f9' :
                          item.level === 'thong_hieu' ? '#f0fdf4' :
                          item.level === 'van_dung' ? '#fffbeb' : '#fef2f2',
                        color:
                          item.level === 'nhan_biet' ? '#334155' :
                          item.level === 'thong_hieu' ? '#15803d' :
                          item.level === 'van_dung' ? '#b45309' : '#b91c1c',
                        padding: '1px 6px',
                        borderRadius: 4,
                      }}>
                        {LEVEL_NAMES[item.level] || item.level}
                      </span>
                      {item.topic && (
                        <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                          [{item.topic}]
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: 5 }}>
                      <button
                        type="button"
                        onClick={() => onInsertIntoExam(item)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                          padding: '4px 8px',
                          borderRadius: 4,
                          backgroundColor: '#f0fdf4',
                          color: '#15803d',
                          border: '1px solid #bbf7d0',
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                        title="Chèn câu này vào đề thi hiện tại"
                      >
                        <Plus size={13} /> Chèn vào đề
                      </button>

                      <button
                        type="button"
                        onClick={() => onDuplicateItem(item)}
                        style={{
                          padding: '4px 7px',
                          borderRadius: 4,
                          backgroundColor: '#f8fafc',
                          color: '#475569',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.72rem',
                          cursor: 'pointer',
                        }}
                        title="Nhân bản câu này"
                      >
                        <Copy size={13} />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (confirm('Xác nhận xóa câu hỏi này khỏi ngân hàng?')) {
                            onRemoveItem(item.bankId);
                          }
                        }}
                        style={{
                          padding: '4px 7px',
                          borderRadius: 4,
                          backgroundColor: '#fef2f2',
                          color: '#dc2626',
                          border: '1px solid #fecaca',
                          fontSize: '0.72rem',
                          cursor: 'pointer',
                        }}
                        title="Xóa câu này khỏi ngân hàng"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Question content */}
                  <div style={{ fontSize: '0.86rem', color: '#1e293b', lineHeight: 1.5, marginBottom: 6 }}>
                    {item.question}
                  </div>

                  {/* Options */}
                  {item.options && item.options.length > 0 && (
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: item.options.some(o => o.length > 35) ? '1fr' : '1fr 1fr',
                      gap: 4,
                      fontSize: '0.78rem',
                      color: '#475569',
                      marginBottom: 6,
                    }}>
                      {item.options.map((opt, oIdx) => (
                        <div key={oIdx} style={{
                          color: opt.startsWith(item.correctAnswer as string) ? '#15803d' : '#475569',
                          fontWeight: opt.startsWith(item.correctAnswer as string) ? 600 : 400,
                        }}>
                          {opt}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Footer explanation / answer */}
                  <div style={{
                    fontSize: '0.74rem',
                    color: '#64748b',
                    backgroundColor: '#f8fafc',
                    padding: '4px 8px',
                    borderRadius: 4,
                  }}>
                    <strong style={{ color: '#166534' }}>Đáp án: {Array.isArray(item.correctAnswer) ? item.correctAnswer.join(', ') : item.correctAnswer}</strong>
                    {item.explanation && <span> — {item.explanation}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
