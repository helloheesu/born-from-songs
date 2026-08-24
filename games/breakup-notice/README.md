# 이별선고

자동 질주 중 점프와 사랑 공격으로 이별의 말을 피하다가 마지막 문장을 받아들이는 짧은 아케이드 러너입니다. 현재 공개 제목은 `마지막 문장`입니다.

## 현재 구현

- `title → running → final-line → ending` 한 사이클이 동작합니다.
- 짧게 누르면 점프하고 길게 누르면 사랑 공격을 보냅니다.
- 마우스·터치·키보드와 reduced-motion 대체 스타일을 지원합니다.
- `web/`은 Vite 정적 게임이고, `site/`는 공개 배포용 전체 화면 래퍼입니다.

## 실행

```bash
cd games/breakup-notice/web
npm install
npm run dev
```

정적 빌드는 `npm run build`로 만듭니다. 사이트 래퍼는
`cd ../site && npm install && npm run sync-game && npm run build`로 별도
갱신·검증합니다.

## 문서

- [창작자 피드백](./docs/CREATOR_FEEDBACK.md)
- [구현 보고서](./docs/IMPLEMENTATION_REPORT.md)
- [웹 프로젝트 안내](./web/README.md)

## 검증 기록

- 2026-08-24: 게임 빌드 동기화, 사이트 프로덕션 빌드와 린트, 의존성 감사
  0건을 확인했다.
- 공개 배포 뒤 사이트 시작 경로, 게임 실행 경로, 공유 이미지 경로가 모두
  HTTP 200으로 응답하는 것을 확인했다.

## 현재 제한

- 아케이드 러너와 편지 재구성 중 전자를 택한 것은 이 프로토타입의 구현 가정입니다.
- 층 수, 진행 시간, 문구, 판정 수치는 확정 기획이 아닙니다.
- 최종 아트·음향·기록 기능은 구현하지 않았습니다.
