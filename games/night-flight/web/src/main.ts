import './style.css'
import {
  aspirationById,
  aspirations,
  destinationById,
  destinations,
  identityForFragments,
  phaseData,
  phaseIndexForVisitCount,
  type AspirationId,
  type DestinationId,
  type FragmentId,
} from './content'

type Scene = 'title' | 'choice' | 'flight' | 'memory' | 'assembly' | 'ending'
type Tone = 'move' | 'near' | 'collect' | 'place' | 'error' | 'ending'
type Direction = 'up' | 'down' | 'left' | 'right'

interface Vector {
  x: number
  y: number
}

interface GameState {
  scene: Scene
  aspiration: AspirationId | null
  position: Vector
  velocity: Vector
  target: Vector | null
  visited: DestinationId[]
  fragments: FragmentId[]
  currentDestination: DestinationId | null
  nearbyDestination: DestinationId | null
  assemblySlots: [FragmentId | null, FragmentId | null]
  identity: AspirationId | null
  startedAt: number | null
  elapsedSeconds: number
  soundEnabled: boolean
  reducedMotion: boolean
  feedback: string
}

const app = document.querySelector<HTMLDivElement>('#app')!
const liveRegion = document.querySelector<HTMLDivElement>('#live-region')!
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

let state: GameState = createInitialState()
let animationFrame = 0
let lastFrameTime = 0
let audioContext: AudioContext | null = null
let draggedFragment: FragmentId | null = null
const heldDirections = new Set<Direction>()
const heldKeys = new Set<string>()

function createInitialState(): GameState {
  return {
    scene: 'title',
    aspiration: null,
    position: { x: 50, y: 57 },
    velocity: { x: 0, y: 0 },
    target: null,
    visited: [],
    fragments: [],
    currentDestination: null,
    nearbyDestination: null,
    assemblySlots: [null, null],
    identity: null,
    startedAt: null,
    elapsedSeconds: 0,
    soundEnabled: true,
    reducedMotion: prefersReducedMotion.matches,
    feedback: '되고 싶은 말을 하나 품고 출발하세요.',
  }
}

function escapeHtml(value: string | number) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function announce(message: string) {
  liveRegion.textContent = ''
  window.setTimeout(() => {
    liveRegion.textContent = message
  }, 20)
}

function playTone(tone: Tone) {
  if (!state.soundEnabled) return

  try {
    audioContext ??= new AudioContext()
    if (audioContext.state === 'suspended') void audioContext.resume()
    const now = audioContext.currentTime
    const notes: Record<Tone, number[]> = {
      move: [220],
      near: [329.63, 440],
      collect: [293.66, 440, 587.33],
      place: [392, 523.25],
      error: [174.61, 146.83],
      ending: [261.63, 329.63, 392, 523.25, 659.25],
    }

    notes[tone].forEach((frequency, index) => {
      const oscillator = audioContext!.createOscillator()
      const gain = audioContext!.createGain()
      const start = now + index * 0.075
      oscillator.type = tone === 'error' ? 'triangle' : tone === 'ending' ? 'sine' : 'sine'
      oscillator.frequency.setValueAtTime(frequency, start)
      if (tone === 'near') oscillator.frequency.exponentialRampToValueAtTime(frequency * 1.08, start + 0.3)
      gain.gain.setValueAtTime(0.0001, start)
      gain.gain.exponentialRampToValueAtTime(tone === 'ending' ? 0.045 : 0.035, start + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, start + (tone === 'ending' ? 0.72 : 0.35))
      oscillator.connect(gain).connect(audioContext!.destination)
      oscillator.start(start)
      oscillator.stop(start + (tone === 'ending' ? 0.75 : 0.38))
    })
  } catch {
    state.soundEnabled = false
  }
}

function sceneStep(scene: Scene) {
  if (scene === 'choice') return 1
  if (scene === 'flight' || scene === 'memory') return 2
  if (scene === 'assembly') return 3
  if (scene === 'ending') return 4
  return 0
}

function progressMarkup() {
  if (state.scene === 'title') return ''
  const current = sceneStep(state.scene)
  const labels = ['바람', '유영', '대답', '여명']
  return `
    <ol class="progress" aria-label="여정 진행">
      ${labels
        .map((label, index) => {
          const step = index + 1
          const status = step < current ? 'done' : step === current ? 'current' : ''
          return `<li class="${status}"><span>${step < current ? '✓' : step}</span>${label}</li>`
        })
        .join('')}
    </ol>`
}

