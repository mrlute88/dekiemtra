import { GeneratedExamPackage, SpecificationRow } from '@/types/exam';
import { formatExamTitle } from './matrixCalculator';

/**
 * Tạo mã HTML hoàn chỉnh cho Khung Ma trận và Bản đặc tả theo chuẩn thể thức văn bản Việt Nam (Nghị định 30/2020/NĐ-CP)
 * Tự động căn chỉnh khổ A4 Ngang, phông chữ Times New Roman, kẻ bảng sắc nét 100%.
 * Loại bỏ triệt để mọi nền xám/xanh ở cuối trang (toàn bộ trang trắng tinh khiết).
 */
export function generateMatrixAndSpecHtml(
  pkg: GeneratedExamPackage,
  targetSection: 'all' | 'matrix' | 'spec' = 'all',
  isPrintWindow: boolean = false
): string {
  const { config, matrix, specificationRows } = pkg;
  const specRows: SpecificationRow[] = specificationRows || [];
  const schoolName = config.schoolName || 'TRƯỜNG TH NGỌC TỐ';
  const subHeader = config.subHeader || 'UBND XÃ NGỌC TỐ';
  const academicYear = config.academicYear || '2026 - 2027';
  const subject = config.subject || 'Tin học';
  const grade = config.grade || 'Lớp 4';
  const examTitle = formatExamTitle(config.examTitle);
  const duration = config.durationMinutes || 35;

  // 1. Dòng HTML Ma trận
  interface GroupedMatrix {
    chapter: string;
    rows: typeof matrix.rows;
  }
  const matrixGroups: GroupedMatrix[] = [];
  matrix.rows.forEach(r => {
    const chapterName = r.chapter || 'Chương trình định kỳ';
    let grp = matrixGroups.find(g => g.chapter === chapterName);
    if (!grp) {
      grp = { chapter: chapterName, rows: [] };
      matrixGroups.push(grp);
    }
    grp.rows.push(r);
  });

  let matrixRowsHtml = '';
  let mCounter = 1;
  matrixGroups.forEach(grp => {
    grp.rows.forEach((row, rIdx) => {
      matrixRowsHtml += '<tr>';
      if (rIdx === 0) {
        matrixRowsHtml += `<td class="text-center font-bold" rowspan="${grp.rows.length}">${mCounter++}</td>`;
        matrixRowsHtml += `<td class="font-bold" rowspan="${grp.rows.length}">${grp.chapter}</td>`;
      }
      matrixRowsHtml += `<td>${row.subtopic || row.topic}</td>`;

      // Nhận biết
      const nbTnkq = row.cells.nhan_biet.tnkqCount ?? 0;
      const nbTnkqScore = row.cells.nhan_biet.tnkqScore ?? 0;
      const nbTl = row.cells.nhan_biet.tlCount ?? 0;
      const nbTlScore = row.cells.nhan_biet.tlScore ?? 0;
      matrixRowsHtml += `<td class="text-center">${nbTnkq > 0 ? `${nbTnkq} <br/><span class="score">(${nbTnkqScore}đ)</span>` : '-'}</td>`;
      matrixRowsHtml += `<td class="text-center">${nbTl > 0 ? `${nbTl} <br/><span class="score">(${nbTlScore}đ)</span>` : '-'}</td>`;

      // Thông hiểu
      const thTnkq = row.cells.thong_hieu.tnkqCount ?? 0;
      const thTnkqScore = row.cells.thong_hieu.tnkqScore ?? 0;
      const thTl = row.cells.thong_hieu.tlCount ?? 0;
      const thTlScore = row.cells.thong_hieu.tlScore ?? 0;
      matrixRowsHtml += `<td class="text-center">${thTnkq > 0 ? `${thTnkq} <br/><span class="score">(${thTnkqScore}đ)</span>` : '-'}</td>`;
      matrixRowsHtml += `<td class="text-center">${thTl > 0 ? `${thTl} <br/><span class="score">(${thTlScore}đ)</span>` : '-'}</td>`;

      // Vận dụng
      const vdTnkq = row.cells.van_dung.tnkqCount ?? 0;
      const vdTnkqScore = row.cells.van_dung.tnkqScore ?? 0;
      const vdTl = row.cells.van_dung.tlCount ?? 0;
      const vdTlScore = row.cells.van_dung.tlScore ?? 0;
      matrixRowsHtml += `<td class="text-center">${vdTnkq > 0 ? `${vdTnkq} <br/><span class="score">(${vdTnkqScore}đ)</span>` : '-'}</td>`;
      matrixRowsHtml += `<td class="text-center">${vdTl > 0 ? `${vdTl} <br/><span class="score">(${vdTlScore}đ)</span>` : '-'}</td>`;

      // Vận dụng cao
      const vdcTnkq = row.cells.van_dung_cao.tnkqCount ?? 0;
      const vdcTnkqScore = row.cells.van_dung_cao.tnkqScore ?? 0;
      const vdcTl = row.cells.van_dung_cao.tlCount ?? 0;
      const vdcTlScore = row.cells.van_dung_cao.tlScore ?? 0;
      matrixRowsHtml += `<td class="text-center">${vdcTnkq > 0 ? `${vdcTnkq} <br/><span class="score">(${vdcTnkqScore}đ)</span>` : '-'}</td>`;
      matrixRowsHtml += `<td class="text-center">${vdcTl > 0 ? `${vdcTl} <br/><span class="score">(${vdcTlScore}đ)</span>` : '-'}</td>`;

      // Tổng cộng dòng
      matrixRowsHtml += `<td class="text-center font-bold">${row.totalQuestions}</td>`;
      matrixRowsHtml += `<td class="text-center font-bold">${row.totalScore}đ</td>`;
      matrixRowsHtml += `<td class="text-center font-bold">${row.percentage}%</td>`;
      matrixRowsHtml += '</tr>';
    });
  });

  const totalNb = matrix.totalByLevel.nhan_biet;
  const totalTh = matrix.totalByLevel.thong_hieu;
  const totalVd = matrix.totalByLevel.van_dung;
  const totalVdc = matrix.totalByLevel.van_dung_cao;

  // 2. Dòng HTML Bản đặc tả (mỗi dòng độc lập, không dùng rowspan đa dòng để chống lỗi ngắt trang của Chrome)
  let specRowsHtml = '';
  specRows.forEach((row, idx) => {
    specRowsHtml += '<tr>';
    specRowsHtml += `<td class="text-center font-bold">${idx + 1}</td>`;
    specRowsHtml += `<td class="font-bold">${row.chapter || 'Chương / Chủ đề'}</td>`;
    specRowsHtml += `<td><strong>${row.knowledgeUnit}</strong></td>`;

    // Mức độ đánh giá
    let outcomeHtml = '<div class="outcomes-container">';
    const levels: Array<{ key: 'nhan_biet' | 'thong_hieu' | 'van_dung' | 'van_dung_cao'; label: string }> = [
      { key: 'nhan_biet', label: 'Nhận biết' },
      { key: 'thong_hieu', label: 'Thông hiểu' },
      { key: 'van_dung', label: 'Vận dụng' },
      { key: 'van_dung_cao', label: 'Vận dụng cao' },
    ];

    levels.forEach(lvl => {
      const outcomes = row.outcomesByLevel[lvl.key];
      const qCount = row.questionsByLevel[lvl.key]?.count || 0;
      if (qCount > 0 || (outcomes && outcomes.length > 0)) {
        outcomeHtml += `<div class="level-section">`;
        outcomeHtml += `<strong>* ${lvl.label}:</strong>`;
        if (outcomes && outcomes.length > 0) {
          outcomeHtml += `<ul>`;
          outcomes.forEach(o => {
            outcomeHtml += `<li>${o}</li>`;
          });
          outcomeHtml += `</ul>`;
        } else {
          outcomeHtml += `<p class="italic-desc">- Nắm vững chuẩn kiến thức kĩ năng theo Chương trình GDPT 2018.</p>`;
        }
        outcomeHtml += `</div>`;
      }
    });
    outcomeHtml += '</div>';
    specRowsHtml += `<td>${outcomeHtml}</td>`;

    // 4 cột số câu theo mức độ
    levels.forEach(lvl => {
      const qInfo = row.questionsByLevel[lvl.key];
      if (qInfo && qInfo.count > 0) {
        const parts: string[] = [];
        if (qInfo.tnkqCount > 0) parts.push(`${qInfo.tnkqCount} TN`);
        if (qInfo.tlCount > 0) parts.push(`${qInfo.tlCount} TL`);
        const label = parts.join(' + ') + ` (${qInfo.score}đ)`;
        const indicesStr = qInfo.questionIndices && qInfo.questionIndices.length > 0
          ? `<div class="q-indices">(C${qInfo.questionIndices.join(', C')})</div>`
          : '';
        specRowsHtml += `<td class="text-center font-bold">${label}${indicesStr}</td>`;
      } else {
        specRowsHtml += `<td class="text-center">-</td>`;
      }
    });

    // Tổng cộng
    specRowsHtml += `<td class="text-center font-bold">${row.totalQuestions} câu</td>`;
    specRowsHtml += `<td class="text-center font-bold">${row.totalScore}đ</td>`;
    specRowsHtml += '</tr>';
  });

  const shouldRenderMatrix = targetSection === 'all' || targetSection === 'matrix';
  const shouldRenderSpec = targetSection === 'all' || targetSection === 'spec';

  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title></title>
  <style>
    @page {
      size: A4 landscape;
      margin: 8mm 10mm 8mm 14mm; /* Chuẩn thể thức văn bản: Trái 14mm, Phải 10mm, Trên 8mm, Dưới 8mm */
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    html, body {
      margin: 0;
      padding: 0;
      background: #ffffff !important; /* XÓA BỎ HOÀN TOÀN MÀU NỀN XÁM, TRÁNH VẾT NỀN Ở ĐÁY TRANG */
      background-color: #ffffff !important;
      color: #000000;
      font-family: 'Times New Roman', Times, serif;
      font-size: 9.5pt;
      line-height: 1.25;
    }

    /* Container trang A4 Ngang (297mm x 210mm) */
    .sheet {
      width: 297mm;
      margin: 0 auto;
      background: #ffffff !important;
      background-color: #ffffff !important;
      box-shadow: none;
      padding: 8mm 10mm 8mm 14mm;
      position: relative;
    }

    /* Khung Ma trận: Vừa vặn 1 trang A4 Landscape duy nhất */
    .sheet-matrix {
      min-height: 194mm;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    .page-break-after {
      page-break-after: always;
      break-after: page;
    }

    @media print {
      html, body {
        background: #ffffff !important;
        background-color: #ffffff !important;
      }
      .sheet {
        width: 100% !important;
        min-height: 100% !important;
        margin: 0 !important;
        box-shadow: none !important;
        padding: 0 !important;
        background: #ffffff !important;
        background-color: #ffffff !important;
      }
      .sheet-matrix {
        height: 100vh !important;
        max-height: 100vh !important;
      }
      .no-print-toolbar {
        display: none !important;
      }
    }

    /* Header hành chính chuẩn Nghị định 30/2020/NĐ-CP */
    .gov-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 4px;
    }
    .gov-left {
      text-align: center;
      width: 44%;
    }
    .gov-right {
      text-align: center;
      width: 52%;
    }
    .gov-school {
      font-size: 10pt;
      font-weight: bold;
      text-transform: uppercase;
    }
    .gov-sub {
      font-size: 8.5pt;
      font-weight: 600;
      color: #1e293b;
      margin-top: 1px;
    }
    .gov-line {
      width: 80px;
      height: 1px;
      background: #000000;
      margin: 2px auto 0;
    }
    .gov-country {
      font-size: 10pt;
      font-weight: bold;
      text-transform: uppercase;
    }
    .gov-motto {
      font-size: 10.5pt;
      font-weight: bold;
      margin-top: 1px;
    }
    .gov-motto-line {
      width: 130px;
      height: 1px;
      background: #000000;
      margin: 2px auto 0;
    }

    /* Tiêu đề văn bản */
    .doc-title {
      text-align: center;
      margin: 4px 0 6px;
    }
    .doc-title h1 {
      font-size: 11.5pt;
      font-weight: bold;
      text-transform: uppercase;
      margin: 0 0 2px;
      color: #000000;
      letter-spacing: 0.5px;
    }
    .doc-title .meta {
      font-size: 9.5pt;
      font-weight: bold;
    }
    .doc-title .sub-meta {
      font-size: 8.5pt;
      font-style: italic;
      color: #333333;
    }

    /* Bảng dữ liệu khảo thí chuẩn Bộ GD&ĐT */
    table.data-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 8.5pt;
      margin-top: 4px;
      border: 1px solid #000000;
      background-color: #ffffff;
    }
    table.data-table thead {
      display: table-header-group;
    }
    table.data-table th, table.data-table td {
      border: 1px solid #000000;
      padding: 3px 4px;
      vertical-align: middle;
      line-height: 1.2;
    }
    table.data-table th {
      background-color: #f1f5f9;
      font-weight: bold;
      text-align: center;
    }
    table.data-table tr {
      page-break-inside: avoid;
      break-inside: avoid;
    }

    .text-center { text-align: center; }
    .text-left { text-align: left; }
    .text-right { text-align: right; }
    .font-bold { font-weight: bold; }
    .score { font-size: 7.5pt; color: #1e3a8a; font-weight: bold; }
    .q-indices { font-size: 7.5pt; font-style: italic; color: #475569; margin-top: 1px; }

    /* Nội dung yêu cầu cần đạt trong Bản đặc tả */
    .outcomes-container {
      font-size: 8.5pt;
      line-height: 1.25;
      text-align: left;
    }
    .level-section {
      margin-bottom: 2px;
    }
    .level-section strong {
      color: #0f172a;
      display: inline-block;
      margin-bottom: 1px;
    }
    .level-section ul {
      margin: 1px 0 2px 14px;
      padding: 0;
    }
    .level-section li {
      margin-bottom: 1px;
      text-align: justify;
    }
    .italic-desc {
      margin: 1px 0 2px;
      font-style: italic;
      color: #475569;
    }

    /* Khung chữ ký phê duyệt chuẩn Nghị định 30/2020 */
    .signature-block {
      display: flex;
      justify-content: space-between;
      margin-top: 10px;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .signature-box {
      text-align: center;
      width: 44%;
    }
    .signature-date {
      font-style: italic;
      font-size: 9pt;
      margin-bottom: 2px;
    }
    .signature-title {
      font-weight: bold;
      font-size: 9.5pt;
      text-transform: uppercase;
    }
    .signature-sub {
      font-style: italic;
      font-size: 8pt;
      color: #475569;
    }
    .signature-space {
      height: 35px;
    }

    /* Thanh nút bấm điều khiển nổi (chỉ hiện khi xem trước trang in) */
    .no-print-toolbar {
      position: fixed;
      top: 12px;
      right: 20px;
      background: #1e3a8a;
      color: #ffffff;
      padding: 10px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      z-index: 99999;
      display: flex;
      align-items: center;
      gap: 10px;
      transition: all 0.2s ease;
    }
    .no-print-toolbar:hover {
      background: #1d4ed8;
      transform: translateY(-1px);
    }
  </style>
</head>
<body>
  ${isPrintWindow ? `
  <div class="no-print-toolbar" onclick="window.print()">
    <span>🖨️ Nhấn vào đây để In / Lưu PDF (A4 Ngang)</span>
  </div>
  ` : ''}

  ${shouldRenderMatrix ? `
  <!-- ================= KHUNG MA TRẬN (VỪA VẶN TRONG 1 TRANG A4 NGANG) ================= -->
  <div class="sheet sheet-matrix ${shouldRenderSpec ? 'page-break-after' : ''}">
    <div>
      <div class="gov-header">
        <div class="gov-left">
          <div class="gov-school">${schoolName}</div>
          ${subHeader ? `<div class="gov-sub">${subHeader}</div>` : ''}
          <div class="gov-line"></div>
        </div>
        <div class="gov-right">
          <div class="gov-country">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
          <div class="gov-motto">Độc lập - Tự do - Hạnh phúc</div>
          <div class="gov-motto-line"></div>
        </div>
      </div>

      <div class="doc-title">
        <h1>KHUNG MA TRẬN ĐỀ KIỂM TRA ĐỊNH KỲ</h1>
        <div class="meta">Môn: ${subject} (${grade}) — Năm học: ${academicYear}</div>
        <div class="sub-meta">Thời gian làm bài: ${duration} phút (Không kể thời gian phát đề)</div>
      </div>

      <table class="data-table">
        <thead>
          <tr>
            <th rowspan="3" style="width: 4%;">TT<br/>(1)</th>
            <th rowspan="3" style="width: 14%;">Chương / Chủ đề<br/>(2)</th>
            <th rowspan="3" style="width: 16%;">Nội dung / đơn vị kiến thức<br/>(3)</th>
            <th colspan="8" style="width: 48%;">Mức độ nhận thức (4 - 11)</th>
            <th colspan="3" style="width: 18%;">Tổng cộng (12)</th>
          </tr>
          <tr>
            <th colspan="2">Nhận biết (${totalNb?.percentage ?? 0}%)</th>
            <th colspan="2">Thông hiểu (${totalTh?.percentage ?? 0}%)</th>
            <th colspan="2">Vận dụng (${totalVd?.percentage ?? 0}%)</th>
            <th colspan="2">Vận dụng cao (${totalVdc?.percentage ?? 0}%)</th>
            <th rowspan="2" style="width: 6%;">Số câu</th>
            <th rowspan="2" style="width: 6%;">Điểm</th>
            <th rowspan="2" style="width: 6%;">Tỉ lệ %</th>
          </tr>
          <tr>
            <th style="width: 6%;">TNKQ</th>
            <th style="width: 6%;">TL</th>
            <th style="width: 6%;">TNKQ</th>
            <th style="width: 6%;">TL</th>
            <th style="width: 6%;">TNKQ</th>
            <th style="width: 6%;">TL</th>
            <th style="width: 6%;">TNKQ</th>
            <th style="width: 6%;">TL</th>
          </tr>
        </thead>
        <tbody>
          ${matrixRowsHtml}
          <!-- Footer Row 1: Tổng số câu -->
          <tr class="font-bold" style="background-color: #f8fafc;">
            <td colspan="3" class="text-left font-bold">Tổng số câu (TNKQ / TL)</td>
            <td class="text-center font-bold">${totalNb?.tnkqCount ?? 0}</td>
            <td class="text-center font-bold">${totalNb?.tlCount ?? 0}</td>
            <td class="text-center font-bold">${totalTh?.tnkqCount ?? 0}</td>
            <td class="text-center font-bold">${totalTh?.tlCount ?? 0}</td>
            <td class="text-center font-bold">${totalVd?.tnkqCount ?? 0}</td>
            <td class="text-center font-bold">${totalVd?.tlCount ?? 0}</td>
            <td class="text-center font-bold">${totalVdc?.tnkqCount ?? 0}</td>
            <td class="text-center font-bold">${totalVdc?.tlCount ?? 0}</td>
            <td class="text-center font-bold" colspan="3">${matrix.grandTotalQuestions} câu</td>
          </tr>
          <!-- Footer Row 2: Điểm số -->
          <tr class="font-bold" style="background-color: #f8fafc;">
            <td colspan="3" class="text-left font-bold">Điểm số</td>
            <td class="text-center font-bold" colspan="2">${totalNb?.score ?? 0}đ</td>
            <td class="text-center font-bold" colspan="2">${totalTh?.score ?? 0}đ</td>
            <td class="text-center font-bold" colspan="2">${totalVd?.score ?? 0}đ</td>
            <td class="text-center font-bold" colspan="2">${totalVdc?.score ?? 0}đ</td>
            <td class="text-center font-bold" colspan="3">${matrix.grandTotalScore}đ</td>
          </tr>
          <!-- Footer Row 3: Tỉ lệ % -->
          <tr class="font-bold" style="background-color: #f8fafc;">
            <td colspan="3" class="text-left font-bold">Tỉ lệ %</td>
            <td class="text-center font-bold" colspan="2">${totalNb?.percentage ?? 0}%</td>
            <td class="text-center font-bold" colspan="2">${totalTh?.percentage ?? 0}%</td>
            <td class="text-center font-bold" colspan="2">${totalVd?.percentage ?? 0}%</td>
            <td class="text-center font-bold" colspan="2">${totalVdc?.percentage ?? 0}%</td>
            <td class="text-center font-bold" colspan="3">100%</td>
          </tr>
          <!-- Footer Row 4: Tỉ lệ chung -->
          <tr class="font-bold" style="background-color: #f1f5f9;">
            <td colspan="3" class="text-left font-bold">Tỉ lệ chung (Nhận biết + Thông hiểu / Vận dụng + VDC)</td>
            <td class="text-center font-bold" colspan="4">${matrix.summary?.knowUnderstandPercentage ?? (totalNb?.percentage ?? 0) + (totalTh?.percentage ?? 0)}%</td>
            <td class="text-center font-bold" colspan="4">${matrix.summary?.applyPercentage ?? (totalVd?.percentage ?? 0) + (totalVdc?.percentage ?? 0)}%</td>
            <td class="text-center font-bold" colspan="3">100%</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="signature-block">
      <div class="signature-box">
        <div class="signature-title">DUYỆT CỦA BAN GIÁM HIỆU / TỔ TRƯỞNG</div>
        <div class="signature-sub">(Ký và ghi rõ họ tên)</div>
        <div class="signature-space"></div>
      </div>
      <div class="signature-box">
        <div class="signature-date">Ngày ...... tháng ...... năm 202...</div>
        <div class="signature-title">GIÁO VIÊN RA ĐỀ</div>
        <div class="signature-sub">(Ký và ghi rõ họ tên)</div>
        <div class="signature-space"></div>
      </div>
    </div>
  </div>
  ` : ''}

  ${shouldRenderSpec ? `
  <!-- ================= BẢN ĐẶC TẢ MA TRẬN ĐỀ KIỂM TRA ================= -->
  <div class="sheet">
    <div class="gov-header">
      <div class="gov-left">
        <div class="gov-school">${schoolName}</div>
        ${subHeader ? `<div class="gov-sub">${subHeader}</div>` : ''}
        <div class="gov-line"></div>
      </div>
      <div class="gov-right">
        <div class="gov-country">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
        <div class="gov-motto">Độc lập - Tự do - Hạnh phúc</div>
        <div class="gov-motto-line"></div>
      </div>
    </div>

    <div class="doc-title">
      <h1>BẢN ĐẶC TẢ MA TRẬN ĐỀ KIỂM TRA ĐỊNH KỲ</h1>
      <div class="meta">Môn: ${subject} (${grade}) — Năm học: ${academicYear}</div>
      <div class="sub-meta">Bảng mô tả mức độ đánh giá và yêu cầu cần đạt theo Chương trình GDPT 2018</div>
    </div>

    <table class="data-table">
      <thead>
        <tr>
          <th rowspan="2" style="width: 4%;">TT</th>
          <th rowspan="2" style="width: 14%;">Chương / Chủ đề</th>
          <th rowspan="2" style="width: 15%;">Nội dung / Đơn vị kiến thức</th>
          <th rowspan="2" style="width: 41%;">Mức độ đánh giá (Yêu cầu cần đạt)</th>
          <th colspan="4" style="width: 18%;">Số câu hỏi theo mức độ nhận thức</th>
          <th colspan="2" style="width: 8%;">Tổng cộng</th>
        </tr>
        <tr>
          <th style="width: 4.5%;">Nhận biết</th>
          <th style="width: 4.5%;">Thông hiểu</th>
          <th style="width: 4.5%;">Vận dụng</th>
          <th style="width: 4.5%;">Vận dụng cao</th>
          <th style="width: 4%;">Số câu</th>
          <th style="width: 4%;">Điểm</th>
        </tr>
      </thead>
      <tbody>
        ${specRowsHtml}
        <tr class="font-bold" style="background-color: #f1f5f9;">
          <td colspan="4" class="text-center font-bold">TỔNG CỘNG TOÀN BỘ ĐỀ THI</td>
          <td class="text-center font-bold">${totalNb?.count ?? 0} câu<br/><span class="score">(${totalNb?.score ?? 0}đ)</span></td>
          <td class="text-center font-bold">${totalTh?.count ?? 0} câu<br/><span class="score">(${totalTh?.score ?? 0}đ)</span></td>
          <td class="text-center font-bold">${totalVd?.count ?? 0} câu<br/><span class="score">(${totalVd?.score ?? 0}đ)</span></td>
          <td class="text-center font-bold">${totalVdc?.count ?? 0} câu<br/><span class="score">(${totalVdc?.score ?? 0}đ)</span></td>
          <td class="text-center font-bold">${matrix.grandTotalQuestions} câu</td>
          <td class="text-center font-bold">${matrix.grandTotalScore}đ</td>
        </tr>
      </tbody>
    </table>

    <div class="signature-block">
      <div class="signature-box">
        <div class="signature-title">DUYỆT CỦA BAN GIÁM HIỆU / TỔ TRƯỞNG</div>
        <div class="signature-sub">(Ký và ghi rõ họ tên)</div>
        <div class="signature-space"></div>
      </div>
      <div class="signature-box">
        <div class="signature-date">Ngày ...... tháng ...... năm 202...</div>
        <div class="signature-title">GIÁO VIÊN RA ĐỀ</div>
        <div class="signature-sub">(Ký và ghi rõ họ tên)</div>
        <div class="signature-space"></div>
      </div>
    </div>
  </div>
  ` : ''}

  ${isPrintWindow ? `
  <script>
    window.addEventListener('DOMContentLoaded', () => {
      document.title = '';
      setTimeout(() => {
        window.print();
      }, 500);
    });
  </script>
  ` : ''}
</body>
</html>`;
}

/**
 * Mở cửa sổ in ấn A4 (dùng cho nút "In A4")
 */
export function exportMatrixAndSpecToPdf(
  pkg: GeneratedExamPackage,
  targetSection: 'all' | 'matrix' | 'spec' = 'all'
) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Trình duyệt đã chặn cửa sổ bật lên. Vui lòng cho phép popup để mở trang in.');
    return;
  }

  const fullHtml = generateMatrixAndSpecHtml(pkg, targetSection, true);
  printWindow.document.open();
  printWindow.document.write(fullHtml);
  printWindow.document.close();
}

/**
 * TẠO VÀ TẢI TRỰC TIẾP FILE PDF BẰNG HTML2PDF NGAY TRÊN TRÌNH DUYỆT (CLIENT-SIDE)
 * Đảm bảo 100% hoạt động độc lập không cần máy chủ Chrome (hoàn hảo cho Vercel / Cloud / Máy khách)
 */
async function exportWithClientSideHtml2Pdf(
  pkg: GeneratedExamPackage,
  filename: string,
  targetSection: 'all' | 'matrix' | 'spec' = 'all'
): Promise<void> {
  const html2pdf = (await import('html2pdf.js')).default;
  const htmlContent = generateMatrixAndSpecHtml(pkg, targetSection, false);

  // 1. Tạo phần tử wrapper ẩn ngoài màn hình nhưng nằm trong DOM chính để thừa hưởng font và styles
  const wrapper = document.createElement('div');
  wrapper.id = 'pdf-export-wrapper';
  wrapper.style.position = 'absolute';
  wrapper.style.top = '0';
  wrapper.style.left = '0';
  wrapper.style.width = '297mm';
  wrapper.style.background = '#ffffff';
  wrapper.style.zIndex = '-9999';
  wrapper.style.pointerEvents = 'none';

  // Phân tích HTML để lấy <style> và các khối .sheet
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, 'text/html');

  // Trích xuất các thẻ <style>
  const styles = doc.querySelectorAll('style');
  styles.forEach((st) => wrapper.appendChild(st.cloneNode(true)));

  // Trích xuất các khối trang .sheet
  const sheets = doc.querySelectorAll('.sheet');
  const container = document.createElement('div');
  container.style.width = '297mm';
  container.style.margin = '0 auto';
  container.style.background = '#ffffff';

  sheets.forEach((sheet, idx) => {
    const clone = sheet.cloneNode(true) as HTMLElement;
    clone.style.margin = '0';
    clone.style.width = '297mm';
    clone.style.boxSizing = 'border-box';
    if (idx < sheets.length - 1) {
      clone.classList.add('html2pdf__page-break');
    }
    container.appendChild(clone);
  });

  wrapper.appendChild(container);
  document.body.appendChild(wrapper);

  // Đợi DOM cập nhật và render font
  await new Promise((resolve) => setTimeout(resolve, 350));

  const opt = {
    margin: 0,
    filename: filename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      letterRendering: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: 1200,
    },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' as const },
    pagebreak: { mode: ['css', 'legacy'], after: '.html2pdf__page-break' },
  };

  try {
    // @ts-ignore
    await html2pdf().from(container).set(opt).save();
  } finally {
    if (document.body.contains(wrapper)) {
      document.body.removeChild(wrapper);
    }
  }
}

/**
 * TẢI TRỰC TIẾP FILE PDF VỀ MÁY TÍNH (KHÔNG MỞ TRANG IN)
 * Hoạt động mượt mà 100% trên cả bản Online (Vercel Serverless) lẫn Local máy tính
 */
export async function downloadMatrixAndSpecPdf(
  pkg: GeneratedExamPackage,
  targetSection: 'all' | 'matrix' | 'spec' = 'all'
): Promise<void> {
  const subjectClean = (pkg.config.subject || 'Tin_hoc').replace(/\s+/g, '_');
  const gradeClean = (pkg.config.grade || 'Lop_4').replace(/\s+/g, '_');
  const filename = `Ma_tran_va_Ban_dac_ta_${subjectClean}_${gradeClean}.pdf`;

  // 1. Nếu đang chạy ở môi trường localhost/local dev, thử gọi qua API server trước (nhanh và chuẩn native PDF)
  const isLocalhost =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

  if (isLocalhost) {
    try {
      const html = generateMatrixAndSpecHtml(pkg, targetSection, false);
      const res = await fetch('/api/export-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          html,
          filename,
        }),
      });

      if (res.ok) {
        const blob = await res.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        const downloadAnchor = document.createElement('a');
        downloadAnchor.href = blobUrl;
        downloadAnchor.download = filename;
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        document.body.removeChild(downloadAnchor);
        window.URL.revokeObjectURL(blobUrl);
        return;
      }
    } catch {
      // Nếu API backend không khả dụng, tự động chuyển sang client-side
    }
  }

  // 2. Môi trường Online (Vercel / Cloud) hoặc khi server không có sẵn Chrome:
  // Tự động tạo và tải trực tiếp file PDF chất lượng cao ngay trên trình duyệt máy khách (Client-Side)
  try {
    await exportWithClientSideHtml2Pdf(pkg, filename, targetSection);
  } catch (clientErr: any) {
    console.error('Lỗi khi tạo PDF client-side:', clientErr);
    // Nếu cả client-side cũng không hỗ trợ (trình duyệt quá cũ), mở cửa sổ in dự phòng
    const retryPrint = confirm(
      'Không thể tải trực tiếp file PDF trên trình duyệt này. Bạn có muốn mở cửa sổ in để lưu PDF thay thế không?'
    );
    if (retryPrint) {
      exportMatrixAndSpecToPdf(pkg, targetSection);
    }
  }
}
