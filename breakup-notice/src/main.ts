import './style.css'
import {
  PARTNER_DISTANCE_METERS,
  RUN_SECONDS,
  acceptFinalLine,
  createInitialState,
  fireLove,
  jump,
  meterLabel,
  narrativeFor,
  startRun,
  stepModel,
  type EventKind,
  type GameState,
  type ModelEvent,
} from './game.ts'

const app = document.querySelector<HTMLDivElement>('#app')!
const liveRegion = document.querySelector<HTMLDivElement>('#live-region')!
const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')

let state: GameState = createInitialState()
let animationFrame = 0
let lastTimestamp = performance.now()
let audioContext: AudioContext | null = null
let holdTimer: number | null = null
let holdTriggered = false

interface PlayDom {
  stage: HTMLElement
  runner: HTMLElement
  hazards: HTMLElement
  shots: HTMLElement
  timer: HTMLElement
  meterFill: HTMLElement
  meterValue: HTMLElement
  meterLabel: HTMLElement
  narrative: HTMLElement
  feedback: HTMLElement
  pauseButton: HTMLButtonElement
  phaseChip: HTMLElement
}

let playDom: PlayDom | null = null

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function render(): void {
  playDom = null
  document.body.dataset.phase = state.phase

  if (state.phase === 'title') renderTitle()
  if (state.phase === 'running') renderRunning()
  if (state.phase === 'final-line') renderFinalLine()
  if (state.phase === 'ending') renderEnding()

  bindActions()
}

function renderTitle(): void {
  app.innerHTML = `
    <main class="title-screen">
      <div class="grain" aria-hidden="true"></div>
      <header class="title-header">
        <span class="game-index">INDEPENDENT GAME · 10</span>
        <button class="quiet-button" type="button" data-action="sound" aria-pressed="${state.soundEnabled}">
          ${state.soundEnabled ? '효과음 켜짐' : '효과음 꺼짐'}
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
        ${personMarkup('runner-title', '나')}
        ${personMarkup('partner-title', '앞선 사람')}
        <div class="distance-thread"></div>
        <span class="distance-note">28m</span>
      </div>
      <p class="originality-note">외부 이미지·음원 없음 · 모든 문구는 구현용 창작 초안</p>
    </main>`
}

function renderRunning(): void {
  app.innerHTML = `
    <main class="game-screen">
      ${gameHeaderMarkup('달리는 중')}
      <section class="play-area" aria-label="앞선 연인을 따라 자동으로 달리며 이별의 낌새를 피하는 게임 화면">
        <div class="sky" aria-hidden="true"><span></span><span></span><span></span><span></span></div>
        <div class="stage" data-reduced-motion="${reducedMotionQuery.matches}">
          <div class="road"><span></span><span></span><span></span></div>
          <div class="distance-line" aria-hidden="true"></div>
          <div class="entity-layer hazards" aria-hidden="true"></div>
          <div class="entity-layer shots" aria-hidden="true"></div>
          ${personMarkup('runner player', '나')}
          ${personMarkup('partner', '앞선 사람')}
          <span class="runner-label player-label">나</span>
          <span class="runner-label partner-label">앞선 사람</span>
        </div>
        <aside class="narrative-card">
          <span>RUN LOG</span>
          <p>${escapeHtml(narrativeFor(state.elapsed, state.truthRevealed))}</p>
        </aside>
        <div class="feedback" role="status">${escapeHtml(state.feedback)}</div>
        <div class="stage-rise" aria-hidden="true"><span>NEXT FLOOR</span><strong>${state.stage}층</strong></div>
      </section>
      ${controlsMarkup()}
      <div class="truth-overlay" aria-hidden="true"><span>이 게이지는 관계가 아니다</span><strong>혼자 설 힘</strong></div>
      <div class="pause-overlay" role="status"><strong>잠시 멈춤</strong><span><kbd>P</kbd> 또는 버튼으로 계속</span></div>
    </main>`

  playDom = {
    stage: requiredElement('.stage'),
    runner: requiredElement('.player'),
    hazards: requiredElement('.hazards'),
    shots: requiredElement('.shots'),
    timer: requiredElement('[data-value="timer"]'),
    meterFill: requiredElement('.meter-fill'),
    meterValue: requiredElement('[data-value="meter"]'),
    meterLabel: requiredElement('[data-value="meter-label"]'),
    narrative: requiredElement('.narrative-card p'),
    feedback: requiredElement('.feedback'),
    pauseButton: requiredElement<HTMLButtonElement>('[data-action="pause"]'),
    phaseChip: requiredElement('.phase-chip'),
  }
  updatePlayDom()
}

