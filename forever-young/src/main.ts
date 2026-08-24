import './style.css'
import {
  careerYears,
  pitchesPerYear,
  routineBeats,
  trainingWindows,
  type CareerYear,
} from './game-data.ts'

type Scene = 'title' | 'career' | 'retirement' | 'routine' | 'rediscovery' | 'training' | 'comeback' | 'ending'
type CareerStage = 'pitch' | 'result' | 'recap'
type TrainingStage = 'pitch' | 'result' | 'recap'
type ComebackStage = 'intro' | 'pitch' | 'result'
type EndingStage = 'flight' | 'cheer' | 'complete'
type MeterContext = 'career' | 'training' | 'comeback'
type HitKind = 'perfect' | 'contact' | 'miss' | 'foul' | 'home-run'

interface HitResult {
  kind: HitKind
  call: string
  detail: string
  distance: number | null
}

interface YearRecord {
  contacts: number
  perfects: number
  misses: number
}

interface MeterState {
  value: number
  direction: 1 | -1
  running: boolean
  zoneWidth: number
  speed: number
  context: MeterContext
}

interface GameState {
  scene: Scene
  soundEnabled: boolean
  locked: boolean
  announcement: string
  yearIndex: number
  pitchIndex: number
  careerStage: CareerStage
  yearRecords: YearRecord[]
  result: HitResult | null
  routineIndex: number
  trainingRep: number
  trainingStage: TrainingStage
  trainingContacts: number
  comebackStage: ComebackStage
  comebackAttempts: number
  endingStage: EndingStage
  meter: MeterState
}

const app = document.querySelector<HTMLDivElement>('#app')!
const liveRegion = document.querySelector<HTMLDivElement>('#live-region')!
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

let state = initialState()
let animationFrame: number | null = null
let previousFrame = 0
let audioContext: AudioContext | null = null
const pendingTimers = new Set<number>()

function initialState(): GameState {
  return {
    scene: 'title',
    soundEnabled: true,
    locked: false,
    announcement: '한 번의 스윙으로 한 선수의 시간을 통과합니다.',
    yearIndex: 0,
    pitchIndex: 0,
    careerStage: 'pitch',
    yearRecords: careerYears.map(() => ({ contacts: 0, perfects: 0, misses: 0 })),
    result: null,
    routineIndex: 0,
    trainingRep: 0,
    trainingStage: 'pitch',
    trainingContacts: 0,
    comebackStage: 'intro',
    comebackAttempts: 0,
    endingStage: 'flight',
    meter: {
      value: 0.04,
      direction: 1,
      running: false,
      zoneWidth: careerYears[0].zoneWidth,
      speed: careerYears[0].speed,
      context: 'career',
    },
  }
}

function clearPendingWork() {
  if (animationFrame !== null) window.cancelAnimationFrame(animationFrame)
  animationFrame = null
  pendingTimers.forEach((timer) => window.clearTimeout(timer))
  pendingTimers.clear()
}

function schedule(action: () => void, delay: number) {
  const adjustedDelay = prefersReducedMotion.matches ? Math.min(delay, 360) : delay
  const timer = window.setTimeout(() => {
    pendingTimers.delete(timer)
    action()
  }, adjustedDelay)
  pendingTimers.add(timer)
}

function beginMeter(context: MeterContext, zoneWidth: number, speed: number, focus = true) {
  stopMeter()
  state.meter = {
    value: 0.04,
    direction: 1,
    running: true,
    zoneWidth,
    speed,
    context,
  }
  state.result = null
  state.locked = false
  render(false, focus ? '[data-action="primary"]' : undefined)
  previousFrame = performance.now()
  animationFrame = window.requestAnimationFrame(animateMeter)
}

function stopMeter() {
  state.meter.running = false
  if (animationFrame !== null) window.cancelAnimationFrame(animationFrame)
  animationFrame = null
}

function animateMeter(now: number) {
  if (!state.meter.running) {
    animationFrame = null
    return
  }

  const elapsed = Math.min((now - previousFrame) / 1000, 0.05)
  previousFrame = now
  let nextValue = state.meter.value + elapsed * state.meter.speed * state.meter.direction

  if (nextValue >= 1) {
    nextValue = 2 - nextValue
    state.meter.direction = -1
  } else if (nextValue <= 0) {
    nextValue = -nextValue
    state.meter.direction = 1
  }

  state.meter.value = Math.max(0, Math.min(1, nextValue))
  updateMeterElements()
  animationFrame = window.requestAnimationFrame(animateMeter)
}

