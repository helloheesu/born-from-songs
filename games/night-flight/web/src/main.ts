import './style.css'

type Scene = 'title' | 'flight' | 'ending'
type Direction = 'up' | 'down' | 'left' | 'right'
type Tone = 'start' | 'signal' | 'resonance' | 'collision' | 'phase' | 'ending'

interface Vector {
  x: number
  y: number
}

interface ColorContribution {
  id: string
  color: string
  amount: number
}

interface TrailPoint extends Vector {
  color: string
  alpha: number
}

interface Particle extends Vector {
  velocity: Vector
  color: string
  life: number
  size: number
}

interface SurfaceMark {
  angle: number
  color: string
  size: number
  alpha: number
}

interface OrbitalMessage {
  id: string
  text: string
  palette: string[]
}

interface CelestialBody {
  id: string
  name: string
  color: string
  position: Vector
  velocity: Vector
  radius: number
  mass: number
  spawnAt: number
  expireAt: number
  spawned: boolean
  departed: boolean
  met: boolean
  resonance: number
  stableSeconds: number
  longestResonance: number
  currentResonance: number
  trail: TrailPoint[]
  message: string
  palette: string[]
  messageReveal: number
  auraEntered: boolean
  collisionCooldown: number
  surfaceMarks: SurfaceMark[]
  gravityStrength: number
}

interface Player {
  position: Vector
  velocity: Vector
  radius: number
  trail: TrailPoint[]
  colors: ColorContribution[]
}

interface GameState {
  scene: Scene
  elapsed: number
  paused: boolean
  soundEnabled: boolean
  reducedMotion: boolean
  trajectoryEnabled: boolean
  player: Player
  bodies: CelestialBody[]
  particles: Particle[]
  harmonyScore: number
  phaseIndex: number
  finalColor: string
  introElapsed: number
  introComplete: boolean
  introStage: number
  hasThrusted: boolean
  endingStatus: 'ready' | 'saving' | 'saved' | 'skipped'
}

interface ViewTransform {
  scale: number
  offsetX: number
  offsetY: number
  width: number
  height: number
}

const WORLD = { width: 1200, height: 720 }
const LIFE_SECONDS = 90
const GRAVITY = 92_000
const GRAVITY_SOFTENING = 78
const RESONANCE_MIN_DISTANCE = 62
const RESONANCE_MAX_DISTANCE = 156
const RESONANCE_MAX_RELATIVE_SPEED = 74
const RESONANCE_LOCK_SECONDS = 1.15
const GRAVITY_MAX_ACCELERATION = 31
const AURA_DISTANCE = 235
const AURA_RADIAL_DRAG = 2.1
const INTRO_MAX_SECONDS = 11.5

const bodyBlueprints = [
  { id: 'signal-01', name: '익명의 궤도 01', position: { x: 890, y: 390 }, velocity: { x: -12, y: 8 }, radius: 29, mass: 1.25, spawnAt: 0, expireAt: 35 },
  { id: 'signal-02', name: '익명의 궤도 02', position: { x: 1270, y: 510 }, velocity: { x: -36, y: -5 }, radius: 36, mass: 1.7, spawnAt: 14, expireAt: 52 },
  { id: 'signal-03', name: '익명의 궤도 03', position: { x: 235, y: -75 }, velocity: { x: 8, y: 34 }, radius: 24, mass: 1.05, spawnAt: 28, expireAt: 67 },
  { id: 'signal-04', name: '익명의 궤도 04', position: { x: 1260, y: 102 }, velocity: { x: -34, y: 14 }, radius: 26, mass: 1.15, spawnAt: 42, expireAt: 77 },
  { id: 'signal-05', name: '익명의 궤도 05', position: { x: -68, y: 635 }, velocity: { x: 35, y: -12 }, radius: 33, mass: 1.5, spawnAt: 56, expireAt: 86 },
  { id: 'signal-06', name: '익명의 궤도 06', position: { x: 1010, y: 790 }, velocity: { x: -18, y: -33 }, radius: 20, mass: 0.9, spawnAt: 65, expireAt: 90 },
] as const

const seedMessages: OrbitalMessage[] = [
  { id: 'seed-01', text: '오늘은 조금 천천히 가도 괜찮아.', palette: ['#6489d6', '#9fb4e7'] },
  { id: 'seed-02', text: '잘 지냈냐는 말을 오래 생각했어.', palette: ['#df9655', '#e9bd86'] },
  { id: 'seed-03', text: '아직 여기 있어.', palette: ['#cf627c', '#e59aaa'] },
  { id: 'seed-04', text: '답이 없어도 기다려 볼게.', palette: ['#49b8ad', '#91d6ca'] },
  { id: 'seed-05', text: '네가 본 밤도 궁금해.', palette: ['#9274cf', '#c0ace4'] },
  { id: 'seed-06', text: '다음에는 웃으며 만나자.', palette: ['#d9ca72', '#ede2a7'] },
]

const app = document.querySelector<HTMLDivElement>('#app')!
const liveRegion = document.querySelector<HTMLDivElement>('#live-region')!
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

let availableMessages = [...seedMessages]
let messagesPromise: Promise<void> | null = null
let state = createState()
let canvas: HTMLCanvasElement | null = null
let context: CanvasRenderingContext2D | null = null
let animationFrame = 0
let lastFrameTime = 0
let pointerThrust: Vector | null = null
let pointerId: number | null = null
let braking = false
let audioContext: AudioContext | null = null
const heldKeys = new Set<string>()
const heldDirections = new Set<Direction>()
let hasPlayedOnce = false

const stars = Array.from({ length: 180 }, (_, index) => ({
  x: pseudoRandom(index * 3 + 1) * WORLD.width,
  y: pseudoRandom(index * 3 + 2) * WORLD.height,
  size: 0.45 + pseudoRandom(index * 3 + 3) * 1.45,
  alpha: 0.12 + pseudoRandom(index * 5 + 4) * 0.5,
}))

function createState(settings?: Pick<GameState, 'soundEnabled' | 'reducedMotion' | 'trajectoryEnabled'>): GameState {
  return {
    scene: 'title', elapsed: 0, paused: false,
    soundEnabled: settings?.soundEnabled ?? true,
    reducedMotion: settings?.reducedMotion ?? prefersReducedMotion.matches,
    trajectoryEnabled: settings?.trajectoryEnabled ?? true,
    player: { position: { x: WORLD.width * 0.5, y: WORLD.height * 0.52 }, velocity: { x: 0, y: 0 }, radius: 26, trail: [], colors: [] },
    bodies: bodyBlueprints.map((body, index) => {
      const message = availableMessages[index] ?? seedMessages[index]!
      return {
        ...body, color: mixedPaletteColor(message.palette), position: { ...body.position }, velocity: { ...body.velocity }, spawned: false,
        departed: false, met: false, resonance: 0, stableSeconds: 0, longestResonance: 0,
        currentResonance: 0, trail: [], message: message.text, palette: message.palette,
        messageReveal: 0, auraEntered: false, collisionCooldown: 0, surfaceMarks: [], gravityStrength: 0,
      }
    }),
    particles: [], harmonyScore: 0, phaseIndex: 0, finalColor: '#a4abb2',
    introElapsed: 0, introComplete: false, introStage: 0, hasThrusted: false, endingStatus: 'ready',
  }
}

function loadMessages() {
  if (messagesPromise) return messagesPromise
  messagesPromise = (async () => {
    const controller = new AbortController()
    const timeout = window.setTimeout(() => controller.abort(), 2600)
    try {
      const response = await fetch('/api/messages?limit=6', { headers: { Accept: 'application/json' }, signal: controller.signal })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const payload: unknown = await response.json()
      const source = Array.isArray(payload)
        ? payload
        : isRecord(payload) && Array.isArray(payload.messages)
          ? payload.messages
          : isRecord(payload) && Array.isArray(payload.data)
            ? payload.data
            : []
      const safeMessages = source.map((entry, index) => normalizeMessage(entry, index)).filter((entry): entry is OrbitalMessage => Boolean(entry))
      availableMessages = Array.from({ length: 6 }, (_, index) => safeMessages[index] ?? seedMessages[index]!)
    } catch {
      availableMessages = [...seedMessages]
    } finally {
      window.clearTimeout(timeout)
    }
  })()
  return messagesPromise
}

