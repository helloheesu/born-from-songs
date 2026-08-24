/**
 * Game copy editor for Google Sheets.
 * @OnlyCurrentDoc
 *
 * This file is intended to be pasted into a bound Apps Script project.
 * Run setupContentSheets() once before using the custom menu.
 */

const CONTENT_SHEETS = Object.freeze({
  DRAFT: 'DRAFT',
  SCHEMA: 'SCHEMA',
  PUBLISHED: 'PUBLISHED',
  RELEASES: 'RELEASES',
});

const CONTENT_HEADERS = Object.freeze([
  'key',
  'scene',
  'context',
  'text',
  'max_length',
  'status',
  'note',
]);

const RELEASE_HEADERS = Object.freeze([
  'release_id',
  'published_at',
  'published_by',
  'action',
  'source_release_id',
  'checksum',
].concat(CONTENT_HEADERS));

const DRAFT_STATUSES = Object.freeze([
  '공개본과 같음',
  '초안',
  '검토 요청',
  '승인',
  '보류',
  '비활성',
]);

const SCHEMA_STATUSES = Object.freeze([
  '필수',
  '선택',
  '비활성',
]);

const SCRIPT_KEYS = Object.freeze({
  SPREADSHEET_ID: 'SPREADSHEET_ID',
  GAME_PREVIEW_URL: 'GAME_PREVIEW_URL',
  CURRENT_RELEASE_ID: 'CURRENT_RELEASE_ID',
  CURRENT_RELEASED_AT: 'CURRENT_RELEASED_AT',
  PREVIEW_TOKENS: 'PREVIEW_TOKENS',
});

const PREVIEW_TOKEN_TTL_MS = 2 * 60 * 60 * 1000;
const MAX_ACTIVE_PREVIEW_TOKENS = 5;
const VALIDATION_DISPLAY_LIMIT = 30;

/** Adds the non-technical editor menu whenever the spreadsheet opens. */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('게임 문장')
    .addItem('문장 검사', 'validateDraft')
    .addItem('게임 미리보기', 'openGamePreview')
    .addSeparator()
    .addItem('공개본 반영', 'publishDraft')
    .addItem('이전 버전 복원', 'rollbackPreviousRelease')
    .addToUi();
}

/** Marks a changed DRAFT sentence as a working draft. */
function onEdit(event) {
  if (!event || !event.range) return;
  const range = event.range;
  const sheet = range.getSheet();
  if (sheet.getName() !== CONTENT_SHEETS.DRAFT || range.getRow() < 2) return;
  if (range.getColumn() !== 4 || range.getNumColumns() !== 1) return;

  const statuses = Array.from({ length: range.getNumRows() }, function () {
    return ['초안'];
  });
  sheet.getRange(range.getRow(), 6, range.getNumRows(), 1).setValues(statuses);
}

/**
 * Creates the four tabs without deleting existing content.
 * Run once from the Apps Script editor, then reload the spreadsheet.
 */
function setupContentSheets() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  if (!spreadsheet) {
    throw new Error('이 함수는 대상 Google Sheet에 바인딩된 Apps Script에서 실행해야 합니다.');
  }

  PropertiesService.getScriptProperties().setProperty(
    SCRIPT_KEYS.SPREADSHEET_ID,
    spreadsheet.getId()
  );

  const draftSheet = ensureSheet_(spreadsheet, CONTENT_SHEETS.DRAFT, CONTENT_HEADERS);
  const schemaSheet = ensureSheet_(spreadsheet, CONTENT_SHEETS.SCHEMA, CONTENT_HEADERS);
  const publishedSheet = ensureSheet_(spreadsheet, CONTENT_SHEETS.PUBLISHED, CONTENT_HEADERS);
  const releasesSheet = ensureSheet_(spreadsheet, CONTENT_SHEETS.RELEASES, RELEASE_HEADERS);

  applyEditorValidation_(draftSheet, schemaSheet);
  addWarningProtection_(schemaSheet, '게임 문장: SCHEMA 직접 수정 주의');
  addWarningProtection_(publishedSheet, '게임 문장: PUBLISHED 직접 수정 금지');
  addWarningProtection_(releasesSheet, '게임 문장: RELEASES 직접 수정 금지');

  const releases = listReleaseSummaries_(spreadsheet);
  const scriptProperties = PropertiesService.getScriptProperties();
  if (releases.length && !scriptProperties.getProperty(SCRIPT_KEYS.CURRENT_RELEASE_ID)) {
    const latest = releases[releases.length - 1];
    scriptProperties.setProperties({
      CURRENT_RELEASE_ID: latest.releaseId,
      CURRENT_RELEASED_AT: latest.publishedAt,
    });
  }

  spreadsheet.toast(
    'DRAFT, SCHEMA, PUBLISHED, RELEASES 탭을 준비했습니다.',
    '초기 설정 완료',
    6
  );
}

/** Validates DRAFT and displays a human-readable report. */
function validateDraft() {
  const report = validateDraft_();
  showValidationReport_(report);
  return report;
}

/**
 * Opens the game with a short-lived DRAFT content URL.
 * The game must support the `copy=draft&token=...` query documented in README.md.
 */
