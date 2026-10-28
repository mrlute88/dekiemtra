'use client';

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Header } from '@/components/Header';
import { StepWizard } from '@/components/StepWizard';
import { PreviewTabs } from '@/components/PreviewTabs';
import { ApiKeyModal } from '@/components/ApiKeyModal';
import { QualityAuditModal } from '@/components/QualityAuditModal';
import { QuestionBankModal } from '@/components/QuestionBankModal';
import { EditQuestionModal } from '@/components/EditQuestionModal';
import { ImportMatrixModal } from '@/components/ImportMatrixModal';
import { SavedExamsModal } from '@/components/SavedExamsModal';
import { ChatbotAssistant } from '@/components/ChatbotAssistant';

import { ApiSettings, ExamConfig, GeneratedExamPackage, Question, QuestionBankItem } from '@/types/exam';
import { 
  DEFAULT_CONFIG_THCS_TOAN, 
  getSamplePackage, 
  GRADES_BY_LEVEL, 
  SUBJECTS_BY_LEVEL 
} from '@/lib/sampleData';
import { 
  clearLastConfig, 
  getApiSettings, 
  getLastConfig, 
  getQuestionBank, 
  getSavedExams, 
  removeExamFromLibrary,
  removeQuestionFromBank, 
  saveApiSettings, 
  saveExamToLibrary, 
  saveLastConfig, 
  saveQuestionToBank 
} from '@/lib/storage';
import { generateExamWithAI, runQualityAudit } from '@/lib/aiService';
import { buildMatrixFromQuestions, buildSpecificationFromQuestions, distributeScores } from '@/lib/matrixCalculator';
import { generateVariantCodes } from '@/lib/examShuffler';

