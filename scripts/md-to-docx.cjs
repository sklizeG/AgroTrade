/**
 * Конвертация PR-06 markdown → .docx (библиотека docx)
 * Usage: node md-to-docx.mjs [input.md] [output.docx]
 */
const fs = require('fs');
const path = require('path');
const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  BorderStyle,
  ShadingType,
  ImageRun,
} = require('docx');

const inputPath =
  process.argv[2] ||
  path.join(__dirname, '..', 'docs', 'PR-06_Рудницкий_ОТЧЕТ.md');
const outputPath =
  process.argv[3] ||
  path.join(__dirname, '..', 'docs', 'ПР6_Рудницкий.docx');

function parseInline(text) {
  const runs = [];
  const re = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;
  let last = 0;
  let m;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) {
      runs.push(new TextRun({ text: text.slice(last, m.index) }));
    }
    const token = m[0];
    if (token.startsWith('**')) {
      runs.push(
        new TextRun({ text: token.slice(2, -2), bold: true }),
      );
    } else if (token.startsWith('`')) {
      runs.push(
        new TextRun({
          text: token.slice(1, -1),
          font: 'Consolas',
          size: 20,
        }),
      );
    } else if (token.startsWith('[')) {
      const linkMatch = /\[([^\]]+)\]\(([^)]+)\)/.exec(token);
      if (linkMatch) {
        runs.push(
          new TextRun({
            text: `${linkMatch[1]} (${linkMatch[2]})`,
            color: '0563C1',
            underline: {},
          }),
        );
      }
    }
    last = m.index + token.length;
  }
  if (last < text.length) {
    runs.push(new TextRun({ text: text.slice(last) }));
  }
  if (runs.length === 0) {
    runs.push(new TextRun({ text: text || '' }));
  }
  return runs;
}

function paragraphFromLine(line, options = {}) {
  const trimmed = line.trimEnd();
  if (!trimmed) {
    return new Paragraph({ children: [new TextRun('')] });
  }
  if (trimmed.startsWith('> ')) {
    const content = trimmed.slice(2);
    const isScreenshot = content.includes('[ВСТАВИТЬ СКРИНШОТ');
    return new Paragraph({
      spacing: { before: 80, after: 80 },
      shading: isScreenshot
        ? { fill: 'FFF2CC', type: ShadingType.CLEAR }
        : { fill: 'F2F2F2', type: ShadingType.CLEAR },
      children: parseInline(content),
      ...options,
    });
  }
  if (/^\d+\.\s/.test(trimmed)) {
    return new Paragraph({
      children: parseInline(trimmed),
      spacing: { after: 100 },
      indent: { left: 360 },
    });
  }
  return new Paragraph({
    children: parseInline(trimmed),
    spacing: { after: 120 },
    ...options,
  });
}

function parseTableRow(line) {
  return line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((c) => c.trim());
}

function isSeparatorRow(cells) {
  return cells.every((c) => /^:?-+:?$/.test(c));
}

function buildTable(rows) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: rows.map((cells, rowIndex) =>
      new TableRow({
        children: cells.map(
          (cell) =>
            new TableCell({
              children: [
                new Paragraph({
                  children: parseInline(cell),
                }),
              ],
              shading:
                rowIndex === 0
                  ? { fill: 'D9E2F3', type: ShadingType.CLEAR }
                  : undefined,
            }),
        ),
      }),
    ),
  });
}

function addImageParagraph(children, baseDir, relPath, caption) {
  const imgPath = path.resolve(baseDir, relPath);
  if (!fs.existsSync(imgPath)) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: `[Файл не найден: ${relPath}]`, color: 'CC0000' }),
        ],
      }),
    );
    return;
  }
  const data = fs.readFileSync(imgPath);
  const maxW = 520;
  const height = 340;
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 120, after: 60 },
      children: [
        new ImageRun({
          data,
          transformation: { width: maxW, height },
        }),
      ],
    }),
  );
  if (caption) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 160 },
        children: [
          new TextRun({ text: caption, italics: true, size: 20, color: '555555' }),
        ],
      }),
    );
  }
}