function normalizeMessage(value: unknown, index: number): OrbitalMessage | null {
  if (!isRecord(value)) return null
  const rawText = typeof value.text === 'string' ? value.text : typeof value.message === 'string' ? value.message : ''
  const text = rawText.replace(/\s+/g, ' ').trim().slice(0, 60)
  if (!text) return null
  const rawPalette = Array.isArray(value.palette) ? value.palette : Array.isArray(value.colors) ? value.colors : []
  const palette = rawPalette.filter((color): color is string => typeof color === 'string' && /^#[0-9a-f]{6}$/i.test(color)).slice(0, 4)
  if (typeof value.color === 'string' && /^#[0-9a-f]{6}$/i.test(value.color) && !palette.includes(value.color)) palette.unshift(value.color)
  const fallback = seedMessages[index % seedMessages.length]!
  return { id: typeof value.id === 'string' ? value.id : `remote-${index}`, text, palette: palette.length ? palette : fallback.palette }
}

function isRecord(value: unknown): value is Record<string, unknown> { return typeof value === 'object' && value !== null }

function render() {
  window.cancelAnimationFrame(animationFrame)
  animationFrame = 0
  document.documentElement.dataset.reducedMotion = String(state.reducedMotion)
  if (state.scene === 'title') {
    app.innerHTML = titleMarkup()
    canvas = null
    context = null
    focusPrimary()
    return
  }
  app.innerHTML = flightMarkup()
  canvas = document.querySelector<HTMLCanvasElement>('#orbit-canvas')
  context = canvas?.getContext('2d') ?? null
  resizeCanvas()
  lastFrameTime = performance.now()
  animationFrame = window.requestAnimationFrame(frame)
  focusPrimary()
}

function titleMarkup() {
  return `
    <main class="title-scene" aria-labelledby="scene-title">
      <div class="title-stars" aria-hidden="true"></div>
      <section class="title-copy">
        <h1 id="scene-title" tabindex="-1">야간비행</h1>
        <button class="primary-button" type="button" data-action="start" data-autofocus>출발 <span aria-hidden="true">→</span></button>
        <p class="title-meta">방향키/WASD · 드래그 · Space</p>
      </section>
      <div class="title-system" aria-hidden="true">
        <span class="title-body body-blue"></span><span class="title-body body-amber"></span><span class="title-body body-violet"></span>
        <span class="title-orbit orbit-a"></span><span class="title-orbit orbit-b"></span><span class="title-traveler"></span>
      </div>
      <div class="title-tools">
        ${toolButton('toggle-trajectory', state.trajectoryEnabled, '예상 항로', trajectoryIcon())}
        ${toolButton('toggle-motion', state.reducedMotion, '움직임 줄임', motionIcon())}
        ${toolButton('toggle-sound', state.soundEnabled, '소리', state.soundEnabled ? soundOnIcon() : soundOffIcon())}
      </div>
    </main>`
}

function flightMarkup() {
  return `
    <main class="flight-shell ${state.introComplete ? '' : 'is-intro'}" aria-label="야간비행 궤도 공명 프로토타입">
      <header class="game-header" aria-hidden="${!state.introComplete}" ${state.introComplete ? '' : 'inert'}>
        <button class="brand" type="button" data-action="home" aria-label="처음 화면으로 돌아가기"><span class="brand-mark" aria-hidden="true"></span><span>야간비행</span></button>
        <div class="life-readout" aria-label="생애 진행"><span id="phase-label">초기 궤도</span><div class="life-track"><span id="life-progress"></span></div><strong id="time-left">01:30</strong></div>
        <div class="header-tools">
          <button class="tool-button" type="button" data-action="pause" aria-pressed="false" aria-label="일시정지">${pauseIcon()}</button>
          <button class="tool-button" type="button" data-action="toggle-trajectory" aria-pressed="${state.trajectoryEnabled}" aria-label="예상 항로 ${state.trajectoryEnabled ? '켜짐' : '꺼짐'}">${trajectoryIcon()}</button>
          <button class="tool-button" type="button" data-action="toggle-sound" aria-pressed="${state.soundEnabled}" aria-label="소리 ${state.soundEnabled ? '켜짐' : '꺼짐'}">${state.soundEnabled ? soundOnIcon() : soundOffIcon()}</button>
        </div>
      </header>
      <section class="space-layout">
        <div class="canvas-frame" id="canvas-frame">
          <canvas id="orbit-canvas" tabindex="0" aria-label="움직이는 행성의 중력을 받아 유영하는 우주. 방향키나 WASD로 추진하고 Space로 감속합니다.">Canvas를 지원하는 브라우저가 필요합니다.</canvas>
          <div class="canvas-vignette" aria-hidden="true"></div>
          <div id="pause-overlay" class="pause-overlay" hidden><p>궤도가 멈췄습니다.</p><button class="primary-button" type="button" data-action="pause">계속 유영</button></div>
          <div id="ending-overlay" class="ending-overlay" hidden></div>
          <div id="intro-hint" class="intro-hint" aria-live="polite"><span class="intro-key">WASD</span><span id="intro-hint-text">방향키 · 드래그</span></div>
          <div class="canvas-hud top-left" aria-hidden="${!state.introComplete}"><span>나이</span><strong id="age-readout">18</strong></div>
          <div class="canvas-hud top-right" aria-hidden="${!state.introComplete}"><span>남은 궤도</span><strong id="active-readout">0</strong></div>
          <p class="canvas-caption">화면을 누른 채 방향을 바꾸면 그쪽으로 추진합니다.</p>
        </div>
        <aside class="flight-panel" aria-label="공명 상태와 조작" aria-hidden="${!state.introComplete}" ${state.introComplete ? '' : 'inert'}>
          <section class="panel-section identity-panel"><span class="panel-label">현재의 색</span><div id="color-core" class="color-core" aria-hidden="true"></div><div id="color-swatches" class="color-swatches"><span class="empty-color">아직 무채색</span></div></section>
          <section class="panel-section resonance-panel">
            <span class="panel-label">가장 가까운 궤도</span><strong id="target-name">아직 신호 없음</strong>
            <dl><div><dt>거리</dt><dd id="distance-readout">—</dd></div><div><dt>상대속도</dt><dd id="speed-readout">—</dd></div></dl>
            <div class="resonance-track" aria-label="공명 잠금 진행"><span id="resonance-progress"></span></div><p id="resonance-message">행성이 나타나면 접근 각도를 만드세요.</p>
          </section>
          <section class="panel-section record-panel"><span class="panel-label">남은 흔적</span><div class="record-grid"><div><strong id="met-readout">0</strong><span>만난 궤도</span></div><div><strong id="longest-readout">0.0</strong><span>가장 긴 공명</span></div></div></section>
          <section class="panel-section controls-panel"><span class="panel-label">추진 조작</span><div class="dpad" aria-label="화면 방향키"><button type="button" class="dpad-button up" data-direction="up" aria-label="위로 추진">↑</button><button type="button" class="dpad-button left" data-direction="left" aria-label="왼쪽으로 추진">←</button><button type="button" class="dpad-button brake" data-brake aria-label="감속">◎</button><button type="button" class="dpad-button right" data-direction="right" aria-label="오른쪽으로 추진">→</button><button type="button" class="dpad-button down" data-direction="down" aria-label="아래로 추진">↓</button></div><p>방향키/WASD · Space 감속</p></section>
        </aside>
      </section>
    </main>`
}

async function startGame(skipIntro = false) {
  await loadMessages()
  const settings = { soundEnabled: state.soundEnabled, reducedMotion: state.reducedMotion, trajectoryEnabled: state.trajectoryEnabled }
  state = createState(settings)
  state.scene = 'flight'
  state.introComplete = skipIntro || hasPlayedOnce
  state.introStage = state.introComplete ? 3 : 0
  heldKeys.clear(); heldDirections.clear(); pointerThrust = null; braking = false
  playTone('start')
  render()
  announce(state.introComplete ? '방향키나 드래그로 추진하세요.' : '방향키, WASD 또는 드래그로 추진하세요.')
}

function frame(time: number) {
  if (!context || !canvas || state.scene === 'title') return
  const delta = Math.min((time - lastFrameTime) / 1000, 0.035)
  lastFrameTime = time
  if (!state.paused && state.scene === 'flight') update(delta)
  if (state.scene === 'ending') updateParticles(delta)
  draw(); updateHud()
  animationFrame = window.requestAnimationFrame(frame)
}

function update(delta: number) {
  if (state.introComplete) state.elapsed = Math.min(LIFE_SECONDS, state.elapsed + delta)
  else state.introElapsed = Math.min(INTRO_MAX_SECONDS, state.introElapsed + delta)
  updatePhase(); updateBodies(delta); updatePlayer(delta); updateResonance(delta); updateParticles(delta); addTrailPoints()
  updateIntro()
  if (state.elapsed >= LIFE_SECONDS) finishGame()
}

function updateBodies(delta: number) {
  for (const [index, body] of state.bodies.entries()) {
    const canSpawn = state.introComplete ? state.elapsed >= body.spawnAt : index === 0
    if (!body.spawned && canSpawn) {
      body.spawned = true
      announce(`${body.name}의 신호가 우주에 들어왔습니다.`)
      playTone('signal')
    }
    if (!body.spawned || body.departed) continue
    body.collisionCooldown = Math.max(0, body.collisionCooldown - delta)
    if (state.introComplete && state.elapsed >= body.expireAt && body.resonance < 0.15) { body.departed = true; continue }
    const influence = gravityAcceleration(body.position, state.player.position, playerGravityMass() * 0.11)
    body.velocity.x += influence.x * delta; body.velocity.y += influence.y * delta
    body.position.x += body.velocity.x * delta; body.position.y += body.velocity.y * delta
  }
}

function updatePlayer(delta: number) {
  const player = state.player
  const gravity = { x: 0, y: 0 }
  for (const body of activeBodies()) {
    const acceleration = gravityAcceleration(player.position, body.position, body.mass)
    body.gravityStrength = magnitude(acceleration)
    gravity.x += acceleration.x; gravity.y += acceleration.y
  }
  const input = inputVector(); const thrust = thrustForAge()
  if (magnitude(input) > 0.05) state.hasThrusted = true
  player.velocity.x += (gravity.x + input.x * thrust) * delta
  player.velocity.y += (gravity.y + input.y * thrust) * delta
  for (const body of activeBodies()) applyAuraRadialDrag(player, body, delta)
  if (braking) {
    const damping = Math.exp(-2.35 * delta)
    player.velocity.x *= damping; player.velocity.y *= damping
  }
  const speed = magnitude(player.velocity); const maxSpeed = 205
  if (speed > maxSpeed) { player.velocity.x = (player.velocity.x / speed) * maxSpeed; player.velocity.y = (player.velocity.y / speed) * maxSpeed }
  player.position.x += player.velocity.x * delta; player.position.y += player.velocity.y * delta
  containPlayer(player)
}

function applyAuraRadialDrag(player: Pick<Player, 'position' | 'velocity'>, body: CelestialBody, delta: number) {
  const centerDistance = distanceBetween(player.position, body.position)
  const auraRadius = body.radius + AURA_DISTANCE
  if (centerDistance >= auraRadius || centerDistance < 0.001) return
  const outward = normalize({ x: player.position.x - body.position.x, y: player.position.y - body.position.y })
  const relativeVelocity = { x: player.velocity.x - body.velocity.x, y: player.velocity.y - body.velocity.y }
  const inwardRadialSpeed = dot(relativeVelocity, outward)
  if (inwardRadialSpeed >= 0) return
  const depth = clamp((auraRadius - centerDistance) / AURA_DISTANCE, 0, 1)
  const retention = Math.exp(-AURA_RADIAL_DRAG * depth * depth * delta)
  const radialChange = inwardRadialSpeed * (retention - 1)
  player.velocity.x += outward.x * radialChange
  player.velocity.y += outward.y * radialChange
}

function updateIntro() {
  if (state.introComplete) return
  const firstBody = state.bodies[0]
  if (state.hasThrusted) state.introStage = Math.max(state.introStage, 1)
  if (firstBody?.auraEntered) state.introStage = Math.max(state.introStage, 2)
  if (firstBody?.met || state.introElapsed >= INTRO_MAX_SECONDS) {
    state.introComplete = true
    state.introStage = 3
    hasPlayedOnce = true
    document.querySelector('.flight-shell')?.classList.remove('is-intro')
    document.querySelectorAll('.game-header, .flight-panel, .canvas-hud').forEach((element) => { element.removeAttribute('aria-hidden'); element.removeAttribute('inert') })
    window.requestAnimationFrame(resizeCanvas)
    playTone('resonance')
    announce('비행 시간이 시작됩니다.')
  }
}

function updateResonance(delta: number) {
  const player = state.player
  for (const body of activeBodies()) {
    const distance = distanceBetween(player.position, body.position)
    const surfaceDistance = distance - body.radius
    const relativeSpeed = magnitude({ x: player.velocity.x - body.velocity.x, y: player.velocity.y - body.velocity.y })
    if (surfaceDistance <= AURA_DISTANCE) {
      if (!body.auraEntered) {
        body.auraEntered = true
        announce(`${body.name}의 메시지 일부가 보입니다.`)
      }
      const auraDepth = clamp((AURA_DISTANCE - surfaceDistance) / AURA_DISTANCE, 0, 1)
      body.messageReveal = Math.max(body.messageReveal, 0.18 + auraDepth * 0.24)
    } else if (!body.met) {
      body.messageReveal = Math.max(0, body.messageReveal - delta * 0.6)
    }
    const inBand = distance >= body.radius + RESONANCE_MIN_DISTANCE && distance <= body.radius + RESONANCE_MAX_DISTANCE
    if (inBand && relativeSpeed <= RESONANCE_MAX_RELATIVE_SPEED) body.resonance = Math.min(1, body.resonance + delta / RESONANCE_LOCK_SECONDS)
    else {
      body.resonance = Math.max(0, body.resonance - delta * 0.72)
      if (body.resonance < 0.82) body.currentResonance = 0
    }
    if (body.resonance >= 0.82) {
      if (!body.met) {
        body.met = true
        body.messageReveal = 1
        announce(`${body.name}과 궤도가 맞았습니다. 메시지가 모두 보입니다.`)
        playTone('resonance')
      }
      body.currentResonance += delta; body.stableSeconds += delta
      body.longestResonance = Math.max(body.longestResonance, body.currentResonance)
      state.harmonyScore += delta * Math.max(0.2, 1 - relativeSpeed / RESONANCE_MAX_RELATIVE_SPEED)
      addColor(body, delta); emitResonanceParticles(body, delta)
    }
    if (distance <= body.radius + player.radius) resolveCollision(body)
  }
}

function resolveCollision(body: CelestialBody) {
  const player = state.player
  const normal = normalize({ x: player.position.x - body.position.x, y: player.position.y - body.position.y })
  const safeNormal = magnitude(normal) < 0.01 ? { x: 1, y: 0 } : normal
  const contactDistance = body.radius + player.radius
  player.position.x = body.position.x + safeNormal.x * contactDistance
  player.position.y = body.position.y + safeNormal.y * contactDistance

  const relativeVelocity = { x: player.velocity.x - body.velocity.x, y: player.velocity.y - body.velocity.y }
  const radialSpeed = dot(relativeVelocity, safeNormal)
  if (radialSpeed >= 0) return
  const tangentialVelocity = {
    x: relativeVelocity.x - safeNormal.x * radialSpeed,
    y: relativeVelocity.y - safeNormal.y * radialSpeed,
  }
  const impactSpeed = Math.max(0, -radialSpeed)
  const reboundSpeed = impactSpeed * 0.055
  player.velocity.x = body.velocity.x + tangentialVelocity.x * 0.88 + safeNormal.x * reboundSpeed
  player.velocity.y = body.velocity.y + tangentialVelocity.y * 0.88 + safeNormal.y * reboundSpeed
  body.resonance = Math.min(body.resonance, 0.18)
  body.currentResonance = 0

  if (body.collisionCooldown > 0) return
  body.collisionCooldown = 1.15
  const lossRatio = clamp(0.05 + Math.max(0, impactSpeed - 22) / 145 * 0.07, 0.05, 0.12)
  const collisionColors = state.player.colors.length
    ? state.player.colors.map((color) => color.color)
    : ['#a4abb2']
  for (const contribution of state.player.colors) contribution.amount = Math.max(0, contribution.amount * (1 - lossRatio))
  state.player.colors = state.player.colors.filter((contribution) => contribution.amount > 0.015)
  state.finalColor = mixedPlayerColor()
  const markColor = collisionColors[Math.floor(Math.random() * collisionColors.length)] ?? '#a4abb2'
  body.surfaceMarks.push({ angle: Math.atan2(safeNormal.y, safeNormal.x), color: markColor, size: 0.12 + lossRatio * 1.8, alpha: 0.82 })
  if (body.surfaceMarks.length > 12) body.surfaceMarks.shift()
  emitCollisionParticles(body, safeNormal, collisionColors, impactSpeed)
  playTone('collision')
  announce(`충돌로 색의 ${Math.round(lossRatio * 100)}퍼센트가 흩어졌습니다.`)
}

function emitCollisionParticles(body: CelestialBody, normal: Vector, colors: string[], impactSpeed: number) {
  const count = state.reducedMotion ? 12 : 30
  const contact = { x: body.position.x + normal.x * body.radius, y: body.position.y + normal.y * body.radius }
  for (let index = 0; index < count; index += 1) {
    const spread = (Math.random() - 0.5) * 1.8
    const tangent = { x: -normal.y, y: normal.x }
    const speed = 18 + Math.random() * Math.max(28, impactSpeed * 0.75)
    state.particles.push({
      x: contact.x, y: contact.y,
      velocity: { x: normal.x * speed + tangent.x * spread * speed, y: normal.y * speed + tangent.y * spread * speed },
      color: colors[index % colors.length] ?? '#a4abb2', life: 0.8 + Math.random() * 1.4, size: 1.2 + Math.random() * 2.8,
    })
  }
}

function addColor(body: CelestialBody, delta: number) {
  const colors = body.palette.length ? body.palette : [body.color]
  for (const [index, color] of colors.entries()) {
    const id = `${body.id}:${index}`
    let contribution = state.player.colors.find((item) => item.id === id)
    if (!contribution) { contribution = { id, color, amount: 0 }; state.player.colors.push(contribution) }
    contribution.amount = Math.min(1, contribution.amount + delta * 0.11 / colors.length)
  }
  state.finalColor = mixedPlayerColor()
}

function emitResonanceParticles(body: CelestialBody, delta: number) {
  if (Math.random() > (state.reducedMotion ? 4 : 15) * delta) return
  const progress = Math.random(); const start = state.player.position; const end = body.position
  state.particles.push({
    x: start.x + (end.x - start.x) * progress, y: start.y + (end.y - start.y) * progress,
    velocity: { x: (Math.random() - 0.5) * 12, y: (Math.random() - 0.5) * 12 },
    color: Math.random() > 0.28 ? body.color : mixedPlayerColor(), life: 0.65 + Math.random() * 0.65, size: 1.4 + Math.random() * 2.2,
  })
}

function updateParticles(delta: number) {
  for (const particle of state.particles) {
    particle.x += particle.velocity.x * delta; particle.y += particle.velocity.y * delta
    particle.velocity.x *= Math.exp(-0.18 * delta); particle.velocity.y *= Math.exp(-0.18 * delta); particle.life -= delta
  }
  state.particles = state.particles.filter((particle) => particle.life > 0)
}

function addTrailPoints() {
  const maxTrail = state.reducedMotion ? 46 : 125
  appendTrail(state.player.trail, state.player.position, mixedPlayerColor(), maxTrail)
  for (const body of activeBodies()) appendTrail(body.trail, body.position, body.color, 70)
}

function appendTrail(trail: TrailPoint[], position: Vector, color: string, maxLength: number) {
  const last = trail.at(-1)
  if (last && distanceBetween(last, position) < 4.5) return
  trail.push({ x: position.x, y: position.y, color, alpha: 1 })
  if (trail.length > maxLength) trail.splice(0, trail.length - maxLength)
}

function finishGame() {
  if (state.scene !== 'flight') return
  state.scene = 'ending'; state.paused = false
  createDissolution(); playTone('ending')
  announce('비행이 종료되었습니다. 익명 메시지를 남기거나 건너뛸 수 있습니다.')
  const met = state.bodies.filter((body) => body.met)
  const longest = Math.max(0, ...state.bodies.map((body) => body.longestResonance))
  const overlay = document.querySelector<HTMLElement>('#ending-overlay')
  if (overlay) {
    overlay.hidden = false
    const palette = finalPalette()
    const paletteGradient = palette.length > 1 ? `linear-gradient(135deg, ${palette.join(', ')})` : palette[0] ?? '#a4abb2'
    overlay.setAttribute('role', 'dialog')
    overlay.setAttribute('aria-modal', 'true')
    overlay.setAttribute('aria-labelledby', 'ending-title')
    overlay.innerHTML = `<div class="ending-card" style="--final-color:${state.finalColor};--final-palette:${paletteGradient}"><p class="eyebrow">FLIGHT COMPLETE / AGE 80</p><span class="ending-color" aria-hidden="true"></span><h1 id="ending-title" tabindex="-1">비행 종료</h1><div class="ending-record"><span><strong>${met.length}</strong> 만난 궤도</span><span><strong>${longest.toFixed(1)}초</strong> 가장 긴 공명</span><span><strong>${state.player.colors.length}</strong> 남은 색</span></div><form class="message-form" id="message-form"><label for="ending-message">익명 메시지 <span>선택 · 최대 60자</span></label><textarea id="ending-message" name="message" rows="3" placeholder="" autocomplete="off"></textarea><div class="message-meta"><span id="message-error" role="alert"></span><span id="message-count">0 / 60</span></div><div class="ending-actions"><button class="primary-button" type="submit" data-action="leave-message">궤도에 남기기</button><button class="quiet-button" type="button" data-action="skip-message">말없이 떠나기</button></div></form></div>`
    document.querySelectorAll<HTMLElement>('.game-header, .flight-panel, #orbit-canvas').forEach((element) => { element.inert = true })
    window.requestAnimationFrame(() => overlay.querySelector<HTMLElement>('h1')?.focus({ preventScroll: true }))
  }
}

function finalPalette() {
  const sorted = [...state.player.colors].sort((first, second) => second.amount - first.amount)
  return sorted.length ? sorted.slice(0, 4).map((entry) => entry.color) : ['#a4abb2', '#d5dade']
}

async function submitEndingMessage() {
  if (state.scene !== 'ending' || state.endingStatus === 'saving') return
  const textarea = document.querySelector<HTMLTextAreaElement>('#ending-message')
  const button = document.querySelector<HTMLButtonElement>('[data-action="leave-message"]')
  const error = document.querySelector<HTMLElement>('#message-error')
  const text = textarea?.value.replace(/\s+/g, ' ').trim() ?? ''
  if (!text) { setEndingError('메시지를 입력하거나 말없이 떠나기를 선택하세요.'); textarea?.focus(); return }
  if (characterCount(text) > 60) { setEndingError('60자 이내로 입력하세요.'); textarea?.focus(); return }
  if (/https?:\/\/|www\.|[@][\w.-]+|\b\d{2,3}[- .]\d{3,4}[- .]\d{4}\b/i.test(text)) { setEndingError('링크나 연락처는 남길 수 없습니다.'); textarea?.focus(); return }
  if (containsBlockedLanguage(text)) { setEndingError('다른 표현으로 바꿔 주세요.'); textarea?.focus(); return }

  state.endingStatus = 'saving'
  if (button) { button.disabled = true; button.textContent = '남기는 중…' }
  if (error) error.textContent = ''
  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), 5200)
  try {
    const response = await fetch('/api/messages', {
      method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, signal: controller.signal,
      body: JSON.stringify({ message: text, palette: finalPalette(), clientToken: getClientToken() }),
    })
    if (!response.ok) {
      const payload: unknown = await response.json().catch(() => null)
      const serverMessage = isRecord(payload) && typeof payload.error === 'string' ? payload.error : ''
      throw new Error(serverMessage || `HTTP ${response.status}`)
    }
    const savedPayload: unknown = await response.json().catch(() => null)
    const savedMessagePayload = isRecord(savedPayload) && isRecord(savedPayload.message)
      ? savedPayload.message
      : savedPayload
    const savedMessage = normalizeMessage(savedMessagePayload, 0)
    if (savedMessage) availableMessages = [savedMessage, ...availableMessages.filter((entry) => entry.id !== savedMessage.id)].slice(0, 6)
    messagesPromise = null
    state.endingStatus = 'saved'
    showEndingCompletion('메시지를 남겼습니다.')
    announce('메시지를 궤도에 남겼습니다.')
  } catch (cause) {
    state.endingStatus = 'ready'
    if (button) { button.disabled = false; button.textContent = '궤도에 남기기' }
    const detail = cause instanceof Error && cause.message && !cause.message.startsWith('HTTP') ? cause.message : '저장하지 못했습니다. 잠시 후 다시 시도하세요.'
    setEndingError(detail)
  } finally {
    window.clearTimeout(timeout)
  }
}

