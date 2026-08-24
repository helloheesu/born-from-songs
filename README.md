# 게임 프로토타입 모노레포

서로 독립적인 다섯 게임의 기획 문서와 실행 가능한 코드를 한 저장소에서 관리한다. 공개 저장소에는 공유 가능한 문서와 코드만 포함하고, 원본 자료는 같은 작업 폴더 안의 Git 비추적 영역에 둔다.

## 현재 관리 범위

| 게임 | 웹 앱 | 사이트 래퍼 | 문서 |
|---|---|---|---|
| Man in Word (`man-in-word`) | [`games/man-in-word/web/`](games/man-in-word/web/) | [`games/man-in-word/site/`](games/man-in-word/site/) | [`games/man-in-word/README.md`](games/man-in-word/README.md) |
| Sister Wakeup (`sister-wakeup`) | [`games/sister-wakeup/web/`](games/sister-wakeup/web/) | [`games/sister-wakeup/site/`](games/sister-wakeup/site/) | [`games/sister-wakeup/README.md`](games/sister-wakeup/README.md) |
| Forever Young (`forever-young`) | [`games/forever-young/web/`](games/forever-young/web/) | — | [`games/forever-young/README.md`](games/forever-young/README.md) |
| 이별선고 (`breakup-notice`) | [`games/breakup-notice/web/`](games/breakup-notice/web/) | — | [`games/breakup-notice/README.md`](games/breakup-notice/README.md) |
| 야간비행 (`night-flight`) | [`games/night-flight/web/`](games/night-flight/web/) | — | [`games/night-flight/README.md`](games/night-flight/README.md) |

현재 범위 밖의 후보는 이 인덱스와 활성 작업 대상에 포함하지 않는다.

## 실행

각 게임은 독립 앱이다. 실행할 게임의 `web/`에서 명령을 실행한다.

```bash
cd games/man-in-word/web
npm install
npm run dev
```

빌드는 같은 위치에서 `npm run build`를 사용한다. `site/`가 있는 게임은 해당 폴더의 별도 `package.json`과 명령을 따른다.

## 문서 인덱스

- [프로젝트 개요](docs/project/PROJECT_OVERVIEW.md)
- [게임 인덱스](docs/project/GAME_INDEX.md)
- [결정 기록](docs/project/DECISION_LOG.md)
- [저장소 구조와 이전 경로](docs/project/REPOSITORY_MAP.md)
- [공개용 출처 레지스터](docs/project/SOURCE_REGISTER.md)
- [GitHub 공개 전 점검](docs/project/PUBLISHING_CHECKLIST.md)
- [작업자 지침](AGENTS.md)

## 공개 경계

- Git이 추적하는 문서에는 공개 가능한 요약과 `SRC-*` 식별자만 기록한다.
- 원본 자료, 연락 정보, 비공개 대화, 로컬 배포 설정은 Git에 올리지 않는다.
- 예전 코드 경로의 로컬 별칭은 호환용일 뿐이다. 문서와 새 작업은 `games/<slug>/...` 정식 경로를 사용한다.

저장소 이름, 라이선스, 공개 크레딧 표기, 배포 방식은 아직 결정하지 않았다.
