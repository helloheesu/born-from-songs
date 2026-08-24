(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),t.credentials=e.crossOrigin===`use-credentials`?`include`:e.crossOrigin===`anonymous`?`omit`:`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e=JSON.parse(`[{"key":"global.brand","scene":"공통","context":"게임 상단 브랜드명","text":"말보다 먼저","maxLength":20,"variables":[],"note":"모든 장면에서 공통으로 사용"},{"key":"global.progress.letter","scene":"공통","context":"진행 단계 1","text":"편지","maxLength":8,"variables":[],"note":"짧게 유지"},{"key":"global.progress.memory","scene":"공통","context":"진행 단계 2","text":"기억","maxLength":8,"variables":[],"note":"짧게 유지"},{"key":"global.progress.assembly","scene":"공통","context":"진행 단계 3","text":"조합","maxLength":8,"variables":[],"note":"짧게 유지"},{"key":"global.progress.reveal","scene":"공통","context":"진행 단계 4","text":"진심","maxLength":8,"variables":[],"note":"짧게 유지"},{"key":"global.sound.on","scene":"공통","context":"효과음이 켜진 상태","text":"소리 켬","maxLength":12,"variables":[],"note":"버튼 문구"},{"key":"global.sound.off","scene":"공통","context":"효과음이 꺼진 상태","text":"소리 끔","maxLength":12,"variables":[],"note":"버튼 문구"},{"key":"title.eyebrow","scene":"시작","context":"제목 위 작은 문구","text":"ONE-CYCLE PROTOTYPE","maxLength":32,"variables":[],"note":"영문 표기 가능"},{"key":"title.heading","scene":"시작","context":"게임 제목","text":"말보다 먼저","maxLength":20,"variables":[],"note":"브랜드명과 함께 바꾸면 좋음"},{"key":"title.lede","scene":"시작","context":"제목 아래 두 줄 소개","text":"읽히지 않던 문장은\\n행동을 보고 나서야 완성된다.","maxLength":70,"variables":[],"note":"줄바꿈 가능"},{"key":"title.start_button","scene":"시작","context":"게임 시작 버튼","text":"편지를 읽는다","maxLength":24,"variables":[],"note":"동사형 권장"},{"key":"title.meta","scene":"시작","context":"플레이 방식과 시간","text":"포인트 앤 클릭 · 약 2분 · 마우스/터치/키보드","maxLength":60,"variables":[],"note":"실제 지원 범위와 일치해야 함"},{"key":"title.floating_a","scene":"시작","context":"봉투 주변 떠다니는 말 1","text":"피하게 돼","maxLength":18,"variables":[],"note":"짧은 표현"},{"key":"title.floating_b","scene":"시작","context":"봉투 주변 떠다니는 말 2","text":"모른 척해 줘","maxLength":18,"variables":[],"note":"짧은 표현"},{"key":"title.prototype_note","scene":"시작","context":"화면 하단 프로토타입 안내","text":"임시 문장과 장면을 채운 첫 번째 플레이 초안","maxLength":60,"variables":[],"note":"테스트 단계 안내"},{"key":"letter.eyebrow","scene":"편지","context":"장면 번호","text":"01 · THE LETTER","maxLength":24,"variables":[],"note":"짧게 유지"},{"key":"letter.heading","scene":"편지","context":"장면 제목","text":"문장 사이가 비어 있다.","maxLength":36,"variables":[],"note":"한 줄 권장"},{"key":"letter.context","scene":"편지","context":"장면 설명","text":"그 사람은 편지를 건넨 뒤, 다시 나를 피하기 시작했다.","maxLength":80,"variables":[],"note":"편지 전 상황"},{"key":"letter.to","scene":"편지","context":"편지 첫 줄","text":"너에게.","maxLength":20,"variables":[],"note":"모든 편지 화면에서 재사용"},{"key":"letter.avoid_line","scene":"편지","context":"편지의 첫 문장","text":"네가 가까이 오면 자꾸 피하게 돼.","maxLength":60,"variables":[],"note":"모든 편지 화면에서 재사용"},{"key":"letter.rain_line","scene":"편지","context":"첫 빈칸이 포함된 문장","text":"비가 세지자, 나는 {fragment}.","maxLength":90,"variables":["fragment"],"note":"{fragment}를 삭제하지 말 것"},{"key":"letter.turn_line","scene":"편지","context":"둘째 빈칸이 포함된 문장","text":"네가 돌아보자, {fragment}.","maxLength":90,"variables":["fragment"],"note":"{fragment}를 삭제하지 말 것"},{"key":"letter.request_line","scene":"편지","context":"편지의 부탁 문장","text":"부탁이야. 오늘까지만 모른 척해 줘.","maxLength":70,"variables":[],"note":"모든 편지 화면에서 재사용"},{"key":"letter.sign","scene":"편지","context":"편지 서명","text":"— 이름 대신 번진 잉크","maxLength":32,"variables":[],"note":"도입 편지에서 사용"},{"key":"letter.enter_memory_button","scene":"편지","context":"기억 장면으로 이동","text":"비 오던 날을 떠올린다","maxLength":30,"variables":[],"note":"버튼 문구"},{"key":"letter.rail_label","scene":"편지","context":"우측 정보 패널 제목","text":"LETTER","maxLength":16,"variables":[],"note":"영문 표기 가능"},{"key":"letter.rail_read_label","scene":"편지","context":"읽힌 문장 통계 이름","text":"읽힌 문장","maxLength":16,"variables":[],"note":"우측 편지 정보"},{"key":"letter.rail_blank_label","scene":"편지","context":"빈칸 통계 이름","text":"빈칸","maxLength":12,"variables":[],"note":"우측 편지 정보"},{"key":"letter.rail_sender_label","scene":"편지","context":"보낸 사람 통계 이름","text":"보낸 사람","maxLength":16,"variables":[],"note":"우측 편지 정보"},{"key":"letter.rail_sender_unknown","scene":"편지","context":"보낸 사람 값","text":"알 수 없음","maxLength":20,"variables":[],"note":"우측 편지 정보"},{"key":"letter.rail_note","scene":"편지","context":"편지 정보 하단 메모","text":"같은 문장도 행동을 보고 나면 다르게 읽힐 수 있다.","maxLength":90,"variables":[],"note":"우측 편지 정보"},{"key":"memory.eyebrow","scene":"기억","context":"장면 번호","text":"02 · THE MEMORY","maxLength":24,"variables":[],"note":"짧게 유지"},{"key":"memory.heading","scene":"기억","context":"장면 제목","text":"비 오던 날, 정류장","maxLength":32,"variables":[],"note":"한 줄 권장"},{"key":"memory.instruction","scene":"기억","context":"관찰 안내","text":"그 사람의 행동에서 편지의 빈말을 찾아보자.","maxLength":70,"variables":[],"note":"장면 상단 안내"},{"key":"memory.caption","scene":"기억","context":"장면 하단 캡션","text":"하교 후 6:18 · 빗소리가 대화를 대신했다.","maxLength":60,"variables":[],"note":"시간과 분위기"},{"key":"memory.observation_label","scene":"기억","context":"관찰 결과 표제","text":"관찰","maxLength":12,"variables":[],"note":"짧게 유지"},{"key":"memory.empty_observation","scene":"기억","context":"아직 행동을 누르지 않았을 때","text":"움직임이 남아 있는 두 곳을 눌러 보세요.","maxLength":70,"variables":[],"note":"관찰 패널과 피드백에서 재사용"},{"key":"memory.back_button","scene":"기억","context":"편지 화면으로 돌아가기","text":"← 편지 다시 보기","maxLength":24,"variables":[],"note":"버튼 문구"},{"key":"memory.assemble_button","scene":"기억","context":"조합 화면으로 이동","text":"찾은 말로 편지를 읽는다","maxLength":32,"variables":[],"note":"버튼 문구"},{"key":"memory.empty_inventory","scene":"기억","context":"표현을 아직 찾지 못했을 때","text":"장면을 관찰해\\n표현을 찾으세요.","maxLength":44,"variables":[],"note":"줄바꿈 가능"},{"key":"memory.hotspot_umbrella","scene":"기억","context":"우산 관찰 지점 설명","text":"기울어진 우산을 살펴본다","maxLength":36,"variables":[],"note":"접근성 안내에도 사용"},{"key":"memory.hotspot_shoulder","scene":"기억","context":"어깨 관찰 지점 설명","text":"젖은 어깨를 살펴본다","maxLength":36,"variables":[],"note":"접근성 안내에도 사용"},{"key":"memory.found_count","scene":"기억","context":"찾은 표현 수","text":"표현 {found} / {total}","maxLength":32,"variables":["found","total"],"note":"두 변수를 삭제하지 말 것"},{"key":"inventory.label","scene":"기억·조합","context":"표현 인벤토리 제목","text":"WORD INVENTORY","maxLength":24,"variables":[],"note":"영문 표기 가능"},{"key":"fragment.umbrella.label","scene":"기억","context":"우산 행동에서 얻는 표현","text":"우산을 네 쪽으로 기울였어","maxLength":36,"variables":[],"note":"카드와 편지에 함께 사용"},{"key":"fragment.umbrella.observation","scene":"기억","context":"우산을 눌렀을 때 관찰문","text":"비가 굵어질수록 우산은 내 쪽으로 기울었다. 그 사람의 바깥쪽 어깨는 점점 젖어 갔다.","maxLength":130,"variables":[],"note":"행동만 묘사"},{"key":"fragment.shoulder.label","scene":"기억","context":"어깨 행동에서 얻는 표현","text":"젖은 어깨를 뒤로 숨겼어","maxLength":36,"variables":[],"note":"카드와 편지에 함께 사용"},{"key":"fragment.shoulder.observation","scene":"기억","context":"어깨를 눌렀을 때 관찰문","text":"내가 돌아보자 그 사람은 몸과 가방을 틀어 젖은 어깨를 감췄다. 시선도 함께 피했다.","maxLength":130,"variables":[],"note":"행동만 묘사"},{"key":"assembly.eyebrow","scene":"조합","context":"장면 번호","text":"03 · REWRITE","maxLength":24,"variables":[],"note":"짧게 유지"},{"key":"assembly.heading","scene":"조합","context":"장면 제목","text":"기억의 순서대로 놓는다.","maxLength":36,"variables":[],"note":"한 줄 권장"},{"key":"assembly.instruction","scene":"조합","context":"카드 배치 안내","text":"카드를 끌어 놓거나, 카드를 고른 뒤 빈칸을 누르세요.","maxLength":90,"variables":[],"note":"마우스와 터치 모두 설명"},{"key":"assembly.slot_rain","scene":"조합","context":"첫 번째 빈칸 이름","text":"첫 번째 빈칸","maxLength":18,"variables":[],"note":"접근성 라벨에도 사용"},{"key":"assembly.slot_turn","scene":"조합","context":"두 번째 빈칸 이름","text":"두 번째 빈칸","maxLength":18,"variables":[],"note":"접근성 라벨에도 사용"},{"key":"assembly.slot_place","scene":"조합","context":"빈칸 보조 문구","text":"표현 놓기","maxLength":18,"variables":[],"note":"빈칸 안의 작은 문구"},{"key":"assembly.slot_remove","scene":"조합","context":"배치된 표현 보조 문구","text":"눌러서 되돌리기","maxLength":22,"variables":[],"note":"빈칸 안의 작은 문구"},{"key":"assembly.back_button","scene":"조합","context":"기억 화면으로 돌아가기","text":"← 기억 다시 보기","maxLength":24,"variables":[],"note":"버튼 문구"},{"key":"assembly.reveal_button","scene":"조합","context":"완성 편지로 이동","text":"편지를 끝까지 읽는다","maxLength":28,"variables":[],"note":"버튼 문구"},{"key":"assembly.blank_count","scene":"조합","context":"채운 빈칸 수","text":"빈칸 {filled} / {total}","maxLength":32,"variables":["filled","total"],"note":"두 변수를 삭제하지 말 것"},{"key":"assembly.inventory_note","scene":"조합","context":"카드 조작 안내","text":"카드를 끌거나 눌러서 편지의 빈칸에 놓을 수 있습니다.","maxLength":90,"variables":[],"note":"우측 인벤토리"},{"key":"assembly.card_placed","scene":"조합","context":"카드가 배치된 상태","text":"편지에 놓음","maxLength":16,"variables":[],"note":"상태 문구"},{"key":"assembly.card_selected","scene":"조합","context":"카드가 선택된 상태","text":"선택됨","maxLength":12,"variables":[],"note":"상태 문구"},{"key":"assembly.card_new","scene":"조합","context":"새 카드 상태","text":"NEW","maxLength":8,"variables":[],"note":"상태 문구"},{"key":"reveal.eyebrow","scene":"진심","context":"장면 번호","text":"04 · THE WHOLE LETTER","maxLength":32,"variables":[],"note":"짧게 유지"},{"key":"reveal.heading","scene":"진심","context":"장면 제목","text":"피한 시선 뒤에, 배려가 있었다.","maxLength":50,"variables":[],"note":"한 줄 권장"},{"key":"reveal.reason","scene":"진심","context":"행동의 이유","text":"네가 젖는 게 싫었고,\\n나 때문에 걱정하는 건 더 싫었어.","maxLength":100,"variables":[],"note":"줄바꿈 가능"},{"key":"reveal.confession","scene":"진심","context":"편지의 고백과 약속","text":"부탁이야.\\n내가 너를 좋아해서 피했다는 건 오늘까지만 모른 척해 줘.\\n내일은 내가 먼저 네 옆에 설게.","maxLength":160,"variables":[],"note":"줄바꿈 가능"},{"key":"reveal.finish_button","scene":"진심","context":"엔딩으로 이동","text":"편지를 접는다","maxLength":24,"variables":[],"note":"버튼 문구"},{"key":"reveal.rail_label","scene":"진심","context":"우측 해석 패널 제목","text":"INTERPRETATION","maxLength":24,"variables":[],"note":"영문 표기 가능"},{"key":"reveal.stamp_label","scene":"진심","context":"해석 도장 윗문구","text":"행동 해석","maxLength":16,"variables":[],"note":"짧게 유지"},{"key":"reveal.stamp_complete","scene":"진심","context":"해석 도장 완료 문구","text":"완료","maxLength":8,"variables":[],"note":"짧게 유지"},{"key":"reveal.interpretation","scene":"진심","context":"우측 해석 설명","text":"찾아낸 두 행동은 거절보다 배려에 가깝다. 남은 문장이 그 이유를 확인해 준다.","maxLength":120,"variables":[],"note":"행동과 결말의 연결 설명"},{"key":"ending.eyebrow","scene":"엔딩","context":"엔딩 종류","text":"LOVE END · FIRST DRAFT","maxLength":32,"variables":[],"note":"영문 표기 가능"},{"key":"ending.question","scene":"엔딩","context":"마지막 대사","text":"“같이 갈래?”","maxLength":24,"variables":[],"note":"따옴표 포함 가능"},{"key":"ending.approach_button","scene":"엔딩","context":"마지막 행동 버튼","text":"다가간다","maxLength":18,"variables":[],"note":"동사형 권장"},{"key":"ending.approach_complete","scene":"엔딩","context":"버튼을 누른 뒤의 문구","text":"한 걸음 가까이","maxLength":20,"variables":[],"note":"버튼 완료 상태"},{"key":"ending.final_line","scene":"엔딩","context":"최종 문장","text":"이번에는 빈칸이 없다.","maxLength":44,"variables":[],"note":"마지막 연출과 함께 표시"},{"key":"ending.replay_button","scene":"엔딩","context":"게임 다시 시작","text":"처음부터 다시 읽기 ↺","maxLength":28,"variables":[],"note":"버튼 문구"},{"key":"feedback.initial","scene":"피드백","context":"게임 시작 상태","text":"편지에는 아직 읽히지 않는 말이 있다.","maxLength":70,"variables":[],"note":"내부 안내와 접근성 공지"},{"key":"feedback.found","scene":"피드백","context":"새 표현을 찾았을 때","text":"새 표현을 찾았다: {label}","maxLength":80,"variables":["label"],"note":"{label}을 삭제하지 말 것"},{"key":"feedback.select","scene":"피드백","context":"카드를 선택했을 때","text":"“{label}” 카드를 놓을 빈칸을 고르세요.","maxLength":90,"variables":["label"],"note":"{label}을 삭제하지 말 것"},{"key":"feedback.cancel","scene":"피드백","context":"카드 선택 취소","text":"카드 선택을 취소했습니다.","maxLength":50,"variables":[],"note":"짧게 유지"},{"key":"feedback.wrong_shoulder","scene":"피드백","context":"어깨 카드를 첫 빈칸에 놓았을 때","text":"아직 네가 돌아보기 전이야. 기억의 순서가 어긋난다.","maxLength":90,"variables":[],"note":"오답 힌트"},{"key":"feedback.wrong_umbrella","scene":"피드백","context":"우산 카드를 둘째 빈칸에 놓았을 때","text":"그때 우산은 이미 네 쪽으로 기울어져 있었어.","maxLength":90,"variables":[],"note":"오답 힌트"},{"key":"feedback.placed_partial","scene":"피드백","context":"첫 표현을 맞게 놓았을 때","text":"문장 하나가 기억과 이어졌다.","maxLength":60,"variables":[],"note":"성공 피드백"},{"key":"feedback.placed_complete","scene":"피드백","context":"두 표현을 모두 맞게 놓았을 때","text":"기억의 순서가 맞았다. 흐린 잉크가 다시 번진다.","maxLength":90,"variables":[],"note":"성공 피드백"},{"key":"feedback.removed","scene":"피드백","context":"표현을 빈칸에서 뺐을 때","text":"표현을 인벤토리로 되돌렸습니다.","maxLength":60,"variables":[],"note":"조작 피드백"},{"key":"feedback.assembly_prompt","scene":"피드백","context":"조합 장면 입장","text":"표현 카드를 기억의 순서대로 놓으세요.","maxLength":70,"variables":[],"note":"조작 안내"},{"key":"feedback.choose_card","scene":"피드백","context":"빈칸을 먼저 눌렀을 때","text":"먼저 단어 인벤토리에서 표현 카드를 고르세요.","maxLength":80,"variables":[],"note":"조작 안내"},{"key":"feedback.reveal","scene":"피드백","context":"완성 편지 입장","text":"편지의 숨은 문장이 모두 드러났다.","maxLength":60,"variables":[],"note":"장면 전환 공지"},{"key":"feedback.ending","scene":"피드백","context":"엔딩 입장","text":"편지를 접었다. 이제 한 걸음 다가갈 차례다.","maxLength":80,"variables":[],"note":"장면 전환 공지"}]`),t=Object.fromEntries(e.map(e=>[e.key,e.text])),n=Object.fromEntries(e.map(e=>[e.key,e.maxLength])),r=Object.fromEntries(e.map(e=>[e.key,e.variables])),i=new Set(Object.keys(t)),a={...t},o={channel:`fallback`,releaseId:null,updatedAt:null,usingFallback:!0};function s(e){return a[e]??t[e]??e}function c(e,t){return s(e).replace(/\{([a-zA-Z0-9_]+)\}/g,(e,n)=>Object.prototype.hasOwnProperty.call(t,n)?String(t[n]):e)}function l(e){return e.replaceAll(`&`,`&amp;`).replaceAll(`<`,`&lt;`).replaceAll(`>`,`&gt;`).replaceAll(`"`,`&quot;`).replaceAll(`'`,`&#039;`)}function u(e){return l(s(e))}function d(e){return u(e).replaceAll(`
`,`<br />`)}function f(e,t){return l(s(e)).replace(/\{([a-zA-Z0-9_]+)\}/g,(e,n)=>Object.prototype.hasOwnProperty.call(t,n)?t[n]:e)}function p(){return{...o}}function m(e,t){let n=[...r[e]??[]].sort(),i=Array.from(t.matchAll(/\{([a-zA-Z0-9_]+)\}/g),e=>e[1]).sort();return n.length===i.length&&n.every((e,t)=>e===i[t])}function h(e){if(!e.copy||typeof e.copy!=`object`||Array.isArray(e.copy))return null;let t={};for(let[r,a]of Object.entries(e.copy)){if(!i.has(r)||typeof a!=`string`||a.trim().length===0)continue;let e=Math.max((n[r]??200)*2,256);a.length>e||m(r,a)&&(t[r]=a)}return Object.keys(t).length===i.size?t:null}async function g(){let e=new URLSearchParams(window.location.search),n=e.get(`copy`)===`draft`,r=e.get(`token`)??``,i=new URLSearchParams({channel:n?`draft`:`published`});n&&/^[a-zA-Z0-9_-]{16,160}$/.test(r)&&i.set(`token`,r);try{let e=await fetch(`/api/content?${i.toString()}`,{headers:{Accept:`application/json`},cache:n?`no-store`:`default`,signal:AbortSignal.timeout(6e3)});if(!e.ok)return;let r=await e.json(),s=h(r);if(!s)return;a={...t,...s},o={channel:r.channel===`draft`?`draft`:`published`,releaseId:typeof r.releaseId==`string`?r.releaseId:null,updatedAt:typeof r.updatedAt==`string`?r.updatedAt:null,usingFallback:!1}}catch{}}var _={umbrella:{id:`umbrella`,number:`01`,get label(){return s(`fragment.umbrella.label`)},get observation(){return s(`fragment.umbrella.observation`)},slot:`rain`,color:`blue`},shoulder:{id:`shoulder`,number:`02`,get label(){return s(`fragment.shoulder.label`)},get observation(){return s(`fragment.shoulder.observation`)},slot:`turn`,color:`pink`}},v=document.querySelector(`#app`),y=document.querySelector(`#live-region`),b=!0,x=null,S={scene:`title`,found:[],placed:{},selected:null,observation:null,feedback:s(`feedback.initial`),feedbackKind:`info`,errorSlot:null},C={title:0,letter:1,memory:2,assembly:3,reveal:4,ending:4};function w(){S.scene=`title`,S.found=[],S.placed={},S.selected=null,S.observation=null,S.feedback=s(`feedback.initial`),S.feedbackKind=`info`,S.errorSlot=null,J()}function T(e,t){S.scene=e,S.selected=null,S.errorSlot=null,t&&(S.feedback=t,S.feedbackKind=`info`),E(e===`reveal`||e===`ending`?`reveal`:`move`),J(!0)}function E(e){if(b)try{x??=new AudioContext;let t=x.currentTime;({move:[246.94],collect:[329.63,493.88],place:[392,523.25],error:[196,174.61],reveal:[261.63,329.63,392,523.25]})[e].forEach((n,r)=>{let i=x.createOscillator(),a=x.createGain();i.type=e===`error`?`triangle`:`sine`,i.frequency.value=n,a.gain.setValueAtTime(1e-4,t+r*.08),a.gain.exponentialRampToValueAtTime(.055,t+r*.08+.018),a.gain.exponentialRampToValueAtTime(1e-4,t+r*.08+.32),i.connect(a).connect(x.destination),i.start(t+r*.08),i.stop(t+r*.08+.34)})}catch{b=!1}}function D(){if(S.scene===`title`)return``;let e=C[S.scene];return`
    <ol class="progress" aria-label="게임 진행 단계">
      ${[s(`global.progress.letter`),s(`global.progress.memory`),s(`global.progress.assembly`),s(`global.progress.reveal`)].map((t,n)=>`
            <li class="${n+1<e?`done`:``} ${n+1===e?`current`:``}">
              <span>${n+1<e?`✓`:n+1}</span>${l(t)}
            </li>`).join(``)}
    </ol>`}function O(){return S.scene===`title`?``:`
    <header class="game-header">
      <button class="brand" type="button" data-action="restart" aria-label="처음 화면으로 돌아가기">
        <span class="brand-mark" aria-hidden="true"></span>
        <span>${u(`global.brand`)}</span>
      </button>
      ${D()}
      <button class="icon-button" type="button" data-action="toggle-sound" aria-pressed="${b}" aria-label="효과음 ${b?`끄기`:`켜기`}">
        ${b?Y():X()}
        <span>${u(b?`global.sound.on`:`global.sound.off`)}</span>
      </button>
    </header>`}function k(){return`
    <main class="title-scene" aria-labelledby="scene-title">
      <div class="title-rain" aria-hidden="true"></div>
      <div class="title-copy">
        <p class="eyebrow">${u(`title.eyebrow`)}</p>
        <h1 id="scene-title">${u(`title.heading`)}</h1>
        <p class="title-lede">${d(`title.lede`)}</p>
        <button class="primary-button large" type="button" data-action="start">
          ${u(`title.start_button`)} <span aria-hidden="true">→</span>
        </button>
        <p class="title-meta">${u(`title.meta`)}</p>
      </div>
      <div class="title-art" aria-hidden="true">
        ${Z()}
        <span class="floating-word word-a">${u(`title.floating_a`)}</span>
        <span class="floating-word word-b">${u(`title.floating_b`)}</span>
      </div>
      <p class="prototype-note">${u(`title.prototype_note`)}</p>
    </main>`}function A(){return F(`
      <section class="letter-stage" aria-labelledby="scene-title">
        <div class="scene-heading">
          <p class="eyebrow">${u(`letter.eyebrow`)}</p>
          <h1 id="scene-title">${u(`letter.heading`)}</h1>
          <p>${u(`letter.context`)}</p>
        </div>
        <article class="letter-paper opening-letter" aria-label="빈칸이 있는 편지">
          <div class="letter-fold" aria-hidden="true"></div>
          <p class="letter-to">${u(`letter.to`)}</p>
          <p>${u(`letter.avoid_line`)}</p>
          <p>${f(`letter.rain_line`,{fragment:`<span class="redacted" aria-label="읽히지 않는 첫 번째 문장">읽히지 않는 문장</span>`})}</p>
          <p>${f(`letter.turn_line`,{fragment:`<span class="redacted short" aria-label="읽히지 않는 두 번째 문장">읽히지 않는 문장</span>`})}</p>
          <p>${u(`letter.request_line`)}</p>
          <div class="letter-sign">${u(`letter.sign`)}</div>
        </article>
        <div class="scene-actions">
          <button class="primary-button" type="button" data-action="enter-memory">
            ${u(`letter.enter_memory_button`)} <span aria-hidden="true">→</span>
          </button>
        </div>
      </section>`,I())}function j(){let e=S.found.length===Object.keys(_).length;return F(`
      <section class="memory-stage" aria-labelledby="scene-title">
        <div class="scene-heading compact">
          <div>
            <p class="eyebrow">${u(`memory.eyebrow`)}</p>
            <h1 id="scene-title">${u(`memory.heading`)}</h1>
          </div>
          <p>${u(`memory.instruction`)}</p>
        </div>

        <div class="memory-canvas" aria-label="비 오는 정류장에서 두 사람이 투명 우산을 함께 쓰고 있다">
          <div class="rain" aria-hidden="true"></div>
          ${Q()}
          ${B(`umbrella`,s(`memory.hotspot_umbrella`),`hotspot-umbrella`)}
          ${B(`shoulder`,s(`memory.hotspot_shoulder`),`hotspot-shoulder`)}
          <div class="memory-caption">${u(`memory.caption`)}</div>
        </div>

        <div class="observation ${S.observation?`visible`:``}" aria-live="polite">
          ${S.observation?`<span class="observation-index">${u(`memory.observation_label`)} ${S.found.indexOf(S.observation)+1}</span>
                 <p>${l(_[S.observation].observation)}</p>`:`<span class="observation-index">${u(`memory.observation_label`)}</span><p>${u(`memory.empty_observation`)}</p>`}
        </div>

        <div class="scene-actions split">
          <button class="text-button" type="button" data-action="back-to-letter">${u(`memory.back_button`)}</button>
          ${e?`<button class="primary-button" type="button" data-action="assemble-letter">${u(`memory.assemble_button`)} <span aria-hidden="true">→</span></button>`:`<span class="action-hint">${f(`memory.found_count`,{found:String(S.found.length),total:String(Object.keys(_).length)})}</span>`}
        </div>
      </section>`,L())}function M(){let e=!!(S.placed.rain&&S.placed.turn);return F(`
      <section class="assembly-stage" aria-labelledby="scene-title">
        <div class="scene-heading compact">
          <div>
            <p class="eyebrow">${u(`assembly.eyebrow`)}</p>
            <h1 id="scene-title">${u(`assembly.heading`)}</h1>
          </div>
          <p>${u(`assembly.instruction`)}</p>
        </div>

        <article class="letter-paper assembly-letter" aria-label="표현 카드를 배치하는 편지">
          <p class="letter-to">${u(`letter.to`)}</p>
          <p>${u(`letter.avoid_line`)}</p>
          <p class="slot-line">${f(`letter.rain_line`,{fragment:z(`rain`,s(`assembly.slot_rain`))})}</p>
          <p class="slot-line">${f(`letter.turn_line`,{fragment:z(`turn`,s(`assembly.slot_turn`))})}</p>
          <p>${u(`letter.request_line`)}</p>
        </article>

        <div class="feedback ${S.feedbackKind}" aria-live="polite">
          <span aria-hidden="true">${S.feedbackKind===`error`?`↺`:S.feedbackKind===`success`?`✓`:`·`}</span>
          ${l(S.feedback)}
        </div>

        <div class="scene-actions split">
          <button class="text-button" type="button" data-action="back-to-memory">${u(`assembly.back_button`)}</button>
          ${e?`<button class="primary-button warm" type="button" data-action="reveal-letter">${u(`assembly.reveal_button`)} <span aria-hidden="true">→</span></button>`:`<span class="action-hint">${f(`assembly.blank_count`,{filled:String(Object.keys(S.placed).length),total:`2`})}</span>`}
        </div>
      </section>`,L(!0))}function N(){return F(`
      <section class="reveal-stage" aria-labelledby="scene-title">
        <div class="scene-heading centered">
          <p class="eyebrow">${u(`reveal.eyebrow`)}</p>
          <h1 id="scene-title">${u(`reveal.heading`)}</h1>
        </div>

        <article class="letter-paper reveal-letter" aria-label="완성된 편지">
          <div class="warm-wash" aria-hidden="true"></div>
          <p class="letter-to">${u(`letter.to`)}</p>
          <p>${u(`letter.avoid_line`)}</p>
          <p>${f(`letter.rain_line`,{fragment:`<mark>${l(_.umbrella.label)}</mark>`})}</p>
          <p>${f(`letter.turn_line`,{fragment:`<mark>${l(_.shoulder.label)}</mark>`})}</p>
          <p class="revealed-copy">${d(`reveal.reason`)}</p>
          <p class="revealed-copy">${d(`reveal.confession`)}</p>
        </article>

        <div class="scene-actions centered-actions">
          <button class="primary-button warm large" type="button" data-action="approach">
            ${u(`reveal.finish_button`)} <span aria-hidden="true">→</span>
          </button>
        </div>
      </section>`,`<aside class="side-rail reveal-rail" aria-label="해석 완료">
      <div class="rail-label">${u(`reveal.rail_label`)}</div>
      <div class="interpretation-stamp"><span>${u(`reveal.stamp_label`)}</span><strong>${u(`reveal.stamp_complete`)}</strong></div>
      <p>${u(`reveal.interpretation`)}</p>
    </aside>`)}function P(){return`
    <main class="ending-scene" aria-labelledby="scene-title">
      <div class="ending-rain" aria-hidden="true"></div>
      <div class="ending-art" aria-hidden="true">${$()}</div>
      <div class="ending-copy">
        <p class="eyebrow">${u(`ending.eyebrow`)}</p>
        <h1 id="scene-title">${u(`ending.question`)}</h1>
        <button class="approach-button" type="button" data-action="finish-ending">${u(`ending.approach_button`)}</button>
        <p class="ending-line" data-ending-line>${u(`ending.final_line`)}</p>
        <button class="text-button light ending-replay" type="button" data-action="replay" data-ending-replay hidden>${u(`ending.replay_button`)}</button>
      </div>
    </main>`}function F(e,t){return`<main class="scene-grid">${e}${t}</main>`}function I(){return`
    <aside class="side-rail" aria-label="편지 정보">
      <div class="rail-label">${u(`letter.rail_label`)}</div>
      <div class="envelope-mini" aria-hidden="true"><span></span></div>
      <dl class="rail-stats">
        <div><dt>${u(`letter.rail_read_label`)}</dt><dd>2 / 4</dd></div>
        <div><dt>${u(`letter.rail_blank_label`)}</dt><dd>2</dd></div>
        <div><dt>${u(`letter.rail_sender_label`)}</dt><dd>${u(`letter.rail_sender_unknown`)}</dd></div>
      </dl>
      <p class="rail-note">${u(`letter.rail_note`)}</p>
    </aside>`}function L(e=!1){return`
    <aside class="side-rail inventory-rail" aria-label="수집한 표현">
      <div class="rail-label">${u(`inventory.label`)}</div>
      <div class="inventory-count"><strong>${S.found.length}</strong><span>/ 2</span></div>
      <div class="inventory-list">
        ${S.found.length?S.found.map(t=>R(t,e)).join(``):`<div class="empty-card"><span>+</span><p>${d(`memory.empty_inventory`)}</p></div>`}
      </div>
      ${e&&S.found.some(e=>!Object.values(S.placed).includes(e))?`<p class="rail-note">${u(`assembly.inventory_note`)}</p>`:``}
    </aside>`}function R(e,t){let n=_[e],r=Object.values(S.placed).includes(e),i=S.selected===e,a=t&&!r?`button`:`div`;return`
    <${a}
      class="fragment-card ${n.color} ${r?`placed`:``} ${i?`selected`:``}"
      ${t&&!r?`type="button" draggable="true" data-action="select-card" data-fragment="${e}" aria-pressed="${i}"`:``}
    >
      <span class="fragment-number">${n.number}</span>
      <span class="fragment-label">${l(n.label)}</span>
      <span class="fragment-status">${u(r?`assembly.card_placed`:i?`assembly.card_selected`:`assembly.card_new`)}</span>
    </${a}>`}function z(e,t){let n=S.placed[e];return`
    <button class="${[`word-slot`,n?`filled`:``,S.errorSlot===e?`error`:``,S.selected?`ready`:``].filter(Boolean).join(` `)}" type="button" data-action="place-slot" data-slot="${e}" aria-label="${l(t+(n?`, ${_[n].label} 배치됨`:``))}">
      ${n?`<span>${l(_[n].label)}</span><small>${u(`assembly.slot_remove`)}</small>`:`<span>${l(t)}</span><small>${u(`assembly.slot_place`)}</small>`}
    </button>`}function B(e,t,n){let r=S.found.includes(e);return`
    <button class="hotspot ${n} ${r?`found`:``}" type="button" data-action="inspect" data-fragment="${e}" aria-label="${l(t+(r?`, 확인함`:``))}">
      <span>${r?`✓`:`+`}</span>
    </button>`}function V(e){let t=!S.found.includes(e);t&&S.found.push(e),S.observation=e,S.feedback=t?c(`feedback.found`,{label:_[e].label}):_[e].observation,S.feedbackKind=t?`success`:`info`,E(t?`collect`:`move`),J(!1,`[data-action="inspect"][data-fragment="${e}"]`)}function H(e){if(Object.values(S.placed).includes(e))return;S.selected=S.selected===e?null:e,S.feedback=S.selected?c(`feedback.select`,{label:_[e].label}):s(`feedback.cancel`),S.feedbackKind=`info`;let t=[`rain`,`turn`].find(e=>!S.placed[e]);J(!1,S.selected&&t?`[data-action="place-slot"][data-slot="${t}"]`:`[data-action="select-card"][data-fragment="${e}"]`,!!S.selected)}function U(e,t){if(!S.found.includes(e))return;let n=Object.entries(S.placed).find(([,t])=>t===e)?.[0];if(n&&delete S.placed[n],_[e].slot!==t){S.feedback=s(e===`shoulder`?`feedback.wrong_shoulder`:`feedback.wrong_umbrella`),S.feedbackKind=`error`,S.errorSlot=t,S.selected=null,E(`error`),J(!1,`[data-action="place-slot"][data-slot="${t}"]`),window.setTimeout(()=>{S.errorSlot===t&&(S.errorSlot=null,J(!1,`[data-action="select-card"][data-fragment="${e}"]`,!0))},650);return}let r=S.placed[t];r&&r!==e&&delete S.placed[t],S.placed[t]=e,S.selected=null,S.errorSlot=null,S.feedback=Object.keys(S.placed).length===2?s(`feedback.placed_complete`):s(`feedback.placed_partial`),S.feedbackKind=`success`,E(`place`);let i=S.found.find(e=>!Object.values(S.placed).includes(e));J(!1,i?`[data-action="select-card"][data-fragment="${i}"]`:`[data-action="reveal-letter"]`,!0)}function W(e){let t=S.placed[e];t&&(delete S.placed[e],S.feedback=s(`feedback.removed`),S.feedbackKind=`info`,J(!1,`[data-action="select-card"][data-fragment="${t}"]`,!0))}function G(e,t){switch(e){case`start`:T(`letter`);break;case`restart`:w();break;case`enter-memory`:case`back-to-memory`:T(`memory`,s(`memory.empty_observation`));break;case`back-to-letter`:T(`letter`);break;case`inspect`:V(t.dataset.fragment);break;case`assemble-letter`:T(`assembly`,s(`feedback.assembly_prompt`));break;case`select-card`:H(t.dataset.fragment);break;case`place-slot`:{let e=t.dataset.slot;if(S.placed[e])W(e);else if(S.selected)U(S.selected,e);else{S.feedback=s(`feedback.choose_card`),S.feedbackKind=`info`;let e=S.found.find(e=>!Object.values(S.placed).includes(e));J(!1,e?`[data-action="select-card"][data-fragment="${e}"]`:void 0,!!e)}break}case`reveal-letter`:T(`reveal`,s(`feedback.reveal`));break;case`approach`:T(`ending`,s(`feedback.ending`));break;case`finish-ending`:t.setAttribute(`disabled`,`true`),t.textContent=s(`ending.approach_complete`),document.querySelector(`[data-ending-line]`)?.classList.add(`shown`),document.querySelector(`.ending-art`)?.classList.add(`together`),document.querySelector(`[data-ending-replay]`)?.removeAttribute(`hidden`),S.feedback=s(`ending.final_line`),K(S.feedback),E(`reveal`);break;case`replay`:w();break;case`toggle-sound`:b=!b,b&&E(`move`),J()}}v.addEventListener(`click`,e=>{let t=e.target.closest(`[data-action]`);t&&G(t.dataset.action,t)}),v.addEventListener(`dragstart`,e=>{let t=e.target.closest(`[data-fragment]`);!t||!e.dataTransfer||(e.dataTransfer.effectAllowed=`move`,e.dataTransfer.setData(`text/plain`,t.dataset.fragment))}),v.addEventListener(`dragend`,()=>{document.querySelectorAll(`.drag-over`).forEach(e=>e.classList.remove(`drag-over`)),S.selected=null}),v.addEventListener(`dragover`,e=>{let t=e.target.closest(`[data-slot]`);t&&(e.preventDefault(),e.dataTransfer&&(e.dataTransfer.dropEffect=`move`),t.classList.add(`drag-over`))}),v.addEventListener(`dragleave`,e=>{e.target.closest(`[data-slot]`)?.classList.remove(`drag-over`)}),v.addEventListener(`drop`,e=>{let t=e.target.closest(`[data-slot]`);!t||!e.dataTransfer||(e.preventDefault(),t.classList.remove(`drag-over`),U(e.dataTransfer.getData(`text/plain`),t.dataset.slot))});function K(e){y.textContent=``,window.requestAnimationFrame(()=>{y.textContent=e})}function q(){if(new URLSearchParams(window.location.search).get(`copy`)!==`draft`)return``;let e=p();return e.channel===`draft`&&!e.usingFallback?`<div class="copy-preview-banner" role="status">DRAFT 미리보기${e.releaseId?` · 기준 ${l(e.releaseId)}`:``}</div>`:`<div class="copy-preview-banner error" role="status">DRAFT 연결 실패 · 내장 문장으로 표시 중</div>`}function J(e=!1,t,n=!1){let r=S.scene===`title`?k():S.scene===`letter`?A():S.scene===`memory`?j():S.scene===`assembly`?M():S.scene===`reveal`?N():P();v.innerHTML=`
    <div class="game-shell" data-scene="${S.scene}">
      ${q()}
      ${O()}
      ${r}
    </div>`,K(S.feedback),e?(window.scrollTo({top:0,left:0}),window.requestAnimationFrame(()=>{let e=document.querySelector(`#scene-title`);e?.setAttribute(`tabindex`,`-1`),e?.focus({preventScroll:!0})})):t&&window.requestAnimationFrame(()=>{let e=document.querySelector(t);e?.focus({preventScroll:!n}),e&&n&&window.matchMedia(`(max-width: 980px)`).matches&&e.scrollIntoView({behavior:`smooth`,block:`center`})})}function Y(){return`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10v4h4l5 4V6L8 10H4Z"/><path d="M16 9c1.4 1.6 1.4 4.4 0 6M18.5 6.5c3 3 3 8 0 11"/></svg>`}function X(){return`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10v4h4l5 4V6L8 10H4Z"/><path d="m17 10 4 4m0-4-4 4"/></svg>`}function Z(){return`
    <svg class="envelope-illustration" viewBox="0 0 640 520">
      <defs><filter id="paper-shadow" x="-20%" y="-20%" width="140%" height="160%"><feDropShadow dx="0" dy="18" stdDeviation="18" flood-color="#06101d" flood-opacity=".32"/></filter></defs>
      <g filter="url(#paper-shadow)">
        <path d="M104 187 320 63l216 124v236H104Z" fill="#ebe3d6" stroke="#20304a" stroke-width="5"/>
        <path d="m105 190 215 161 215-161" fill="#f7f1e7" stroke="#20304a" stroke-width="5"/>
        <path d="m105 422 151-137 64 48 64-48 152 137" fill="#f1e8db" stroke="#20304a" stroke-width="5"/>
      </g>
      <path d="M183 135c63-56 198-58 272 4" fill="none" stroke="#d86f91" stroke-width="7" stroke-linecap="round" stroke-dasharray="1 17"/>
      <circle cx="182" cy="135" r="7" fill="#d86f91"/><circle cx="455" cy="139" r="7" fill="#4d83a7"/>
    </svg>`}function Q(){return`
    <svg class="memory-illustration" viewBox="0 0 1000 560" role="img" aria-hidden="true">
      <defs>
        <linearGradient id="memory-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7593a6"/><stop offset="1" stop-color="#c8d2cf"/></linearGradient>
        <linearGradient id="puddle" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#91adbc" stop-opacity=".1"/><stop offset=".5" stop-color="#e7eee9" stop-opacity=".8"/><stop offset="1" stop-color="#91adbc" stop-opacity=".12"/></linearGradient>
      </defs>
      <rect width="1000" height="560" fill="url(#memory-sky)"/>
      <path d="M0 416C180 395 340 436 514 412s330-6 486 4v144H0Z" fill="#34495b" opacity=".36"/>
      <path d="M0 438h1000" stroke="#e6eee8" stroke-opacity=".45" stroke-width="3"/>
      <ellipse cx="525" cy="492" rx="270" ry="24" fill="url(#puddle)"/>
      <g opacity=".62" stroke="#26394d" fill="none" stroke-width="7"><path d="M90 88h820"/><path d="M122 88v345M878 88v345"/><path d="M70 432h860"/><path d="M129 155h742" stroke-width="3"/></g>
      <g fill="none" stroke="#d96f91" stroke-width="12" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="438" cy="260" r="37" fill="#d9a0b3" fill-opacity=".18"/><path d="M438 299c-29 40-30 98-27 150M411 348l-48 65M417 446l-35 74M436 447l40 72"/><path d="M449 313c22 22 34 50 38 82" stroke-width="8"/>
      </g>
      <g fill="none" stroke="#356f99" stroke-width="12" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="624" cy="254" r="38" fill="#5891b4" fill-opacity=".18"/><path d="M618 294c25 38 30 97 31 154M641 341l58 48M645 447l-24 74M661 447l48 68"/><path d="M605 315c-28 22-41 53-45 84" stroke-width="8"/><path d="M648 303c30 18 40 57 36 94" stroke="#77a9c4" stroke-width="15" opacity=".72"/>
      </g>
      <g fill="none" stroke-linecap="round" stroke-linejoin="round">
        <path d="M306 226c56-111 304-126 439 1-42-13-70-5-94 19-31-25-72-30-111-9-31-28-75-30-112-5-37-20-79-19-122-6Z" fill="#eff5f2" fill-opacity=".55" stroke="#2e536e" stroke-width="7"/>
        <path d="M540 231v184c0 42 58 42 58 3" stroke="#2e536e" stroke-width="7"/><path d="M540 237c-20-33-62-40-112-5M540 237c35-28 77-23 111 9" stroke="#557a91" stroke-width="3" opacity=".8"/>
      </g>
      <g stroke="#b8e2ef" stroke-width="5" stroke-linecap="round"><path d="M686 301l-12 26M700 309l-11 25M713 319l-9 23"/></g>
      <g opacity=".52" stroke="#e8f3f4" stroke-width="3" stroke-linecap="round"><path d="M115 128l-20 48M180 183l-17 41M815 132l-23 53M862 230l-19 45M242 106l-17 40M776 296l-15 35M93 276l-20 45"/></g>
    </svg>`}function $(){return`
    <svg viewBox="0 0 720 640">
      <defs><linearGradient id="end-sky" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#1a2942"/><stop offset="1" stop-color="#314d63"/></linearGradient></defs>
      <rect width="720" height="640" rx="40" fill="url(#end-sky)"/><path d="M120 520h480" stroke="#e7eadf" stroke-opacity=".38" stroke-width="3"/>
      <g class="end-figure end-pink" fill="none" stroke="#df7a99" stroke-width="12" stroke-linecap="round"><circle cx="288" cy="285" r="36"/><path d="M288 322v132M288 360l-53 54M288 455l-38 78M288 455l41 78"/></g>
      <g class="end-figure end-blue" fill="none" stroke="#6ea5c5" stroke-width="12" stroke-linecap="round"><circle cx="441" cy="278" r="36"/><path d="M441 316v138M441 356l52 55M441 455l-38 78M441 455l42 78"/></g>
      <g fill="none" stroke="#e8f0eb" stroke-linecap="round" stroke-linejoin="round"><path d="M186 260c54-111 286-119 378 0-38-15-73-8-95 17-35-24-73-24-106-1-32-24-70-24-103 1-22-24-46-31-74-17Z" fill="#e8f0eb" fill-opacity=".08" stroke-width="7"/><path d="M364 271v194c0 37 49 39 51 5" stroke-width="7"/></g>
      <path class="closing-gap" d="M356 362h18" stroke="#f0c474" stroke-width="6" stroke-linecap="round"/>
    </svg>`}async function ee(){await g(),S.feedback=s(`feedback.initial`),J()}ee();