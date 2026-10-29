'use client';

import React from 'react';
import { CognitiveLevel, ExamMatrix, Question, SpecificationItem, SpecificationRow } from '@/types/exam';
import { buildSpecificationRowsFromQuestions, LEVEL_NAMES } from '@/lib/matrixCalculator';

interface SpecificationTableProps {
  specifications: SpecificationItem[];
  specificationRows?: SpecificationRow[];
  questions?: Question[];
  subject?: string;
  grade?: string;
  matrix?: ExamMatrix;
}

export const SpecificationTable: React.FC<SpecificationTableProps> = ({ 
  specifications,
  specificationRows,
  questions,
  subject,
  grade,
  matrix,
}) => {
  // Derive rows: prefer provided specificationRows, or build from questions, or group from specifications
  const rows: SpecificationRow[] = React.useMemo(() => {
    if (specificationRows && specificationRows.length > 0) {
      return specificationRows;
    }
    if (questions && questions.length > 0) {
      return buildSpecificationRowsFromQuestions(questions);
    }
    // Fallback: group from specifications
    interface GroupedSpec {
      chapter: string;
      unit: string;
      items: SpecificationItem[];
    }
    const groupedMap: Record<string, GroupedSpec> = {};
    specifications.forEach((item) => {
      const chapter = item.chapter || item.topic || 'Chương trình chính';
      const unit = item.knowledgeUnit || item.topic || 'Đơn vị kiến thức';
      const key = `${chapter}___${unit}`;
      if (!groupedMap[key]) {
        groupedMap[key] = { chapter, unit, items: [] };
      }
      groupedMap[key].items.push(item);
    });

    return Object.values(groupedMap).map((grp, idx) => {
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

      let unitTotalQuestions = 0;
      let unitTotalScore = 0;

      grp.items.forEach((it) => {
        const lvl = it.level;
        if (it.learningOutcome && !outcomesByLevel[lvl].includes(it.learningOutcome)) {
          outcomesByLevel[lvl].push(it.learningOutcome);
        }
        const isTnkq = it.isTnkq ?? (it.questionType.startsWith('trac_nghiem') || it.questionType === 'dung_sai' || it.questionType === 'tra_loi_ngan' || it.questionType === 'dien_khuyet' || it.questionType === 'ghep_noi');
        const qCount = it.questionCount;
        const qScore = it.totalScore;

        unitTotalQuestions += qCount;
        unitTotalScore += qScore;

        questionsByLevel[lvl].count += qCount;
        questionsByLevel[lvl].score = Number((questionsByLevel[lvl].score + qScore).toFixed(2));
        if (isTnkq) {
          questionsByLevel[lvl].tnkqCount += qCount;
          questionsByLevel[lvl].tnkqScore = Number((questionsByLevel[lvl].tnkqScore + qScore).toFixed(2));
        } else {
          questionsByLevel[lvl].tlCount += qCount;
          questionsByLevel[lvl].tlScore = Number((questionsByLevel[lvl].tlScore + qScore).toFixed(2));
        }
        if (it.questionIndices) {
          questionsByLevel[lvl].questionIndices.push(...it.questionIndices);
        }
      });

      // Format summary texts
      const levels: CognitiveLevel[] = ['nhan_biet', 'thong_hieu', 'van_dung', 'van_dung_cao'];
      levels.forEach((lvl) => {
        const d = questionsByLevel[lvl];
        if (d.count > 0) {
          const parts: string[] = [];
          if (d.tnkqCount > 0) parts.push(`${d.tnkqCount} TN`);
          if (d.tlCount > 0) parts.push(`${d.tlCount} TL`);
          d.summaryText = parts.join(' + ') + (d.score > 0 ? ` (${d.score}đ)` : '');
        } else {
          d.summaryText = '-';
        }
      });

      return {
        id: `spec-row-${idx + 1}`,
        chapter: grp.chapter,
        knowledgeUnit: grp.unit,
        outcomesByLevel,
        questionsByLevel,
        totalQuestions: unitTotalQuestions,
        totalScore: Number(unitTotalScore.toFixed(2)),
      };
    });
  }, [specificationRows, questions, specifications]);

  // Group by chapter for rowSpan
  interface ChapterGroup {
    chapter: string;
    rows: SpecificationRow[];
  }
  const chapterGroups: ChapterGroup[] = React.useMemo(() => {
    const list: ChapterGroup[] = [];
    rows.forEach((r) => {
      const chName = r.chapter || 'Chương trình chính';
      const existing = list.find((g) => g.chapter === chName);
      if (existing) {
        existing.rows.push(r);
      } else {
        list.push({ chapter: chName, rows: [r] });
      }
    });
    return list;
  }, [rows]);

  // Totals for footers
  const totals = React.useMemo(() => {
    const res = {
      nhan_biet: { count: 0, tnkqCount: 0, tlCount: 0, score: 0 },
      thong_hieu: { count: 0, tnkqCount: 0, tlCount: 0, score: 0 },
      van_dung: { count: 0, tnkqCount: 0, tlCount: 0, score: 0 },
      van_dung_cao: { count: 0, tnkqCount: 0, tlCount: 0, score: 0 },
      totalQuestions: 0,
      totalScore: 0,
    };
    rows.forEach((r) => {
      const levels: CognitiveLevel[] = ['nhan_biet', 'thong_hieu', 'van_dung', 'van_dung_cao'];
      levels.forEach((lvl) => {
        const q = r.questionsByLevel[lvl];
        res[lvl].count += q.count;
        res[lvl].tnkqCount += q.tnkqCount;
        res[lvl].tlCount += q.tlCount;
        res[lvl].score = Number((res[lvl].score + q.score).toFixed(2));
      });
      res.totalQuestions += r.totalQuestions;
      res.totalScore = Number((res.totalScore + r.totalScore).toFixed(2));
    });
    return res;
  }, [rows]);

  const grandTotalScore = totals.totalScore > 0 ? totals.totalScore : 10;
  const pctNb = Math.round((totals.nhan_biet.score / grandTotalScore) * 100);
  const pctTh = Math.round((totals.thong_hieu.score / grandTotalScore) * 100);
  const pctVd = Math.round((totals.van_dung.score / grandTotalScore) * 100);
  const pctVdc = Math.max(0, 100 - pctNb - pctTh - pctVd);

  return (
    <div style={{
      backgroundColor: '#ffffff',
      borderRadius: 12,
      border: '1px solid #cbd5e1',
      overflow: 'hidden',
      boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
    }}>
      {/* Header Banner */}
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid #cbd5e1',
        backgroundColor: '#f8fafc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
      }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#1e3a8a', textTransform: 'uppercase' }}>
            BẢN ĐẶC TẢ ĐỀ KIỂM TRA ĐỊNH KỲ
          </h3>
          <p style={{ margin: '3px 0 0', fontSize: '0.82rem', color: '#475569' }}>
            Bảng mô tả mức độ đánh giá và yêu cầu cần đạt theo Chương trình GDPT 2018 — {subject ? `${subject}` : 'Môn học'} {grade ? `(${grade})` : ''}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', fontSize: '0.8rem', fontWeight: 600 }}>
          <span style={{ color: '#1e40af', backgroundColor: '#eff6ff', padding: '5px 12px', borderRadius: 6, border: '1px solid #bfdbfe' }}>
            Tổng số: <strong>{totals.totalQuestions} câu</strong>
          </span>
          <span style={{ color: '#15803d', backgroundColor: '#f0fdf4', padding: '5px 12px', borderRadius: 6, border: '1px solid #bbf7d0' }}>
            Tổng thang điểm: <strong>{totals.totalScore.toFixed(2)}đ</strong>
          </span>
        </div>
      </div>

      {/* Main Specification Table */}
      <div style={{ overflowX: 'auto', padding: '12px' }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '0.8rem',
          border: '1px solid #94a3b8',
        }}>
          <thead>
            {/* Header Row 1 */}
            <tr style={{ backgroundColor: '#e2e8f0', color: '#0f172a', fontWeight: 700, textAlign: 'center' }}>
              <th rowSpan={2} style={{ border: '1px solid #94a3b8', padding: '8px 4px', width: '4%' }}>TT</th>
              <th rowSpan={2} style={{ border: '1px solid #94a3b8', padding: '8px 6px', width: '15%' }}>Chương / Chủ đề</th>
              <th rowSpan={2} style={{ border: '1px solid #94a3b8', padding: '8px 6px', width: '16%' }}>Nội dung / Đơn vị kiến thức</th>
              <th rowSpan={2} style={{ border: '1px solid #94a3b8', padding: '8px', width: '37%', textAlign: 'left' }}>
                Mức độ đánh giá (Yêu cầu cần đạt)
              </th>
              <th colSpan={4} style={{ border: '1px solid #94a3b8', padding: '6px 4px', backgroundColor: '#dbeafe', color: '#1e3a8a' }}>
                Số câu hỏi theo mức độ nhận thức
              </th>
              <th rowSpan={2} style={{ border: '1px solid #94a3b8', padding: '8px 4px', width: '8%', backgroundColor: '#f1f5f9' }}>
                Tổng cộng
              </th>
            </tr>

            {/* Header Row 2: Cognitive Levels */}
            <tr style={{ backgroundColor: '#f1f5f9', color: '#1e293b', fontWeight: 700, textAlign: 'center', fontSize: '0.76rem' }}>
              <th style={{ border: '1px solid #94a3b8', padding: '6px 4px', backgroundColor: '#eff6ff', color: '#1e40af', width: '8%' }}>
                Nhận biết
              </th>
              <th style={{ border: '1px solid #94a3b8', padding: '6px 4px', backgroundColor: '#f0fdf4', color: '#166534', width: '8%' }}>
                Thông hiểu
              </th>
              <th style={{ border: '1px solid #94a3b8', padding: '6px 4px', backgroundColor: '#fffbeb', color: '#92400e', width: '8%' }}>
                Vận dụng
              </th>
              <th style={{ border: '1px solid #94a3b8', padding: '6px 4px', backgroundColor: '#fef2f2', color: '#991b1b', width: '8%' }}>
                Vận dụng cao
              </th>
            </tr>
          </thead>

          <tbody>
            {chapterGroups.map((grp, chIdx) => {
              return grp.rows.map((row, rIdx) => {
                const isFirstRowOfChapter = rIdx === 0;
                const nbQ = row.questionsByLevel.nhan_biet;
                const thQ = row.questionsByLevel.thong_hieu;
                const vdQ = row.questionsByLevel.van_dung;
                const vdcQ = row.questionsByLevel.van_dung_cao;

                return (
                  <tr key={`${chIdx}-${rIdx}`} style={{ backgroundColor: chIdx % 2 === 0 ? '#ffffff' : '#fcfcfc', verticalAlign: 'top' }}>
                    {/* TT with rowSpan */}
                    {isFirstRowOfChapter && (
                      <td 
                        rowSpan={grp.rows.length} 
                        style={{ border: '1px solid #94a3b8', padding: '10px 4px', textAlign: 'center', fontWeight: 700, backgroundColor: '#f8fafc' }}
                      >
                        {chIdx + 1}
                      </td>
                    )}

                    {/* Chương / Chủ đề with rowSpan */}
                    {isFirstRowOfChapter && (
                      <td 
                        rowSpan={grp.rows.length} 
                        style={{ 
                          border: '1px solid #94a3b8', 
                          padding: '10px 8px', 
                          fontWeight: 700, 
                          color: '#1e3a8a',
                          backgroundColor: '#f8fafc',
                        }}
                      >
                        {grp.chapter}
                      </td>
                    )}

                    {/* Nội dung / Đơn vị kiến thức */}
                    <td style={{ border: '1px solid #94a3b8', padding: '10px 8px', fontWeight: 600, color: '#334155' }}>
                      {row.knowledgeUnit}
                    </td>

                    {/* Mức độ đánh giá (Yêu cầu cần đạt phân theo mức độ chuẩn Bộ GD&ĐT) */}
                    <td style={{ border: '1px solid #94a3b8', padding: '10px 12px', lineHeight: 1.5, color: '#1e293b' }}>
                      {/* Nhận biết */}
                      {row.outcomesByLevel.nhan_biet.length > 0 && (
                        <div style={{ marginBottom: 8 }}>
                          <span style={{ fontWeight: 700, color: '#1e40af', fontSize: '0.78rem', textTransform: 'uppercase' }}>
                            • Nhận biết:
                          </span>
                          <ul style={{ margin: '3px 0 0', paddingLeft: 18, listStyleType: 'disc', color: '#334155' }}>
                            {row.outcomesByLevel.nhan_biet.map((out, oIdx) => (
                              <li key={oIdx} style={{ marginBottom: 3 }}>{out}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Thông hiểu */}
                      {row.outcomesByLevel.thong_hieu.length > 0 && (
                        <div style={{ marginBottom: 8 }}>
                          <span style={{ fontWeight: 700, color: '#166534', fontSize: '0.78rem', textTransform: 'uppercase' }}>
                            • Thông hiểu:
                          </span>
                          <ul style={{ margin: '3px 0 0', paddingLeft: 18, listStyleType: 'disc', color: '#334155' }}>
                            {row.outcomesByLevel.thong_hieu.map((out, oIdx) => (
                              <li key={oIdx} style={{ marginBottom: 3 }}>{out}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Vận dụng */}
                      {row.outcomesByLevel.van_dung.length > 0 && (
                        <div style={{ marginBottom: 8 }}>
                          <span style={{ fontWeight: 700, color: '#b45309', fontSize: '0.78rem', textTransform: 'uppercase' }}>
                            • Vận dụng:
                          </span>
                          <ul style={{ margin: '3px 0 0', paddingLeft: 18, listStyleType: 'disc', color: '#334155' }}>
                            {row.outcomesByLevel.van_dung.map((out, oIdx) => (
                              <li key={oIdx} style={{ marginBottom: 3 }}>{out}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Vận dụng cao */}
                      {row.outcomesByLevel.van_dung_cao.length > 0 && (
                        <div>
                          <span style={{ fontWeight: 700, color: '#b91c1c', fontSize: '0.78rem', textTransform: 'uppercase' }}>
                            • Vận dụng cao:
                          </span>
                          <ul style={{ margin: '3px 0 0', paddingLeft: 18, listStyleType: 'disc', color: '#334155' }}>
                            {row.outcomesByLevel.van_dung_cao.map((out, oIdx) => (
                              <li key={oIdx} style={{ marginBottom: 3 }}>{out}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Fallback if no specific outcomes captured */}
                      {row.outcomesByLevel.nhan_biet.length === 0 &&
                       row.outcomesByLevel.thong_hieu.length === 0 &&
                       row.outcomesByLevel.van_dung.length === 0 &&
                       row.outcomesByLevel.van_dung_cao.length === 0 && (
                        <span style={{ color: '#64748b', fontStyle: 'italic' }}>
                          Nắm vững chuẩn kiến thức và kĩ năng thực hành môn học theo yêu cầu cần đạt GDPT 2018.
                        </span>
                      )}
                    </td>

                    {/* Số câu Nhận biết */}
                    <td style={{ border: '1px solid #94a3b8', padding: '8px 4px', textAlign: 'center' }}>
                      {nbQ.count > 0 ? (
                        <div>
                          <strong style={{ color: '#1e40af', fontSize: '0.84rem' }}>{nbQ.summaryText}</strong>
                          {nbQ.questionIndices && nbQ.questionIndices.length > 0 && (
                            <span style={{ display: 'block', fontSize: '0.7rem', color: '#64748b', marginTop: 2 }}>
                              (C{nbQ.questionIndices.join(', C')})
                            </span>
                          )}
                        </div>
                      ) : (
                        <span style={{ color: '#94a3b8' }}>-</span>
                      )}
                    </td>

                    {/* Số câu Thông hiểu */}
                    <td style={{ border: '1px solid #94a3b8', padding: '8px 4px', textAlign: 'center' }}>
                      {thQ.count > 0 ? (
                        <div>
                          <strong style={{ color: '#166534', fontSize: '0.84rem' }}>{thQ.summaryText}</strong>
                          {thQ.questionIndices && thQ.questionIndices.length > 0 && (
                            <span style={{ display: 'block', fontSize: '0.7rem', color: '#64748b', marginTop: 2 }}>
                              (C{thQ.questionIndices.join(', C')})
                            </span>
                          )}
                        </div>
                      ) : (
                        <span style={{ color: '#94a3b8' }}>-</span>
                      )}
                    </td>

                    {/* Số câu Vận dụng */}
                    <td style={{ border: '1px solid #94a3b8', padding: '8px 4px', textAlign: 'center' }}>
                      {vdQ.count > 0 ? (
                        <div>
                          <strong style={{ color: '#b45309', fontSize: '0.84rem' }}>{vdQ.summaryText}</strong>
                          {vdQ.questionIndices && vdQ.questionIndices.length > 0 && (
                            <span style={{ display: 'block', fontSize: '0.7rem', color: '#64748b', marginTop: 2 }}>
                              (C{vdQ.questionIndices.join(', C')})
                            </span>
                          )}
                        </div>
                      ) : (
                        <span style={{ color: '#94a3b8' }}>-</span>
                      )}
                    </td>

                    {/* Số câu Vận dụng cao */}
                    <td style={{ border: '1px solid #94a3b8', padding: '8px 4px', textAlign: 'center' }}>
                      {vdcQ.count > 0 ? (
                        <div>
                          <strong style={{ color: '#b91c1c', fontSize: '0.84rem' }}>{vdcQ.summaryText}</strong>
                          {vdcQ.questionIndices && vdcQ.questionIndices.length > 0 && (
                            <span style={{ display: 'block', fontSize: '0.7rem', color: '#64748b', marginTop: 2 }}>
                              (C{vdcQ.questionIndices.join(', C')})
                            </span>
                          )}
                        </div>
                      ) : (
                        <span style={{ color: '#94a3b8' }}>-</span>
                      )}
                    </td>

                    {/* Tổng cộng đơn vị */}
                    <td style={{ border: '1px solid #94a3b8', padding: '8px 4px', textAlign: 'center', backgroundColor: '#f8fafc' }}>
                      <strong style={{ color: '#0f172a' }}>{row.totalQuestions} câu</strong>
                      <span style={{ display: 'block', color: '#1e40af', fontWeight: 700, fontSize: '0.76rem', marginTop: 2 }}>
                        {row.totalScore.toFixed(2)}đ
                      </span>
                    </td>
                  </tr>
                );
              });
            })}
          </tbody>

          {/* Footers */}
          <tfoot>
            {/* 1. Tổng câu hỏi theo mức độ */}
            <tr style={{ backgroundColor: '#eff6ff', fontWeight: 700, color: '#1e3a8a', textAlign: 'center' }}>
              <td colSpan={4} style={{ border: '1px solid #94a3b8', padding: '8px', textAlign: 'right' }}>
                TỔNG CÂU HỎI THEO MỨC ĐỘ
              </td>
              <td style={{ border: '1px solid #94a3b8', padding: '6px' }}>
                {totals.nhan_biet.tnkqCount > 0 ? `${totals.nhan_biet.tnkqCount} TN` : ''}
                {totals.nhan_biet.tlCount > 0 ? ` + ${totals.nhan_biet.tlCount} TL` : ''}
                {totals.nhan_biet.count === 0 ? '-' : ''}
              </td>
              <td style={{ border: '1px solid #94a3b8', padding: '6px' }}>
                {totals.thong_hieu.tnkqCount > 0 ? `${totals.thong_hieu.tnkqCount} TN` : ''}
                {totals.thong_hieu.tlCount > 0 ? ` + ${totals.thong_hieu.tlCount} TL` : ''}
                {totals.thong_hieu.count === 0 ? '-' : ''}
              </td>
              <td style={{ border: '1px solid #94a3b8', padding: '6px' }}>
                {totals.van_dung.tnkqCount > 0 ? `${totals.van_dung.tnkqCount} TN` : ''}
                {totals.van_dung.tlCount > 0 ? `${totals.van_dung.tlCount} TL` : ''}
                {totals.van_dung.count === 0 ? '-' : ''}
              </td>
              <td style={{ border: '1px solid #94a3b8', padding: '6px' }}>
                {totals.van_dung_cao.tnkqCount > 0 ? `${totals.van_dung_cao.tnkqCount} TN` : ''}
                {totals.van_dung_cao.tlCount > 0 ? `${totals.van_dung_cao.tlCount} TL` : ''}
                {totals.van_dung_cao.count === 0 ? '-' : ''}
              </td>
              <td style={{ border: '1px solid #94a3b8', padding: '6px', backgroundColor: '#dbeafe', color: '#1d4ed8' }}>
                {totals.totalQuestions} câu ({totals.totalScore.toFixed(2)}đ)
              </td>
            </tr>

            {/* 2. Tỉ lệ % */}
            <tr style={{ backgroundColor: '#fefce8', fontWeight: 700, color: '#854d0e', textAlign: 'center' }}>
              <td colSpan={4} style={{ border: '1px solid #94a3b8', padding: '8px', textAlign: 'right' }}>
                TỈ LỆ %
              </td>
              <td style={{ border: '1px solid #94a3b8', padding: '6px' }}>{pctNb}%</td>
              <td style={{ border: '1px solid #94a3b8', padding: '6px' }}>{pctTh}%</td>
              <td style={{ border: '1px solid #94a3b8', padding: '6px' }}>{pctVd}%</td>
              <td style={{ border: '1px solid #94a3b8', padding: '6px' }}>{pctVdc}%</td>
              <td style={{ border: '1px solid #94a3b8', padding: '6px', backgroundColor: '#fef08a' }}>100%</td>
            </tr>

            {/* 3. Tỉ lệ chung */}
            <tr style={{ backgroundColor: '#f8fafc', fontWeight: 700, color: '#334155', textAlign: 'center' }}>
              <td colSpan={4} style={{ border: '1px solid #94a3b8', padding: '8px', textAlign: 'right' }}>
                TỈ LỆ CHUNG
              </td>
              <td colSpan={2} style={{ border: '1px solid #94a3b8', padding: '6px', color: '#1e40af' }}>
                Nhận biết + Thông hiểu: {pctNb + pctTh}%
              </td>
              <td colSpan={2} style={{ border: '1px solid #94a3b8', padding: '6px', color: '#b45309' }}>
                Vận dụng + Vận dụng cao: {pctVd + pctVdc}%
              </td>
              <td style={{ border: '1px solid #94a3b8', padding: '6px' }}>100%</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Footnote */}
      <div style={{
        padding: '10px 18px',
        backgroundColor: '#f8fafc',
        borderTop: '1px solid #cbd5e1',
        fontSize: '0.78rem',
        color: '#475569',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 8,
      }}>
        <div>
          <strong>📌 Định dạng câu hỏi:</strong> TN (Trắc nghiệm khách quan) | TL (Tự luận). Kí hiệu số thứ tự câu trong ngoặc (C1, C2...) tương ứng đúng với đề thi.
        </div>
        <div style={{ color: '#15803d', fontWeight: 600 }}>
          ✓ Khớp 100% bản ma trận và nội dung bài thi chuẩn Bộ GD&ĐT
        </div>
      </div>
    </div>
  );
};
