import './style.css'
import {
  MAX_ANGER,
  TOTAL_TIME,
  advanceGame,
  createGameState,
  evaluateEnvironment,
  stageForWake,
  type GameState,
  type SleepStage,
} from './game'

const app = document.querySelector<HTMLDivElement>('#app')!
const announcer = document.querySelector<HTMLDivElement>('#announcer')!

if (!app || !announcer) throw new Error('Game root is missing')

const stageCopy: Record<SleepStage, { label: string; hint: string; next: string }> = {
  0: { label: 'Deep Sleep', hint: '먼저, 너무 크지 않은 소리를 오래 들려 주세요.', next: '조명' },
  1: { label: 'REM', hint: '눈꺼풀이 움직여요. 커튼을 천천히 열어 보세요.', next: '온도' },
  2: { label: 'Almost Awake', hint: '이불 속이 더워요. 편안한 온도를 찾아 주세요.', next: 'Awake' },
}

let state: GameState = createGameState()
let lastFrame = performance.now()
let renderedSecond = -1
let renderedStage: SleepStage = 0
let renderedAnger = 0
let soundContext: AudioContext | null = null
let microphoneContext: AudioContext | null = null
let microphoneStream: MediaStream | null = null
let microphoneAnalyser: AnalyserNode | null = null
let microphoneData: Uint8Array<ArrayBuffer> | null = null
let microphoneActive = false
let microphonePending = false
let microphoneRequestId = 0
let microphoneMessage = '선택 입력'

const bestScoreKey = 'sister-wakeup-best-score'

function escapeHtml(value: string): string {
  return value.replace(/[&<>'"]/g, (character) => {
    const entities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;',
    }
    return entities[character] ?? character
  })
}

function announce(message: string): void {
  announcer.textContent = ''
  window.setTimeout(() => {
    announcer.textContent = message
  }, 20)
}

function readBestScore(): number {
  try {
    return Number.parseInt(localStorage.getItem(bestScoreKey) ?? '0', 10) || 0
  } catch {
    return 0
  }
}

function saveBestScore(score: number): number {
  const best = Math.max(readBestScore(), score)
  try {
    localStorage.setItem(bestScoreKey, String(best))
  } catch {
    // The game remains playable when storage is unavailable.
  }
  return best
}

function tone(frequency: number, duration = 0.08, volume = 0.035): void {
  try {
    soundContext ??= new AudioContext()
    const oscillator = soundContext.createOscillator()
    const gain = soundContext.createGain()
    oscillator.type = 'sine'
    oscillator.frequency.value = frequency
    gain.gain.setValueAtTime(volume, soundContext.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.0001, soundContext.currentTime + duration)
    oscillator.connect(gain).connect(soundContext.destination)
    oscillator.start()
    oscillator.stop(soundContext.currentTime + duration)
  } catch {
    // Audio feedback is optional.
  }
}

function stageTone(stage: SleepStage): void {
  tone(stage === 1 ? 440 : 554, 0.12, 0.045)
  window.setTimeout(() => tone(stage === 1 ? 554 : 659, 0.15, 0.04), 90)
}

function resultTone(success: boolean): void {
  const notes = success ? [523, 659, 784] : [220, 185, 147]
  notes.forEach((note, index) => window.setTimeout(() => tone(note, 0.22, 0.05), index * 125))
}

function roomMarkup(stage: SleepStage): string {
  const expression = state.anger >= 7 ? 'furious' : state.anger >= 4 ? 'grumpy' : stage === 2 ? 'stirring' : 'sleeping'
  const curtainOpen = Math.max(0, Math.min(100, state.light))
  const warmth = Math.max(0, Math.min(1, (state.temperature - 16) / 14))

  return `
    <section class="room" style="--light:${state.light}; --curtain:${curtainOpen}%; --warmth:${warmth}" aria-label="희수가 잠든 방">
      <div class="window" aria-hidden="true">
        <div class="sky"><span></span><span></span><span></span></div>
        <div class="curtain curtain-left"></div>
        <div class="curtain curtain-right"></div>
      </div>
      <div class="clock" aria-label="남은 시간 ${Math.ceil(state.remaining)}초">${formatTime(state.remaining)}</div>
      <div class="air-lines ${stage === 2 ? 'visible' : ''}" aria-hidden="true"><i></i><i></i><i></i></div>
      <div class="bed" aria-hidden="true">
        <div class="headboard"></div>
        <div class="pillow"></div>
        <div class="sleeper ${expression}">
          <span class="hair"></span>
          <span class="face"><i class="eye eye-a"></i><i class="eye eye-b"></i><i class="mouth"></i></span>
        </div>
        <div class="blanket"></div>
        <div class="sleep-marks ${stage === 2 ? 'small' : ''}"><b>Z</b><b>z</b><b>z</b></div>
      </div>
      <div class="room-reaction" aria-live="polite">${escapeHtml(reactionCopy(stage))}</div>
    </section>
  `
}

