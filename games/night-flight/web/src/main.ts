import './style.css'

type Scene = 'title' | 'flight' | 'ending'
type Direction = 'up' | 'down' | 'left' | 'right'
type Tone = 'start' | 'signal' | 'resonance' | 'phase' | 'ending'

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

const bodyBlueprints = [
  { id: 'blue-orbit', name: '느린 푸른 궤도', color: '#5f8fff', position: { x: -70, y: 174 }, velocity: { x: 37, y: 6 }, radius: 29, mass: 1.25, spawnAt: 2, expireAt: 35 },
  { id: 'amber-planet', name: '호박빛 행성', color: '#e49a53', position: { x: 1270, y: 510 }, velocity: { x: -36, y: -5 }, radius: 36, mass: 1.7, spawnAt: 14, expireAt: 52 },
  { id: 'red-dwarf', name: '붉은 왜성', color: '#db6079', position: { x: 235, y: -75 }, velocity: { x: 8, y: 34 }, radius: 24, mass: 1.05, spawnAt: 28, expireAt: 67 },
  { id: 'teal-moon', name: '청록 위성', color: '#4cc6b8', position: { x: 1260, y: 102 }, velocity: { x: -34, y: 14 }, radius: 26, mass: 1.15, spawnAt: 42, expireAt: 77 },
  { id: 'violet-planet', name: '보랏빛 행성', color: '#9875dc', position: { x: -68, y: 635 }, velocity: { x: 35, y: -12 }, radius: 33, mass: 1.5, spawnAt: 56, expireAt: 86 },
  { id: 'last-star', name: '마지막 작은 별', color: '#e2d37b', position: { x: 1010, y: 790 }, velocity: { x: -18, y: -33 }, radius: 20, mass: 0.9, spawnAt: 65, expireAt: 90 },
] as const

const app = document.querySelector<HTMLDivElement>('#app')!
const liveRegion = document.querySelector<HTMLDivElement>('#live-region')!
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

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
    player: { position: { x: WORLD.width * 0.5, y: WORLD.height * 0.52 }, velocity: { x: 0, y: 0 }, radius: 15, trail: [], colors: [] },
    bodies: bodyBlueprints.map((body) => ({
      ...body, position: { ...body.position }, velocity: { ...body.velocity }, spawned: false,
      departed: false, met: false, resonance: 0, stableSeconds: 0, longestResonance: 0,
      currentResonance: 0, trail: [],
    })),
    particles: [], harmonyScore: 0, phaseIndex: 0, finalColor: '#a4abb2',
  }
}

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
        <p class="eyebrow">A FINITE ORBIT THROUGH A LARGE NIGHT</p>
        <h1 id="scene-title" tabindex="-1">야간비행</h1>
        <p class="title-lede">아무도 다음 목적지를 정해주지 않는 우주.<br />지나가는 존재의 중력을 읽고, 잠시 같은 궤도를 만드세요.</p>
        <button class="primary-button" type="button" data-action="start" data-autofocus>무채색으로 출발 <span aria-hidden="true">→</span></button>
        <p class="title-meta">90초 물리 프로토타입 · 방향키/WASD · 드래그 · Space 감속</p>
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
    <main class="flight-shell" aria-label="야간비행 궤도 공명 프로토타입">
      <header class="game-header">
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
          <div class="canvas-hud top-left"><span>나이</span><strong id="age-readout">18</strong></div>
          <div class="canvas-hud top-right"><span>남은 궤도</span><strong id="active-readout">0</strong></div>
          <p class="canvas-caption">화면을 누른 채 방향을 바꾸면 그쪽으로 추진합니다.</p>
        </div>
        <aside class="flight-panel" aria-label="공명 상태와 조작">
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

function startGame() {
  const settings = { soundEnabled: state.soundEnabled, reducedMotion: state.reducedMotion, trajectoryEnabled: state.trajectoryEnabled }
  state = createState(settings)
  state.scene = 'flight'
  heldKeys.clear(); heldDirections.clear(); pointerThrust = null; braking = false
  playTone('start')
  render()
  announce('90초의 생애가 시작되었습니다. 방향키나 드래그로 추진하세요.')
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
  state.elapsed = Math.min(LIFE_SECONDS, state.elapsed + delta)
  updatePhase(); updateBodies(delta); updatePlayer(delta); updateResonance(delta); updateParticles(delta); addTrailPoints()
  if (state.elapsed >= LIFE_SECONDS) finishGame()
}