function openGamePreview() {
  const report = validateDraft_();
  if (!report.ok) {
    showValidationReport_(report);
    return;
  }

  const serviceUrl = ScriptApp.getService().getUrl();
  if (!serviceUrl) {
    SpreadsheetApp.getUi().alert(
      '먼저 Apps Script를 웹 앱으로 배포해 주세요.\n' +
      '배포 > 새 배포 > 웹 앱에서 실행 사용자와 접근 권한을 설정하면 됩니다.'
    );
    return;
  }

  const gameUrl = getOrPromptForGamePreviewUrl_();
  if (!gameUrl) {
    return;
  }

  const token = issuePreviewToken_();
  const previewUrl = addQueryParams_(gameUrl, {
    copy: 'draft',
    token: token,
  });

  const safeUrl = escapeHtml_(previewUrl);
  const html = HtmlService.createHtmlOutput(
    '<div style="font-family:Arial,sans-serif;padding:18px;line-height:1.55">' +
      '<h2 style="font-size:18px;margin:0 0 10px">DRAFT 미리보기</h2>' +
      '<p>아래 링크는 2시간 동안만 작동합니다. 링크를 외부에 공유하지 마세요.</p>' +
      '<p><a href="' + safeUrl + '" target="_blank" rel="noopener noreferrer" ' +
      'style="display:inline-block;padding:10px 14px;border-radius:8px;' +
      'background:#1a73e8;color:#fff;text-decoration:none">게임에서 확인하기</a></p>' +
      '<p style="color:#666;font-size:12px;word-break:break-all">' + safeUrl + '</p>' +
    '</div>'
  ).setWidth(520).setHeight(260);

  SpreadsheetApp.getUi().showModalDialog(html, '게임 미리보기');
}

/** Prompts for and stores the deployed game URL when invoked from the Sheet UI. */
function configureGamePreviewUrl() {
  return getOrPromptForGamePreviewUrl_(true);
}

/** Invalidates every outstanding DRAFT preview link. */
function invalidatePreviewTokens() {
  PropertiesService.getScriptProperties().deleteProperty(SCRIPT_KEYS.PREVIEW_TOKENS);
  getSpreadsheet_().toast(
    '기존 DRAFT 미리보기 링크를 모두 무효화했습니다.',
    '미리보기 토큰 초기화',
    5
  );
}

/**
 * Validates DRAFT, snapshots it, and replaces PUBLISHED while holding a script lock.
 */
function publishDraft() {
  const ui = SpreadsheetApp.getUi();
  const initialReport = validateDraft_();
  if (!initialReport.ok) {
    showValidationReport_(initialReport);
    return;
  }

  const confirm = ui.alert(
    '공개본 반영',
    '현재 DRAFT를 새 공개 버전으로 반영할까요?\n' +
    'status가 비활성인 행은 공개본에서 제외됩니다.',
    ui.ButtonSet.YES_NO
  );
  if (confirm !== ui.Button.YES) {
    return;
  }

  const lock = LockService.getScriptLock();
  lock.waitLock(30000);

  try {
    const report = validateDraft_();
    if (!report.ok) {
      showValidationReport_(report);
      return;
    }

    const spreadsheet = getSpreadsheet_();
    const draftRows = readContentRows_(spreadsheet.getSheetByName(CONTENT_SHEETS.DRAFT));
    const publishedRows = draftRows
      .filter(function (row) { return row.status !== '비활성'; })
      .map(stripRowMetadata_);

    const result = commitRelease_(spreadsheet, publishedRows, {
      action: 'publish',
      sourceReleaseId: '',
    });
    markDraftAsPublished_(spreadsheet);

    spreadsheet.toast(
      '공개 버전 ' + result.releaseId + '에 ' + publishedRows.length + '개 문장을 반영했습니다.',
      '공개본 반영 완료',
      8
    );
  } catch (error) {
    ui.alert('공개본 반영 실패', error.message || String(error), ui.ButtonSet.OK);
    throw error;
  } finally {
    lock.releaseLock();
  }
}

/** Restores the release immediately before the current release as a new rollback release. */
function rollbackPreviousRelease() {
  const ui = SpreadsheetApp.getUi();
  const spreadsheet = getSpreadsheet_();
  const releases = listReleaseSummaries_(spreadsheet);
  const currentReleaseId = getCurrentReleaseId_(releases);

  if (releases.length < 2 || !currentReleaseId) {
    ui.alert('복원할 이전 공개 버전이 없습니다.');
    return;
  }

  let currentIndex = releases.findIndex(function (release) {
    return release.releaseId === currentReleaseId;
  });
  if (currentIndex < 0) {
    currentIndex = releases.length - 1;
  }

  const target = releases[currentIndex - 1];
  if (!target) {
    ui.alert('복원할 이전 공개 버전이 없습니다.');
    return;
  }

  const confirm = ui.alert(
    '이전 버전 복원',
    '현재: ' + currentReleaseId + '\n' +
    '복원 대상: ' + target.releaseId + '\n' +
    '발행 시각: ' + target.publishedAt + '\n\n' +
    '복원 결과도 새로운 release로 기록됩니다. 계속할까요?',
    ui.ButtonSet.YES_NO
  );
  if (confirm !== ui.Button.YES) {
    return;
  }

  rollbackToRelease(target.releaseId);
}