function headerMarkup() {
  if (state.scene === 'title') return ''
  return `
    <header class="game-header">
      <button class="brand" type="button" data-action="restart" aria-label="처음 화면으로 돌아가기">
        <span class="brand-orbit" aria-hidden="true"></span>
        <span>야간비행</span>
      </button>
      ${progressMarkup()}
      <div class="header-tools">
        <button class="tool-button" type="button" data-action="toggle-motion" aria-pressed="${state.reducedMotion}">
          ${motionIcon()}<span>${state.reducedMotion ? '움직임 줄임' : '기본 움직임'}</span>
        </button>
        <button class="tool-button" type="button" data-action="toggle-sound" aria-pressed="${state.soundEnabled}">
          ${state.soundEnabled ? soundOnIcon() : soundOffIcon()}<span>${state.soundEnabled ? '소리 켬' : '소리 끔'}</span>
        </button>
      </div>
    </header>`
}

function titleScene() {
  return `
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
        <div class="title-traveler">${travelerSvg()}</div>
        <span class="title-word word-one">사람</span>
        <span class="title-word word-two">경험</span>
        <span class="title-word word-three">나</span>
      </div>
      <div class="title-settings">
        <button type="button" class="quiet-button" data-action="toggle-motion">
          ${motionIcon()} ${state.reducedMotion ? '움직임 줄이기 켜짐' : '움직임 줄이기'}
        </button>
        <button type="button" class="quiet-button" data-action="toggle-sound">
          ${state.soundEnabled ? soundOnIcon() : soundOffIcon()} ${state.soundEnabled ? '효과음 켜짐' : '효과음 꺼짐'}
        </button>
      </div>
    </main>`
}

function choiceScene() {
  return sceneFrame(`
    <main class="choice-scene" aria-labelledby="scene-title">
      <div class="scene-intro centered">
        <p class="eyebrow">DEPARTURE / 18:04</p>
        <h1 id="scene-title" tabindex="-1">어떤 사람이 되고 싶나요?</h1>
        <p>이 선택은 목적지가 아니라, 출발할 때 품는 한 문장입니다.</p>
      </div>
      <div class="aspiration-grid" role="radiogroup" aria-label="되고 싶은 사람 선택">
        ${aspirations
          .map(
            (aspiration, index) => `
              <button
                class="aspiration-card ${state.aspiration === aspiration.id ? 'selected' : ''}"
                type="button"
                role="radio"
                aria-checked="${state.aspiration === aspiration.id}"
                data-action="select-aspiration"
                data-aspiration="${aspiration.id}"
                ${index === 0 ? 'data-autofocus' : ''}
              >
                <span class="choice-index">0${index + 1}</span>
                <strong>${aspiration.short}</strong>
                <span>${aspiration.description}</span>
              </button>`,
          )
          .join('')}
      </div>
      <div class="choice-footer">
        <p class="feedback-line">${escapeHtml(state.feedback)}</p>
        <button class="primary-button" type="button" data-action="depart" ${state.aspiration ? '' : 'disabled'}>
          이 말을 품고 출발 <span aria-hidden="true">→</span>
        </button>
      </div>
    </main>`)
}

