# 문장 편집 워크북 생성기

`build_copy_editor.mjs`는 `games/man-in-word/web/src/content-manifest.json`을 읽어
루트의 ignored `outputs/copy-editor/`에 편집용 XLSX와 미리보기를 만든다.

이 유지보수 스크립트는 Codex 데스크톱에 번들된 `@oai/artifact-tool` 런타임을
사용한다. 로컬 `node_modules` 연결은 Git에 포함하지 않는다. 일반 협업자는
이 스크립트 대신 옆 폴더의 공개 [Apps Script 설치 안내](../apps-script/README.md)를
사용할 수 있다.

Codex 런타임이 연결된 환경에서는 다음처럼 실행한다.

```bash
node games/man-in-word/tools/copy-editor/build/build_copy_editor.mjs
```
