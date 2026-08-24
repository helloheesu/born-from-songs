(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),t.credentials=e.crossOrigin===`use-credentials`?`include`:e.crossOrigin===`anonymous`?`omit`:`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e=[`우리, 잠깐 말할까`,`요즘 대답이 짧아졌어`,`오늘은 혼자 있고 싶어`,`이대로 괜찮은 걸까`,`다음 약속은 미루자`],t=[`맞잡지 않은 손`,`취소된 약속`,`길어진 침묵`,`돌아선 시선`,`한 걸음의 거리`];function n(e=!0){return{phase:`title`,paused:!1,soundEnabled:e,elapsed:0,strength:8,truthRevealed:!1,revealTimer:0,stage:1,stageFlashTimer:0,playerY:0,playerVelocity:0,jumpCooldown:0,fireCooldown:0,spawnTimer:1.8,nextEntityId:1,hazards:[],shots:[],avoided:0,stumbled:0,loveSent:0,coins:0,heartsReachedPartner:0,finalAttempts:0,feedback:`앞선 사람을 따라 달릴 준비를 한다.`,feedbackKind:`info`,hitTimer:0}}function r(e){let t=e.soundEnabled;Object.assign(e,n(t),{phase:`running`,feedback:`거리는 28m. 달리면 닿을 수 있다고 생각했다.`})}function i(e){return e.phase===`final-line`?(e.finalAttempts+=1,e.feedback=`넘을 수 없다. 문장은 같은 자리에 남아 있다.`,e.feedbackKind=`blocked`,{kind:`blocked`,message:e.feedback}):e.phase!==`running`||e.paused||e.playerY>.02||e.jumpCooldown>0?null:(e.playerVelocity=1.95,e.jumpCooldown=.12,e.feedback=`낌새 하나를 보지 않기 위해 뛰어오른다.`,e.feedbackKind=`jump`,{kind:`jump`,message:e.feedback})}function a(e){return e.phase===`final-line`?(e.finalAttempts+=1,e.feedback=`사랑을 보내도 마지막 문장은 부서지지 않는다.`,e.feedbackKind=`blocked`,{kind:`blocked`,message:e.feedback}):e.phase!==`running`||e.paused||e.fireCooldown>0?null:(e.shots.push({id:e.nextEntityId++,x:.245}),e.fireCooldown=.48,e.loveSent+=1,e.feedback=`사랑을 앞으로 보낸다.`,e.feedbackKind=`fire`,{kind:`fire`,message:e.feedback})}function o(e){return e.phase===`final-line`?(e.phase=`ending`,e.paused=!1,e.feedback=`문장을 지우지 않고, 처음부터 끝까지 읽었다.`,e.feedbackKind=`accept`,{kind:`accept`,message:e.feedback}):null}function s(e,t){return t&&e>=112?`혼자 설 힘은 이미 내 안에서 차오르고 있었다.`:t?`내가 지켜 낸 것은 관계가 아니라, 계속 달릴 수 있는 나였다.`:e>=58?`사랑을 보낼수록 하트만 사라지고 거리는 그대로였다.`:e>=28?`나는 모든 낌새를 그저 장애물이라고 불렀다.`:`아직은 따라잡을 수 있을 것 같았다.`}function c(e){return e.truthRevealed?`혼자 설 힘`:e.elapsed>=42?`관계 HP?`:`우리 사이`}function l(e,t){let n={events:[],phaseChanged:!1};if(e.phase!==`running`||e.paused)return n;let r=Math.min(t,.05);e.elapsed=Math.min(135,e.elapsed+r),e.jumpCooldown=Math.max(0,e.jumpCooldown-r),e.fireCooldown=Math.max(0,e.fireCooldown-r),e.hitTimer=Math.max(0,e.hitTimer-r),e.revealTimer=Math.max(0,e.revealTimer-r),e.stageFlashTimer=Math.max(0,e.stageFlashTimer-r),e.playerVelocity-=4.8*r,e.playerY+=e.playerVelocity*r,e.playerY<=0&&(e.playerY=0,e.playerVelocity=0),e.strength=Math.min(100,e.strength+r*.16),!e.truthRevealed&&e.elapsed>=82&&(e.truthRevealed=!0,e.revealTimer=5.5,e.feedback=`게이지의 이름이 바뀐다. 쌓인 것은 혼자 설 힘이었다.`,e.feedbackKind=`reveal`,n.events.push({kind:`reveal`,message:e.feedback}));let i=Math.min(4,Math.floor(e.elapsed/(135/4))+1);i>e.stage&&(e.stage=i,e.stageFlashTimer=3.2,e.feedback=`${e.stage}층. 더 빠른 말들이 앞에서 쏟아진다.`,e.feedbackKind=`stage`,n.events.push({kind:`stage`,message:e.feedback})),e.spawnTimer-=r,e.spawnTimer<=0&&(u(e),e.spawnTimer=2.65-e.elapsed/135*.75);let a=.165+e.elapsed/135*.035;for(let t of e.hazards)t.x-=a*r;for(let t of e.shots)t.x+=.48*r;d(e,n.events),f(e,n.events),e.hazards=e.hazards.filter(e=>!e.resolved&&e.x>.04),e.shots=e.shots.filter(e=>e.x<.84);for(let t of[...e.shots])t.x>=.7949999999999999&&(e.heartsReachedPartner+=1,e.strength=Math.min(100,e.strength+.35),e.feedback=`하트는 닿았지만, 28m의 거리는 줄지 않았다.`,e.feedbackKind=`fire`,e.shots=e.shots.filter(e=>e.id!==t.id));return e.elapsed>=135&&(e.phase=`final-line`,e.hazards=[],e.shots=[],e.playerY=0,e.playerVelocity=0,e.paused=!1,e.feedback=`마지막 문장은 점프도, 사랑도 통과시키지 않는다.`,e.feedbackKind=`blocked`,n.phaseChanged=!0,n.events.push({kind:`blocked`,message:e.feedback})),n}function u(n){let r=Math.floor(n.elapsed/2.2),i=r%5==2?`coin`:r%3==1?`sign`:`word`,a=i===`word`?e:i===`sign`?t:[`기억 조각`];n.hazards.push({id:n.nextEntityId++,kind:i,label:a[r%a.length]??a[0]??``,x:.7749999999999999,resolved:!1})}function d(e,t){for(let n of e.shots){let r=e.hazards.find(e=>e.kind===`word`&&!e.resolved&&Math.abs(e.x-n.x)<.045);r&&(r.resolved=!0,n.x=1.8199999999999998,e.avoided+=1,e.strength=Math.min(100,e.strength+1.45),e.feedback=`“${r.label}”을 사랑으로 밀어냈다.`,e.feedbackKind=`clear`,t.push({kind:`clear`,message:e.feedback}))}}function f(e,t){for(let n of e.hazards){if(n.resolved||n.x>.23500000000000001)continue;if(n.kind===`coin`){n.resolved=!0,e.playerY>.28&&(e.coins+=1,e.strength=Math.min(100,e.strength+2.1),e.feedback=`공중의 기억 조각을 모았다.`,e.feedbackKind=`coin`,t.push({kind:`coin`,message:e.feedback}));continue}let r=n.kind===`sign`?e.playerY>.38:e.playerY>.62;n.resolved=!0,r?(e.avoided+=1,e.strength=Math.min(100,e.strength+1.25),e.feedback=`“${n.label}”을 보지 않고 뛰어넘었다.`,e.feedbackKind=`clear`,t.push({kind:`clear`,message:e.feedback})):(e.stumbled+=1,e.hitTimer=.38,e.strength=Math.min(100,e.strength+.55),e.feedback=`“${n.label}”에 걸렸지만 다시 달린다.`,e.feedbackKind=`stumble`,t.push({kind:`stumble`,message:e.feedback}))}}var p=document.querySelector(`#app`),m=document.querySelector(`#live-region`),h=window.matchMedia(`(prefers-reduced-motion: reduce)`),g=n(),_=0,v=performance.now(),y=null,b=null,x=!1,S=null;function C(e){return e.replaceAll(`&`,`&amp;`).replaceAll(`<`,`&lt;`).replaceAll(`>`,`&gt;`).replaceAll(`"`,`&quot;`).replaceAll(`'`,`&#039;`)}function w(){S=null,document.body.dataset.phase=g.phase,g.phase===`title`&&T(),g.phase===`running`&&E(),g.phase===`final-line`&&D(),g.phase===`ending`&&O(),M()}function T(){p.innerHTML=`
    <main class="title-screen">
      <div class="grain" aria-hidden="true"></div>
      <header class="title-header">
        <span class="game-index">INDEPENDENT GAME · 10</span>
        <button class="quiet-button" type="button" data-action="sound" aria-pressed="${g.soundEnabled}">
          ${g.soundEnabled?`효과음 켜짐`:`효과음 꺼짐`}
        </button>
      </header>
      <section class="title-copy" aria-labelledby="game-title">
        <p class="eyebrow">2–4 MINUTE ARCADE RUNNER</p>
        <h1 id="game-title">마지막<br /><em>문장</em></h1>
        <p class="title-lede">앞선 사람을 따라 달린다.<br />모든 낌새를 피하면, 거리는 줄어들까.</p>
        <button class="primary-button" type="button" data-action="start">
          달리기 시작 <span aria-hidden="true">→</span>
        </button>
        <p class="control-summary"><kbd>Space</kbd> 짧게 점프 · 길게 사랑으로 쳐내기 · 일시정지 <kbd>P</kbd></p>
      </section>
      <div class="title-road" aria-hidden="true">
        <div class="horizon-glow"></div>
        <div class="road road-title"><span></span><span></span><span></span></div>
        ${j(`runner-title`,`나`)}
        ${j(`partner-title`,`앞선 사람`)}
        <div class="distance-thread"></div>
        <span class="distance-note">28m</span>
      </div>
      <p class="originality-note">외부 이미지·음원 없음 · 모든 문구는 구현용 창작 초안</p>
    </main>`}function E(){p.innerHTML=`
    <main class="game-screen">
      ${k(`달리는 중`)}
      <section class="play-area" aria-label="앞선 연인을 따라 자동으로 달리며 이별의 낌새를 피하는 게임 화면">
        <div class="sky" aria-hidden="true"><span></span><span></span><span></span><span></span></div>
        <div class="stage" data-reduced-motion="${h.matches}">
          <div class="road"><span></span><span></span><span></span></div>
          <div class="distance-line" aria-hidden="true"></div>
          <div class="entity-layer hazards" aria-hidden="true"></div>
          <div class="entity-layer shots" aria-hidden="true"></div>
          ${j(`runner player`,`나`)}
          ${j(`partner`,`앞선 사람`)}
          <span class="runner-label player-label">나</span>
          <span class="runner-label partner-label">앞선 사람</span>
        </div>
        <aside class="narrative-card">
          <span>RUN LOG</span>
          <p>${C(s(g.elapsed,g.truthRevealed))}</p>
        </aside>
        <div class="feedback" role="status">${C(g.feedback)}</div>
        <div class="stage-rise" aria-hidden="true"><span>NEXT FLOOR</span><strong>${g.stage}층</strong></div>
      </section>
      ${A()}
      <div class="truth-overlay" aria-hidden="true"><span>이 게이지는 관계가 아니다</span><strong>혼자 설 힘</strong></div>
      <div class="pause-overlay" role="status"><strong>잠시 멈춤</strong><span><kbd>P</kbd> 또는 버튼으로 계속</span></div>
    </main>`,S={stage:q(`.stage`),runner:q(`.player`),hazards:q(`.hazards`),shots:q(`.shots`),timer:q(`[data-value="timer"]`),meterFill:q(`.meter-fill`),meterValue:q(`[data-value="meter"]`),meterLabel:q(`[data-value="meter-label"]`),narrative:q(`.narrative-card p`),feedback:q(`.feedback`),pauseButton:q(`[data-action="pause"]`),phaseChip:q(`.phase-chip`)},L()}function D(){p.innerHTML=`
    <main class="game-screen final-screen">
      ${k(`마지막 문장`)}
      <section class="final-stage" aria-labelledby="final-heading">
        <div class="final-road" aria-hidden="true"></div>
        <div class="final-runner" aria-hidden="true">${j(`runner final-person`,`나`)}</div>
        <div class="unbreakable-line">
          <span class="line-kicker">피할 수 없는 문장</span>
          <h1 id="final-heading">“나는 이제 이 관계를<br />끝내려고 해.”</h1>
          <div class="line-status"><span></span> 파괴 불가</div>
        </div>
        <p class="final-feedback" role="status">${C(g.feedback)}</p>
        <div class="final-actions">
          <button class="secondary-button" type="button" data-action="jump">뛰어넘기</button>
          <button class="secondary-button heart-action" type="button" data-action="fire">사랑 보내기</button>
          <button class="accept-button" type="button" data-action="accept">
            문장을 받아들인다 <span aria-hidden="true">→</span>
          </button>
        </div>
        <p class="final-hint">넘기거나 부수는 대신, 직접 문장을 선택해야 끝납니다. <kbd>Enter</kbd></p>
      </section>
    </main>`}function O(){let e=Math.round(g.strength);p.innerHTML=`
    <main class="ending-screen">
      <div class="ending-sky" aria-hidden="true"><i></i><i></i><i></i></div>
      <section class="ending-copy" aria-labelledby="ending-title">
        <p class="eyebrow">THE RUN ENDS · THE ROAD REMAINS</p>
        <h1 id="ending-title">길은 다시<br /><em>내 발밑으로</em></h1>
        <p class="ending-lede">문장을 받아들인 순간,<br />끝난 것은 내가 아니라 관계였다는 걸 안다.</p>
        <div class="ending-meter">
          <span>혼자 설 힘</span>
          <div><i style="width:${e}%"></i></div>
          <strong>${e}</strong>
        </div>
        <dl class="run-summary">
          <div><dt>외면한 낌새</dt><dd>${g.avoided}</dd></div>
          <div><dt>넘어지고 다시 선 횟수</dt><dd>${g.stumbled}</dd></div>
          <div><dt>보낸 사랑</dt><dd>${g.loveSent}</dd></div>
          <div><dt>모은 기억 조각</dt><dd>${g.coins}</dd></div>
          <div><dt>끝까지 줄지 않은 거리</dt><dd>28m</dd></div>
        </dl>
        <button class="primary-button light" type="button" data-action="restart">다시 달리기 ↻</button>
      </section>
      <div class="solo-road" aria-hidden="true">
        <div class="road"><span></span><span></span><span></span></div>
        ${j(`runner solo-person`,`나`)}
        <span class="solo-shadow"></span>
      </div>
    </main>`,J(`[data-action="restart"]`)}function k(e){let t=Math.max(0,135-g.elapsed);return`
    <header class="game-header">
      <button class="wordmark" type="button" data-action="restart" aria-label="처음 화면으로 돌아가기">
        <span>마지막</span><strong>문장</strong>
      </button>
      <div class="phase-chip"><i></i>${e} · ${g.stage}F/4F</div>
      <div class="distance-hud"><span>거리</span><strong>28m</strong><small>좁혀지지 않음</small></div>
      <div class="meter" aria-label="${c(g)} ${Math.round(g.strength)}퍼센트">
        <div class="meter-heading"><span data-value="meter-label">${c(g)}</span><strong data-value="meter">${Math.round(g.strength)}</strong></div>
        <div class="meter-track"><i class="meter-fill" style="width:${g.strength}%"></i></div>
      </div>
      <div class="timer"><span>LAST LINE</span><strong data-value="timer">${z(t)}</strong></div>
      <button class="icon-button" type="button" data-action="sound" aria-pressed="${g.soundEnabled}" aria-label="효과음 ${g.soundEnabled?`끄기`:`켜기`}">
        ${B(g.soundEnabled)}
      </button>
      <button class="icon-button" type="button" data-action="pause" aria-pressed="${g.paused}" aria-label="${g.paused?`계속하기`:`일시정지`}">
        ${g.paused?`▶`:`Ⅱ`}
      </button>
    </header>`}function A(){return`
    <nav class="game-controls" aria-label="게임 조작">
      <button class="hold-control" type="button" data-hold-control>
        <span class="control-icon hold-icon" aria-hidden="true">●</span>
        <strong>짧게 점프 · 길게 쳐내기</strong>
        <small>클릭·터치·Space</small>
        <i class="hold-progress" aria-hidden="true"></i>
      </button>
    </nav>`}function j(e,t){return`
    <div class="person ${e}" aria-label="${t}">
      <i class="person-head"></i>
      <i class="person-body"></i>
      <i class="person-arm arm-a"></i><i class="person-arm arm-b"></i>
      <i class="person-leg leg-a"></i><i class="person-leg leg-b"></i>
    </div>`}function M(){for(let e of p.querySelectorAll(`[data-action]`))e.addEventListener(`click`,()=>N(e.dataset.action??``));let e=p.querySelector(`[data-hold-control]`);e&&V(e),g.phase===`title`&&J(`[data-action="start"]`),g.phase===`final-line`&&J(`[data-action="accept"]`)}function N(e){if(e===`start`){r(g),G(`달리기를 시작합니다. 점프와 사랑 보내기로 낌새를 피하세요.`),K(`accept`),w();return}if(e===`restart`){g=n(g.soundEnabled),G(`처음 화면으로 돌아왔습니다.`),w();return}if(e===`jump`){F(i(g)),g.phase===`final-line`&&R();return}if(e===`fire`){F(a(g)),g.phase===`final-line`&&R();return}if(e===`accept`){let e=o(g);F(e),e&&w();return}if(e===`pause`){P();return}e===`sound`&&(g.soundEnabled=!g.soundEnabled,g.soundEnabled&&K(`accept`),w())}function P(e){g.phase===`running`&&(g.paused=e??!g.paused,g.feedback=g.paused?`달리기를 잠시 멈췄다.`:`다시 달리기 시작한다.`,g.feedbackKind=`info`,S&&L(),G(g.feedback))}function F(e){e&&(K(e.kind),(e.kind===`reveal`||e.kind===`blocked`||e.kind===`accept`)&&G(e.message))}function I(e){let t=(e-v)/1e3;v=e;let n=l(g,t);for(let e of n.events)F(e);n.phaseChanged?w():g.phase===`running`&&L(),_=requestAnimationFrame(I)}function L(){if(!S)return;let e=Math.max(0,135-g.elapsed),t=Math.round(g.strength);S.timer.textContent=z(e),S.meterFill.style.width=`${t}%`,S.meterValue.textContent=String(t),S.meterLabel.textContent=c(g),S.narrative.textContent=s(g.elapsed,g.truthRevealed),S.feedback.textContent=g.feedback,S.feedback.dataset.kind=g.feedbackKind,S.pauseButton.setAttribute(`aria-pressed`,String(g.paused)),S.pauseButton.setAttribute(`aria-label`,g.paused?`계속하기`:`일시정지`),S.pauseButton.textContent=g.paused?`▶`:`Ⅱ`,S.phaseChip.innerHTML=`<i></i>${g.paused?`잠시 멈춤`:`달리는 중`} · ${g.stage}F/4F`,S.stage.classList.toggle(`is-hit`,g.hitTimer>0),S.stage.classList.toggle(`is-paused`,g.paused),document.querySelector(`.game-screen`)?.classList.toggle(`show-truth`,g.revealTimer>0),document.querySelector(`.game-screen`)?.classList.toggle(`show-stage`,g.stageFlashTimer>0),document.querySelector(`.game-screen`)?.classList.toggle(`is-paused`,g.paused);let n=Math.min(1,g.playerY)*126;S.runner.style.transform=`translate(-50%, calc(-100% - ${n}px))`,S.hazards.innerHTML=g.hazards.map(e=>{let t=e.kind===`word`?`word-hazard`:e.kind===`sign`?`sign-hazard`:`coin-hazard`,n=e.kind===`coin`?`<i aria-hidden="true">◆</i>`:``;return`<div class="hazard ${t}" style="left:${e.x*100}%">${n}<span>${C(e.label)}</span></div>`}).join(``),S.shots.innerHTML=g.shots.map(e=>`<i class="love-shot" style="left:${e.x*100}%">♥</i>`).join(``)}function R(){let e=p.querySelector(`.final-feedback`);e&&(e.textContent=g.feedback);let t=p.querySelector(`.unbreakable-line`);t?.classList.remove(`resist`),requestAnimationFrame(()=>t?.classList.add(`resist`))}function z(e){let t=Math.ceil(e),n=Math.floor(t/60),r=t%60;return`${String(n).padStart(2,`0`)}:${String(r).padStart(2,`0`)}`}function B(e){return e?`<span aria-hidden="true">♪</span>`:`<span aria-hidden="true">♪̸</span>`}function V(e){e.addEventListener(`click`,e=>{e.detail===0&&N(`jump`)}),e.addEventListener(`pointerdown`,t=>{if(t.preventDefault(),!g.paused){try{e.setPointerCapture(t.pointerId)}catch{}H(e)}}),e.addEventListener(`pointerup`,t=>{t.preventDefault(),e.hasPointerCapture(t.pointerId)&&e.releasePointerCapture(t.pointerId),U(e)}),e.addEventListener(`pointercancel`,()=>W(e))}function H(e){g.paused||g.phase!==`running`&&g.phase!==`final-line`||b===null&&(x=!1,e?.classList.add(`is-holding`),b=window.setTimeout(()=>{x=!0,b=null,e?.classList.remove(`is-holding`),e?.classList.add(`did-hold`),N(`fire`)},360))}function U(e){b!==null&&(window.clearTimeout(b),b=null,x||N(`jump`)),e?.classList.remove(`is-holding`),window.setTimeout(()=>e?.classList.remove(`did-hold`),160),x=!1}function W(e){b!==null&&window.clearTimeout(b),b=null,x=!1,e?.classList.remove(`is-holding`,`did-hold`)}function G(e){m.textContent=``,requestAnimationFrame(()=>{m.textContent=e})}function K(e){if(g.soundEnabled)try{y??=new AudioContext;let t=y.currentTime;({jump:[246.94,329.63],fire:[392,523.25],clear:[440,659.25],coin:[659.25,783.99],stage:[220,329.63,493.88],stumble:[164.81,146.83],reveal:[261.63,329.63,440,587.33],blocked:[196,185,174],accept:[220,277.18,329.63,440]})[e].forEach((n,r)=>{let i=y.createOscillator(),a=y.createGain();i.type=e===`stumble`||e===`blocked`?`triangle`:`sine`,i.frequency.value=n;let o=t+r*.075;a.gain.setValueAtTime(1e-4,o),a.gain.exponentialRampToValueAtTime(.045,o+.018),a.gain.exponentialRampToValueAtTime(1e-4,o+.28),i.connect(a).connect(y.destination),i.start(o),i.stop(o+.3)})}catch{g.soundEnabled=!1}}function q(e){let t=p.querySelector(e);if(!t)throw Error(`Missing element: ${e}`);return t}function J(e){requestAnimationFrame(()=>p.querySelector(e)?.focus())}document.addEventListener(`keydown`,e=>{if(!(e.repeat&&![`KeyP`,`Escape`].includes(e.code))){if([`Space`,`ArrowUp`,`ArrowRight`].includes(e.code)&&e.preventDefault(),g.phase===`title`&&(e.code===`Enter`||e.code===`Space`)){N(`start`);return}if(g.phase===`final-line`&&e.code===`Enter`){N(`accept`);return}if(e.code===`KeyP`||e.code===`Escape`){P();return}if(e.code===`Space`){H(p.querySelector(`[data-hold-control]`)??void 0);return}[`ArrowUp`,`KeyW`].includes(e.code)&&N(`jump`),[`KeyJ`,`KeyK`,`KeyX`,`ArrowRight`].includes(e.code)&&N(`fire`)}}),document.addEventListener(`keyup`,e=>{e.code===`Space`&&g.phase!==`title`&&U(p.querySelector(`[data-hold-control]`)??void 0)}),document.addEventListener(`visibilitychange`,()=>{document.hidden&&g.phase===`running`&&!g.paused&&P(!0),v=performance.now()}),h.addEventListener(`change`,()=>w()),w(),cancelAnimationFrame(_),_=requestAnimationFrame(I);