function renderFinalLine(): void {
  app.innerHTML = `
    <main class="game-screen final-screen">
      ${gameHeaderMarkup('마지막 문장')}
      <section class="final-stage" aria-labelledby="final-heading">
        <div class="final-road" aria-hidden="true"></div>
        <div class="final-runner" aria-hidden="true">${personMarkup('runner final-person', '나')}</div>
        <div class="unbreakable-line">
          <span class="line-kicker">피할 수 없는 문장</span>
          <h1 id="final-heading">“나는 이제 이 관계를<br />끝내려고 해.”</h1>
          <div class="line-status"><span></span> 파괴 불가</div>
        </div>
        <p class="final-feedback" role="status">${escapeHtml(state.feedback)}</p>
        <div class="final-actions">
          <button class="secondary-button" type="button" data-action="jump">뛰어넘기</button>
          <button class="secondary-button heart-action" type="button" data-action="fire">사랑 보내기</button>
          <button class="accept-button" type="button" data-action="accept">
            문장을 받아들인다 <span aria-hidden="true">→</span>
          </button>
        </div>
        <p class="final-hint">넘기거나 부수는 대신, 직접 문장을 선택해야 끝납니다. <kbd>Enter</kbd></p>
      </section>
    </main>`
}

function renderEnding(): void {
  const meterText = Math.round(state.strength)
  app.innerHTML = `
    <main class="ending-screen">
      <div class="ending-sky" aria-hidden="true"><i></i><i></i><i></i></div>
      <section class="ending-copy" aria-labelledby="ending-title">
        <p class="eyebrow">THE RUN ENDS · THE ROAD REMAINS</p>
        <h1 id="ending-title">길은 다시<br /><em>내 발밑으로</em></h1>
        <p class="ending-lede">문장을 받아들인 순간,<br />끝난 것은 내가 아니라 관계였다는 걸 안다.</p>
        <div class="ending-meter">
          <span>혼자 설 힘</span>
          <div><i style="width:${meterText}%"></i></div>
          <strong>${meterText}</strong>
        </div>
        <dl class="run-summary">
          <div><dt>외면한 낌새</dt><dd>${state.avoided}</dd></div>
          <div><dt>넘어지고 다시 선 횟수</dt><dd>${state.stumbled}</dd></div>
          <div><dt>보낸 사랑</dt><dd>${state.loveSent}</dd></div>
          <div><dt>모은 기억 조각</dt><dd>${state.coins}</dd></div>
          <div><dt>끝까지 줄지 않은 거리</dt><dd>${PARTNER_DISTANCE_METERS}m</dd></div>
        </dl>
        <button class="primary-button light" type="button" data-action="restart">다시 달리기 ↻</button>
      </section>
      <div class="solo-road" aria-hidden="true">
        <div class="road"><span></span><span></span><span></span></div>
        ${personMarkup('runner solo-person', '나')}
        <span class="solo-shadow"></span>
      </div>
    </main>`
  queueFocus('[data-action="restart"]')
}

