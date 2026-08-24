# 시스터 깨우기

소리·빛·온도를 조절해 분노가 누적되기 전에 잠든 인물을 깨우는 환경 조절 퍼즐입니다.

## 현재 구현

- `Deep Sleep → REM → Almost Awake → Awake` 진행과 A+/F 결과가 동작합니다.
- 소리부터 시작해 빛과 온도가 차례로 열립니다.
- 마우스·터치·키보드를 지원하고, 마이크는 선택 입력입니다.
- `web/`은 Vite 정적 게임이고, `site/`는 게임을 감싸는 별도 사이트 프로젝트입니다.

## 실행

```bash
cd games/sister-wakeup/web
npm install
npm run dev
```

정적 빌드는 `npm run build`로 만듭니다. 사이트 래퍼는 `cd ../site && npm install && npm run dev`로 별도 실행합니다.

## 문서

- [구현 보고서](./docs/IMPLEMENTATION_REPORT.md)
- [웹 프로젝트 안내](./web/README.md)

## 현재 제한

- 제한시간, 적정 범위, 점수는 프로토타입용 임시값입니다.
- 실제 마이크 장치 입력과 기기별 음량 균형은 실기기 검증이 남아 있습니다.
- 실제 조도·온도 센서는 연결하지 않았습니다.
