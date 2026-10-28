'use client';

import React from 'react';
import { SpecificationItem } from '@/types/exam';
import { LEVEL_NAMES } from '@/lib/matrixCalculator';

interface SpecificationTableProps {
  specifications: SpecificationItem[];
}

const QUESTION_TYPE_LABELS: Record<string, string> = {
  trac_nghiem_4: 'TN 4 lựa chọn',
  trac_nghiem_nhieu_dung: 'TN nhiều đáp án',
  dung_sai: 'TN Đúng/Sai',
  ghep_noi: 'TN Ghép nối',
  dien_khuyet: 'TN Điền khuyết',
  tra_loi_ngan: 'Trả lời ngắn',
  tu_luan_ngan: 'Tự luận ngắn',
  giai_thich: 'Giải thích',
  trinh_bay: 'Trình bày',
  giai_bai_tap: 'Giải bài tập',
  phan_tich: 'Phân tích',
  so_sanh: 'So sánh',
  chung_minh: 'Chứng minh',
  van_dung_thuc_te: 'Vận dụng thực tế',
  doc_hieu: 'Đọc hiểu',
  viet_doan_bai: 'Viết đoạn / bài',
};

export const SpecificationTable: React.FC<SpecificationTableProps> = ({ specifications }) => {
  return (
    <div style={{
      backgroundColor: '#ffffff',
      borderRadius: 12,
      border: '1px solid #e2e8f0',
      overflow: 'hidden',
      boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
    }}>
      {/* Header */}
      <div style={{
        padding: '14px 20px',
        borderBottom: '1px solid #e2e8f0',
        backgroundColor: '#f8fafc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#1e3a8a' }}>
            BẢN ĐẶC TẢ ĐỀ KIỂM TRA ĐỊNH KỲ
          </h3>
          <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#64748b' }}>
            Chi tiết yêu cầu cần đạt, đơn vị kiến thức và hình thức đánh giá
          </p>
        </div>
      </div>

      <div style={{ overflowX: 'auto', padding: 12 }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '0.82rem',
        }}>
          <thead>
            <tr style={{ backgroundColor: '#f1f5f9', color: '#1e293b', textAlign: 'center' }}>
              <th style={{ border: '1px solid #cbd5e1', padding: '8px', width: '5%' }}>TT</th>
              <th style={{ border: '1px solid #cbd5e1', padding: '8px', width: '15%' }}>Chủ đề</th>
              <th style={{ border: '1px solid #cbd5e1', padding: '8px', width: '15%' }}>Đơn vị kiến thức</th>
              <th style={{ border: '1px solid #cbd5e1', padding: '8px', width: '32%', textAlign: 'left' }}>Yêu cầu cần đạt</th>
              <th style={{ border: '1px solid #cbd5e1', padding: '8px', width: '11%' }}>Mức độ</th>
              <th style={{ border: '1px solid #cbd5e1', padding: '8px', width: '12%' }}>Dạng câu</th>
              <th style={{ border: '1px solid #cbd5e1', padding: '8px', width: '5%' }}>Số câu</th>
              <th style={{ border: '1px solid #cbd5e1', padding: '8px', width: '5%' }}>Điểm</th>
            </tr>
          </thead>
          <tbody>
            {specifications.map((item, idx) => (
              <tr key={item.id} style={{ backgroundColor: idx % 2 === 0 ? '#ffffff' : '#fafafa' }}>
                <td style={{ border: '1px solid #cbd5e1', padding: '8px', textAlign: 'center', fontWeight: 600 }}>
                  {idx + 1}
                </td>
                <td style={{ border: '1px solid #cbd5e1', padding: '8px', fontWeight: 600, color: '#1e3a8a' }}>
                  {item.topic}
                </td>
                <td style={{ border: '1px solid #cbd5e1', padding: '8px', color: '#334155' }}>
                  {item.knowledgeUnit}
                </td>
                <td style={{ border: '1px solid #cbd5e1', padding: '8px', color: '#475569', lineHeight: 1.4 }}>
                  {item.learningOutcome}
                </td>
                <td style={{ border: '1px solid #cbd5e1', padding: '8px', textAlign: 'center' }}>
                  <span style={{
                    padding: '3px 8px',
                    borderRadius: 12,
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    backgroundColor:
                      item.level === 'nhan_biet' ? '#eff6ff' :
                      item.level === 'thong_hieu' ? '#f0fdf4' :
                      item.level === 'van_dung' ? '#fffbeb' : '#fef2f2',
                    color:
                      item.level === 'nhan_biet' ? '#1e40af' :
                      item.level === 'thong_hieu' ? '#15803d' :
                      item.level === 'van_dung' ? '#b45309' : '#b91c1c',
                  }}>
                    {LEVEL_NAMES[item.level] || item.level}
                  </span>
                </td>
                <td style={{ border: '1px solid #cbd5e1', padding: '8px', textAlign: 'center', fontSize: '0.75rem', fontWeight: 500, color: '#334155' }}>
                  {QUESTION_TYPE_LABELS[item.questionType] || item.questionType}
                </td>
                <td style={{ border: '1px solid #cbd5e1', padding: '8px', textAlign: 'center', fontWeight: 700 }}>
                  {item.questionCount}
                </td>
                <td style={{ border: '1px solid #cbd5e1', padding: '8px', textAlign: 'center', fontWeight: 700, color: '#1e40af' }}>
                  {item.totalScore}đ
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ backgroundColor: '#eff6ff', fontWeight: 800, color: '#1e3a8a', textAlign: 'center' }}>
              <td colSpan={6} style={{ border: '1px solid #cbd5e1', padding: '8px', textAlign: 'right' }}>
                TỔNG CỘNG:
              </td>
              <td style={{ border: '1px solid #cbd5e1', padding: '8px' }}>
                {specifications.reduce((sum, item) => sum + item.questionCount, 0)} câu
              </td>
              <td style={{ border: '1px solid #cbd5e1', padding: '8px', color: '#1d4ed8' }}>
                {specifications.reduce((sum, item) => sum + item.totalScore, 0).toFixed(2)}đ
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};