function gameHeaderMarkup(phaseLabel: string): string {
  const remaining = Math.max(0, RUN_SECONDS - state.elapsed)
  return `
    <header class="game-header">
      <button class="wordmark" type="button" data-action="restart" aria-label="처음 화면으로 돌아가기">
        <span>마지막</span><strong>문장</strong>
      </button>
      <div class="phase-chip"><i></i>${phaseLabel} · ${state.stage}F/4F</div>
      <div class="distance-hud"><span>거리</span><strong>${PARTNER_DISTANCE_METERS}m</strong><small>좁혀지지 않음</small></div>
      <div class="meter" aria-label="${meterLabel(state)} ${Math.round(state.strength)}퍼센트">
        <div class="meter-heading"><span data-value="meter-label">${meterLabel(state)}</span><strong data-value="meter">${Math.round(state.strength)}</strong></div>
        <div class="meter-track"><i class="meter-fill" style="width:${state.strength}%"></i></div>
      </div>
      <div class="timer"><span>LAST LINE</span><strong data-value="timer">${formatTime(remaining)}</strong></div>
      <button class="icon-button" type="button" data-action="sound" aria-pressed="${state.soundEnabled}" aria-label="효과음 ${state.soundEnabled ? '끄기' : '켜기'}">
        ${soundIcon(state.soundEnabled)}
      </button>
      <button class="icon-button" type="button" data-action="pause" aria-pressed="${state.paused}" aria-label="${state.paused ? '계속하기' : '일시정지'}">
        ${state.paused ? '▶' : 'Ⅱ'}
      </button>
    </header>`
}

function controlsMarkup(): string {
  return `
    <nav class="game-controls" aria-label="게임 조작">
      <button class="hold-control" type="button" data-hold-control>
        <span class="control-icon hold-icon" aria-hidden="true">●</span>
        <strong>짧게 점프 · 길게 쳐내기</strong>
        <small>클릭·터치·Space</small>
        <i class="hold-progress" aria-hidden="true"></i>
      </button>
    </nav>`
}

function personMarkup(className: string, label: string): string {
  return `
    <div class="person ${className}" aria-label="${label}">
      <i class="person-head"></i>
      <i class="person-body"></i>
      <i class="person-arm arm-a"></i><i class="person-arm arm-b"></i>
      <i class="person-leg leg-a"></i><i class="person-leg leg-b"></i>
    </div>`
}

function bindActions(): void {
  for (const button of app.querySelectorAll<HTMLButtonElement>('[data-action]')) {
    button.addEventListener('click', () => handleAction(button.dataset.action ?? ''))
  }
  const holdControl = app.querySelector<HTMLButtonElement>('[data-hold-control]')
  if (holdControl) bindHoldControl(holdControl)
  if (state.phase === 'title') queueFocus('[data-action="start"]')
  if (state.phase === 'final-line') queueFocus('[data-action="accept"]')
}

function handleAction(action: string): void {
  if (action === 'start') {
    startRun(state)
    announce('달리기를 시작합니다. 점프와 사랑 보내기로 낌새를 피하세요.')
    playTone('accept')
    render()
    return
  }

  if (action === 'restart') {
    state = createInitialState(state.soundEnabled)
    announce('처음 화면으로 돌아왔습니다.')
    render()
    return
  }

  if (action === 'jump') {
    handleModelEvent(jump(state))
    if (state.phase === 'final-line') updateFinalFeedback()
    return
  }

  if (action === 'fire') {
    handleModelEvent(fireLove(state))
    if (state.phase === 'final-line') updateFinalFeedback()
    return
  }

  if (action === 'accept') {
    const event = acceptFinalLine(state)
    handleModelEvent(event)
    if (event) render()
    return
  }

  if (action === 'pause') {
    togglePause()
    return
  }

  if (action === 'sound') {
    state.soundEnabled = !state.soundEnabled
    if (state.soundEnabled) playTone('accept')
    render()
  }
}

function togglePause(force?: boolean): void {
  if (state.phase !== 'running') return
  state.paused = force ?? !state.paused
  state.feedback = state.paused ? '달리기를 잠시 멈췄다.' : '다시 달리기 시작한다.'
  state.feedbackKind = 'info'
  if (playDom) updatePlayDom()
  announce(state.feedback)
}

function handleModelEvent(event: ModelEvent | null): void {
  if (!event) return
  playTone(event.kind)
  if (event.kind === 'reveal' || event.kind === 'blocked' || event.kind === 'accept') announce(event.message)
}