function containsBlockedLanguage(text: string) {
  return /(씨발|시발|개새끼|병신|fuck|shit|bitch)/i.test(text.replace(/\s+/g, ''))
}

function getClientToken() {
  const storageKey = 'night-flight-client-token'
  try {
    const existing = window.localStorage.getItem(storageKey)
    if (existing && /^[0-9a-f-]{16,}$/i.test(existing)) return existing
    const token = typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `${Date.now().toString(16)}-${Math.random().toString(16).slice(2)}-${Math.random().toString(16).slice(2)}`
    window.localStorage.setItem(storageKey, token)
    return token
  } catch {
    return typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`
  }
}

function setEndingError(message: string) { const error = document.querySelector<HTMLElement>('#message-error'); if (error) error.textContent = message }

function showEndingCompletion(status: string) {
  const form = document.querySelector<HTMLFormElement>('#message-form')
  if (!form) return
  form.innerHTML = `<p class="message-complete" role="status">${status}</p><div class="ending-actions"><button class="primary-button" type="button" data-action="restart" data-autofocus>다시 출발</button><button class="quiet-button" type="button" data-action="home">처음 화면</button></div>`
  window.requestAnimationFrame(() => form.querySelector<HTMLElement>('[data-autofocus]')?.focus())
}

function createDissolution() {
  const count = state.reducedMotion ? 70 : 230
  const colors = state.player.colors.length ? state.player.colors : [{ id: 'gray', color: '#a4abb2', amount: 1 }]
  for (let index = 0; index < count; index += 1) {
    const angle = Math.random() * Math.PI * 2; const speed = 24 + Math.random() * 120
    const color = colors[index % colors.length]?.color ?? '#a4abb2'
    state.particles.push({ x: state.player.position.x + Math.cos(angle) * Math.random() * 12, y: state.player.position.y + Math.sin(angle) * Math.random() * 12, velocity: { x: Math.cos(angle) * speed + state.player.velocity.x * 0.18, y: Math.sin(angle) * speed + state.player.velocity.y * 0.18 }, color, life: 2.2 + Math.random() * 4, size: 1.2 + Math.random() * 3.5 })
  }
}

function updatePhase() {
  const ratio = state.elapsed / LIFE_SECONDS
  const nextPhase = ratio < 0.32 ? 0 : ratio < 0.64 ? 1 : ratio < 0.84 ? 2 : 3
  if (nextPhase !== state.phaseIndex) {
    state.phaseIndex = nextPhase
    const messages = ['초기 궤도', '중간 생애. 움직임에 조금 더 긴 시간이 필요합니다.', '늦은 생애. 새 신호가 줄어듭니다.', '소멸기. 이제 새 행성은 오지 않습니다.']
    announce(messages[nextPhase] ?? ''); playTone('phase')
  }
}

function draw() {
  if (!context || !canvas) return
  const view = viewTransform(); const ctx = context
  ctx.clearRect(0, 0, view.width, view.height); ctx.save(); ctx.translate(view.offsetX, view.offsetY); ctx.scale(view.scale, view.scale)
  drawSpace(ctx); drawGravityFields(ctx); drawTrails(ctx)
  if (state.trajectoryEnabled && state.scene === 'flight') drawPredictedTrajectory(ctx)
  drawBodies(ctx); drawParticles(ctx)
  if (state.scene === 'flight') drawPlayer(ctx)
  drawAgingVignette(ctx); ctx.restore()
}

function drawGravityFields(ctx: CanvasRenderingContext2D) {
  for (const body of activeBodies()) {
    const playerDistance = distanceBetween(state.player.position, body.position)
    const distanceFactor = clamp(1 - (playerDistance - body.radius) / (AURA_DISTANCE * 1.45), 0, 1)
    const gravityFactor = clamp(body.gravityStrength / GRAVITY_MAX_ACCELERATION, 0, 1)
    const intensity = clamp(distanceFactor * 0.65 + gravityFactor * 0.75, 0.05, 1)
    const streakCount = state.reducedMotion ? 8 : 20
    ctx.save(); ctx.translate(body.position.x, body.position.y)
    for (let index = 0; index < streakCount; index += 1) {
      const seed = index + body.id.charCodeAt(body.id.length - 1) * 7
      const angle = pseudoRandom(seed * 5.17) * Math.PI * 2 + state.elapsed * (0.012 + body.mass * 0.003)
      const radius = body.radius + 42 + pseudoRandom(seed * 2.71) * (AURA_DISTANCE - 36)
      const length = 6 + intensity * 20 + pseudoRandom(seed * 8.3) * 10
      const curve = (0.08 + intensity * 0.22) * (index % 2 ? 1 : -1)
      const start = { x: Math.cos(angle) * radius, y: Math.sin(angle) * radius }
      const endRadius = Math.max(body.radius + 8, radius - length)
      const end = { x: Math.cos(angle + curve) * endRadius, y: Math.sin(angle + curve) * endRadius }
      const controlRadius = (radius + endRadius) * 0.5
      const control = { x: Math.cos(angle + curve * 0.35) * controlRadius, y: Math.sin(angle + curve * 0.35) * controlRadius }
      ctx.globalAlpha = (0.04 + intensity * 0.24) * (0.45 + pseudoRandom(seed * 3.9) * 0.55)
      ctx.strokeStyle = body.color; ctx.lineWidth = 0.55 + intensity * 0.9
      ctx.beginPath(); ctx.moveTo(start.x, start.y); ctx.quadraticCurveTo(control.x, control.y, end.x, end.y); ctx.stroke()
      ctx.globalAlpha *= 1.4; ctx.fillStyle = body.color; ctx.beginPath(); ctx.arc(end.x, end.y, 0.7 + intensity * 0.9, 0, Math.PI * 2); ctx.fill()
    }
    ctx.restore()
  }
  ctx.globalAlpha = 1
}

function drawSpace(ctx: CanvasRenderingContext2D) {
  const gradient = ctx.createRadialGradient(580, 350, 40, 580, 350, 760); const age = state.elapsed / LIFE_SECONDS
  gradient.addColorStop(0, `rgba(17, 23, 35, ${0.34 - age * 0.12})`); gradient.addColorStop(0.55, '#05070d'); gradient.addColorStop(1, '#010206')
  ctx.fillStyle = gradient; ctx.fillRect(0, 0, WORLD.width, WORLD.height)
  for (const star of stars) {
    const lateFade = 1 - Math.max(0, age - 0.7) * 1.7
    ctx.globalAlpha = star.alpha * lateFade; ctx.fillStyle = '#d8e0e7'; ctx.beginPath(); ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2); ctx.fill()
  }
  ctx.globalAlpha = 1
}

function drawTrails(ctx: CanvasRenderingContext2D) {
  drawTrail(ctx, state.player.trail, 2.4)
  for (const body of activeBodies()) drawTrail(ctx, body.trail, 1.15)
}

function drawTrail(ctx: CanvasRenderingContext2D, trail: TrailPoint[], width: number) {
  if (trail.length < 2) return
  for (let index = 1; index < trail.length; index += 1) {
    const previous = trail[index - 1]; const point = trail[index]
    if (!previous || !point) continue
    ctx.globalAlpha = (index / trail.length) * 0.55 * point.alpha; ctx.strokeStyle = point.color; ctx.lineWidth = width
    ctx.beginPath(); ctx.moveTo(previous.x, previous.y); ctx.lineTo(point.x, point.y); ctx.stroke()
  }
  ctx.globalAlpha = 1
}

function drawPredictedTrajectory(ctx: CanvasRenderingContext2D) {
  const simulated = { position: { ...state.player.position }, velocity: { ...state.player.velocity } }
  const strongestGravity = Math.max(0, ...activeBodies().map((body) => body.gravityStrength))
  const bendVisibility = clamp(strongestGravity / GRAVITY_MAX_ACCELERATION, 0, 1)
  ctx.save(); ctx.shadowBlur = 5 + bendVisibility * 15; ctx.shadowColor = `rgba(170, 205, 232, ${0.12 + bendVisibility * 0.3})`; ctx.setLineDash([4, 9 - bendVisibility * 3]); ctx.strokeStyle = `rgba(194, 216, 232, ${0.2 + bendVisibility * 0.5})`; ctx.lineWidth = 1.1 + bendVisibility * 1.1; ctx.beginPath(); ctx.moveTo(simulated.position.x, simulated.position.y)
  for (let step = 0; step < 48; step += 1) {
    const dt = 0.065
    for (const body of activeBodies()) {
      const acceleration = gravityAcceleration(simulated.position, body.position, body.mass)
      simulated.velocity.x += acceleration.x * dt; simulated.velocity.y += acceleration.y * dt
      applyAuraRadialDrag(simulated, body, dt)
    }
    simulated.position.x += simulated.velocity.x * dt; simulated.position.y += simulated.velocity.y * dt; ctx.lineTo(simulated.position.x, simulated.position.y)
  }
  ctx.stroke(); ctx.restore()
}

function drawBodies(ctx: CanvasRenderingContext2D) {
  for (const body of activeBodies()) {
    const distance = distanceBetween(state.player.position, body.position); const surfaceDistance = distance - body.radius; const ringRadius = body.radius + RESONANCE_MIN_DISTANCE + 23
    const proximity = clamp(1 - surfaceDistance / AURA_DISTANCE, 0, 1)
    const gravityIntensity = clamp(body.gravityStrength / GRAVITY_MAX_ACCELERATION, 0, 1)
    const auraIntensity = clamp(proximity * 0.62 + gravityIntensity * 0.72, 0.04, 1)
    ctx.save(); ctx.translate(body.position.x, body.position.y)
    ctx.globalAlpha = clamp(body.resonance * 0.7 + auraIntensity * 0.38, 0.06, 0.92); ctx.strokeStyle = body.color; ctx.lineWidth = 0.8 + auraIntensity * 2.1 + body.resonance * 1.6; ctx.setLineDash(body.resonance > 0.82 ? [] : [3, 7]); ctx.beginPath(); ctx.arc(0, 0, ringRadius, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([])
    const auraRadius = body.radius + AURA_DISTANCE * (0.72 + auraIntensity * 0.12)
    const glow = ctx.createRadialGradient(0, 0, body.radius * 0.7, 0, 0, auraRadius)
    glow.addColorStop(0, colorWithAlpha(body.color, 0.38 + auraIntensity * 0.32)); glow.addColorStop(0.18, colorWithAlpha(body.color, 0.16 + auraIntensity * 0.2)); glow.addColorStop(0.56, colorWithAlpha(body.color, 0.025 + auraIntensity * 0.075)); glow.addColorStop(1, 'transparent')
    ctx.globalAlpha = 1; ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(0, 0, auraRadius, 0, Math.PI * 2); ctx.fill()
    ctx.globalAlpha = 0.12 + auraIntensity * 0.34; ctx.strokeStyle = body.color; ctx.lineWidth = 1 + auraIntensity * 2.8; ctx.beginPath(); ctx.arc(0, 0, body.radius + 9 + auraIntensity * 9, 0, Math.PI * 2); ctx.stroke()
    const bodyGradient = ctx.createRadialGradient(-body.radius * 0.35, -body.radius * 0.4, 2, 0, 0, body.radius)
    bodyGradient.addColorStop(0, '#e8edf2'); bodyGradient.addColorStop(0.17, body.color); bodyGradient.addColorStop(1, '#111522')
    ctx.globalAlpha = 1; ctx.fillStyle = bodyGradient; ctx.beginPath(); ctx.arc(0, 0, body.radius, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = body.color; ctx.globalAlpha = 0.55; ctx.lineWidth = 1; ctx.stroke()
    drawBodyPalette(ctx, body)
    drawSurfaceMarks(ctx, body)
    if (body.messageReveal > 0) drawBodyMessage(ctx, body)
    ctx.restore()
  }
}

function drawBodyPalette(ctx: CanvasRenderingContext2D, body: CelestialBody) {
  if (body.palette.length < 2) return
  const gradient = ctx.createLinearGradient(-body.radius, -body.radius, body.radius, body.radius)
  body.palette.forEach((color, index) => {
    const start = index / body.palette.length
    const end = (index + 1) / body.palette.length
    gradient.addColorStop(start, color)
    gradient.addColorStop(Math.min(1, end), color)
  })
  ctx.save(); ctx.beginPath(); ctx.arc(0, 0, body.radius - 1, 0, Math.PI * 2); ctx.clip()
  ctx.globalAlpha = 0.34; ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = gradient
  ctx.fillRect(-body.radius, -body.radius, body.radius * 2, body.radius * 2)
  ctx.restore()
}

function drawSurfaceMarks(ctx: CanvasRenderingContext2D, body: CelestialBody) {
  ctx.save(); ctx.beginPath(); ctx.arc(0, 0, body.radius - 1, 0, Math.PI * 2); ctx.clip()
  for (const mark of body.surfaceMarks) {
    const distance = body.radius * 0.78; const x = Math.cos(mark.angle) * distance; const y = Math.sin(mark.angle) * distance
    ctx.globalAlpha = mark.alpha; ctx.fillStyle = mark.color; ctx.beginPath(); ctx.ellipse(x, y, body.radius * mark.size, body.radius * mark.size * 0.58, mark.angle, 0, Math.PI * 2); ctx.fill()
  }
  ctx.restore()
}

function drawBodyMessage(ctx: CanvasRenderingContext2D, body: CelestialBody) {
  const visibleCharacters = body.met ? body.message.length : Math.max(2, Math.ceil(body.message.length * Math.min(0.46, body.messageReveal)))
  const visibleText = body.met || visibleCharacters >= body.message.length ? body.message : `${body.message.slice(0, visibleCharacters)}…`
  const y = body.radius + RESONANCE_MAX_DISTANCE + 26
  ctx.globalAlpha = clamp(0.18 + body.messageReveal * 0.82, 0.18, 1)
  ctx.font = `${body.met ? 600 : 500} 14px system-ui, sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
  const width = Math.min(310, ctx.measureText(visibleText).width + 28)
  ctx.fillStyle = 'rgba(2, 4, 10, 0.78)'; roundRectPath(ctx, -width / 2, y - 17, width, 34, 8); ctx.fill()
  ctx.strokeStyle = colorWithAlpha(body.color, 0.16 + body.messageReveal * 0.38); ctx.lineWidth = 1; ctx.stroke()
  ctx.fillStyle = body.met ? '#e1e7ec' : '#8e99a3'; ctx.fillText(visibleText, 0, y)
}

function drawPlayer(ctx: CanvasRenderingContext2D) {
  const player = state.player; ctx.save(); ctx.translate(player.position.x, player.position.y)
  const angle = Math.atan2(player.velocity.y, player.velocity.x); ctx.rotate((Number.isFinite(angle) ? angle : 0) + Math.PI / 2)
  if (magnitude(inputVector()) > 0.05) {
    const flame = ctx.createLinearGradient(0, 48, 0, 15); flame.addColorStop(0, 'transparent'); flame.addColorStop(1, mixedPlayerColor())
    ctx.globalAlpha = 0.4; ctx.fillStyle = flame; ctx.beginPath(); ctx.moveTo(-5, 15); ctx.lineTo(0, 42 + Math.random() * 12); ctx.lineTo(5, 15); ctx.closePath(); ctx.fill()
  }
  drawAstronaut(ctx)
  ctx.restore()
}

function drawAstronaut(ctx: CanvasRenderingContext2D) {
  const silhouette = astronautPath()
  ctx.save(); ctx.clip(silhouette)
  const silver = ctx.createLinearGradient(-18, -24, 18, 24); silver.addColorStop(0, '#e1e5e8'); silver.addColorStop(0.46, '#9da6ad'); silver.addColorStop(1, '#646e77')
  ctx.fillStyle = silver; ctx.fillRect(-24, -25, 48, 52)
  const contributions = state.player.colors.filter((entry) => entry.amount > 0.01)
  const total = contributions.reduce((sum, entry) => sum + entry.amount, 0)
  const colorCoverage = clamp(total * 0.24, 0, 0.82)
  let bottom = 27
  for (const entry of contributions) {
    const height = 52 * colorCoverage * (entry.amount / total)
    const gradient = ctx.createLinearGradient(-20, bottom - height, 20, bottom)
    gradient.addColorStop(0, colorWithAlpha(entry.color, 0.82)); gradient.addColorStop(1, entry.color)
    ctx.fillStyle = gradient; ctx.fillRect(-24, bottom - height, 48, height + 0.4); bottom -= height
  }
  ctx.restore()

  ctx.globalAlpha = 1; ctx.strokeStyle = 'rgba(226, 233, 238, 0.72)'; ctx.lineWidth = 1.2; ctx.stroke(silhouette)
  ctx.fillStyle = '#151a21'; ctx.beginPath(); ctx.ellipse(0, -13, 7.2, 5.2, 0, Math.PI, Math.PI * 2); ctx.fill()
  const visor = ctx.createLinearGradient(-7, -17, 7, -10); visor.addColorStop(0, '#53616d'); visor.addColorStop(0.48, '#18212a'); visor.addColorStop(1, '#070b10')
  ctx.fillStyle = visor; ctx.beginPath(); ctx.ellipse(0, -13, 6.6, 4.6, 0, Math.PI, Math.PI * 2); ctx.fill()
  ctx.strokeStyle = 'rgba(230, 236, 241, 0.46)'; ctx.lineWidth = 0.75; ctx.stroke()
  ctx.fillStyle = 'rgba(235, 240, 244, 0.58)'; ctx.fillRect(-5.5, -1.5, 11, 1.2); ctx.fillRect(-3.8, 2, 7.6, 0.9)
}

function astronautPath() {
  const path = new Path2D()
  path.ellipse(0, -13, 9.5, 8.5, 0, 0, Math.PI * 2)
  path.rect(-9.5, -6, 19, 21)
  path.rect(-15.5, -4.5, 6.3, 16)
  path.rect(9.2, -4.5, 6.3, 16)
  path.rect(-9, 12, 7.5, 14)
  path.rect(1.5, 12, 7.5, 14)
  path.rect(-12.5, -2, 3.2, 13)
  return path
}

function drawParticles(ctx: CanvasRenderingContext2D) {
  for (const particle of state.particles) { ctx.globalAlpha = clamp(particle.life / 1.2, 0, 1); ctx.fillStyle = particle.color; ctx.beginPath(); ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2); ctx.fill() }
  ctx.globalAlpha = 1
}