function updateMeterElements() {
  const position = `${(state.meter.value * 100).toFixed(2)}%`
  document.querySelectorAll<HTMLElement>('[data-meter-position]').forEach((element) => {
    element.style.left = position
  })
}

function evaluateTiming(context: MeterContext): HitResult {
  const distanceFromCenter = Math.abs(state.meter.value - 0.5)
  const halfWindow = state.meter.zoneWidth / 2

  if (context === 'comeback') {
    if (distanceFromCenter <= halfWindow) {
      return {
        kind: 'home-run',
        call: 'HOME RUN',
        detail: '배트 중심에, 오래 기다린 한 공이 닿았다.',
        distance: 128,
      }
    }
    return {
      kind: 'foul',
      call: 'FOUL',
      detail: '끝나지 않았다. 다음 공을 기다린다.',
      distance: null,
    }
  }

  if (distanceFromCenter <= halfWindow * 0.28) {
    return {
      kind: 'perfect',
      call: 'HOME RUN',
      detail: '완벽한 타이밍. 공이 담장을 넘는다.',
      distance: Math.round(118 + (1 - distanceFromCenter / Math.max(halfWindow, 0.01)) * 12),
    }
  }

  if (distanceFromCenter <= halfWindow) {
    return {
      kind: 'contact',
      call: 'HIT',
      detail: '배트에 맞았다. 주자가 살아 나간다.',
      distance: Math.round(68 + (1 - distanceFromCenter / Math.max(halfWindow, 0.01)) * 32),
    }
  }

  return {
    kind: 'miss',
    call: 'STRIKE',
    detail: distanceFromCenter < halfWindow + 0.07 ? '조금 빨랐다. 공 끝이 스쳐 갔다.' : '타이밍을 놓쳤다.',
    distance: null,
  }
}

function swing() {
  if (state.locked || !state.meter.running) return

  const context = state.meter.context
  const result = evaluateTiming(context)
  stopMeter()
  state.locked = true
  state.result = result
  state.announcement = `${result.call}. ${result.detail}`
  playHitSound(result.kind)

  if (context === 'career') resolveCareerSwing(result)
  else if (context === 'training') resolveTrainingSwing(result)
  else resolveComebackSwing(result)
}

function resolveCareerSwing(result: HitResult) {
  state.careerStage = 'result'
  const record = state.yearRecords[state.yearIndex]
  if (result.kind === 'perfect') {
    record.perfects += 1
    record.contacts += 1
  } else if (result.kind === 'contact') {
    record.contacts += 1
  } else {
    record.misses += 1
  }
  render()

  schedule(() => {
    if (state.pitchIndex + 1 < pitchesPerYear) {
      state.pitchIndex += 1
      state.careerStage = 'pitch'
      const year = careerYears[state.yearIndex]
      beginMeter('career', year.zoneWidth, year.speed)
      return
    }

    state.careerStage = 'recap'
    state.locked = false
    state.result = null
    state.announcement = `${careerYears[state.yearIndex].year}년 시즌이 끝났습니다.`
    render(true, '[data-action="primary"]')
  }, 920)
}

function resolveTrainingSwing(result: HitResult) {
  state.trainingStage = 'result'
  if (result.kind === 'perfect' || result.kind === 'contact') state.trainingContacts += 1
  render()

  schedule(() => {
    if (state.trainingRep + 1 < trainingWindows.length) {
      state.trainingRep += 1
      state.trainingStage = 'pitch'
      beginMeter('training', trainingWindows[state.trainingRep], 0.58 - state.trainingRep * 0.018)
      return
    }

    state.trainingStage = 'recap'
    state.locked = false
    state.result = null
    state.announcement = '여덟 번의 훈련을 마쳤습니다. 타이밍이 다시 넓어졌습니다.'
    render(true, '[data-action="primary"]')
  }, 820)
}

function resolveComebackSwing(result: HitResult) {
  state.comebackStage = 'result'
  state.comebackAttempts += 1
  render()

  if (result.kind === 'home-run') {
    schedule(enterEnding, 960)
    return
  }

  schedule(() => {
    state.comebackStage = 'pitch'
    beginMeter('comeback', 0.46, 0.42)
  }, 820)
}

