import { CognitiveLevel, ExamConfig, ExamMatrix, MatrixRow, Question, SpecificationItem } from '@/types/exam';

export const LEVEL_NAMES: Record<CognitiveLevel, string> = {
  nhan_biet: 'Nhận biết',
  thong_hieu: 'Thông hiểu',
  van_dung: 'Vận dụng',
  van_dung_cao: 'Vận dụng cao',
};

export const DEFAULT_LEVEL_RATIOS: Record<CognitiveLevel, number> = {
  nhan_biet: 40,
  thong_hieu: 30,
  van_dung: 20,
  van_dung_cao: 10,
};

/**
 * Chuẩn hóa tiêu đề đề thi: Loại bỏ phần "- MÔN ... (LỚP ...)" bị trùng lặp vì môn học đã có ở dòng dưới
 */
export function formatExamTitle(title?: string): string {
  if (!title) return 'ĐỀ KIỂM TRA ĐỊNH KỲ';
  return title
    .replace(/\s*[-–—:]\s*MÔN\s+.*$/i, '')
    .replace(/\s*\([^)]*\)\s*$/i, '')
    .trim();
}

/**
 * Calculates question counts per level based on total questions and config mode
 */
export function calculateLevelCounts(
  totalQuestions: number,
  config: Pick<ExamConfig, 'levelDistributionMode' | 'levelCounts' | 'levelPercentages'>
): Record<CognitiveLevel, number> {
  if (config.levelDistributionMode === 'count') {
    return { ...config.levelCounts };
  }

  // Calculate based on percentage
  const percentages = config.levelPercentages;
  const levels: CognitiveLevel[] = ['nhan_biet', 'thong_hieu', 'van_dung', 'van_dung_cao'];
  
  const counts: Record<CognitiveLevel, number> = {
    nhan_biet: 0,
    thong_hieu: 0,
    van_dung: 0,
    van_dung_cao: 0,
  };

  let allocated = 0;
  levels.forEach((lvl, idx) => {
    if (idx === levels.length - 1) {
      // Last one takes remainder to guarantee exact sum
      counts[lvl] = Math.max(0, totalQuestions - allocated);
    } else {
      const c = Math.round((totalQuestions * (percentages[lvl] || 0)) / 100);
      counts[lvl] = c;
      allocated += c;
    }
  });

  return counts;
}

/**
 * Build ExamMatrix from questions list and total maxScore
 */
export function buildMatrixFromQuestions(questions: Question[], maxScore: number): ExamMatrix {
  const levels: CognitiveLevel[] = ['nhan_biet', 'thong_hieu', 'van_dung', 'van_dung_cao'];
  
  // Group by topic/content unit
  const topicGroups: Record<string, Question[]> = {};
  questions.forEach(q => {
    const topic = q.topic?.trim() || 'Chủ đề chính';
    if (!topicGroups[topic]) {
      topicGroups[topic] = [];
    }
    topicGroups[topic].push(q);
  });

  const grandTotalQuestions = questions.length;
  const grandTotalScore = questions.reduce((sum, q) => sum + (q.score || 0), 0);

  const rows: MatrixRow[] = Object.entries(topicGroups).map(([topic, qList]) => {
    const rowQuestions = qList.length;
    const rowScore = qList.reduce((sum, q) => sum + (q.score || 0), 0);

    const cells: Record<CognitiveLevel, any> = {
      nhan_biet: { level: 'nhan_biet', questionCount: 0, score: 0, percentage: 0, questionTypes: [] },
      thong_hieu: { level: 'thong_hieu', questionCount: 0, score: 0, percentage: 0, questionTypes: [] },
      van_dung: { level: 'van_dung', questionCount: 0, score: 0, percentage: 0, questionTypes: [] },
      van_dung_cao: { level: 'van_dung_cao', questionCount: 0, score: 0, percentage: 0, questionTypes: [] },
    };

    levels.forEach(lvl => {
      const matching = qList.filter(q => q.level === lvl);
      const score = matching.reduce((sum, q) => sum + (q.score || 0), 0);
      const types = Array.from(new Set(matching.map(q => q.questionType)));
      cells[lvl] = {
        level: lvl,
        questionCount: matching.length,
        score: Number(score.toFixed(2)),
        percentage: grandTotalScore > 0 ? Number(((score / grandTotalScore) * 100).toFixed(1)) : 0,
        questionTypes: types,
      };
    });

    return {
      topic,
      cells,
      totalQuestions: rowQuestions,
      totalScore: Number(rowScore.toFixed(2)),
      percentage: grandTotalScore > 0 ? Number(((rowScore / grandTotalScore) * 100).toFixed(1)) : 0,
    };
  });

  const totalByLevel: Record<CognitiveLevel, { count: number; score: number; percentage: number }> = {
    nhan_biet: { count: 0, score: 0, percentage: 0 },
    thong_hieu: { count: 0, score: 0, percentage: 0 },
    van_dung: { count: 0, score: 0, percentage: 0 },
    van_dung_cao: { count: 0, score: 0, percentage: 0 },
  };

  levels.forEach(lvl => {
    const matching = questions.filter(q => q.level === lvl);
    const score = matching.reduce((sum, q) => sum + (q.score || 0), 0);
    totalByLevel[lvl] = {
      count: matching.length,
      score: Number(score.toFixed(2)),
      percentage: grandTotalScore > 0 ? Number(((score / grandTotalScore) * 100).toFixed(1)) : 0,
    };
  });

  return {
    rows,
    totalByLevel,
    grandTotalQuestions,
    grandTotalScore: Number(grandTotalScore.toFixed(2)),
  };
}

/**
 * Generate Specification Items from Question List
 */
