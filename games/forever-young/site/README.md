# GO AHEAD — 배포 래퍼

`../web/`의 정적 게임 빌드를 전체 화면으로 제공하는 독립 Sites 래퍼입니다.

```bash
npm install
npm run sync-game
npm run build
```

`sync-game`은 `../web/dist/`를 `public/game/`에 갱신합니다. 배포 전에는 항상 이
명령을 실행하고 변경된 정적 파일을 함께 커밋합니다. 실제 `.openai/hosting.json`
은 로컬 배포 설정이므로 Git에서 제외합니다.
