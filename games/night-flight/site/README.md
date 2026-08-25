# 야간비행 — 배포 래퍼

`../web/`의 정적 게임 빌드를 전체 화면으로 제공하고, 익명 궤도 메시지를 D1에
저장하는 독립 Sites 래퍼입니다.

```bash
npm install
npm run sync-game
npm run db:generate
npm run build
```

`sync-game`은 `../web/dist/`를 `public/game/`에 갱신합니다. 배포 전에는 항상 이
명령을 실행하고 변경된 정적 파일을 함께 커밋합니다. 실제 `.openai/hosting.json`
은 로컬 배포 설정이므로 Git에서 제외합니다. 이 파일의 `d1` binding은 `DB`이며,
Drizzle migration은 `drizzle/`에서 생성되어 배포 archive에 포함됩니다.

- `GET /api/messages?limit=6`: 공개 상태의 익명 메시지를 최대 6개 반환
- `POST /api/messages`: 60자 메시지, 1~4개 색, 익명 client token을 검증해 저장
- 서버는 욕설·위협·링크·연락처·긴 숫자열을 우선 차단하고, 같은 token의 저장을
  시간당 4회로 제한합니다.
