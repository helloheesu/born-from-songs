# 게임 인덱스

이 문서는 현재 활성 범위의 게임만 가리킨다. 핵심 상호작용은 저장소에 있는 구현과 기존 공개 요약에서 복원한 **구현 사실**이며, 새로운 기획 결정이 아니다.

| slug | 게임 | 구현된 핵심 상호작용 요약 | 실행 코드 | 사이트 래퍼 | 상세 문서 |
|---|---|---|---|---|---|
| `man-in-word` | Man in Word | 단어 안에서 이동한다 | [`web/`](../../games/man-in-word/web/) | [`site/`](../../games/man-in-word/site/) | [`README.md`](../../games/man-in-word/README.md) |
| `sister-wakeup` | Sister Wakeup | 환경을 조절한다 | [`web/`](../../games/sister-wakeup/web/) | [`site/`](../../games/sister-wakeup/site/) | [`README.md`](../../games/sister-wakeup/README.md) |
| `forever-young` | Forever Young | 정확한 순간에 스윙한다 | [`web/`](../../games/forever-young/web/) | — | [`README.md`](../../games/forever-young/README.md) |
| `breakup-notice` | 이별선고 | 누르는 길이를 달리해 뛰거나 사랑을 보낸다 | [`web/`](../../games/breakup-notice/web/) | — | [`README.md`](../../games/breakup-notice/README.md) |
| `night-flight` | 야간비행 | 유영해 방문하고 글자를 조합한다 | [`web/`](../../games/night-flight/web/) | — | [`README.md`](../../games/night-flight/README.md) |

## 범위 규칙

- 게임 하나의 기획·구현·검증 기록은 해당 `games/<slug>/` 아래에서 완결한다.
- 게임 간 직접 import, 런타임 상태 공유, 한 앱 안의 모드 통합은 현재 구조에 포함하지 않는다.
- 현재 범위 밖의 후보는 이 인덱스에 추가하지 않는다. 사용자가 활성 범위로 채택한 뒤에만 slug와 작업 폴더를 만든다.