/** Restores a specific release ID and records the action as a new release. */
function rollbackToRelease(releaseId) {
  if (!releaseId) {
    throw new Error('복원할 releaseId가 필요합니다.');
  }

  const lock = LockService.getScriptLock();
  lock.waitLock(30000);

  try {
    const spreadsheet = getSpreadsheet_();
    const rows = readReleaseRows_(spreadsheet, String(releaseId));
    if (!rows.length) {
      throw new Error('RELEASES에서 releaseId를 찾지 못했습니다: ' + releaseId);
    }

    const result = commitRelease_(spreadsheet, rows, {
      action: 'rollback',
      sourceReleaseId: String(releaseId),
    });

    spreadsheet.toast(
      releaseId + '의 문장을 새 공개 버전 ' + result.releaseId + '로 복원했습니다.',
      '복원 완료',
      8
    );
    return result;
  } finally {
    lock.releaseLock();
  }
}

/**
 * Public read-only endpoint.
 *
 * - No channel: returns PUBLISHED.
 * - channel=PUBLISHED: returns PUBLISHED.
 * - channel=DRAFT: requires a valid, unexpired preview token.
 * - Every response is JSON serialized as text/plain. JSONP is intentionally unsupported.
 */
function doGet(event) {
  try {
    const parameters = event && event.parameter ? event.parameter : {};
    const requestedChannel = String(parameters.channel || 'PUBLISHED').toUpperCase();

    if (requestedChannel === 'DRAFT') {
      if (!isValidPreviewToken_(String(parameters.token || ''))) {
        return textJson_({
          ok: false,
          channel: 'DRAFT',
          generated_at: new Date().toISOString(),
          error: {
            code: 'INVALID_PREVIEW_TOKEN',
            message: 'DRAFT 미리보기 토큰이 없거나 만료되었습니다.',
          },
        });
      }

      const report = validateDraft_();
      if (!report.ok) {
        return textJson_({
          ok: false,
          channel: 'DRAFT',
          generated_at: new Date().toISOString(),
          validation: report,
          error: {
            code: 'DRAFT_VALIDATION_FAILED',
            message: 'DRAFT가 문장 검사를 통과하지 못했습니다.',
          },
        });
      }

      const spreadsheet = getSpreadsheet_();
      const rows = readContentRows_(spreadsheet.getSheetByName(CONTENT_SHEETS.DRAFT))
        .filter(function (row) { return row.status !== '비활성'; })
        .map(stripRowMetadata_);

      return textJson_(buildContentPayload_('DRAFT', rows, null));
    }

    if (requestedChannel !== 'PUBLISHED') {
      return textJson_({
        ok: false,
        generated_at: new Date().toISOString(),
        error: {
          code: 'UNKNOWN_CHANNEL',
          message: 'channel은 PUBLISHED 또는 DRAFT만 허용됩니다.',
        },
      });
    }

    return textJson_(getPublishedPayload_());
  } catch (error) {
    return textJson_({
      ok: false,
      generated_at: new Date().toISOString(),
      error: {
        code: 'SERVER_ERROR',
        message: error.message || String(error),
      },
    });
  }
}