function updateBodies(delta: number) {
  for (const body of state.bodies) {
    if (!body.spawned && state.elapsed >= body.spawnAt) {
      body.spawned = true
      announce(`${body.name}의 신호가 우주에 들어왔습니다.`)
      playTone('signal')
    }
    if (!body.spawned || body.departed) continue
    if (state.elapsed >= body.expireAt && body.resonance < 0.15) { body.departed = true; continue }
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
    gravity.x += acceleration.x; gravity.y += acceleration.y
  }
  const input = inputVector(); const thrust = thrustForAge()
  player.velocity.x += (gravity.x + input.x * thrust) * delta
  player.velocity.y += (gravity.y + input.y * thrust) * delta
  if (braking) {
    const damping = Math.exp(-2.35 * delta)
    player.velocity.x *= damping; player.velocity.y *= damping
  }
  const speed = magnitude(player.velocity); const maxSpeed = 205
  if (speed > maxSpeed) { player.velocity.x = (player.velocity.x / speed) * maxSpeed; player.velocity.y = (player.velocity.y / speed) * maxSpeed }
  player.position.x += player.velocity.x * delta; player.position.y += player.velocity.y * delta
  containPlayer(player)
}

function updateResonance(delta: number) {
  const player = state.player
  for (const body of activeBodies()) {
    const distance = distanceBetween(player.position, body.position)
    const relativeSpeed = magnitude({ x: player.velocity.x - body.velocity.x, y: player.velocity.y - body.velocity.y })
    const inBand = distance >= body.radius + RESONANCE_MIN_DISTANCE && distance <= body.radius + RESONANCE_MAX_DISTANCE
    if (inBand && relativeSpeed <= RESONANCE_MAX_RELATIVE_SPEED) body.resonance = Math.min(1, body.resonance + delta / RESONANCE_LOCK_SECONDS)
    else {
      body.resonance = Math.max(0, body.resonance - delta * 0.72)
      if (body.resonance < 0.82) body.currentResonance = 0
    }
    if (body.resonance >= 0.82) {
      if (!body.met) {
        body.met = true
        announce(`${body.name}과 궤도가 맞았습니다. 함께 머무는 동안 색이 오갑니다.`)
        playTone('resonance')
      }
      body.currentResonance += delta; body.stableSeconds += delta
      body.longestResonance = Math.max(body.longestResonance, body.currentResonance)
      state.harmonyScore += delta * Math.max(0.2, 1 - relativeSpeed / RESONANCE_MAX_RELATIVE_SPEED)
      addColor(body, delta); emitResonanceParticles(body, delta)
    }
    if (distance < body.radius + player.radius + 8) {
      const away = normalize({ x: player.position.x - body.position.x, y: player.position.y - body.position.y })
      player.velocity.x += away.x * 115 * delta; player.velocity.y += away.y * 115 * delta
    }
  }
}

function addColor(body: CelestialBody, delta: number) {
  let contribution = state.player.colors.find((item) => item.id === body.id)
  if (!contribution) { contribution = { id: body.id, color: body.color, amount: 0 }; state.player.colors.push(contribution) }
  contribution.amount = Math.min(1, contribution.amount + delta * 0.11)
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
  announce('생애가 끝났습니다. 여행자는 색의 입자로 흩어지고 항로가 남았습니다.')
  const met = state.bodies.filter((body) => body.met)
  const longest = Math.max(0, ...state.bodies.map((body) => body.longestResonance))
  const overlay = document.querySelector<HTMLElement>('#ending-overlay')
  if (overlay) {
    overlay.hidden = false
    overlay.innerHTML = `<div class="ending-card" style="--final-color:${state.finalColor}"><p class="eyebrow">END OF ORBIT / AGE 80</p><span class="ending-color" aria-hidden="true"></span><h1 tabindex="-1">당신이 지나간 자리에는<br />이 색들이 남았습니다.</h1><p>모든 궤도를 만날 수는 없었습니다. 함께한 시간과 서로에게 남긴 흔적이 이번 생의 모양입니다.</p><div class="ending-record"><span><strong>${met.length}</strong> 만난 궤도</span><span><strong>${longest.toFixed(1)}초</strong> 가장 긴 공명</span><span><strong>${state.player.colors.length}</strong> 남은 색</span></div><div class="ending-actions"><button class="primary-button" type="button" data-action="restart" data-autofocus>다른 항로로 다시 출발</button><button class="quiet-button" type="button" data-action="home">처음 화면</button></div></div>`
    window.requestAnimationFrame(() => overlay.querySelector<HTMLElement>('h1')?.focus({ preventScroll: true }))
  }
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
  drawSpace(ctx); drawTrails(ctx)
  if (state.trajectoryEnabled && state.scene === 'flight') drawPredictedTrajectory(ctx)
  drawBodies(ctx); drawParticles(ctx)
  if (state.scene === 'flight') drawPlayer(ctx)
  drawAgingVignette(ctx); ctx.restore()
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
  ctx.save(); ctx.setLineDash([5, 10]); ctx.strokeStyle = 'rgba(186, 199, 212, 0.28)'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(simulated.position.x, simulated.position.y)
  for (let step = 0; step < 48; step += 1) {
    const dt = 0.065
    for (const body of activeBodies()) { const acceleration = gravityAcceleration(simulated.position, body.position, body.mass); simulated.velocity.x += acceleration.x * dt; simulated.velocity.y += acceleration.y * dt }
    simulated.position.x += simulated.velocity.x * dt; simulated.position.y += simulated.velocity.y * dt; ctx.lineTo(simulated.position.x, simulated.position.y)
  }
  ctx.stroke(); ctx.restore()
}