function reactionCopy(stage: SleepStage): string {
  const evaluation = evaluateEnvironment(state)
  if (state.anger >= 8) return '이제 진짜 화낸다…!'
  if (state.sound > 75) return '으으… 너무 시끄러워.'
  if (stage >= 1 && state.light > 82) return '눈부셔… 천천히.'
  if (stage >= 2 && state.temperature < 18.5) return '추워. 이불 다시 덮을래.'
  if (stage >= 2 && evaluation.temperatureQuality > 0.9) return '이 온도… 괜찮은데?'
  if (stage >= 1 && evaluation.lightQuality > 0.9) return '아침인가…'
  if (evaluation.soundQuality > 0.9) return stage === 0 ? '…응? 무슨 소리지?' : '조금 들려…'
  return stage === 0 ? '새근… 새근…' : stage === 1 ? '뒤척…' : '곧 눈을 뜰 것 같아요.'
}

function gaugeMarkup(stage: SleepStage): string {
  return `
    <section class="wake-panel" aria-label="수면 단계와 분노">
      <div class="panel-heading">
        <div>
          <span class="eyebrow">SLEEP CYCLE</span>
          <strong>${stageCopy[stage].label}</strong>
        </div>
        <span class="wake-number">${Math.floor(state.wake)}<small>%</small></span>
      </div>
      <div class="wake-track" role="progressbar" aria-label="기상 진행도" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(state.wake)}">
        <span style="width:${state.wake}%"></span>
        <i class="marker marker-one"></i>
        <i class="marker marker-two"></i>
      </div>
      <div class="stage-labels"><span>Deep Sleep</span><span>REM</span><span>Awake</span></div>
      <div class="anger-row">
        <span class="eyebrow">ANGRY</span>
        <div class="anger-pips" role="meter" aria-label="분노 횟수" aria-valuemin="0" aria-valuemax="10" aria-valuenow="${state.anger}">
          ${Array.from({ length: MAX_ANGER }, (_, index) => `<i class="${index < state.anger ? 'filled' : ''}"></i>`).join('')}
        </div>
        <strong>${state.anger}<small> / 10</small></strong>
      </div>
    </section>
  `
}

function qualityLabel(value: number): string {
  if (value > 0.86) return '편안함'
  if (value > 0.35) return '반응 있음'
  return '반응 없음'
}

