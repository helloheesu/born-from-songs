# 저장소 구조와 이전 경로

## 정식 구조

```text
.
├── README.md
├── AGENTS.md
├── CREDITS.md
├── RIGHTS.md
├── THIRD_PARTY_NOTICES.md
├── docs/
│   └── project/              # 프로젝트 공통 공개 문서
├── games/
│   ├── man-in-word/
│   │   ├── README.md
│   │   ├── docs/
│   │   ├── web/
│   │   ├── site/
│   │   └── tools/              # 이 게임 전용 편집·생성 보조 도구
│   ├── sister-wakeup/
│   │   ├── README.md
│   │   ├── docs/
│   │   ├── web/
│   │   └── site/
│   ├── forever-young/{README.md,docs/,web/}
│   ├── breakup-notice/{README.md,docs/,web/}
│   └── night-flight/{README.md,docs/,web/}
├── derived/                  # 이전 공개 문서 링크용 안내 파일만 추적
└── private/                  # 로컬 전용, 실제 내용은 Git 비추적
```

`games/<slug>/`가 게임의 소유 경계다. `web/`은 실행 가능한 게임 앱, `site/`는 있는 경우에만 사용하는 별도 사이트 래퍼, `docs/`는 그 게임의 공개 기획·검증 기록이다.

## 이전 코드 경로 변환표

| 이전 경로 | 정식 경로 |
|---|---|
| `prototype/` | `games/man-in-word/web/` |
| `site-release/` | `games/man-in-word/site/` |
| `sister-wakeup/` | `games/sister-wakeup/web/` |
| `sister-wakeup-site/` | `games/sister-wakeup/site/` |
| `forever-young/` | `games/forever-young/web/` |
| `breakup-notice/` | `games/breakup-notice/web/` |
| `night-flight/` | `games/night-flight/web/` |

Man in Word 전용 문장 편집 도구도 함께 이동했다.

| 이전 경로 | 정식 경로 |
|---|---|
| `copy-editor-apps-script/` | `games/man-in-word/tools/copy-editor/apps-script/` |
| `spreadsheet-build/` | `games/man-in-word/tools/copy-editor/build/` |

## 링크 호환 방식

- 구조를 옮긴 로컬 작업 폴더에는 이전 코드 경로를 새 정식 경로로 연결하는 호환 별칭을 둘 수 있다.
- 이 별칭은 로컬 전용이며 Git이 추적하지 않는다. 새 clone에는 별칭이 없으므로 위 변환표로 경로를 바꿔야 한다.
- 공개 문서와 새 코드에서는 정식 경로만 사용한다.
- 비공개 원본은 공개 링크나 실제 경로 대신 `SRC-*`로만 참조한다.
- GitHub의 예전 파일 URL이 자동으로 새 경로로 바뀌는 것은 아니다. 이전 커밋은 Git 이력에서 열고, 현재 파일은 이 문서의 변환표를 따라간다.

## 두 커밋으로 이전하는 이유

1. **공개 안전 기준선:** 이전 폴더 배치에서 공개 가능한 코드만 먼저 기록한다. 비공개 원본은 이 시점부터 커밋 대상이 아니다.
2. **구조 이전:** 같은 파일을 `games/<slug>/...`로 옮기고 공개 문서 인덱스를 갱신한다.

이렇게 하면 구조 변경과 콘텐츠 변경을 구분해서 검토할 수 있고, `git log --follow`로 파일 이동 이력을 추적하기 쉽다. 로컬 호환 별칭은 두 커밋 모두의 공개 기록 밖에 둔다.

## 문서 링크 규칙

- 프로젝트 공통 설명은 `docs/project/`에 둔다.
- 게임별 설명과 검증 기록은 `games/<slug>/docs/`에 둔다.
- README는 인덱스 역할만 하고, 긴 분석은 집중 문서로 분리한다.
- 공개 Markdown 링크는 저장소 내부의 정식 상대 경로를 사용한다.
- `derived/`에는 공개 가능한 이전 문서 경로의 짧은 이동 안내만 둔다. 개인 식별 이름이나 비공개 자료를 포함하는 이전 경로는 로컬 ignored 별칭으로만 유지한다.

## 사이트의 로컬 배포 설정

두 `site/`의 실제 `.openai/hosting.json`은 Git에서 제외한다. `npm run build`는
이 파일이 없는 fresh clone에서 빌드할 때만 로컬 전용 placeholder를 잠시 만들고,
빌드가 끝나면 원본 경로에서 지운다. 실제 로컬 설정이 있으면 수정하지 않는다.
placeholder 빌드는 배포 승인을 뜻하지 않으며, 외부 배포에는 별도의 실제 설정과
사용자 승인이 필요하다.