function flightScene() {
  const phaseIndex = phaseIndexForVisitCount(state.visited.length)
  const phase = phaseData[phaseIndex]
  const aspiration = aspirationById(state.aspiration)
  const allVisited = state.visited.length === destinations.length

  return sceneFrame(`
    <main class="flight-scene phase-${phase.id}" aria-labelledby="scene-title">
      <section class="flight-main">
        <div class="flight-heading">
          <div>
            <p class="eyebrow">${phase.label} · ${phase.age}</p>
            <h1 id="scene-title" tabindex="-1">스스로 움직여야 만나는 것들</h1>
          </div>
          <p>${phase.copy}</p>
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
          ${destinations.map(destinationMarkup).join('')}
          <div
            id="traveler"
            class="traveler phase-${phase.id}"
            style="left:${state.position.x}%;top:${state.position.y}%"
            aria-hidden="true"
          >
            <span class="traveler-trail"></span>
            ${travelerSvg()}
          </div>
          <div class="map-status top-left">
            <span>기억</span><strong>${state.visited.length} / ${destinations.length}</strong>
          </div>
          <div class="map-status top-right">
            <span>우주 시간</span><strong>${phase.year}세</strong>
          </div>
          <p class="map-caption">지도를 누르면 그 방향으로 유영합니다.</p>
        </div>
      </section>

      <aside class="flight-panel" aria-label="비행 정보와 조작">
        <div class="panel-block carried-word">
          <span class="panel-label">출발할 때 품은 말</span>
          <strong>${escapeHtml(aspiration?.label ?? '')}</strong>
        </div>

        <div class="panel-block journey-clock">
          <span class="panel-label">여정 시간</span>
          <strong id="elapsed-time">${formatTime(state.elapsedSeconds)}</strong>
          <div class="time-track"><span style="width:${(state.visited.length / destinations.length) * 100}%"></span></div>
          <small>${escapeHtml(phase.copy)}</small>
        </div>

        <div class="panel-block fragment-log">
          <span class="panel-label">모은 글자 조각</span>
          <div class="fragment-mini-list" aria-label="모은 글자">
            ${state.fragments.length ? state.fragments.map(fragmentMiniMarkup).join('') : '<span class="empty-fragments">아직 없음</span>'}
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
          <p id="nearby-message">${allVisited ? '모든 경험이 모였습니다.' : '빛 가까이 다가가면 방문할 수 있습니다.'}</p>
          <button id="visit-button" class="primary-button wide" type="button" data-action="visit" disabled>
            가까운 빛 없음
          </button>
        </div>
      </aside>
    </main>`)
}

function destinationMarkup(destination: (typeof destinations)[number]) {
  const visited = state.visited.includes(destination.id)
  return `
    <button
      class="destination destination-${destination.kind} ${visited ? 'visited' : ''}"
      type="button"
      data-action="target-destination"
      data-destination="${destination.id}"
      style="left:${destination.x}%;top:${destination.y}%;--accent:${destination.accent}"
      aria-label="${escapeHtml(destination.name)}${visited ? ', 방문 완료' : ', 방문하지 않음'}"
    >
      <span class="destination-core" aria-hidden="true"></span>
      <span class="destination-ring" aria-hidden="true"></span>
      <span class="destination-label">${escapeHtml(destination.name)}</span>
      ${visited ? `<span class="visited-mark" aria-hidden="true">✓ ${destination.fragment}</span>` : ''}
    </button>`
}

function memoryScene() {
  const destination = destinationById(state.currentDestination)
  if (!destination) return ''
  const nextIsAssembly = state.visited.length + 1 === destinations.length
  const phase = phaseData[phaseIndexForVisitCount(state.visited.length)]

  return sceneFrame(`
    <main class="memory-scene" aria-labelledby="scene-title">
      <div class="memory-sky phase-${phase.id}" aria-hidden="true">
        <span class="memory-orbit"></span>
        <span class="memory-object" style="--accent:${destination.accent}"></span>
      </div>
      <article class="memory-card">
        <p class="eyebrow">VISITED / ${escapeHtml(destination.name)}</p>
        <h1 id="scene-title" tabindex="-1">${escapeHtml(destination.memoryTitle)}</h1>
        <p class="memory-body">${escapeHtml(destination.memoryBody)}</p>
        <div class="memory-rule" aria-hidden="true"></div>
        <p class="memory-reflection">${escapeHtml(destination.reflection)}</p>
        <div class="fragment-reward" aria-label="얻은 글자 조각 ${destination.fragment}">
          <span>경험에서 남은 글자</span>
          <strong>${destination.fragment}</strong>
        </div>
        <button class="primary-button" type="button" data-action="collect-memory" data-autofocus>
          ${nextIsAssembly ? '마지막 질문으로' : '글자를 품고 다시 유영'} <span aria-hidden="true">→</span>
        </button>
      </article>
    </main>`)
}