function controlsMarkup(stage: SleepStage): string {
  const evaluation = evaluateEnvironment(state)
  return `
    <section class="controls" aria-label="방 환경 조절">
      <article class="control-card active-control">
        <div class="control-title"><span class="control-icon sound-icon" aria-hidden="true">)))</span><div><strong>소리</strong><small>${qualityLabel(evaluation.soundQuality)}</small></div><output>${Math.round(state.sound)} dB</output></div>
        <label class="range-label" for="sound-range">소리 크기</label>
        <input id="sound-range" data-control="sound" type="range" min="0" max="100" step="1" value="${state.sound}" aria-describedby="sound-guide" ${microphoneActive ? 'disabled' : ''} />
        <div id="sound-guide" class="range-guide"><span>쉿</span><span>적당히</span><span>쾅</span></div>
        <div class="card-actions">
          <button class="small-button" data-action="toggle-sound" type="button">Space · 적당한 소리</button>
          <button class="small-button ${microphoneActive ? 'is-on' : ''}" data-action="microphone" type="button" ${microphonePending ? 'aria-disabled="true" aria-busy="true"' : ''}>${microphonePending ? '권한 확인 중…' : microphoneActive ? '마이크 끄기' : '마이크 켜기'}</button>
        </div>
        <p class="microphone-status">${escapeHtml(microphoneMessage)}</p>
      </article>

      <article class="control-card ${stage >= 1 ? 'active-control' : 'locked-control'}">
        <div class="control-title"><span class="control-icon light-icon" aria-hidden="true">☼</span><div><strong>조명</strong><small>${stage >= 1 ? qualityLabel(evaluation.lightQuality) : 'REM에서 열림'}</small></div><output>${Math.round(state.light)}%</output></div>
        <label class="range-label" for="light-range">커튼 열기</label>
        <input id="light-range" data-control="light" type="range" min="0" max="100" step="1" value="${state.light}" ${stage < 1 ? 'disabled' : ''} />
        <div class="range-guide"><span>어둡게</span><span>은은하게</span><span>눈부심</span></div>
        ${stage < 1 ? '<span class="lock-note">먼저 소리로 깊은 잠을 깨워 주세요.</span>' : ''}
      </article>

      <article class="control-card ${stage >= 2 ? 'active-control' : 'locked-control'}">
        <div class="control-title"><span class="control-icon temp-icon" aria-hidden="true">≈</span><div><strong>온도</strong><small>${stage >= 2 ? qualityLabel(evaluation.temperatureQuality) : 'Almost Awake에서 열림'}</small></div><output>${state.temperature.toFixed(1)}°</output></div>
        <label class="range-label" for="temp-range">방 온도</label>
        <input id="temp-range" data-control="temperature" type="range" min="16" max="30" step="0.5" value="${state.temperature}" ${stage < 2 ? 'disabled' : ''} />
        <div class="range-guide"><span>차가움</span><span>포근함</span><span>더움</span></div>
        ${stage < 2 ? '<span class="lock-note">눈을 뜰 듯하면 온도를 맞출 수 있어요.</span>' : ''}
      </article>
    </section>
  `
}

function titleMarkup(): string {
  const best = readBestScore()
  return `
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
        ${best ? `<p class="best-score">BEST ${best.toLocaleString('ko-KR')}</p>` : ''}
      </section>
      <div class="title-bed" aria-hidden="true">
        <div class="title-moon"></div>
        <div class="mini-bed"><span class="mini-head"></span><span class="mini-blanket"></span></div>
        <div class="giant-z"><b>Z</b><i>z</i><em>z</em></div>
      </div>
    </main>
  `
}

function gameMarkup(): string {
  const stage = stageForWake(state.wake)
  return `
    <main class="game-screen">
      <header class="game-header">
        <div class="brand"><span>WAKE</span><strong>희수 깨우기</strong></div>
        <div class="mission-copy"><span>현재 목표</span><strong>${escapeHtml(stageCopy[stage].hint)}</strong></div>
        <div class="time-pill ${state.remaining <= 15 ? 'urgent' : ''}"><small>남은 시간</small><strong>${formatTime(state.remaining)}</strong></div>
      </header>
      <div class="play-grid">
        <div class="room-column">
          ${roomMarkup(stage)}
          ${gaugeMarkup(stage)}
        </div>
        <div class="control-column">
          <div class="unlock-note"><span>ROUND ${stage + 1} / 3</span><strong>다음: ${stageCopy[stage].next}</strong></div>
          ${controlsMarkup(stage)}
        </div>
      </div>
    </main>
  `
}

function resultMarkup(success: boolean): string {
  const best = success ? saveBestScore(state.score) : readBestScore()
  const resultTitle = success ? 'You did it!' : state.failureReason === 'anger' ? 'Too angry!' : 'Too late!'
  const description = success
    ? `희수가 ${TOTAL_TIME - Math.ceil(state.remaining)}초 만에 화내지 않고 일어났어요.`
    : state.failureReason === 'anger'
      ? '갑자기 바뀐 환경에 결국 이불을 뒤집어썼습니다.'
      : '알람이 끝났지만 희수는 다시 깊이 잠들었습니다.'

  return `
    <main class="result-screen ${success ? 'success-result' : 'failure-result'}">
      <section class="result-card">
        <span class="result-eyebrow">WAKE-UP REPORT</span>
        <div class="grade" aria-label="등급 ${success ? 'A 플러스' : 'F'}">${success ? 'A+' : 'F'}</div>
        <h1>${resultTitle}</h1>
        <p>${description}</p>
        <div class="report-grid">
          <div><small>WAKE</small><strong>${Math.floor(state.wake)}%</strong></div>
          <div><small>ANGRY</small><strong>${state.anger} / 10</strong></div>
          <div><small>TIME</small><strong>${formatTime(state.remaining)}</strong></div>
          <div><small>SCORE</small><strong>${success ? state.score.toLocaleString('ko-KR') : '—'}</strong></div>
        </div>
        ${success ? `<p class="best-score">BEST ${best.toLocaleString('ko-KR')}</p>` : ''}
        <button class="primary-button" data-action="restart" type="button">다시 깨우기 <span>R</span></button>
      </section>
      <div class="result-character ${success ? 'awake' : 'hidden'}" aria-hidden="true">
        <span class="result-hair"></span><span class="result-face"><i></i><b></b></span>
        <p>${success ? 'Thank you, sister!' : '5분만 더…'}</p>
      </div>
    </main>
  `
}

