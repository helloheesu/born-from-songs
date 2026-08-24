(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),t.credentials=e.crossOrigin===`use-credentials`?`include`:e.crossOrigin===`anonymous`?`omit`:`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e=[{id:`brave`,label:`용감한 사람`,short:`용감한`,pieces:[`yong`,`gam`],description:`두려워도 먼저 한 걸음을 내딛는 사람`},{id:`kind`,label:`다정한 사람`,short:`다정한`,pieces:[`da`,`jeong`],description:`다른 사람의 속도를 오래 바라봐 주는 사람`},{id:`free`,label:`자유로운 사람`,short:`자유로운`,pieces:[`ja`,`yu`],description:`자신의 궤도를 스스로 고르는 사람`}],t=[{id:`first-door`,name:`낯선 문의 행성`,kind:`planet`,x:16,y:22,fragmentId:`yong`,fragment:`용`,memoryTitle:`문 앞에서`,memoryBody:`모두가 망설이던 날, 너는 완벽히 준비되지 않은 채로 먼저 문을 열었다.`,reflection:`용기는 두려움이 사라진 뒤가 아니라, 두려움과 함께 움직인 순간에 남았다.`,accent:`#f5bb68`},{id:`slow-comet`,name:`느린 혜성`,kind:`star`,x:70,y:17,fragmentId:`gam`,fragment:`감`,memoryTitle:`조금 더 가까이`,memoryBody:`길을 잃은 밤에도, 너는 멀리 있는 작은 불빛을 향해 한 번 더 몸을 밀었다.`,reflection:`앞으로 간 거리는 짧았지만, 멈춰 있던 궤도는 그때 처음 바뀌었다.`,accent:`#8fd8ff`},{id:`waiting-moon`,name:`기다림의 위성`,kind:`moon`,x:84,y:45,fragmentId:`da`,fragment:`다`,memoryTitle:`같은 속도가 아니어도`,memoryBody:`먼저 도착할 수 있었지만, 너는 뒤처진 사람과 나란히 걷기 위해 속도를 늦췄다.`,reflection:`기다린 시간은 사라진 시간이 아니라 둘이 함께 가진 시간이 되었다.`,accent:`#d9b8ff`},{id:`signal-station`,name:`안부의 정거장`,kind:`station`,x:63,y:78,fragmentId:`jeong`,fragment:`정`,memoryTitle:`짧은 신호`,memoryBody:`멀어진 사람에게 무슨 말을 해야 할지 몰라서, 너는 그저 잘 지내냐는 신호를 보냈다.`,reflection:`짧은 안부 하나가 끊어진 줄 알았던 궤도를 잠시 다시 이었다.`,accent:`#ff9eb9`},{id:`open-orbit`,name:`열린 궤도의 별`,kind:`star`,x:20,y:76,fragmentId:`ja`,fragment:`자`,memoryTitle:`정해진 길 밖으로`,memoryBody:`누구나 같은 방향으로 가던 날, 너는 오래 바라본 작은 샛길을 골랐다.`,reflection:`다른 길은 틀린 길이 아니었다. 네가 직접 선택한 첫 번째 궤도였다.`,accent:`#9ee5c2`},{id:`quiet-sun`,name:`고요한 작은 태양`,kind:`sun`,x:39,y:45,fragmentId:`yu`,fragment:`유`,memoryTitle:`머물고 떠나는 일`,memoryBody:`좋아하는 곳에 충분히 머문 뒤, 너는 아쉬움을 품은 채 다음 여행을 선택했다.`,reflection:`자유는 계속 떠나는 일이 아니라, 머물 곳과 떠날 때를 스스로 정하는 일이었다.`,accent:`#ffe28a`}],n=[{id:`evening`,label:`초저녁`,age:`열여덟의 여행자`,year:18,copy:`아직 우주는 넓고, 몸은 가볍다.`},{id:`midnight`,label:`한밤`,age:`서른하나의 여행자`,year:31,copy:`지나온 별들이 몸 주위에 작은 궤도를 만든다.`},{id:`predawn`,label:`새벽 전`,age:`마흔여덟의 여행자`,year:48,copy:`움직임은 느려졌지만, 어디로 갈지는 더 선명하다.`},{id:`dawn`,label:`동틀 녘`,age:`예순일곱의 여행자`,year:67,copy:`모은 경험이 오래된 빛처럼 곁에 남아 있다.`}];function r(e){return e>=6?3:e>=4?2:+(e>=2)}function i(t){return e.find(e=>e.id===t)??null}function a(e){return t.find(t=>t.id===e)??null}function o(t){return t.length===2?e.find(e=>e.pieces.every(e=>t.includes(e)))??null:null}var s=document.querySelector(`#app`),c=document.querySelector(`#live-region`),l=window.matchMedia(`(prefers-reduced-motion: reduce)`),u=_(),d=0,f=0,p=null,m=null,h=new Set,g=new Set;function _(){return{scene:`title`,aspiration:null,position:{x:50,y:57},velocity:{x:0,y:0},target:null,visited:[],fragments:[],currentDestination:null,nearbyDestination:null,assemblySlots:[null,null],identity:null,startedAt:null,elapsedSeconds:0,soundEnabled:!0,reducedMotion:l.matches,feedback:`되고 싶은 말을 하나 품고 출발하세요.`}}function v(e){return String(e).replaceAll(`&`,`&amp;`).replaceAll(`<`,`&lt;`).replaceAll(`>`,`&gt;`).replaceAll(`"`,`&quot;`).replaceAll(`'`,`&#039;`)}function y(e){c.textContent=``,window.setTimeout(()=>{c.textContent=e},20)}function b(e){if(u.soundEnabled)try{p??=new AudioContext,p.state===`suspended`&&p.resume();let t=p.currentTime;({move:[220],near:[329.63,440],collect:[293.66,440,587.33],place:[392,523.25],error:[174.61,146.83],ending:[261.63,329.63,392,523.25,659.25]})[e].forEach((n,r)=>{let i=p.createOscillator(),a=p.createGain(),o=t+r*.075;i.type=e===`error`?`triangle`:`sine`,i.frequency.setValueAtTime(n,o),e===`near`&&i.frequency.exponentialRampToValueAtTime(n*1.08,o+.3),a.gain.setValueAtTime(1e-4,o),a.gain.exponentialRampToValueAtTime(e===`ending`?.045:.035,o+.02),a.gain.exponentialRampToValueAtTime(1e-4,o+(e===`ending`?.72:.35)),i.connect(a).connect(p.destination),i.start(o),i.stop(o+(e===`ending`?.75:.38))})}catch{u.soundEnabled=!1}}function ee(e){return e===`choice`?1:e===`flight`||e===`memory`?2:e===`assembly`?3:e===`ending`?4:0}function te(){if(u.scene===`title`)return``;let e=ee(u.scene);return`
    <ol class="progress" aria-label="여정 진행">
      ${[`바람`,`유영`,`대답`,`여명`].map((t,n)=>{let r=n+1;return`<li class="${r<e?`done`:r===e?`current`:``}"><span>${r<e?`✓`:r}</span>${t}</li>`}).join(``)}
    </ol>`}function ne(){return u.scene===`title`?``:`
    <header class="game-header">
      <button class="brand" type="button" data-action="restart" aria-label="처음 화면으로 돌아가기">
        <span class="brand-orbit" aria-hidden="true"></span>
        <span>야간비행</span>
      </button>
      ${te()}
      <div class="header-tools">
        <button class="tool-button" type="button" data-action="toggle-motion" aria-pressed="${u.reducedMotion}">
          ${P()}<span>${u.reducedMotion?`움직임 줄임`:`기본 움직임`}</span>
        </button>
        <button class="tool-button" type="button" data-action="toggle-sound" aria-pressed="${u.soundEnabled}">
          ${u.soundEnabled?M():N()}<span>${u.soundEnabled?`소리 켬`:`소리 끔`}</span>
        </button>
      </div>
    </header>`}function x(){return`
    <main class="title-scene" aria-labelledby="scene-title">
      <div class="title-stars stars-a" aria-hidden="true"></div>
      <div class="title-stars stars-b" aria-hidden="true"></div>
      <section class="title-copy">
        <p class="eyebrow">A SMALL JOURNEY THROUGH A LARGE NIGHT</p>
        <h1 id="scene-title" tabindex="-1">야간비행</h1>
        <p class="title-question">“What do you want?”</p>
        <p class="title-lede">되고 싶은 말을 하나 품고,<br />별과 행성 사이를 직접 유영하세요.</p>
        <button class="primary-button" type="button" data-action="start" data-autofocus>
          궤도 밖으로 나가기 <span aria-hidden="true">→</span>
        </button>
        <p class="title-meta">약 3–5분 · 키보드 / 마우스 / 터치</p>
      </section>
      <div class="title-visual" aria-hidden="true">
        <div class="title-orbit orbit-one"></div>
        <div class="title-orbit orbit-two"></div>
        <div class="title-planet"></div>
        <div class="title-traveler">${j()}</div>
        <span class="title-word word-one">사람</span>
        <span class="title-word word-two">경험</span>
        <span class="title-word word-three">나</span>
      </div>
      <div class="title-settings">
        <button type="button" class="quiet-button" data-action="toggle-motion">
          ${P()} ${u.reducedMotion?`움직임 줄이기 켜짐`:`움직임 줄이기`}
        </button>
        <button type="button" class="quiet-button" data-action="toggle-sound">
          ${u.soundEnabled?M():N()} ${u.soundEnabled?`효과음 켜짐`:`효과음 꺼짐`}
        </button>
      </div>
    </main>`}function S(){return A(`
    <main class="choice-scene" aria-labelledby="scene-title">
      <div class="scene-intro centered">
        <p class="eyebrow">DEPARTURE / 18:04</p>
        <h1 id="scene-title" tabindex="-1">어떤 사람이 되고 싶나요?</h1>
        <p>이 선택은 목적지가 아니라, 출발할 때 품는 한 문장입니다.</p>
      </div>
      <div class="aspiration-grid" role="radiogroup" aria-label="되고 싶은 사람 선택">
        ${e.map((e,t)=>`
              <button
                class="aspiration-card ${u.aspiration===e.id?`selected`:``}"
                type="button"
                role="radio"
                aria-checked="${u.aspiration===e.id}"
                data-action="select-aspiration"
                data-aspiration="${e.id}"
                ${t===0?`data-autofocus`:``}
              >
                <span class="choice-index">0${t+1}</span>
                <strong>${e.short}</strong>
                <span>${e.description}</span>
              </button>`).join(``)}
      </div>
      <div class="choice-footer">
        <p class="feedback-line">${v(u.feedback)}</p>
        <button class="primary-button" type="button" data-action="depart" ${u.aspiration?``:`disabled`}>
          이 말을 품고 출발 <span aria-hidden="true">→</span>
        </button>
      </div>
    </main>`)}function C(){let e=n[r(u.visited.length)],a=i(u.aspiration),o=u.visited.length===t.length;return A(`
    <main class="flight-scene phase-${e.id}" aria-labelledby="scene-title">
      <section class="flight-main">
        <div class="flight-heading">
          <div>
            <p class="eyebrow">${e.label} · ${e.age}</p>
            <h1 id="scene-title" tabindex="-1">스스로 움직여야 만나는 것들</h1>
          </div>
          <p>${e.copy}</p>
        </div>

        <div
          id="space-map"
          class="space-map"
          role="application"
          aria-label="방향키나 화면 조작으로 여행자를 움직여 별과 행성을 방문하는 우주 지도"
          tabindex="0"
        >
          <div class="space-haze" aria-hidden="true"></div>
          <div class="star-field star-field-near" aria-hidden="true"></div>
          <div class="star-field star-field-far" aria-hidden="true"></div>
          <div id="target-marker" class="target-marker" aria-hidden="true"></div>
          ${t.map(w).join(``)}
          <div
            id="traveler"
            class="traveler phase-${e.id}"
            style="left:${u.position.x}%;top:${u.position.y}%"
            aria-hidden="true"
          >
            <span class="traveler-trail"></span>
            ${j()}
          </div>
          <div class="map-status top-left">
            <span>기억</span><strong>${u.visited.length} / ${t.length}</strong>
          </div>
          <div class="map-status top-right">
            <span>우주 시간</span><strong>${e.year}세</strong>
          </div>
          <p class="map-caption">지도를 누르면 그 방향으로 유영합니다.</p>
        </div>
      </section>

      <aside class="flight-panel" aria-label="비행 정보와 조작">
        <div class="panel-block carried-word">
          <span class="panel-label">출발할 때 품은 말</span>
          <strong>${v(a?.label??``)}</strong>
        </div>

        <div class="panel-block journey-clock">
          <span class="panel-label">여정 시간</span>
          <strong id="elapsed-time">${F(u.elapsedSeconds)}</strong>
          <div class="time-track"><span style="width:${u.visited.length/t.length*100}%"></span></div>
          <small>${v(e.copy)}</small>
        </div>

        <div class="panel-block fragment-log">
          <span class="panel-label">모은 글자 조각</span>
          <div class="fragment-mini-list" aria-label="모은 글자">
            ${u.fragments.length?u.fragments.map(re).join(``):`<span class="empty-fragments">아직 없음</span>`}
          </div>
        </div>

        <div class="panel-block controls-block">
          <span class="panel-label">유영 조작</span>
          <p>방향키 / WASD · 지도 클릭 또는 드래그</p>
          <div class="dpad" aria-label="화면 방향키">
            <button type="button" class="dpad-button dpad-up" data-direction="up" aria-label="위로 유영">↑</button>
            <button type="button" class="dpad-button dpad-left" data-direction="left" aria-label="왼쪽으로 유영">←</button>
            <button type="button" class="dpad-button dpad-center" aria-label="현재 위치" disabled>✦</button>
            <button type="button" class="dpad-button dpad-right" data-direction="right" aria-label="오른쪽으로 유영">→</button>
            <button type="button" class="dpad-button dpad-down" data-direction="down" aria-label="아래로 유영">↓</button>
          </div>
        </div>

        <div class="flight-action-zone">
          <p id="nearby-message">${o?`모든 경험이 모였습니다.`:`빛 가까이 다가가면 방문할 수 있습니다.`}</p>
          <button id="visit-button" class="primary-button wide" type="button" data-action="visit" disabled>
            가까운 빛 없음
          </button>
        </div>
      </aside>
    </main>`)}function w(e){let t=u.visited.includes(e.id);return`
    <button
      class="destination destination-${e.kind} ${t?`visited`:``}"
      type="button"
      data-action="target-destination"
      data-destination="${e.id}"
      style="left:${e.x}%;top:${e.y}%;--accent:${e.accent}"
      aria-label="${v(e.name)}${t?`, 방문 완료`:`, 방문하지 않음`}"
    >
      <span class="destination-core" aria-hidden="true"></span>
      <span class="destination-ring" aria-hidden="true"></span>
      <span class="destination-label">${v(e.name)}</span>
      ${t?`<span class="visited-mark" aria-hidden="true">✓ ${e.fragment}</span>`:``}
    </button>`}function T(){let e=a(u.currentDestination);if(!e)return``;let i=u.visited.length+1===t.length,o=n[r(u.visited.length)];return A(`
    <main class="memory-scene" aria-labelledby="scene-title">
      <div class="memory-sky phase-${o.id}" aria-hidden="true">
        <span class="memory-orbit"></span>
        <span class="memory-object" style="--accent:${e.accent}"></span>
      </div>
      <article class="memory-card">
        <p class="eyebrow">VISITED / ${v(e.name)}</p>
        <h1 id="scene-title" tabindex="-1">${v(e.memoryTitle)}</h1>
        <p class="memory-body">${v(e.memoryBody)}</p>
        <div class="memory-rule" aria-hidden="true"></div>
        <p class="memory-reflection">${v(e.reflection)}</p>
        <div class="fragment-reward" aria-label="얻은 글자 조각 ${e.fragment}">
          <span>경험에서 남은 글자</span>
          <strong>${e.fragment}</strong>
        </div>
        <button class="primary-button" type="button" data-action="collect-memory" data-autofocus>
          ${i?`마지막 질문으로`:`글자를 품고 다시 유영`} <span aria-hidden="true">→</span>
        </button>
      </article>
    </main>`)}function E(){let e=i(u.aspiration),t=o(u.assemblySlots.filter(e=>e!==null));return A(`
    <main class="assembly-scene" aria-labelledby="scene-title">
      <section class="assembly-copy">
        <p class="eyebrow">DAWN / FINAL QUESTION</p>
        <h1 id="scene-title" tabindex="-1">Who are you?</h1>
        <p>처음 품은 말은 <strong>${v(e?.short??``)}</strong>이었습니다.<br />지나온 경험에서 두 조각을 골라 지금의 답을 완성하세요.</p>
      </section>

      <section class="word-workbench" aria-label="글자 조합 작업대">
        <div class="answer-slots" aria-label="선택한 두 글자">
          ${u.assemblySlots.map(D).join(`<span class="slot-plus" aria-hidden="true">+</span>`)}
        </div>
        <div class="identity-preview ${t?`valid`:``}" aria-live="polite">
          ${t?`<span>지금의 대답</span><strong>${t.label}</strong>`:`<span>두 조각이 하나의 말이 되기를 기다립니다.</span>`}
        </div>
        <div class="fragment-bank" aria-label="모은 글자 조각">
          ${u.fragments.map(O).join(``)}
        </div>
        <p class="assembly-hint">글자를 누르거나 답 칸으로 끌어 놓으세요. 가능한 답은 용감한·다정한·자유로운 사람입니다.</p>
        <p class="feedback-line ${u.feedback.startsWith(`두 글자`)?`error`:``}">${v(u.feedback)}</p>
        <button class="primary-button" type="button" data-action="answer" ${t?``:`disabled`}>
          이 말로 대답하기 <span aria-hidden="true">→</span>
        </button>
      </section>
    </main>`)}function D(e,n){let r=t.find(t=>t.fragmentId===e);return`
    <button
      class="answer-slot ${e?`filled`:``}"
      type="button"
      data-action="clear-slot"
      data-slot="${n}"
      aria-label="${e?`${r?.fragment??``} 글자 제거`:`${n+1}번째 빈 답 칸`}"
    >
      ${r?r.fragment:`<span>?</span>`}
    </button>`}function O(e){let n=t.find(t=>t.fragmentId===e),r=u.assemblySlots.includes(e);return`
    <button
      class="fragment-chip ${r?`used`:``}"
      type="button"
      draggable="${!r}"
      data-action="place-fragment"
      data-fragment="${e}"
      style="--accent:${n.accent}"
      aria-pressed="${r}"
      aria-label="${n.fragment} 글자, ${v(n.memoryTitle)}"
    >
      <strong>${n.fragment}</strong><span>${v(n.memoryTitle)}</span>
    </button>`}function k(){let e=i(u.aspiration),n=i(u.identity),r=e?.id===n?.id?`출발할 때 품은 말과 같은 ${n?.short??``} 사람을 골랐습니다. 하지만 그 말 안에는 이제 여섯 개의 경험이 함께 있습니다.`:`출발할 때는 ${e?.short??``} 사람이 되고 싶었습니다. 지금은 ${n?.short??``} 사람이라고 대답했습니다.`;return A(`
    <main class="ending-scene" aria-labelledby="scene-title">
      <div class="dawn-glow" aria-hidden="true"></div>
      <div class="ending-orbits" aria-hidden="true">
        ${t.map((e,t)=>`<span style="--i:${t};--accent:${e.accent}">${e.fragment}</span>`).join(``)}
      </div>
      <section class="ending-copy">
        <p class="eyebrow">ARRIVAL / 05:47</p>
        <p class="ending-kicker">나는</p>
        <h1 id="scene-title" tabindex="-1">${v(n?.label??``)}</h1>
        <p class="ending-lead">${v(r)}</p>
        <blockquote>
          바라던 삶과 달라도 괜찮습니다.<br />
          그것도 당신의 삶이고,<br />
          그 삶은 가치가 있습니다.
        </blockquote>
        <div class="ending-record">
          <span>방문한 빛 <strong>${u.visited.length}</strong></span>
          <span>여정 <strong>${F(u.elapsedSeconds)}</strong></span>
          <span>대답 <strong>${v(n?.short??``)}</strong></span>
        </div>
        <button class="primary-button light" type="button" data-action="restart" data-autofocus>
          다른 말로 다시 출발 <span aria-hidden="true">↻</span>
        </button>
      </section>
    </main>`)}function A(e){return`<div class="game-shell">${ne()}${e}</div>`}function re(e){let n=t.find(t=>t.fragmentId===e);return`<span style="--accent:${n.accent}" title="${v(n.memoryTitle)}">${n.fragment}</span>`}function j(){return`
    <svg viewBox="0 0 76 92" role="img" aria-label="우주를 유영하는 여행자">
      <path class="pack" d="M17 39c-8 3-10 11-8 24l14-2 1-20z" />
      <path class="body" d="M25 40c7-5 21-5 28 1l7 34c-10 6-28 6-39 0z" />
      <circle class="helmet" cx="39" cy="27" r="20" />
      <path class="visor" d="M23 26c5-13 26-16 33-4 3 5 1 12-2 16-9 4-21 3-29-2-2-3-3-7-2-10z" />
      <path class="face" d="M33 29h1m10 0h1m-10 7c3 2 6 2 9 0" />
      <path class="age-line age-line-one" d="M30 32l-4 2m23-2 4 2" />
      <path class="age-line age-line-two" d="M34 23c3-2 7-2 10 0" />
      <path class="arm arm-left" d="M24 45 9 55 3 50" />
      <path class="arm arm-right" d="M54 44 68 35 73 40" />
      <path class="leg" d="M30 75 21 89m28-14 8 14" />
      <circle class="memory-dot dot-a" cx="64" cy="19" r="2" />
      <circle class="memory-dot dot-b" cx="69" cy="26" r="1.6" />
      <circle class="memory-dot dot-c" cx="61" cy="11" r="1.4" />
    </svg>`}function M(){return`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m4 9 4-3 4-3v18l-4-3H4z"/><path d="M16 8c1.4 1 2 2.2 2 4s-.6 3-2 4M19 5c2 1.8 3 4 3 7s-1 5.2-3 7"/></svg>`}function N(){return`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m4 9 4-3 4-3v18l-4-3H4z"/><path d="m16 9 6 6m0-6-6 6"/></svg>`}function P(){return`<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8"/><path d="M4 12h16M12 4c3 3 3 13 0 16M12 4c-3 3-3 13 0 16"/></svg>`}function F(e){let t=Math.floor(e/60),n=Math.floor(e%60);return`${String(t).padStart(2,`0`)}:${String(n).padStart(2,`0`)}`}function I(){let e=u.soundEnabled,t=u.reducedMotion;u=_(),u.soundEnabled=e,u.reducedMotion=t,g.clear(),h.clear(),K()}function L(){u.aspiration&&(u.scene=`flight`,u.position={x:50,y:57},u.velocity={x:0,y:0},u.target=null,u.startedAt=performance.now(),u.elapsedSeconds=0,u.feedback=`별과 행성 가까이 유영해 방문하세요.`,b(`move`),K())}function R(){if(!u.nearbyDestination||u.visited.includes(u.nearbyDestination)){y(`아직 방문할 수 있는 빛이 가까이 없습니다.`),b(`error`);return}u.currentDestination=u.nearbyDestination,u.nearbyDestination=null,u.velocity={x:0,y:0},u.target=null,u.scene=`memory`,b(`near`),K()}function z(){let e=a(u.currentDestination);e&&(u.visited.includes(e.id)||u.visited.push(e.id),u.fragments.includes(e.fragmentId)||u.fragments.push(e.fragmentId),u.feedback=`${e.fragment} 조각을 품었습니다.`,u.currentDestination=null,b(`collect`),u.visited.length===t.length?(u.scene=`assembly`,u.assemblySlots=[null,null],u.feedback=`두 조각을 골라 지금의 답을 완성하세요.`):u.scene=`flight`,K())}function B(e,t){let n=u.assemblySlots.indexOf(e);if(n>=0){u.assemblySlots[n]=null,u.feedback=`글자를 다시 조각 모음으로 돌려놓았습니다.`,K(!1);return}let r=t??u.assemblySlots.findIndex(e=>e===null);if(r<0||r>1){u.feedback=`두 글자만 놓을 수 있습니다. 답 칸의 글자를 먼저 비워 주세요.`,b(`error`),K(!1);return}if(u.assemblySlots[r]){let t=u.assemblySlots.indexOf(e);t>=0&&(u.assemblySlots[t]=null)}u.assemblySlots[r]=e;let i=o(u.assemblySlots.filter(e=>e!==null));u.feedback=i?`${i.label}이라는 답이 완성되었습니다.`:`한 조각을 더 골라 주세요.`,b(`place`),K(!1)}function V(){let e=o(u.assemblySlots.filter(e=>e!==null));if(!e){u.feedback=`두 글자가 아직 하나의 답이 되지 않았습니다.`,b(`error`),K(!1);return}u.identity=e.id,u.scene=`ending`,u.elapsedSeconds=H(),b(`ending`),K()}function H(){return u.startedAt===null?u.elapsedSeconds:Math.max(u.elapsedSeconds,(performance.now()-u.startedAt)/1e3)}function U(e){let n=t.find(t=>t.id===e);if(!n||u.visited.includes(n.id)){y(`이미 방문한 빛입니다.`);return}u.target={x:n.x,y:n.y},u.feedback=`${n.name} 쪽으로 몸을 기울였습니다.`,Z(),y(u.feedback)}function W(){u.soundEnabled=!u.soundEnabled,u.soundEnabled&&b(`move`),K(!1)}function G(){u.reducedMotion=!u.reducedMotion,K(!1),y(u.reducedMotion?`장식 움직임을 줄였습니다.`:`기본 움직임을 사용합니다.`)}function K(e=!0){window.cancelAnimationFrame(d),d=0,document.documentElement.dataset.reducedMotion=String(u.reducedMotion);let t=``;u.scene===`title`&&(t=`<div class="game-shell title-shell">${x()}</div>`),u.scene===`choice`&&(t=S()),u.scene===`flight`&&(t=C()),u.scene===`memory`&&(t=T()),u.scene===`assembly`&&(t=E()),u.scene===`ending`&&(t=k()),s.innerHTML=t,u.scene===`flight`&&(X(),f=performance.now(),d=window.requestAnimationFrame(q)),e&&window.requestAnimationFrame(()=>{s.querySelector(`[data-autofocus], h1[tabindex="-1"]`)?.focus({preventScroll:!0})})}function q(e){if(u.scene!==`flight`)return;let t=Math.min((e-f)/1e3,.05);f=e;let n=J(),r=n.x!==0||n.y!==0;r&&(u.target=null);let i=n;if(!r&&u.target){let e=u.target.x-u.position.x,t=u.target.y-u.position.y,n=Math.hypot(e,t);n<1.5?u.target=null:i={x:e/n,y:t/n}}let a=Math.hypot(i.x,i.y);a>1&&(i.x/=a,i.y/=a);let o=u.reducedMotion?27:23,s=(u.reducedMotion?.72:.82)**(t*10);u.velocity.x=(u.velocity.x+i.x*o*t)*s,u.velocity.y=(u.velocity.y+i.y*o*t)*s;let c=Math.hypot(u.velocity.x,u.velocity.y),l=u.reducedMotion?10.5:11.5;c>l&&(u.velocity.x=u.velocity.x/c*l,u.velocity.y=u.velocity.y/c*l),u.position.x=Q(u.position.x+u.velocity.x*t,4,96),u.position.y=Q(u.position.y+u.velocity.y*t,7,91),(u.position.x===4||u.position.x===96)&&(u.velocity.x*=-.25),(u.position.y===7||u.position.y===91)&&(u.velocity.y*=-.25),u.elapsedSeconds=H(),Y(),X(),d=window.requestAnimationFrame(q)}function J(){let e=g.has(`arrowleft`)||g.has(`a`)||h.has(`left`),t=g.has(`arrowright`)||g.has(`d`)||h.has(`right`),n=g.has(`arrowup`)||g.has(`w`)||h.has(`up`),r=g.has(`arrowdown`)||g.has(`s`)||h.has(`down`);return{x:Number(t)-Number(e),y:Number(r)-Number(n)}}function Y(){let e=null,n=1/0;t.forEach(t=>{if(u.visited.includes(t.id))return;let r=Math.hypot(t.x-u.position.x,t.y-u.position.y);r<7.2&&r<n&&(e=t.id,n=r)}),e!==u.nearbyDestination&&(u.nearbyDestination=e,e&&(y(`${a(e)?.name??`빛`}에 도착했습니다. 방문 버튼이나 Enter를 누르세요.`),b(`near`)))}function X(){let e=document.querySelector(`#traveler`);if(e){e.style.left=`${u.position.x}%`,e.style.top=`${u.position.y}%`;let t=Math.atan2(u.velocity.y,u.velocity.x)*(180/Math.PI);e.style.setProperty(`--flight-angle`,`${Number.isFinite(t)?t:0}deg`),e.classList.toggle(`moving`,Math.hypot(u.velocity.x,u.velocity.y)>.5)}let t=document.querySelector(`#elapsed-time`);t&&(t.textContent=F(u.elapsedSeconds));let n=document.querySelector(`#visit-button`),r=document.querySelector(`#nearby-message`),i=a(u.nearbyDestination);n&&(n.disabled=!i,n.textContent=i?`${i.name} 방문`:`가까운 빛 없음`),r&&(r.textContent=i?`도착: ${i.name}`:`빛 가까이 다가가면 방문할 수 있습니다.`),Z()}function Z(){let e=document.querySelector(`#target-marker`);if(e){if(!u.target){e.classList.remove(`visible`);return}e.classList.add(`visible`),e.style.left=`${u.target.x}%`,e.style.top=`${u.target.y}%`}}function Q(e,t,n){return Math.max(t,Math.min(n,e))}s.addEventListener(`click`,e=>{let t=e.target.closest(`[data-action]`);if(!t)return;let n=t.dataset.action;if(n===`start`&&(u.scene=`choice`,u.feedback=`되고 싶은 말을 하나 골라 주세요.`,K()),n===`restart`&&I(),n===`toggle-sound`&&W(),n===`toggle-motion`&&G(),n===`select-aspiration`){u.aspiration=t.dataset.aspiration;let e=i(u.aspiration);u.feedback=`${e?.label??``}이라는 말을 품었습니다.`,b(`place`),K(!1)}if(n===`depart`&&L(),n===`target-destination`&&U(t.dataset.destination),n===`visit`&&R(),n===`collect-memory`&&z(),n===`place-fragment`&&B(t.dataset.fragment),n===`clear-slot`){let e=Number(t.dataset.slot);u.assemblySlots[e]&&(u.assemblySlots[e]=null,u.feedback=`답 칸을 비웠습니다.`,K(!1))}n===`answer`&&V()}),s.addEventListener(`pointerdown`,e=>{let t=e.target.closest(`[data-direction]`);if(t){e.preventDefault(),t.setPointerCapture(e.pointerId),h.add(t.dataset.direction),u.target=null;return}let n=e.target.closest(`#space-map`);!n||u.scene!==`flight`||e.target.closest(`button`)||(e.preventDefault(),n.setPointerCapture(e.pointerId),$(e,n))}),s.addEventListener(`pointermove`,e=>{let t=e.target.closest(`#space-map`);!t||u.scene!==`flight`||!t.hasPointerCapture(e.pointerId)||$(e,t)});function $(e,t){let n=t.getBoundingClientRect();u.target={x:Q((e.clientX-n.left)/n.width*100,4,96),y:Q((e.clientY-n.top)/n.height*100,7,91)},Z()}window.addEventListener(`pointerup`,e=>{let t=document.elementFromPoint(e.clientX,e.clientY)?.closest(`[data-direction]`);t&&h.delete(t.dataset.direction),h.size>0&&h.clear()}),window.addEventListener(`pointercancel`,()=>h.clear()),window.addEventListener(`keydown`,e=>{let t=e.key.toLowerCase(),n=[`arrowleft`,`arrowright`,`arrowup`,`arrowdown`,`w`,`a`,`s`,`d`].includes(t);u.scene===`flight`&&n&&(e.preventDefault(),g.add(t),u.target=null),u.scene===`flight`&&(t===`enter`||t===`e`)&&!e.repeat&&(e.preventDefault(),R())}),window.addEventListener(`keyup`,e=>g.delete(e.key.toLowerCase())),window.addEventListener(`blur`,()=>{g.clear(),h.clear()}),s.addEventListener(`dragstart`,e=>{let t=e.target.closest(`[data-fragment]`);if(!t||t.classList.contains(`used`)){e.preventDefault();return}m=t.dataset.fragment,e.dataTransfer?.setData(`text/plain`,m),e.dataTransfer&&(e.dataTransfer.effectAllowed=`move`)}),s.addEventListener(`dragover`,e=>{e.target.closest(`[data-slot]`)&&e.preventDefault()}),s.addEventListener(`drop`,e=>{let t=e.target.closest(`[data-slot]`);!t||!m||(e.preventDefault(),B(m,Number(t.dataset.slot)),m=null)}),l.addEventListener(`change`,e=>{u.reducedMotion!==e.matches&&(u.reducedMotion=e.matches,K(!1))}),K();