function nextCareerYear() {
  if (state.yearIndex + 1 >= careerYears.length) {
    state.scene = 'retirement'
    state.locked = false
    state.announcement = '마지막 시즌이 끝났습니다. 선수 생활을 마칩니다.'
    render(true, '[data-action="primary"]')
    playTransitionSound('down')
    return
  }

  state.yearIndex += 1
  state.pitchIndex = 0
  state.careerStage = 'pitch'
  const year = careerYears[state.yearIndex]
  state.announcement = `${year.year}년, ${year.label}. 판정창의 폭이 달라졌습니다.`
  playTransitionSound(year.chapter === 'prime' ? 'up' : year.chapter === 'decline' || year.chapter === 'last' ? 'down' : 'move')
  beginMeter('career', year.zoneWidth, year.speed)
}

function primaryAction() {
  if (state.locked) return

  switch (state.scene) {
    case 'title': {
      state.scene = 'career'
      state.announcement = '첫해 첫 번째 공. 빛나는 판정창 안에서 스윙하세요.'
      playTransitionSound('up')
      const year = careerYears[0]
      beginMeter('career', year.zoneWidth, year.speed)
      break
    }
    case 'career':
      if (state.careerStage === 'recap') nextCareerYear()
      else swing()
      break
    case 'retirement':
      state.scene = 'routine'
      state.routineIndex = 0
      state.announcement = '은퇴 후 첫날. 알람을 끕니다.'
      playTransitionSound('down')
      render(true, '[data-action="primary"]')
      break
    case 'routine':
      advanceRoutine()
      break
    case 'rediscovery':
      state.scene = 'training'
      state.trainingRep = 0
      state.trainingStage = 'pitch'
      state.announcement = '낡은 공을 집었습니다. 다시 첫 스윙을 시작합니다.'
      playTransitionSound('up')
      beginMeter('training', trainingWindows[0], 0.58)
      break
    case 'training':
      if (state.trainingStage === 'recap') {
        state.scene = 'comeback'
        state.comebackStage = 'intro'
        state.announcement = '몸 만들기를 마쳤습니다. 다시 경기장으로 갑니다.'
        playTransitionSound('up')
        render(true, '[data-action="primary"]')
      } else {
        swing()
      }
      break
    case 'comeback':
      if (state.comebackStage === 'intro') {
        state.comebackStage = 'pitch'
        state.announcement = '복귀전 마지막 타석. 빛나는 순간에 스윙하세요.'
        beginMeter('comeback', 0.46, 0.42)
      } else {
        swing()
      }
      break
    case 'ending':
      if (state.endingStage === 'complete') restartGame()
      break
  }
}

function advanceRoutine() {
  if (state.routineIndex + 1 < routineBeats.length) {
    state.routineIndex += 1
    const beat = routineBeats[state.routineIndex]
    state.announcement = `${beat.day}일차 ${beat.time}, ${beat.action}.`
    playRoutineTick(beat.tone === 'night')
    render(false, '[data-action="primary"]')
    return
  }

  state.scene = 'rediscovery'
  state.announcement = '현관 아래 오래된 상자에서 야구공과 글러브를 발견했습니다.'
  playTransitionSound('memory')
  render(true, '[data-action="primary"]')
}

function enterEnding() {
  clearPendingWork()
  state.scene = 'ending'
  state.endingStage = 'flight'
  state.locked = true
  state.announcement = '공이 담장을 향해 날아갑니다.'
  playTransitionSound('crack')
  render(true)

  schedule(() => {
    state.endingStage = 'cheer'
    state.announcement = '홈런. 관중의 환호가 경기장을 채웁니다.'
    playCrowd()
    render()

    schedule(() => {
      state.endingStage = 'complete'
      state.locked = false
      state.announcement = '마지막 홈런. 끝나지 않은 타석의 완결입니다.'
      render(false, '[data-action="primary"]')
    }, 1500)
  }, 1050)
}

function restartGame() {
  const soundEnabled = state.soundEnabled
  clearPendingWork()
  state = initialState()
  state.soundEnabled = soundEnabled
  render(true, '[data-action="primary"]')
}

function toggleSound() {
  state.soundEnabled = !state.soundEnabled
  if (state.soundEnabled) playTransitionSound('move')
  state.announcement = `효과음을 ${state.soundEnabled ? '켰습니다' : '껐습니다'}.`
  render(false, '[data-action="sound"]')
  if (state.meter.running) updateMeterElements()
}