function formatTime(seconds: number): string {
  const rounded = Math.max(0, Math.ceil(seconds))
  const minutes = Math.floor(rounded / 60)
  return `${String(minutes).padStart(2, '0')}:${String(rounded % 60).padStart(2, '0')}`
}

function render(focusHeading = false): void {
  const activeElement = document.activeElement instanceof HTMLElement && app.contains(document.activeElement)
    ? document.activeElement
    : null
  const previousFocus = activeElement
    ? { id: activeElement.id, action: activeElement.dataset.action ?? null }
    : null

  if (state.phase === 'title') app.innerHTML = titleMarkup()
  else if (state.phase === 'playing') app.innerHTML = gameMarkup()
  else app.innerHTML = resultMarkup(state.phase === 'success')

  if (focusHeading) {
    const destination = app.querySelector<HTMLElement>('h1') ?? app.querySelector<HTMLElement>('main')
    if (!destination) return
    destination.tabIndex = -1
    destination.focus({ preventScroll: true })
    return
  }

  if (!previousFocus) return
  const byId = previousFocus.id ? document.getElementById(previousFocus.id) : null
  const byAction = previousFocus.action
    ? Array.from(app.querySelectorAll<HTMLElement>('[data-action]')).find((element) => element.dataset.action === previousFocus.action) ?? null
    : null
  const previousDestination = byId instanceof HTMLElement && app.contains(byId) ? byId : byAction
  const destination = previousDestination instanceof HTMLInputElement && previousDestination.disabled
    ? app.querySelector<HTMLElement>('input[data-control]:not(:disabled), button[data-action]:not([aria-disabled="true"])')
    : previousDestination
  destination?.focus({ preventScroll: true })
}

function refreshPlayingUi(): void {
  if (state.phase !== 'playing') return

  const stage = stageForWake(state.wake)
  const evaluation = evaluateEnvironment(state)
  const time = formatTime(state.remaining)

  const timePill = app.querySelector<HTMLElement>('.time-pill')
  timePill?.classList.toggle('urgent', state.remaining <= 15)
  const headerTime = timePill?.querySelector<HTMLElement>('strong')
  if (headerTime) headerTime.textContent = time

  const clock = app.querySelector<HTMLElement>('.clock')
  if (clock) {
    clock.textContent = time
    clock.setAttribute('aria-label', `남은 시간 ${Math.ceil(state.remaining)}초`)
  }

  const wakeNumber = app.querySelector<HTMLElement>('.wake-number')
  if (wakeNumber) wakeNumber.innerHTML = `${Math.floor(state.wake)}<small>%</small>`
  const wakeTrack = app.querySelector<HTMLElement>('.wake-track')
  wakeTrack?.setAttribute('aria-valuenow', String(Math.round(state.wake)))
  const wakeFill = wakeTrack?.querySelector<HTMLElement>(':scope > span')
  if (wakeFill) wakeFill.style.width = `${state.wake}%`

  const angerMeter = app.querySelector<HTMLElement>('.anger-pips')
  angerMeter?.setAttribute('aria-valuenow', String(state.anger))
  angerMeter?.querySelectorAll<HTMLElement>('i').forEach((pip, index) => pip.classList.toggle('filled', index < state.anger))
  const angerValue = app.querySelector<HTMLElement>('.anger-row > strong')
  if (angerValue) angerValue.innerHTML = `${state.anger}<small> / 10</small>`

  const room = app.querySelector<HTMLElement>('.room')
  room?.style.setProperty('--light', String(state.light))
  room?.style.setProperty('--curtain', `${state.light}%`)
  room?.style.setProperty('--warmth', String(Math.max(0, Math.min(1, (state.temperature - 16) / 14))))

  const expression = state.anger >= 7 ? 'furious' : state.anger >= 4 ? 'grumpy' : stage === 2 ? 'stirring' : 'sleeping'
  const sleeper = app.querySelector<HTMLElement>('.sleeper')
  sleeper?.classList.remove('furious', 'grumpy', 'stirring', 'sleeping')
  sleeper?.classList.add(expression)

  const reaction = app.querySelector<HTMLElement>('.room-reaction')
  const nextReaction = reactionCopy(stage)
  if (reaction && reaction.textContent !== nextReaction) reaction.textContent = nextReaction

  const controlState = {
    sound: { value: state.sound, output: `${Math.round(state.sound)} dB`, quality: qualityLabel(evaluation.soundQuality) },
    light: { value: state.light, output: `${Math.round(state.light)}%`, quality: stage >= 1 ? qualityLabel(evaluation.lightQuality) : 'REM에서 열림' },
    temperature: { value: state.temperature, output: `${state.temperature.toFixed(1)}°`, quality: stage >= 2 ? qualityLabel(evaluation.temperatureQuality) : 'Almost Awake에서 열림' },
  }

  app.querySelectorAll<HTMLInputElement>('input[data-control]').forEach((input) => {
    const control = input.dataset.control as keyof typeof controlState | undefined
    if (!control) return
    const current = controlState[control]
    input.value = String(current.value)
    const card = input.closest<HTMLElement>('.control-card')
    const output = card?.querySelector<HTMLOutputElement>('output')
    if (output) output.textContent = current.output
    const quality = card?.querySelector<HTMLElement>('.control-title small')
    if (quality) quality.textContent = current.quality
  })
}

