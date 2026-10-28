export type EducationLevel = 'tieuhoc' | 'thcs' | 'thpt';

export type ExamType = 
  | 'thuong_xuyen'
  | '15_phut'
  | 'giua_ky'
  | 'cuoi_ky'
  | 'on_tap'
  | 'luyen_tap'
  | 'khao_sat'
  | 'tuyen_chon'
  | 'tu_tao';

export type CognitiveLevel = 'nhan_biet' | 'thong_hieu' | 'van_dung' | 'van_dung_cao';

export type QuestionType =
  | 'trac_nghiem_4'
  | 'trac_nghiem_nhieu_dung'
  | 'dung_sai'
  | 'ghep_noi'
  | 'dien_khuyet'
  | 'tra_loi_ngan'
  | 'tu_luan_ngan'
  | 'giai_thich'
  | 'trinh_bay'
  | 'giai_bai_tap'
  | 'phan_tich'
  | 'so_sanh'
  | 'chung_minh'
  | 'van_dung_thuc_te'
  | 'doc_hieu'
  | 'viet_doan_bai';

export interface MatchingPair {
  left: string;
  right: string;
}

export interface Question {
  id: string;
  subject?: string;
  grade?: string;
  topic?: string;
  subtopic?: string;
  questionType: QuestionType;
  level: CognitiveLevel;
  question: string;
  options?: string[]; // for trac_nghiem_4, etc.
  correctAnswer: string | string[]; // 'A', ['A', 'C'], 'Đúng', or text
  matchingPairs?: MatchingPair[]; // for ghep_noi
  explanation?: string;
  score: number;
  learningOutcome?: string; // Yêu cầu cần đạt
  isTeacherProvided?: boolean; // If true, preserved untouched
  needsTeacherReview?: boolean; // ⚠️ Cần giáo viên kiểm tra
  rubricBreakdown?: { criteria: string; score: number }[]; // For essay rubric
}

export interface MatrixCell {
  level: CognitiveLevel;
  questionCount: number;
  score: number;
  percentage: number;
  questionTypes: string[];
}

export interface MatrixRow {
  topic: string;
  subtopic?: string;
  cells: Record<CognitiveLevel, MatrixCell>;
  totalQuestions: number;
  totalScore: number;
  percentage: number;
}

export interface ExamMatrix {
  rows: MatrixRow[];
  totalByLevel: Record<CognitiveLevel, { count: number; score: number; percentage: number }>;
  grandTotalQuestions: number;
  grandTotalScore: number;
}

export interface SpecificationItem {
  id: string;
  topic: string;
  knowledgeUnit: string; // Đơn vị kiến thức
  learningOutcome: string; // Yêu cầu cần đạt
  level: CognitiveLevel;
  questionType: QuestionType;
  questionCount: number;
  scorePerQuestion: number;
  totalScore: number;
}

export interface ExamConfig {
  level: EducationLevel;
  grade: string; // e.g. "Lớp 6"
  subject: string;
  customSubject?: string;
  selectedPeriod?: 'giua_hk1' | 'cuoi_hk1' | 'giua_hk2' | 'cuoi_hk2';
  topic: string; // Tên bài/chủ đề
  chapter: string; // Chương
  knowledgeScope: string; // Phạm vi kiến thức
  testContent: string; // Nội dung cần kiểm tra
  learningOutcome: string; // Yêu cầu cần đạt
  teacherNotes: string; // Ghi chú của giáo viên
  lessonContentText: string; // Vùng văn bản dán nội dung bài học
  
  // Tài liệu tham chiếu
  referenceSourceMode: 'uploaded_only' | 'uploaded_and_curriculum' | 'teacher_input_only';
  uploadedFilesText: string;
  uploadedFileName?: string;

  // Loại đề & thời gian
  examType: ExamType;
  examTitle: string;
  durationMinutes: number;
  customDuration?: number;

  // Cấu hình hình thức câu hỏi
  questionTypeCounts: Record<QuestionType, number>;

  // Cấu hình phân bổ mức độ
  levelDistributionMode: 'count' | 'percentage';
  levelCounts: Record<CognitiveLevel, number>;
  levelPercentages: Record<CognitiveLevel, number>;

  // Thang điểm
  maxScore: number;

  // Số mã đề
  numberOfCodes: 1 | 2 | 3 | 4;

  // Chế độ nhập câu hỏi có sẵn
  preserveTeacherQuestions: boolean;
  teacherInputQuestions: Question[];

  // Header đề
  schoolName: string;
  subHeader?: string;
  academicYear: string;
  semester: string;
}

export interface GeneratedExamPackage {
  id: string;
  createdAt: string;
  config: ExamConfig;
  matrix: ExamMatrix;
  specification: SpecificationItem[];
  questions: Question[]; // Base question list (Mã đề 101)
  variantCodes: Record<string, { code: string; questions: Question[] }>; // 101, 102, 103, 104
  gradingGuide: {
    generalNotes: string[];
    rubrics: {
      questionId: string;
      questionTitle: string;
      learningOutcome: string;
      breakdown: { criteria: string; score: number }[];
      totalScore: number;
    }[];
  };
  qualityAudit: {
    passed: boolean;
    items: {
      id: string;
      name: string;
      status: 'pass' | 'warning' | 'error';
      message: string;
    }[];
  };
}

export interface ApiSettings {
  provider: 'gemini' | 'openai' | 'custom' | 'demo';
  apiKey: string;
  customBaseUrl?: string;
  model: string;
}

export interface QuestionBankItem extends Question {
  bankId: string;
  savedAt: string;
  tags?: string[];
}
