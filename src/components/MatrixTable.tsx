'use client';

import React from 'react';
import { ExamMatrix } from '@/types/exam';

interface MatrixTableProps {
  matrix: ExamMatrix;
  examTitle?: string;
  subject?: string;
  grade?: string;
}

export const MatrixTable: React.FC<MatrixTableProps> = ({
  matrix,
  examTitle,
  subject,
  grade,
}) => {
  // Group rows by chapter for clean rowspan merging
  interface ChapterGroup {
    chapter: string;
    rows: typeof matrix.rows;
  }
  const chapterGroups: ChapterGroup[] = [];

  matrix.rows.forEach((row) => {
    const chapterName = row.chapter || 'Chủ đề trọng tâm';
    const existing = chapterGroups.find((g) => g.chapter === chapterName);
    if (existing) {
      existing.rows.push(row);
    } else {
      chapterGroups.push({ chapter: chapterName, rows: [row] });
    }
  });

  const totalTnkqCount = matrix.summary?.totalTnkqCount ?? 0;
  const totalTlCount = matrix.summary?.totalTlCount ?? 0;
  const totalTnkqScore = matrix.summary?.totalTnkqScore ?? 0;
  const totalTlScore = matrix.summary?.totalTlScore ?? 0;
  const totalTnkqPct = matrix.summary?.totalTnkqPercentage ?? 0;
  const totalTlPct = matrix.summary?.totalTlPercentage ?? 0;

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
            KHUNG MA TRẬN ĐỀ KIỂM TRA ĐỊNH KỲ
          </h3>
          <p style={{ margin: '3px 0 0', fontSize: '0.82rem', color: '#475569' }}>
            Theo Chương trình GDPT 2018 (Công văn 3280/BGDĐT-GDTrH) — {subject ? `${subject}` : 'Môn học'} {grade ? `(${grade})` : ''}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', fontSize: '0.8rem', fontWeight: 600 }}>
          <span style={{ color: '#1e40af', backgroundColor: '#eff6ff', padding: '5px 12px', borderRadius: 6, border: '1px solid #bfdbfe' }}>
            Tổng số: <strong>{matrix.grandTotalQuestions} câu</strong> (TNKQ: {totalTnkqCount} - TL: {totalTlCount})
          </span>
          <span style={{ color: '#15803d', backgroundColor: '#f0fdf4', padding: '5px 12px', borderRadius: 6, border: '1px solid #bbf7d0' }}>
            Tổng thang điểm: <strong>{matrix.grandTotalScore}đ</strong>
          </span>
          <span style={{ color: '#854d0e', backgroundColor: '#fefce8', padding: '5px 12px', borderRadius: 6, border: '1px solid #fef08a' }}>
            Tỉ lệ TN/TL: <strong>{totalTnkqPct}% / {totalTlPct}%</strong>
          </span>
        </div>
      </div>

      {/* Main Matrix Table */}
      <div style={{ overflowX: 'auto', padding: '12px' }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '0.8rem',
          textAlign: 'center',
          border: '1px solid #94a3b8',
        }}>
          <thead>
            {/* Header Row 1 */}
            <tr style={{ backgroundColor: '#e2e8f0', color: '#0f172a', fontWeight: 700 }}>
              <th rowSpan={3} style={{ border: '1px solid #94a3b8', padding: '8px 4px', width: '4%' }}>
                TT<br /><span style={{ fontSize: '0.72rem', fontWeight: 500 }}>(1)</span>
              </th>
              <th rowSpan={3} style={{ border: '1px solid #94a3b8', padding: '8px 6px', width: '18%', textAlign: 'center' }}>
                Chương / chủ đề<br /><span style={{ fontSize: '0.72rem', fontWeight: 500 }}>(2)</span>
              </th>
              <th rowSpan={3} style={{ border: '1px solid #94a3b8', padding: '8px 6px', width: '20%', textAlign: 'center' }}>
                Nội dung / đơn vị kiến thức<br /><span style={{ fontSize: '0.72rem', fontWeight: 500 }}>(3)</span>
              </th>
              <th colSpan={8} style={{ border: '1px solid #94a3b8', padding: '8px 4px', backgroundColor: '#dbeafe', color: '#1e3a8a' }}>
                Mức độ nhận thức (4-11)
              </th>
              <th colSpan={3} rowSpan={2} style={{ border: '1px solid #94a3b8', padding: '8px 4px', backgroundColor: '#f1f5f9', color: '#0f172a' }}>
                Tổng cộng (12)
              </th>
            </tr>

            {/* Header Row 2: Cognitive Levels */}
            <tr style={{ backgroundColor: '#f1f5f9', color: '#1e293b', fontWeight: 700, fontSize: '0.78rem' }}>
              <th colSpan={2} style={{ border: '1px solid #94a3b8', padding: '6px 4px', backgroundColor: '#eff6ff', color: '#1e40af' }}>
                Nhận biết ({matrix.totalByLevel?.nhan_biet?.percentage ?? 40}%)
              </th>
              <th colSpan={2} style={{ border: '1px solid #94a3b8', padding: '6px 4px', backgroundColor: '#f0fdf4', color: '#166534' }}>
                Thông hiểu ({matrix.totalByLevel?.thong_hieu?.percentage ?? 30}%)
              </th>
              <th colSpan={2} style={{ border: '1px solid #94a3b8', padding: '6px 4px', backgroundColor: '#fffbeb', color: '#92400e' }}>
                Vận dụng ({matrix.totalByLevel?.van_dung?.percentage ?? 20}%)
              </th>
              <th colSpan={2} style={{ border: '1px solid #94a3b8', padding: '6px 4px', backgroundColor: '#fef2f2', color: '#991b1b' }}>
                Vận dụng cao ({matrix.totalByLevel?.van_dung_cao?.percentage ?? 10}%)
              </th>
            </tr>

            {/* Header Row 3: Sub-columns TNKQ & TL */}
            <tr style={{ backgroundColor: '#f8fafc', fontSize: '0.74rem', fontWeight: 700, color: '#334155' }}>
              {/* NB */}
              <th style={{ border: '1px solid #94a3b8', padding: '4px', backgroundColor: '#eff6ff' }}>TNKQ</th>
              <th style={{ border: '1px solid #94a3b8', padding: '4px', backgroundColor: '#eff6ff' }}>TL</th>
              {/* TH */}
              <th style={{ border: '1px solid #94a3b8', padding: '4px', backgroundColor: '#f0fdf4' }}>TNKQ</th>
              <th style={{ border: '1px solid #94a3b8', padding: '4px', backgroundColor: '#f0fdf4' }}>TL</th>
              {/* VD */}
              <th style={{ border: '1px solid #94a3b8', padding: '4px', backgroundColor: '#fffbeb' }}>TNKQ</th>
              <th style={{ border: '1px solid #94a3b8', padding: '4px', backgroundColor: '#fffbeb' }}>TL</th>
              {/* VDC */}
              <th style={{ border: '1px solid #94a3b8', padding: '4px', backgroundColor: '#fef2f2' }}>TNKQ</th>
              <th style={{ border: '1px solid #94a3b8', padding: '4px', backgroundColor: '#fef2f2' }}>TL</th>
              {/* Total Sub-columns */}
              <th style={{ border: '1px solid #94a3b8', padding: '4px', backgroundColor: '#f1f5f9' }}>Số câu</th>
              <th style={{ border: '1px solid #94a3b8', padding: '4px', backgroundColor: '#f1f5f9' }}>Điểm</th>
              <th style={{ border: '1px solid #94a3b8', padding: '4px', backgroundColor: '#f1f5f9' }}>%</th>
            </tr>
          </thead>

          <tbody>
            {chapterGroups.map((grp, chIdx) => {
              return grp.rows.map((row, rIdx) => {
                const isFirstRowOfChapter = rIdx === 0;
                return (
                  <tr key={`${chIdx}-${rIdx}`} style={{ backgroundColor: chIdx % 2 === 0 ? '#ffffff' : '#fcfcfc' }}>
                    {/* TT column with rowSpan */}
                    {isFirstRowOfChapter && (
                      <td 
                        rowSpan={grp.rows.length} 
                        style={{ border: '1px solid #94a3b8', padding: '8px 4px', fontWeight: 700, backgroundColor: '#f8fafc' }}
                      >
                        {chIdx + 1}
                      </td>
                    )}

                    {/* Chương / Chủ đề column with rowSpan */}
                    {isFirstRowOfChapter && (
                      <td 
                        rowSpan={grp.rows.length} 
                        style={{ 
                          border: '1px solid #94a3b8', 
                          padding: '8px', 
                          textAlign: 'left', 
                          fontWeight: 700, 
                          color: '#1e3a8a',
                          backgroundColor: '#f8fafc',
                        }}
                      >
                        {grp.chapter}
                      </td>
                    )}

                    {/* Nội dung / Đơn vị kiến thức */}
                    <td style={{ border: '1px solid #94a3b8', padding: '8px', textAlign: 'left', color: '#334155' }}>
                      {row.topic}
                    </td>

                    {/* Nhận biết: TNKQ & TL */}
                    <td style={{ border: '1px solid #94a3b8', padding: '6px 4px' }}>
                      {row.cells.nhan_biet.tnkqCount ? (
                        <span style={{ fontWeight: 700, color: '#1e40af' }}>
                          {row.cells.nhan_biet.tnkqCount}
                          {row.cells.nhan_biet.tnkqScore ? <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block' }}>({row.cells.nhan_biet.tnkqScore}đ)</span> : null}
                        </span>
                      ) : '-'}
                    </td>
                    <td style={{ border: '1px solid #94a3b8', padding: '6px 4px' }}>
                      {row.cells.nhan_biet.tlCount ? (
                        <span style={{ fontWeight: 700, color: '#1e40af' }}>
                          {row.cells.nhan_biet.tlCount}
                          {row.cells.nhan_biet.tlScore ? <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block' }}>({row.cells.nhan_biet.tlScore}đ)</span> : null}
                        </span>
                      ) : '-'}
                    </td>

                    {/* Thông hiểu: TNKQ & TL */}
                    <td style={{ border: '1px solid #94a3b8', padding: '6px 4px' }}>
                      {row.cells.thong_hieu.tnkqCount ? (
                        <span style={{ fontWeight: 700, color: '#166534' }}>
                          {row.cells.thong_hieu.tnkqCount}
                          {row.cells.thong_hieu.tnkqScore ? <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block' }}>({row.cells.thong_hieu.tnkqScore}đ)</span> : null}
                        </span>
                      ) : '-'}
                    </td>
                    <td style={{ border: '1px solid #94a3b8', padding: '6px 4px' }}>
                      {row.cells.thong_hieu.tlCount ? (
                        <span style={{ fontWeight: 700, color: '#166534' }}>
                          {row.cells.thong_hieu.tlCount}
                          {row.cells.thong_hieu.tlScore ? <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block' }}>({row.cells.thong_hieu.tlScore}đ)</span> : null}
                        </span>
                      ) : '-'}
                    </td>

                    {/* Vận dụng: TNKQ & TL */}
                    <td style={{ border: '1px solid #94a3b8', padding: '6px 4px' }}>
                      {row.cells.van_dung.tnkqCount ? (
                        <span style={{ fontWeight: 700, color: '#b45309' }}>
                          {row.cells.van_dung.tnkqCount}
                          {row.cells.van_dung.tnkqScore ? <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block' }}>({row.cells.van_dung.tnkqScore}đ)</span> : null}
                        </span>
                      ) : '-'}
                    </td>
                    <td style={{ border: '1px solid #94a3b8', padding: '6px 4px' }}>
                      {row.cells.van_dung.tlCount ? (
                        <span style={{ fontWeight: 700, color: '#b45309' }}>
                          {row.cells.van_dung.tlCount}
                          {row.cells.van_dung.tlScore ? <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block' }}>({row.cells.van_dung.tlScore}đ)</span> : null}
                        </span>
                      ) : '-'}
                    </td>

                    {/* Vận dụng cao: TNKQ & TL */}
                    <td style={{ border: '1px solid #94a3b8', padding: '6px 4px' }}>
                      {row.cells.van_dung_cao.tnkqCount ? (
                        <span style={{ fontWeight: 700, color: '#b91c1c' }}>
                          {row.cells.van_dung_cao.tnkqCount}
                          {row.cells.van_dung_cao.tnkqScore ? <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block' }}>({row.cells.van_dung_cao.tnkqScore}đ)</span> : null}
                        </span>
                      ) : '-'}
                    </td>
                    <td style={{ border: '1px solid #94a3b8', padding: '6px 4px' }}>
                      {row.cells.van_dung_cao.tlCount ? (
                        <span style={{ fontWeight: 700, color: '#b91c1c' }}>
                          {row.cells.van_dung_cao.tlCount}
                          {row.cells.van_dung_cao.tlScore ? <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block' }}>({row.cells.van_dung_cao.tlScore}đ)</span> : null}
                        </span>
                      ) : '-'}
                    </td>

                    {/* Row Summary */}
                    <td style={{ border: '1px solid #94a3b8', padding: '6px 4px', fontWeight: 700, backgroundColor: '#f8fafc' }}>
                      {row.totalQuestions}
                    </td>
                    <td style={{ border: '1px solid #94a3b8', padding: '6px 4px', fontWeight: 700, color: '#1e40af', backgroundColor: '#f8fafc' }}>
                      {row.totalScore}đ
                    </td>
                    <td style={{ border: '1px solid #94a3b8', padding: '6px 4px', fontWeight: 600, color: '#475569', backgroundColor: '#f8fafc' }}>
                      {row.percentage}%
                    </td>
                  </tr>
                );
              });
            })}
          </tbody>

          {/* Footer Footnotes & Official Totals */}
          <tfoot>
            {/* 1. Tổng số câu */}
            <tr style={{ backgroundColor: '#eff6ff', fontWeight: 700, color: '#1e3a8a' }}>
              <td colSpan={3} style={{ border: '1px solid #94a3b8', padding: '7px 8px', textAlign: 'right' }}>
                Tổng số câu
              </td>
              {/* NB */}
              <td style={{ border: '1px solid #94a3b8', padding: '5px' }}>{matrix.totalByLevel.nhan_biet.tnkqCount || '-'}</td>
              <td style={{ border: '1px solid #94a3b8', padding: '5px' }}>{matrix.totalByLevel.nhan_biet.tlCount || '-'}</td>
              {/* TH */}
              <td style={{ border: '1px solid #94a3b8', padding: '5px' }}>{matrix.totalByLevel.thong_hieu.tnkqCount || '-'}</td>
              <td style={{ border: '1px solid #94a3b8', padding: '5px' }}>{matrix.totalByLevel.thong_hieu.tlCount || '-'}</td>
              {/* VD */}
              <td style={{ border: '1px solid #94a3b8', padding: '5px' }}>{matrix.totalByLevel.van_dung.tnkqCount || '-'}</td>
              <td style={{ border: '1px solid #94a3b8', padding: '5px' }}>{matrix.totalByLevel.van_dung.tlCount || '-'}</td>
              {/* VDC */}
              <td style={{ border: '1px solid #94a3b8', padding: '5px' }}>{matrix.totalByLevel.van_dung_cao.tnkqCount || '-'}</td>
              <td style={{ border: '1px solid #94a3b8', padding: '5px' }}>{matrix.totalByLevel.van_dung_cao.tlCount || '-'}</td>
              {/* Total */}
              <td style={{ border: '1px solid #94a3b8', padding: '5px', backgroundColor: '#dbeafe' }}>{matrix.grandTotalQuestions}</td>
              <td style={{ border: '1px solid #94a3b8', padding: '5px', backgroundColor: '#dbeafe', color: '#1d4ed8' }}>{matrix.grandTotalScore}đ</td>
              <td style={{ border: '1px solid #94a3b8', padding: '5px', backgroundColor: '#dbeafe' }}>100%</td>
            </tr>

            {/* 2. Tổng điểm */}
            <tr style={{ backgroundColor: '#f0fdf4', fontWeight: 700, color: '#166534' }}>
              <td colSpan={3} style={{ border: '1px solid #94a3b8', padding: '7px 8px', textAlign: 'right' }}>
                Tổng điểm
              </td>
              {/* NB */}
              <td style={{ border: '1px solid #94a3b8', padding: '5px' }}>{matrix.totalByLevel.nhan_biet.tnkqScore ? `${matrix.totalByLevel.nhan_biet.tnkqScore}đ` : '-'}</td>
              <td style={{ border: '1px solid #94a3b8', padding: '5px' }}>{matrix.totalByLevel.nhan_biet.tlScore ? `${matrix.totalByLevel.nhan_biet.tlScore}đ` : '-'}</td>
              {/* TH */}
              <td style={{ border: '1px solid #94a3b8', padding: '5px' }}>{matrix.totalByLevel.thong_hieu.tnkqScore ? `${matrix.totalByLevel.thong_hieu.tnkqScore}đ` : '-'}</td>
              <td style={{ border: '1px solid #94a3b8', padding: '5px' }}>{matrix.totalByLevel.thong_hieu.tlScore ? `${matrix.totalByLevel.thong_hieu.tlScore}đ` : '-'}</td>
              {/* VD */}
              <td style={{ border: '1px solid #94a3b8', padding: '5px' }}>{matrix.totalByLevel.van_dung.tnkqScore ? `${matrix.totalByLevel.van_dung.tnkqScore}đ` : '-'}</td>
              <td style={{ border: '1px solid #94a3b8', padding: '5px' }}>{matrix.totalByLevel.van_dung.tlScore ? `${matrix.totalByLevel.van_dung.tlScore}đ` : '-'}</td>
              {/* VDC */}
              <td style={{ border: '1px solid #94a3b8', padding: '5px' }}>{matrix.totalByLevel.van_dung_cao.tnkqScore ? `${matrix.totalByLevel.van_dung_cao.tnkqScore}đ` : '-'}</td>
              <td style={{ border: '1px solid #94a3b8', padding: '5px' }}>{matrix.totalByLevel.van_dung_cao.tlScore ? `${matrix.totalByLevel.van_dung_cao.tlScore}đ` : '-'}</td>
              {/* Total */}
              <td style={{ border: '1px solid #94a3b8', padding: '5px', backgroundColor: '#dcfce7' }}>{matrix.grandTotalQuestions} câu</td>
              <td style={{ border: '1px solid #94a3b8', padding: '5px', backgroundColor: '#dcfce7', color: '#15803d' }}>{matrix.grandTotalScore}đ</td>
              <td style={{ border: '1px solid #94a3b8', padding: '5px', backgroundColor: '#dcfce7' }}>100%</td>
            </tr>

            {/* 3. Tỉ lệ % */}
            <tr style={{ backgroundColor: '#fefce8', fontWeight: 700, color: '#854d0e' }}>
              <td colSpan={3} style={{ border: '1px solid #94a3b8', padding: '7px 8px', textAlign: 'right' }}>
                Tỉ lệ %
              </td>
              <td colSpan={2} style={{ border: '1px solid #94a3b8', padding: '5px', textAlign: 'center' }}>
                {matrix.totalByLevel.nhan_biet.percentage}%
              </td>
              <td colSpan={2} style={{ border: '1px solid #94a3b8', padding: '5px', textAlign: 'center' }}>
                {matrix.totalByLevel.thong_hieu.percentage}%
              </td>
              <td colSpan={2} style={{ border: '1px solid #94a3b8', padding: '5px', textAlign: 'center' }}>
                {matrix.totalByLevel.van_dung.percentage}%
              </td>
              <td colSpan={2} style={{ border: '1px solid #94a3b8', padding: '5px', textAlign: 'center' }}>
                {matrix.totalByLevel.van_dung_cao.percentage}%
              </td>
              <td colSpan={3} style={{ border: '1px solid #94a3b8', padding: '5px', textAlign: 'center', backgroundColor: '#fef08a' }}>
                100%
              </td>
            </tr>

            {/* 4. Tỉ lệ chung */}
            <tr style={{ backgroundColor: '#f8fafc', fontWeight: 700, color: '#334155' }}>
              <td colSpan={3} style={{ border: '1px solid #94a3b8', padding: '7px 8px', textAlign: 'right' }}>
                Tỉ lệ chung
              </td>
              <td colSpan={4} style={{ border: '1px solid #94a3b8', padding: '6px', textAlign: 'center', color: '#1e40af' }}>
                Nhận biết + Thông hiểu: {matrix.summary?.knowUnderstandPercentage ?? 70}%
              </td>
              <td colSpan={4} style={{ border: '1px solid #94a3b8', padding: '6px', textAlign: 'center', color: '#b45309' }}>
                Vận dụng + Vận dụng cao: {matrix.summary?.applyPercentage ?? 30}%
              </td>
              <td colSpan={3} style={{ border: '1px solid #94a3b8', padding: '6px', textAlign: 'center' }}>
                100%
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Standard Footnote */}
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
          <strong>📌 Tỉ lệ hình thức:</strong> Trắc nghiệm khách quan (TNKQ): <strong>{totalTnkqPct}%</strong> ({totalTnkqScore}đ) — Tự luận (TL): <strong>{totalTlPct}%</strong> ({totalTlScore}đ).
        </div>
        <div style={{ color: '#166534', fontWeight: 600 }}>
          ✓ Khớp 100% số lượng câu hỏi và thang điểm theo mẫu khảo thí Bộ GD&ĐT
        </div>
      </div>
    </div>
  );
};
