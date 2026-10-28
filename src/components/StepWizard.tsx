'use client';

import React, { useState, useMemo } from 'react';
import { 
  GraduationCap, 
  BookOpen, 
  FileText, 
  Upload, 
  Clock, 
  ListFilter, 
  Sliders, 
  Award, 
  Sparkles, 
  Layers, 
  AlertTriangle, 
  Check, 
  FileUp, 
  Plus, 
  Trash2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { CognitiveLevel, EducationLevel, ExamConfig, ExamType, QuestionType } from '@/types/exam';
import { GRADES_BY_LEVEL, SUBJECTS_BY_LEVEL } from '@/lib/sampleData';
import { EXAM_PERIODS, ExamPeriodKey, getCurriculumForPeriod } from '@/lib/curriculumDatabase';

interface StepWizardProps {
  config: ExamConfig;
  onChangeConfig: (newConfig: ExamConfig) => void;
  onGenerateExam: () => void;
  onGenerateMatrixOnly: () => void;
  onGenerateEquivalent: () => void;
  onOpenImportMatrix: () => void;
  isGenerating: boolean;
  generationProgress: string;
}

export const StepWizard: React.FC<StepWizardProps> = ({
  config,
  onChangeConfig,
  onGenerateExam,
  onGenerateMatrixOnly,
  onGenerateEquivalent,
  onOpenImportMatrix,
  isGenerating,
  generationProgress,
}) => {
  // Collapsible section state for compact navigation
  const [openSection, setOpenSection] = useState<number | null>(1);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractError, setExtractError] = useState('');
  const [extractSuccess, setExtractSuccess] = useState('');

  const toggleSection = (idx: number) => {
    setOpenSection(openSection === idx ? null : idx);
  };

  // Helper updates
  const update = (fields: Partial<ExamConfig>) => {
    onChangeConfig({ ...config, ...fields });
  };

  // Total questions count
  const totalQuestions = useMemo(() => {
    return Object.values(config.questionTypeCounts).reduce((a, b) => a + b, 0);
  }, [config.questionTypeCounts]);

  // Percentage sum check
  const totalPercentage = useMemo(() => {
    return (
      (config.levelPercentages.nhan_biet || 0) +
      (config.levelPercentages.thong_hieu || 0) +
      (config.levelPercentages.van_dung || 0) +
      (config.levelPercentages.van_dung_cao || 0)
    );
  }, [config.levelPercentages]);

  const totalLevelCounts = useMemo(() => {
    return (
      (config.levelCounts.nhan_biet || 0) +
      (config.levelCounts.thong_hieu || 0) +
      (config.levelCounts.van_dung || 0) +
      (config.levelCounts.van_dung_cao || 0)
    );
  }, [config.levelCounts]);

  // Handle level change
  const handleLevelChange = (lvl: EducationLevel) => {
    const grades = GRADES_BY_LEVEL[lvl];
    const subjects = SUBJECTS_BY_LEVEL[lvl];
    const newGrade = grades[0];
    const newSubject = subjects[0];
    if (config.selectedPeriod) {
      const cur = getCurriculumForPeriod(newGrade, newSubject, config.selectedPeriod);
      update({
        level: lvl,
        grade: newGrade,
        subject: newSubject,
        customSubject: '',
        topic: cur.topic,
        chapter: cur.chapter,
        knowledgeScope: cur.knowledgeScope,
        learningOutcome: cur.learningOutcome,
        examType: cur.examType,
        semester: cur.semester,
        examTitle: `ĐỀ KIỂM TRA ${cur.periodName.toUpperCase()}`,
        durationMinutes: cur.suggestedDuration || config.durationMinutes,
      });
    } else {
      update({
        level: lvl,
        grade: newGrade,
        subject: newSubject,
        customSubject: '',
      });
    }
  };

  // Handle period selection with auto-filling according to national curriculum GDPT 2018
  const handleSelectPeriod = (periodKey: ExamPeriodKey) => {
    const subjectName = config.customSubject || config.subject;
    const cur = getCurriculumForPeriod(config.grade, subjectName, periodKey);
    update({
      selectedPeriod: periodKey,
      topic: cur.topic,
      chapter: cur.chapter,
      knowledgeScope: cur.knowledgeScope,
      learningOutcome: cur.learningOutcome,
      examType: cur.examType,
      semester: cur.semester,
      examTitle: `ĐỀ KIỂM TRA ${cur.periodName.toUpperCase()}`,
      durationMinutes: cur.suggestedDuration || config.durationMinutes,
    });
  };

  const handleGradeChange = (g: string) => {
    const subjectName = config.customSubject || config.subject;
    if (config.selectedPeriod) {
      const cur = getCurriculumForPeriod(g, subjectName, config.selectedPeriod);
      update({
        grade: g,
        topic: cur.topic,
        chapter: cur.chapter,
        knowledgeScope: cur.knowledgeScope,
        learningOutcome: cur.learningOutcome,
        examType: cur.examType,
        semester: cur.semester,
        examTitle: `ĐỀ KIỂM TRA ${cur.periodName.toUpperCase()}`,
        durationMinutes: cur.suggestedDuration || config.durationMinutes,
      });
    } else {
      update({ grade: g });
    }
  };

  const handleSubjectChange = (sub: string, isCustom = false) => {
    const subjectName = isCustom ? sub : sub;
    if (config.selectedPeriod && subjectName.trim()) {
      const cur = getCurriculumForPeriod(config.grade, subjectName, config.selectedPeriod);
      update({
        subject: isCustom ? config.subject : sub,
        customSubject: isCustom ? sub : '',
        topic: cur.topic,
        chapter: cur.chapter,
        knowledgeScope: cur.knowledgeScope,
        learningOutcome: cur.learningOutcome,
        examType: cur.examType,
        semester: cur.semester,
        examTitle: `ĐỀ KIỂM TRA ${cur.periodName.toUpperCase()}`,
        durationMinutes: cur.suggestedDuration || config.durationMinutes,
      });
    } else {
      update({
        subject: isCustom ? config.subject : sub,
        customSubject: isCustom ? sub : '',
      });
    }
  };

  // Handle real file upload & serverless text extraction
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsExtracting(true);
    setExtractError('');
    setExtractSuccess('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/extract-text', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson?.error || `Lỗi trích xuất (HTTP ${res.status})`);
      }

      const data = await res.json();
      update({
        uploadedFileName: file.name,
        uploadedFilesText: data.text,
      });
      setExtractSuccess(`Đã trích xuất thành công ${data.charCount.toLocaleString()} ký tự từ "${file.name}"`);
    } catch (err: any) {
      console.error('File extraction failed:', err);
      // Client-side fallback for plain text files
      if (file.name.endsWith('.txt') || file.name.endsWith('.md')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const text = event.target?.result as string;
          update({
            uploadedFileName: file.name,
            uploadedFilesText: text,
          });
          setExtractSuccess(`Đã đọc ${text.length.toLocaleString()} ký tự từ "${file.name}"`);
        };
        reader.readAsText(file);
      } else {
        setExtractError(err.message || 'Không thể trích xuất nội dung văn bản từ tệp này.');
      }
    } finally {
      setIsExtracting(false);
    }
  };

  const setQuestionCount = (type: QuestionType, count: number) => {
    const updated = { ...config.questionTypeCounts, [type]: Math.max(0, count) };
    update({ questionTypeCounts: updated });
  };

  return (
    <div className="step-wizard-sidebar" style={{
      backgroundColor: '#ffffff',
      borderRadius: 16,
      border: '1px solid #e2e8f0',
      boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
      overflow: 'hidden',
    }}>
      {/* Title */}
      <div style={{
        padding: '16px 20px',
        backgroundColor: '#1e40af',
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Sliders size={20} />
          <h2 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>
            THIẾT LẬP THÔNG SỐ ĐỀ THI
          </h2>
        </div>
        <span style={{
          fontSize: '0.75rem',
          backgroundColor: 'rgba(255,255,255,0.2)',
          padding: '2px 8px',
          borderRadius: 12,
          fontWeight: 600,
        }}>
          {totalQuestions} Câu hỏi
        </span>
      </div>

      <div style={{ padding: '16px' }}>
        {/* ================= STEP 1 & 2: CẤP HỌC & LỚP ================= */}
        <div style={{ marginBottom: 16, border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden' }}>
          <div
            onClick={() => toggleSection(1)}
            style={{
              padding: '12px 16px',
              backgroundColor: '#f8fafc',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontWeight: 700,
              fontSize: '0.9rem',
              color: '#1e3a8a',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <GraduationCap size={18} color="#2563eb" />
              <span>Bước 1 & 2: Cấp học & Khối lớp</span>
            </div>
            {openSection === 1 ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>

          {openSection === 1 && (
            <div style={{ padding: 14 }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: 6 }}>
                Chọn cấp học:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 14 }}>
                {(['tieuhoc', 'thcs', 'thpt'] as EducationLevel[]).map((lvl) => {
                  const isActive = config.level === lvl;
                  const label = lvl === 'tieuhoc' ? 'TIỂU HỌC' : lvl === 'thcs' ? 'THCS' : 'THPT';
                  const sub = lvl === 'tieuhoc' ? 'Lớp 1 - 5' : lvl === 'thcs' ? 'Lớp 6 - 9' : 'Lớp 10 - 12';
                  return (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => handleLevelChange(lvl)}
                      style={{
                        padding: '10px 6px',
                        borderRadius: 10,
                        border: `2px solid ${isActive ? '#2563eb' : '#e2e8f0'}`,
                        backgroundColor: isActive ? '#eff6ff' : '#ffffff',
                        color: isActive ? '#1e40af' : '#475569',
                        fontWeight: 700,
                        fontSize: '0.82rem',
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div>{label}</div>
                      <div style={{ fontSize: '0.7rem', fontWeight: 500, color: isActive ? '#3b82f6' : '#94a3b8' }}>
                        {sub}
                      </div>
                    </button>
                  );
                })}
              </div>

              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: 6 }}>
                Chọn lớp:
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {GRADES_BY_LEVEL[config.level].map((g) => {
                  const isGradeActive = config.grade === g;
                  return (
                    <button
                      key={g}
                      type="button"
                      onClick={() => handleGradeChange(g)}
                      style={{
                        padding: '6px 14px',
                        borderRadius: 8,
                        border: `1px solid ${isGradeActive ? '#2563eb' : '#cbd5e1'}`,
                        backgroundColor: isGradeActive ? '#2563eb' : '#ffffff',
                        color: isGradeActive ? '#ffffff' : '#334155',
                        fontWeight: 600,
                        fontSize: '0.82rem',
                        cursor: 'pointer',
                      }}
                    >
                      {g}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ================= STEP 3: MÔN HỌC ================= */}
        <div style={{ marginBottom: 16, border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden' }}>
          <div
            onClick={() => toggleSection(2)}
            style={{
              padding: '12px 16px',
              backgroundColor: '#f8fafc',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontWeight: 700,
              fontSize: '0.9rem',
              color: '#1e3a8a',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <BookOpen size={18} color="#2563eb" />
              <span>Bước 3: Môn học ({config.customSubject || config.subject})</span>
            </div>
            {openSection === 2 ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>

          {openSection === 2 && (
            <div style={{ padding: 14 }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: 6 }}>
                Danh sách môn phổ biến:
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                {SUBJECTS_BY_LEVEL[config.level].map((sub) => {
                  const isSubActive = config.subject === sub && !config.customSubject;
                  return (
                    <button
                      key={sub}
                      type="button"
                      onClick={() => handleSubjectChange(sub, false)}
                      style={{
                        padding: '5px 10px',
                        borderRadius: 6,
                        border: `1px solid ${isSubActive ? '#2563eb' : '#cbd5e1'}`,
                        backgroundColor: isSubActive ? '#2563eb' : '#ffffff',
                        color: isSubActive ? '#ffffff' : '#334155',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      {sub}
                    </button>
                  );
                })}
              </div>

              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                Hoặc nhập tên môn học khác:
              </label>
              <input
                type="text"
                value={config.customSubject || ''}
                onChange={(e) => handleSubjectChange(e.target.value, true)}
                placeholder="Nhập tên môn học khác (Ví dụ: Tiếng Hàn, Giáo dục địa phương...)"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 8,
                  border: '1px solid #cbd5e1',
                  fontSize: '0.85rem',
                }}
              />
            </div>
          )}
        </div>

        {/* ================= STEP 4: NỘI DUNG KIẾN THỨC ================= */}
        <div style={{ marginBottom: 16, border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden' }}>
          <div
            onClick={() => toggleSection(3)}
            style={{
              padding: '12px 16px',
              backgroundColor: '#f8fafc',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontWeight: 700,
              fontSize: '0.9rem',
              color: '#1e3a8a',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <FileText size={18} color="#2563eb" />
              <span>Bước 4: Nội dung kiến thức & Yêu cầu</span>
            </div>
            {openSection === 3 ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>

          {openSection === 3 && (
            <div style={{ padding: 14 }}>
              {/* Chọn kỳ kiểm tra trong năm học (Tự động điền theo chuẩn GDPT 2018) */}
              <div style={{
                marginBottom: 14,
                padding: '12px',
                backgroundColor: '#f0f9ff',
                borderRadius: 10,
                border: '1px solid #bae6fd',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, flexWrap: 'wrap', gap: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Sparkles size={16} color="#0284c7" />
                    <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0369a1' }}>
                      Chọn kỳ kiểm tra trong năm học:
                    </span>
                  </div>
                  <span style={{
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    backgroundColor: '#e0f2fe',
                    color: '#0369a1',
                    padding: '2px 8px',
                    borderRadius: 12,
                    border: '1px solid #7dd3fc',
                  }}>
                    Áp dụng toàn quốc • GDPT 2018
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 8 }}>
                  {EXAM_PERIODS.map((period) => {
                    const isSelected = config.selectedPeriod === period.key;
                    return (
                      <button
                        key={period.key}
                        type="button"
                        onClick={() => handleSelectPeriod(period.key)}
                        style={{
                          padding: '8px 4px',
                          borderRadius: 8,
                          border: `2px solid ${isSelected ? '#0284c7' : '#cbd5e1'}`,
                          backgroundColor: isSelected ? '#ffffff' : '#f8fafc',
                          color: isSelected ? '#0369a1' : '#334155',
                          fontWeight: 700,
                          fontSize: '0.82rem',
                          cursor: 'pointer',
                          textAlign: 'center',
                          boxShadow: isSelected ? '0 2px 6px rgba(2, 132, 199, 0.2)' : 'none',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <div style={{ fontSize: '1rem', marginBottom: 2 }}>{period.icon}</div>
                        <div>{period.label}</div>
                        <div style={{ fontSize: '0.65rem', fontWeight: 500, color: isSelected ? '#0284c7' : '#64748b' }}>
                          {period.key.includes('giua') ? 'Giữa kì' : 'Cuối kì'}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {config.selectedPeriod ? (
                  <div style={{
                    fontSize: '0.74rem',
                    color: '#0369a1',
                    backgroundColor: '#ffffff',
                    padding: '6px 10px',
                    borderRadius: 6,
                    border: '1px solid #e0f2fe',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}>
                    <Check size={14} color="#0284c7" />
                    <span>
                      Đã tự động điền Tên bài, Chương, Phạm vi & Yêu cầu cần đạt chuẩn <strong>GDPT 2018</strong> cho môn <strong>{config.customSubject || config.subject} ({config.grade})</strong> - <strong>{EXAM_PERIODS.find(p => p.key === config.selectedPeriod)?.label}</strong>. Thầy/Cô có thể tùy chỉnh các ô bên dưới nếu muốn.
                    </span>
                  </div>
                ) : (
                  <div style={{ fontSize: '0.72rem', color: '#64748b', fontStyle: 'italic', textAlign: 'center' }}>
                    💡 Bấm vào 1 trong 4 kỳ kiểm tra ở trên để hệ thống tự động điền nội dung theo phân phối chương trình toàn quốc
                  </div>
                )}
              </div>

              <div style={{ marginBottom: 10 }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                  Tên bài / Chủ đề chính:
                </label>
                <input
                  type="text"
                  value={config.topic}
                  onChange={(e) => update({ topic: e.target.value })}
                  placeholder="Ví dụ: Số học & Hình học trực quan"
                  style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                    Chương:
                  </label>
                  <input
                    type="text"
                    value={config.chapter}
                    onChange={(e) => update({ chapter: e.target.value })}
                    placeholder="Chương 1 & 2"
                    style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                    Phạm vi kiến thức:
                  </label>
                  <input
                    type="text"
                    value={config.knowledgeScope}
                    onChange={(e) => update({ knowledgeScope: e.target.value })}
                    placeholder="Từ bài 1 đến bài 12"
                    style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: 10 }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                  Yêu cầu cần đạt (Chuẩn GDPT 2018):
                </label>
                <input
                  type="text"
                  value={config.learningOutcome}
                  onChange={(e) => update({ learningOutcome: e.target.value })}
                  placeholder="Nêu khái niệm, tính toán chính xác, vận dụng giải quyết bài toán thực tế"
                  style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ marginBottom: 10 }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                  Ghi chú của giáo viên:
                </label>
                <input
                  type="text"
                  value={config.teacherNotes}
                  onChange={(e) => update({ teacherNotes: e.target.value })}
                  placeholder="Ví dụ: Ưu tiên câu hỏi gắn thực tiễn, phân hóa rõ rệt ở câu cuối"
                  style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                  Dán nội dung bài học hoặc đề cương (Tùy chọn):
                </label>
                <textarea
                  rows={3}
                  value={config.lessonContentText}
                  onChange={(e) => update({ lessonContentText: e.target.value })}
                  placeholder="Dán tóm tắt lý thuyết, nội dung bài học hoặc đoạn văn bản cần tạo câu hỏi đọc hiểu..."
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.82rem', resize: 'vertical' }}
                />
              </div>
            </div>
          )}
        </div>

        {/* ================= STEP 5: TÀI LIỆU THAM CHIẾU ================= */}
        <div style={{ marginBottom: 16, border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden' }}>
          <div
            onClick={() => toggleSection(4)}
            style={{
              padding: '12px 16px',
              backgroundColor: '#f8fafc',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontWeight: 700,
              fontSize: '0.9rem',
              color: '#1e3a8a',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Upload size={18} color="#2563eb" />
              <span>Bước 5: Tài liệu tham chiếu (PDF/Word/Text)</span>
            </div>
            {openSection === 4 ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>

          {openSection === 4 && (
            <div style={{ padding: 14 }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: 8 }}>
                Chế độ nguồn kiến thức:
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
                {[
                  { id: 'uploaded_only', label: 'Chỉ sử dụng tài liệu đã tải lên (Không lấy thêm ngoài)' },
                  { id: 'uploaded_and_curriculum', label: 'Tài liệu tải lên + Kiến thức chương trình phổ thông' },
                  { id: 'teacher_input_only', label: 'Giáo viên tự nhập nội dung / Chương trình chuẩn' },
                ].map((mode) => (
                  <label key={mode.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.82rem', cursor: 'pointer', color: '#334155' }}>
                    <input
                      type="radio"
                      name="refMode"
                      checked={config.referenceSourceMode === mode.id}
                      onChange={() => update({ referenceSourceMode: mode.id as any })}
                    />
                    <span>{mode.label}</span>
                  </label>
                ))}
              </div>

              {/* Upload input */}
              <div style={{
                border: '2px dashed #cbd5e1',
                borderRadius: 10,
                padding: '14px',
                textAlign: 'center',
                backgroundColor: '#f8fafc',
              }}>
                <FileUp size={24} color="#64748b" style={{ margin: '0 auto 6px' }} />
                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: 4 }}>
                  Tải lên tệp tài liệu tham chiếu (PDF, Word, TXT)
                </div>
                <input
                  type="file"
                  accept=".pdf,.docx,.doc,.txt"
                  onChange={handleFileUpload}
                  disabled={isExtracting}
                  style={{ fontSize: '0.78rem' }}
                />

                {isExtracting && (
                  <div style={{ marginTop: 10, fontSize: '0.8rem', color: '#2563eb', fontWeight: 600 }}>
                    ⏳ Đang trích xuất nội dung văn bản từ tài liệu...
                  </div>
                )}

                {extractError && (
                  <div style={{ marginTop: 8, fontSize: '0.78rem', color: '#dc2626', fontWeight: 600 }}>
                    ⚠️ {extractError}
                  </div>
                )}

                {config.uploadedFileName && !isExtracting && (
                  <div style={{ marginTop: 8 }}>
                    <div style={{ fontSize: '0.8rem', color: '#16a34a', fontWeight: 700 }}>
                      ✓ Đã nạp thành công: {config.uploadedFileName} ({config.uploadedFilesText?.length?.toLocaleString() || 0} ký tự)
                    </div>
                    {config.referenceSourceMode === 'uploaded_only' && (
                      <div style={{
                        marginTop: 6,
                        padding: '6px 10px',
                        borderRadius: 6,
                        backgroundColor: '#eff6ff',
                        color: '#1e40af',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        border: '1px solid #bfdbfe',
                        textAlign: 'left',
                      }}>
                        🔒 Chế độ nghiêm ngặt: Đề thi sẽ CHỈ được tạo 100% từ tài liệu "{config.uploadedFileName}". Tuyệt đối không lấy bất kỳ kiến thức ngoài nào.
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ================= STEP 6: LOẠI ĐỀ & THỜI GIAN ================= */}
        <div style={{ marginBottom: 16, border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden' }}>
          <div
            onClick={() => toggleSection(5)}
            style={{
              padding: '12px 16px',
              backgroundColor: '#f8fafc',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontWeight: 700,
              fontSize: '0.9rem',
              color: '#1e3a8a',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Clock size={18} color="#2563eb" />
              <span>Bước 6: Loại đề ({config.durationMinutes} phút)</span>
            </div>
            {openSection === 5 ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>

          {openSection === 5 && (
            <div style={{ padding: 14 }}>
              {/* Tên trường & Đơn vị */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                    Tên trường / Cơ sở giáo dục:
                  </label>
                  <input
                    type="text"
                    value={config.schoolName || ''}
                    onChange={(e) => update({ schoolName: e.target.value })}
                    placeholder="Ví dụ: TRƯỜNG THCS NGUYỄN DU"
                    style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                    Đơn vị chủ quản / Ghi chú đầu đề (Tùy chọn):
                  </label>
                  <input
                    type="text"
                    value={config.subHeader || ''}
                    onChange={(e) => update({ subHeader: e.target.value })}
                    placeholder="Để trống nếu không dùng"
                    style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              {/* Năm học & Học kỳ */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                    Năm học:
                  </label>
                  <input
                    type="text"
                    value={config.academicYear || ''}
                    onChange={(e) => update({ academicYear: e.target.value })}
                    placeholder="Ví dụ: 2026 - 2027"
                    style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                    Học kỳ:
                  </label>
                  <input
                    type="text"
                    value={config.semester || ''}
                    onChange={(e) => update({ semester: e.target.value })}
                    placeholder="Ví dụ: Học kỳ I"
                    style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: 10 }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                  Tên tiêu đề bài kiểm tra:
                </label>
                <input
                  type="text"
                  value={config.examTitle}
                  onChange={(e) => update({ examTitle: e.target.value })}
                  placeholder="Ví dụ: ĐỀ KIỂM TRA GIỮA HỌC KỲ I"
                  style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ marginBottom: 10 }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: 6 }}>
                  Loại đề kiểm tra:
                </label>
                <select
                  value={config.examType}
                  onChange={(e) => update({ examType: e.target.value as ExamType })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                >
                  <option value="giua_ky">Kiểm tra giữa kỳ</option>
                  <option value="cuoi_ky">Kiểm tra cuối kỳ</option>
                  <option value="15_phut">Kiểm tra 15 phút</option>
                  <option value="thuong_xuyen">Kiểm tra thường xuyên</option>
                  <option value="on_tap">Đề ôn tập</option>
                  <option value="luyen_tap">Đề luyện tập</option>
                  <option value="khao_sat">Đề khảo sát chất lượng</option>
                  <option value="tuyen_chon">Đề tuyển chọn học sinh giỏi</option>
                  <option value="tu_tao">Đề tự tạo</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: 6 }}>
                  Thời gian làm bài:
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 6 }}>
                  {[10, 15, 30, 45, 60, 90, 120].map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => update({ durationMinutes: mins })}
                      style={{
                        padding: '5px 10px',
                        borderRadius: 6,
                        border: `1px solid ${config.durationMinutes === mins ? '#2563eb' : '#cbd5e1'}`,
                        backgroundColor: config.durationMinutes === mins ? '#2563eb' : '#ffffff',
                        color: config.durationMinutes === mins ? '#ffffff' : '#334155',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      {mins} phút
                    </button>
                  ))}

                  {/* Ô tự nhập số phút tùy chỉnh */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '3px 8px',
                    borderRadius: 6,
                    backgroundColor: '#f1f5f9',
                    border: '1px solid #cbd5e1',
                    marginLeft: 4,
                  }}>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Tự nhập:</span>
                    <input
                      type="number"
                      min="1"
                      max="300"
                      value={config.durationMinutes || ''}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        update({ durationMinutes: isNaN(val) ? 0 : val });
                      }}
                      placeholder="Số phút"
                      style={{
                        width: 60,
                        padding: '3px 6px',
                        borderRadius: 4,
                        border: '1px solid #94a3b8',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        textAlign: 'center',
                        color: '#1e40af',
                        backgroundColor: '#ffffff',
                        outline: 'none',
                      }}
                    />
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569' }}>phút</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ================= STEP 7: HÌNH THỨC CÂU HỎI ================= */}
        <div style={{ marginBottom: 16, border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden' }}>
          <div
            onClick={() => toggleSection(6)}
            style={{
              padding: '12px 16px',
              backgroundColor: '#f8fafc',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontWeight: 700,
              fontSize: '0.9rem',
              color: '#1e3a8a',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <ListFilter size={18} color="#2563eb" />
              <span>Bước 7: Hình thức câu hỏi (Tổng: {totalQuestions} câu)</span>
            </div>
            {openSection === 6 ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>

          {openSection === 6 && (
            <div style={{ padding: 14 }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#1e40af', marginBottom: 6, textTransform: 'uppercase' }}>
                Trắc nghiệm:
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
                {[
                  { key: 'trac_nghiem_4', label: '4 lựa chọn (A/B/C/D)' },
                  { key: 'dung_sai', label: 'Đúng / Sai' },
                  { key: 'tra_loi_ngan', label: 'Trả lời ngắn' },
                  { key: 'trac_nghiem_nhieu_dung', label: 'Nhiều đáp án đúng' },
                  { key: 'dien_khuyet', label: 'Điền khuyết' },
                  { key: 'ghep_noi', label: 'Ghép nối cột' },
                ].map((item) => (
                  <div key={item.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 6px', backgroundColor: '#f8fafc', borderRadius: 6 }}>
                    <span style={{ fontSize: '0.78rem', color: '#334155' }}>{item.label}:</span>
                    <input
                      type="number"
                      min={0}
                      max={50}
                      value={config.questionTypeCounts[item.key as QuestionType] || 0}
                      onChange={(e) => setQuestionCount(item.key as QuestionType, parseInt(e.target.value) || 0)}
                      style={{ width: 48, padding: '3px 6px', textAlign: 'center', borderRadius: 4, border: '1px solid #cbd5e1', fontSize: '0.8rem', fontWeight: 600 }}
                    />
                  </div>
                ))}
              </div>

              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0d9488', marginBottom: 6, textTransform: 'uppercase' }}>
                Tự luận:
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {[
                  { key: 'tu_luan_ngan', label: 'Câu hỏi ngắn' },
                  { key: 'giai_bai_tap', label: 'Giải bài tập' },
                  { key: 'van_dung_thuc_te', label: 'Vận dụng thực tế' },
                  { key: 'doc_hieu', label: 'Đọc hiểu' },
                  { key: 'viet_doan_bai', label: 'Viết đoạn / bài' },
                  { key: 'phan_tich', label: 'Phân tích / So sánh' },
                ].map((item) => (
                  <div key={item.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 6px', backgroundColor: '#f8fafc', borderRadius: 6 }}>
                    <span style={{ fontSize: '0.78rem', color: '#334155' }}>{item.label}:</span>
                    <input
                      type="number"
                      min={0}
                      max={20}
                      value={config.questionTypeCounts[item.key as QuestionType] || 0}
                      onChange={(e) => setQuestionCount(item.key as QuestionType, parseInt(e.target.value) || 0)}
                      style={{ width: 48, padding: '3px 6px', textAlign: 'center', borderRadius: 4, border: '1px solid #cbd5e1', fontSize: '0.8rem', fontWeight: 600 }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ================= STEP 8: MỨC ĐỘ CÂU HỎI (GDPT 2018) ================= */}
        <div style={{ marginBottom: 16, border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden' }}>
          <div
            onClick={() => toggleSection(7)}
            style={{
              padding: '12px 16px',
              backgroundColor: '#f8fafc',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontWeight: 700,
              fontSize: '0.9rem',
              color: '#1e3a8a',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Layers size={18} color="#2563eb" />
              <span>Bước 8: 4 Mức độ nhận thức (GDPT 2018)</span>
            </div>
            {openSection === 7 ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>

          {openSection === 7 && (
            <div style={{ padding: 14 }}>
              {/* Mode switch */}
              <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
                <button
                  type="button"
                  onClick={() => update({ levelDistributionMode: 'percentage' })}
                  style={{
                    flex: 1,
                    padding: '6px',
                    borderRadius: 6,
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: `1px solid ${config.levelDistributionMode === 'percentage' ? '#2563eb' : '#cbd5e1'}`,
                    backgroundColor: config.levelDistributionMode === 'percentage' ? '#eff6ff' : '#ffffff',
                    color: config.levelDistributionMode === 'percentage' ? '#1e40af' : '#475569',
                  }}
                >
                  Phân bổ theo Tỷ lệ %
                </button>
                <button
                  type="button"
                  onClick={() => update({ levelDistributionMode: 'count' })}
                  style={{
                    flex: 1,
                    padding: '6px',
                    borderRadius: 6,
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: `1px solid ${config.levelDistributionMode === 'count' ? '#2563eb' : '#cbd5e1'}`,
                    backgroundColor: config.levelDistributionMode === 'count' ? '#eff6ff' : '#ffffff',
                    color: config.levelDistributionMode === 'count' ? '#1e40af' : '#475569',
                  }}
                >
                  Phân bổ theo Số câu
                </button>
              </div>

              {/* Percentages mode */}
              {config.levelDistributionMode === 'percentage' ? (
                <>
                  {/* Visual distribution bar */}
                  <div style={{
                    height: 8,
                    display: 'flex',
                    borderRadius: 4,
                    overflow: 'hidden',
                    marginBottom: 10,
                    backgroundColor: '#e2e8f0',
                  }}>
                    <div style={{ width: `${config.levelPercentages.nhan_biet || 0}%`, backgroundColor: '#2563eb' }} title={`Nhận biết: ${config.levelPercentages.nhan_biet}%`} />
                    <div style={{ width: `${config.levelPercentages.thong_hieu || 0}%`, backgroundColor: '#059669' }} title={`Thông hiểu: ${config.levelPercentages.thong_hieu}%`} />
                    <div style={{ width: `${config.levelPercentages.van_dung || 0}%`, backgroundColor: '#d97706' }} title={`Vận dụng: ${config.levelPercentages.van_dung}%`} />
                    <div style={{ width: `${config.levelPercentages.van_dung_cao || 0}%`, backgroundColor: '#dc2626' }} title={`Vận dụng cao: ${config.levelPercentages.van_dung_cao}%`} />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 8 }}>
                    {[
                      { key: 'nhan_biet', label: 'Nhận biết', color: '#2563eb' },
                      { key: 'thong_hieu', label: 'Thông hiểu', color: '#059669' },
                      { key: 'van_dung', label: 'Vận dụng', color: '#d97706' },
                      { key: 'van_dung_cao', label: 'V.Dụng cao', color: '#dc2626' },
                    ].map((lvl) => (
                      <div key={lvl.key} style={{ textAlign: 'center', backgroundColor: '#f8fafc', padding: '6px 4px', borderRadius: 8 }}>
                        <div style={{ fontSize: '0.72rem', fontWeight: 600, color: lvl.color, marginBottom: 4 }}>
                          {lvl.label}
                        </div>
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={config.levelPercentages[lvl.key as CognitiveLevel] || 0}
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || 0;
                            update({
                              levelPercentages: { ...config.levelPercentages, [lvl.key]: val },
                            });
                          }}
                          style={{ width: '100%', textAlign: 'center', padding: '4px', borderRadius: 4, border: '1px solid #cbd5e1', fontSize: '0.82rem', fontWeight: 700 }}
                        />
                        <span style={{ fontSize: '0.7rem', color: '#64748b' }}>%</span>
                      </div>
                    ))}
                  </div>

                  {totalPercentage !== 100 ? (
                    <div style={{
                      padding: '6px 10px',
                      backgroundColor: '#fff7ed',
                      border: '1px solid #fed7aa',
                      borderRadius: 6,
                      color: '#c2410c',
                      fontSize: '0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                    }}>
                      <AlertTriangle size={14} />
                      <span>Tổng tỷ lệ hiện là <strong>{totalPercentage}%</strong> (bắt buộc phải bằng 100%).</span>
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Check size={14} /> Chuẩn 100% tỷ lệ ma trận
                    </div>
                  )}
                </>
              ) : (
                /* Count mode */
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                  {[
                    { key: 'nhan_biet', label: 'Nhận biết' },
                    { key: 'thong_hieu', label: 'Thông hiểu' },
                    { key: 'van_dung', label: 'Vận dụng' },
                    { key: 'van_dung_cao', label: 'V.Dụng cao' },
                  ].map((lvl) => (
                    <div key={lvl.key} style={{ textAlign: 'center', backgroundColor: '#f8fafc', padding: '6px 4px', borderRadius: 8 }}>
                      <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#334155', marginBottom: 4 }}>
                        {lvl.label}
                      </div>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={config.levelCounts[lvl.key as CognitiveLevel] || 0}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 0;
                          update({
                            levelCounts: { ...config.levelCounts, [lvl.key]: val },
                          });
                        }}
                        style={{ width: '100%', textAlign: 'center', padding: '4px', borderRadius: 4, border: '1px solid #cbd5e1', fontSize: '0.82rem', fontWeight: 700 }}
                      />
                      <span style={{ fontSize: '0.7rem', color: '#64748b' }}>câu</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ================= STEP 9: THANG ĐIỂM ================= */}
        <div style={{ marginBottom: 16, border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden' }}>
          <div
            onClick={() => toggleSection(8)}
            style={{
              padding: '12px 16px',
              backgroundColor: '#f8fafc',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontWeight: 700,
              fontSize: '0.9rem',
              color: '#1e3a8a',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Award size={18} color="#2563eb" />
              <span>Bước 9: Thang điểm ({config.maxScore} điểm)</span>
            </div>
            {openSection === 8 ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>

          {openSection === 8 && (
            <div style={{ padding: 14 }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {[10, 20, 100].map((sc) => (
                  <button
                    key={sc}
                    type="button"
                    onClick={() => update({ maxScore: sc })}
                    style={{
                      padding: '6px 14px',
                      borderRadius: 6,
                      border: `1px solid ${config.maxScore === sc ? '#2563eb' : '#cbd5e1'}`,
                      backgroundColor: config.maxScore === sc ? '#2563eb' : '#ffffff',
                      color: config.maxScore === sc ? '#ffffff' : '#334155',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    {sc} điểm
                  </button>
                ))}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 'auto' }}>
                  <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Tự nhập:</span>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={config.maxScore}
                    onChange={(e) => update({ maxScore: parseInt(e.target.value) || 10 })}
                    style={{ width: 55, padding: '4px', textAlign: 'center', borderRadius: 4, border: '1px solid #cbd5e1', fontSize: '0.82rem', fontWeight: 700 }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ================= STEP 10: TÙY CHỌN NÂNG CAO & MÃ ĐỀ ================= */}
        <div style={{ marginBottom: 18, border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden' }}>
          <div
            onClick={() => toggleSection(9)}
            style={{
              padding: '12px 16px',
              backgroundColor: '#f8fafc',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontWeight: 700,
              fontSize: '0.9rem',
              color: '#1e3a8a',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Sparkles size={18} color="#2563eb" />
              <span>Bước 10: Số mã đề & Nhập ma trận có sẵn</span>
            </div>
            {openSection === 9 ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>

          {openSection === 9 && (
            <div style={{ padding: 14 }}>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: 6 }}>
                  Số mã đề cần sinh (Đảo câu & đảo đáp án tự động):
                </label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {([1, 2, 3, 4] as (1 | 2 | 3 | 4)[]).map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => update({ numberOfCodes: num })}
                      style={{
                        flex: 1,
                        padding: '6px',
                        borderRadius: 6,
                        border: `1px solid ${config.numberOfCodes === num ? '#2563eb' : '#cbd5e1'}`,
                        backgroundColor: config.numberOfCodes === num ? '#eff6ff' : '#ffffff',
                        color: config.numberOfCodes === num ? '#1e40af' : '#475569',
                        fontWeight: 700,
                        fontSize: '0.82rem',
                        cursor: 'pointer',
                      }}
                    >
                      {num} Mã đề {num > 1 ? `(101-${100 + num})` : ''}
                    </button>
                  ))}
                </div>
              </div>

              {/* Import matrix button */}
              <button
                type="button"
                onClick={onOpenImportMatrix}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 8,
                  border: '1px dashed #2563eb',
                  backgroundColor: '#eff6ff',
                  color: '#1d4ed8',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                }}
              >
                <FileUp size={16} />
                <span>Tải / Dán Ma trận hoặc Bản đặc tả có sẵn</span>
              </button>
            </div>
          )}
        </div>

        {/* ================= BIG ACTION BUTTONS ================= */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {isGenerating && (
            <div style={{
              padding: '12px 14px',
              backgroundColor: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: 10,
              fontSize: '0.85rem',
              color: '#1e40af',
              fontWeight: 600,
              textAlign: 'center',
              boxShadow: '0 0 15px rgba(37,99,235,0.2)',
            }}>
              <div style={{ marginBottom: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <Sparkles size={18} className="animate-spin" />
                <span>{generationProgress || 'Đang xử lý đề kiểm tra...'}</span>
              </div>
              <div style={{
                height: 5,
                backgroundColor: '#dbeafe',
                borderRadius: 4,
                overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%',
                  backgroundColor: '#2563eb',
                  width: '75%',
                  animation: 'pulse 1.5s infinite',
                }} />
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={onGenerateExam}
            disabled={isGenerating}
            style={{
              padding: '12px 18px',
              borderRadius: 8,
              border: 'none',
              backgroundColor: '#1e3a8a',
              color: '#ffffff',
              fontSize: '0.95rem',
              fontWeight: 700,
              cursor: isGenerating ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              boxShadow: '0 1px 2px rgba(15, 23, 42, 0.08)',
              transition: 'background-color 0.15s ease',
              width: '100%',
            }}
          >
            <BookOpen size={18} />
            <span>Tạo bộ đề kiểm tra</span>
          </button>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <button
              type="button"
              onClick={onGenerateMatrixOnly}
              disabled={isGenerating}
              style={{
                padding: '9px 10px',
                borderRadius: 6,
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                color: '#1e3a8a',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: isGenerating ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                transition: 'background 0.15s ease',
              }}
            >
              <Layers size={15} color="#1e3a8a" />
              <span>Cập nhật ma trận</span>
            </button>

            <button
              type="button"
              onClick={onGenerateEquivalent}
              disabled={isGenerating}
              style={{
                padding: '9px 10px',
                borderRadius: 6,
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                color: '#047857',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: isGenerating ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                transition: 'background 0.15s ease',
              }}
            >
              <FileUp size={15} color="#047857" />
              <span>Đề tương đương</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
