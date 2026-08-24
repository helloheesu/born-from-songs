# Forever Young

타격 판정창의 변화로 성장·노화·은퇴·훈련·복귀를 한 사이클에 담은 타이밍 야구 게임입니다. 현재 공개 제목은 `GO AHEAD — 끝나지 않은 타석`입니다.

## 현재 구현

- 한 번의 스윙 입력으로 시즌 진행부터 복귀 홈런까지 완주할 수 있습니다.
- 판정창이 성장기에 넓어지고 노화 구간에서 좁아집니다.
- 마우스·터치·키보드를 지원하며 외부 이미지·음원 없이 동작합니다.
- `web/`은 Vite 정적 게임이고, `site/`는 공개 배포용 전체 화면 래퍼입니다.

## 실행

```bash
cd games/forever-young/web
npm install
npm run dev
```

정적 빌드는 `npm run build`, 빌드 미리보기는 `npm run preview`로 실행합니다.
사이트 래퍼는 `cd ../site && npm install && npm run sync-game && npm run build`로
별도 갱신·검증합니다.

## 문서

- [구현 보고서](./docs/IMPLEMENTATION_REPORT.md)
- [웹 프로젝트 안내](./web/README.md)

## 현재 제한

- 주루·외야 수비·송구는 구현하지 않았습니다.
- 시즌 수, 판정 범위, 은퇴 후 일상과 훈련 횟수는 프로토타입용 임시값입니다.
- 실제 휴대폰 터치 감각과 기기별 음량 균형은 실기기 확인이 남아 있습니다.