function render(focusHeading = false, focusSelector?: string) {
  document.documentElement.dataset.scene = state.scene
  app.innerHTML = `
    <div class="game-shell" data-scene="${state.scene}" data-ending-stage="${state.endingStage}">
      ${headerMarkup()}
      ${sceneMarkup()}
    </div>`
  updateMeterElements()
  announce(state.announcement)

  window.requestAnimationFrame(() => {
    if (focusHeading) {
      const heading = document.querySelector<HTMLElement>('#scene-title')
      heading?.setAttribute('tabindex', '-1')
      heading?.focus({ preventScroll: true })
      return
    }
    if (focusSelector) document.querySelector<HTMLElement>(focusSelector)?.focus({ preventScroll: true })
  })
}

function sceneMarkup(): string {
  switch (state.scene) {
    case 'title':
      return titleScene()
    case 'career':
      return careerScene()
    case 'retirement':
      return retirementScene()
    case 'routine':
      return routineScene()
    case 'rediscovery':
      return rediscoveryScene()
    case 'training':
      return trainingScene()
    case 'comeback':
      return comebackScene()
    case 'ending':
      return endingScene()
  }
}

function headerMarkup(): string {
  if (state.scene === 'title') return ''
  const chapter = sceneLabel()
  return `
    <header class="game-header">
      <button class="wordmark" type="button" data-action="restart" aria-label="처음부터 다시 시작">
        <span class="baseball-mark" aria-hidden="true"><i></i></span>
        <span>GO AHEAD</span>
      </button>
      <div class="chapter-label"><span>${chapter.number}</span>${chapter.label}</div>
      <button class="sound-button" type="button" data-action="sound" aria-pressed="${state.soundEnabled}">
        <span aria-hidden="true">${state.soundEnabled ? '◖))' : '◖×'}</span>
        <span>${state.soundEnabled ? '효과음 켬' : '효과음 끔'}</span>
      </button>
    </header>`
}

function sceneLabel(): { number: string; label: string } {
  if (state.scene === 'career') return { number: '01', label: '선수 생활' }
  if (state.scene === 'retirement' || state.scene === 'routine') return { number: '02', label: '은퇴 후' }
  if (state.scene === 'rediscovery' || state.scene === 'training') return { number: '03', label: '다시 몸을 만들다' }
  return { number: '04', label: '마지막 타석' }
}

function titleScene(): string {
  return `
    <main class="title-scene" aria-labelledby="scene-title">
      <div class="title-lines" aria-hidden="true"></div>
      <section class="title-copy">
        <p class="eyebrow">A ONE-BUTTON BASEBALL STORY</p>
        <h1 id="scene-title"><span>GO</span> AHEAD</h1>
        <p class="title-kicker">끝나지 않은 타석</p>
        <p class="title-lede">넓어졌다가 좁아지는 단 한 번의 타이밍.<br />전성기와 은퇴를 지나, 마지막 공을 친다.</p>
        ${primaryButton('첫 타석에 선다', 'SPACE · 클릭 · 터치')}
      </section>
      <div class="title-stadium" aria-hidden="true">
        <div class="stadium-ring ring-one"></div>
        <div class="stadium-ring ring-two"></div>
        <div class="stadium-field"><span></span><i></i></div>
        <div class="title-ball"><i></i></div>
        <div class="title-bat"></div>
      </div>
      <p class="title-note">3–5분 · 한 가지 조작 · 외부 에셋 없음</p>
    </main>`
}