function convertMarkdown(md, baseDir) {
  const lines = md.replace(/\r\n/g, '\n').split('\n');
  const children = [];
  let i = 0;
  let inCode = false;
  let codeLines = [];
  let codeLang = '';

  while (i < lines.length) {
    const line = lines[i];

    const imgMatch = line.match(/^!\[([^\]]*)\]\(([^)]+)\)\s*$/);
    if (imgMatch) {
      addImageParagraph(children, baseDir, imgMatch[2], imgMatch[1] || undefined);
      i++;
      continue;
    }

    if (line.startsWith('```')) {
      if (!inCode) {
        inCode = true;
        codeLang = line.slice(3).trim();
        codeLines = [];
      } else {
        inCode = false;
        if (codeLang) {
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: `[${codeLang}]`,
                  italics: true,
                  size: 18,
                  color: '666666',
                }),
              ],
            }),
          );
        }
        children.push(
          new Paragraph({
            spacing: { before: 120, after: 120 },
            shading: { fill: 'EEEEEE', type: ShadingType.CLEAR },
            children: [
              new TextRun({
                text: codeLines.join('\n'),
                font: 'Consolas',
                size: 18,
              }),
            ],
          }),
        );
        codeLines = [];
        codeLang = '';
      }
      i++;
      continue;
    }

    if (inCode) {
      codeLines.push(line);
      i++;
      continue;
    }

    if (line.trim() === '---') {
      children.push(
        new Paragraph({
          border: {
            bottom: { color: 'AAAAAA', space: 1, style: BorderStyle.SINGLE, size: 6 },
          },
          spacing: { after: 200, before: 200 },
        }),
      );
      i++;
      continue;
    }

    if (line.startsWith('|')) {
      const tableRows = [];
      while (i < lines.length && lines[i].startsWith('|')) {
        const cells = parseTableRow(lines[i]);
        if (!isSeparatorRow(cells)) {
          tableRows.push(cells);
        }
        i++;
      }
      if (tableRows.length > 0) {
        children.push(buildTable(tableRows));
        children.push(new Paragraph({ children: [new TextRun('')] }));
      }
      continue;
    }

    if (line.startsWith('# ')) {
      children.push(
        new Paragraph({
          heading: HeadingLevel.TITLE,
          alignment: AlignmentType.CENTER,
          spacing: { before: 240, after: 240 },
          children: parseInline(line.slice(2)),
        }),
      );
      i++;
      continue;
    }

    if (line.startsWith('## ')) {
      children.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 320, after: 160 },
          children: parseInline(line.slice(3)),
        }),
      );
      i++;
      continue;
    }

    if (line.startsWith('### ')) {
      children.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 240, after: 120 },
          children: parseInline(line.slice(4)),
        }),
      );
      i++;
      continue;
    }

    if (line.startsWith('#### ')) {
      children.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 200, after: 100 },
          children: parseInline(line.slice(5)),
        }),
      );
      i++;
      continue;
    }

    // Title page block (first lines before first ---)
    if (
      i < 8 &&
      !line.startsWith('#') &&
      !line.startsWith('|') &&
      line.trim()
    ) {
      const center =
        line.includes('Министерство') ||
        line.includes('Федеральное') ||
        line.includes('СИБИРСКИЙ') ||
        line.includes('Институт') ||
        line.includes('Кафедра') ||
        line.includes('Красноярск');
      children.push(
        paragraphFromLine(line, {
          alignment: center ? AlignmentType.CENTER : undefined,
        }),
      );
      i++;
      continue;
    }

    if (line.trim() === '') {
      children.push(new Paragraph({ children: [new TextRun('')] }));
      i++;
      continue;
    }

    children.push(paragraphFromLine(line));
    i++;
  }

  return children;
}

async function main() {
  const md = fs.readFileSync(inputPath, 'utf8');
  const baseDir = path.dirname(inputPath);
  const doc = new Document({
    creator: 'AgroTrade / PR-06',
    title: 'ПР-06 BPMS — Рудницкий',
    description: 'Отчёт о практической работе №6',
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1134, right: 850, bottom: 1134, left: 1701 },
          },
        },
        children: convertMarkdown(md, baseDir),
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(outputPath, buffer);
  console.log('Written:', outputPath);
  console.log('Size:', buffer.length, 'bytes');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