function assemblyScene() {
  const aspiration = aspirationById(state.aspiration)
  const placed = state.assemblySlots.filter((fragment): fragment is FragmentId => fragment !== null)
  const possibleIdentity = identityForFragments(placed)

  return sceneFrame(`
    <main class="assembly-scene" aria-labelledby="scene-title">
      <section class="assembly-copy">
        <p class="eyebrow">DAWN / FINAL QUESTION</p>
        <h1 id="scene-title" tabindex="-1">Who are you?</h1>
        <p>처음 품은 말은 <strong>${escapeHtml(aspiration?.short ?? '')}</strong>이었습니다.<br />지나온 경험에서 두 조각을 골라 지금의 답을 완성하세요.</p>
      </section>

      <section class="word-workbench" aria-label="글자 조합 작업대">
        <div class="answer-slots" aria-label="선택한 두 글자">
          ${state.assemblySlots.map(slotMarkup).join('<span class="slot-plus" aria-hidden="true">+</span>')}
        </div>
        <div class="identity-preview ${possibleIdentity ? 'valid' : ''}" aria-live="polite">
          ${possibleIdentity ? `<span>지금의 대답</span><strong>${possibleIdentity.label}</strong>` : '<span>두 조각이 하나의 말이 되기를 기다립니다.</span>'}
        </div>
        <div class="fragment-bank" aria-label="모은 글자 조각">
          ${state.fragments.map(fragmentBankMarkup).join('')}
        </div>
        <p class="assembly-hint">글자를 누르거나 답 칸으로 끌어 놓으세요. 가능한 답은 용감한·다정한·자유로운 사람입니다.</p>
        <p class="feedback-line ${state.feedback.startsWith('두 글자') ? 'error' : ''}">${escapeHtml(state.feedback)}</p>
        <button class="primary-button" type="button" data-action="answer" ${possibleIdentity ? '' : 'disabled'}>
          이 말로 대답하기 <span aria-hidden="true">→</span>
        </button>
      </section>
    </main>`)
}

function slotMarkup(fragmentId: FragmentId | null, index: number) {
  const destination = destinations.find((item) => item.fragmentId === fragmentId)
  return `
    <button
      class="answer-slot ${fragmentId ? 'filled' : ''}"
      type="button"
      data-action="clear-slot"
      data-slot="${index}"
      aria-label="${fragmentId ? `${destination?.fragment ?? ''} 글자 제거` : `${index + 1}번째 빈 답 칸`}"
    >
      ${destination ? destination.fragment : '<span>?</span>'}
    </button>`
}

function fragmentBankMarkup(fragmentId: FragmentId) {
  const destination = destinations.find((item) => item.fragmentId === fragmentId)!
  const used = state.assemblySlots.includes(fragmentId)
  return `
    <button
      class="fragment-chip ${used ? 'used' : ''}"
      type="button"
      draggable="${!used}"
      data-action="place-fragment"
      data-fragment="${fragmentId}"
      style="--accent:${destination.accent}"
      aria-pressed="${used}"
      aria-label="${destination.fragment} 글자, ${escapeHtml(destination.memoryTitle)}"
    >
      <strong>${destination.fragment}</strong><span>${escapeHtml(destination.memoryTitle)}</span>
    </button>`
}

function endingScene() {
  const aspiration = aspirationById(state.aspiration)
  const identity = aspirationById(state.identity)
  const changed = aspiration?.id !== identity?.id
  const endingLead = changed
    ? `출발할 때는 ${aspiration?.short ?? ''} 사람이 되고 싶었습니다. 지금은 ${identity?.short ?? ''} 사람이라고 대답했습니다.`
    : `출발할 때 품은 말과 같은 ${identity?.short ?? ''} 사람을 골랐습니다. 하지만 그 말 안에는 이제 여섯 개의 경험이 함께 있습니다.`

  return sceneFrame(`
    <main class="ending-scene" aria-labelledby="scene-title">
      <div class="dawn-glow" aria-hidden="true"></div>
      <div class="ending-orbits" aria-hidden="true">
        ${destinations
          .map(
            (destination, index) =>
              `<span style="--i:${index};--accent:${destination.accent}">${destination.fragment}</span>`,
          )
          .join('')}
      </div>
      <section class="ending-copy">
        <p class="eyebrow">ARRIVAL / 05:47</p>
        <p class="ending-kicker">나는</p>
        <h1 id="scene-title" tabindex="-1">${escapeHtml(identity?.label ?? '')}</h1>
        <p class="ending-lead">${escapeHtml(endingLead)}</p>
        <blockquote>
          바라던 삶과 달라도 괜찮습니다.<br />
          그것도 당신의 삶이고,<br />
          그 삶은 가치가 있습니다.
        </blockquote>
        <div class="ending-record">
          <span>방문한 빛 <strong>${state.visited.length}</strong></span>
          <span>여정 <strong>${formatTime(state.elapsedSeconds)}</strong></span>
          <span>대답 <strong>${escapeHtml(identity?.short ?? '')}</strong></span>
        </div>
        <button class="primary-button light" type="button" data-action="restart" data-autofocus>
          다른 말로 다시 출발 <span aria-hidden="true">↻</span>
        </button>
      </section>
    </main>`)
}