function careerScene(): string {
  const year = careerYears[state.yearIndex]
  const record = state.yearRecords[state.yearIndex]
  const totalPitches = state.careerStage === 'recap' ? pitchesPerYear : state.pitchIndex + 1
  const average = record.contacts / Math.max(totalPitches, 1)

  if (state.careerStage === 'recap') {
    return `
      <main class="recap-scene career-recap" aria-labelledby="scene-title">
        <section class="recap-card">
          <p class="eyebrow">SEASON ${String(state.yearIndex + 1).padStart(2, '0')} / ${careerYears.length}</p>
          <p class="recap-year">${year.year}</p>
          <h1 id="scene-title">${year.note}</h1>
          <div class="recap-stats">
            <div><span>시즌 타율</span><strong>${formatAverage(average)}</strong></div>
            <div><span>홈런</span><strong>${record.perfects}</strong></div>
            <div><span>판정 범위</span><strong>${Math.round(year.zoneWidth * 100)}%</strong></div>
          </div>
          ${careerCurveMarkup(year)}
          ${primaryButton(state.yearIndex + 1 === careerYears.length ? '마지막 시즌을 마친다' : '다음 해로', 'SPACE')}
        </section>
      </main>`
  }

  return `
    <main class="play-scene career-play ${year.chapter}" aria-labelledby="scene-title">
      ${scoreboardMarkup(year)}
      <section class="play-column">
        <div class="play-heading">
          <div>
            <p class="eyebrow">${year.year} · ${year.age}세 · ${year.label}</p>
            <h1 id="scene-title">${year.note}</h1>
          </div>
          <p>판정창 <strong>${Math.round(year.zoneWidth * 100)}%</strong></p>
        </div>
        ${stadiumMarkup()}
        ${timingPanelMarkup('빛나는 판정창 안에서 스윙', `${state.pitchIndex + 1} / ${pitchesPerYear} PITCH`)}
        ${resultMarkup()}
        ${careerCurveMarkup(year)}
      </section>
    </main>`
}

function scoreboardMarkup(year: CareerYear): string {
  const careerRecord = combinedCareerRecord()
  return `
    <aside class="scoreboard" aria-label="선수 기록">
      <div class="scoreboard-year"><span>YEAR</span><strong>${year.year}</strong></div>
      <dl>
        <div><dt>AGE</dt><dd>${year.age}</dd></div>
        <div><dt>AVG</dt><dd>${formatAverage(careerRecord.contacts / Math.max(careerRecord.attempts, 1))}</dd></div>
        <div><dt>HR</dt><dd>${careerRecord.perfects}</dd></div>
      </dl>
      <div class="pitch-count" aria-label="이 해의 투구 수">
        ${Array.from({ length: pitchesPerYear }, (_, index) => `<span class="${index < state.pitchIndex || state.careerStage === 'result' && index === state.pitchIndex ? 'done' : index === state.pitchIndex ? 'current' : ''}"></span>`).join('')}
      </div>
      <div class="mini-score">
        <div><strong>피닉스</strong><span>${Math.min(9, 2 + state.yearIndex)}</span></div>
        <div><strong>ONE</strong><span>${Math.min(9, 3 + Math.floor(state.yearIndex / 2))}</span></div>
        <p><i></i><i class="on"></i><i></i><b>${Math.min(2, state.pitchIndex)} OUT</b></p>
      </div>
      <p>한 이닝이<br />한 해가 된다.</p>
    </aside>`
}

function combinedCareerRecord(): { contacts: number; perfects: number; attempts: number } {
  return state.yearRecords.reduce(
    (total, record) => ({
      contacts: total.contacts + record.contacts,
      perfects: total.perfects + record.perfects,
      attempts: total.attempts + record.contacts + record.misses,
    }),
    { contacts: 0, perfects: 0, attempts: 0 },
  )
}

function stadiumMarkup(extraClass = ''): string {
  const resultClass = state.result ? `result-${state.result.kind}` : ''
  return `
    <div class="stadium ${extraClass} ${resultClass}" aria-hidden="true">
      <div class="stadium-sky"><span class="light left"></span><span class="light right"></span></div>
      <div class="crowd-bands"><span></span><span></span><span></span></div>
      <div class="field-lines"><span class="base base-one"></span><span class="base base-two"></span><span class="base base-three"></span></div>
      <div class="pitcher"><span></span><i></i></div>
      <div class="abs-zone"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>
      <div class="batter"><span class="head"></span><span class="body"></span><span class="leg front"></span><span class="leg back"></span><span class="bat"></span></div>
      <div class="pitch-ball" data-meter-position><i></i></div>
      <div class="hit-flash"></div>
    </div>`
}

