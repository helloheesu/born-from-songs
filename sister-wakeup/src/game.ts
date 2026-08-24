export const TOTAL_TIME = 90
export const MAX_ANGER = 10

export type Phase = 'title' | 'playing' | 'success' | 'failure'

export type SleepStage = 0 | 1 | 2

export type GameState = {
  phase: Phase
  wake: number
  anger: number
  remaining: number
  sound: number
  light: number
  temperature: number
  stress: number
  actions: number
  score: number
  failureReason: 'anger' | 'time' | null
}

export type EnvironmentResult = {
  wakeRate: number
  stressRate: number
  soundQuality: number
  lightQuality: number
  temperatureQuality: number
}

export function createGameState(): GameState {
  return {
    phase: 'title',
    wake: 0,
    anger: 0,
    remaining: TOTAL_TIME,
    sound: 0,
    light: 8,
    temperature: 27.5,
    stress: 0,
    actions: 0,
    score: 0,
    failureReason: null,
  }
}

export function stageForWake(wake: number): SleepStage {
  if (wake >= 67) return 2
  if (wake >= 34) return 1
  return 0
}

function rangeQuality(value: number, minimum: number, maximum: number, falloff: number): number {
  if (value >= minimum && value <= maximum) return 1
  if (value < minimum) return Math.max(0, 1 - (minimum - value) / falloff)
  return Math.max(0, 1 - (value - maximum) / falloff)
}

export function evaluateEnvironment(state: GameState): EnvironmentResult {
  const stage = stageForWake(state.wake)
  const soundQuality = rangeQuality(state.sound, 42, 62, 24)
  const lightQuality = stage >= 1 ? rangeQuality(state.light, 38, 66, 30) : 0
  const temperatureQuality = stage >= 2 ? rangeQuality(state.temperature, 21, 23.5, 5.5) : 0

  let wakeRate = 0
  if (stage === 0) {
    wakeRate = soundQuality * 5.1
  } else if (stage === 1) {
    wakeRate = soundQuality * 0.8 + lightQuality * 4.1
  } else {
    wakeRate = soundQuality * 0.45 + lightQuality * 1.1 + temperatureQuality * 3.9
  }

  if (wakeRate < 0.3) wakeRate = -0.32
  if (stage >= 2 && state.temperature < 18.5) wakeRate -= 0.75

  const loudStress = state.sound > 70 ? (state.sound - 70) / 24 : 0
  const lightStress = stage >= 1 && state.light > 82 ? (state.light - 82) / 14 : 0
  const coldStress = stage >= 2 && state.temperature < 18.5 ? (18.5 - state.temperature) / 3.5 : 0
  const hotStress = stage >= 2 && state.temperature > 26 ? (state.temperature - 26) / 4 : 0

  return {
    wakeRate,
    stressRate: loudStress + lightStress + coldStress + hotStress,
    soundQuality,
    lightQuality,
    temperatureQuality,
  }
}

function successScore(state: GameState): number {
  return Math.max(0, Math.round(state.remaining * 75 + (MAX_ANGER - state.anger) * 260 - state.actions * 3))
}

export function advanceGame(state: GameState, deltaSeconds: number): GameState {
  if (state.phase !== 'playing') return state

  const result = evaluateEnvironment(state)
  const next: GameState = {
    ...state,
    remaining: Math.max(0, state.remaining - deltaSeconds),
    wake: Math.max(0, Math.min(100, state.wake + result.wakeRate * deltaSeconds)),
    stress: state.stress + result.stressRate * deltaSeconds,
  }

  if (next.stress >= 1) {
    const angerGained = Math.floor(next.stress)
    next.anger = Math.min(MAX_ANGER, next.anger + angerGained)
    next.stress -= angerGained
  }

  if (next.anger >= MAX_ANGER) {
    next.phase = 'failure'
    next.failureReason = 'anger'
    return next
  }

  if (next.wake >= 100) {
    next.phase = 'success'
    next.wake = 100
    next.score = successScore(next)
    return next
  }

  if (next.remaining <= 0) {
    next.phase = 'failure'
    next.failureReason = 'time'
  }

  return next
}