function frame(timestamp: number): void {
  const delta = (timestamp - lastTimestamp) / 1000
  lastTimestamp = timestamp

  const result = stepModel(state, delta)
  for (const event of result.events) handleModelEvent(event)

  if (result.phaseChanged) render()
  else if (state.phase === 'running') updatePlayDom()

  animationFrame = requestAnimationFrame(frame)
}

function updatePlayDom(): void {
  if (!playDom) return

  const remaining = Math.max(0, RUN_SECONDS - state.elapsed)
  const strength = Math.round(state.strength)
  playDom.timer.textContent = formatTime(remaining)
  playDom.meterFill.style.width = `${strength}%`
  playDom.meterValue.textContent = String(strength)
  playDom.meterLabel.textContent = meterLabel(state)
  playDom.narrative.textContent = narrativeFor(state.elapsed, state.truthRevealed)
  playDom.feedback.textContent = state.feedback
  playDom.feedback.dataset.kind = state.feedbackKind
  playDom.pauseButton.setAttribute('aria-pressed', String(state.paused))
  playDom.pauseButton.setAttribute('aria-label', state.paused ? '계속하기' : '일시정지')
  playDom.pauseButton.textContent = state.paused ? '▶' : 'Ⅱ'
  playDom.phaseChip.innerHTML = `<i></i>${state.paused ? '잠시 멈춤' : '달리는 중'} · ${state.stage}F/4F`
  playDom.stage.classList.toggle('is-hit', state.hitTimer > 0)
  playDom.stage.classList.toggle('is-paused', state.paused)
  document.querySelector('.game-screen')?.classList.toggle('show-truth', state.revealTimer > 0)
  document.querySelector('.game-screen')?.classList.toggle('show-stage', state.stageFlashTimer > 0)
  document.querySelector('.game-screen')?.classList.toggle('is-paused', state.paused)

  const jumpPixels = Math.min(1, state.playerY) * 126
  playDom.runner.style.transform = `translate(-50%, calc(-100% - ${jumpPixels}px))`

  playDom.hazards.innerHTML = state.hazards
    .map((hazard) => {
      const yClass = hazard.kind === 'word' ? 'word-hazard' : hazard.kind === 'sign' ? 'sign-hazard' : 'coin-hazard'
      const coinMark = hazard.kind === 'coin' ? '<i aria-hidden="true">◆</i>' : ''
      return `<div class="hazard ${yClass}" style="left:${hazard.x * 100}%">${coinMark}<span>${escapeHtml(hazard.label)}</span></div>`
    })
    .join('')

  playDom.shots.innerHTML = state.shots
    .map((shot) => `<i class="love-shot" style="left:${shot.x * 100}%">♥</i>`)
    .join('')
}

function updateFinalFeedback(): void {
  const feedback = app.querySelector<HTMLElement>('.final-feedback')
  if (feedback) feedback.textContent = state.feedback
  const line = app.querySelector<HTMLElement>('.unbreakable-line')
  line?.classList.remove('resist')
  requestAnimationFrame(() => line?.classList.add('resist'))
}

function formatTime(seconds: number): string {
  const whole = Math.ceil(seconds)
  const minutes = Math.floor(whole / 60)
  const remainder = whole % 60
  return `${String(minutes).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`
}

function soundIcon(enabled: boolean): string {
  return enabled ? '<span aria-hidden="true">♪</span>' : '<span aria-hidden="true">♪̸</span>'
}

function bindHoldControl(button: HTMLButtonElement): void {
  button.addEventListener('click', (event) => {
    if (event.detail === 0) handleAction('jump')
  })
  button.addEventListener('pointerdown', (event) => {
    event.preventDefault()
    if (state.paused) return
    try {
      button.setPointerCapture(event.pointerId)
    } catch {
      // Synthetic pointer events may not have an active browser pointer to capture.
    }
    startHold(button)
  })
  button.addEventListener('pointerup', (event) => {
    event.preventDefault()
    if (button.hasPointerCapture(event.pointerId)) button.releasePointerCapture(event.pointerId)
    finishHold(button)
  })
  button.addEventListener('pointercancel', () => cancelHold(button))
}

