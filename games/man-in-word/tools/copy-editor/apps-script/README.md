# Google Sheets 문장 편집기 설치

이 폴더는 게임 코드와 분리된 Google Sheets 바운드 Apps Script 초안이다. 공동 편집자는 설치 후 `DRAFT` 탭과 `게임 문장` 메뉴만 사용하면 된다.

## 1. 설치

1. 공동 Google Sheet를 만들고 신뢰하는 편집자 계정에만 편집 권한을 준다.
2. 시트에서 **확장 프로그램 → Apps Script**를 연다.
3. [Code.gs](./Code.gs)의 내용을 Apps Script의 `Code.gs`에 붙여 넣고 저장한다.
4. Apps Script에서 `setupContentSheets`를 한 번 실행하고 권한을 승인한다.
5. 시트를 새로고침한다. 상단에 **게임 문장** 메뉴가 생긴다.

`Code.gs`의 `@OnlyCurrentDoc` 표시는 이 바운드 스크립트의 스프레드시트 권한을 현재 문서로 제한한다. 제거하거나 독립형 Apps Script 프로젝트로 옮기지 않는다.

`setupContentSheets`는 기존 내용을 지우지 않고 다음 탭을 준비한다.

- `DRAFT`: 실제 문장 편집
- `SCHEMA`: 허용 key와 장면, 글자 제한 정의
- `PUBLISHED`: 마지막 공개본
- `RELEASES`: 발행 및 복원 스냅샷

`DRAFT`, `SCHEMA`, `PUBLISHED`의 콘텐츠 열 순서는 다음과 같다. `RELEASES`에는 이 열들 앞에 release 메타데이터 열이 추가된다.

`key, scene, context, text, max_length, status, note`

- `SCHEMA.status`: `필수`, `선택`, `비활성`
- `DRAFT.status`: `공개본과 같음`, `초안`, `검토 요청`, `승인`, `보류`, `비활성`
- DRAFT의 `text` 열만 수정하면 해당 행의 status가 자동으로 `초안`이 된다.
- `SCHEMA.text`에 `{playerName}` 같은 단일 중괄호 변수를 적으면 DRAFT에도 같은 변수가 있어야 한다. 변수 이름에는 영문, 숫자, `_`, `.`, `-`만 사용한다.
- 공개본 반영이 끝나면 비활성 행을 제외한 DRAFT status가 `공개본과 같음`으로 바뀐다.
- `비활성`인 DRAFT 행만 공개본에서 제외된다. `초안`, `검토 요청`, `승인`, `보류`는 협업 상태 표시이며 발행 자체를 막지는 않는다.

## 2. 웹 앱 배포

1. Apps Script에서 **배포 → 새 배포 → 웹 앱**을 선택한다.
2. **실행 사용자: 나**, **액세스 권한: 모든 사용자**로 배포한다.
3. 배포 URL을 보관하고 게임에 콘텐츠 API 주소로 한 번 설정한다. 이 URL을 매개변수 없이 호출하면 `PUBLISHED` JSON만 `text/plain`으로 반환한다.
4. 시트에서 처음 **게임 문장 → 게임 미리보기**를 누르면 나오는 창에 Sites 게임 URL을 입력한다. 이후 주소는 Script Properties에 저장된다.

공개 배포에는 테스트용 `/dev`가 아니라 `/exec` URL을 사용한다. 배포 소유자 계정이 사라지면 웹 앱도 영향을 받으므로 공동 프로젝트용 계정의 소유권 정책도 정해 둔다.

## 3. 게임 연동 계약

게임은 한 번만 다음 기능을 구현하면 된다. 이 폴더에서는 Site 체크아웃을 수정하지 않는다.

- 일반 실행: Apps Script `/exec` URL 또는 `/exec?channel=PUBLISHED`에서 공개 문장을 읽는다.
- 미리보기 링크: Apps Script 메뉴가 게임 URL을 `?copy=draft&token=...` 형태로 연다.
- 게임은 `copy=draft`일 때 같은 토큰을 Apps Script의 `/exec?channel=DRAFT&token=...`로 전달해 DRAFT를 읽는다. Apps Script API에 `copy=draft`를 직접 보내면 DRAFT가 아니라 기본 PUBLISHED가 반환된다.
- 정상 응답의 기본 계약은 `ok`, 소문자 `channel`, `releaseId`, `updatedAt`, `copy`다. `copy`는 `{ key: text }` 객체다.
- `release_id`, `generated_at`, `checksum`, `items`도 상세 정보와 호환성을 위해 함께 반환한다.
- 응답이 잘못됐거나 통신이 실패하면 게임에 내장된 마지막 정상 문장으로 실행한다.
- 문장은 HTML로 삽입하지 말고 텍스트로 렌더링한다.

`게임 미리보기` 메뉴는 검사에 통과한 DRAFT용 2시간짜리 토큰을 발급한다. 토큰 원문은 Script Properties에 저장하지 않으며 최대 5개만 동시에 유지한다. 링크가 노출됐으면 Apps Script에서 `invalidatePreviewTokens`를 실행한다.

## 4. 편집 순서

1. `DRAFT` 문장을 수정한다.
2. **게임 문장 → 문장 검사**를 실행한다.
3. **게임 미리보기**로 실제 흐름을 확인한다.
4. **공개본 반영**을 누른다.
5. 문제가 생기면 **이전 버전 복원**을 누른다. 복원 결과도 새 release로 기록된다.

`SCHEMA`, `PUBLISHED`, `RELEASES`의 보호는 실수 방지 경고일 뿐 보안 장치가 아니다. Google Sheets의 네이티브 표가 전체 시트 보호를 거부하면 기존 범위·표 보호만 유지된다. 신뢰하는 편집자에게만 원본 시트 접근 권한을 준다.