function timingPanelMarkup(instruction: string, counter: string): string {
  const meterDisabled = state.locked || !state.meter.running
  return `
    <button class="swing-panel" type="button" data-action="primary" ${meterDisabled ? 'disabled' : ''} aria-label="${instruction}. 현재 타이밍에 스윙">
      <div class="swing-meta"><span>${counter}</span><strong>${instruction}</strong><span>SPACE / TAP</span></div>
      <div class="timing-track">
        <span class="timing-window" style="width: ${state.meter.zoneWidth * 100}%"></span>
        <span class="home-run-window" style="width: ${state.meter.zoneWidth * 28}%"></span>
        <span class="timing-center"></span>
        <span class="timing-needle" data-meter-position><i></i></span>
      </div>
      <div class="timing-legend"><span><i class="hit-zone"></i>안타 존</span><span><i class="homer-zone"></i>홈런 존</span></div>
    </button>`
}

function resultMarkup(): string {
  if (!state.result) return '<div class="result-space" aria-hidden="true"></div>'
  return `
    <div class="hit-result ${state.result.kind}" role="status">
      <strong>${state.result.call}</strong>
      <span>${state.result.detail}</span>
      ${state.result.distance ? `<em>${state.result.distance} M</em>` : ''}
    </div>`
}

function careerCurveMarkup(currentYear: CareerYear): string {
  return `
    <div class="career-curve" aria-label="해마다 변하는 타격 판정 범위">
      <div class="curve-label"><span>판정 범위의 변화</span><strong>${currentYear.chapter === 'prime' ? '전성기' : currentYear.chapter === 'decline' || currentYear.chapter === 'last' ? '좁아지는 중' : '넓어지는 중'}</strong></div>
      <div class="curve-bars">
        ${careerYears
          .map(
            (year, index) => `
              <span class="${index === state.yearIndex ? 'current' : ''} ${index < state.yearIndex ? 'past' : ''}" style="--bar-height: ${Math.round(year.zoneWidth * 190)}px">
                <i></i><small>${String(year.year).slice(2)}</small>
              </span>`,
          )
          .join('')}
      </div>
    </div>`
}

function retirementScene(): string {
  const record = combinedCareerRecord()
  return `
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
          <div><dt>함께한 해</dt><dd>${careerYears.length}</dd></div>
          <div><dt>마주한 공</dt><dd>${record.attempts}</dd></div>
          <div><dt>기억할 홈런</dt><dd>${record.perfects}</dd></div>
        </dl>
        ${primaryButton('유니폼을 벗는다', 'SPACE')}
      </section>
    </main>`
}

function routineScene(): string {
  const beat = routineBeats[state.routineIndex]
  const dayProgress = Math.floor(state.routineIndex / 4)
  return `
    <main class="routine-scene tone-${beat.tone}" aria-labelledby="scene-title">
      <section class="routine-clock">
        <p class="routine-day">DAY ${String(beat.day).padStart(2, '0')}</p>
        <h1 id="scene-title">${beat.time}</h1>
        <div class="clock-line"><span style="width: ${((state.routineIndex % 4) + 1) * 25}%"></span></div>
        <p class="routine-action">${beat.action}</p>
        <p class="routine-detail">${beat.detail}</p>
        ${primaryButton(beat.action, `${state.routineIndex + 1} / ${routineBeats.length}`)}
      </section>
      <aside class="routine-days" aria-label="반복된 날">
        ${Array.from({ length: 3 }, (_, index) => `<span class="${index < dayProgress ? 'past' : index === dayProgress ? 'current' : ''}">DAY ${String(index + 1).padStart(2, '0')}</span>`).join('')}
      </aside>
      <div class="routine-room" aria-hidden="true">
        <div class="room-window"><span></span></div>
        <div class="room-table"><span></span></div>
        <div class="closed-box"></div>
        <div class="routine-shadow"></div>
      </div>
    </main>`
}

function rediscoveryScene(): string {
  return `
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
        ${primaryButton('공을 집는다', '다시 한 번')}
      </section>
    </main>`
}