function validateDraft_() {
  const spreadsheet = getSpreadsheet_();
  const errors = [];
  const warnings = [];

  const draftSheet = spreadsheet.getSheetByName(CONTENT_SHEETS.DRAFT);
  const schemaSheet = spreadsheet.getSheetByName(CONTENT_SHEETS.SCHEMA);
  if (!draftSheet || !schemaSheet) {
    return {
      ok: false,
      checked_at: new Date().toISOString(),
      row_count: 0,
      errors: [{
        sheet: '',
        row: 0,
        key: '',
        column: '',
        message: 'setupContentSheets()를 먼저 실행해 DRAFT와 SCHEMA 탭을 만들어 주세요.',
      }],
      warnings: [],
    };
  }

  try {
    assertHeaders_(draftSheet, CONTENT_HEADERS);
    assertHeaders_(schemaSheet, CONTENT_HEADERS);
  } catch (error) {
    errors.push({
      sheet: '',
      row: 1,
      key: '',
      column: '',
      message: error.message,
    });
    return validationResult_(0, errors, warnings);
  }

  const draftRows = readContentRows_(draftSheet);
  const schemaRows = readContentRows_(schemaSheet);
  const schemaByKey = {};

  schemaRows.forEach(function (schemaRow) {
    const key = schemaRow.key;
    if (!key) {
      errors.push(issue_(CONTENT_SHEETS.SCHEMA, schemaRow._row, '', 'key', 'key가 비어 있습니다.'));
      return;
    }
    if (schemaByKey[key]) {
      errors.push(issue_(CONTENT_SHEETS.SCHEMA, schemaRow._row, key, 'key', 'SCHEMA에 중복 key가 있습니다.'));
      return;
    }

    const schemaStatus = schemaRow.status || '필수';
    if (SCHEMA_STATUSES.indexOf(schemaStatus) < 0) {
      errors.push(issue_(
        CONTENT_SHEETS.SCHEMA,
        schemaRow._row,
        key,
        'status',
        'SCHEMA status는 필수, 선택, 비활성 중 하나여야 합니다.'
      ));
    }
    if (schemaStatus !== '비활성' && !schemaRow.scene) {
      errors.push(issue_(
        CONTENT_SHEETS.SCHEMA,
        schemaRow._row,
        key,
        'scene',
        '활성 SCHEMA 행에는 scene이 필요합니다.'
      ));
    }
    if (
      schemaRow.max_length !== null &&
      (!Number.isInteger(schemaRow.max_length) || schemaRow.max_length <= 0)
    ) {
      errors.push(issue_(
        CONTENT_SHEETS.SCHEMA,
        schemaRow._row,
        key,
        'max_length',
        'SCHEMA max_length는 비워 두거나 1 이상의 정수여야 합니다.'
      ));
    }
    schemaByKey[key] = schemaRow;
  });

  const draftByKey = {};
  draftRows.forEach(function (row) {
    if (!row.key) {
      errors.push(issue_(CONTENT_SHEETS.DRAFT, row._row, '', 'key', 'key가 비어 있습니다.'));
      return;
    }
    if (draftByKey[row.key]) {
      errors.push(issue_(CONTENT_SHEETS.DRAFT, row._row, row.key, 'key', 'DRAFT에 중복 key가 있습니다.'));
      return;
    }
    draftByKey[row.key] = row;

    if (!row.scene) {
      errors.push(issue_(CONTENT_SHEETS.DRAFT, row._row, row.key, 'scene', 'scene이 비어 있습니다.'));
    }

    const draftStatus = row.status || '초안';
    if (DRAFT_STATUSES.indexOf(draftStatus) < 0) {
      errors.push(issue_(
        CONTENT_SHEETS.DRAFT,
        row._row,
        row.key,
        'status',
        'DRAFT status는 공개본과 같음, 초안, 검토 요청, 승인, 보류, 비활성 중 하나여야 합니다.'
      ));
    }

    if (draftStatus !== '비활성' && !row.text) {
      errors.push(issue_(CONTENT_SHEETS.DRAFT, row._row, row.key, 'text', '공개할 text가 비어 있습니다.'));
    }

    if (row.max_length !== null && (!Number.isInteger(row.max_length) || row.max_length <= 0)) {
      errors.push(issue_(
        CONTENT_SHEETS.DRAFT,
        row._row,
        row.key,
        'max_length',
        'max_length는 비워 두거나 1 이상의 정수여야 합니다.'
      ));
    }

    if (/\u0000/.test(row.text)) {
      errors.push(issue_(CONTENT_SHEETS.DRAFT, row._row, row.key, 'text', 'NUL 문자는 사용할 수 없습니다.'));
    }
    if (/<\s*script\b|javascript\s*:/i.test(row.text)) {
      errors.push(issue_(
        CONTENT_SHEETS.DRAFT,
        row._row,
        row.key,
        'text',
        '스크립트로 해석될 수 있는 문자열은 사용할 수 없습니다.'
      ));
    }

    if (schemaRows.length && !schemaByKey[row.key]) {
      errors.push(issue_(CONTENT_SHEETS.DRAFT, row._row, row.key, 'key', 'SCHEMA에 없는 key입니다.'));
      return;
    }

    const schemaRow = schemaByKey[row.key];
    if (schemaRow) {
      const schemaStatus = schemaRow.status || '필수';
      if (schemaStatus === '비활성' && draftStatus !== '비활성') {
        warnings.push(issue_(
          CONTENT_SHEETS.DRAFT,
          row._row,
          row.key,
          'status',
          'SCHEMA에서 비활성인 key가 DRAFT에서는 활성 상태입니다.'
        ));
      }
      if (schemaRow.scene && row.scene !== schemaRow.scene) {
        errors.push(issue_(
          CONTENT_SHEETS.DRAFT,
          row._row,
          row.key,
          'scene',
          'SCHEMA의 scene(' + schemaRow.scene + ')과 일치하지 않습니다.'
        ));
      }
      if (schemaRow.context && row.context !== schemaRow.context) {
        warnings.push(issue_(
          CONTENT_SHEETS.DRAFT,
          row._row,
          row.key,
          'context',
          'SCHEMA의 context와 다릅니다. 의도한 변경인지 확인해 주세요.'
        ));
      }

      const hardMaxLength = schemaRow.max_length || row.max_length;
      if (hardMaxLength && textLength_(row.text) > hardMaxLength) {
        errors.push(issue_(
          CONTENT_SHEETS.DRAFT,
          row._row,
          row.key,
          'text',
          '문장 길이 ' + textLength_(row.text) + '자가 제한 ' + hardMaxLength + '자를 넘었습니다.'
        ));
      }

      const expectedPlaceholders = extractPlaceholders_(schemaRow.text);
      const actualPlaceholders = extractPlaceholders_(row.text);
      if (expectedPlaceholders.join('|') !== actualPlaceholders.join('|')) {
        errors.push(issue_(
          CONTENT_SHEETS.DRAFT,
          row._row,
          row.key,
          'text',
          'SCHEMA 예문에 정의된 {placeholder} 구성이 다릅니다.'
        ));
      }
    } else if (row.max_length && textLength_(row.text) > row.max_length) {
      errors.push(issue_(
        CONTENT_SHEETS.DRAFT,
        row._row,
        row.key,
        'text',
        '문장 길이 ' + textLength_(row.text) + '자가 제한 ' + row.max_length + '자를 넘었습니다.'
      ));
    }

    if (row.text && row.text !== row.text.trim()) {
      warnings.push(issue_(
        CONTENT_SHEETS.DRAFT,
        row._row,
        row.key,
        'text',
        '문장 앞이나 뒤에 공백이 있습니다. 발행 시 바깥 공백은 제거됩니다.'
      ));
    }
  });

  schemaRows.forEach(function (schemaRow) {
    const schemaStatus = schemaRow.status || '필수';
    if (schemaStatus === '필수' && schemaRow.key && !draftByKey[schemaRow.key]) {
      errors.push(issue_(
        CONTENT_SHEETS.DRAFT,
        0,
        schemaRow.key,
        'key',
        'SCHEMA에서 필수로 지정된 key가 DRAFT에 없습니다.'
      ));
    }
  });

  if (!schemaRows.length) {
    warnings.push(issue_(
      CONTENT_SHEETS.SCHEMA,
      0,
      '',
      '',
      'SCHEMA가 비어 있어 DRAFT key 목록과 장면 규칙은 검사하지 않았습니다.'
    ));
  }

  return validationResult_(draftRows.length, errors, warnings);
}