function sceneFrame(content: string) {
  return `<div class="game-shell">${headerMarkup()}${content}</div>`
}

function fragmentMiniMarkup(fragmentId: FragmentId) {
  const destination = destinations.find((item) => item.fragmentId === fragmentId)!
  return `<span style="--accent:${destination.accent}" title="${escapeHtml(destination.memoryTitle)}">${destination.fragment}</span>`
}

function travelerSvg() {
  return `
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
    </svg>`
}

function soundOnIcon() {
  return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m4 9 4-3 4-3v18l-4-3H4z"/><path d="M16 8c1.4 1 2 2.2 2 4s-.6 3-2 4M19 5c2 1.8 3 4 3 7s-1 5.2-3 7"/></svg>'
}

function soundOffIcon() {
  return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m4 9 4-3 4-3v18l-4-3H4z"/><path d="m16 9 6 6m0-6-6 6"/></svg>'
}

function motionIcon() {
  return '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8"/><path d="M4 12h16M12 4c3 3 3 13 0 16M12 4c-3 3-3 13 0 16"/></svg>'
}

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = Math.floor(totalSeconds % 60)
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

function resetJourney() {
  const soundEnabled = state.soundEnabled
  const reducedMotion = state.reducedMotion
  state = createInitialState()
  state.soundEnabled = soundEnabled
  state.reducedMotion = reducedMotion
  heldKeys.clear()
  heldDirections.clear()
  render()
}

function startJourney() {
  if (!state.aspiration) return
  state.scene = 'flight'
  state.position = { x: 50, y: 57 }
  state.velocity = { x: 0, y: 0 }
  state.target = null
  state.startedAt = performance.now()
  state.elapsedSeconds = 0
  state.feedback = '별과 행성 가까이 유영해 방문하세요.'
  playTone('move')
  render()
}

function visitNearbyDestination() {
  if (!state.nearbyDestination || state.visited.includes(state.nearbyDestination)) {
    announce('아직 방문할 수 있는 빛이 가까이 없습니다.')
    playTone('error')
    return
  }
  state.currentDestination = state.nearbyDestination
  state.nearbyDestination = null
  state.velocity = { x: 0, y: 0 }
  state.target = null
  state.scene = 'memory'
  playTone('near')
  render()
}

function collectCurrentMemory() {
  const destination = destinationById(state.currentDestination)
  if (!destination) return
  if (!state.visited.includes(destination.id)) state.visited.push(destination.id)
  if (!state.fragments.includes(destination.fragmentId)) state.fragments.push(destination.fragmentId)
  state.feedback = `${destination.fragment} 조각을 품었습니다.`
  state.currentDestination = null
  playTone('collect')
  if (state.visited.length === destinations.length) {
    state.scene = 'assembly'
    state.assemblySlots = [null, null]
    state.feedback = '두 조각을 골라 지금의 답을 완성하세요.'
  } else {
    state.scene = 'flight'
  }
  render()
}

function placeFragment(fragmentId: FragmentId, preferredSlot?: number) {
  const existingSlot = state.assemblySlots.indexOf(fragmentId)
  if (existingSlot >= 0) {
    state.assemblySlots[existingSlot] = null
    state.feedback = '글자를 다시 조각 모음으로 돌려놓았습니다.'
    render(false)
    return
  }

  const emptySlot = preferredSlot ?? state.assemblySlots.findIndex((slot) => slot === null)
  if (emptySlot < 0 || emptySlot > 1) {
    state.feedback = '두 글자만 놓을 수 있습니다. 답 칸의 글자를 먼저 비워 주세요.'
    playTone('error')
    render(false)
    return
  }

  const replaced = state.assemblySlots[emptySlot]
  if (replaced) {
    const otherSlot = state.assemblySlots.indexOf(fragmentId)
    if (otherSlot >= 0) state.assemblySlots[otherSlot] = null
  }
  state.assemblySlots[emptySlot] = fragmentId
  const placed = state.assemblySlots.filter((fragment): fragment is FragmentId => fragment !== null)
  const identity = identityForFragments(placed)
  state.feedback = identity ? `${identity.label}이라는 답이 완성되었습니다.` : '한 조각을 더 골라 주세요.'
  playTone('place')
  render(false)
}

