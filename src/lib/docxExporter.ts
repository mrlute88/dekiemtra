import { Document, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, HeadingLevel, BorderStyle, Packer } from 'docx';
import { GeneratedExamPackage, Question } from '@/types/exam';
import { buildSpecificationRowsFromQuestions, formatExamTitle } from './matrixCalculator';

// Cỡ chữ chuẩn Nghị định 30/2020/NĐ-CP (docx size tính theo half-points: 13pt = 26, 14pt = 28)
const FONT_NAME = 'Times New Roman';

export async function exportExamToWord(
  pkg: GeneratedExamPackage, 
  selectedCode: string = '101', 
  fontSizePt: 13 | 14 = 13
) {
  const currentVariant = pkg.variantCodes[selectedCode] || { code: '101', questions: pkg.questions };
  const config = pkg.config;

  const FONT_SIZE_BASE = fontSizePt === 14 ? 28 : 26; // 13pt = 26, 14pt = 28
  const FONT_SIZE_TITLE = fontSizePt === 14 ? 30 : 28;
  const FONT_SIZE_SMALL = fontSizePt === 14 ? 26 : 24;

  // Header Table (Thông tin trường bên trái, thông tin đề thi bên phải)
  const leftCellParagraphs: Paragraph[] = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({ 
          text: (config.schoolName || 'TRƯỜNG TH NGỌC TỐ').toUpperCase(), 
          bold: true, 
          size: FONT_SIZE_BASE, 
          font: FONT_NAME 
        }),
      ],
    }),
  ];

  // Nếu có nhập đơn vị trực thuộc / cấp học thì mới hiển thị, không mặc định hiển thị "TRƯỜNG PHỔ THÔNG"
  if (config.subHeader && config.subHeader.trim() !== '') {
    leftCellParagraphs.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({ 
            text: config.subHeader, 
            size: FONT_SIZE_SMALL, 
            font: FONT_NAME 
          }),
        ],
      })
    );
  }

  leftCellParagraphs.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({ 
          text: `Năm học: ${config.academicYear || '2026 - 2027'}`, 
          size: FONT_SIZE_SMALL, 
          italics: true, 
          font: FONT_NAME 
        }),
      ],
    })
  );

  const tableHeader = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.NONE },
              bottom: { style: BorderStyle.NONE },
              left: { style: BorderStyle.NONE },
              right: { style: BorderStyle.NONE },
            },
            children: leftCellParagraphs,
          }),
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.NONE },
              bottom: { style: BorderStyle.NONE },
              left: { style: BorderStyle.NONE },
              right: { style: BorderStyle.NONE },
            },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ 
                    text: formatExamTitle(config.examTitle || 'ĐỀ KIỂM TRA ĐỊNH KỲ').toUpperCase(), 
                    bold: true, 
                    size: FONT_SIZE_TITLE, 
                    color: '1E3A8A', 
                    font: FONT_NAME 
                  }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ 
                    text: `Môn: ${config.subject} - ${config.grade}`, 
                    bold: true, 
                    size: FONT_SIZE_BASE, 
                    font: FONT_NAME 
                  }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ 
                    text: `Thời gian làm bài: ${config.durationMinutes} phút (Không kể phát đề)`, 
                    italics: true, 
                    size: FONT_SIZE_SMALL, 
                    font: FONT_NAME 
                  }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ 
                    text: `MÃ ĐỀ: ${currentVariant.code}`, 
                    bold: true, 
                    size: FONT_SIZE_BASE, 
                    color: 'DC2626', 
                    font: FONT_NAME 
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });

  const studentInfo = [
    new Paragraph({
      spacing: { before: 200, after: 140 },
      children: [
        new TextRun({ 
          text: 'Họ và tên học sinh: ............................................................................   Lớp: ........................   SBD: ........................', 
          size: FONT_SIZE_SMALL, 
          italics: true, 
          font: FONT_NAME 
        }),
      ],
    }),
  ];

  // Khung điểm bài kiểm tra & lời nhận xét của giáo viên chuẩn Bộ GD&ĐT
  const scoreTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 8, color: '000000' },
      bottom: { style: BorderStyle.SINGLE, size: 8, color: '000000' },
      left: { style: BorderStyle.SINGLE, size: 8, color: '000000' },
      right: { style: BorderStyle.SINGLE, size: 8, color: '000000' },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
      insideVertical: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 35, type: WidthType.PERCENTAGE },
            margins: { top: 120, bottom: 120, left: 150, right: 150 },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: 'ĐIỂM BÀI KIỂM TRA', bold: true, size: FONT_SIZE_SMALL, font: FONT_NAME }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 60, after: 180 },
                children: [
                  new TextRun({ text: 'Bằng số: ..........   Bằng chữ: ..........', italics: true, size: FONT_SIZE_SMALL - 2, font: FONT_NAME }),
                ],
              }),
            ],
          }),
          new TableCell({
            width: { size: 65, type: WidthType.PERCENTAGE },
            margins: { top: 120, bottom: 120, left: 150, right: 150 },
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: 'LỜI NHẬN XÉT CỦA GIÁO VIÊN:', bold: true, size: FONT_SIZE_SMALL, font: FONT_NAME }),
                ],
              }),
              new Paragraph({
                spacing: { before: 60, after: 180 },
                children: [new TextRun({ text: '' })],
              }),
            ],
          }),
        ],
      }),
    ],
  });

  // Questions rendering
  const questionParagraphs: Paragraph[] = [];
  currentVariant.questions.forEach((q, idx) => {
    // Xóa tiền tố mức độ nhận thức (nếu có trong nội dung câu hỏi)
    const cleanedQuestion = q.question
      .replace(/^\[(Nhận biết|Thông hiểu|Vận dụng cao|Vận dụng|NB|TH|VD|VDC)\]\s*:?\s*/i, '')
      .trim();

    // Tiêu đề câu hỏi: Không kèm [Nhận biết], [Thông hiểu], [Vận dụng]
    questionParagraphs.push(
      new Paragraph({
        spacing: { before: 240, after: 120 },
        children: [
          new TextRun({ 
            text: `Câu ${idx + 1} (${q.score} điểm): `, 
            bold: true, 
            size: FONT_SIZE_BASE, 
            font: FONT_NAME 
          }),
          new TextRun({ 
            text: cleanedQuestion, 
            size: FONT_SIZE_BASE, 
            font: FONT_NAME 
          }),
        ],
      })
    );

    // Options for MCQ
    if (q.options && q.options.length > 0) {
      const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
      q.options.forEach((opt, optIdx) => {
        const cleanOpt = opt.replace(/^[A-Z]\.\s*/i, '').trim();
        questionParagraphs.push(
          new Paragraph({
            spacing: { before: 60, after: 60 },
            indent: { left: 400 },
            children: [
              new TextRun({ 
                text: `${letters[optIdx]}. `, 
                bold: true, 
                size: FONT_SIZE_BASE, 
                font: FONT_NAME 
              }),
              new TextRun({ 
                text: cleanOpt, 
                size: FONT_SIZE_BASE, 
                font: FONT_NAME 
              }),
            ],
          })
        );
      });
    }

    // Matching pairs if any
    if (q.matchingPairs && q.matchingPairs.length > 0) {
      q.matchingPairs.forEach((pair, pairIdx) => {
        questionParagraphs.push(
          new Paragraph({
            indent: { left: 400 },
            children: [
              new TextRun({ 
                text: `${pairIdx + 1}. ${pair.left}  <---->  ${pair.right}`, 
                italics: true, 
                size: FONT_SIZE_BASE, 
                font: FONT_NAME 
              }),
            ],
          })
        );
      });
    }
  });

  const footerDisclaimer = [
    new Paragraph({
      spacing: { before: 400 },
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({ 
          text: '--- HẾT ---', 
          bold: true, 
          size: FONT_SIZE_BASE, 
          font: FONT_NAME 
        }),
      ],
    }),
    new Paragraph({
      spacing: { before: 100, after: 100 },
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({ 
          text: 'Cán bộ coi thi không giải thích gì thêm.', 
          italics: true, 
          size: FONT_SIZE_SMALL, 
          font: FONT_NAME 
        }),
      ],
    }),
  ];

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [tableHeader, ...studentInfo, scoreTable, ...questionParagraphs, ...footerDisclaimer],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  downloadBlob(blob, `De_kiem_tra_${config.subject}_${config.grade}_Ma${currentVariant.code}.docx`);
}

