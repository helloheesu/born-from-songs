# 야간비행 웹 프로토타입

추진, 중력, 상대속도 기반 궤도 공명, 색 교환, 노화와 소멸을 90초 회차에 담은
2D Canvas 물리 프로토타입입니다.

```bash
npm install
npm run dev
```

`npm run build`는 상대 경로 기반 정적 결과물을 `dist/`에 만들고, 번들에 포함된
제3자 소프트웨어 고지를 `dist/THIRD_PARTY_LICENSES.md`에 생성합니다. 방향키·WASD,
화면 방향키와 포인터 추진을 지원하며 Space 또는 중앙 버튼으로 감속합니다.
기획 경계는 [게임 루트 문서](../README.md)와
[규칙 재설계안](../docs/GAME_RULES_PROPOSAL.md)에서 확인합니다.