export default function Home() {
  // State
  const [apiSettings, setApiSettings] = useState<ApiSettings>({
    provider: 'gemini',
    apiKey: '',
    model: 'gemini-3.8-flash',
  });
  const [config, setConfig] = useState<ExamConfig>(DEFAULT_CONFIG_THCS_TOAN);
  const [examPackage, setExamPackage] = useState<GeneratedExamPackage | null>(null);

  // Loading & Progress
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState('');

  // Modals
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [isQualityAuditOpen, setIsQualityAuditOpen] = useState(false);
  const [isQuestionBankOpen, setIsQuestionBankOpen] = useState(false);
  const [isSavedExamsOpen, setIsSavedExamsOpen] = useState(false);
  const [isImportMatrixOpen, setIsImportMatrixOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  // Bank items & Saved exams
  const [bankItems, setBankItems] = useState<QuestionBankItem[]>([]);
  const [savedExamsList, setSavedExamsList] = useState<GeneratedExamPackage[]>([]);

  // Load initial settings & sample package on mount
  useEffect(() => {
    const savedSettings = getApiSettings();
    setApiSettings(savedSettings);

    const lastCfg = getLastConfig();
    if (lastCfg) {
      setConfig(lastCfg);
      setExamPackage(getSamplePackage(lastCfg));
    } else {
      setExamPackage(getSamplePackage(DEFAULT_CONFIG_THCS_TOAN));
    }

    setBankItems(getQuestionBank());
    setSavedExamsList(getSavedExams());
  }, []);

  // Save config changes to localStorage
  const handleConfigChange = (newConfig: ExamConfig) => {
    const maxScoreChanged = newConfig.maxScore !== config.maxScore;
    setConfig(newConfig);
    saveLastConfig(newConfig);

    if (examPackage) {
      if (maxScoreChanged && examPackage.questions.length > 0) {
        const distributed = distributeScores(examPackage.questions, newConfig.maxScore);
        const matrix = buildMatrixFromQuestions(distributed, newConfig.maxScore);
        const specification = buildSpecificationFromQuestions(distributed);
        setExamPackage({
          ...examPackage,
          config: newConfig,
          questions: distributed,
          matrix,
          specification,
        });
      } else {
        setExamPackage({
          ...examPackage,
          config: newConfig,
        });
      }
    }
  };

  const handleUpdateExamConfig = (updatedFields: Partial<ExamConfig>) => {
    const newConfig = { ...config, ...updatedFields };
    setConfig(newConfig);
    saveLastConfig(newConfig);
    if (examPackage) {
      if (updatedFields.maxScore && updatedFields.maxScore !== examPackage.config.maxScore && examPackage.questions.length > 0) {
        const distributed = distributeScores(examPackage.questions, newConfig.maxScore);
        const matrix = buildMatrixFromQuestions(distributed, newConfig.maxScore);
        const specification = buildSpecificationFromQuestions(distributed);
        setExamPackage({
          ...examPackage,
          config: newConfig,
          questions: distributed,
          matrix,
          specification,
        });
      } else {
        setExamPackage({
          ...examPackage,
          config: { ...examPackage.config, ...updatedFields },
        });
      }
    }
  };

  // Generate full exam
  const handleGenerateExam = async () => {
    setIsGenerating(true);
    setGenerationProgress('Đang bắt đầu khởi tạo...');

    try {
      const pkg = await generateExamWithAI(config, apiSettings, (prog) => {
        setGenerationProgress(prog);
      });

      setExamPackage(pkg);
      saveExamToLibrary(pkg);

      // Trigger celebratory confetti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (err: any) {
      alert(`Lỗi tạo đề: ${err.message || 'Không thể tạo đề.'}`);
    } finally {
      setIsGenerating(false);
      setGenerationProgress('');
    }
  };

  // Matrix generation only
  const handleGenerateMatrixOnly = () => {
    if (!examPackage) return;
    const questions = distributeScores(examPackage.questions, config.maxScore);
    const matrix = buildMatrixFromQuestions(questions, config.maxScore);
    const specification = buildSpecificationFromQuestions(questions);
    setExamPackage({
      ...examPackage,
      questions,
      matrix,
      specification,
    });
  };

  // Generate equivalent exam
  const handleGenerateEquivalent = async () => {
    setIsGenerating(true);
    setGenerationProgress('Đang sinh đề tương đương (giữ nguyên ma trận & tỷ lệ mức độ)...');
    try {
      const pkg = await generateExamWithAI(config, apiSettings, (prog) => {
        setGenerationProgress(prog);
      });
      pkg.config.examTitle = `${config.examTitle} (ĐỀ TƯƠNG ĐƯƠNG)`;
      setExamPackage(pkg);
      saveExamToLibrary(pkg);
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    } catch (err: any) {
      alert(`Lỗi tạo đề tương đương: ${err.message}`);
    } finally {
      setIsGenerating(false);
      setGenerationProgress('');
    }
  };

  // Preset loaders
  const handleLoadPreset = (presetKey: string) => {
    if (presetKey === 'toan6') {
      const cfg = { ...DEFAULT_CONFIG_THCS_TOAN };
      setConfig(cfg);
      setExamPackage(getSamplePackage(cfg));
      saveLastConfig(cfg);
    } else if (presetKey === 'van9') {
      const cfg: ExamConfig = {
        ...DEFAULT_CONFIG_THCS_TOAN,
        level: 'thcs',
        grade: 'Lớp 9',
        subject: 'Ngữ văn',
        topic: 'Thơ hiện đại Việt Nam & Nghị luận xã hội',
        chapter: 'Văn học hiện đại lớp 9',
        knowledgeScope: 'Các tác phẩm: Đồng chí, Bài thơ về tiểu đội xe không kính, Ánh trăng, Mùa xuân nho nhỏ',
        testContent: 'Đọc hiểu văn bản thơ, viết đoạn văn nghị luận xã hội về tinh thần đoàn kết, viết bài nghị luận văn học',
        learningOutcome: 'Nhận biết thể thơ, biện pháp tu từ, thông hiểu nội dung cảm xúc, viết đoạn văn nghị luận chặt chẽ',
        examTitle: 'ĐỀ KIỂM TRA HỌC KỲ I',
        durationMinutes: 90,
        questionTypeCounts: {
          ...DEFAULT_CONFIG_THCS_TOAN.questionTypeCounts,
          trac_nghiem_4: 4,
          dung_sai: 0,
          tra_loi_ngan: 2,
          doc_hieu: 2,
          viet_doan_bai: 2,
          tu_luan_ngan: 0,
          giai_bai_tap: 0,
          van_dung_thuc_te: 0,
        },
      };
      setConfig(cfg);
      const pkg = getSamplePackage(cfg);
      setExamPackage(pkg);
      saveLastConfig(cfg);
    } else if (presetKey === 'anh10') {
      const cfg: ExamConfig = {
        ...DEFAULT_CONFIG_THCS_TOAN,
        level: 'thpt',
        grade: 'Lớp 10',
        subject: 'Tiếng Anh',
        topic: 'Unit 1-3: Family Life, Humans and the Environment, Music',
        chapter: 'English 10 Global Success',
        knowledgeScope: 'Present simple vs Present continuous, Future with will/be going to, Compound sentences',
        testContent: 'Phonetics, Vocabulary & Grammar, Reading comprehension, Sentence transformation',
        learningOutcome: 'Identify correct pronunciation, apply grammar structures, comprehend reading passages',
        examTitle: 'MID-TERM ENGLISH TEST',
        durationMinutes: 60,
        questionTypeCounts: {
          ...DEFAULT_CONFIG_THCS_TOAN.questionTypeCounts,
          trac_nghiem_4: 20,
          dung_sai: 0,
          tra_loi_ngan: 4,
          tu_luan_ngan: 0,
          giai_bai_tap: 0,
          van_dung_thuc_te: 0,
        },
      };
      setConfig(cfg);
      const pkg = getSamplePackage(cfg);
      setExamPackage(pkg);
      saveLastConfig(cfg);
    }
  };

  // Question editing & actions
  const handleDeleteQuestion = (qId: string) => {
    if (!examPackage) return;
    const updated = examPackage.questions.filter((q) => q.id !== qId);
    const distributed = distributeScores(updated, config.maxScore);
    const matrix = buildMatrixFromQuestions(distributed, config.maxScore);
    const specification = buildSpecificationFromQuestions(distributed);
    const variantCodes = generateVariantCodes(distributed, config.numberOfCodes);
    const qualityAudit = runQualityAudit(distributed, matrix, config);

    setExamPackage({
      ...examPackage,
      questions: distributed,
      matrix,
      specification,
      variantCodes,
      qualityAudit,
    });
  };

  const handleSaveEditedQuestion = (updatedQ: Question) => {
    if (!examPackage) return;
    const exists = examPackage.questions.some((q) => q.id === updatedQ.id);
    const updatedList = exists
      ? examPackage.questions.map((q) => (q.id === updatedQ.id ? updatedQ : q))
      : [...examPackage.questions, updatedQ];
    const distributed = exists ? updatedList : distributeScores(updatedList, config.maxScore);
    const matrix = buildMatrixFromQuestions(distributed, config.maxScore);
    const specification = buildSpecificationFromQuestions(distributed);
    const variantCodes = generateVariantCodes(distributed, config.numberOfCodes);
    const qualityAudit = runQualityAudit(distributed, matrix, config);

    setExamPackage({
      ...examPackage,
      questions: distributed,
      matrix,
      specification,
      variantCodes,
      qualityAudit,
    });
  };

  const handleAddQuestion = () => {
    if (!examPackage) return;
    const newQ: Question = {
      id: `Q${examPackage.questions.length + 1}`,
      subject: config.subject,
      grade: config.grade,
      topic: config.topic || 'Chủ đề mới',
      questionType: 'trac_nghiem_4',
      level: 'nhan_biet',
      question: 'Nhập nội dung câu hỏi mới tại đây...',
      options: ['A. Phương án A', 'B. Phương án B', 'C. Phương án C', 'D. Phương án D'],
      correctAnswer: 'A',
      explanation: 'Giải thích chi tiết phương án A đúng...',
      score: 0.25,
      learningOutcome: 'Nắm vững kiến thức cơ bản.',
    };
    setEditingQuestion(newQ);
  };

  const handleRegenerateQuestion = async (q: Question) => {
    if (!examPackage) return;
    setIsGenerating(true);
    setGenerationProgress(`Đang tạo lại câu hỏi ${q.id}...`);

    try {
      await new Promise((r) => setTimeout(r, 600));
      const randomizedOptions = [
        `A. Phương án mới thay thế 1 (${config.subject})`,
        `B. Phương án mới thay thế 2`,
        `C. Phương án mới thay thế 3`,
        `D. Phương án mới thay thế 4`,
      ];
      const updatedQ: Question = {
        ...q,
        question: `[Tạo lại] ${q.question.replace(/^\[Tạo lại\]\s*/, '')} (Biến thể câu hỏi mới)`,
        options: q.options ? randomizedOptions : undefined,
        explanation: `Hướng dẫn giải chi tiết cho câu hỏi tạo lại mới của chủ đề ${q.topic}.`,
      };
      handleSaveEditedQuestion(updatedQ);
    } finally {
      setIsGenerating(false);
      setGenerationProgress('');
    }
  };

  // Question bank handlers
  const handleSaveToQuestionBank = (item: QuestionBankItem) => {
    saveQuestionToBank(item);
    setBankItems(getQuestionBank());
    alert('Đã lưu câu hỏi vào Ngân hàng câu hỏi của Thầy/Cô thành công!');
  };

  const handleRemoveFromBank = (bankId: string) => {
    removeQuestionFromBank(bankId);
    setBankItems(getQuestionBank());
  };

  const handleInsertFromBank = (q: Question) => {
    if (!examPackage) {
      alert('Vui lòng tạo hoặc mở một đề kiểm tra trước khi chèn câu hỏi từ ngân hàng!');
      return;
    };
    const inserted: Question = {
      ...q,
      id: `Q${examPackage.questions.length + 1}`,
      isTeacherProvided: true,
    };
    const updatedList = [...examPackage.questions, inserted];
    const distributed = distributeScores(updatedList, config.maxScore);
    const matrix = buildMatrixFromQuestions(distributed, config.maxScore);
    const specification = buildSpecificationFromQuestions(distributed);
    const variantCodes = generateVariantCodes(distributed, config.numberOfCodes);
    const qualityAudit = runQualityAudit(distributed, matrix, config);

    setExamPackage({
      ...examPackage,
      questions: distributed,
      matrix,
      specification,
      variantCodes,
      qualityAudit,
    });
    setIsQuestionBankOpen(false);
    alert('Đã chèn câu hỏi vào đề kiểm tra hiện tại!');
  };

  const handleDuplicateBankItem = (item: QuestionBankItem) => {
    const clone: QuestionBankItem = {
      ...item,
      bankId: `bank-clone-${Date.now()}`,
      question: `${item.question} (Bản sao)`,
      savedAt: new Date().toISOString(),
    };
    saveQuestionToBank(clone);
    setBankItems(getQuestionBank());
  };

  const handleImportMatrixContent = (content: string) => {
    updateConfigNotes(content);
    alert('Đã nạp ma trận vào cấu hình! AI sẽ tuân thủ nghiêm ngặt ma trận này.');
  };

  const updateConfigNotes = (matrixContent: string) => {
    setConfig({
      ...config,
      teacherNotes: `${config.teacherNotes ? config.teacherNotes + '\n' : ''}[MA TRẬN CÓ SẴN]:\n${matrixContent}`,
    });
  };

  const handleRestoreLastConfig = () => {
    const last = getLastConfig();
    if (last) {
      setConfig(last);
      setExamPackage(getSamplePackage(last));
      alert('Đã khôi phục cấu hình đề gần nhất!');
    } else {
      alert('Chưa có cấu hình nào được lưu trước đó.');
    }
  };

  const handleClearConfig = () => {
    if (confirm('Thầy/Cô có chắc chắn muốn xóa toàn bộ cấu hình về mặc định?')) {
      clearLastConfig();
      setConfig(DEFAULT_CONFIG_THCS_TOAN);
      setExamPackage(getSamplePackage(DEFAULT_CONFIG_THCS_TOAN));
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f8fafc' }}>
      {/* Top Header */}
      <Header
        apiSettings={apiSettings}
        onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
        onOpenQuestionBank={() => setIsQuestionBankOpen(true)}
        onOpenSavedExams={() => {
          setSavedExamsList(getSavedExams());
          setIsSavedExamsOpen(true);
        }}
        onRestoreLastConfig={handleRestoreLastConfig}
        onClearConfig={handleClearConfig}
        onLoadPreset={handleLoadPreset}
      />

      {/* Main App Layout */}
      <main className="main-layout" style={{
        maxWidth: 1600,
        margin: '0 auto',
        padding: '20px',
        width: '100%',
        flex: 1,
      }}>
        <div className="app-grid-layout">
          {/* Left Column: Step-by-step Setup Wizard */}
          <div>
            <StepWizard
              config={config}
              onChangeConfig={handleConfigChange}
              onGenerateExam={handleGenerateExam}
              onGenerateMatrixOnly={handleGenerateMatrixOnly}
              onGenerateEquivalent={handleGenerateEquivalent}
              onOpenImportMatrix={() => setIsImportMatrixOpen(true)}
              isGenerating={isGenerating}
              generationProgress={generationProgress}
            />
          </div>

          {/* Right Column: Preview & Output Tabs */}
          <div style={{ minWidth: 0 }}>
            <PreviewTabs
              examPackage={examPackage}
              onOpenAuditModal={() => setIsQualityAuditOpen(true)}
              onOpenEditQuestion={(q) => setEditingQuestion(q)}
              onDeleteQuestion={handleDeleteQuestion}
              onRegenerateQuestion={handleRegenerateQuestion}
              onAddQuestion={handleAddQuestion}
              onSaveToQuestionBank={handleSaveToQuestionBank}
              onSaveExamPackage={(pkg) => {
                saveExamToLibrary(pkg);
                setSavedExamsList(getSavedExams());
              }}
              onUpdateExamConfig={handleUpdateExamConfig}
            />
          </div>
        </div>
      </main>

      {/* Chatbot Assistant (Dialogflow mascot widget) */}
      <ChatbotAssistant
        apiSettings={apiSettings}
        onApplyPreset={handleLoadPreset}
        onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
      />

      {/* Modals */}
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        currentSettings={apiSettings}
        onSave={(newSettings) => {
          setApiSettings(newSettings);
          saveApiSettings(newSettings);
        }}
      />

      {examPackage && (
        <QualityAuditModal
          isOpen={isQualityAuditOpen}
          onClose={() => setIsQualityAuditOpen(false)}
          audit={examPackage.qualityAudit}
        />
      )}

      <QuestionBankModal
        isOpen={isQuestionBankOpen}
        onClose={() => setIsQuestionBankOpen(false)}
        bankItems={bankItems}
        onRemoveItem={handleRemoveFromBank}
        onInsertIntoExam={handleInsertFromBank}
        onDuplicateItem={handleDuplicateBankItem}
        onSaveNewItem={(item) => {
          saveQuestionToBank(item);
          setBankItems(getQuestionBank());
        }}
        onReloadBank={() => setBankItems(getQuestionBank())}
      />

      <SavedExamsModal
        isOpen={isSavedExamsOpen}
        onClose={() => setIsSavedExamsOpen(false)}
        savedExams={savedExamsList}
        onLoadExam={(pkg) => {
          setConfig(pkg.config);
          setExamPackage(pkg);
          saveLastConfig(pkg.config);
        }}
        onDeleteExam={(id) => {
          removeExamFromLibrary(id);
          setSavedExamsList(getSavedExams());
        }}
      />

      <EditQuestionModal
        isOpen={Boolean(editingQuestion)}
        onClose={() => setEditingQuestion(null)}
        question={editingQuestion}
        onSaveQuestion={handleSaveEditedQuestion}
      />

      <ImportMatrixModal
        isOpen={isImportMatrixOpen}
        onClose={() => setIsImportMatrixOpen(false)}
        onImportMatrix={handleImportMatrixContent}
      />
    </div>
  );
}