function startGame(): void {
  stopMicrophone()
  state = { ...createGameState(), phase: 'playing' }
  lastFrame = performance.now()
  renderedSecond = Math.ceil(state.remaining)
  renderedStage = 0
  renderedAnger = 0
  microphoneMessage = '선택 입력'
  tone(392, 0.1)
  render(true)
  announce('게임 시작. 소리 조절만 사용할 수 있습니다.')
}

function setSoundToComfortable(): void {
  if (microphoneActive || state.phase !== 'playing') return
  if (state.sound >= 40 && state.sound <= 65) {
    state.sound = 0
  } else {
    state.sound = 52
  }
  state.actions += 1
  refreshPlayingUi()
  announce(state.sound === 0 ? '적당한 소리를 껐습니다.' : '적당한 소리를 켰습니다.')
}

async function toggleMicrophone(): Promise<void> {
  if (state.phase !== 'playing') return
  if (microphonePending) return
  if (microphoneActive) {
    stopMicrophone()
    microphoneMessage = '마이크를 껐어요. 슬라이더를 사용하세요.'
    render()
    return
  }

  if (!navigator.mediaDevices?.getUserMedia) {
    microphoneMessage = '이 브라우저에서는 마이크를 쓸 수 없어요. 슬라이더로 플레이할 수 있습니다.'
    render()
    return
  }

  const requestId = ++microphoneRequestId
  microphonePending = true
  microphoneMessage = '마이크 권한을 기다리는 중…'
  render()

  let requestedStream: MediaStream | null = null
  let requestedContext: AudioContext | null = null
  try {
    requestedStream = await navigator.mediaDevices.getUserMedia({ audio: true })
    if (requestId !== microphoneRequestId || state.phase !== 'playing') {
      requestedStream.getTracks().forEach((track) => track.stop())
      return
    }

    requestedContext = new AudioContext()
    const source = requestedContext.createMediaStreamSource(requestedStream)
    const analyser = requestedContext.createAnalyser()
    analyser.fftSize = 512
    const data = new Uint8Array(analyser.fftSize)
    source.connect(analyser)

    microphoneStream = requestedStream
    microphoneContext = requestedContext
    microphoneAnalyser = analyser
    microphoneData = data
    microphoneActive = true
    microphonePending = false
    microphoneMessage = '마이크 입력 중 · 실제 소리의 상대 크기를 사용합니다.'
    state.actions += 1
    render()
    announce('마이크 입력을 시작했습니다.')
  } catch {
    requestedStream?.getTracks().forEach((track) => track.stop())
    if (requestedContext && requestedContext.state !== 'closed') void requestedContext.close()
    if (requestId !== microphoneRequestId) return
    microphonePending = false
    microphoneMessage = '권한을 받지 못했어요. 소리 슬라이더로 계속 플레이할 수 있습니다.'
    render()
    announce('마이크를 사용할 수 없어 슬라이더 입력을 유지합니다.')
  }
}