function drawBodies(ctx: CanvasRenderingContext2D) {
  for (const body of activeBodies()) {
    const distance = distanceBetween(state.player.position, body.position); const near = distance < 280; const ringRadius = body.radius + RESONANCE_MIN_DISTANCE + 23
    ctx.save(); ctx.translate(body.position.x, body.position.y)
    ctx.globalAlpha = clamp(body.resonance * 0.75 + (near ? 0.2 : 0.08), 0.08, 0.88); ctx.strokeStyle = body.color; ctx.lineWidth = 1.2 + body.resonance * 2.2; ctx.setLineDash(body.resonance > 0.82 ? [] : [4, 8]); ctx.beginPath(); ctx.arc(0, 0, ringRadius, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([])
    const glow = ctx.createRadialGradient(-body.radius * 0.3, -body.radius * 0.3, 2, 0, 0, body.radius * 2.6)
    glow.addColorStop(0, body.color); glow.addColorStop(0.32, body.color); glow.addColorStop(1, 'transparent')
    ctx.globalAlpha = 0.78; ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(0, 0, body.radius * 2.6, 0, Math.PI * 2); ctx.fill()
    const bodyGradient = ctx.createRadialGradient(-body.radius * 0.35, -body.radius * 0.4, 2, 0, 0, body.radius)
    bodyGradient.addColorStop(0, '#e8edf2'); bodyGradient.addColorStop(0.17, body.color); bodyGradient.addColorStop(1, '#111522')
    ctx.globalAlpha = 1; ctx.fillStyle = bodyGradient; ctx.beginPath(); ctx.arc(0, 0, body.radius, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = body.color; ctx.globalAlpha = 0.55; ctx.lineWidth = 1; ctx.stroke()
    if (near || body.resonance > 0) { ctx.globalAlpha = clamp(0.35 + body.resonance, 0.35, 1); ctx.fillStyle = '#d9e0e6'; ctx.font = '600 13px system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.fillText(body.name, 0, body.radius + ringRadius + 18) }
    ctx.restore()
  }
}

function drawPlayer(ctx: CanvasRenderingContext2D) {
  const player = state.player; ctx.save(); ctx.translate(player.position.x, player.position.y)
  const angle = Math.atan2(player.velocity.y, player.velocity.x); ctx.rotate(Number.isFinite(angle) ? angle : 0)
  if (magnitude(inputVector()) > 0.05) {
    const flame = ctx.createLinearGradient(-48, 0, -12, 0); flame.addColorStop(0, 'transparent'); flame.addColorStop(1, mixedPlayerColor())
    ctx.globalAlpha = 0.45; ctx.fillStyle = flame; ctx.beginPath(); ctx.moveTo(-14, -5); ctx.lineTo(-42 - Math.random() * 14, 0); ctx.lineTo(-14, 5); ctx.closePath(); ctx.fill()
  }
  ctx.globalAlpha = 1; ctx.fillStyle = '#aab1b8'; ctx.beginPath(); ctx.arc(0, 0, player.radius, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#11151c'; ctx.beginPath(); ctx.arc(5, -2, player.radius * 0.55, -1.3, 1.4); ctx.lineTo(2, 6); ctx.closePath(); ctx.fill()
  let arcStart = -Math.PI / 2
  for (const contribution of player.colors) { const arcSize = Math.max(0.18, contribution.amount * Math.PI * 1.35); ctx.globalAlpha = 0.45 + contribution.amount * 0.55; ctx.strokeStyle = contribution.color; ctx.lineWidth = 3 + contribution.amount * 5; ctx.beginPath(); ctx.arc(0, 0, player.radius + 6, arcStart, arcStart + arcSize); ctx.stroke(); arcStart += arcSize + 0.08 }
  ctx.restore()
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
      ? '공명 중 · 오래 머물수록 색이 깊어집니다.'
      : distance < RESONANCE_MIN_DISTANCE
        ? '너무 가깝습니다. 바깥쪽으로 밀어내세요.'
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
}

function inputVector(): Vector {
  const keyboard = { x: Number(heldKeys.has('arrowright') || heldKeys.has('d') || heldDirections.has('right')) - Number(heldKeys.has('arrowleft') || heldKeys.has('a') || heldDirections.has('left')), y: Number(heldKeys.has('arrowdown') || heldKeys.has('s') || heldDirections.has('down')) - Number(heldKeys.has('arrowup') || heldKeys.has('w') || heldDirections.has('up')) }
  const combined = { x: keyboard.x + (pointerThrust?.x ?? 0), y: keyboard.y + (pointerThrust?.y ?? 0) }
  return magnitude(combined) > 1 ? normalize(combined) : combined
}

function thrustForAge() { const ratio = state.elapsed / LIFE_SECONDS; if (ratio < 0.32) return 106; if (ratio < 0.64) return 91; if (ratio < 0.84) return 74; return 54 }

function gravityAcceleration(from: Vector, to: Vector, mass: number): Vector {
  const delta = { x: to.x - from.x, y: to.y - from.y }; const distanceSquared = delta.x * delta.x + delta.y * delta.y; const softened = distanceSquared + GRAVITY_SOFTENING * GRAVITY_SOFTENING; const force = Math.min(24, (GRAVITY * mass) / softened); const direction = normalize(delta)
  return { x: direction.x * force, y: direction.y * force }
}

function containPlayer(player: Player) {
  const margin = 18
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
    const frequencies: Record<Tone, number[]> = { start: [65.41, 82.41], signal: [110], resonance: [98, 146.83], phase: [82.41, 73.42], ending: [65.41, 82.41, 110] }
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
function formatTime(seconds: number) { const rounded = Math.ceil(seconds); return `${String(Math.floor(rounded / 60)).padStart(2, '0')}:${String(rounded % 60).padStart(2, '0')}` }
function normalize(vector: Vector): Vector { const length = magnitude(vector); return length > 0.0001 ? { x: vector.x / length, y: vector.y / length } : { x: 0, y: 0 } }
function magnitude(vector: Vector) { return Math.hypot(vector.x, vector.y) }
function scaleVector(vector: Vector, scale: number): Vector { return { x: vector.x * scale, y: vector.y * scale } }
function distanceBetween(first: Vector, second: Vector) { return Math.hypot(first.x - second.x, first.y - second.y) }
function clamp(value: number, minimum: number, maximum: number) { return Math.max(minimum, Math.min(maximum, value)) }
function pseudoRandom(seed: number) { const value = Math.sin(seed * 12.9898) * 43758.5453; return value - Math.floor(value) }
function hexToRgb(hex: string) { const value = Number.parseInt(hex.slice(1), 16); return { red: (value >> 16) & 255, green: (value >> 8) & 255, blue: value & 255 } }
function rgbToHex(red: number, green: number, blue: number) { return `#${[red, green, blue].map((value) => Math.round(clamp(value, 0, 255)).toString(16).padStart(2, '0')).join('')}` }
function soundOnIcon() { return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m4 9 4-3 4-3v18l-4-3H4z"/><path d="M16 8c1.4 1 2 2.2 2 4s-.6 3-2 4M19 5c2 1.8 3 4 3 7s-1 5.2-3 7"/></svg>' }
function soundOffIcon() { return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m4 9 4-3 4-3v18l-4-3H4z"/><path d="m16 9 6 6m0-6-6 6"/></svg>' }
function motionIcon() { return '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8"/><path d="M4 12h16M12 4c3 3 3 13 0 16M12 4c-3 3-3 13 0 16"/></svg>' }
function trajectoryIcon() { return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 18c4-10 9-13 18-12"/><path d="m16 3 5 3-3 5"/></svg>' }
function pauseIcon() { return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14M16 5v14"/></svg>' }

app.addEventListener('click', (event) => {
  const control = (event.target as HTMLElement).closest<HTMLElement>('[data-action]'); if (!control) return
  const action = control.dataset.action
  if (action === 'start' || action === 'restart') startGame()
  if (action === 'home') { const settings = { soundEnabled: state.soundEnabled, reducedMotion: state.reducedMotion, trajectoryEnabled: state.trajectoryEnabled }; state = createState(settings); render() }
  if (action === 'pause') togglePause()
  if (action === 'toggle-sound') toggleSetting('soundEnabled')
  if (action === 'toggle-motion') toggleSetting('reducedMotion')
  if (action === 'toggle-trajectory') toggleSetting('trajectoryEnabled')
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

render()
