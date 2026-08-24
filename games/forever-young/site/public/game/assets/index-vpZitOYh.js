(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),t.credentials=e.crossOrigin===`use-credentials`?`include`:e.crossOrigin===`anonymous`?`omit`:`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e=[{year:2005,age:20,label:`첫해`,chapter:`rookie`,zoneWidth:.14,speed:.56,note:`모든 공이 낯설었다.`},{year:2006,age:21,label:`성장`,chapter:`rise`,zoneWidth:.18,speed:.54,note:`공이 조금 더 오래 보였다.`},{year:2007,age:22,label:`도약`,chapter:`rise`,zoneWidth:.23,speed:.52,note:`내 스윙의 자리를 찾았다.`},{year:2008,age:23,label:`상승`,chapter:`rise`,zoneWidth:.29,speed:.5,note:`관중이 내 이름을 외우기 시작했다.`},{year:2009,age:24,label:`전성기`,chapter:`prime`,zoneWidth:.36,speed:.46,note:`세상이 공보다 느리게 움직였다.`},{year:2010,age:25,label:`전성기`,chapter:`prime`,zoneWidth:.4,speed:.45,note:`어떤 공이 와도 칠 수 있었다.`},{year:2011,age:26,label:`유지`,chapter:`prime`,zoneWidth:.34,speed:.48,note:`넓었던 순간은 오래 머물지 않았다.`},{year:2012,age:27,label:`하강`,chapter:`decline`,zoneWidth:.25,speed:.53,note:`한 박자 늦는 날이 늘었다.`},{year:2013,age:28,label:`노화`,chapter:`decline`,zoneWidth:.17,speed:.59,note:`가동 범위가 눈에 띄게 줄었다.`},{year:2014,age:29,label:`마지막 해`,chapter:`last`,zoneWidth:.1,speed:.65,note:`보이는 공보다 몸이 먼저 멈췄다.`}],t=[{time:`06:40`,action:`알람을 끈다`,detail:`유니폼이 없는 아침.`,tone:`morning`},{time:`08:20`,action:`같은 길을 걷는다`,detail:`누구도 이름을 부르지 않는다.`,tone:`commute`},{time:`19:10`,action:`혼자 저녁을 먹는다`,detail:`중계 소리는 끈 채로.`,tone:`evening`},{time:`23:50`,action:`불을 끈다`,detail:`내일도 같은 시간에.`,tone:`night`}],n=Array.from({length:3},(e,n)=>t.map(e=>({...e,day:n+1}))).flat(),r=[.1,.12,.15,.18,.22,.26,.31,.36],i=document.querySelector(`#app`),a=document.querySelector(`#live-region`),o=window.matchMedia(`(prefers-reduced-motion: reduce)`),s=f(),c=null,l=0,u=null,d=new Set;function f(){return{scene:`title`,soundEnabled:!0,locked:!1,announcement:`한 번의 스윙으로 한 선수의 시간을 통과합니다.`,yearIndex:0,pitchIndex:0,careerStage:`pitch`,yearRecords:e.map(()=>({contacts:0,perfects:0,misses:0})),result:null,routineIndex:0,trainingRep:0,trainingStage:`pitch`,trainingContacts:0,comebackStage:`intro`,comebackAttempts:0,endingStage:`flight`,meter:{value:.04,direction:1,running:!1,zoneWidth:e[0].zoneWidth,speed:e[0].speed,context:`career`}}}function p(){c!==null&&window.cancelAnimationFrame(c),c=null,d.forEach(e=>window.clearTimeout(e)),d.clear()}function m(e,t){let n=o.matches?Math.min(t,360):t,r=window.setTimeout(()=>{d.delete(r),e()},n);d.add(r)}function h(e,t,n,r=!0){g(),s.meter={value:.04,direction:1,running:!0,zoneWidth:t,speed:n,context:e},s.result=null,s.locked=!1,k(!1,r?`[data-action="primary"]`:void 0),l=performance.now(),c=window.requestAnimationFrame(_)}function g(){s.meter.running=!1,c!==null&&window.cancelAnimationFrame(c),c=null}function _(e){if(!s.meter.running){c=null;return}let t=Math.min((e-l)/1e3,.05);l=e;let n=s.meter.value+t*s.meter.speed*s.meter.direction;n>=1?(n=2-n,s.meter.direction=-1):n<=0&&(n=-n,s.meter.direction=1),s.meter.value=Math.max(0,Math.min(1,n)),v(),c=window.requestAnimationFrame(_)}function v(){let e=`${(s.meter.value*100).toFixed(2)}%`;document.querySelectorAll(`[data-meter-position]`).forEach(t=>{t.style.left=e})}function y(e){let t=Math.abs(s.meter.value-.5),n=s.meter.zoneWidth/2;return e===`comeback`?t<=n?{kind:`home-run`,call:`HOME RUN`,detail:`배트 중심에, 오래 기다린 한 공이 닿았다.`,distance:128}:{kind:`foul`,call:`FOUL`,detail:`끝나지 않았다. 다음 공을 기다린다.`,distance:null}:t<=n*.28?{kind:`perfect`,call:`HOME RUN`,detail:`완벽한 타이밍. 공이 담장을 넘는다.`,distance:Math.round(118+(1-t/Math.max(n,.01))*12)}:t<=n?{kind:`contact`,call:`HIT`,detail:`배트에 맞았다. 주자가 살아 나간다.`,distance:Math.round(68+(1-t/Math.max(n,.01))*32)}:{kind:`miss`,call:`STRIKE`,detail:t<n+.07?`조금 빨랐다. 공 끝이 스쳐 갔다.`:`타이밍을 놓쳤다.`,distance:null}}function b(){if(s.locked||!s.meter.running)return;let e=s.meter.context,t=y(e);g(),s.locked=!0,s.result=t,s.announcement=`${t.call}. ${t.detail}`,Z(t.kind),e===`career`?x(t):e===`training`?S(t):C(t)}function x(t){s.careerStage=`result`;let n=s.yearRecords[s.yearIndex];t.kind===`perfect`?(n.perfects+=1,n.contacts+=1):t.kind===`contact`?n.contacts+=1:n.misses+=1,k(),m(()=>{if(s.pitchIndex+1<3){s.pitchIndex+=1,s.careerStage=`pitch`;let t=e[s.yearIndex];h(`career`,t.zoneWidth,t.speed);return}s.careerStage=`recap`,s.locked=!1,s.result=null,s.announcement=`${e[s.yearIndex].year}년 시즌이 끝났습니다.`,k(!0,`[data-action="primary"]`)},920)}function S(e){s.trainingStage=`result`,(e.kind===`perfect`||e.kind===`contact`)&&(s.trainingContacts+=1),k(),m(()=>{if(s.trainingRep+1<r.length){s.trainingRep+=1,s.trainingStage=`pitch`,h(`training`,r[s.trainingRep],.58-s.trainingRep*.018);return}s.trainingStage=`recap`,s.locked=!1,s.result=null,s.announcement=`여덟 번의 훈련을 마쳤습니다. 타이밍이 다시 넓어졌습니다.`,k(!0,`[data-action="primary"]`)},820)}function C(e){if(s.comebackStage=`result`,s.comebackAttempts+=1,k(),e.kind===`home-run`){m(E,960);return}m(()=>{s.comebackStage=`pitch`,h(`comeback`,.46,.42)},820)}function ee(){if(s.yearIndex+1>=e.length){s.scene=`retirement`,s.locked=!1,s.announcement=`마지막 시즌이 끝났습니다. 선수 생활을 마칩니다.`,k(!0,`[data-action="primary"]`),Q(`down`);return}s.yearIndex+=1,s.pitchIndex=0,s.careerStage=`pitch`;let t=e[s.yearIndex];s.announcement=`${t.year}년, ${t.label}. 판정창의 폭이 달라졌습니다.`,Q(t.chapter===`prime`?`up`:t.chapter===`decline`||t.chapter===`last`?`down`:`move`),h(`career`,t.zoneWidth,t.speed)}function w(){if(!s.locked)switch(s.scene){case`title`:{s.scene=`career`,s.announcement=`첫해 첫 번째 공. 빛나는 판정창 안에서 스윙하세요.`,Q(`up`);let t=e[0];h(`career`,t.zoneWidth,t.speed);break}case`career`:s.careerStage===`recap`?ee():b();break;case`retirement`:s.scene=`routine`,s.routineIndex=0,s.announcement=`은퇴 후 첫날. 알람을 끕니다.`,Q(`down`),k(!0,`[data-action="primary"]`);break;case`routine`:T();break;case`rediscovery`:s.scene=`training`,s.trainingRep=0,s.trainingStage=`pitch`,s.announcement=`낡은 공을 집었습니다. 다시 첫 스윙을 시작합니다.`,Q(`up`),h(`training`,r[0],.58);break;case`training`:s.trainingStage===`recap`?(s.scene=`comeback`,s.comebackStage=`intro`,s.announcement=`몸 만들기를 마쳤습니다. 다시 경기장으로 갑니다.`,Q(`up`),k(!0,`[data-action="primary"]`)):b();break;case`comeback`:s.comebackStage===`intro`?(s.comebackStage=`pitch`,s.announcement=`복귀전 마지막 타석. 빛나는 순간에 스윙하세요.`,h(`comeback`,.46,.42)):b();break;case`ending`:s.endingStage===`complete`&&D()}}function T(){if(s.routineIndex+1<n.length){s.routineIndex+=1;let e=n[s.routineIndex];s.announcement=`${e.day}일차 ${e.time}, ${e.action}.`,te(e.tone===`night`),k(!1,`[data-action="primary"]`);return}s.scene=`rediscovery`,s.announcement=`현관 아래 오래된 상자에서 야구공과 글러브를 발견했습니다.`,Q(`memory`),k(!0,`[data-action="primary"]`)}function E(){p(),s.scene=`ending`,s.endingStage=`flight`,s.locked=!0,s.announcement=`공이 담장을 향해 날아갑니다.`,Q(`crack`),k(!0),m(()=>{s.endingStage=`cheer`,s.announcement=`홈런. 관중의 환호가 경기장을 채웁니다.`,ne(),k(),m(()=>{s.endingStage=`complete`,s.locked=!1,s.announcement=`마지막 홈런. 끝나지 않은 타석의 완결입니다.`,k(!1,`[data-action="primary"]`)},1500)},1050)}function D(){let e=s.soundEnabled;p(),s=f(),s.soundEnabled=e,k(!0,`[data-action="primary"]`)}function O(){s.soundEnabled=!s.soundEnabled,s.soundEnabled&&Q(`move`),s.announcement=`효과음을 ${s.soundEnabled?`켰습니다`:`껐습니다`}.`,k(!1,`[data-action="sound"]`),s.meter.running&&v()}function k(e=!1,t){document.documentElement.dataset.scene=s.scene,i.innerHTML=`
    <div class="game-shell" data-scene="${s.scene}" data-ending-stage="${s.endingStage}">
      ${j()}
      ${A()}
    </div>`,v(),Y(s.announcement),window.requestAnimationFrame(()=>{if(e){let e=document.querySelector(`#scene-title`);e?.setAttribute(`tabindex`,`-1`),e?.focus({preventScroll:!0});return}t&&document.querySelector(t)?.focus({preventScroll:!0})})}function A(){switch(s.scene){case`title`:return N();case`career`:return P();case`retirement`:return V();case`routine`:return H();case`rediscovery`:return U();case`training`:return W();case`comeback`:return G();case`ending`:return K()}}function j(){if(s.scene===`title`)return``;let e=M();return`
    <header class="game-header">
      <button class="wordmark" type="button" data-action="restart" aria-label="처음부터 다시 시작">
        <span class="baseball-mark" aria-hidden="true"><i></i></span>
        <span>GO AHEAD</span>
      </button>
      <div class="chapter-label"><span>${e.number}</span>${e.label}</div>
      <button class="sound-button" type="button" data-action="sound" aria-pressed="${s.soundEnabled}">
        <span aria-hidden="true">${s.soundEnabled?`◖))`:`◖×`}</span>
        <span>${s.soundEnabled?`효과음 켬`:`효과음 끔`}</span>
      </button>
    </header>`}function M(){return s.scene===`career`?{number:`01`,label:`선수 생활`}:s.scene===`retirement`||s.scene===`routine`?{number:`02`,label:`은퇴 후`}:s.scene===`rediscovery`||s.scene===`training`?{number:`03`,label:`다시 몸을 만들다`}:{number:`04`,label:`마지막 타석`}}function N(){return`
    <main class="title-scene" aria-labelledby="scene-title">
      <div class="title-lines" aria-hidden="true"></div>
      <section class="title-copy">
        <p class="eyebrow">A ONE-BUTTON BASEBALL STORY</p>
        <h1 id="scene-title"><span>GO</span> AHEAD</h1>
        <p class="title-kicker">끝나지 않은 타석</p>
        <p class="title-lede">넓어졌다가 좁아지는 단 한 번의 타이밍.<br />전성기와 은퇴를 지나, 마지막 공을 친다.</p>
        ${q(`첫 타석에 선다`,`SPACE · 클릭 · 터치`)}
      </section>
      <div class="title-stadium" aria-hidden="true">
        <div class="stadium-ring ring-one"></div>
        <div class="stadium-ring ring-two"></div>
        <div class="stadium-field"><span></span><i></i></div>
        <div class="title-ball"><i></i></div>
        <div class="title-bat"></div>
      </div>
      <p class="title-note">3–5분 · 한 가지 조작 · 외부 에셋 없음</p>
    </main>`}function P(){let t=e[s.yearIndex],n=s.yearRecords[s.yearIndex],r=s.careerStage===`recap`?3:s.pitchIndex+1,i=n.contacts/Math.max(r,1);return s.careerStage===`recap`?`
      <main class="recap-scene career-recap" aria-labelledby="scene-title">
        <section class="recap-card">
          <p class="eyebrow">SEASON ${String(s.yearIndex+1).padStart(2,`0`)} / ${e.length}</p>
          <p class="recap-year">${t.year}</p>
          <h1 id="scene-title">${t.note}</h1>
          <div class="recap-stats">
            <div><span>시즌 타율</span><strong>${J(i)}</strong></div>
            <div><span>홈런</span><strong>${n.perfects}</strong></div>
            <div><span>판정 범위</span><strong>${Math.round(t.zoneWidth*100)}%</strong></div>
          </div>
          ${B(t)}
          ${q(s.yearIndex+1===e.length?`마지막 시즌을 마친다`:`다음 해로`,`SPACE`)}
        </section>
      </main>`:`
    <main class="play-scene career-play ${t.chapter}" aria-labelledby="scene-title">
      ${F(t)}
      <section class="play-column">
        <div class="play-heading">
          <div>
            <p class="eyebrow">${t.year} · ${t.age}세 · ${t.label}</p>
            <h1 id="scene-title">${t.note}</h1>
          </div>
          <p>판정창 <strong>${Math.round(t.zoneWidth*100)}%</strong></p>
        </div>
        ${L()}
        ${R(`빛나는 판정창 안에서 스윙`,`${s.pitchIndex+1} / 3 PITCH`)}
        ${z()}
        ${B(t)}
      </section>
    </main>`}function F(e){let t=I();return`
    <aside class="scoreboard" aria-label="선수 기록">
      <div class="scoreboard-year"><span>YEAR</span><strong>${e.year}</strong></div>
      <dl>
        <div><dt>AGE</dt><dd>${e.age}</dd></div>
        <div><dt>AVG</dt><dd>${J(t.contacts/Math.max(t.attempts,1))}</dd></div>
        <div><dt>HR</dt><dd>${t.perfects}</dd></div>
      </dl>
      <div class="pitch-count" aria-label="이 해의 투구 수">
        ${Array.from({length:3},(e,t)=>`<span class="${t<s.pitchIndex||s.careerStage===`result`&&t===s.pitchIndex?`done`:t===s.pitchIndex?`current`:``}"></span>`).join(``)}
      </div>
      <div class="mini-score">
        <div><strong>피닉스</strong><span>${Math.min(9,2+s.yearIndex)}</span></div>
        <div><strong>ONE</strong><span>${Math.min(9,3+Math.floor(s.yearIndex/2))}</span></div>
        <p><i></i><i class="on"></i><i></i><b>${Math.min(2,s.pitchIndex)} OUT</b></p>
      </div>
      <p>한 이닝이<br />한 해가 된다.</p>
    </aside>`}function I(){return s.yearRecords.reduce((e,t)=>({contacts:e.contacts+t.contacts,perfects:e.perfects+t.perfects,attempts:e.attempts+t.contacts+t.misses}),{contacts:0,perfects:0,attempts:0})}function L(e=``){return`
    <div class="stadium ${e} ${s.result?`result-${s.result.kind}`:``}" aria-hidden="true">
      <div class="stadium-sky"><span class="light left"></span><span class="light right"></span></div>
      <div class="crowd-bands"><span></span><span></span><span></span></div>
      <div class="field-lines"><span class="base base-one"></span><span class="base base-two"></span><span class="base base-three"></span></div>
      <div class="pitcher"><span></span><i></i></div>
      <div class="abs-zone"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>
      <div class="batter"><span class="head"></span><span class="body"></span><span class="leg front"></span><span class="leg back"></span><span class="bat"></span></div>
      <div class="pitch-ball" data-meter-position><i></i></div>
      <div class="hit-flash"></div>
    </div>`}function R(e,t){return`
    <button class="swing-panel" type="button" data-action="primary" ${s.locked||!s.meter.running?`disabled`:``} aria-label="${e}. 현재 타이밍에 스윙">
      <div class="swing-meta"><span>${t}</span><strong>${e}</strong><span>SPACE / TAP</span></div>
      <div class="timing-track">
        <span class="timing-window" style="width: ${s.meter.zoneWidth*100}%"></span>
        <span class="home-run-window" style="width: ${s.meter.zoneWidth*28}%"></span>
        <span class="timing-center"></span>
        <span class="timing-needle" data-meter-position><i></i></span>
      </div>
      <div class="timing-legend"><span><i class="hit-zone"></i>안타 존</span><span><i class="homer-zone"></i>홈런 존</span></div>
    </button>`}function z(){return s.result?`
    <div class="hit-result ${s.result.kind}" role="status">
      <strong>${s.result.call}</strong>
      <span>${s.result.detail}</span>
      ${s.result.distance?`<em>${s.result.distance} M</em>`:``}
    </div>`:`<div class="result-space" aria-hidden="true"></div>`}function B(t){return`
    <div class="career-curve" aria-label="해마다 변하는 타격 판정 범위">
      <div class="curve-label"><span>판정 범위의 변화</span><strong>${t.chapter===`prime`?`전성기`:t.chapter===`decline`||t.chapter===`last`?`좁아지는 중`:`넓어지는 중`}</strong></div>
      <div class="curve-bars">
        ${e.map((e,t)=>`
              <span class="${t===s.yearIndex?`current`:``} ${t<s.yearIndex?`past`:``}" style="--bar-height: ${Math.round(e.zoneWidth*190)}px">
                <i></i><small>${String(e.year).slice(2)}</small>
              </span>`).join(``)}
      </div>
    </div>`}function V(){let t=I();return`
    <main class="retirement-scene" aria-labelledby="scene-title">
      <div class="locker" aria-hidden="true">
        <div class="locker-door"><span>29</span></div>
        <div class="hanging-uniform"><i>29</i></div>
        <div class="empty-bench"></div>
      </div>
      <section class="retirement-copy">
        <p class="eyebrow">2014 · LAST SEASON</p>
        <h1 id="scene-title">몸이 먼저<br />멈춰 버렸다.</h1>
        <p>판정창은 가장 좁아졌고,<br />익숙했던 타이밍은 손끝에서 비켜 갔다.</p>
        <dl class="career-total">
          <div><dt>함께한 해</dt><dd>${e.length}</dd></div>
          <div><dt>마주한 공</dt><dd>${t.attempts}</dd></div>
          <div><dt>기억할 홈런</dt><dd>${t.perfects}</dd></div>
        </dl>
        ${q(`유니폼을 벗는다`,`SPACE`)}
      </section>
    </main>`}function H(){let e=n[s.routineIndex],t=Math.floor(s.routineIndex/4);return`
    <main class="routine-scene tone-${e.tone}" aria-labelledby="scene-title">
      <section class="routine-clock">
        <p class="routine-day">DAY ${String(e.day).padStart(2,`0`)}</p>
        <h1 id="scene-title">${e.time}</h1>
        <div class="clock-line"><span style="width: ${(s.routineIndex%4+1)*25}%"></span></div>
        <p class="routine-action">${e.action}</p>
        <p class="routine-detail">${e.detail}</p>
        ${q(e.action,`${s.routineIndex+1} / ${n.length}`)}
      </section>
      <aside class="routine-days" aria-label="반복된 날">
        ${Array.from({length:3},(e,n)=>`<span class="${n<t?`past`:n===t?`current`:``}">DAY ${String(n+1).padStart(2,`0`)}</span>`).join(``)}
      </aside>
      <div class="routine-room" aria-hidden="true">
        <div class="room-window"><span></span></div>
        <div class="room-table"><span></span></div>
        <div class="closed-box"></div>
        <div class="routine-shadow"></div>
      </div>
    </main>`}function U(){return`
    <main class="rediscovery-scene" aria-labelledby="scene-title">
      <section class="gear-box" aria-label="오래된 야구공과 글러브">
        <div class="dust dust-one" aria-hidden="true"></div>
        <div class="dust dust-two" aria-hidden="true"></div>
        <div class="old-ball" aria-hidden="true"><i></i><b></b></div>
        <div class="old-glove" aria-hidden="true"><i></i><b></b><span></span></div>
      </section>
      <section class="rediscovery-copy">
        <p class="eyebrow">AN OLD BOX · BY THE DOOR</p>
        <h1 id="scene-title">공은 그대로<br />손바닥만 했다.</h1>
        <p>굳은 글러브 사이로 오래된 흙 냄새가 났다.<br />몸보다 먼저, 손이 공을 기억했다.</p>
        ${q(`공을 집는다`,`다시 한 번`)}
      </section>
    </main>`}function W(){let e=r[s.trainingRep];return s.trainingStage===`recap`?`
      <main class="recap-scene training-recap" aria-labelledby="scene-title">
        <section class="recap-card">
          <p class="eyebrow">TRAINING COMPLETE</p>
          <p class="training-number">${s.trainingContacts}<span> / ${r.length}</span></p>
          <h1 id="scene-title">타이밍은 사라진 게 아니라<br />작아져 있었을 뿐이다.</h1>
          <div class="training-growth" aria-label="훈련하며 넓어진 판정 범위">
            ${r.map(e=>`<i style="width: ${e*100}%"></i>`).join(``)}
          </div>
          ${q(`테스트를 받으러 간다`,`마지막 타석으로`)}
        </section>
      </main>`:`
    <main class="training-scene" aria-labelledby="scene-title">
      <section class="training-heading">
        <p class="eyebrow">BACK TO TRAINING · ${s.trainingRep+1} / ${r.length}</p>
        <h1 id="scene-title">몸보다 천천히,<br />타이밍을 다시 넓힌다.</h1>
        <p>판정 범위 ${Math.round(e*100)}%</p>
      </section>
      <section class="training-ground">
        ${L(`empty-ground`)}
        ${R(`연습공을 스윙`,`REP ${String(s.trainingRep+1).padStart(2,`0`)}`)}
        ${z()}
      </section>
      <aside class="training-log" aria-label="훈련 진행">
        ${r.map((e,t)=>`<span class="${t<s.trainingRep||s.trainingStage===`result`&&t===s.trainingRep?`done`:t===s.trainingRep?`current`:``}"><i style="width:${e*100}%"></i><small>${t+1}</small></span>`).join(``)}
      </aside>
    </main>`}function G(){return s.comebackStage===`intro`?`
      <main class="comeback-intro" aria-labelledby="scene-title">
        <div class="tunnel" aria-hidden="true"><span></span><i></i></div>
        <section>
          <p class="eyebrow">ONE MORE AT-BAT</p>
          <h1 id="scene-title">다시,<br />이름이 불렸다.</h1>
          <p>마지막 타석. 스트라이크는 없다.<br />담장을 넘길 때까지 다음 공이 온다.</p>
          ${q(`다시 타석에 선다`,`SPACE`)}
        </section>
      </main>`:`
    <main class="play-scene comeback-play" aria-labelledby="scene-title">
      <section class="play-column">
        <div class="play-heading centered">
          <div>
            <p class="eyebrow">COMEBACK · FINAL AT-BAT</p>
            <h1 id="scene-title">마지막 공을 기다린다.</h1>
          </div>
          <p>시도 <strong>${s.comebackAttempts+1}</strong></p>
        </div>
        ${L(`night-game`)}
        ${R(`빛나는 순간에 마지막 스윙`,`FINAL PITCH`)}
        ${z()}
        <p class="comeback-note">파울은 끝이 아니다. 홈런이 될 때까지 다시 온다.</p>
      </section>
    </main>`}function K(){let e=s.endingStage===`cheer`||s.endingStage===`complete`;return`
    <main class="ending-scene ${s.endingStage}" aria-labelledby="scene-title">
      <div class="ending-sky" aria-hidden="true">
        <div class="home-run-ball"></div>
        <div class="arc-line"></div>
        <div class="ending-lights"><span></span><span></span><span></span><span></span></div>
      </div>
      <div class="ending-crowd ${e?`alive`:``}" aria-hidden="true">
        ${Array.from({length:42},(e,t)=>`<i style="--i:${t};--x:${t*37%100}%"></i>`).join(``)}
      </div>
      <section class="ending-copy">
        <p class="eyebrow">${s.endingStage===`flight`?`THE BALL IS STILL FLYING`:`HOME RUN · 128 M`}</p>
        <h1 id="scene-title">${s.endingStage===`flight`?`끝나지 않았다.`:`다시, 가장 멀리.`}</h1>
        <p class="cheer-line">${e?`와아아아—!`:`······`}</p>
        <p class="ending-line">전성기는 지나갔다.<br />그러나 스윙은 여기까지 돌아왔다.</p>
        ${s.endingStage===`complete`?q(`처음부터 다시 친다`,`REPLAY`):`<div class="ending-wait">공을 따라가는 중</div>`}
      </section>
    </main>`}function q(e,t){return`
    <button class="primary-button" type="button" data-action="primary">
      <span>${e}</span><small>${t}</small><i aria-hidden="true">→</i>
    </button>`}function J(e){return e.toFixed(3).replace(/^0/,``)}function Y(e){a.textContent=``,window.requestAnimationFrame(()=>{a.textContent=e})}function X(){if(!s.soundEnabled)return null;try{return u??=new AudioContext,u.state===`suspended`&&u.resume(),u}catch{return s.soundEnabled=!1,null}}function Z(e){let t=X();if(!t)return;let n=t.currentTime;e===`perfect`||e===`home-run`?($(t,108,n,.11,`square`,.13),$(t,216,n+.025,.18,`triangle`,.08)):e===`contact`?$(t,135,n,.12,`square`,.09):e===`foul`?$(t,160,n,.09,`triangle`,.06):$(t,72,n,.16,`sine`,.05)}function Q(e){let t=X();if(!t)return;let n=t.currentTime;(e===`up`?[196,246.94,329.63]:e===`down`?[220,174.61,130.81]:e===`memory`?[146.83,220,293.66]:e===`crack`?[92,184,368]:[196]).forEach((r,i)=>$(t,r,n+i*.075,.22,e===`crack`?`square`:`sine`,e===`crack`?.09:.045))}function te(e){let t=X();t&&$(t,e?92:124,t.currentTime,.11,`triangle`,.025)}function $(e,t,n,r,i,a){let o=e.createOscillator(),s=e.createGain();o.type=i,o.frequency.value=t,s.gain.setValueAtTime(1e-4,n),s.gain.exponentialRampToValueAtTime(a,n+.012),s.gain.exponentialRampToValueAtTime(1e-4,n+r),o.connect(s).connect(e.destination),o.start(n),o.stop(n+r+.02)}function ne(){let e=X();if(!e)return;let t=e.currentTime,n=e.createBuffer(1,Math.floor(e.sampleRate*1.4),e.sampleRate),r=n.getChannelData(0);for(let t=0;t<r.length;t+=1){let n=Math.min(t/(e.sampleRate*.18),1)*(1-t/r.length)**.35;r[t]=(Math.random()*2-1)*n}let i=e.createBufferSource(),a=e.createBiquadFilter(),o=e.createGain();i.buffer=n,a.type=`bandpass`,a.frequency.value=860,a.Q.value=.55,o.gain.value=.13,i.connect(a).connect(o).connect(e.destination),i.start(t),[261.63,329.63,392,523.25].forEach((n,r)=>$(e,n,t+r*.06,.7,`sine`,.035))}i.addEventListener(`click`,e=>{let t=e.target.closest(`[data-action]`);if(!t)return;let n=t.dataset.action;n===`primary`?w():n===`restart`?D():n===`sound`&&O()}),window.addEventListener(`keydown`,e=>{if(e.code!==`Space`||e.repeat||e.metaKey||e.ctrlKey||e.altKey)return;let t=e.target.closest(`[data-action]`)?.dataset.action;t&&t!==`primary`||(e.preventDefault(),w())}),o.addEventListener(`change`,()=>{k(),s.meter.running&&v()}),k();