function drawAgingVignette(ctx: CanvasRenderingContext2D) {
  const age = state.elapsed / LIFE_SECONDS
  if (age < 0.48) return
  const strength = (age - 0.48) / 0.52; const vignette = ctx.createRadialGradient(600, 360, 210, 600, 360, 710)
  vignette.addColorStop(0, 'transparent'); vignette.addColorStop(1, `rgba(0, 0, 0, ${0.18 + strength * 0.62})`); ctx.fillStyle = vignette; ctx.fillRect(0, 0, WORLD.width, WORLD.height)
}

function updateHud() {
  if (state.scene === 'title') return
  const ratio = state.elapsed / LIFE_SECONDS
  setText('#time-left', formatTime(Math.max(0, LIFE_SECONDS - state.elapsed))); setText('#age-readout', String(Math.round(18 + ratio * 62))); setText('#active-readout', String(activeBodies().length)); setText('#met-readout', String(state.bodies.filter((body) => body.met).length)); setText('#longest-readout', Math.max(0, ...state.bodies.map((body) => body.longestResonance)).toFixed(1)); setText('#phase-label', ['초기 궤도', '중간 생애', '늦은 생애', '소멸기'][state.phaseIndex] ?? ''); setWidth('#life-progress', `${ratio * 100}%`)
  const nearest = nearestBody()
  if (nearest) {
    const distance = distanceBetween(state.player.position, nearest.position) - nearest.radius
    const relativeSpeed = magnitude({ x: state.player.velocity.x - nearest.velocity.x, y: state.player.velocity.y - nearest.velocity.y })
    setText('#target-name', nearest.name); setText('#distance-readout', `${Math.max(0, Math.round(distance))}`); setText('#speed-readout', `${Math.round(relativeSpeed)}`); setWidth('#resonance-progress', `${nearest.resonance * 100}%`)
    const message = nearest.resonance >= 0.82
      ? nearest.message
      : distance < RESONANCE_MIN_DISTANCE
        ? '표면과 가깝습니다. 접선 방향으로 추진하세요.'
        : distance > RESONANCE_MAX_DISTANCE
          ? '아직 멉니다. 예상 항로를 따라 접근하세요.'
          : relativeSpeed > RESONANCE_MAX_RELATIVE_SPEED
            ? '상대속도가 큽니다. Space로 감속하세요.'
            : '공명 띠 안에서 속도를 유지하세요.'
    setText('#resonance-message', message)
  } else {
    setText('#target-name', state.elapsed < 2 ? '신호를 기다리는 중' : '가까운 궤도 없음'); setText('#distance-readout', '—'); setText('#speed-readout', '—'); setWidth('#resonance-progress', '0%'); setText('#resonance-message', state.phaseIndex === 3 ? '이제 새 신호는 오지 않습니다.' : '지나가는 빛의 방향을 읽으세요.')
  }
  const colorCore = document.querySelector<HTMLElement>('#color-core'); if (colorCore) colorCore.style.setProperty('--current-color', mixedPlayerColor())
  const colorSwatches = document.querySelector<HTMLElement>('#color-swatches')
  if (colorSwatches) colorSwatches.innerHTML = state.player.colors.length ? state.player.colors.map((color) => `<span style="--swatch:${color.color};--amount:${color.amount}" title="${Math.round(color.amount * 100)}%"></span>`).join('') : '<span class="empty-color">아직 무채색</span>'
  const hint = document.querySelector<HTMLElement>('#intro-hint-text')
  if (hint && !state.introComplete) hint.textContent = ['방향키 · 드래그', '빛의 오라 안으로', 'Space · 속도 맞추기'][state.introStage] ?? ''
}