function submitIdentity() {
  const placed = state.assemblySlots.filter((fragment): fragment is FragmentId => fragment !== null)
  const identity = identityForFragments(placed)
  if (!identity) {
    state.feedback = '두 글자가 아직 하나의 답이 되지 않았습니다.'
    playTone('error')
    render(false)
    return
  }
  state.identity = identity.id
  state.scene = 'ending'
  state.elapsedSeconds = elapsedJourneySeconds()
  playTone('ending')
  render()
}

function elapsedJourneySeconds() {
  if (state.startedAt === null) return state.elapsedSeconds
  return Math.max(state.elapsedSeconds, (performance.now() - state.startedAt) / 1000)
}

function setCourse(destinationId: DestinationId) {
  const destination = destinations.find((item) => item.id === destinationId)
  if (!destination || state.visited.includes(destination.id)) {
    announce('이미 방문한 빛입니다.')
    return
  }
  state.target = { x: destination.x, y: destination.y }
  state.feedback = `${destination.name} 쪽으로 몸을 기울였습니다.`
  updateTargetMarker()
  announce(state.feedback)
}

function toggleSound() {
  state.soundEnabled = !state.soundEnabled
  if (state.soundEnabled) playTone('move')
  render(false)
}

function toggleMotion() {
  state.reducedMotion = !state.reducedMotion
  render(false)
  announce(state.reducedMotion ? '장식 움직임을 줄였습니다.' : '기본 움직임을 사용합니다.')
}

function render(shouldFocus = true) {
  window.cancelAnimationFrame(animationFrame)
  animationFrame = 0
  document.documentElement.dataset.reducedMotion = String(state.reducedMotion)

  let markup = ''
  if (state.scene === 'title') markup = `<div class="game-shell title-shell">${titleScene()}</div>`
  if (state.scene === 'choice') markup = choiceScene()
  if (state.scene === 'flight') markup = flightScene()
  if (state.scene === 'memory') markup = memoryScene()
  if (state.scene === 'assembly') markup = assemblyScene()
  if (state.scene === 'ending') markup = endingScene()
  app.innerHTML = markup

  if (state.scene === 'flight') {
    syncFlightDom()
    lastFrameTime = performance.now()
    animationFrame = window.requestAnimationFrame(flightTick)
  }

  if (shouldFocus) {
    window.requestAnimationFrame(() => {
      const focusTarget = app.querySelector<HTMLElement>('[data-autofocus], h1[tabindex="-1"]')
      focusTarget?.focus({ preventScroll: true })
    })
  }
}

function flightTick(time: number) {
  if (state.scene !== 'flight') return
  const delta = Math.min((time - lastFrameTime) / 1000, 0.05)
  lastFrameTime = time

  const input = movementInput()
  const keyboardOrPadActive = input.x !== 0 || input.y !== 0
  if (keyboardOrPadActive) state.target = null

  let desired = input
  if (!keyboardOrPadActive && state.target) {
    const dx = state.target.x - state.position.x
    const dy = state.target.y - state.position.y
    const distance = Math.hypot(dx, dy)
    if (distance < 1.5) {
      state.target = null
    } else {
      desired = { x: dx / distance, y: dy / distance }
    }
  }

  const magnitude = Math.hypot(desired.x, desired.y)
  if (magnitude > 1) {
    desired.x /= magnitude
    desired.y /= magnitude
  }

  const acceleration = state.reducedMotion ? 27 : 23
  const damping = Math.pow(state.reducedMotion ? 0.72 : 0.82, delta * 10)
  state.velocity.x = (state.velocity.x + desired.x * acceleration * delta) * damping
  state.velocity.y = (state.velocity.y + desired.y * acceleration * delta) * damping

  const speed = Math.hypot(state.velocity.x, state.velocity.y)
  const maxSpeed = state.reducedMotion ? 10.5 : 11.5
  if (speed > maxSpeed) {
    state.velocity.x = (state.velocity.x / speed) * maxSpeed
    state.velocity.y = (state.velocity.y / speed) * maxSpeed
  }

  state.position.x = clamp(state.position.x + state.velocity.x * delta, 4, 96)
  state.position.y = clamp(state.position.y + state.velocity.y * delta, 7, 91)
  if (state.position.x === 4 || state.position.x === 96) state.velocity.x *= -0.25
  if (state.position.y === 7 || state.position.y === 91) state.velocity.y *= -0.25

  state.elapsedSeconds = elapsedJourneySeconds()
  updateNearbyDestination()
  syncFlightDom()
  animationFrame = window.requestAnimationFrame(flightTick)
}

