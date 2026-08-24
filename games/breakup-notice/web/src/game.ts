export type Phase = 'title' | 'running' | 'final-line' | 'ending'
export type HazardKind = 'word' | 'sign' | 'coin'
export type EventKind = 'jump' | 'fire' | 'clear' | 'coin' | 'stage' | 'stumble' | 'reveal' | 'blocked' | 'accept'

export interface Hazard {
  id: number
  kind: HazardKind
  label: string
  x: number
  resolved: boolean
}

export interface LoveShot {
  id: number
  x: number
}

export interface GameState {
  phase: Phase
  paused: boolean
  soundEnabled: boolean
  elapsed: number
  strength: number
  truthRevealed: boolean
  revealTimer: number
  stage: number
  stageFlashTimer: number
  playerY: number
  playerVelocity: number
  jumpCooldown: number
  fireCooldown: number
  spawnTimer: number
  nextEntityId: number
  hazards: Hazard[]
  shots: LoveShot[]
  avoided: number
  stumbled: number
  loveSent: number
  coins: number
  heartsReachedPartner: number
  finalAttempts: number
  feedback: string
  feedbackKind: EventKind | 'info'
  hitTimer: number
}

export interface ModelEvent {
  kind: EventKind
  message: string
}

export interface StepResult {
  events: ModelEvent[]
  phaseChanged: boolean
}

export const RUN_SECONDS = 135
export const PARTNER_DISTANCE_METERS = 28
export const PLAYER_X = 0.2
export const PARTNER_X = 0.82

const WORDS = [
  '우리, 잠깐 말할까',
  '요즘 대답이 짧아졌어',
  '오늘은 혼자 있고 싶어',
  '이대로 괜찮은 걸까',
  '다음 약속은 미루자',
]

const SIGNS = [
  '맞잡지 않은 손',
  '취소된 약속',
  '길어진 침묵',
  '돌아선 시선',
  '한 걸음의 거리',
]

export function createInitialState(soundEnabled = true): GameState {
  return {
    phase: 'title',
    paused: false,
    soundEnabled,
    elapsed: 0,
    strength: 8,
    truthRevealed: false,
    revealTimer: 0,
    stage: 1,
    stageFlashTimer: 0,
    playerY: 0,
    playerVelocity: 0,
    jumpCooldown: 0,
    fireCooldown: 0,
    spawnTimer: 1.8,
    nextEntityId: 1,
    hazards: [],
    shots: [],
    avoided: 0,
    stumbled: 0,
    loveSent: 0,
    coins: 0,
    heartsReachedPartner: 0,
    finalAttempts: 0,
    feedback: '앞선 사람을 따라 달릴 준비를 한다.',
    feedbackKind: 'info',
    hitTimer: 0,
  }
}

export function startRun(state: GameState): void {
  const soundEnabled = state.soundEnabled
  Object.assign(state, createInitialState(soundEnabled), {
    phase: 'running' satisfies Phase,
    feedback: '거리는 28m. 달리면 닿을 수 있다고 생각했다.',
  })
}

export function jump(state: GameState): ModelEvent | null {
  if (state.phase === 'final-line') {
    state.finalAttempts += 1
    state.feedback = '넘을 수 없다. 문장은 같은 자리에 남아 있다.'
    state.feedbackKind = 'blocked'
    return { kind: 'blocked', message: state.feedback }
  }
  if (state.phase !== 'running' || state.paused || state.playerY > 0.02 || state.jumpCooldown > 0) {
    return null
  }

  state.playerVelocity = 1.95
  state.jumpCooldown = 0.12
  state.feedback = '낌새 하나를 보지 않기 위해 뛰어오른다.'
  state.feedbackKind = 'jump'
  return { kind: 'jump', message: state.feedback }
}