function inputVector(): Vector {
  const keyboard = { x: Number(heldKeys.has('arrowright') || heldKeys.has('d') || heldDirections.has('right')) - Number(heldKeys.has('arrowleft') || heldKeys.has('a') || heldDirections.has('left')), y: Number(heldKeys.has('arrowdown') || heldKeys.has('s') || heldDirections.has('down')) - Number(heldKeys.has('arrowup') || heldKeys.has('w') || heldDirections.has('up')) }
  const combined = { x: keyboard.x + (pointerThrust?.x ?? 0), y: keyboard.y + (pointerThrust?.y ?? 0) }
  return magnitude(combined) > 1 ? normalize(combined) : combined
}

function thrustForAge() { const ratio = state.elapsed / LIFE_SECONDS; if (ratio < 0.32) return 106; if (ratio < 0.64) return 91; if (ratio < 0.84) return 74; return 54 }

function gravityAcceleration(from: Vector, to: Vector, mass: number): Vector {
  const delta = { x: to.x - from.x, y: to.y - from.y }; const distanceSquared = delta.x * delta.x + delta.y * delta.y; const softened = distanceSquared + GRAVITY_SOFTENING * GRAVITY_SOFTENING; const force = Math.min(GRAVITY_MAX_ACCELERATION, (GRAVITY * mass) / softened); const direction = normalize(delta)
  return { x: direction.x * force, y: direction.y * force }
}