function commitRelease_(spreadsheet, contentRows, options) {
  if (!contentRows.length) {
    throw new Error('공개할 문장이 없습니다.');
  }

  const normalizedRows = contentRows.map(function (row) {
    return normalizeContentObject_(row);
  });
  const checksum = checksum_(JSON.stringify(normalizedRows));
  const now = new Date();
  const releaseId = makeReleaseId_(now, checksum);
  const metadata = {
    releaseId: releaseId,
    publishedAt: now.toISOString(),
    publishedBy: currentUserEmail_(),
    action: options.action,
    sourceReleaseId: options.sourceReleaseId || '',
    checksum: checksum,
  };

  const previousPublishedRows = readContentRows_(
    spreadsheet.getSheetByName(CONTENT_SHEETS.PUBLISHED)
  ).map(stripRowMetadata_);
  const scriptProperties = PropertiesService.getScriptProperties();
  const previousReleaseId = scriptProperties.getProperty(SCRIPT_KEYS.CURRENT_RELEASE_ID);
  const previousReleasedAt = scriptProperties.getProperty(SCRIPT_KEYS.CURRENT_RELEASED_AT);
  const appendInfo = appendReleaseSnapshot_(spreadsheet, normalizedRows, metadata);

  try {
    writePublishedRows_(spreadsheet, normalizedRows);
    scriptProperties.setProperties({
      CURRENT_RELEASE_ID: releaseId,
      CURRENT_RELEASED_AT: metadata.publishedAt,
    });
    SpreadsheetApp.flush();
    refreshPublishedCache_();
  } catch (error) {
    try {
      writePublishedRows_(spreadsheet, previousPublishedRows);
      clearAppendedRelease_(spreadsheet, appendInfo);
      restoreProperty_(scriptProperties, SCRIPT_KEYS.CURRENT_RELEASE_ID, previousReleaseId);
      restoreProperty_(scriptProperties, SCRIPT_KEYS.CURRENT_RELEASED_AT, previousReleasedAt);
      SpreadsheetApp.flush();
    } catch (restoreError) {
      console.error('공개본 원복 중 추가 오류:', restoreError);
    }
    throw error;
  }

  return metadata;
}

function appendReleaseSnapshot_(spreadsheet, contentRows, metadata) {
  const sheet = spreadsheet.getSheetByName(CONTENT_SHEETS.RELEASES);
  assertHeaders_(sheet, RELEASE_HEADERS);

  const values = contentRows.map(function (row) {
    return [
      metadata.releaseId,
      metadata.publishedAt,
      metadata.publishedBy,
      metadata.action,
      metadata.sourceReleaseId,
      metadata.checksum,
    ].concat(contentObjectToValues_(row));
  });

  const startRow = Math.max(sheet.getLastRow() + 1, 2);
  ensureRowCapacity_(sheet, startRow + values.length - 1);
  sheet.getRange(startRow, 1, values.length, RELEASE_HEADERS.length).setValues(values);
  return { startRow: startRow, rowCount: values.length };
}

function clearAppendedRelease_(spreadsheet, appendInfo) {
  if (!appendInfo || !appendInfo.rowCount) {
    return;
  }
  spreadsheet.getSheetByName(CONTENT_SHEETS.RELEASES)
    .getRange(appendInfo.startRow, 1, appendInfo.rowCount, RELEASE_HEADERS.length)
    .clearContent();
}

function writePublishedRows_(spreadsheet, rows) {
  const sheet = spreadsheet.getSheetByName(CONTENT_SHEETS.PUBLISHED);
  assertHeaders_(sheet, CONTENT_HEADERS);
  ensureRowCapacity_(sheet, Math.max(rows.length + 1, 2));

  if (rows.length) {
    const values = rows.map(contentObjectToValues_);
    sheet.getRange(2, 1, values.length, CONTENT_HEADERS.length).setValues(values);
  }

  const oldDataRows = Math.max(sheet.getLastRow() - 1, 0);
  if (oldDataRows > rows.length) {
    sheet.getRange(
      rows.length + 2,
      1,
      oldDataRows - rows.length,
      CONTENT_HEADERS.length
    ).clearContent();
  }
}

function markDraftAsPublished_(spreadsheet) {
  const sheet = spreadsheet.getSheetByName(CONTENT_SHEETS.DRAFT);
  if (!sheet || sheet.getLastRow() < 2) return;
  const rowCount = sheet.getLastRow() - 1;
  const current = sheet.getRange(2, 6, rowCount, 1).getDisplayValues();
  const next = current.map(function (row) {
    return [row[0] === '비활성' ? '비활성' : '공개본과 같음'];
  });
  sheet.getRange(2, 6, rowCount, 1).setValues(next);
}

