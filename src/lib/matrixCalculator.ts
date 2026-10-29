import { CognitiveLevel, ExamConfig, ExamMatrix, MatrixCell, MatrixRow, Question, SpecificationItem, SpecificationRow } from '@/types/exam';

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
 * Kiểm tra xem hình thức câu hỏi là Trắc nghiệm khách quan (TNKQ) hay Tự luận (TL)
 * Chuẩn Chương trình GDPT 2018 Bộ GD&ĐT
 */
export function isObjectiveQuestion(type: string): boolean {
  if (!type) return true;
  return (
    type === 'trac_nghiem_4' ||
    type === 'trac_nghiem_nhieu_dung' ||
    type === 'dung_sai' ||
    type === 'ghep_noi' ||
    type === 'dien_khuyet' ||
    type === 'tra_loi_ngan' ||
    type.startsWith('trac_nghiem')
  );
}

/**
 * Phân tích và tách biệt Chương/Chủ đề và Đơn vị kiến thức cụ thể
 */
export function getChapterAndUnit(q: Question, fallbackChapter?: string): { chapter: string; unit: string } {
  const rawChapter = (q as any).chapter?.trim() || '';
  const rawSubtopic = q.subtopic?.trim() || '';
  const rawTopic = q.topic?.trim() || '';

  let chapter = rawChapter;
  let unit = rawSubtopic;

  if (chapter && unit) {
    return { chapter, unit };
  }

  if (!chapter && rawTopic) {
    if (unit && unit !== rawTopic) {
      chapter = rawTopic;
    } else if (rawTopic.includes(':') || rawTopic.includes(' - ')) {
      const parts = rawTopic.split(/[:–-]/);
      chapter = parts[0].trim();
      unit = parts.slice(1).join(':').trim();
    } else {
      chapter = fallbackChapter || rawTopic;
      unit = rawTopic;
    }
  }

  if (!chapter) chapter = fallbackChapter || 'Chương trình định kỳ';
  if (!unit) unit = rawTopic || 'Nội dung kiến thức';

  return { chapter, unit };
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
 * Thống nhất theo mẫu chuẩn của Bộ GD&ĐT (Tin học 3, 4 & toàn bộ các môn)
 */
export function buildMatrixFromQuestions(
  questions: Question[], 
  maxScore: number = 10,
  fallbackChapter?: string
): ExamMatrix {
  const levels: CognitiveLevel[] = ['nhan_biet', 'thong_hieu', 'van_dung', 'van_dung_cao'];
  const grandTotalQuestions = questions.length;
  const targetMax = maxScore && maxScore > 0 ? maxScore : 10;
  
  let grandTotalScore = Number(questions.reduce((sum, q) => sum + (q.score || 0), 0).toFixed(2));
  if (grandTotalScore === 0 && grandTotalQuestions > 0) {
    grandTotalScore = targetMax;
  }

  // Group by chapter -> unit
  interface UnitGroup {
    chapter: string;
    unit: string;
    questions: Question[];
  }
  const unitMap: Record<string, UnitGroup> = {};

  questions.forEach(q => {
    const { chapter, unit } = getChapterAndUnit(q, fallbackChapter);
    const key = `${chapter}___${unit}`;
    if (!unitMap[key]) {
      unitMap[key] = { chapter, unit, questions: [] };
    }
    unitMap[key].questions.push(q);
  });

  const rows: MatrixRow[] = Object.values(unitMap).map(grp => {
    const rowQuestions = grp.questions.length;
    const rowScore = Number(grp.questions.reduce((sum, q) => sum + (q.score || 0), 0).toFixed(2));

    let rowTnkqCount = 0;
    let rowTnkqScore = 0;
    let rowTlCount = 0;
    let rowTlScore = 0;

    const cells: Record<CognitiveLevel, MatrixCell> = {
      nhan_biet: { level: 'nhan_biet', questionCount: 0, score: 0, percentage: 0, questionTypes: [], tnkqCount: 0, tnkqScore: 0, tlCount: 0, tlScore: 0 },
      thong_hieu: { level: 'thong_hieu', questionCount: 0, score: 0, percentage: 0, questionTypes: [], tnkqCount: 0, tnkqScore: 0, tlCount: 0, tlScore: 0 },
      van_dung: { level: 'van_dung', questionCount: 0, score: 0, percentage: 0, questionTypes: [], tnkqCount: 0, tnkqScore: 0, tlCount: 0, tlScore: 0 },
      van_dung_cao: { level: 'van_dung_cao', questionCount: 0, score: 0, percentage: 0, questionTypes: [], tnkqCount: 0, tnkqScore: 0, tlCount: 0, tlScore: 0 },
    };

    levels.forEach(lvl => {
      const matching = grp.questions.filter(q => q.level === lvl);
      const score = Number(matching.reduce((sum, q) => sum + (q.score || 0), 0).toFixed(2));
      const types = Array.from(new Set(matching.map(q => q.questionType)));

      const tnkqMatching = matching.filter(q => isObjectiveQuestion(q.questionType));
      const tlMatching = matching.filter(q => !isObjectiveQuestion(q.questionType));

      const tnkqCount = tnkqMatching.length;
      const tnkqScore = Number(tnkqMatching.reduce((sum, q) => sum + (q.score || 0), 0).toFixed(2));
      const tlCount = tlMatching.length;
      const tlScore = Number(tlMatching.reduce((sum, q) => sum + (q.score || 0), 0).toFixed(2));

      rowTnkqCount += tnkqCount;
      rowTnkqScore += tnkqScore;
      rowTlCount += tlCount;
      rowTlScore += tlScore;

      cells[lvl] = {
        level: lvl,
        questionCount: matching.length,
        score,
        percentage: grandTotalScore > 0 ? Number(((score / grandTotalScore) * 100).toFixed(1)) : 0,
        questionTypes: types,
        tnkqCount,
        tnkqScore,
        tlCount,
        tlScore,
      };
    });

    return {
      chapter: grp.chapter,
      topic: grp.unit,
      subtopic: grp.unit,
      cells,
      totalQuestions: rowQuestions,
      totalScore: rowScore,
      percentage: grandTotalScore > 0 ? Number(((rowScore / grandTotalScore) * 100).toFixed(1)) : 0,
      tnkqCount: rowTnkqCount,
      tnkqScore: Number(rowTnkqScore.toFixed(2)),
      tlCount: rowTlCount,
      tlScore: Number(rowTlScore.toFixed(2)),
    };
  });

  // Calculate totals by level
  const totalByLevel: Record<CognitiveLevel, any> = {
    nhan_biet: { count: 0, score: 0, percentage: 0, tnkqCount: 0, tnkqScore: 0, tlCount: 0, tlScore: 0 },
    thong_hieu: { count: 0, score: 0, percentage: 0, tnkqCount: 0, tnkqScore: 0, tlCount: 0, tlScore: 0 },
    van_dung: { count: 0, score: 0, percentage: 0, tnkqCount: 0, tnkqScore: 0, tlCount: 0, tlScore: 0 },
    van_dung_cao: { count: 0, score: 0, percentage: 0, tnkqCount: 0, tnkqScore: 0, tlCount: 0, tlScore: 0 },
  };

  let totalTnkqCount = 0;
  let totalTnkqScore = 0;
  let totalTlCount = 0;
  let totalTlScore = 0;

  levels.forEach(lvl => {
    const matching = questions.filter(q => q.level === lvl);
    const score = Number(matching.reduce((sum, q) => sum + (q.score || 0), 0).toFixed(2));
    const tnkqMatching = matching.filter(q => isObjectiveQuestion(q.questionType));
    const tlMatching = matching.filter(q => !isObjectiveQuestion(q.questionType));

    const tnkqCount = tnkqMatching.length;
    const tnkqScore = Number(tnkqMatching.reduce((sum, q) => sum + (q.score || 0), 0).toFixed(2));
    const tlCount = tlMatching.length;
    const tlScore = Number(tlMatching.reduce((sum, q) => sum + (q.score || 0), 0).toFixed(2));

    totalTnkqCount += tnkqCount;
    totalTnkqScore += tnkqScore;
    totalTlCount += tlCount;
    totalTlScore += tlScore;

    totalByLevel[lvl] = {
      count: matching.length,
      score,
      percentage: grandTotalScore > 0 ? Number(((score / grandTotalScore) * 100).toFixed(1)) : 0,
      tnkqCount,
      tnkqScore,
      tlCount,
      tlScore,
    };
  });

  const knowUnderstandScore = Number((totalByLevel.nhan_biet.score + totalByLevel.thong_hieu.score).toFixed(2));
  const applyScore = Number((totalByLevel.van_dung.score + totalByLevel.van_dung_cao.score).toFixed(2));

  return {
    rows,
    totalByLevel,
    summary: {
      totalTnkqCount,
      totalTnkqScore: Number(totalTnkqScore.toFixed(2)),
      totalTnkqPercentage: grandTotalScore > 0 ? Number(((totalTnkqScore / grandTotalScore) * 100).toFixed(1)) : 0,
      totalTlCount,
      totalTlScore: Number(totalTlScore.toFixed(2)),
      totalTlPercentage: grandTotalScore > 0 ? Number(((totalTlScore / grandTotalScore) * 100).toFixed(1)) : 0,
      knowUnderstandCount: totalByLevel.nhan_biet.count + totalByLevel.thong_hieu.count,
      knowUnderstandScore,
      knowUnderstandPercentage: grandTotalScore > 0 ? Number(((knowUnderstandScore / grandTotalScore) * 100).toFixed(1)) : 0,
      applyCount: totalByLevel.van_dung.count + totalByLevel.van_dung_cao.count,
      applyScore,
      applyPercentage: grandTotalScore > 0 ? Number(((applyScore / grandTotalScore) * 100).toFixed(1)) : 0,
    },
    grandTotalQuestions,
    grandTotalScore,
  };
}

/**
 * Xây dựng danh sách SpecificationRow theo mẫu chuẩn của Bộ GD&ĐT
 * Gom Yêu cầu cần đạt theo từng mức độ trong từng Đơn vị kiến thức
 */
export function buildSpecificationRowsFromQuestions(
  questions: Question[], 
  fallbackChapter?: string
): SpecificationRow[] {
  const levels: CognitiveLevel[] = ['nhan_biet', 'thong_hieu', 'van_dung', 'van_dung_cao'];

  interface SpecUnitGroup {
    chapter: string;
    unit: string;
    questionsWithIndex: { q: Question; index: number }[];
  }
  const unitMap: Record<string, SpecUnitGroup> = {};

  questions.forEach((q, idx) => {
    const { chapter, unit } = getChapterAndUnit(q, fallbackChapter);
    const key = `${chapter}___${unit}`;
    if (!unitMap[key]) {
      unitMap[key] = { chapter, unit, questionsWithIndex: [] };
    }
    unitMap[key].questionsWithIndex.push({ q, index: idx + 1 });
  });

  return Object.values(unitMap).map((grp, rIdx) => {
    const outcomesByLevel: Record<CognitiveLevel, string[]> = {
      nhan_biet: [],
      thong_hieu: [],
      van_dung: [],
      van_dung_cao: [],
    };

    const questionsByLevel: Record<CognitiveLevel, any> = {
      nhan_biet: { count: 0, tnkqCount: 0, tnkqScore: 0, tlCount: 0, tlScore: 0, score: 0, questionIndices: [], summaryText: '-' },
      thong_hieu: { count: 0, tnkqCount: 0, tnkqScore: 0, tlCount: 0, tlScore: 0, score: 0, questionIndices: [], summaryText: '-' },
      van_dung: { count: 0, tnkqCount: 0, tnkqScore: 0, tlCount: 0, tlScore: 0, score: 0, questionIndices: [], summaryText: '-' },
      van_dung_cao: { count: 0, tnkqCount: 0, tnkqScore: 0, tlCount: 0, tlScore: 0, score: 0, questionIndices: [], summaryText: '-' },
    };

    let unitTotalScore = 0;
    let unitTotalQuestions = 0;

    levels.forEach(lvl => {
      const matchingItems = grp.questionsWithIndex.filter(item => item.q.level === lvl);
      const uniqueOutcomes: string[] = [];
      matchingItems.forEach(item => {
        const out = item.q.learningOutcome?.trim();
        if (out && !uniqueOutcomes.includes(out)) {
          uniqueOutcomes.push(out);
        }
      });
      outcomesByLevel[lvl] = uniqueOutcomes;

      if (matchingItems.length > 0) {
        const tnkqItems = matchingItems.filter(item => isObjectiveQuestion(item.q.questionType));
        const tlItems = matchingItems.filter(item => !isObjectiveQuestion(item.q.questionType));

        const tnkqCount = tnkqItems.length;
        const tnkqScore = Number(tnkqItems.reduce((sum, it) => sum + (it.q.score || 0), 0).toFixed(2));
        const tlCount = tlItems.length;
        const tlScore = Number(tlItems.reduce((sum, it) => sum + (it.q.score || 0), 0).toFixed(2));
        const count = matchingItems.length;
        const score = Number((tnkqScore + tlScore).toFixed(2));
        const questionIndices = matchingItems.map(it => it.index);

        unitTotalScore += score;
        unitTotalQuestions += count;

        // Build concise summary text: e.g. "2 TN (0.5đ)" or "1 TL (1.0đ)"
        const parts: string[] = [];
        if (tnkqCount > 0) parts.push(`${tnkqCount} TN`);
        if (tlCount > 0) parts.push(`${tlCount} TL`);
        const text = parts.join(' + ') + (score > 0 ? ` (${score}đ)` : '');

        questionsByLevel[lvl] = {
          count,
          tnkqCount,
          tnkqScore,
          tlCount,
          tlScore,
          score,
          questionIndices,
          summaryText: text || '-',
        };
      }
    });

    return {
      id: `spec-row-${rIdx + 1}`,
      chapter: grp.chapter,
      knowledgeUnit: grp.unit,
      outcomesByLevel,
      questionsByLevel,
      totalQuestions: unitTotalQuestions,
      totalScore: Number(unitTotalScore.toFixed(2)),
    };
  });
}

/**
 * Generate Specification Items from Question List (Duy trì tính tương thích ngược)
 */
export function buildSpecificationFromQuestions(
  questions: Question[], 
  fallbackChapter?: string
): SpecificationItem[] {
  const map: Record<string, SpecificationItem> = {};

  questions.forEach((q, idx) => {
    const { chapter, unit } = getChapterAndUnit(q, fallbackChapter);
    const outcome = q.learningOutcome?.trim() || 'Nắm vững kiến thức và vận dụng giải quyết vấn đề';
    const isTnkq = isObjectiveQuestion(q.questionType);
    const key = `${chapter}__${unit}__${q.level}__${q.questionType}`;

    if (!map[key]) {
      map[key] = {
        id: `spec-${Object.keys(map).length + 1}`,
        chapter,
        topic: chapter,
        knowledgeUnit: unit,
        learningOutcome: outcome,
        level: q.level,
        questionType: q.questionType,
        questionCount: 0,
        scorePerQuestion: q.score,
        totalScore: 0,
        questionIndices: [],
        isTnkq,
      };
    }

    map[key].questionCount += 1;
    map[key].totalScore = Number((map[key].totalScore + q.score).toFixed(2));
    map[key].scorePerQuestion = Number((map[key].totalScore / map[key].questionCount).toFixed(2));
    map[key].questionIndices?.push(idx + 1);
  });

  return Object.values(map);
}

/**
 * Allocate scores cleanly across questions to match maxScore exactly
 * RÀNG BUỘC CHẶT CHẼ THEO CHUẨN KHẢO THÍ BỘ GD&ĐT:
 * 1. 100% Điểm chi tiết cho từng câu hỏi BẮT BUỘC là bội số của 0.25 (0.25, 0.5, 0.75, 1.0, 1.25...)
 * 2. Tỉ lệ điểm của từng Mức độ nhận thức (Nhận biết, Thông hiểu, Vận dụng, Vận dụng cao)
 *    khớp CHÍNH XÁC với cấu hình người dùng thiết lập (Ví dụ: 40% - 30% - 20% - 10%).
 * 3. Tổng điểm toàn bộ đề thi đạt chính xác maxScore (Ví dụ: 10.0đ).
 */
export function distributeScores(
  questions: Question[], 
  maxScore: number = 10,
  config?: Pick<ExamConfig, 'levelDistributionMode' | 'levelCounts' | 'levelPercentages'>
): Question[] {
  if (!questions || questions.length === 0) return [];
  const targetMax = maxScore && maxScore > 0 ? maxScore : 10;
  const totalQuarters = Math.round(targetMax * 4); // Mỗi quarter tương đương 0.25 điểm

  const levels: CognitiveLevel[] = ['nhan_biet', 'thong_hieu', 'van_dung', 'van_dung_cao'];

  // Xác định tỷ lệ % mục tiêu cho 4 mức độ nhận thức
  const percentages: Record<CognitiveLevel, number> = {
    nhan_biet: config?.levelPercentages?.nhan_biet ?? DEFAULT_LEVEL_RATIOS.nhan_biet,
    thong_hieu: config?.levelPercentages?.thong_hieu ?? DEFAULT_LEVEL_RATIOS.thong_hieu,
    van_dung: config?.levelPercentages?.van_dung ?? DEFAULT_LEVEL_RATIOS.van_dung,
    van_dung_cao: config?.levelPercentages?.van_dung_cao ?? DEFAULT_LEVEL_RATIOS.van_dung_cao,
  };

  // Tính số quarters mục tiêu cho từng mức độ nhận thức
  const targetQuarters: Record<CognitiveLevel, number> = {
    nhan_biet: 0,
    thong_hieu: 0,
    van_dung: 0,
    van_dung_cao: 0,
  };

  let accumulatedQuarters = 0;
  levels.forEach((lvl, idx) => {
    if (idx === levels.length - 1) {
      targetQuarters[lvl] = Math.max(0, totalQuarters - accumulatedQuarters);
    } else {
      const q = Math.round((totalQuarters * (percentages[lvl] || 0)) / 100);
      targetQuarters[lvl] = q;
      accumulatedQuarters += q;
    }
  });

  const updatedQuestions: Question[] = questions.map(q => ({ ...q }));

  // Cân bằng mức độ nhận thức nếu danh sách câu hỏi bị thiếu một mức độ nào đó
  levels.forEach(lvl => {
    if (targetQuarters[lvl] > 0 && !updatedQuestions.some(q => q.level === lvl)) {
      // Tìm câu hỏi phù hợp nhất để chuyển mức độ
      const candidate = updatedQuestions.slice().reverse().find(q => {
        if (lvl === 'van_dung_cao') return !isObjectiveQuestion(q.questionType) || q.level === 'van_dung';
        if (lvl === 'van_dung') return q.level === 'thong_hieu' || q.level === 'nhan_biet';
        return q.level !== lvl;
      });
      if (candidate) {
        candidate.level = lvl;
      }
    }
  });

  // Phân bổ quarters cho từng mức độ nhận thức
  levels.forEach(lvl => {
    const lvlQuestions = updatedQuestions.filter(q => q.level === lvl);
    if (lvlQuestions.length === 0) return;

    let groupQuarters = targetQuarters[lvl];
    const n = lvlQuestions.length;

    // Đảm bảo mỗi câu trong nhóm có ít nhất 1 quarter (0.25 điểm)
    if (groupQuarters < n) {
      groupQuarters = n;
    }

    const objQuestions = lvlQuestions.filter(q => isObjectiveQuestion(q.questionType));
    const essayQuestions = lvlQuestions.filter(q => !isObjectiveQuestion(q.questionType));

    if (objQuestions.length === 0 || essayQuestions.length === 0) {
      // Toàn bộ cùng loại (toàn TN hoặc toàn TL)
      const baseQuarters = Math.max(1, Math.floor(groupQuarters / n));
      let remQuarters = groupQuarters - baseQuarters * n;

      lvlQuestions.forEach((q, idx) => {
        let qQuarters = baseQuarters;
        if (idx < remQuarters) {
          qQuarters += 1;
        }
        q.score = Number((qQuarters * 0.25).toFixed(2));
      });
    } else {
      // Có cả TNKQ và Tự luận trong cùng mức độ nhận thức
      // Ưu tiên trắc nghiệm nhận 0.25 hoặc 0.5
      let objQuarterPerQ = 1; // 0.25đ
      if (groupQuarters >= objQuestions.length * 2 + essayQuestions.length * 2) {
        objQuarterPerQ = 2; // 0.5đ
      }

      const totalObjQuarters = objQuestions.length * objQuarterPerQ;
      let remainingEssayQuarters = groupQuarters - totalObjQuarters;

      if (remainingEssayQuarters < essayQuestions.length) {
        objQuarterPerQ = 1;
        remainingEssayQuarters = groupQuarters - objQuestions.length;
      }

      objQuestions.forEach(q => {
        q.score = Number((objQuarterPerQ * 0.25).toFixed(2));
      });

      const essayBase = Math.max(1, Math.floor(remainingEssayQuarters / essayQuestions.length));
      let essayRem = remainingEssayQuarters - essayBase * essayQuestions.length;

      essayQuestions.forEach((q, idx) => {
        let qQuarters = essayBase;
        if (idx < essayRem) {
          qQuarters += 1;
        }
        q.score = Number((qQuarters * 0.25).toFixed(2));
      });
    }

    // Đồng bộ rubricBreakdown nếu có
    lvlQuestions.forEach(q => {
      if (q.rubricBreakdown && q.rubricBreakdown.length > 0) {
        const rTotalQuarters = Math.round((q.score || 0.25) * 4);
        const rCount = q.rubricBreakdown.length;
        const rBase = Math.max(1, Math.floor(rTotalQuarters / rCount));
        let rRem = rTotalQuarters - rBase * rCount;

        q.rubricBreakdown = q.rubricBreakdown.map((r, rIdx) => {
          let cQuarters = rBase;
          if (rIdx < rRem) cQuarters += 1;
          return {
            ...r,
            score: Number((cQuarters * 0.25).toFixed(2)),
          };
        });
      }
    });
  });

  // Kiểm tra chênh lệch tổng thể nếu có sai số làm tròn số học
  const currentTotal = Number(updatedQuestions.reduce((sum, q) => sum + (q.score || 0), 0).toFixed(2));
  const diffQuarters = Math.round((targetMax - currentTotal) * 4);

  if (diffQuarters !== 0 && updatedQuestions.length > 0) {
    // Điều chỉnh vào câu tự luận cuối cùng hoặc câu cuối cùng
    const targetQ = updatedQuestions.slice().reverse().find(q => !isObjectiveQuestion(q.questionType)) || updatedQuestions[updatedQuestions.length - 1];
    const newQuarters = Math.max(1, Math.round((targetQ.score || 0.25) * 4) + diffQuarters);
    targetQ.score = Number((newQuarters * 0.25).toFixed(2));

    // Cập nhật lại rubric nếu có
    if (targetQ.rubricBreakdown && targetQ.rubricBreakdown.length > 0) {
      const rTotal = Math.round((targetQ.score || 0.25) * 4);
      const rCount = targetQ.rubricBreakdown.length;
      const rBase = Math.max(1, Math.floor(rTotal / rCount));
      let rRem = rTotal - rBase * rCount;
      targetQ.rubricBreakdown = targetQ.rubricBreakdown.map((r, idx) => {
        let qQ = rBase;
        if (idx < rRem) qQ += 1;
        return { ...r, score: Number((qQ * 0.25).toFixed(2)) };
      });
    }
  }

  return updatedQuestions;
}