function containPlayer(player: Player) {
  const margin = player.radius
  if (player.position.x < margin) { player.position.x = margin; player.velocity.x = Math.abs(player.velocity.x) * 0.42 }
  if (player.position.x > WORLD.width - margin) { player.position.x = WORLD.width - margin; player.velocity.x = -Math.abs(player.velocity.x) * 0.42 }
  if (player.position.y < margin) { player.position.y = margin; player.velocity.y = Math.abs(player.velocity.y) * 0.42 }
  if (player.position.y > WORLD.height - margin) { player.position.y = WORLD.height - margin; player.velocity.y = -Math.abs(player.velocity.y) * 0.42 }
}

function activeBodies() { return state.bodies.filter((body) => body.spawned && !body.departed) }
function nearestBody() { return activeBodies().reduce<CelestialBody | null>((nearest, body) => !nearest || distanceBetween(state.player.position, body.position) < distanceBetween(state.player.position, nearest.position) ? body : nearest, null) }
function playerGravityMass() { return 0.68 + state.player.colors.reduce((sum, color) => sum + color.amount, 0) * 0.2 }

function mixedPlayerColor() {
  if (!state.player.colors.length) return '#a4abb2'
  let total = 0.42; let red = 164 * 0.42; let green = 171 * 0.42; let blue = 178 * 0.42
  for (const contribution of state.player.colors) { const rgb = hexToRgb(contribution.color); const weight = Math.max(0.08, contribution.amount); red += rgb.red * weight; green += rgb.green * weight; blue += rgb.blue * weight; total += weight }
  return rgbToHex(red / total, green / total, blue / total)
}