export async function exportAnswerKeyToWord(
  pkg: GeneratedExamPackage, 
  selectedCode: string = '101', 
  fontSizePt: 13 | 14 = 13
) {
  const currentVariant = pkg.variantCodes[selectedCode] || { code: '101', questions: pkg.questions };
  const config = pkg.config;

  const FONT_SIZE_BASE = fontSizePt === 14 ? 28 : 26; // 13pt = 26, 14pt = 28

  const header = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({ 
          text: `ĐÁP ÁN & HƯỚNG DẪN CHẤM`, 
          bold: true, 
          size: 30, 
          color: '1E3A8A', 
          font: FONT_NAME 
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 300 },
      children: [
        new TextRun({ 
          text: `${formatExamTitle(config.examTitle)} - Môn: ${config.subject} (${config.grade}) - MÃ ĐỀ: ${currentVariant.code}`, 
          bold: true, 
          size: FONT_SIZE_BASE, 
          font: FONT_NAME 
        }),
      ],
    }),
  ];

  // Table of answers
  const tableRows: TableRow[] = [
    new TableRow({
      children: [
        new TableCell({ 
          width: { size: 15, type: WidthType.PERCENTAGE }, 
          children: [new Paragraph({ children: [new TextRun({ text: 'Câu', bold: true, size: FONT_SIZE_BASE, font: FONT_NAME })] })] 
        }),
        new TableCell({ 
          width: { size: 25, type: WidthType.PERCENTAGE }, 
          children: [new Paragraph({ children: [new TextRun({ text: 'Đáp án đúng', bold: true, size: FONT_SIZE_BASE, font: FONT_NAME })] })] 
        }),
        new TableCell({ 
          width: { size: 15, type: WidthType.PERCENTAGE }, 
          children: [new Paragraph({ children: [new TextRun({ text: 'Điểm', bold: true, size: FONT_SIZE_BASE, font: FONT_NAME })] })] 
        }),
        new TableCell({ 
          width: { size: 45, type: WidthType.PERCENTAGE }, 
          children: [new Paragraph({ children: [new TextRun({ text: 'Hướng dẫn giải chi tiết', bold: true, size: FONT_SIZE_BASE, font: FONT_NAME })] })] 
        }),
      ],
    }),
  ];

  currentVariant.questions.forEach((q, idx) => {
    const ansText = Array.isArray(q.correctAnswer) ? q.correctAnswer.join(', ') : String(q.correctAnswer || '');
    tableRows.push(
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `${idx + 1}`, size: FONT_SIZE_BASE, font: FONT_NAME })] })] }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: ansText, bold: true, size: FONT_SIZE_BASE, color: '1E40AF', font: FONT_NAME })] })] }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `${q.score}`, size: FONT_SIZE_BASE, font: FONT_NAME })] })] }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: q.explanation || 'Theo chuẩn đáp án.', size: FONT_SIZE_BASE, font: FONT_NAME })] })] }),
        ],
      })
    );
  });

  const answerTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: tableRows,
  });

  const doc = new Document({
    sections: [
      {
        children: [...header, answerTable],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  downloadBlob(blob, `Dap_an_${config.subject}_${config.grade}_Ma${currentVariant.code}.docx`);
}

export async function exportMatrixAndSpecToWord(
  pkg: GeneratedExamPackage,
  fontSizePt: 13 | 14 = 13
) {
  const config = pkg.config;
  const matrix = pkg.matrix;
  const FONT_SIZE_BASE = fontSizePt === 14 ? 26 : 24; // smaller for dense tables: 12pt = 24
  const FONT_SIZE_TITLE = 28;
  const FONT_SIZE_SUBTITLE = 24;

  const cellBorder = {
    top: { style: BorderStyle.SINGLE, size: 1, color: '666666' },
    bottom: { style: BorderStyle.SINGLE, size: 1, color: '666666' },
    left: { style: BorderStyle.SINGLE, size: 1, color: '666666' },
    right: { style: BorderStyle.SINGLE, size: 1, color: '666666' },
  };

  // ================= 1. KHUNG MA TRẬN ĐỀ =================
  const matrixTitleParagraphs: Paragraph[] = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: (config.schoolName || 'TRƯỜNG TH NGỌC TỐ').toUpperCase(),
          bold: true,
          size: FONT_SIZE_BASE,
          font: FONT_NAME,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 150 },
      children: [
        new TextRun({
          text: `Năm học: ${config.academicYear || '2026 - 2027'}`,
          italics: true,
          size: FONT_SIZE_BASE - 2,
          font: FONT_NAME,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: 'KHUNG MA TRẬN ĐỀ KIỂM TRA ĐỊNH KỲ',
          bold: true,
          size: FONT_SIZE_TITLE,
          color: '1E3A8A',
          font: FONT_NAME,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: `Môn: ${config.subject} (${config.grade}) — Thời gian làm bài: ${config.durationMinutes} phút`,
          bold: true,
          size: FONT_SIZE_SUBTITLE,
          font: FONT_NAME,
        }),
      ],
    }),
  ];

  // Matrix Table Header Rows
  const matrixHeaderRows: TableRow[] = [
    // Header Row 1
    new TableRow({
      children: [
        new TableCell({
          borders: cellBorder,
          rowSpan: 3,
          width: { size: 5, type: WidthType.PERCENTAGE },
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'TT\n(1)', bold: true, size: FONT_SIZE_BASE, font: FONT_NAME })] })],
        }),
        new TableCell({
          borders: cellBorder,
          rowSpan: 3,
          width: { size: 18, type: WidthType.PERCENTAGE },
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Chương / chủ đề\n(2)', bold: true, size: FONT_SIZE_BASE, font: FONT_NAME })] })],
        }),
        new TableCell({
          borders: cellBorder,
          rowSpan: 3,
          width: { size: 20, type: WidthType.PERCENTAGE },
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Nội dung / đơn vị kiến thức\n(3)', bold: true, size: FONT_SIZE_BASE, font: FONT_NAME })] })],
        }),
        new TableCell({
          borders: cellBorder,
          columnSpan: 8,
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Mức độ nhận thức (4-11)', bold: true, size: FONT_SIZE_BASE, font: FONT_NAME })] })],
        }),
        new TableCell({
          borders: cellBorder,
          rowSpan: 2,
          columnSpan: 3,
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Tổng cộng (12)', bold: true, size: FONT_SIZE_BASE, font: FONT_NAME })] })],
        }),
      ],
    }),
    // Header Row 2
    new TableRow({
      children: [
        new TableCell({
          borders: cellBorder,
          columnSpan: 2,
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `Nhận biết (${matrix.totalByLevel?.nhan_biet?.percentage ?? 40}%)`, bold: true, size: FONT_SIZE_BASE, font: FONT_NAME })] })],
        }),
        new TableCell({
          borders: cellBorder,
          columnSpan: 2,
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `Thông hiểu (${matrix.totalByLevel?.thong_hieu?.percentage ?? 30}%)`, bold: true, size: FONT_SIZE_BASE, font: FONT_NAME })] })],
        }),
        new TableCell({
          borders: cellBorder,
          columnSpan: 2,
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `Vận dụng (${matrix.totalByLevel?.van_dung?.percentage ?? 20}%)`, bold: true, size: FONT_SIZE_BASE, font: FONT_NAME })] })],
        }),
        new TableCell({
          borders: cellBorder,
          columnSpan: 2,
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `Vận dụng cao (${matrix.totalByLevel?.van_dung_cao?.percentage ?? 10}%)`, bold: true, size: FONT_SIZE_BASE, font: FONT_NAME })] })],
        }),
      ],
    }),
    // Header Row 3
    new TableRow({
      children: [
        new TableCell({ borders: cellBorder, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'TNKQ', bold: true, size: FONT_SIZE_BASE, font: FONT_NAME })] })] }),
        new TableCell({ borders: cellBorder, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'TL', bold: true, size: FONT_SIZE_BASE, font: FONT_NAME })] })] }),
        new TableCell({ borders: cellBorder, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'TNKQ', bold: true, size: FONT_SIZE_BASE, font: FONT_NAME })] })] }),
        new TableCell({ borders: cellBorder, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'TL', bold: true, size: FONT_SIZE_BASE, font: FONT_NAME })] })] }),
        new TableCell({ borders: cellBorder, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'TNKQ', bold: true, size: FONT_SIZE_BASE, font: FONT_NAME })] })] }),
        new TableCell({ borders: cellBorder, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'TL', bold: true, size: FONT_SIZE_BASE, font: FONT_NAME })] })] }),
        new TableCell({ borders: cellBorder, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'TNKQ', bold: true, size: FONT_SIZE_BASE, font: FONT_NAME })] })] }),
        new TableCell({ borders: cellBorder, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'TL', bold: true, size: FONT_SIZE_BASE, font: FONT_NAME })] })] }),
        new TableCell({ borders: cellBorder, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Số câu', bold: true, size: FONT_SIZE_BASE, font: FONT_NAME })] })] }),
        new TableCell({ borders: cellBorder, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Điểm', bold: true, size: FONT_SIZE_BASE, font: FONT_NAME })] })] }),
        new TableCell({ borders: cellBorder, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: '%', bold: true, size: FONT_SIZE_BASE, font: FONT_NAME })] })] }),
      ],
    }),
  ];

  // Matrix Data Rows
  const matrixDataRows: TableRow[] = matrix.rows.map((row, idx) => {
    return new TableRow({
      children: [
        new TableCell({ borders: cellBorder, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `${idx + 1}`, size: FONT_SIZE_BASE, font: FONT_NAME })] })] }),
        new TableCell({ borders: cellBorder, children: [new Paragraph({ children: [new TextRun({ text: row.chapter || row.topic, bold: true, size: FONT_SIZE_BASE, font: FONT_NAME })] })] }),
        new TableCell({ borders: cellBorder, children: [new Paragraph({ children: [new TextRun({ text: row.topic, size: FONT_SIZE_BASE, font: FONT_NAME })] })] }),
        // NB
        new TableCell({ borders: cellBorder, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: row.cells.nhan_biet.tnkqCount ? `${row.cells.nhan_biet.tnkqCount}` : '', size: FONT_SIZE_BASE, font: FONT_NAME })] })] }),
        new TableCell({ borders: cellBorder, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: row.cells.nhan_biet.tlCount ? `${row.cells.nhan_biet.tlCount}` : '', size: FONT_SIZE_BASE, font: FONT_NAME })] })] }),
        // TH
        new TableCell({ borders: cellBorder, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: row.cells.thong_hieu.tnkqCount ? `${row.cells.thong_hieu.tnkqCount}` : '', size: FONT_SIZE_BASE, font: FONT_NAME })] })] }),
        new TableCell({ borders: cellBorder, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: row.cells.thong_hieu.tlCount ? `${row.cells.thong_hieu.tlCount}` : '', size: FONT_SIZE_BASE, font: FONT_NAME })] })] }),
        // VD
        new TableCell({ borders: cellBorder, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: row.cells.van_dung.tnkqCount ? `${row.cells.van_dung.tnkqCount}` : '', size: FONT_SIZE_BASE, font: FONT_NAME })] })] }),
        new TableCell({ borders: cellBorder, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: row.cells.van_dung.tlCount ? `${row.cells.van_dung.tlCount}` : '', size: FONT_SIZE_BASE, font: FONT_NAME })] })] }),
        // VDC
        new TableCell({ borders: cellBorder, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: row.cells.van_dung_cao.tnkqCount ? `${row.cells.van_dung_cao.tnkqCount}` : '', size: FONT_SIZE_BASE, font: FONT_NAME })] })] }),
        new TableCell({ borders: cellBorder, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: row.cells.van_dung_cao.tlCount ? `${row.cells.van_dung_cao.tlCount}` : '', size: FONT_SIZE_BASE, font: FONT_NAME })] })] }),
        // Total
        new TableCell({ borders: cellBorder, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `${row.totalQuestions}`, bold: true, size: FONT_SIZE_BASE, font: FONT_NAME })] })] }),
        new TableCell({ borders: cellBorder, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `${row.totalScore}đ`, bold: true, size: FONT_SIZE_BASE, font: FONT_NAME })] })] }),
        new TableCell({ borders: cellBorder, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `${row.percentage}%`, size: FONT_SIZE_BASE, font: FONT_NAME })] })] }),
      ],
    });
  });

  // Matrix Footer Rows
  const matrixFooterRows: TableRow[] = [
    // 1. Tổng số câu
    new TableRow({
      children: [
        new TableCell({ borders: cellBorder, columnSpan: 3, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: 'Tổng số câu', bold: true, size: FONT_SIZE_BASE, font: FONT_NAME })] })] }),
        new TableCell({ borders: cellBorder, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `${matrix.totalByLevel.nhan_biet.tnkqCount || ''}`, bold: true, size: FONT_SIZE_BASE, font: FONT_NAME })] })] }),
        new TableCell({ borders: cellBorder, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `${matrix.totalByLevel.nhan_biet.tlCount || ''}`, bold: true, size: FONT_SIZE_BASE, font: FONT_NAME })] })] }),
        new TableCell({ borders: cellBorder, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `${matrix.totalByLevel.thong_hieu.tnkqCount || ''}`, bold: true, size: FONT_SIZE_BASE, font: FONT_NAME })] })] }),
        new TableCell({ borders: cellBorder, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `${matrix.totalByLevel.thong_hieu.tlCount || ''}`, bold: true, size: FONT_SIZE_BASE, font: FONT_NAME })] })] }),
        new TableCell({ borders: cellBorder, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `${matrix.totalByLevel.van_dung.tnkqCount || ''}`, bold: true, size: FONT_SIZE_BASE, font: FONT_NAME })] })] }),
        new TableCell({ borders: cellBorder, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `${matrix.totalByLevel.van_dung.tlCount || ''}`, bold: true, size: FONT_SIZE_BASE, font: FONT_NAME })] })] }),
        new TableCell({ borders: cellBorder, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `${matrix.totalByLevel.van_dung_cao.tnkqCount || ''}`, bold: true, size: FONT_SIZE_BASE, font: FONT_NAME })] })] }),
        new TableCell({ borders: cellBorder, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `${matrix.totalByLevel.van_dung_cao.tlCount || ''}`, bold: true, size: FONT_SIZE_BASE, font: FONT_NAME })] })] }),
        new TableCell({ borders: cellBorder, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `${matrix.grandTotalQuestions}`, bold: true, size: FONT_SIZE_BASE, font: FONT_NAME })] })] }),
        new TableCell({ borders: cellBorder, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `${matrix.grandTotalScore}đ`, bold: true, size: FONT_SIZE_BASE, font: FONT_NAME })] })] }),
        new TableCell({ borders: cellBorder, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: '100%', bold: true, size: FONT_SIZE_BASE, font: FONT_NAME })] })] }),
      ],
    }),
    // 2. Tỉ lệ %
    new TableRow({
      children: [
        new TableCell({ borders: cellBorder, columnSpan: 3, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: 'Tỉ lệ %', bold: true, size: FONT_SIZE_BASE, font: FONT_NAME })] })] }),
        new TableCell({ borders: cellBorder, columnSpan: 2, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `${matrix.totalByLevel.nhan_biet.percentage}%`, bold: true, size: FONT_SIZE_BASE, font: FONT_NAME })] })] }),
        new TableCell({ borders: cellBorder, columnSpan: 2, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `${matrix.totalByLevel.thong_hieu.percentage}%`, bold: true, size: FONT_SIZE_BASE, font: FONT_NAME })] })] }),
        new TableCell({ borders: cellBorder, columnSpan: 2, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `${matrix.totalByLevel.van_dung.percentage}%`, bold: true, size: FONT_SIZE_BASE, font: FONT_NAME })] })] }),
        new TableCell({ borders: cellBorder, columnSpan: 2, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `${matrix.totalByLevel.van_dung_cao.percentage}%`, bold: true, size: FONT_SIZE_BASE, font: FONT_NAME })] })] }),
        new TableCell({ borders: cellBorder, columnSpan: 3, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: '100%', bold: true, size: FONT_SIZE_BASE, font: FONT_NAME })] })] }),
      ],
    }),
    // 3. Tỉ lệ chung
    new TableRow({
      children: [
        new TableCell({ borders: cellBorder, columnSpan: 3, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: 'Tỉ lệ chung', bold: true, size: FONT_SIZE_BASE, font: FONT_NAME })] })] }),
        new TableCell({ borders: cellBorder, columnSpan: 4, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `Nhận biết + Thông hiểu: ${matrix.summary?.knowUnderstandPercentage ?? 70}%`, bold: true, size: FONT_SIZE_BASE, font: FONT_NAME })] })] }),
        new TableCell({ borders: cellBorder, columnSpan: 4, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `Vận dụng + VDC: ${matrix.summary?.applyPercentage ?? 30}%`, bold: true, size: FONT_SIZE_BASE, font: FONT_NAME })] })] }),
        new TableCell({ borders: cellBorder, columnSpan: 3, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: '100%', bold: true, size: FONT_SIZE_BASE, font: FONT_NAME })] })] }),
      ],
    }),
  ];

  const matrixTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [...matrixHeaderRows, ...matrixDataRows, ...matrixFooterRows],
  });

  // ================= 2. BẢN ĐẶC TẢ ĐỀ =================
  const specRows = buildSpecificationRowsFromQuestions(pkg.questions);

  const specTitleParagraphs: Paragraph[] = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 350, after: 80 },
      children: [
        new TextRun({
          text: 'BẢN ĐẶC TẢ ĐỀ KIỂM TRA ĐỊNH KỲ',
          bold: true,
          size: FONT_SIZE_TITLE,
          color: '1E3A8A',
          font: FONT_NAME,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: `Môn: ${config.subject} (${config.grade}) — Thang điểm: ${config.maxScore || 10}đ`,
          bold: true,
          size: FONT_SIZE_SUBTITLE,
          font: FONT_NAME,
        }),
      ],
    }),
  ];

  // Spec Table Header
  const specHeaderRows: TableRow[] = [
    new TableRow({
      children: [
        new TableCell({
          borders: cellBorder,
          rowSpan: 2,
          width: { size: 5, type: WidthType.PERCENTAGE },
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'TT\n(1)', bold: true, size: FONT_SIZE_BASE, font: FONT_NAME })] })],
        }),
        new TableCell({
          borders: cellBorder,
          rowSpan: 2,
          width: { size: 16, type: WidthType.PERCENTAGE },
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Chương / Chủ đề\n(2)', bold: true, size: FONT_SIZE_BASE, font: FONT_NAME })] })],
        }),
        new TableCell({
          borders: cellBorder,
          rowSpan: 2,
          width: { size: 16, type: WidthType.PERCENTAGE },
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Nội dung / Đơn vị kiến thức\n(3)', bold: true, size: FONT_SIZE_BASE, font: FONT_NAME })] })],
        }),
        new TableCell({
          borders: cellBorder,
          rowSpan: 2,
          width: { size: 38, type: WidthType.PERCENTAGE },
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Mức độ đánh giá (Yêu cầu cần đạt)\n(4)', bold: true, size: FONT_SIZE_BASE, font: FONT_NAME })] })],
        }),
        new TableCell({
          borders: cellBorder,
          columnSpan: 4,
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Số câu hỏi theo mức độ nhận thức (5-8)', bold: true, size: FONT_SIZE_BASE, font: FONT_NAME })] })],
        }),
        new TableCell({
          borders: cellBorder,
          rowSpan: 2,
          width: { size: 9, type: WidthType.PERCENTAGE },
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Tổng cộng', bold: true, size: FONT_SIZE_BASE, font: FONT_NAME })] })],
        }),
      ],
    }),
    new TableRow({
      children: [
        new TableCell({ borders: cellBorder, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Nhận biết', bold: true, size: FONT_SIZE_BASE, font: FONT_NAME })] })] }),
        new TableCell({ borders: cellBorder, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Thông hiểu', bold: true, size: FONT_SIZE_BASE, font: FONT_NAME })] })] }),
        new TableCell({ borders: cellBorder, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Vận dụng', bold: true, size: FONT_SIZE_BASE, font: FONT_NAME })] })] }),
        new TableCell({ borders: cellBorder, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Vận dụng cao', bold: true, size: FONT_SIZE_BASE, font: FONT_NAME })] })] }),
      ],
    }),
  ];

  // Spec Table Data Rows
  const specDataRows: TableRow[] = specRows.map((row, idx) => {
    // Build learning outcome paragraphs
    const outcomeParagraphs: Paragraph[] = [];
    if (row.outcomesByLevel.nhan_biet.length > 0) {
      outcomeParagraphs.push(new Paragraph({ children: [new TextRun({ text: 'Nhận biết:', bold: true, size: FONT_SIZE_BASE, font: FONT_NAME })] }));
      row.outcomesByLevel.nhan_biet.forEach(out => {
        outcomeParagraphs.push(new Paragraph({ bullet: { level: 0 }, children: [new TextRun({ text: out, size: FONT_SIZE_BASE - 2, font: FONT_NAME })] }));
      });
    }
    if (row.outcomesByLevel.thong_hieu.length > 0) {
      outcomeParagraphs.push(new Paragraph({ children: [new TextRun({ text: 'Thông hiểu:', bold: true, size: FONT_SIZE_BASE, font: FONT_NAME })] }));
      row.outcomesByLevel.thong_hieu.forEach(out => {
        outcomeParagraphs.push(new Paragraph({ bullet: { level: 0 }, children: [new TextRun({ text: out, size: FONT_SIZE_BASE - 2, font: FONT_NAME })] }));
      });
    }
    if (row.outcomesByLevel.van_dung.length > 0) {
      outcomeParagraphs.push(new Paragraph({ children: [new TextRun({ text: 'Vận dụng:', bold: true, size: FONT_SIZE_BASE, font: FONT_NAME })] }));
      row.outcomesByLevel.van_dung.forEach(out => {
        outcomeParagraphs.push(new Paragraph({ bullet: { level: 0 }, children: [new TextRun({ text: out, size: FONT_SIZE_BASE - 2, font: FONT_NAME })] }));
      });
    }
    if (row.outcomesByLevel.van_dung_cao.length > 0) {
      outcomeParagraphs.push(new Paragraph({ children: [new TextRun({ text: 'Vận dụng cao:', bold: true, size: FONT_SIZE_BASE, font: FONT_NAME })] }));
      row.outcomesByLevel.van_dung_cao.forEach(out => {
        outcomeParagraphs.push(new Paragraph({ bullet: { level: 0 }, children: [new TextRun({ text: out, size: FONT_SIZE_BASE - 2, font: FONT_NAME })] }));
      });
    }
    if (outcomeParagraphs.length === 0) {
      outcomeParagraphs.push(new Paragraph({ children: [new TextRun({ text: 'Yêu cầu cần đạt chuẩn GDPT 2018.', italics: true, size: FONT_SIZE_BASE, font: FONT_NAME })] }));
    }

    return new TableRow({
      children: [
        new TableCell({ borders: cellBorder, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `${idx + 1}`, size: FONT_SIZE_BASE, font: FONT_NAME })] })] }),
        new TableCell({ borders: cellBorder, children: [new Paragraph({ children: [new TextRun({ text: row.chapter, bold: true, size: FONT_SIZE_BASE, font: FONT_NAME })] })] }),
        new TableCell({ borders: cellBorder, children: [new Paragraph({ children: [new TextRun({ text: row.knowledgeUnit, size: FONT_SIZE_BASE, font: FONT_NAME })] })] }),
        new TableCell({ borders: cellBorder, children: outcomeParagraphs }),
        new TableCell({ borders: cellBorder, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: row.questionsByLevel.nhan_biet.summaryText, bold: true, size: FONT_SIZE_BASE, font: FONT_NAME })] })] }),
        new TableCell({ borders: cellBorder, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: row.questionsByLevel.thong_hieu.summaryText, bold: true, size: FONT_SIZE_BASE, font: FONT_NAME })] })] }),
        new TableCell({ borders: cellBorder, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: row.questionsByLevel.van_dung.summaryText, bold: true, size: FONT_SIZE_BASE, font: FONT_NAME })] })] }),
        new TableCell({ borders: cellBorder, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: row.questionsByLevel.van_dung_cao.summaryText, bold: true, size: FONT_SIZE_BASE, font: FONT_NAME })] })] }),
        new TableCell({ borders: cellBorder, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `${row.totalQuestions} câu\n(${row.totalScore}đ)`, bold: true, size: FONT_SIZE_BASE, font: FONT_NAME })] })] }),
      ],
    });
  });

  // Spec Footers
  const specFooterRows: TableRow[] = [
    new TableRow({
      children: [
        new TableCell({ borders: cellBorder, columnSpan: 4, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: 'TỔNG CÂU HỎI THEO MỨC ĐỘ', bold: true, size: FONT_SIZE_BASE, font: FONT_NAME })] })] }),
        new TableCell({ borders: cellBorder, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `${matrix.totalByLevel.nhan_biet.count} câu`, bold: true, size: FONT_SIZE_BASE, font: FONT_NAME })] })] }),
        new TableCell({ borders: cellBorder, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `${matrix.totalByLevel.thong_hieu.count} câu`, bold: true, size: FONT_SIZE_BASE, font: FONT_NAME })] })] }),
        new TableCell({ borders: cellBorder, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `${matrix.totalByLevel.van_dung.count} câu`, bold: true, size: FONT_SIZE_BASE, font: FONT_NAME })] })] }),
        new TableCell({ borders: cellBorder, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `${matrix.totalByLevel.van_dung_cao.count} câu`, bold: true, size: FONT_SIZE_BASE, font: FONT_NAME })] })] }),
        new TableCell({ borders: cellBorder, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `${matrix.grandTotalQuestions} câu\n(${matrix.grandTotalScore}đ)`, bold: true, size: FONT_SIZE_BASE, font: FONT_NAME })] })] }),
      ],
    }),
    new TableRow({
      children: [
        new TableCell({ borders: cellBorder, columnSpan: 4, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: 'TỈ LỆ %', bold: true, size: FONT_SIZE_BASE, font: FONT_NAME })] })] }),
        new TableCell({ borders: cellBorder, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `${matrix.totalByLevel.nhan_biet.percentage}%`, bold: true, size: FONT_SIZE_BASE, font: FONT_NAME })] })] }),
        new TableCell({ borders: cellBorder, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `${matrix.totalByLevel.thong_hieu.percentage}%`, bold: true, size: FONT_SIZE_BASE, font: FONT_NAME })] })] }),
        new TableCell({ borders: cellBorder, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `${matrix.totalByLevel.van_dung.percentage}%`, bold: true, size: FONT_SIZE_BASE, font: FONT_NAME })] })] }),
        new TableCell({ borders: cellBorder, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `${matrix.totalByLevel.van_dung_cao.percentage}%`, bold: true, size: FONT_SIZE_BASE, font: FONT_NAME })] })] }),
        new TableCell({ borders: cellBorder, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: '100%', bold: true, size: FONT_SIZE_BASE, font: FONT_NAME })] })] }),
      ],
    }),
  ];

  const specTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [...specHeaderRows, ...specDataRows, ...specFooterRows],
  });

  const doc = new Document({
    sections: [
      {
        children: [
          ...matrixTitleParagraphs,
          matrixTable,
          ...specTitleParagraphs,
          specTable,
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  downloadBlob(blob, `Ma_tran_va_Ban_dac_ta_${config.subject}_${config.grade}.docx`);
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