function startHold(button?: Element): void {
  if (state.paused || (state.phase !== 'running' && state.phase !== 'final-line')) return
  if (holdTimer !== null) return
  holdTriggered = false
  button?.classList.add('is-holding')
  holdTimer = window.setTimeout(() => {
    holdTriggered = true
    holdTimer = null
    button?.classList.remove('is-holding')
    button?.classList.add('did-hold')
    handleAction('fire')
  }, 360)
}

function finishHold(button?: Element): void {
  if (holdTimer !== null) {
    window.clearTimeout(holdTimer)
    holdTimer = null
    if (!holdTriggered) handleAction('jump')
  }
  button?.classList.remove('is-holding')
  window.setTimeout(() => button?.classList.remove('did-hold'), 160)
  holdTriggered = false
}

function cancelHold(button?: Element): void {
  if (holdTimer !== null) window.clearTimeout(holdTimer)
  holdTimer = null
  holdTriggered = false
  button?.classList.remove('is-holding', 'did-hold')
}

function announce(message: string): void {
  liveRegion.textContent = ''
  requestAnimationFrame(() => {
    liveRegion.textContent = message
  })
}

function playTone(kind: EventKind): void {
  if (!state.soundEnabled) return
  try {
    audioContext ??= new AudioContext()
    const now = audioContext.currentTime
    const notes: Record<EventKind, number[]> = {
      jump: [246.94, 329.63],
      fire: [392, 523.25],
      clear: [440, 659.25],
      coin: [659.25, 783.99],
      stage: [220, 329.63, 493.88],
      stumble: [164.81, 146.83],
      reveal: [261.63, 329.63, 440, 587.33],
      blocked: [196, 185, 174],
      accept: [220, 277.18, 329.63, 440],
    }
    notes[kind].forEach((frequency, index) => {
      const oscillator = audioContext!.createOscillator()
      const gain = audioContext!.createGain()
      oscillator.type = kind === 'stumble' || kind === 'blocked' ? 'triangle' : 'sine'
      oscillator.frequency.value = frequency
      const start = now + index * 0.075
      gain.gain.setValueAtTime(0.0001, start)
      gain.gain.exponentialRampToValueAtTime(0.045, start + 0.018)
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.28)
      oscillator.connect(gain).connect(audioContext!.destination)
      oscillator.start(start)
      oscillator.stop(start + 0.3)
    })
  } catch {
    state.soundEnabled = false
  }
}

function requiredElement<T extends Element = HTMLElement>(selector: string): T {
  const element = app.querySelector<T>(selector)
  if (!element) throw new Error(`Missing element: ${selector}`)
  return element
}

function queueFocus(selector: string): void {
  requestAnimationFrame(() => app.querySelector<HTMLElement>(selector)?.focus())
}

document.addEventListener('keydown', (event) => {
  if (event.repeat && !['KeyP', 'Escape'].includes(event.code)) return

  if (['Space', 'ArrowUp', 'ArrowRight'].includes(event.code)) event.preventDefault()

  if (state.phase === 'title' && (event.code === 'Enter' || event.code === 'Space')) {
    handleAction('start')
    return
  }
  if (state.phase === 'final-line' && event.code === 'Enter') {
    handleAction('accept')
    return
  }
  if (event.code === 'KeyP' || event.code === 'Escape') {
    togglePause()
    return
  }
  if (event.code === 'Space') {
    startHold(app.querySelector('[data-hold-control]') ?? undefined)
    return
  }
  if (['ArrowUp', 'KeyW'].includes(event.code)) handleAction('jump')
  if (['KeyJ', 'KeyK', 'KeyX', 'ArrowRight'].includes(event.code)) handleAction('fire')
})

document.addEventListener('keyup', (event) => {
  if (event.code !== 'Space' || state.phase === 'title') return
  finishHold(app.querySelector('[data-hold-control]') ?? undefined)
})

document.addEventListener('visibilitychange', () => {
  if (document.hidden && state.phase === 'running' && !state.paused) togglePause(true)
  lastTimestamp = performance.now()
})

reducedMotionQuery.addEventListener('change', () => render())

render()
cancelAnimationFrame(animationFrame)
animationFrame = requestAnimationFrame(frame)
