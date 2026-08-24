(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),t.credentials=e.crossOrigin===`use-credentials`?`include`:e.crossOrigin===`anonymous`?`omit`:`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();function e(){return{phase:`title`,wake:0,anger:0,remaining:90,sound:0,light:8,temperature:27.5,stress:0,actions:0,score:0,failureReason:null}}function t(e){return e>=67?2:+(e>=34)}function n(e,t,n,r){return e>=t&&e<=n?1:e<t?Math.max(0,1-(t-e)/r):Math.max(0,1-(e-n)/r)}function r(e){let r=t(e.wake),i=n(e.sound,42,62,24),a=r>=1?n(e.light,38,66,30):0,o=r>=2?n(e.temperature,21,23.5,5.5):0,s=0;s=r===0?i*5.1:r===1?i*.8+a*4.1:i*.45+a*1.1+o*3.9,s<.3&&(s=-.32),r>=2&&e.temperature<18.5&&(s-=.75);let c=e.sound>70?(e.sound-70)/24:0,l=r>=1&&e.light>82?(e.light-82)/14:0,u=r>=2&&e.temperature<18.5?(18.5-e.temperature)/3.5:0,d=r>=2&&e.temperature>26?(e.temperature-26)/4:0;return{wakeRate:s,stressRate:c+l+u+d,soundQuality:i,lightQuality:a,temperatureQuality:o}}function i(e){return Math.max(0,Math.round(e.remaining*75+(10-e.anger)*260-e.actions*3))}function a(e,t){if(e.phase!==`playing`)return e;let n=r(e),a={...e,remaining:Math.max(0,e.remaining-t),wake:Math.max(0,Math.min(100,e.wake+n.wakeRate*t)),stress:e.stress+n.stressRate*t};if(a.stress>=1){let e=Math.floor(a.stress);a.anger=Math.min(10,a.anger+e),a.stress-=e}return a.anger>=10?(a.phase=`failure`,a.failureReason=`anger`,a):a.wake>=100?(a.phase=`success`,a.wake=100,a.score=i(a),a):(a.remaining<=0&&(a.phase=`failure`,a.failureReason=`time`),a)}var o=document.querySelector(`#app`),s=document.querySelector(`#announcer`);if(!o||!s)throw Error(`Game root is missing`);var c={0:{label:`Deep Sleep`,hint:`먼저, 너무 크지 않은 소리를 오래 들려 주세요.`,next:`조명`},1:{label:`REM`,hint:`눈꺼풀이 움직여요. 커튼을 천천히 열어 보세요.`,next:`온도`},2:{label:`Almost Awake`,hint:`이불 속이 더워요. 편안한 온도를 찾아 주세요.`,next:`Awake`}},l=e(),u=performance.now(),d=-1,f=0,p=0,m=0,h=null,g=null,_=null,v=null,y=null,b=!1,x=`선택 입력`,S=`sister-wakeup-best-score`;function C(e){return e.replace(/[&<>'"]/g,e=>({"&":`&amp;`,"<":`&lt;`,">":`&gt;`,"'":`&#39;`,'"':`&quot;`})[e]??e)}function w(e){s.textContent=``,window.setTimeout(()=>{s.textContent=e},20)}function T(){try{return Number.parseInt(localStorage.getItem(S)??`0`,10)||0}catch{return 0}}function E(e){let t=Math.max(T(),e);try{localStorage.setItem(S,String(t))}catch{}return t}function D(e,t=.08,n=.035){try{h??=new AudioContext;let r=h.createOscillator(),i=h.createGain();r.type=`sine`,r.frequency.value=e,i.gain.setValueAtTime(n,h.currentTime),i.gain.exponentialRampToValueAtTime(1e-4,h.currentTime+t),r.connect(i).connect(h.destination),r.start(),r.stop(h.currentTime+t)}catch{}}function O(e){D(e===1?440:554,.12,.045),window.setTimeout(()=>D(e===1?554:659,.15,.04),90)}function k(e){(e?[523,659,784]:[220,185,147]).forEach((e,t)=>window.setTimeout(()=>D(e,.22,.05),t*125))}function A(e){let t=l.anger>=7?`furious`:l.anger>=4?`grumpy`:e===2?`stirring`:`sleeping`,n=Math.max(0,Math.min(100,l.light)),r=Math.max(0,Math.min(1,(l.temperature-16)/14));return`
    <section class="room" style="--light:${l.light}; --curtain:${n}%; --warmth:${r}" aria-label="희수가 잠든 방">
      <div class="window" aria-hidden="true">
        <div class="sky"><span></span><span></span><span></span></div>
        <div class="curtain curtain-left"></div>
        <div class="curtain curtain-right"></div>
      </div>
      <div class="clock" aria-label="남은 시간 ${Math.ceil(l.remaining)}초">${R(l.remaining)}</div>
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
      <div class="room-reaction" aria-live="polite">${C(j(e))}</div>
    </section>
  `}function j(e){let t=r(l);return l.anger>=8?`이제 진짜 화낸다…!`:l.sound>75?`으으… 너무 시끄러워.`:e>=1&&l.light>82?`눈부셔… 천천히.`:e>=2&&l.temperature<18.5?`추워. 이불 다시 덮을래.`:e>=2&&t.temperatureQuality>.9?`이 온도… 괜찮은데?`:e>=1&&t.lightQuality>.9?`아침인가…`:t.soundQuality>.9?e===0?`…응? 무슨 소리지?`:`조금 들려…`:e===0?`새근… 새근…`:e===1?`뒤척…`:`곧 눈을 뜰 것 같아요.`}function M(e){return`
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
  `}function N(e){return e>.86?`편안함`:e>.35?`반응 있음`:`반응 없음`}function P(e){let t=r(l);return`
    <section class="controls" aria-label="방 환경 조절">
      <article class="control-card active-control">
        <div class="control-title"><span class="control-icon sound-icon" aria-hidden="true">)))</span><div><strong>소리</strong><small>${N(t.soundQuality)}</small></div><output>${Math.round(l.sound)} dB</output></div>
        <label class="range-label" for="sound-range">소리 크기</label>
        <input id="sound-range" data-control="sound" type="range" min="0" max="100" step="1" value="${l.sound}" aria-describedby="sound-guide" ${b?`disabled`:``} />
        <div id="sound-guide" class="range-guide"><span>쉿</span><span>적당히</span><span>쾅</span></div>
        <div class="card-actions">
          <button class="small-button" data-action="toggle-sound" type="button">Space · 적당한 소리</button>
          <button class="small-button ${b?`is-on`:``}" data-action="microphone" type="button">${b?`마이크 끄기`:`마이크 켜기`}</button>
        </div>
        <p class="microphone-status">${C(x)}</p>
      </article>

      <article class="control-card ${e>=1?`active-control`:`locked-control`}">
        <div class="control-title"><span class="control-icon light-icon" aria-hidden="true">☼</span><div><strong>조명</strong><small>${e>=1?N(t.lightQuality):`REM에서 열림`}</small></div><output>${Math.round(l.light)}%</output></div>
        <label class="range-label" for="light-range">커튼 열기</label>
        <input id="light-range" data-control="light" type="range" min="0" max="100" step="1" value="${l.light}" ${e<1?`disabled`:``} />
        <div class="range-guide"><span>어둡게</span><span>은은하게</span><span>눈부심</span></div>
        ${e<1?`<span class="lock-note">먼저 소리로 깊은 잠을 깨워 주세요.</span>`:``}
      </article>

      <article class="control-card ${e>=2?`active-control`:`locked-control`}">
        <div class="control-title"><span class="control-icon temp-icon" aria-hidden="true">≈</span><div><strong>온도</strong><small>${e>=2?N(t.temperatureQuality):`Almost Awake에서 열림`}</small></div><output>${l.temperature.toFixed(1)}°</output></div>
        <label class="range-label" for="temp-range">방 온도</label>
        <input id="temp-range" data-control="temperature" type="range" min="16" max="30" step="0.5" value="${l.temperature}" ${e<2?`disabled`:``} />
        <div class="range-guide"><span>차가움</span><span>포근함</span><span>더움</span></div>
        ${e<2?`<span class="lock-note">눈을 뜰 듯하면 온도를 맞출 수 있어요.</span>`:``}
      </article>
    </section>
  `}function F(){let e=T();return`
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
  `}function I(){let e=t(l.wake);return`
    <main class="game-screen">
      <header class="game-header">
        <div class="brand"><span>WAKE</span><strong>희수 깨우기</strong></div>
        <div class="mission-copy"><span>현재 목표</span><strong>${C(c[e].hint)}</strong></div>
        <div class="time-pill ${l.remaining<=15?`urgent`:``}"><small>남은 시간</small><strong>${R(l.remaining)}</strong></div>
      </header>
      <div class="play-grid">
        <div class="room-column">
          ${A(e)}
          ${M(e)}
        </div>
        <div class="control-column">
          <div class="unlock-note"><span>ROUND ${e+1} / 3</span><strong>다음: ${c[e].next}</strong></div>
          ${P(e)}
        </div>
      </div>
    </main>
  `}function L(e){let t=e?E(l.score):T(),n=e?`You did it!`:l.failureReason===`anger`?`Too angry!`:`Too late!`,r=e?`희수가 ${90-Math.ceil(l.remaining)}초 만에 화내지 않고 일어났어요.`:l.failureReason===`anger`?`갑자기 바뀐 환경에 결국 이불을 뒤집어썼습니다.`:`알람이 끝났지만 희수는 다시 깊이 잠들었습니다.`;return`
    <main class="result-screen ${e?`success-result`:`failure-result`}">
      <section class="result-card">
        <span class="result-eyebrow">WAKE-UP REPORT</span>
        <div class="grade" aria-label="등급 ${e?`A 플러스`:`F`}">${e?`A+`:`F`}</div>
        <h1>${n}</h1>
        <p>${r}</p>
        <div class="report-grid">
          <div><small>WAKE</small><strong>${Math.floor(l.wake)}%</strong></div>
          <div><small>ANGRY</small><strong>${l.anger} / 10</strong></div>
          <div><small>TIME</small><strong>${R(l.remaining)}</strong></div>
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
  `}function R(e){let t=Math.max(0,Math.ceil(e)),n=Math.floor(t/60);return`${String(n).padStart(2,`0`)}:${String(t%60).padStart(2,`0`)}`}function z(e=!1){if(o.innerHTML=l.phase===`title`?F():l.phase===`playing`?I():L(l.phase===`success`),e){let e=o.querySelector(`h1`);e&&(e.tabIndex=-1,e.focus({preventScroll:!0}))}}function B(){U(),l={...e(),phase:`playing`},u=performance.now(),d=Math.ceil(l.remaining),f=0,p=0,x=`선택 입력`,D(392,.1),z(!0),w(`게임 시작. 소리 조절만 사용할 수 있습니다.`)}function V(){b||l.phase!==`playing`||(l.sound>=40&&l.sound<=65?l.sound=0:l.sound=52,l.actions+=1,z())}async function H(){if(l.phase===`playing`){if(b){U(),x=`마이크를 껐어요. 슬라이더를 사용하세요.`,z();return}if(!navigator.mediaDevices?.getUserMedia){x=`이 브라우저에서는 마이크를 쓸 수 없어요. 슬라이더로 플레이할 수 있습니다.`,z();return}x=`마이크 권한을 기다리는 중…`,z();try{_=await navigator.mediaDevices.getUserMedia({audio:!0}),g=new AudioContext;let e=g.createMediaStreamSource(_);v=g.createAnalyser(),v.fftSize=512,y=new Uint8Array(v.fftSize),e.connect(v),b=!0,x=`마이크 입력 중 · 실제 소리의 상대 크기를 사용합니다.`,l.actions+=1,z(),w(`마이크 입력을 시작했습니다.`)}catch{U(),x=`권한을 받지 못했어요. 소리 슬라이더로 계속 플레이할 수 있습니다.`,z(),w(`마이크를 사용할 수 없어 슬라이더 입력을 유지합니다.`)}}}function U(){_?.getTracks().forEach(e=>e.stop()),g&&g.state!==`closed`&&g.close(),g=null,_=null,v=null,y=null,b=!1}function W(){if(!b||!v||!y)return;v.getByteTimeDomainData(y);let e=0;for(let t of y){let n=(t-128)/128;e+=n*n}let t=Math.sqrt(e/y.length),n=Math.max(0,Math.min(100,20+t*330));l.sound=l.sound*.72+n*.28}function G(e){if(l.phase!==`playing`)return;let n=Number.parseFloat(e.value),r=e.dataset.control;r===`sound`&&!b&&(l.sound=n),r===`light`&&t(l.wake)>=1&&(l.light=n),r===`temperature`&&t(l.wake)>=2&&(l.temperature=n);let i=e.closest(`.control-card`)?.querySelector(`output`);if(i&&(i.textContent=r===`temperature`?`${n.toFixed(1)}°`:r===`sound`?`${Math.round(n)} dB`:`${Math.round(n)}%`),r===`light`){let e=o.querySelector(`.room`);e?.style.setProperty(`--light`,String(n)),e?.style.setProperty(`--curtain`,`${n}%`)}r===`temperature`&&o.querySelector(`.room`)?.style.setProperty(`--warmth`,String(Math.max(0,Math.min(1,(n-16)/14))))}function K(){l.phase===`playing`&&(l.actions+=1)}function q(e){let n=Math.min(.1,Math.max(0,(e-u)/1e3));if(u=e,l.phase===`playing`){W();let e=l.phase,r=t(l.wake),i=l.anger;l=a(l,n);let o=t(l.wake),s=Math.ceil(l.remaining);o===r?l.anger===i?(s!==d||o!==f||l.anger!==p)&&(d=s,f=o,p=l.anger,z()):(D(130,.13,.055),w(`화남 ${l.anger}회`),p=l.anger,z()):(O(o),w(`${c[o].label} 단계. ${c[o].hint}`),f=o,z()),e===`playing`&&l.phase!==`playing`&&(U(),k(l.phase===`success`),z(!0),w(l.phase===`success`?`성공. A 플러스.`:`실패. 다시 시도할 수 있습니다.`))}requestAnimationFrame(q)}o.addEventListener(`click`,e=>{let t=e.target.closest(`[data-action]`);if(!t)return;let n=t.dataset.action;(n===`start`||n===`restart`)&&B(),n===`toggle-sound`&&V(),n===`microphone`&&H()}),o.addEventListener(`input`,e=>{e.target instanceof HTMLInputElement&&G(e.target)}),o.addEventListener(`change`,e=>{e.target instanceof HTMLInputElement&&K()}),window.addEventListener(`keydown`,e=>{if(e.code===`Space`&&l.phase===`playing`&&!e.repeat){if(e.target.matches(`input, button`))return;e.preventDefault(),m=l.sound,l.sound=52,l.actions+=1,z()}e.code===`Space`&&l.phase===`title`&&(e.preventDefault(),B()),e.key.toLowerCase()===`r`&&(l.phase===`success`||l.phase===`failure`)&&B()}),window.addEventListener(`keyup`,e=>{e.code===`Space`&&l.phase===`playing`&&!b&&(l.sound=m,z())}),document.addEventListener(`visibilitychange`,()=>{u=performance.now()}),window.addEventListener(`beforeunload`,U),z(),requestAnimationFrame(q);