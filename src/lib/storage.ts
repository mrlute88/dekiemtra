import { ApiSettings, ExamConfig, GeneratedExamPackage, QuestionBankItem } from '@/types/exam';
import { INITIAL_SEED_QUESTIONS } from './seedQuestionBank';

const STORAGE_KEYS = {
  API_SETTINGS: 'ra_de_ai_api_settings',
  LAST_CONFIG: 'ra_de_ai_last_config',
  SAVED_EXAMS: 'ra_de_ai_saved_exams',
  QUESTION_BANK: 'ra_de_ai_question_bank',
};

export const VALID_GEMINI_MODELS = [
  'gemini-flash-lite-latest',
  'gemini-3.5-flash-lite',
  'gemini-3.5-flash',
  'gemini-3.6-flash',
  'gemini-3-flash-preview',
] as const;

export const DEFAULT_API_SETTINGS: ApiSettings = {
  provider: 'gemini',
  apiKey: '',
  model: 'gemini-flash-lite-latest',
};

export function getApiSettings(): ApiSettings {
  if (typeof window === 'undefined') return DEFAULT_API_SETTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.API_SETTINGS);
    if (!raw) return DEFAULT_API_SETTINGS;
    const parsed = { ...DEFAULT_API_SETTINGS, ...JSON.parse(raw) };
    const discontinued = [
      'gemini-2.0-flash',
      'gemini-2.5-flash',
      'gemini-2.5-pro',
      'gemini-1.5-flash',
      'gemini-1.5-pro',
      'gemini-flash-latest',
      'gemini-pro-latest',
      'gemini-3.8-pro',
      'gemini-3.1-pro',
    ];
    if (!parsed.model || discontinued.includes(parsed.model)) {
      parsed.model = 'gemini-flash-lite-latest';
    }
    return parsed;
  } catch {
    return DEFAULT_API_SETTINGS;
  }
}

export function saveApiSettings(settings: ApiSettings): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.API_SETTINGS, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save API settings', err);
  }
}

export function getLastConfig(): ExamConfig | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LAST_CONFIG);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveLastConfig(config: ExamConfig): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.LAST_CONFIG, JSON.stringify(config));
  } catch (err) {
    console.error('Failed to save last config', err);
  }
}

export function clearLastConfig(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEYS.LAST_CONFIG);
  } catch (err) {
    console.error('Failed to clear last config', err);
  }
}

export function getSavedExams(): GeneratedExamPackage[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SAVED_EXAMS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveExamToLibrary(pkg: GeneratedExamPackage): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = getSavedExams();
    const updated = [pkg, ...existing.filter(e => e.id !== pkg.id)].slice(0, 50); // keep up to 50
    localStorage.setItem(STORAGE_KEYS.SAVED_EXAMS, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save exam to library', err);
  }
}

export function removeExamFromLibrary(id: string): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = getSavedExams();
    const updated = existing.filter(e => e.id !== id);
    localStorage.setItem(STORAGE_KEYS.SAVED_EXAMS, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to remove exam from library', err);
  }
}

export function getQuestionBank(): QuestionBankItem[] {
  if (typeof window === 'undefined') return INITIAL_SEED_QUESTIONS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.QUESTION_BANK);
    if (!raw) {
      // First-time load: populate with seed bank
      localStorage.setItem(STORAGE_KEYS.QUESTION_BANK, JSON.stringify(INITIAL_SEED_QUESTIONS));
      return INITIAL_SEED_QUESTIONS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(STORAGE_KEYS.QUESTION_BANK, JSON.stringify(INITIAL_SEED_QUESTIONS));
      return INITIAL_SEED_QUESTIONS;
    }
    return parsed;
  } catch {
    return INITIAL_SEED_QUESTIONS;
  }
}

export function saveQuestionToBank(item: QuestionBankItem): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = getQuestionBank();
    const updated = [item, ...existing.filter(q => q.bankId !== item.bankId)];
    localStorage.setItem(STORAGE_KEYS.QUESTION_BANK, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save question to bank', err);
  }
}

export function saveAllQuestionsToBank(items: QuestionBankItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.QUESTION_BANK, JSON.stringify(items));
  } catch (err) {
    console.error('Failed to save all questions to bank', err);
  }
}

export function removeQuestionFromBank(bankId: string): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = getQuestionBank();
    const updated = existing.filter(q => q.bankId !== bankId);
    localStorage.setItem(STORAGE_KEYS.QUESTION_BANK, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to remove question from bank', err);
  }
}

export function resetQuestionBankToSeed(): QuestionBankItem[] {
  if (typeof window === 'undefined') return INITIAL_SEED_QUESTIONS;
  try {
    localStorage.setItem(STORAGE_KEYS.QUESTION_BANK, JSON.stringify(INITIAL_SEED_QUESTIONS));
    return INITIAL_SEED_QUESTIONS;
  } catch {
    return INITIAL_SEED_QUESTIONS;
  }
}

export function exportQuestionBankJSON(): string {
  const items = getQuestionBank();
  return JSON.stringify(items, null, 2);
}

export function importQuestionBankJSON(jsonStr: string): { success: boolean; count: number; error?: string } {
  try {
    const parsed = JSON.parse(jsonStr);
    if (!Array.isArray(parsed)) {
      return { success: false, count: 0, error: 'Dữ liệu không phải là danh sách câu hỏi hợp lệ.' };
    }
    const validItems: QuestionBankItem[] = parsed.map((item, idx) => ({
      bankId: item.bankId || `import-${Date.now()}-${idx}`,
      id: item.id || `Q-${idx + 1}`,
      subject: item.subject || 'Tổng hợp',
      grade: item.grade || 'Lớp 6',
      topic: item.topic || 'Chủ đề',
      subtopic: item.subtopic || '',
      questionType: item.questionType || 'trac_nghiem_4',
      level: item.level || 'nhan_biet',
      question: item.question || 'Câu hỏi',
      options: item.options || [],
      correctAnswer: item.correctAnswer || 'A',
      explanation: item.explanation || '',
      score: item.score || 0.25,
      learningOutcome: item.learningOutcome || '',
      savedAt: item.savedAt || new Date().toISOString(),
      tags: item.tags || [],
    }));

    const existing = getQuestionBank();
    // Merge without duplicates by question text
    const existingQuestions = new Set(existing.map(q => q.question.trim().toLowerCase()));
    const newItems = validItems.filter(q => !existingQuestions.has(q.question.trim().toLowerCase()));
    const merged = [...existing, ...newItems];

    saveAllQuestionsToBank(merged);
    return { success: true, count: newItems.length };
  } catch (err: any) {
    return { success: false, count: 0, error: err.message || 'Lỗi phân tích cú pháp JSON' };
  }
}