function trainingScene(): string {
  const windowWidth = trainingWindows[state.trainingRep]
  if (state.trainingStage === 'recap') {
    return `
      <main class="recap-scene training-recap" aria-labelledby="scene-title">
        <section class="recap-card">
          <p class="eyebrow">TRAINING COMPLETE</p>
          <p class="training-number">${state.trainingContacts}<span> / ${trainingWindows.length}</span></p>
          <h1 id="scene-title">타이밍은 사라진 게 아니라<br />작아져 있었을 뿐이다.</h1>
          <div class="training-growth" aria-label="훈련하며 넓어진 판정 범위">
            ${trainingWindows.map((width) => `<i style="width: ${width * 100}%"></i>`).join('')}
          </div>
          ${primaryButton('테스트를 받으러 간다', '마지막 타석으로')}
        </section>
      </main>`
  }

  return `
    <main class="training-scene" aria-labelledby="scene-title">
      <section class="training-heading">
        <p class="eyebrow">BACK TO TRAINING · ${state.trainingRep + 1} / ${trainingWindows.length}</p>
        <h1 id="scene-title">몸보다 천천히,<br />타이밍을 다시 넓힌다.</h1>
        <p>판정 범위 ${Math.round(windowWidth * 100)}%</p>
      </section>
      <section class="training-ground">
        ${stadiumMarkup('empty-ground')}
        ${timingPanelMarkup('연습공을 스윙', `REP ${String(state.trainingRep + 1).padStart(2, '0')}`)}
        ${resultMarkup()}
      </section>
      <aside class="training-log" aria-label="훈련 진행">
        ${trainingWindows.map((width, index) => `<span class="${index < state.trainingRep || state.trainingStage === 'result' && index === state.trainingRep ? 'done' : index === state.trainingRep ? 'current' : ''}"><i style="width:${width * 100}%"></i><small>${index + 1}</small></span>`).join('')}
      </aside>
    </main>`
}

function comebackScene(): string {
  if (state.comebackStage === 'intro') {
    return `
      <main class="comeback-intro" aria-labelledby="scene-title">
        <div class="tunnel" aria-hidden="true"><span></span><i></i></div>
        <section>
          <p class="eyebrow">ONE MORE AT-BAT</p>
          <h1 id="scene-title">다시,<br />이름이 불렸다.</h1>
          <p>마지막 타석. 스트라이크는 없다.<br />담장을 넘길 때까지 다음 공이 온다.</p>
          ${primaryButton('다시 타석에 선다', 'SPACE')}
        </section>
      </main>`
  }

  return `
    <main class="play-scene comeback-play" aria-labelledby="scene-title">
      <section class="play-column">
        <div class="play-heading centered">
          <div>
            <p class="eyebrow">COMEBACK · FINAL AT-BAT</p>
            <h1 id="scene-title">마지막 공을 기다린다.</h1>
          </div>
          <p>시도 <strong>${state.comebackAttempts + 1}</strong></p>
        </div>
        ${stadiumMarkup('night-game')}
        ${timingPanelMarkup('빛나는 순간에 마지막 스윙', 'FINAL PITCH')}
        ${resultMarkup()}
        <p class="comeback-note">파울은 끝이 아니다. 홈런이 될 때까지 다시 온다.</p>
      </section>
    </main>`
}

function endingScene(): string {
  const cheering = state.endingStage === 'cheer' || state.endingStage === 'complete'
  return `
    <main class="ending-scene ${state.endingStage}" aria-labelledby="scene-title">
      <div class="ending-sky" aria-hidden="true">
        <div class="home-run-ball"></div>
        <div class="arc-line"></div>
        <div class="ending-lights"><span></span><span></span><span></span><span></span></div>
      </div>
      <div class="ending-crowd ${cheering ? 'alive' : ''}" aria-hidden="true">
        ${Array.from({ length: 42 }, (_, index) => `<i style="--i:${index};--x:${(index * 37) % 100}%"></i>`).join('')}
      </div>
      <section class="ending-copy">
        <p class="eyebrow">${state.endingStage === 'flight' ? 'THE BALL IS STILL FLYING' : 'HOME RUN · 128 M'}</p>
        <h1 id="scene-title">${state.endingStage === 'flight' ? '끝나지 않았다.' : '다시, 가장 멀리.'}</h1>
        <p class="cheer-line">${cheering ? '와아아아—!' : '······'}</p>
        <p class="ending-line">전성기는 지나갔다.<br />그러나 스윙은 여기까지 돌아왔다.</p>
        ${state.endingStage === 'complete' ? primaryButton('처음부터 다시 친다', 'REPLAY') : '<div class="ending-wait">공을 따라가는 중</div>'}
      </section>
    </main>`
}

function primaryButton(label: string, meta: string): string {
  return `
    <button class="primary-button" type="button" data-action="primary">
      <span>${label}</span><small>${meta}</small><i aria-hidden="true">→</i>
    </button>`
}

function formatAverage(value: number): string {
  return value.toFixed(3).replace(/^0/, '')
}