function movementInput(): Vector {
  const left = heldKeys.has('arrowleft') || heldKeys.has('a') || heldDirections.has('left')
  const right = heldKeys.has('arrowright') || heldKeys.has('d') || heldDirections.has('right')
  const up = heldKeys.has('arrowup') || heldKeys.has('w') || heldDirections.has('up')
  const down = heldKeys.has('arrowdown') || heldKeys.has('s') || heldDirections.has('down')
  return { x: Number(right) - Number(left), y: Number(down) - Number(up) }
}

function updateNearbyDestination() {
  let nearest: DestinationId | null = null
  let nearestDistance = Number.POSITIVE_INFINITY
  destinations.forEach((destination) => {
    if (state.visited.includes(destination.id)) return
    const distance = Math.hypot(destination.x - state.position.x, destination.y - state.position.y)
    if (distance < 7.2 && distance < nearestDistance) {
      nearest = destination.id
      nearestDistance = distance
    }
  })
  if (nearest !== state.nearbyDestination) {
    state.nearbyDestination = nearest
    if (nearest) {
      const destination = destinationById(nearest)
      announce(`${destination?.name ?? '빛'}에 도착했습니다. 방문 버튼이나 Enter를 누르세요.`)
      playTone('near')
    }
  }
}

function syncFlightDom() {
  const traveler = document.querySelector<HTMLElement>('#traveler')
  if (traveler) {
    traveler.style.left = `${state.position.x}%`
    traveler.style.top = `${state.position.y}%`
    const angle = Math.atan2(state.velocity.y, state.velocity.x) * (180 / Math.PI)
    traveler.style.setProperty('--flight-angle', `${Number.isFinite(angle) ? angle : 0}deg`)
    traveler.classList.toggle('moving', Math.hypot(state.velocity.x, state.velocity.y) > 0.5)
  }

  const elapsed = document.querySelector<HTMLElement>('#elapsed-time')
  if (elapsed) elapsed.textContent = formatTime(state.elapsedSeconds)

  const visitButton = document.querySelector<HTMLButtonElement>('#visit-button')
  const nearbyMessage = document.querySelector<HTMLElement>('#nearby-message')
  const destination = destinationById(state.nearbyDestination)
  if (visitButton) {
    visitButton.disabled = !destination
    visitButton.textContent = destination ? `${destination.name} 방문` : '가까운 빛 없음'
  }
  if (nearbyMessage) {
    nearbyMessage.textContent = destination
      ? `도착: ${destination.name}`
      : '빛 가까이 다가가면 방문할 수 있습니다.'
  }
  updateTargetMarker()
}

function updateTargetMarker() {
  const marker = document.querySelector<HTMLElement>('#target-marker')
  if (!marker) return
  if (!state.target) {
    marker.classList.remove('visible')
    return
  }
  marker.classList.add('visible')
  marker.style.left = `${state.target.x}%`
  marker.style.top = `${state.target.y}%`
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.max(minimum, Math.min(maximum, value))
}