function stopMicrophone(): void {
  microphoneRequestId += 1
  microphonePending = false
  microphoneStream?.getTracks().forEach((track) => track.stop())
  if (microphoneContext && microphoneContext.state !== 'closed') void microphoneContext.close()
  microphoneContext = null
  microphoneStream = null
  microphoneAnalyser = null
  microphoneData = null
  microphoneActive = false
}

function sampleMicrophone(): void {
  if (!microphoneActive || !microphoneAnalyser || !microphoneData) return
  microphoneAnalyser.getByteTimeDomainData(microphoneData)
  let sum = 0
  for (const sample of microphoneData) {
    const normalized = (sample - 128) / 128
    sum += normalized * normalized
  }
  const rms = Math.sqrt(sum / microphoneData.length)
  const mapped = Math.max(0, Math.min(100, 20 + rms * 330))
  state.sound = state.sound * 0.72 + mapped * 0.28
}

function onControlInput(input: HTMLInputElement): void {
  if (state.phase !== 'playing') return
  const value = Number.parseFloat(input.value)
  const control = input.dataset.control
  if (control === 'sound' && !microphoneActive) state.sound = value
  if (control === 'light' && stageForWake(state.wake) >= 1) state.light = value
  if (control === 'temperature' && stageForWake(state.wake) >= 2) state.temperature = value

  refreshPlayingUi()
}

function onControlCommit(): void {
  if (state.phase === 'playing') state.actions += 1
}

function frame(now: number): void {
  const deltaSeconds = Math.min(0.1, Math.max(0, (now - lastFrame) / 1000))
  lastFrame = now

  if (state.phase === 'playing') {
    sampleMicrophone()
    const previousStage = stageForWake(state.wake)
    const previousAnger = state.anger
    state = advanceGame(state, deltaSeconds)

    if (state.phase !== 'playing') {
      stopMicrophone()
      resultTone(state.phase === 'success')
      render(true)
      announce(state.phase === 'success' ? '성공. A 플러스.' : '실패. 다시 시도할 수 있습니다.')
    } else {
      const currentStage = stageForWake(state.wake)
      const currentSecond = Math.ceil(state.remaining)
      const stageChanged = currentStage !== previousStage
      const angerChanged = state.anger !== previousAnger

      if (stageChanged) {
        stageTone(currentStage)
        announce(`${stageCopy[currentStage].label} 단계. ${stageCopy[currentStage].hint}`)
        render()
      } else {
        if (angerChanged) {
          tone(130, 0.13, 0.055)
          announce(`화남 ${state.anger}회`)
        }
        if (angerChanged || currentSecond !== renderedSecond || currentStage !== renderedStage || state.anger !== renderedAnger) {
          refreshPlayingUi()
        }
      }

      renderedSecond = currentSecond
      renderedStage = currentStage
      renderedAnger = state.anger
    }
  }

  requestAnimationFrame(frame)
}

app.addEventListener('click', (event) => {
  const button = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-action]')
  if (!button) return
  const action = button.dataset.action
  if (action === 'start' || action === 'restart') startGame()
  if (action === 'toggle-sound') setSoundToComfortable()
  if (action === 'microphone') void toggleMicrophone()
})

app.addEventListener('input', (event) => {
  if (event.target instanceof HTMLInputElement) onControlInput(event.target)
})

app.addEventListener('change', (event) => {
  if (event.target instanceof HTMLInputElement) onControlCommit()
})

window.addEventListener('keydown', (event) => {
  if (event.code === 'Space' && state.phase === 'playing' && !event.repeat) {
    const target = event.target as HTMLElement
    if (target.matches('input, button')) return
    event.preventDefault()
    setSoundToComfortable()
  }
  if (event.code === 'Space' && state.phase === 'title') {
    event.preventDefault()
    startGame()
  }
  if (event.key.toLowerCase() === 'r' && (state.phase === 'success' || state.phase === 'failure')) startGame()
})

document.addEventListener('visibilitychange', () => {
  lastFrame = performance.now()
})

window.addEventListener('beforeunload', stopMicrophone)

render()
requestAnimationFrame(frame)
