import { Question } from '@/types/exam';

/**
 * Shuffles an array deterministically or pseudo-randomly
 */
function shuffleArray<T>(array: T[], seed?: number): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Generates variant exam packages for multiple codes (e.g. 101, 102, 103, 104)
 * Ensures:
 * - Same questions
 * - Safe shuffling of MCQ options without altering true correctness
 * - Maintains teacher preserved questions if needed
 */
export function generateVariantCodes(
  baseQuestions: Question[],
  numberOfCodes: 1 | 2 | 3 | 4
): Record<string, { code: string; questions: Question[] }> {
  const codes = ['101', '102', '103', '104'].slice(0, numberOfCodes);
  const result: Record<string, { code: string; questions: Question[] }> = {};

  codes.forEach((code, codeIdx) => {
    if (codeIdx === 0) {
      // 101 is the original base list
      result[code] = {
        code,
        questions: baseQuestions.map((q, idx) => ({ ...q, id: `Q${idx + 1}` })),
      };
      return;
    }

    // Separate MCQs and Essays to maintain logical grouping in Vietnamese exam formats:
    // Phần 1: Trắc nghiệm, Phần 2: Tự luận
    const mcqs = baseQuestions.filter(q => 
      q.questionType.startsWith('trac_nghiem') || 
      q.questionType === 'dung_sai' || 
      q.questionType === 'dien_khuyet' || 
      q.questionType === 'ghep_noi' ||
      q.questionType === 'tra_loi_ngan'
    );
    const essays = baseQuestions.filter(q => !mcqs.includes(q));

    // Shuffle MCQs order
    const shuffledMcqs = shuffleArray(mcqs).map(q => {
      // If it has multiple choice options (A, B, C, D)
      if (q.options && q.options.length >= 2 && typeof q.correctAnswer === 'string') {
        // Find which option content was correct
        const originalLetters = ['A', 'B', 'C', 'D', 'E', 'F'];
        const correctIndex = originalLetters.indexOf(q.correctAnswer.trim().toUpperCase());
        
        let correctContent = '';
        if (correctIndex >= 0 && correctIndex < q.options.length) {
          correctContent = q.options[correctIndex];
        } else {
          // If correctAnswer is direct text match
          correctContent = q.correctAnswer;
        }

        // Shuffle options
        const shuffledOptions = shuffleArray(q.options);
        const newCorrectIndex = shuffledOptions.findIndex(opt => opt === correctContent);
        const newCorrectLetter = newCorrectIndex >= 0 ? originalLetters[newCorrectIndex] : q.correctAnswer;

        return {
          ...q,
          options: shuffledOptions,
          correctAnswer: newCorrectLetter,
        };
      }
      return { ...q };
    });

    // Essays: usually keep order or minor variation
    const combined = [...shuffledMcqs, ...essays].map((q, idx) => ({
      ...q,
      id: `Q${idx + 1}`,
    }));

    result[code] = {
      code,
      questions: combined,
    };
  });

  return result;
}