function getPublishedPayload_() {
  const properties = PropertiesService.getScriptProperties();
  const releaseId = properties.getProperty(SCRIPT_KEYS.CURRENT_RELEASE_ID) || '';
  const cache = CacheService.getScriptCache();
  const cacheKey = 'published:' + (releaseId || 'unreleased');

  try {
    const cached = cache.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (error) {
    console.warn('공개본 캐시 읽기 실패:', error);
  }

  const spreadsheet = getSpreadsheet_();
  const sheet = spreadsheet.getSheetByName(CONTENT_SHEETS.PUBLISHED);
  if (!sheet) {
    throw new Error('PUBLISHED 탭이 없습니다. setupContentSheets()를 먼저 실행해 주세요.');
  }

  const rows = readContentRows_(sheet).map(stripRowMetadata_);
  const payload = buildContentPayload_('PUBLISHED', rows, releaseId || null);
  cachePayload_(cacheKey, payload);
  return payload;
}

function refreshPublishedCache_() {
  const properties = PropertiesService.getScriptProperties();
  const releaseId = properties.getProperty(SCRIPT_KEYS.CURRENT_RELEASE_ID) || '';
  const spreadsheet = getSpreadsheet_();
  const rows = readContentRows_(
    spreadsheet.getSheetByName(CONTENT_SHEETS.PUBLISHED)
  ).map(stripRowMetadata_);
  const payload = buildContentPayload_('PUBLISHED', rows, releaseId || null);
  cachePayload_('published:' + (releaseId || 'unreleased'), payload);
}

function cachePayload_(key, payload) {
  try {
    CacheService.getScriptCache().put(key, JSON.stringify(payload), 300);
  } catch (error) {
    // Cache is an optimization only; Sheet remains the source of truth.
    console.warn('공개본 캐시 저장 실패:', error);
  }
}

function buildContentPayload_(channel, rows, releaseId) {
  const normalizedRows = rows.map(normalizeContentObject_);
  const copy = {};
  normalizedRows.forEach(function (row) {
    copy[row.key] = row.text;
  });
  return {
    ok: true,
    channel: String(channel).toLowerCase(),
    releaseId: releaseId,
    updatedAt: new Date().toISOString(),
    copy: copy,
    release_id: releaseId,
    generated_at: new Date().toISOString(),
    checksum: checksum_(JSON.stringify(normalizedRows)),
    items: normalizedRows,
  };
}

function textJson_(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.TEXT);
}

function readContentRows_(sheet) {
  if (!sheet) {
    return [];
  }
  assertHeaders_(sheet, CONTENT_HEADERS);
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    return [];
  }

  const values = sheet.getRange(2, 1, lastRow - 1, CONTENT_HEADERS.length).getDisplayValues();
  return values.reduce(function (rows, valuesRow, index) {
    if (valuesRow.every(function (value) { return String(value).trim() === ''; })) {
      return rows;
    }
    rows.push(normalizeContentObject_({
      key: valuesRow[0],
      scene: valuesRow[1],
      context: valuesRow[2],
      text: valuesRow[3],
      max_length: valuesRow[4],
      status: valuesRow[5],
      note: valuesRow[6],
      _row: index + 2,
    }));
    return rows;
  }, []);
}

function normalizeContentObject_(row) {
  const maxLengthText = row.max_length === null || row.max_length === undefined
    ? ''
    : String(row.max_length).trim();
  const parsedMaxLength = maxLengthText === '' ? null : Number(maxLengthText);

  const normalized = {
    key: String(row.key || '').trim(),
    scene: String(row.scene || '').trim(),
    context: String(row.context || '').trim(),
    text: String(row.text || '').trim(),
    max_length: parsedMaxLength,
    status: String(row.status || '').trim(),
    note: String(row.note || '').trim(),
  };
  if (Object.prototype.hasOwnProperty.call(row, '_row')) {
    normalized._row = row._row;
  }
  return normalized;
}

function stripRowMetadata_(row) {
  return {
    key: row.key,
    scene: row.scene,
    context: row.context,
    text: row.text,
    max_length: row.max_length,
    status: row.status,
    note: row.note,
  };
}

function contentObjectToValues_(row) {
  const normalized = normalizeContentObject_(row);
  return [
    normalized.key,
    normalized.scene,
    normalized.context,
    normalized.text,
    normalized.max_length === null ? '' : normalized.max_length,
    normalized.status,
    normalized.note,
  ];
}

function listReleaseSummaries_(spreadsheet) {
  const sheet = spreadsheet.getSheetByName(CONTENT_SHEETS.RELEASES);
  if (!sheet) {
    return [];
  }
  assertHeaders_(sheet, RELEASE_HEADERS);
  if (sheet.getLastRow() < 2) {
    return [];
  }

  const values = sheet.getRange(
    2,
    1,
    sheet.getLastRow() - 1,
    RELEASE_HEADERS.length
  ).getDisplayValues();
  const seen = {};
  const summaries = [];

  values.forEach(function (row) {
    const releaseId = String(row[0] || '').trim();
    if (!releaseId || seen[releaseId]) {
      return;
    }
    seen[releaseId] = true;
    summaries.push({
      releaseId: releaseId,
      publishedAt: row[1],
      publishedBy: row[2],
      action: row[3],
      sourceReleaseId: row[4],
      checksum: row[5],
    });
  });
  return summaries;
}

