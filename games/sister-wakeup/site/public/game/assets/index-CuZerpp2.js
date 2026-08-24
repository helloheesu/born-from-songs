(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),t.credentials=e.crossOrigin===`use-credentials`?`include`:e.crossOrigin===`anonymous`?`omit`:`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();function e(){return{phase:`title`,wake:0,anger:0,remaining:90,sound:0,light:8,temperature:27.5,stress:0,actions:0,score:0,failureReason:null}}function t(e){return e>=67?2:+(e>=34)}function n(e,t,n,r){return e>=t&&e<=n?1:e<t?Math.max(0,1-(t-e)/r):Math.max(0,1-(e-n)/r)}function r(e){let r=t(e.wake),i=n(e.sound,42,62,24),a=r>=1?n(e.light,38,66,30):0,o=r>=2?n(e.temperature,21,23.5,5.5):0,s=0;s=r===0?i*5.1:r===1?i*.8+a*4.1:i*.45+a*1.1+o*3.9,s<.3&&(s=-.32),r>=2&&e.temperature<18.5&&(s-=.75);let c=e.sound>70?(e.sound-70)/24:0,l=r>=1&&e.light>82?(e.light-82)/14:0,u=r>=2&&e.temperature<18.5?(18.5-e.temperature)/3.5:0,d=r>=2&&e.temperature>26?(e.temperature-26)/4:0;return{wakeRate:s,stressRate:c+l+u+d,soundQuality:i,lightQuality:a,temperatureQuality:o}}function i(e){return Math.max(0,Math.round(e.remaining*75+(10-e.anger)*260-e.actions*3))}function a(e,t){if(e.phase!==`playing`)return e;let n=r(e),a={...e,remaining:Math.max(0,e.remaining-t),wake:Math.max(0,Math.min(100,e.wake+n.wakeRate*t)),stress:e.stress+n.stressRate*t};if(a.stress>=1){let e=Math.floor(a.stress);a.anger=Math.min(10,a.anger+e),a.stress-=e}return a.anger>=10?(a.phase=`failure`,a.failureReason=`anger`,a):a.wake>=100?(a.phase=`success`,a.wake=100,a.score=i(a),a):(a.remaining<=0&&(a.phase=`failure`,a.failureReason=`time`),a)}var o=document.querySelector(`#app`),s=document.querySelector(`#announcer`);if(!o||!s)throw Error(`Game root is missing`);var c={0:{label:`Deep Sleep`,hint:`먼저, 너무 크지 않은 소리를 오래 들려 주세요.`,next:`조명`},1:{label:`REM`,hint:`눈꺼풀이 움직여요. 커튼을 천천히 열어 보세요.`,next:`온도`},2:{label:`Almost Awake`,hint:`이불 속이 더워요. 편안한 온도를 찾아 주세요.`,next:`Awake`}},l=e(),u=performance.now(),d=-1,f=0,p=0,m=null,h=null,g=null,_=null,v=null,y=!1,b=!1,x=0,S=`선택 입력`,C=`sister-wakeup-best-score`;function w(e){return e.replace(/[&<>'"]/g,e=>({"&":`&amp;`,"<":`&lt;`,">":`&gt;`,"'":`&#39;`,'"':`&quot;`})[e]??e)}function T(e){s.textContent=``,window.setTimeout(()=>{s.textContent=e},20)}function E(){try{return Number.parseInt(localStorage.getItem(C)??`0`,10)||0}catch{return 0}}function D(e){let t=Math.max(E(),e);try{localStorage.setItem(C,String(t))}catch{}return t}function O(e,t=.08,n=.035){try{m??=new AudioContext;let r=m.createOscillator(),i=m.createGain();r.type=`sine`,r.frequency.value=e,i.gain.setValueAtTime(n,m.currentTime),i.gain.exponentialRampToValueAtTime(1e-4,m.currentTime+t),r.connect(i).connect(m.destination),r.start(),r.stop(m.currentTime+t)}catch{}}function k(e){O(e===1?440:554,.12,.045),window.setTimeout(()=>O(e===1?554:659,.15,.04),90)}function A(e){(e?[523,659,784]:[220,185,147]).forEach((e,t)=>window.setTimeout(()=>O(e,.22,.05),t*125))}function j(e){let t=l.anger>=7?`furious`:l.anger>=4?`grumpy`:e===2?`stirring`:`sleeping`,n=Math.max(0,Math.min(100,l.light)),r=Math.max(0,Math.min(1,(l.temperature-16)/14));return`
    <section class="room" style="--light:${l.light}; --curtain:${n}%; --warmth:${r}" aria-label="희수가 잠든 방">
      <div class="window" aria-hidden="true">
        <div class="sky"><span></span><span></span><span></span></div>
        <div class="curtain curtain-left"></div>
        <div class="curtain curtain-right"></div>
      </div>
      <div class="clock" aria-label="남은 시간 ${Math.ceil(l.remaining)}초">${z(l.remaining)}</div>
      <div class="air-lines ${e===2?`visible`:``}" aria-hidden="true"><i></i><i></i><i></i></div>
      <div class="bed" aria-hidden="true">
        <div class="headboard"></div>
        <div class="pillow"></div>
        <div class="sleeper ${t}">
          <span class="hair"></span>
          <span class="face"><i class="eye eye-a"></i><i class="eye eye-b"></i><i class="mouth"></i></span>
        </div>
        <div class="blanket"></div>
        <div class="sleep-marks ${e===2?`small`:``}"><b>Z</b><b>z</b><b>z</b></div>
      </div>
      <div class="room-reaction" aria-live="polite">${w(M(e))}</div>
    </section>
  `}function M(e){let t=r(l);return l.anger>=8?`이제 진짜 화낸다…!`:l.sound>75?`으으… 너무 시끄러워.`:e>=1&&l.light>82?`눈부셔… 천천히.`:e>=2&&l.temperature<18.5?`추워. 이불 다시 덮을래.`:e>=2&&t.temperatureQuality>.9?`이 온도… 괜찮은데?`:e>=1&&t.lightQuality>.9?`아침인가…`:t.soundQuality>.9?e===0?`…응? 무슨 소리지?`:`조금 들려…`:e===0?`새근… 새근…`:e===1?`뒤척…`:`곧 눈을 뜰 것 같아요.`}function N(e){return`
    <section class="wake-panel" aria-label="수면 단계와 분노">
      <div class="panel-heading">
        <div>
          <span class="eyebrow">SLEEP CYCLE</span>
          <strong>${c[e].label}</strong>
        </div>
        <span class="wake-number">${Math.floor(l.wake)}<small>%</small></span>
      </div>
      <div class="wake-track" role="progressbar" aria-label="기상 진행도" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(l.wake)}">
        <span style="width:${l.wake}%"></span>
        <i class="marker marker-one"></i>
        <i class="marker marker-two"></i>
      </div>
      <div class="stage-labels"><span>Deep Sleep</span><span>REM</span><span>Awake</span></div>
      <div class="anger-row">
        <span class="eyebrow">ANGRY</span>
        <div class="anger-pips" role="meter" aria-label="분노 횟수" aria-valuemin="0" aria-valuemax="10" aria-valuenow="${l.anger}">
          ${Array.from({length:10},(e,t)=>`<i class="${t<l.anger?`filled`:``}"></i>`).join(``)}
        </div>
        <strong>${l.anger}<small> / 10</small></strong>
      </div>
    </section>
  `}function P(e){return e>.86?`편안함`:e>.35?`반응 있음`:`반응 없음`}function F(e){let t=r(l);return`
    <section class="controls" aria-label="방 환경 조절">
      <article class="control-card active-control">
        <div class="control-title"><span class="control-icon sound-icon" aria-hidden="true">)))</span><div><strong>소리</strong><small>${P(t.soundQuality)}</small></div><output>${Math.round(l.sound)} dB</output></div>
        <label class="range-label" for="sound-range">소리 크기</label>
        <input id="sound-range" data-control="sound" type="range" min="0" max="100" step="1" value="${l.sound}" aria-describedby="sound-guide" ${y?`disabled`:``} />
        <div id="sound-guide" class="range-guide"><span>쉿</span><span>적당히</span><span>쾅</span></div>
        <div class="card-actions">
          <button class="small-button" data-action="toggle-sound" type="button">Space · 적당한 소리</button>
          <button class="small-button ${y?`is-on`:``}" data-action="microphone" type="button" ${b?`aria-disabled="true" aria-busy="true"`:``}>${b?`권한 확인 중…`:y?`마이크 끄기`:`마이크 켜기`}</button>
        </div>
        <p class="microphone-status">${w(S)}</p>
      </article>

      <article class="control-card ${e>=1?`active-control`:`locked-control`}">
        <div class="control-title"><span class="control-icon light-icon" aria-hidden="true">☼</span><div><strong>조명</strong><small>${e>=1?P(t.lightQuality):`REM에서 열림`}</small></div><output>${Math.round(l.light)}%</output></div>
        <label class="range-label" for="light-range">커튼 열기</label>
        <input id="light-range" data-control="light" type="range" min="0" max="100" step="1" value="${l.light}" ${e<1?`disabled`:``} />
        <div class="range-guide"><span>어둡게</span><span>은은하게</span><span>눈부심</span></div>
        ${e<1?`<span class="lock-note">먼저 소리로 깊은 잠을 깨워 주세요.</span>`:``}
      </article>

      <article class="control-card ${e>=2?`active-control`:`locked-control`}">
        <div class="control-title"><span class="control-icon temp-icon" aria-hidden="true">≈</span><div><strong>온도</strong><small>${e>=2?P(t.temperatureQuality):`Almost Awake에서 열림`}</small></div><output>${l.temperature.toFixed(1)}°</output></div>
        <label class="range-label" for="temp-range">방 온도</label>
        <input id="temp-range" data-control="temperature" type="range" min="16" max="30" step="0.5" value="${l.temperature}" ${e<2?`disabled`:``} />
        <div class="range-guide"><span>차가움</span><span>포근함</span><span>더움</span></div>
        ${e<2?`<span class="lock-note">눈을 뜰 듯하면 온도를 맞출 수 있어요.</span>`:``}
      </article>
    </section>
  `}function I(){let e=E();return`
    <main class="title-screen">
      <div class="title-stars" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div>
      <section class="title-copy">
        <span class="kicker">환경 추리 퍼즐 · 독립 프로토타입</span>
        <h1>희수<br><em>깨우기</em></h1>
        <p>크게 깨우면 화내고, 살살 깨우면 다시 잡니다.<br />소리·빛·온도의 딱 좋은 범위를 찾아보세요.</p>
        <div class="rules-preview">
          <span><b>90</b>초</span>
          <span><b>&lt; 10</b> Angry</span>
          <span><b>A+</b> Awake</span>
        </div>
        <button class="primary-button" data-action="start" type="button">조심히 깨우기 <span>→</span></button>
        ${e?`<p class="best-score">BEST ${e.toLocaleString(`ko-KR`)}</p>`:``}
      </section>
      <div class="title-bed" aria-hidden="true">
        <div class="title-moon"></div>
        <div class="mini-bed"><span class="mini-head"></span><span class="mini-blanket"></span></div>
        <div class="giant-z"><b>Z</b><i>z</i><em>z</em></div>
      </div>
    </main>
  `}function L(){let e=t(l.wake);return`
    <main class="game-screen">
      <header class="game-header">
        <div class="brand"><span>WAKE</span><strong>희수 깨우기</strong></div>
        <div class="mission-copy"><span>현재 목표</span><strong>${w(c[e].hint)}</strong></div>
        <div class="time-pill ${l.remaining<=15?`urgent`:``}"><small>남은 시간</small><strong>${z(l.remaining)}</strong></div>
      </header>
      <div class="play-grid">
        <div class="room-column">
          ${j(e)}
          ${N(e)}
        </div>
        <div class="control-column">
          <div class="unlock-note"><span>ROUND ${e+1} / 3</span><strong>다음: ${c[e].next}</strong></div>
          ${F(e)}
        </div>
      </div>
    </main>
  `}function R(e){let t=e?D(l.score):E(),n=e?`You did it!`:l.failureReason===`anger`?`Too angry!`:`Too late!`,r=e?`희수가 ${90-Math.ceil(l.remaining)}초 만에 화내지 않고 일어났어요.`:l.failureReason===`anger`?`갑자기 바뀐 환경에 결국 이불을 뒤집어썼습니다.`:`알람이 끝났지만 희수는 다시 깊이 잠들었습니다.`;return`
    <main class="result-screen ${e?`success-result`:`failure-result`}">
      <section class="result-card">
        <span class="result-eyebrow">WAKE-UP REPORT</span>
        <div class="grade" aria-label="등급 ${e?`A 플러스`:`F`}">${e?`A+`:`F`}</div>
        <h1>${n}</h1>
        <p>${r}</p>
        <div class="report-grid">
          <div><small>WAKE</small><strong>${Math.floor(l.wake)}%</strong></div>
          <div><small>ANGRY</small><strong>${l.anger} / 10</strong></div>
          <div><small>TIME</small><strong>${z(l.remaining)}</strong></div>
          <div><small>SCORE</small><strong>${e?l.score.toLocaleString(`ko-KR`):`—`}</strong></div>
        </div>
        ${e?`<p class="best-score">BEST ${t.toLocaleString(`ko-KR`)}</p>`:``}
        <button class="primary-button" data-action="restart" type="button">다시 깨우기 <span>R</span></button>
      </section>
      <div class="result-character ${e?`awake`:`hidden`}" aria-hidden="true">
        <span class="result-hair"></span><span class="result-face"><i></i><b></b></span>
        <p>${e?`Thank you, sister!`:`5분만 더…`}</p>
      </div>
    </main>
  `}function z(e){let t=Math.max(0,Math.ceil(e)),n=Math.floor(t/60);return`${String(n).padStart(2,`0`)}:${String(t%60).padStart(2,`0`)}`}function B(e=!1){let t=document.activeElement instanceof HTMLElement&&o.contains(document.activeElement)?document.activeElement:null,n=t?{id:t.id,action:t.dataset.action??null}:null;if(o.innerHTML=l.phase===`title`?I():l.phase===`playing`?L():R(l.phase===`success`),e){let e=o.querySelector(`h1`)??o.querySelector(`main`);if(!e)return;e.tabIndex=-1,e.focus({preventScroll:!0});return}if(!n)return;let r=n.id?document.getElementById(n.id):null,i=n.action?Array.from(o.querySelectorAll(`[data-action]`)).find(e=>e.dataset.action===n.action)??null:null,a=r instanceof HTMLElement&&o.contains(r)?r:i;(a instanceof HTMLInputElement&&a.disabled?o.querySelector(`input[data-control]:not(:disabled), button[data-action]:not([aria-disabled="true"])`):a)?.focus({preventScroll:!0})}function V(){if(l.phase!==`playing`)return;let e=t(l.wake),n=r(l),i=z(l.remaining),a=o.querySelector(`.time-pill`);a?.classList.toggle(`urgent`,l.remaining<=15);let s=a?.querySelector(`strong`);s&&(s.textContent=i);let c=o.querySelector(`.clock`);c&&(c.textContent=i,c.setAttribute(`aria-label`,`남은 시간 ${Math.ceil(l.remaining)}초`));let u=o.querySelector(`.wake-number`);u&&(u.innerHTML=`${Math.floor(l.wake)}<small>%</small>`);let d=o.querySelector(`.wake-track`);d?.setAttribute(`aria-valuenow`,String(Math.round(l.wake)));let f=d?.querySelector(`:scope > span`);f&&(f.style.width=`${l.wake}%`);let p=o.querySelector(`.anger-pips`);p?.setAttribute(`aria-valuenow`,String(l.anger)),p?.querySelectorAll(`i`).forEach((e,t)=>e.classList.toggle(`filled`,t<l.anger));let m=o.querySelector(`.anger-row > strong`);m&&(m.innerHTML=`${l.anger}<small> / 10</small>`);let h=o.querySelector(`.room`);h?.style.setProperty(`--light`,String(l.light)),h?.style.setProperty(`--curtain`,`${l.light}%`),h?.style.setProperty(`--warmth`,String(Math.max(0,Math.min(1,(l.temperature-16)/14))));let g=l.anger>=7?`furious`:l.anger>=4?`grumpy`:e===2?`stirring`:`sleeping`,_=o.querySelector(`.sleeper`);_?.classList.remove(`furious`,`grumpy`,`stirring`,`sleeping`),_?.classList.add(g);let v=o.querySelector(`.room-reaction`),y=M(e);v&&v.textContent!==y&&(v.textContent=y);let b={sound:{value:l.sound,output:`${Math.round(l.sound)} dB`,quality:P(n.soundQuality)},light:{value:l.light,output:`${Math.round(l.light)}%`,quality:e>=1?P(n.lightQuality):`REM에서 열림`},temperature:{value:l.temperature,output:`${l.temperature.toFixed(1)}°`,quality:e>=2?P(n.temperatureQuality):`Almost Awake에서 열림`}};o.querySelectorAll(`input[data-control]`).forEach(e=>{let t=e.dataset.control;if(!t)return;let n=b[t];e.value=String(n.value);let r=e.closest(`.control-card`),i=r?.querySelector(`output`);i&&(i.textContent=n.output);let a=r?.querySelector(`.control-title small`);a&&(a.textContent=n.quality)})}function H(){G(),l={...e(),phase:`playing`},u=performance.now(),d=Math.ceil(l.remaining),f=0,p=0,S=`선택 입력`,O(392,.1),B(!0),T(`게임 시작. 소리 조절만 사용할 수 있습니다.`)}function U(){y||l.phase!==`playing`||(l.sound>=40&&l.sound<=65?l.sound=0:l.sound=52,l.actions+=1,V(),T(l.sound===0?`적당한 소리를 껐습니다.`:`적당한 소리를 켰습니다.`))}async function W(){if(l.phase!==`playing`||b)return;if(y){G(),S=`마이크를 껐어요. 슬라이더를 사용하세요.`,B();return}if(!navigator.mediaDevices?.getUserMedia){S=`이 브라우저에서는 마이크를 쓸 수 없어요. 슬라이더로 플레이할 수 있습니다.`,B();return}let e=++x;b=!0,S=`마이크 권한을 기다리는 중…`,B();let t=null,n=null;try{if(t=await navigator.mediaDevices.getUserMedia({audio:!0}),e!==x||l.phase!==`playing`){t.getTracks().forEach(e=>e.stop());return}n=new AudioContext;let r=n.createMediaStreamSource(t),i=n.createAnalyser();i.fftSize=512;let a=new Uint8Array(i.fftSize);r.connect(i),g=t,h=n,_=i,v=a,y=!0,b=!1,S=`마이크 입력 중 · 실제 소리의 상대 크기를 사용합니다.`,l.actions+=1,B(),T(`마이크 입력을 시작했습니다.`)}catch{if(t?.getTracks().forEach(e=>e.stop()),n&&n.state!==`closed`&&n.close(),e!==x)return;b=!1,S=`권한을 받지 못했어요. 소리 슬라이더로 계속 플레이할 수 있습니다.`,B(),T(`마이크를 사용할 수 없어 슬라이더 입력을 유지합니다.`)}}function G(){x+=1,b=!1,g?.getTracks().forEach(e=>e.stop()),h&&h.state!==`closed`&&h.close(),h=null,g=null,_=null,v=null,y=!1}function K(){if(!y||!_||!v)return;_.getByteTimeDomainData(v);let e=0;for(let t of v){let n=(t-128)/128;e+=n*n}let t=Math.sqrt(e/v.length),n=Math.max(0,Math.min(100,20+t*330));l.sound=l.sound*.72+n*.28}function q(e){if(l.phase!==`playing`)return;let n=Number.parseFloat(e.value),r=e.dataset.control;r===`sound`&&!y&&(l.sound=n),r===`light`&&t(l.wake)>=1&&(l.light=n),r===`temperature`&&t(l.wake)>=2&&(l.temperature=n),V()}function J(){l.phase===`playing`&&(l.actions+=1)}function Y(e){let n=Math.min(.1,Math.max(0,(e-u)/1e3));if(u=e,l.phase===`playing`){K();let e=t(l.wake),r=l.anger;if(l=a(l,n),l.phase!==`playing`)G(),A(l.phase===`success`),B(!0),T(l.phase===`success`?`성공. A 플러스.`:`실패. 다시 시도할 수 있습니다.`);else{let n=t(l.wake),i=Math.ceil(l.remaining),a=n!==e,o=l.anger!==r;a?(k(n),T(`${c[n].label} 단계. ${c[n].hint}`),B()):(o&&(O(130,.13,.055),T(`화남 ${l.anger}회`)),(o||i!==d||n!==f||l.anger!==p)&&V()),d=i,f=n,p=l.anger}}requestAnimationFrame(Y)}o.addEventListener(`click`,e=>{let t=e.target.closest(`[data-action]`);if(!t)return;let n=t.dataset.action;(n===`start`||n===`restart`)&&H(),n===`toggle-sound`&&U(),n===`microphone`&&W()}),o.addEventListener(`input`,e=>{e.target instanceof HTMLInputElement&&q(e.target)}),o.addEventListener(`change`,e=>{e.target instanceof HTMLInputElement&&J()}),window.addEventListener(`keydown`,e=>{if(e.code===`Space`&&l.phase===`playing`&&!e.repeat){if(e.target.matches(`input, button`))return;e.preventDefault(),U()}e.code===`Space`&&l.phase===`title`&&(e.preventDefault(),H()),e.key.toLowerCase()===`r`&&(l.phase===`success`||l.phase===`failure`)&&H()}),document.addEventListener(`visibilitychange`,()=>{u=performance.now()}),window.addEventListener(`beforeunload`,G),B(),requestAnimationFrame(Y);