function announce(message: string) {
  liveRegion.textContent = ''
  window.requestAnimationFrame(() => {
    liveRegion.textContent = message
  })
}

function ensureAudioContext(): AudioContext | null {
  if (!state.soundEnabled) return null
  try {
    audioContext ??= new AudioContext()
    if (audioContext.state === 'suspended') void audioContext.resume()
    return audioContext
  } catch {
    state.soundEnabled = false
    return null
  }
}

function playHitSound(kind: HitKind) {
  const context = ensureAudioContext()
  if (!context) return
  const now = context.currentTime

  if (kind === 'perfect' || kind === 'home-run') {
    playOscillator(context, 108, now, 0.11, 'square', 0.13)
    playOscillator(context, 216, now + 0.025, 0.18, 'triangle', 0.08)
  } else if (kind === 'contact') {
    playOscillator(context, 135, now, 0.12, 'square', 0.09)
  } else if (kind === 'foul') {
    playOscillator(context, 160, now, 0.09, 'triangle', 0.06)
  } else {
    playOscillator(context, 72, now, 0.16, 'sine', 0.05)
  }
}

function playTransitionSound(kind: 'up' | 'down' | 'move' | 'memory' | 'crack') {
  const context = ensureAudioContext()
  if (!context) return
  const now = context.currentTime
  const notes =
    kind === 'up'
      ? [196, 246.94, 329.63]
      : kind === 'down'
        ? [220, 174.61, 130.81]
        : kind === 'memory'
          ? [146.83, 220, 293.66]
          : kind === 'crack'
            ? [92, 184, 368]
            : [196]
  notes.forEach((frequency, index) => playOscillator(context, frequency, now + index * 0.075, 0.22, kind === 'crack' ? 'square' : 'sine', kind === 'crack' ? 0.09 : 0.045))
}

function playRoutineTick(night: boolean) {
  const context = ensureAudioContext()
  if (!context) return
  playOscillator(context, night ? 92 : 124, context.currentTime, 0.11, 'triangle', 0.025)
}

function playOscillator(
  context: AudioContext,
  frequency: number,
  start: number,
  duration: number,
  type: OscillatorType,
  volume: number,
) {
  const oscillator = context.createOscillator()
  const gain = context.createGain()
  oscillator.type = type
  oscillator.frequency.value = frequency
  gain.gain.setValueAtTime(0.0001, start)
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.012)
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration)
  oscillator.connect(gain).connect(context.destination)
  oscillator.start(start)
  oscillator.stop(start + duration + 0.02)
}

function playCrowd() {
  const context = ensureAudioContext()
  if (!context) return
  const now = context.currentTime
  const duration = 1.4
  const buffer = context.createBuffer(1, Math.floor(context.sampleRate * duration), context.sampleRate)
  const data = buffer.getChannelData(0)
  for (let index = 0; index < data.length; index += 1) {
    const envelope = Math.min(index / (context.sampleRate * 0.18), 1) * (1 - index / data.length) ** 0.35
    data[index] = (Math.random() * 2 - 1) * envelope
  }
  const source = context.createBufferSource()
  const filter = context.createBiquadFilter()
  const gain = context.createGain()
  source.buffer = buffer
  filter.type = 'bandpass'
  filter.frequency.value = 860
  filter.Q.value = 0.55
  gain.gain.value = 0.13
  source.connect(filter).connect(gain).connect(context.destination)
  source.start(now)
  ;[261.63, 329.63, 392, 523.25].forEach((frequency, index) =>
    playOscillator(context, frequency, now + index * 0.06, 0.7, 'sine', 0.035),
  )
}

app.addEventListener('click', (event) => {
  const target = (event.target as HTMLElement).closest<HTMLElement>('[data-action]')
  if (!target) return
  const action = target.dataset.action
  if (action === 'primary') primaryAction()
  else if (action === 'restart') restartGame()
  else if (action === 'sound') toggleSound()
})

window.addEventListener('keydown', (event) => {
  if (event.code !== 'Space' || event.repeat || event.metaKey || event.ctrlKey || event.altKey) return
  const focusedAction = (event.target as HTMLElement).closest<HTMLElement>('[data-action]')?.dataset.action
  if (focusedAction && focusedAction !== 'primary') return
  event.preventDefault()
  primaryAction()
})

prefersReducedMotion.addEventListener('change', () => {
  render()
  if (state.meter.running) updateMeterElements()
})

render()