function readReleaseRows_(spreadsheet, releaseId) {
  const sheet = spreadsheet.getSheetByName(CONTENT_SHEETS.RELEASES);
  if (!sheet || sheet.getLastRow() < 2) {
    return [];
  }
  assertHeaders_(sheet, RELEASE_HEADERS);
  const values = sheet.getRange(
    2,
    1,
    sheet.getLastRow() - 1,
    RELEASE_HEADERS.length
  ).getDisplayValues();

  return values.reduce(function (rows, row) {
    if (String(row[0] || '').trim() !== releaseId) {
      return rows;
    }
    rows.push(normalizeContentObject_({
      key: row[6],
      scene: row[7],
      context: row[8],
      text: row[9],
      max_length: row[10],
      status: row[11],
      note: row[12],
    }));
    return rows;
  }, []);
}

function getCurrentReleaseId_(releaseSummaries) {
  const stored = PropertiesService.getScriptProperties()
    .getProperty(SCRIPT_KEYS.CURRENT_RELEASE_ID);
  if (stored) {
    return stored;
  }
  return releaseSummaries.length
    ? releaseSummaries[releaseSummaries.length - 1].releaseId
    : '';
}

function issuePreviewToken_() {
  const rawToken = (
    Utilities.getUuid().replace(/-/g, '') +
    Utilities.getUuid().replace(/-/g, '')
  );
  const now = Date.now();
  const records = getPreviewTokenRecords_()
    .filter(function (record) { return Number(record.expiresAt) > now; });

  records.push({
    hash: checksum_(rawToken),
    expiresAt: now + PREVIEW_TOKEN_TTL_MS,
  });

  PropertiesService.getScriptProperties().setProperty(
    SCRIPT_KEYS.PREVIEW_TOKENS,
    JSON.stringify(records.slice(-MAX_ACTIVE_PREVIEW_TOKENS))
  );
  return rawToken;
}

function isValidPreviewToken_(rawToken) {
  if (!rawToken) {
    return false;
  }
  const now = Date.now();
  const candidateHash = checksum_(rawToken);
  const records = getPreviewTokenRecords_();
  const activeRecords = records.filter(function (record) {
    return Number(record.expiresAt) > now;
  });

  if (activeRecords.length !== records.length) {
    PropertiesService.getScriptProperties().setProperty(
      SCRIPT_KEYS.PREVIEW_TOKENS,
      JSON.stringify(activeRecords)
    );
  }

  return activeRecords.some(function (record) {
    return constantTimeEquals_(String(record.hash || ''), candidateHash);
  });
}