export function buildSpecificationFromQuestions(questions: Question[]): SpecificationItem[] {
  // Group by topic + level + questionType
  const map: Record<string, SpecificationItem> = {};

  questions.forEach(q => {
    const topic = q.topic?.trim() || 'Chủ đề trọng tâm';
    const unit = q.subtopic?.trim() || topic;
    const outcome = q.learningOutcome?.trim() || 'Nắm vững kiến thức và vận dụng giải quyết vấn đề';
    const key = `${topic}__${unit}__${q.level}__${q.questionType}`;

    if (!map[key]) {
      map[key] = {
        id: `spec-${Object.keys(map).length + 1}`,
        topic,
        knowledgeUnit: unit,
        learningOutcome: outcome,
        level: q.level,
        questionType: q.questionType,
        questionCount: 0,
        scorePerQuestion: q.score,
        totalScore: 0,
      };
    }

    map[key].questionCount += 1;
    map[key].totalScore = Number((map[key].totalScore + q.score).toFixed(2));
    map[key].scorePerQuestion = Number((map[key].totalScore / map[key].questionCount).toFixed(2));
  });

  return Object.values(map);
}

/**
 * Allocate scores cleanly across questions to match maxScore exactly
 */
export function distributeScores(questions: Question[], maxScore: number): Question[] {
  if (questions.length === 0) return [];
  const targetMax = maxScore && maxScore > 0 ? maxScore : 10;

  const currentTotal = Number(questions.reduce((sum, q) => sum + (q.score || 0), 0).toFixed(2));

  // If questions already sum exactly to targetMax, keep existing scores
  if (Math.abs(currentTotal - targetMax) < 0.005 && questions.every(q => (q.score || 0) > 0)) {
    return questions.map(q => ({ ...q }));
  }

  // If questions already have valid positive scores, scale them proportionally
  if (currentTotal > 0 && questions.every(q => (q.score || 0) > 0)) {
    const scaleRatio = targetMax / currentTotal;
    let accumulated = 0;
    return questions.map((q, idx) => {
      if (idx === questions.length - 1) {
        return { ...q, score: Number((targetMax - accumulated).toFixed(2)) };
      }
      // Calculate scaled score rounded to 2 decimals
      const scaled = Number(((q.score || 0) * scaleRatio).toFixed(2));
      accumulated += scaled;
      return { ...q, score: scaled };
    });
  }

  // Otherwise, distribute based on Vietnamese GDPT 2018 question types
  const isObjective = (t: string) =>
    t.startsWith('trac_nghiem') ||
    t === 'dung_sai' ||
    t === 'ghep_noi' ||
    t === 'dien_khuyet' ||
    t === 'tra_loi_ngan';

  const essayQuestions = questions.filter(q => !isObjective(q.questionType));
  const objQuestions = questions.filter(q => isObjective(q.questionType));

  if (essayQuestions.length === 0) {
    // Pure objective
    const unitScore = Number((targetMax / questions.length).toFixed(2));
    let currentSum = 0;
    return questions.map((q, idx) => {
      let sc = unitScore;
      if (idx === questions.length - 1) {
        sc = Number((targetMax - currentSum).toFixed(2));
      } else {
        currentSum += sc;
      }
      return { ...q, score: sc };
    });
  }

  if (objQuestions.length === 0) {
    // Pure essay
    const unitScore = Number((targetMax / questions.length).toFixed(2));
    let currentSum = 0;
    return questions.map((q, idx) => {
      let sc = unitScore;
      if (idx === questions.length - 1) {
        sc = Number((targetMax - currentSum).toFixed(2));
      } else {
        currentSum += sc;
      }
      return { ...q, score: sc };
    });
  }

  // Mixed: calculate standard scores for objective questions
  // For standard 10 pt scale:
  // - trac_nghiem_4: 0.25 (or 0.5 if <= 8 questions)
  // - dung_sai: 0.5
  // - tra_loi_ngan: 0.5
  // For 20 or 100 pt scale, scale accordingly
  const baseScale = targetMax / 10;

  let totalObjScore = 0;
  const objScores = objQuestions.map(q => {
    let base = 0.25;
    if (q.questionType === 'dung_sai' || q.questionType === 'tra_loi_ngan') {
      base = 0.5;
    } else if (q.questionType === 'ghep_noi' || q.questionType === 'dien_khuyet') {
      base = 0.5;
    } else {
      // trac_nghiem_4, etc.
      base = objQuestions.length <= 8 ? 0.5 : 0.25;
    }
    const sc = Number((base * baseScale).toFixed(2));
    totalObjScore += sc;
    return sc;
  });

  // Ensure objective part doesn't exceed 75% of total score if essay exists
  if (totalObjScore >= targetMax * 0.75) {
    const targetObjTotal = targetMax * 0.5;
    const factor = targetObjTotal / totalObjScore;
    totalObjScore = 0;
    for (let i = 0; i < objScores.length; i++) {
      objScores[i] = Number((objScores[i] * factor).toFixed(2));
      totalObjScore += objScores[i];
    }
  }

  const remainingEssayScore = Number((targetMax - totalObjScore).toFixed(2));
  const essayUnit = Number((remainingEssayScore / essayQuestions.length).toFixed(2));

  let objIdx = 0;
  let essayAllocated = 0;
  return questions.map(q => {
    if (isObjective(q.questionType)) {
      const sc = objScores[objIdx++];
      return { ...q, score: sc };
    } else {
      const idx = essayQuestions.indexOf(q);
      let sc = essayUnit;
      if (idx === essayQuestions.length - 1) {
        sc = Number((remainingEssayScore - essayAllocated).toFixed(2));
      } else {
        essayAllocated += sc;
      }
      return { ...q, score: sc };
    }
  });
}
