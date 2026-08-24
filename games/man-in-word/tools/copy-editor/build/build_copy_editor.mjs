import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SpreadsheetFile, Workbook } from '@oai/artifact-tool';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '../../../../..');
const manifestPath = path.join(
  repoRoot,
  'games/man-in-word/web/src/content-manifest.json',
);
const outputDir = path.join(repoRoot, 'outputs/copy-editor');
const outputPath = path.join(outputDir, '말보다-먼저_문장-편집기.xlsx');
const previewDir = path.join(outputDir, 'sheet-previews');

const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
const workbook = Workbook.create();

const headerFormat = {
  fill: '#E8EAED',
  font: { bold: true, color: '#202124' },
  verticalAlignment: 'center',
  wrapText: true,
  borders: { preset: 'outside', style: 'thin', color: '#BDC1C6' },
};

const bodyFormat = {
  font: { color: '#202124', size: 10 },
  verticalAlignment: 'top',
  wrapText: true,
};

function setColumnWidths(sheet, widths) {
  widths.forEach((width, index) => {
    sheet.getRangeByIndexes(0, index, 1, 1).format.columnWidthPx = width;
  });
}

function styleTableLikeRange(sheet, range, headerRange) {
  range.format = bodyFormat;
  range.format.borders = {
    insideHorizontal: { style: 'thin', color: '#E8EAED' },
    bottom: { style: 'thin', color: '#DADCE0' },
  };
  headerRange.format = headerFormat;
  headerRange.format.rowHeightPx = 34;
  sheet.freezePanes.freezeRows(1);
}

const draft = workbook.worksheets.add('DRAFT');
const draftHeaders = ['key', 'scene', 'context', 'text', 'max_length', 'status', 'note'];
const draftRows = manifest.map((item) => [
  item.key,
  item.scene,
  item.context,
  item.text,
  item.maxLength,
  '공개본과 같음',
  item.note,
]);
const draftLastRow = draftRows.length + 1;
draft.getRange(`A1:G${draftLastRow}`).values = [draftHeaders, ...draftRows];
styleTableLikeRange(draft, draft.getRange(`A1:G${draftLastRow}`), draft.getRange('A1:G1'));
setColumnWidths(draft, [260, 100, 250, 500, 95, 130, 280]);
draft.getRange(`D2:D${draftLastRow}`).format.fill = '#FFF8E1';
draft.getRange(`D2:D${draftLastRow}`).format.font = { color: '#202124', size: 11 };
draft.getRange(`E2:E${draftLastRow}`).format.numberFormat = '0';
draft.getRange(`E2:F${draftLastRow}`).format.horizontalAlignment = 'center';
draft.getRange(`F2:F${draftLastRow}`).dataValidation = {
  rule: {
    type: 'list',
    values: ['공개본과 같음', '초안', '검토 요청', '승인'],
  },
};
draft.getRange(`D2:D${draftLastRow}`).conditionalFormats.addCustom(
  '=LEN(D2)>$E2',
  { fill: '#FCE8E6', font: { color: '#B31412', bold: true } },
);
const draftTable = draft.tables.add(`A1:G${draftLastRow}`, true, 'DraftCopyTable');
draftTable.style = 'TableStyleLight1';

const schema = workbook.worksheets.add('SCHEMA');
const schemaHeaders = ['key', 'required', 'max_length', 'variables', 'description'];
const schemaRows = manifest.map((item) => [
  item.key,
  true,
  item.maxLength,
  item.variables.join(', '),
  item.note,
]);
const schemaLastRow = schemaRows.length + 1;
schema.getRange(`A1:E${schemaLastRow}`).values = [schemaHeaders, ...schemaRows];
styleTableLikeRange(schema, schema.getRange(`A1:E${schemaLastRow}`), schema.getRange('A1:E1'));
setColumnWidths(schema, [280, 90, 110, 170, 420]);
schema.getRange(`B2:C${schemaLastRow}`).format.horizontalAlignment = 'center';
schema.getRange(`C2:C${schemaLastRow}`).format.numberFormat = '0';

const published = workbook.worksheets.add('PUBLISHED');
const releaseId = 'r001-initial';
const publishedAt = '2026-08-24T00:00:00+09:00';
const publishedHeaders = ['key', 'text', 'release_id', 'published_at'];
const publishedRows = manifest.map((item) => [item.key, item.text, releaseId, publishedAt]);
const publishedLastRow = publishedRows.length + 1;
published.getRange(`A1:D${publishedLastRow}`).values = [publishedHeaders, ...publishedRows];
styleTableLikeRange(published, published.getRange(`A1:D${publishedLastRow}`), published.getRange('A1:D1'));
setColumnWidths(published, [280, 540, 130, 210]);
published.getRange(`D2:D${publishedLastRow}`).format.numberFormat = 'yyyy-mm-dd hh:mm:ss';

const releases = workbook.worksheets.add('RELEASES');
const snapshot = JSON.stringify(Object.fromEntries(manifest.map((item) => [item.key, item.text])));
releases.getRange('A1:E2').values = [
  ['release_id', 'published_at', 'published_by', 'snapshot_json', 'note'],
  [releaseId, publishedAt, '초기 설정', snapshot, '현재 게임 문장을 기준으로 만든 최초 공개본'],
];
styleTableLikeRange(releases, releases.getRange('A1:E2'), releases.getRange('A1:E1'));
setColumnWidths(releases, [130, 210, 140, 560, 300]);
releases.getRange('B2').format.numberFormat = 'yyyy-mm-dd hh:mm:ss';
releases.getRange('D2').format.wrapText = false;
releases.getRange('A2:E2').format.rowHeightPx = 48;

await fs.mkdir(outputDir, { recursive: true });
await fs.mkdir(previewDir, { recursive: true });

const checks = {};
for (const [sheetName, range] of [
  ['DRAFT', `A1:G${draftLastRow}`],
  ['SCHEMA', `A1:E${schemaLastRow}`],
  ['PUBLISHED', `A1:D${publishedLastRow}`],
  ['RELEASES', 'A1:E2'],
]) {
  checks[sheetName] = (await workbook.inspect({
    kind: 'table',
    range: `${sheetName}!${range}`,
    include: 'values,formulas',
    tableMaxRows: 8,
    tableMaxCols: 8,
    maxChars: 5000,
  })).ndjson;

  const preview = await workbook.render({
    sheetName,
    range,
    scale: 0.75,
    format: 'png',
  });
  await fs.writeFile(
    path.join(previewDir, `${sheetName.toLowerCase()}.png`),
    new Uint8Array(await preview.arrayBuffer()),
  );
}

const errors = await workbook.inspect({
  kind: 'match',
  searchTerm: '#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A',
  options: { useRegex: true, maxResults: 300 },
  summary: 'final formula error scan',
});

const xlsx = await SpreadsheetFile.exportXlsx(workbook);
await xlsx.save(outputPath);

console.log(JSON.stringify({
  outputPath,
  previewDir,
  rowCount: manifest.length,
  checks,
  formulaErrors: errors.ndjson,
}, null, 2));