export function fireLove(state: GameState): ModelEvent | null {
  if (state.phase === 'final-line') {
    state.finalAttempts += 1
    state.feedback = '사랑을 보내도 마지막 문장은 부서지지 않는다.'
    state.feedbackKind = 'blocked'
    return { kind: 'blocked', message: state.feedback }
  }
  if (state.phase !== 'running' || state.paused || state.fireCooldown > 0) return null

  state.shots.push({ id: state.nextEntityId++, x: PLAYER_X + 0.045 })
  state.fireCooldown = 0.48
  state.loveSent += 1
  state.feedback = '사랑을 앞으로 보낸다.'
  state.feedbackKind = 'fire'
  return { kind: 'fire', message: state.feedback }
}

export function acceptFinalLine(state: GameState): ModelEvent | null {
  if (state.phase !== 'final-line') return null
  state.phase = 'ending'
  state.paused = false
  state.feedback = '문장을 지우지 않고, 처음부터 끝까지 읽었다.'
  state.feedbackKind = 'accept'
  return { kind: 'accept', message: state.feedback }
}

export function narrativeFor(elapsed: number, truthRevealed: boolean): string {
  if (truthRevealed && elapsed >= 112) return '혼자 설 힘은 이미 내 안에서 차오르고 있었다.'
  if (truthRevealed) return '내가 지켜 낸 것은 관계가 아니라, 계속 달릴 수 있는 나였다.'
  if (elapsed >= 58) return '사랑을 보낼수록 하트만 사라지고 거리는 그대로였다.'
  if (elapsed >= 28) return '나는 모든 낌새를 그저 장애물이라고 불렀다.'
  return '아직은 따라잡을 수 있을 것 같았다.'
}

export function meterLabel(state: GameState): string {
  if (state.truthRevealed) return '혼자 설 힘'
  if (state.elapsed >= 42) return '관계 HP?'
  return '우리 사이'
}

export function stepModel(state: GameState, deltaSeconds: number): StepResult {
  const result: StepResult = { events: [], phaseChanged: false }
  if (state.phase !== 'running' || state.paused) return result

  const delta = Math.min(deltaSeconds, 0.05)
  state.elapsed = Math.min(RUN_SECONDS, state.elapsed + delta)
  state.jumpCooldown = Math.max(0, state.jumpCooldown - delta)
  state.fireCooldown = Math.max(0, state.fireCooldown - delta)
  state.hitTimer = Math.max(0, state.hitTimer - delta)
  state.revealTimer = Math.max(0, state.revealTimer - delta)
  state.stageFlashTimer = Math.max(0, state.stageFlashTimer - delta)

  state.playerVelocity -= 4.8 * delta
  state.playerY += state.playerVelocity * delta
  if (state.playerY <= 0) {
    state.playerY = 0
    state.playerVelocity = 0
  }

  state.strength = Math.min(100, state.strength + delta * 0.16)

  if (!state.truthRevealed && state.elapsed >= 82) {
    state.truthRevealed = true
    state.revealTimer = 5.5
    state.feedback = '게이지의 이름이 바뀐다. 쌓인 것은 혼자 설 힘이었다.'
    state.feedbackKind = 'reveal'
    result.events.push({ kind: 'reveal', message: state.feedback })
  }

  const nextStage = Math.min(4, Math.floor(state.elapsed / (RUN_SECONDS / 4)) + 1)
  if (nextStage > state.stage) {
    state.stage = nextStage
    state.stageFlashTimer = 3.2
    state.feedback = `${state.stage}층. 더 빠른 말들이 앞에서 쏟아진다.`
    state.feedbackKind = 'stage'
    result.events.push({ kind: 'stage', message: state.feedback })
  }

  state.spawnTimer -= delta
  if (state.spawnTimer <= 0) {
    spawnHazard(state)
    const progress = state.elapsed / RUN_SECONDS
    state.spawnTimer = 2.65 - progress * 0.75
  }

  const speed = 0.165 + (state.elapsed / RUN_SECONDS) * 0.035
  for (const hazard of state.hazards) hazard.x -= speed * delta
  for (const shot of state.shots) shot.x += 0.48 * delta

  resolveShotHits(state, result.events)
  resolvePlayerHits(state, result.events)

  state.hazards = state.hazards.filter((hazard) => !hazard.resolved && hazard.x > 0.04)
  state.shots = state.shots.filter((shot) => shot.x < PARTNER_X + 0.02)

  for (const shot of [...state.shots]) {
    if (shot.x >= PARTNER_X - 0.025) {
      state.heartsReachedPartner += 1
      state.strength = Math.min(100, state.strength + 0.35)
      state.feedback = '하트는 닿았지만, 28m의 거리는 줄지 않았다.'
      state.feedbackKind = 'fire'
      state.shots = state.shots.filter((candidate) => candidate.id !== shot.id)
    }
  }

  if (state.elapsed >= RUN_SECONDS) {
    state.phase = 'final-line'
    state.hazards = []
    state.shots = []
    state.playerY = 0
    state.playerVelocity = 0
    state.paused = false
    state.feedback = '마지막 문장은 점프도, 사랑도 통과시키지 않는다.'
    state.feedbackKind = 'blocked'
    result.phaseChanged = true
    result.events.push({ kind: 'blocked', message: state.feedback })
  }

  return result
}