function mixedPaletteColor(palette: string[]) {
  const colors = palette.length ? palette : ['#a4abb2']
  const totals = colors.reduce((sum, color) => {
    const rgb = hexToRgb(color)
    return { red: sum.red + rgb.red, green: sum.green + rgb.green, blue: sum.blue + rgb.blue }
  }, { red: 0, green: 0, blue: 0 })
  return rgbToHex(totals.red / colors.length, totals.green / colors.length, totals.blue / colors.length)
}

function resizeCanvas() {
  if (!canvas) return
  const bounds = canvas.getBoundingClientRect(); const dpr = Math.min(window.devicePixelRatio || 1, 2)
  canvas.width = Math.max(1, Math.round(bounds.width * dpr)); canvas.height = Math.max(1, Math.round(bounds.height * dpr)); context?.setTransform(dpr, 0, 0, dpr, 0, 0)
}

function viewTransform(): ViewTransform {
  if (!canvas) return { scale: 1, offsetX: 0, offsetY: 0, width: WORLD.width, height: WORLD.height }
  const width = canvas.clientWidth; const height = canvas.clientHeight; const scale = Math.min(width / WORLD.width, height / WORLD.height)
  return { scale, offsetX: (width - WORLD.width * scale) / 2, offsetY: (height - WORLD.height * scale) / 2, width, height }
}

function pointerToWorld(event: PointerEvent): Vector | null {
  if (!canvas) return null
  const bounds = canvas.getBoundingClientRect(); const view = viewTransform()
  return { x: (event.clientX - bounds.left - view.offsetX) / view.scale, y: (event.clientY - bounds.top - view.offsetY) / view.scale }
}

function updatePointerThrust(event: PointerEvent) {
  const worldPoint = pointerToWorld(event); if (!worldPoint) return
  const delta = { x: worldPoint.x - state.player.position.x, y: worldPoint.y - state.player.position.y }; const distance = magnitude(delta)
  pointerThrust = distance < 18 ? null : scaleVector(normalize(delta), clamp(distance / 180, 0.28, 1))
}

function togglePause() {
  if (state.scene !== 'flight') return
  state.paused = !state.paused
  const overlay = document.querySelector<HTMLElement>('#pause-overlay'); if (overlay) overlay.hidden = !state.paused
  document.querySelector<HTMLButtonElement>('[data-action="pause"]')?.setAttribute('aria-pressed', String(state.paused))
  announce(state.paused ? '게임을 일시정지했습니다.' : '유영을 계속합니다.')
}

function toggleSetting(setting: 'soundEnabled' | 'reducedMotion' | 'trajectoryEnabled') {
  state[setting] = !state[setting]
  if (setting === 'soundEnabled' && state.soundEnabled) playTone('start')
  if (setting === 'reducedMotion') document.documentElement.dataset.reducedMotion = String(state.reducedMotion)
  if (state.scene === 'title') render()
}