app.addEventListener('click', (event) => {
  const control = (event.target as HTMLElement).closest<HTMLElement>('[data-action]')
  if (!control) return
  const action = control.dataset.action

  if (action === 'start') {
    state.scene = 'choice'
    state.feedback = '되고 싶은 말을 하나 골라 주세요.'
    render()
  }
  if (action === 'restart') resetJourney()
  if (action === 'toggle-sound') toggleSound()
  if (action === 'toggle-motion') toggleMotion()
  if (action === 'select-aspiration') {
    state.aspiration = control.dataset.aspiration as AspirationId
    const aspiration = aspirationById(state.aspiration)
    state.feedback = `${aspiration?.label ?? ''}이라는 말을 품었습니다.`
    playTone('place')
    render(false)
  }
  if (action === 'depart') startJourney()
  if (action === 'target-destination') setCourse(control.dataset.destination as DestinationId)
  if (action === 'visit') visitNearbyDestination()
  if (action === 'collect-memory') collectCurrentMemory()
  if (action === 'place-fragment') placeFragment(control.dataset.fragment as FragmentId)
  if (action === 'clear-slot') {
    const slotIndex = Number(control.dataset.slot)
    if (state.assemblySlots[slotIndex]) {
      state.assemblySlots[slotIndex] = null
      state.feedback = '답 칸을 비웠습니다.'
      render(false)
    }
  }
  if (action === 'answer') submitIdentity()
})

app.addEventListener('pointerdown', (event) => {
  const directionButton = (event.target as HTMLElement).closest<HTMLElement>('[data-direction]')
  if (directionButton) {
    event.preventDefault()
    directionButton.setPointerCapture(event.pointerId)
    heldDirections.add(directionButton.dataset.direction as Direction)
    state.target = null
    return
  }

  const map = (event.target as HTMLElement).closest<HTMLElement>('#space-map')
  if (!map || state.scene !== 'flight') return
  if ((event.target as HTMLElement).closest('button')) return
  event.preventDefault()
  map.setPointerCapture(event.pointerId)
  setPointerCourse(event, map)
})

app.addEventListener('pointermove', (event) => {
  const map = (event.target as HTMLElement).closest<HTMLElement>('#space-map')
  if (!map || state.scene !== 'flight' || !map.hasPointerCapture(event.pointerId)) return
  setPointerCourse(event, map)
})

function setPointerCourse(event: PointerEvent, map: HTMLElement) {
  const bounds = map.getBoundingClientRect()
  state.target = {
    x: clamp(((event.clientX - bounds.left) / bounds.width) * 100, 4, 96),
    y: clamp(((event.clientY - bounds.top) / bounds.height) * 100, 7, 91),
  }
  updateTargetMarker()
}

window.addEventListener('pointerup', (event) => {
  const directionButton = document.elementFromPoint(event.clientX, event.clientY)?.closest<HTMLElement>('[data-direction]')
  if (directionButton) heldDirections.delete(directionButton.dataset.direction as Direction)
  if (heldDirections.size > 0) heldDirections.clear()
})

window.addEventListener('pointercancel', () => heldDirections.clear())

window.addEventListener('keydown', (event) => {
  const key = event.key.toLowerCase()
  const movementKey = ['arrowleft', 'arrowright', 'arrowup', 'arrowdown', 'w', 'a', 's', 'd'].includes(key)
  if (state.scene === 'flight' && movementKey) {
    event.preventDefault()
    heldKeys.add(key)
    state.target = null
  }
  if (state.scene === 'flight' && (key === 'enter' || key === 'e') && !event.repeat) {
    event.preventDefault()
    visitNearbyDestination()
  }
})

window.addEventListener('keyup', (event) => heldKeys.delete(event.key.toLowerCase()))
window.addEventListener('blur', () => {
  heldKeys.clear()
  heldDirections.clear()
})

app.addEventListener('dragstart', (event) => {
  const fragment = (event.target as HTMLElement).closest<HTMLElement>('[data-fragment]')
  if (!fragment || fragment.classList.contains('used')) {
    event.preventDefault()
    return
  }
  draggedFragment = fragment.dataset.fragment as FragmentId
  event.dataTransfer?.setData('text/plain', draggedFragment)
  if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move'
})

app.addEventListener('dragover', (event) => {
  if ((event.target as HTMLElement).closest('[data-slot]')) event.preventDefault()
})

app.addEventListener('drop', (event) => {
  const slot = (event.target as HTMLElement).closest<HTMLElement>('[data-slot]')
  if (!slot || !draggedFragment) return
  event.preventDefault()
  placeFragment(draggedFragment, Number(slot.dataset.slot))
  draggedFragment = null
})

prefersReducedMotion.addEventListener('change', (event) => {
  if (state.reducedMotion !== event.matches) {
    state.reducedMotion = event.matches
    render(false)
  }
})

render()