function spawnHazard(state: GameState): void {
  const index = Math.floor(state.elapsed / 2.2)
  const kind: HazardKind = index % 5 === 2 ? 'coin' : index % 3 === 1 ? 'sign' : 'word'
  const list = kind === 'word' ? WORDS : kind === 'sign' ? SIGNS : ['기억 조각']
  state.hazards.push({
    id: state.nextEntityId++,
    kind,
    label: list[index % list.length] ?? list[0] ?? '',
    x: PARTNER_X - 0.045,
    resolved: false,
  })
}

function resolveShotHits(state: GameState, events: ModelEvent[]): void {
  for (const shot of state.shots) {
    const hazard = state.hazards.find(
      (candidate) => candidate.kind === 'word' && !candidate.resolved && Math.abs(candidate.x - shot.x) < 0.045,
    )
    if (!hazard) continue

    hazard.resolved = true
    shot.x = PARTNER_X + 1
    state.avoided += 1
    state.strength = Math.min(100, state.strength + 1.45)
    state.feedback = `“${hazard.label}”을 사랑으로 밀어냈다.`
    state.feedbackKind = 'clear'
    events.push({ kind: 'clear', message: state.feedback })
  }
}

function resolvePlayerHits(state: GameState, events: ModelEvent[]): void {
  for (const hazard of state.hazards) {
    if (hazard.resolved || hazard.x > PLAYER_X + 0.035) continue

    if (hazard.kind === 'coin') {
      hazard.resolved = true
      if (state.playerY > 0.28) {
        state.coins += 1
        state.strength = Math.min(100, state.strength + 2.1)
        state.feedback = '공중의 기억 조각을 모았다.'
        state.feedbackKind = 'coin'
        events.push({ kind: 'coin', message: state.feedback })
      }
      continue
    }

    const clearedByJump = hazard.kind === 'sign' ? state.playerY > 0.38 : state.playerY > 0.62
    hazard.resolved = true
    if (clearedByJump) {
      state.avoided += 1
      state.strength = Math.min(100, state.strength + 1.25)
      state.feedback = `“${hazard.label}”을 보지 않고 뛰어넘었다.`
      state.feedbackKind = 'clear'
      events.push({ kind: 'clear', message: state.feedback })
    } else {
      state.stumbled += 1
      state.hitTimer = 0.38
      state.strength = Math.min(100, state.strength + 0.55)
      state.feedback = `“${hazard.label}”에 걸렸지만 다시 달린다.`
      state.feedbackKind = 'stumble'
      events.push({ kind: 'stumble', message: state.feedback })
    }
  }
}