function playTone(tone: Tone) {
  if (!state.soundEnabled) return
  try {
    audioContext ??= new AudioContext(); if (audioContext.state === 'suspended') void audioContext.resume(); const now = audioContext.currentTime
    const frequencies: Record<Tone, number[]> = { start: [65.41, 82.41], signal: [110], resonance: [98, 146.83], collision: [49, 41.2], phase: [82.41, 73.42], ending: [65.41, 82.41, 110] }
    frequencies[tone].forEach((frequency, index) => {
      const oscillator = audioContext!.createOscillator(); const gain = audioContext!.createGain(); const filter = audioContext!.createBiquadFilter(); const start = now + index * 0.22; const duration = tone === 'ending' ? 2.8 : 1.3
      oscillator.type = 'sine'; oscillator.frequency.setValueAtTime(frequency, start); filter.type = 'lowpass'; filter.frequency.setValueAtTime(620, start); gain.gain.setValueAtTime(0.0001, start); gain.gain.exponentialRampToValueAtTime(tone === 'ending' ? 0.028 : 0.016, start + 0.08); gain.gain.exponentialRampToValueAtTime(0.0001, start + duration); oscillator.connect(gain).connect(filter).connect(audioContext!.destination); oscillator.start(start); oscillator.stop(start + duration + 0.05)
    })
  } catch { state.soundEnabled = false }
}

function announce(message: string) { liveRegion.textContent = ''; window.setTimeout(() => { liveRegion.textContent = message }, 20) }
function focusPrimary() { window.requestAnimationFrame(() => { app.querySelector<HTMLElement>('[data-autofocus], h1[tabindex="-1"], #orbit-canvas')?.focus({ preventScroll: true }) }) }
function toolButton(action: string, pressed: boolean, label: string, icon: string) { return `<button class="quiet-button" type="button" data-action="${action}" aria-pressed="${pressed}" aria-label="${label} ${pressed ? '켜짐' : '꺼짐'}">${icon}<span>${label} ${pressed ? '켜짐' : '꺼짐'}</span></button>` }
function setText(selector: string, value: string) { const element = document.querySelector<HTMLElement>(selector); if (element && element.textContent !== value) element.textContent = value }
function setWidth(selector: string, width: string) { const element = document.querySelector<HTMLElement>(selector); if (element) element.style.width = width }
function characterCount(value: string) { return Array.from(value).length }
function formatTime(seconds: number) { const rounded = Math.ceil(seconds); return `${String(Math.floor(rounded / 60)).padStart(2, '0')}:${String(rounded % 60).padStart(2, '0')}` }
function normalize(vector: Vector): Vector { const length = magnitude(vector); return length > 0.0001 ? { x: vector.x / length, y: vector.y / length } : { x: 0, y: 0 } }
function magnitude(vector: Vector) { return Math.hypot(vector.x, vector.y) }
function dot(first: Vector, second: Vector) { return first.x * second.x + first.y * second.y }
function scaleVector(vector: Vector, scale: number): Vector { return { x: vector.x * scale, y: vector.y * scale } }
function distanceBetween(first: Vector, second: Vector) { return Math.hypot(first.x - second.x, first.y - second.y) }
function clamp(value: number, minimum: number, maximum: number) { return Math.max(minimum, Math.min(maximum, value)) }
function pseudoRandom(seed: number) { const value = Math.sin(seed * 12.9898) * 43758.5453; return value - Math.floor(value) }
function hexToRgb(hex: string) { const value = Number.parseInt(hex.slice(1), 16); return { red: (value >> 16) & 255, green: (value >> 8) & 255, blue: value & 255 } }
function rgbToHex(red: number, green: number, blue: number) { return `#${[red, green, blue].map((value) => Math.round(clamp(value, 0, 255)).toString(16).padStart(2, '0')).join('')}` }
function colorWithAlpha(color: string, alpha: number) { const rgb = hexToRgb(color); return `rgba(${rgb.red}, ${rgb.green}, ${rgb.blue}, ${clamp(alpha, 0, 1)})` }
function roundRectPath(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  const r = Math.min(radius, width / 2, height / 2); ctx.beginPath(); ctx.moveTo(x + r, y); ctx.lineTo(x + width - r, y); ctx.quadraticCurveTo(x + width, y, x + width, y + r); ctx.lineTo(x + width, y + height - r); ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height); ctx.lineTo(x + r, y + height); ctx.quadraticCurveTo(x, y + height, x, y + height - r); ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y); ctx.closePath()
}
function soundOnIcon() { return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m4 9 4-3 4-3v18l-4-3H4z"/><path d="M16 8c1.4 1 2 2.2 2 4s-.6 3-2 4M19 5c2 1.8 3 4 3 7s-1 5.2-3 7"/></svg>' }
function soundOffIcon() { return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m4 9 4-3 4-3v18l-4-3H4z"/><path d="m16 9 6 6m0-6-6 6"/></svg>' }
function motionIcon() { return '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8"/><path d="M4 12h16M12 4c3 3 3 13 0 16M12 4c-3 3-3 13 0 16"/></svg>' }
function trajectoryIcon() { return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 18c4-10 9-13 18-12"/><path d="m16 3 5 3-3 5"/></svg>' }
function pauseIcon() { return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14M16 5v14"/></svg>' }

app.addEventListener('click', (event) => {
  const control = (event.target as HTMLElement).closest<HTMLElement>('[data-action]'); if (!control) return
  const action = control.dataset.action
  if (action === 'start') void startGame(false)
  if (action === 'restart') void startGame(true)
  if (action === 'home') { const settings = { soundEnabled: state.soundEnabled, reducedMotion: state.reducedMotion, trajectoryEnabled: state.trajectoryEnabled }; state = createState(settings); render() }
  if (action === 'pause') togglePause()
  if (action === 'toggle-sound') toggleSetting('soundEnabled')
  if (action === 'toggle-motion') toggleSetting('reducedMotion')
  if (action === 'toggle-trajectory') toggleSetting('trajectoryEnabled')
  if (action === 'skip-message') { state.endingStatus = 'skipped'; showEndingCompletion(''); announce('메시지를 남기지 않았습니다.') }
})

app.addEventListener('submit', (event) => {
  const form = (event.target as HTMLElement).closest<HTMLFormElement>('#message-form')
  if (!form) return
  event.preventDefault(); void submitEndingMessage()
})

app.addEventListener('input', (event) => {
  const textarea = (event.target as HTMLElement).closest<HTMLTextAreaElement>('#ending-message')
  if (!textarea) return
  const characters = Array.from(textarea.value)
  if (characters.length > 60) textarea.value = characters.slice(0, 60).join('')
  setText('#message-count', `${characterCount(textarea.value)} / 60`); setEndingError('')
})

app.addEventListener('pointerdown', (event) => {
  const target = event.target as HTMLElement; const direction = target.closest<HTMLElement>('[data-direction]')
  if (direction) { event.preventDefault(); direction.setPointerCapture(event.pointerId); heldDirections.add(direction.dataset.direction as Direction); return }
  const brake = target.closest<HTMLElement>('[data-brake]')
  if (brake) { event.preventDefault(); brake.setPointerCapture(event.pointerId); braking = true; return }
  if (target === canvas && state.scene === 'flight' && !state.paused) { event.preventDefault(); pointerId = event.pointerId; canvas.setPointerCapture(event.pointerId); updatePointerThrust(event) }
})

app.addEventListener('pointermove', (event) => { if (pointerId === event.pointerId) updatePointerThrust(event) })

function releasePointer(event: PointerEvent) {
  const target = event.target as HTMLElement; const direction = target.closest<HTMLElement>('[data-direction]')
  if (direction) heldDirections.delete(direction.dataset.direction as Direction)
  if (target.closest('[data-brake]')) braking = false
  if (pointerId === event.pointerId) { pointerId = null; pointerThrust = null }
}

app.addEventListener('pointerup', releasePointer); app.addEventListener('pointercancel', releasePointer); app.addEventListener('lostpointercapture', releasePointer)

window.addEventListener('keydown', (event) => {
  const key = event.key.toLowerCase(); if (state.scene !== 'flight') return
  if (['arrowleft', 'arrowright', 'arrowup', 'arrowdown', 'w', 'a', 's', 'd'].includes(key)) { event.preventDefault(); heldKeys.add(key) }
  if (key === ' ') { event.preventDefault(); braking = true }
  if (key === 'p' && !event.repeat) { event.preventDefault(); togglePause() }
})

window.addEventListener('keyup', (event) => { const key = event.key.toLowerCase(); heldKeys.delete(key); if (key === ' ') braking = false })
window.addEventListener('blur', () => { heldKeys.clear(); heldDirections.clear(); pointerThrust = null; braking = false })
window.addEventListener('resize', resizeCanvas)

void loadMessages()
render()
