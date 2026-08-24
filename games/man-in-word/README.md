# Man in Word

편지의 빈칸을 행동 단서로 다시 해석하는 짧은 관찰 퍼즐입니다. 현재 브라우저 프로토타입의 공개 제목은 `말보다 먼저`입니다.

## 현재 구현

- 편지 읽기, 기억 장면 탐색, 표현 카드 수집, 빈칸 배치, 의미 반전, 엔딩까지 한 사이클이 동작합니다.
- 마우스·터치·키보드 입력과 Web Audio 효과음을 사용합니다.
- `web/`은 Vite 정적 게임이고, `site/`는 게임을 감싸는 별도 사이트 프로젝트입니다.

## 실행

```bash
cd games/man-in-word/web
npm install
npm run dev
```

정적 빌드는 `npm run build`로 만듭니다. 사이트 래퍼는 `cd ../site && npm install && npm run dev`로 별도 실행합니다.

## 문서

- [게임성 설계 제안](./docs/DESIGN_PROPOSALS.md) — 아직 채택되지 않은 후속 설계안
- [웹 프로젝트 안내](./web/README.md)

대표 QA 캡처:

- [데스크톱 타이틀](./docs/assets/qa/title-desktop.png)
- [모바일 엔딩](./docs/assets/qa/ending-mobile.png)

## 검증 기록

- 2026-08-24 공개 저장소 정리 뒤 `web/`과 `site/` 프로덕션 빌드가 통과했고, 두 빌드 모두 `THIRD_PARTY_LICENSES.md`를 생성했다.

## 현재 제한

- 기억 장면과 단서 조합은 한 세트뿐입니다.
- 정확한 문구와 후속 추리 규칙은 확정 전입니다.
- 설계 제안 문서의 가설 보드·상태 변화·힌트 구조는 현재 구현 사실이 아닙니다.