function getPreviewTokenRecords_() {
  const raw = PropertiesService.getScriptProperties()
    .getProperty(SCRIPT_KEYS.PREVIEW_TOKENS);
  if (!raw) {
    return [];
  }
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

function constantTimeEquals_(left, right) {
  if (left.length !== right.length) {
    return false;
  }
  let mismatch = 0;
  for (let index = 0; index < left.length; index += 1) {
    mismatch |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return mismatch === 0;
}

function getOrPromptForGamePreviewUrl_(forcePrompt) {
  const properties = PropertiesService.getScriptProperties();
  const current = properties.getProperty(SCRIPT_KEYS.GAME_PREVIEW_URL) || '';
  if (current && !forcePrompt) {
    return current;
  }

  const ui = SpreadsheetApp.getUi();
  const response = ui.prompt(
    '게임 미리보기 주소 설정',
    'Sites에 게시된 게임의 https 주소를 입력하세요.' +
      (current ? '\n현재 주소: ' + current : ''),
    ui.ButtonSet.OK_CANCEL
  );
  if (response.getSelectedButton() !== ui.Button.OK) {
    return '';
  }

  const url = response.getResponseText().trim();
  if (!/^https:\/\//i.test(url)) {
    ui.alert('https://로 시작하는 게임 주소를 입력해 주세요.');
    return '';
  }
  properties.setProperty(SCRIPT_KEYS.GAME_PREVIEW_URL, url);
  return url;
}

function addQueryParams_(url, params) {
  const parts = String(url).split('#');
  const base = parts.shift();
  const fragment = parts.length ? '#' + parts.join('#') : '';
  const separator = base.indexOf('?') >= 0 ? '&' : '?';
  const query = Object.keys(params).map(function (key) {
    return encodeURIComponent(key) + '=' + encodeURIComponent(params[key]);
  }).join('&');
  return base + separator + query + fragment;
}

function getSpreadsheet_() {
  // A container-bound web app can access its parent spreadsheet through the
  // active-document context while keeping the narrower @OnlyCurrentDoc scope.
  const active = SpreadsheetApp.getActiveSpreadsheet();
  if (active) {
    PropertiesService.getScriptProperties().setProperty(
      SCRIPT_KEYS.SPREADSHEET_ID,
      active.getId()
    );
    return active;
  }

  const properties = PropertiesService.getScriptProperties();
  const configuredId = properties.getProperty(SCRIPT_KEYS.SPREADSHEET_ID);
  if (configuredId) {
    return SpreadsheetApp.openById(configuredId);
  }

  throw new Error('SPREADSHEET_ID가 설정되지 않았습니다. setupContentSheets()를 먼저 실행해 주세요.');
}

function ensureSheet_(spreadsheet, name, headers) {
  let sheet = spreadsheet.getSheetByName(name);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(name);
  }

  if (sheet.getLastRow() === 0) {
    ensureRowCapacity_(sheet, 2);
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  } else {
    assertHeaders_(sheet, headers);
  }

  sheet.setFrozenRows(1);
  sheet.getRange(1, 1, 1, headers.length)
    .setFontWeight('bold')
    .setBackground('#E8F0FE');
  return sheet;
}

function assertHeaders_(sheet, expectedHeaders) {
  if (!sheet) {
    throw new Error('필요한 시트를 찾을 수 없습니다.');
  }
  const actual = sheet.getRange(1, 1, 1, expectedHeaders.length)
    .getDisplayValues()[0]
    .map(function (value) { return String(value).trim(); });
  if (actual.join('|') !== expectedHeaders.join('|')) {
    throw new Error(
      sheet.getName() + ' 1행 헤더가 예상 구조와 다릅니다. 필요한 순서: ' +
      expectedHeaders.join(', ')
    );
  }
}

function applyEditorValidation_(draftSheet, schemaSheet) {
  ensureRowCapacity_(draftSheet, 1000);
  ensureRowCapacity_(schemaSheet, 1000);

  const draftStatusRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(DRAFT_STATUSES, true)
    .setAllowInvalid(false)
    .setHelpText('공개본과 같음, 초안, 검토 요청, 승인, 보류, 비활성 중 하나를 선택하세요.')
    .build();
  draftSheet.getRange(2, 6, 999, 1).setDataValidation(draftStatusRule);

  const schemaStatusRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(SCHEMA_STATUSES, true)
    .setAllowInvalid(false)
    .setHelpText('필수, 선택, 비활성 중 하나를 선택하세요.')
    .build();
  schemaSheet.getRange(2, 6, 999, 1).setDataValidation(schemaStatusRule);

  const maxLengthRule = SpreadsheetApp.newDataValidation()
    .requireNumberGreaterThan(0)
    .setAllowInvalid(false)
    .setHelpText('비워 두거나 1 이상의 정수를 입력하세요.')
    .build();
  draftSheet.getRange(2, 5, 999, 1).setDataValidation(maxLengthRule);
  schemaSheet.getRange(2, 5, 999, 1).setDataValidation(maxLengthRule);
}

function addWarningProtection_(sheet, description) {
  try {
    const protections = sheet.getProtections(SpreadsheetApp.ProtectionType.SHEET);
    const exists = protections.some(function (protection) {
      return protection.getDescription() === description;
    });
    if (!exists) {
      sheet.protect().setDescription(description).setWarningOnly(true);
    }
  } catch (error) {
    // Google Sheets native tables can reject whole-sheet protections.
    // The editor still works; keep the existing table/range safeguards.
    console.warn('Protection skipped for ' + sheet.getName() + ': ' + error.message);
  }
}

function ensureRowCapacity_(sheet, requiredLastRow) {
  if (sheet.getMaxRows() < requiredLastRow) {
    sheet.insertRowsAfter(sheet.getMaxRows(), requiredLastRow - sheet.getMaxRows());
  }
}

function validationResult_(rowCount, errors, warnings) {
  return {
    ok: errors.length === 0,
    checked_at: new Date().toISOString(),
    row_count: rowCount,
    errors: errors,
    warnings: warnings,
  };
}

function issue_(sheet, row, key, column, message) {
  return {
    sheet: sheet,
    row: row,
    key: key,
    column: column,
    message: message,
  };
}

function showValidationReport_(report) {
  const title = report.ok ? '문장 검사 통과' : '문장 검사 실패';
  const issues = report.errors.concat(report.warnings);
  const lines = [
    '검사 행: ' + report.row_count,
    '오류: ' + report.errors.length,
    '경고: ' + report.warnings.length,
  ];

  issues.slice(0, VALIDATION_DISPLAY_LIMIT).forEach(function (issue) {
    const location = [
      issue.sheet,
      issue.row ? issue.row + '행' : '',
      issue.key || '',
      issue.column || '',
    ].filter(Boolean).join(' / ');
    lines.push((location ? location + ': ' : '') + issue.message);
  });
  if (issues.length > VALIDATION_DISPLAY_LIMIT) {
    lines.push('외 ' + (issues.length - VALIDATION_DISPLAY_LIMIT) + '건');
  }

  SpreadsheetApp.getUi().alert(title, lines.join('\n'), SpreadsheetApp.getUi().ButtonSet.OK);
}

function extractPlaceholders_(text) {
  const matches = String(text || '').match(/\{[A-Za-z0-9_.-]+\}/g) || [];
  return matches.slice().sort();
}

function textLength_(text) {
  return Array.from(String(text || '')).length;
}

function makeReleaseId_(date, checksum) {
  return Utilities.formatDate(date, 'UTC', 'yyyyMMdd-HHmmss-SSS') + '-' + checksum.slice(0, 8);
}

function restoreProperty_(properties, key, previousValue) {
  if (previousValue === null || previousValue === undefined) {
    properties.deleteProperty(key);
    return;
  }
  properties.setProperty(key, previousValue);
}

function checksum_(text) {
  const digest = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    String(text),
    Utilities.Charset.UTF_8
  );
  return digest.map(function (byte) {
    const unsigned = byte < 0 ? byte + 256 : byte;
    return ('0' + unsigned.toString(16)).slice(-2);
  }).join('');
}

function currentUserEmail_() {
  return Session.getActiveUser().getEmail() ||
    Session.getEffectiveUser().getEmail() ||
    'unknown';
}

function escapeHtml_(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
