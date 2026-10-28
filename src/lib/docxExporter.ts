import { Document, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, HeadingLevel, BorderStyle, Packer } from 'docx';
import { GeneratedExamPackage, Question } from '@/types/exam';
import { formatExamTitle } from './matrixCalculator';

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
          text: (config.schoolName || 'TRƯỜNG THCS NGUYỄN DU').toUpperCase(), 
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
      spacing: { before: 200, after: 200 },
      children: [
        new TextRun({ 
          text: 'Họ và tên học sinh: ............................................................................   Lớp: ........................   SBD: ........................', 
          size: FONT_SIZE_SMALL, 
          italics: true, 
          font: FONT_NAME 
        }),
      ],
    }),
    new Paragraph({
      spacing: { after: 300 },
      children: [
        new TextRun({ 
          text: '----------------------------------------------------------------------------------------------------------------------------------', 
          color: '9CA3AF' 
        }),
      ],
    }),
  ];

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
        children: [tableHeader, ...studentInfo, ...questionParagraphs, ...footerDisclaimer],
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
