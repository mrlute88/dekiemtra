'use client';

import React from 'react';
import { ExamMatrix } from '@/types/exam';
import { LEVEL_NAMES } from '@/lib/matrixCalculator';

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
  return (
    <div style={{
      backgroundColor: '#ffffff',
      borderRadius: 12,
      border: '1px solid #e2e8f0',
      overflow: 'hidden',
      boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
    }}>
      {/* Header info */}
      <div style={{
        padding: '14px 20px',
        borderBottom: '1px solid #e2e8f0',
        backgroundColor: '#f8fafc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 10,
      }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#1e3a8a' }}>
            KHUNG MA TRẬN ĐỀ KIỂM TRA ĐỊNH KỲ
          </h3>
          <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#64748b' }}>
            Theo hướng dẫn Chương trình GDPT 2018 (Công văn 3280/BGDĐT-GDTrH)
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12, fontSize: '0.82rem', fontWeight: 600 }}>
          <span style={{ color: '#1e40af', backgroundColor: '#eff6ff', padding: '4px 10px', borderRadius: 6 }}>
            Tổng số câu: {matrix.grandTotalQuestions}
          </span>
          <span style={{ color: '#15803d', backgroundColor: '#f0fdf4', padding: '4px 10px', borderRadius: 6 }}>
            Tổng thang điểm: {matrix.grandTotalScore}đ
          </span>
        </div>
      </div>

      {/* Matrix Table */}
      <div style={{ overflowX: 'auto', padding: 12 }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '0.82rem',
          textAlign: 'center',
        }}>
          <thead>
            <tr style={{ backgroundColor: '#f1f5f9', color: '#1e293b' }}>
              <th rowSpan={2} style={{ border: '1px solid #cbd5e1', padding: '10px 8px', width: '22%' }}>
                TT / Chủ đề nội dung
              </th>
              <th colSpan={3} style={{ border: '1px solid #cbd5e1', padding: '6px', backgroundColor: '#eff6ff', color: '#1e40af' }}>
                1. Nhận biết ({matrix.totalByLevel?.nhan_biet?.percentage ?? 40}%)
              </th>
              <th colSpan={3} style={{ border: '1px solid #cbd5e1', padding: '6px', backgroundColor: '#f0fdf4', color: '#166534' }}>
                2. Thông hiểu ({matrix.totalByLevel?.thong_hieu?.percentage ?? 30}%)
              </th>
              <th colSpan={3} style={{ border: '1px solid #cbd5e1', padding: '6px', backgroundColor: '#fffbeb', color: '#92400e' }}>
                3. Vận dụng ({matrix.totalByLevel?.van_dung?.percentage ?? 20}%)
              </th>
              <th colSpan={3} style={{ border: '1px solid #cbd5e1', padding: '6px', backgroundColor: '#fef2f2', color: '#991b1b' }}>
                4. Vận dụng cao ({matrix.totalByLevel?.van_dung_cao?.percentage ?? 10}%)
              </th>
              <th colSpan={3} style={{ border: '1px solid #cbd5e1', padding: '6px', backgroundColor: '#f8fafc' }}>
                Tổng cộng
              </th>
            </tr>
            <tr style={{ backgroundColor: '#f8fafc', fontSize: '0.75rem', color: '#475569' }}>
              {/* NB */}
              <th style={{ border: '1px solid #cbd5e1', padding: '4px' }}>Số câu</th>
              <th style={{ border: '1px solid #cbd5e1', padding: '4px' }}>Điểm</th>
              <th style={{ border: '1px solid #cbd5e1', padding: '4px' }}>%</th>
              {/* TH */}
              <th style={{ border: '1px solid #cbd5e1', padding: '4px' }}>Số câu</th>
              <th style={{ border: '1px solid #cbd5e1', padding: '4px' }}>Điểm</th>
              <th style={{ border: '1px solid #cbd5e1', padding: '4px' }}>%</th>
              {/* VD */}
              <th style={{ border: '1px solid #cbd5e1', padding: '4px' }}>Số câu</th>
              <th style={{ border: '1px solid #cbd5e1', padding: '4px' }}>Điểm</th>
              <th style={{ border: '1px solid #cbd5e1', padding: '4px' }}>%</th>
              {/* VDC */}
              <th style={{ border: '1px solid #cbd5e1', padding: '4px' }}>Số câu</th>
              <th style={{ border: '1px solid #cbd5e1', padding: '4px' }}>Điểm</th>
              <th style={{ border: '1px solid #cbd5e1', padding: '4px' }}>%</th>
              {/* Total */}
              <th style={{ border: '1px solid #cbd5e1', padding: '4px' }}>Số câu</th>
              <th style={{ border: '1px solid #cbd5e1', padding: '4px' }}>Điểm</th>
              <th style={{ border: '1px solid #cbd5e1', padding: '4px' }}>%</th>
            </tr>
          </thead>
          <tbody>
            {matrix.rows.map((row, idx) => (
              <tr key={idx} style={{ backgroundColor: idx % 2 === 0 ? '#ffffff' : '#fafafa' }}>
                <td style={{ border: '1px solid #cbd5e1', padding: '8px', textAlign: 'left', fontWeight: 600, color: '#334155' }}>
                  {idx + 1}. {row.topic}
                </td>
                {/* NB */}
                <td style={{ border: '1px solid #cbd5e1', padding: '6px' }}>{row.cells.nhan_biet.questionCount || '-'}</td>
                <td style={{ border: '1px solid #cbd5e1', padding: '6px' }}>{row.cells.nhan_biet.score || '-'}</td>
                <td style={{ border: '1px solid #cbd5e1', padding: '6px', color: '#64748b' }}>{row.cells.nhan_biet.percentage ? `${row.cells.nhan_biet.percentage}%` : '-'}</td>
                {/* TH */}
                <td style={{ border: '1px solid #cbd5e1', padding: '6px' }}>{row.cells.thong_hieu.questionCount || '-'}</td>
                <td style={{ border: '1px solid #cbd5e1', padding: '6px' }}>{row.cells.thong_hieu.score || '-'}</td>
                <td style={{ border: '1px solid #cbd5e1', padding: '6px', color: '#64748b' }}>{row.cells.thong_hieu.percentage ? `${row.cells.thong_hieu.percentage}%` : '-'}</td>
                {/* VD */}
                <td style={{ border: '1px solid #cbd5e1', padding: '6px' }}>{row.cells.van_dung.questionCount || '-'}</td>
                <td style={{ border: '1px solid #cbd5e1', padding: '6px' }}>{row.cells.van_dung.score || '-'}</td>
                <td style={{ border: '1px solid #cbd5e1', padding: '6px', color: '#64748b' }}>{row.cells.van_dung.percentage ? `${row.cells.van_dung.percentage}%` : '-'}</td>
                {/* VDC */}
                <td style={{ border: '1px solid #cbd5e1', padding: '6px' }}>{row.cells.van_dung_cao.questionCount || '-'}</td>
                <td style={{ border: '1px solid #cbd5e1', padding: '6px' }}>{row.cells.van_dung_cao.score || '-'}</td>
                <td style={{ border: '1px solid #cbd5e1', padding: '6px', color: '#64748b' }}>{row.cells.van_dung_cao.percentage ? `${row.cells.van_dung_cao.percentage}%` : '-'}</td>
                {/* Row Total */}
                <td style={{ border: '1px solid #cbd5e1', padding: '6px', fontWeight: 700, backgroundColor: '#f8fafc' }}>{row.totalQuestions}</td>
                <td style={{ border: '1px solid #cbd5e1', padding: '6px', fontWeight: 700, backgroundColor: '#f8fafc', color: '#1e40af' }}>{row.totalScore}đ</td>
                <td style={{ border: '1px solid #cbd5e1', padding: '6px', fontWeight: 700, backgroundColor: '#f8fafc' }}>{row.percentage}%</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ backgroundColor: '#eff6ff', fontWeight: 800, color: '#1e3a8a' }}>
              <td style={{ border: '1px solid #cbd5e1', padding: '8px', textAlign: 'left' }}>
                TỔNG THEO MỨC ĐỘ
              </td>
              {/* NB Total */}
              <td style={{ border: '1px solid #cbd5e1', padding: '6px' }}>{matrix.totalByLevel.nhan_biet.count}</td>
              <td style={{ border: '1px solid #cbd5e1', padding: '6px' }}>{matrix.totalByLevel.nhan_biet.score}đ</td>
              <td style={{ border: '1px solid #cbd5e1', padding: '6px' }}>{matrix.totalByLevel.nhan_biet.percentage}%</td>
              {/* TH Total */}
              <td style={{ border: '1px solid #cbd5e1', padding: '6px' }}>{matrix.totalByLevel.thong_hieu.count}</td>
              <td style={{ border: '1px solid #cbd5e1', padding: '6px' }}>{matrix.totalByLevel.thong_hieu.score}đ</td>
              <td style={{ border: '1px solid #cbd5e1', padding: '6px' }}>{matrix.totalByLevel.thong_hieu.percentage}%</td>
              {/* VD Total */}
              <td style={{ border: '1px solid #cbd5e1', padding: '6px' }}>{matrix.totalByLevel.van_dung.count}</td>
              <td style={{ border: '1px solid #cbd5e1', padding: '6px' }}>{matrix.totalByLevel.van_dung.score}đ</td>
              <td style={{ border: '1px solid #cbd5e1', padding: '6px' }}>{matrix.totalByLevel.van_dung.percentage}%</td>
              {/* VDC Total */}
              <td style={{ border: '1px solid #cbd5e1', padding: '6px' }}>{matrix.totalByLevel.van_dung_cao.count}</td>
              <td style={{ border: '1px solid #cbd5e1', padding: '6px' }}>{matrix.totalByLevel.van_dung_cao.score}đ</td>
              <td style={{ border: '1px solid #cbd5e1', padding: '6px' }}>{matrix.totalByLevel.van_dung_cao.percentage}%</td>
              {/* Grand Total */}
              <td style={{ border: '1px solid #cbd5e1', padding: '6px', color: '#1d4ed8' }}>{matrix.grandTotalQuestions}</td>
              <td style={{ border: '1px solid #cbd5e1', padding: '6px', color: '#1d4ed8' }}>{matrix.grandTotalScore}đ</td>
              <td style={{ border: '1px solid #cbd5e1', padding: '6px', color: '#1d4ed8' }}>100%</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div style={{ padding: '10px 16px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', fontSize: '0.76rem', color: '#64748b' }}>
        * Tỷ lệ các mức độ nhận thức và điểm số được tính toán tự động bằng thuật toán ràng buộc số học, cam kết khớp 100% với danh sách câu hỏi trong đề thi.
      </div>
    </div>
  );
};
