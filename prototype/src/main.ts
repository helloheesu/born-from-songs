import './style.css'
import {
  copy,
  copyHtml,
  copyLines,
  escapeHtml,
  formatCopy,
  formatCopyHtml,
  getCopyMeta,
  loadCopy,
} from './content.ts'
import { fragments, type FragmentId, type LetterSlot } from './story.ts'

type Scene = 'title' | 'letter' | 'memory' | 'assembly' | 'reveal' | 'ending'
type FeedbackKind = 'info' | 'success' | 'error'

interface GameState {
  scene: Scene
  found: FragmentId[]
  placed: Partial<Record<LetterSlot, FragmentId>>
  selected: FragmentId | null
  observation: FragmentId | null
  feedback: string
  feedbackKind: FeedbackKind
  errorSlot: LetterSlot | null
}

const app = document.querySelector<HTMLDivElement>('#app')!
const liveRegion = document.querySelector<HTMLDivElement>('#live-region')!

let soundEnabled = true
let audioContext: AudioContext | null = null

const state: GameState = {
  scene: 'title',
  found: [],
  placed: {},
  selected: null,
  observation: null,
  feedback: copy('feedback.initial'),
  feedbackKind: 'info',
  errorSlot: null,
}

const stepForScene: Record<Scene, number> = {
  title: 0,
  letter: 1,
  memory: 2,
  assembly: 3,
  reveal: 4,
  ending: 4,
}

function resetGame() {
  state.scene = 'title'
  state.found = []
  state.placed = {}
  state.selected = null
  state.observation = null
  state.feedback = copy('feedback.initial')
  state.feedbackKind = 'info'
  state.errorSlot = null
  render()
}

function setScene(scene: Scene, feedback?: string) {
  state.scene = scene
  state.selected = null
  state.errorSlot = null
  if (feedback) {
    state.feedback = feedback
    state.feedbackKind = 'info'
  }
  playTone(scene === 'reveal' || scene === 'ending' ? 'reveal' : 'move')
  render(true)
}

function playTone(kind: 'move' | 'collect' | 'place' | 'error' | 'reveal') {
  if (!soundEnabled) return

  try {
    audioContext ??= new AudioContext()
    const now = audioContext.currentTime
    const notes: Record<typeof kind, number[]> = {
      move: [246.94],
      collect: [329.63, 493.88],
      place: [392, 523.25],
      error: [196, 174.61],
      reveal: [261.63, 329.63, 392, 523.25],
    }

    notes[kind].forEach((frequency, index) => {
      const oscillator = audioContext!.createOscillator()
      const gain = audioContext!.createGain()
      oscillator.type = kind === 'error' ? 'triangle' : 'sine'
      oscillator.frequency.value = frequency
      gain.gain.setValueAtTime(0.0001, now + index * 0.08)
      gain.gain.exponentialRampToValueAtTime(0.055, now + index * 0.08 + 0.018)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.08 + 0.32)
      oscillator.connect(gain).connect(audioContext!.destination)
      oscillator.start(now + index * 0.08)
      oscillator.stop(now + index * 0.08 + 0.34)
    })
  } catch {
    soundEnabled = false
  }
}

function progressMarkup() {
  if (state.scene === 'title') return ''
  const current = stepForScene[state.scene]
  const labels = [
    copy('global.progress.letter'),
    copy('global.progress.memory'),
    copy('global.progress.assembly'),
    copy('global.progress.reveal'),
  ]
  return `
    <ol class="progress" aria-label="게임 진행 단계">
      ${labels
        .map(
          (label, index) => `
            <li class="${index + 1 < current ? 'done' : ''} ${index + 1 === current ? 'current' : ''}">
              <span>${index + 1 < current ? '✓' : index + 1}</span>${escapeHtml(label)}
            </li>`,
        )
        .join('')}
    </ol>`
}

function headerMarkup() {
  if (state.scene === 'title') return ''
  return `
    <header class="game-header">
      <button class="brand" type="button" data-action="restart" aria-label="처음 화면으로 돌아가기">
        <span class="brand-mark" aria-hidden="true"></span>
        <span>${copyHtml('global.brand')}</span>
      </button>
      ${progressMarkup()}
      <button class="icon-button" type="button" data-action="toggle-sound" aria-pressed="${soundEnabled}" aria-label="효과음 ${soundEnabled ? '끄기' : '켜기'}">
        ${soundEnabled ? soundOnIcon() : soundOffIcon()}
        <span>${soundEnabled ? copyHtml('global.sound.on') : copyHtml('global.sound.off')}</span>
      </button>
    </header>`
}

function titleScene() {
  return `
    <main class="title-scene" aria-labelledby="scene-title">
      <div class="title-rain" aria-hidden="true"></div>
      <div class="title-copy">
        <p class="eyebrow">${copyHtml('title.eyebrow')}</p>
        <h1 id="scene-title">${copyHtml('title.heading')}</h1>
        <p class="title-lede">${copyLines('title.lede')}</p>
        <button class="primary-button large" type="button" data-action="start">
          ${copyHtml('title.start_button')} <span aria-hidden="true">→</span>
        </button>
        <p class="title-meta">${copyHtml('title.meta')}</p>
      </div>
      <div class="title-art" aria-hidden="true">
        ${envelopeIllustration()}
        <span class="floating-word word-a">${copyHtml('title.floating_a')}</span>
        <span class="floating-word word-b">${copyHtml('title.floating_b')}</span>
      </div>
      <p class="prototype-note">${copyHtml('title.prototype_note')}</p>
    </main>`
}

function openingLetterScene() {
  return sceneLayout(
    `
      <section class="letter-stage" aria-labelledby="scene-title">
        <div class="scene-heading">
          <p class="eyebrow">${copyHtml('letter.eyebrow')}</p>
          <h1 id="scene-title">${copyHtml('letter.heading')}</h1>
          <p>${copyHtml('letter.context')}</p>
        </div>
        <article class="letter-paper opening-letter" aria-label="빈칸이 있는 편지">
          <div class="letter-fold" aria-hidden="true"></div>
          <p class="letter-to">${copyHtml('letter.to')}</p>
          <p>${copyHtml('letter.avoid_line')}</p>
          <p>${formatCopyHtml('letter.rain_line', { fragment: '<span class="redacted" aria-label="읽히지 않는 첫 번째 문장">읽히지 않는 문장</span>' })}</p>
          <p>${formatCopyHtml('letter.turn_line', { fragment: '<span class="redacted short" aria-label="읽히지 않는 두 번째 문장">읽히지 않는 문장</span>' })}</p>
          <p>${copyHtml('letter.request_line')}</p>
          <div class="letter-sign">${copyHtml('letter.sign')}</div>
        </article>
        <div class="scene-actions">
          <button class="primary-button" type="button" data-action="enter-memory">
            ${copyHtml('letter.enter_memory_button')} <span aria-hidden="true">→</span>
          </button>
        </div>
      </section>`,
    letterRail(),
  )
}

function memoryScene() {
  const allFound = state.found.length === Object.keys(fragments).length
  return sceneLayout(
    `
      <section class="memory-stage" aria-labelledby="scene-title">
        <div class="scene-heading compact">
          <div>
            <p class="eyebrow">${copyHtml('memory.eyebrow')}</p>
            <h1 id="scene-title">${copyHtml('memory.heading')}</h1>
          </div>
          <p>${copyHtml('memory.instruction')}</p>
        </div>

        <div class="memory-canvas" aria-label="비 오는 정류장에서 두 사람이 투명 우산을 함께 쓰고 있다">
          <div class="rain" aria-hidden="true"></div>
          ${rainyMemoryIllustration()}
          ${hotspot('umbrella', copy('memory.hotspot_umbrella'), 'hotspot-umbrella')}
          ${hotspot('shoulder', copy('memory.hotspot_shoulder'), 'hotspot-shoulder')}
          <div class="memory-caption">${copyHtml('memory.caption')}</div>
        </div>

        <div class="observation ${state.observation ? 'visible' : ''}" aria-live="polite">
          ${
            state.observation
              ? `<span class="observation-index">${copyHtml('memory.observation_label')} ${state.found.indexOf(state.observation) + 1}</span>
                 <p>${escapeHtml(fragments[state.observation].observation)}</p>`
              : `<span class="observation-index">${copyHtml('memory.observation_label')}</span><p>${copyHtml('memory.empty_observation')}</p>`
          }
        </div>

        <div class="scene-actions split">
          <button class="text-button" type="button" data-action="back-to-letter">${copyHtml('memory.back_button')}</button>
          ${
            allFound
              ? `<button class="primary-button" type="button" data-action="assemble-letter">${copyHtml('memory.assemble_button')} <span aria-hidden="true">→</span></button>`
              : `<span class="action-hint">${formatCopyHtml('memory.found_count', { found: String(state.found.length), total: String(Object.keys(fragments).length) })}</span>`
          }
        </div>
      </section>`,
    inventoryRail(),
  )
}

function assemblyScene() {
  const complete = Boolean(state.placed.rain && state.placed.turn)
  return sceneLayout(
    `
      <section class="assembly-stage" aria-labelledby="scene-title">
        <div class="scene-heading compact">
          <div>
            <p class="eyebrow">${copyHtml('assembly.eyebrow')}</p>
            <h1 id="scene-title">${copyHtml('assembly.heading')}</h1>
          </div>
          <p>${copyHtml('assembly.instruction')}</p>
        </div>

        <article class="letter-paper assembly-letter" aria-label="표현 카드를 배치하는 편지">
          <p class="letter-to">${copyHtml('letter.to')}</p>
          <p>${copyHtml('letter.avoid_line')}</p>
          <p class="slot-line">${formatCopyHtml('letter.rain_line', { fragment: slotMarkup('rain', copy('assembly.slot_rain')) })}</p>
          <p class="slot-line">${formatCopyHtml('letter.turn_line', { fragment: slotMarkup('turn', copy('assembly.slot_turn')) })}</p>
          <p>${copyHtml('letter.request_line')}</p>
        </article>

        <div class="feedback ${state.feedbackKind}" aria-live="polite">
          <span aria-hidden="true">${state.feedbackKind === 'error' ? '↺' : state.feedbackKind === 'success' ? '✓' : '·'}</span>
          ${escapeHtml(state.feedback)}
        </div>

        <div class="scene-actions split">
          <button class="text-button" type="button" data-action="back-to-memory">${copyHtml('assembly.back_button')}</button>
          ${
            complete
              ? `<button class="primary-button warm" type="button" data-action="reveal-letter">${copyHtml('assembly.reveal_button')} <span aria-hidden="true">→</span></button>`
              : `<span class="action-hint">${formatCopyHtml('assembly.blank_count', { filled: String(Object.keys(state.placed).length), total: '2' })}</span>`
          }
        </div>
      </section>`,
    inventoryRail(true),
  )
}

function revealScene() {
  return sceneLayout(
    `
      <section class="reveal-stage" aria-labelledby="scene-title">
        <div class="scene-heading centered">
          <p class="eyebrow">${copyHtml('reveal.eyebrow')}</p>
          <h1 id="scene-title">${copyHtml('reveal.heading')}</h1>
        </div>

        <article class="letter-paper reveal-letter" aria-label="완성된 편지">
          <div class="warm-wash" aria-hidden="true"></div>
          <p class="letter-to">${copyHtml('letter.to')}</p>
          <p>${copyHtml('letter.avoid_line')}</p>
          <p>${formatCopyHtml('letter.rain_line', { fragment: `<mark>${escapeHtml(fragments.umbrella.label)}</mark>` })}</p>
          <p>${formatCopyHtml('letter.turn_line', { fragment: `<mark>${escapeHtml(fragments.shoulder.label)}</mark>` })}</p>
          <p class="revealed-copy">${copyLines('reveal.reason')}</p>
          <p class="revealed-copy">${copyLines('reveal.confession')}</p>
        </article>

        <div class="scene-actions centered-actions">
          <button class="primary-button warm large" type="button" data-action="approach">
            ${copyHtml('reveal.finish_button')} <span aria-hidden="true">→</span>
          </button>
        </div>
      </section>`,
    `<aside class="side-rail reveal-rail" aria-label="해석 완료">
      <div class="rail-label">${copyHtml('reveal.rail_label')}</div>
      <div class="interpretation-stamp"><span>${copyHtml('reveal.stamp_label')}</span><strong>${copyHtml('reveal.stamp_complete')}</strong></div>
      <p>${copyHtml('reveal.interpretation')}</p>
    </aside>`,
  )
}

function endingScene() {
  return `
    <main class="ending-scene" aria-labelledby="scene-title">
      <div class="ending-rain" aria-hidden="true"></div>
      <div class="ending-art" aria-hidden="true">${endingIllustration()}</div>
      <div class="ending-copy">
        <p class="eyebrow">${copyHtml('ending.eyebrow')}</p>
        <h1 id="scene-title">${copyHtml('ending.question')}</h1>
        <button class="approach-button" type="button" data-action="finish-ending">${copyHtml('ending.approach_button')}</button>
        <p class="ending-line" data-ending-line>${copyHtml('ending.final_line')}</p>
        <button class="text-button light ending-replay" type="button" data-action="replay" data-ending-replay hidden>${copyHtml('ending.replay_button')}</button>
      </div>
    </main>`
}

function sceneLayout(main: string, rail: string) {
  return `<main class="scene-grid">${main}${rail}</main>`
}

function letterRail() {
  return `
    <aside class="side-rail" aria-label="편지 정보">
      <div class="rail-label">${copyHtml('letter.rail_label')}</div>
      <div class="envelope-mini" aria-hidden="true"><span></span></div>
      <dl class="rail-stats">
        <div><dt>${copyHtml('letter.rail_read_label')}</dt><dd>2 / 4</dd></div>
        <div><dt>${copyHtml('letter.rail_blank_label')}</dt><dd>2</dd></div>
        <div><dt>${copyHtml('letter.rail_sender_label')}</dt><dd>${copyHtml('letter.rail_sender_unknown')}</dd></div>
      </dl>
      <p class="rail-note">${copyHtml('letter.rail_note')}</p>
    </aside>`
}

function inventoryRail(draggable = false) {
  return `
    <aside class="side-rail inventory-rail" aria-label="수집한 표현">
      <div class="rail-label">${copyHtml('inventory.label')}</div>
      <div class="inventory-count"><strong>${state.found.length}</strong><span>/ 2</span></div>
      <div class="inventory-list">
        ${
          state.found.length
            ? state.found.map((id) => fragmentCard(id, draggable)).join('')
            : `<div class="empty-card"><span>+</span><p>${copyLines('memory.empty_inventory')}</p></div>`
        }
      </div>
      ${
        draggable && state.found.some((id) => !Object.values(state.placed).includes(id))
          ? `<p class="rail-note">${copyHtml('assembly.inventory_note')}</p>`
          : ''
      }
    </aside>`
}

function fragmentCard(id: FragmentId, interactive: boolean) {
  const fragment = fragments[id]
  const placed = Object.values(state.placed).includes(id)
  const selected = state.selected === id
  const tag = interactive && !placed ? 'button' : 'div'
  return `
    <${tag}
      class="fragment-card ${fragment.color} ${placed ? 'placed' : ''} ${selected ? 'selected' : ''}"
      ${interactive && !placed ? `type="button" draggable="true" data-action="select-card" data-fragment="${id}" aria-pressed="${selected}"` : ''}
    >
      <span class="fragment-number">${fragment.number}</span>
      <span class="fragment-label">${escapeHtml(fragment.label)}</span>
      <span class="fragment-status">${placed ? copyHtml('assembly.card_placed') : selected ? copyHtml('assembly.card_selected') : copyHtml('assembly.card_new')}</span>
    </${tag}>`
}

function slotMarkup(slot: LetterSlot, label: string) {
  const fragmentId = state.placed[slot]
  const classes = ['word-slot', fragmentId ? 'filled' : '', state.errorSlot === slot ? 'error' : '', state.selected ? 'ready' : '']
    .filter(Boolean)
    .join(' ')
  return `
    <button class="${classes}" type="button" data-action="place-slot" data-slot="${slot}" aria-label="${escapeHtml(label + (fragmentId ? `, ${fragments[fragmentId].label} 배치됨` : ''))}">
      ${fragmentId ? `<span>${escapeHtml(fragments[fragmentId].label)}</span><small>${copyHtml('assembly.slot_remove')}</small>` : `<span>${escapeHtml(label)}</span><small>${copyHtml('assembly.slot_place')}</small>`}
    </button>`
}

function hotspot(id: FragmentId, label: string, className: string) {
  const found = state.found.includes(id)
  return `
    <button class="hotspot ${className} ${found ? 'found' : ''}" type="button" data-action="inspect" data-fragment="${id}" aria-label="${escapeHtml(label + (found ? ', 확인함' : ''))}">
      <span>${found ? '✓' : '+'}</span>
    </button>`
}

function inspectFragment(id: FragmentId) {
  const isNew = !state.found.includes(id)
  if (isNew) state.found.push(id)
  state.observation = id
  state.feedback = isNew ? formatCopy('feedback.found', { label: fragments[id].label }) : fragments[id].observation
  state.feedbackKind = isNew ? 'success' : 'info'
  playTone(isNew ? 'collect' : 'move')
  render(false, `[data-action="inspect"][data-fragment="${id}"]`)
}

function selectFragment(id: FragmentId) {
  if (Object.values(state.placed).includes(id)) return
  state.selected = state.selected === id ? null : id
  state.feedback = state.selected ? formatCopy('feedback.select', { label: fragments[id].label }) : copy('feedback.cancel')
  state.feedbackKind = 'info'
  const firstEmptySlot = (['rain', 'turn'] as LetterSlot[]).find((slot) => !state.placed[slot])
  render(
    false,
    state.selected && firstEmptySlot
      ? `[data-action="place-slot"][data-slot="${firstEmptySlot}"]`
      : `[data-action="select-card"][data-fragment="${id}"]`,
    Boolean(state.selected),
  )
}

function placeFragment(fragmentId: FragmentId, slot: LetterSlot) {
  if (!state.found.includes(fragmentId)) return

  const existingSlot = (Object.entries(state.placed) as [LetterSlot, FragmentId][]).find(([, id]) => id === fragmentId)?.[0]
  if (existingSlot) delete state.placed[existingSlot]

  if (fragments[fragmentId].slot !== slot) {
    state.feedback =
      fragmentId === 'shoulder'
        ? copy('feedback.wrong_shoulder')
        : copy('feedback.wrong_umbrella')
    state.feedbackKind = 'error'
    state.errorSlot = slot
    state.selected = null
    playTone('error')
    render(false, `[data-action="place-slot"][data-slot="${slot}"]`)
    window.setTimeout(() => {
      if (state.errorSlot === slot) {
        state.errorSlot = null
        render(false, `[data-action="select-card"][data-fragment="${fragmentId}"]`, true)
      }
    }, 650)
    return
  }

  const displaced = state.placed[slot]
  if (displaced && displaced !== fragmentId) delete state.placed[slot]
  state.placed[slot] = fragmentId
  state.selected = null
  state.errorSlot = null
  state.feedback = Object.keys(state.placed).length === 2 ? copy('feedback.placed_complete') : copy('feedback.placed_partial')
  state.feedbackKind = 'success'
  playTone('place')
  const nextCard = state.found.find((id) => !Object.values(state.placed).includes(id))
  render(false, nextCard ? `[data-action="select-card"][data-fragment="${nextCard}"]` : '[data-action="reveal-letter"]', true)
}

function removeFromSlot(slot: LetterSlot) {
  const fragmentId = state.placed[slot]
  if (!fragmentId) return
  delete state.placed[slot]
  state.feedback = copy('feedback.removed')
  state.feedbackKind = 'info'
  render(false, `[data-action="select-card"][data-fragment="${fragmentId}"]`, true)
}

function handleAction(action: string, target: HTMLElement) {
  switch (action) {
    case 'start':
      setScene('letter')
      break
    case 'restart':
      resetGame()
      break
    case 'enter-memory':
    case 'back-to-memory':
      setScene('memory', copy('memory.empty_observation'))
      break
    case 'back-to-letter':
      setScene('letter')
      break
    case 'inspect':
      inspectFragment(target.dataset.fragment as FragmentId)
      break
    case 'assemble-letter':
      setScene('assembly', copy('feedback.assembly_prompt'))
      break
    case 'select-card':
      selectFragment(target.dataset.fragment as FragmentId)
      break
    case 'place-slot': {
      const slot = target.dataset.slot as LetterSlot
      if (state.placed[slot]) removeFromSlot(slot)
      else if (state.selected) placeFragment(state.selected, slot)
      else {
        state.feedback = copy('feedback.choose_card')
        state.feedbackKind = 'info'
        const nextCard = state.found.find((id) => !Object.values(state.placed).includes(id))
        render(false, nextCard ? `[data-action="select-card"][data-fragment="${nextCard}"]` : undefined, Boolean(nextCard))
      }
      break
    }
    case 'reveal-letter':
      setScene('reveal', copy('feedback.reveal'))
      break
    case 'approach':
      setScene('ending', copy('feedback.ending'))
      break
    case 'finish-ending':
      target.setAttribute('disabled', 'true')
      target.textContent = copy('ending.approach_complete')
      document.querySelector('[data-ending-line]')?.classList.add('shown')
      document.querySelector('.ending-art')?.classList.add('together')
      document.querySelector<HTMLElement>('[data-ending-replay]')?.removeAttribute('hidden')
      state.feedback = copy('ending.final_line')
      announce(state.feedback)
      playTone('reveal')
      break
    case 'replay':
      resetGame()
      break
    case 'toggle-sound':
      soundEnabled = !soundEnabled
      if (soundEnabled) playTone('move')
      render()
      break
  }
}

app.addEventListener('click', (event) => {
  const target = (event.target as HTMLElement).closest<HTMLElement>('[data-action]')
  if (!target) return
  handleAction(target.dataset.action!, target)
})

app.addEventListener('dragstart', (event) => {
  const target = (event.target as HTMLElement).closest<HTMLElement>('[data-fragment]')
  if (!target || !event.dataTransfer) return
  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.setData('text/plain', target.dataset.fragment!)
})

app.addEventListener('dragend', () => {
  document.querySelectorAll('.drag-over').forEach((element) => element.classList.remove('drag-over'))
  state.selected = null
})

app.addEventListener('dragover', (event) => {
  const slot = (event.target as HTMLElement).closest<HTMLElement>('[data-slot]')
  if (!slot) return
  event.preventDefault()
  if (event.dataTransfer) event.dataTransfer.dropEffect = 'move'
  slot.classList.add('drag-over')
})

app.addEventListener('dragleave', (event) => {
  const slot = (event.target as HTMLElement).closest<HTMLElement>('[data-slot]')
  slot?.classList.remove('drag-over')
})

app.addEventListener('drop', (event) => {
  const slot = (event.target as HTMLElement).closest<HTMLElement>('[data-slot]')
  if (!slot || !event.dataTransfer) return
  event.preventDefault()
  slot.classList.remove('drag-over')
  placeFragment(event.dataTransfer.getData('text/plain') as FragmentId, slot.dataset.slot as LetterSlot)
})

function announce(message: string) {
  liveRegion.textContent = ''
  window.requestAnimationFrame(() => {
    liveRegion.textContent = message
  })
}

function copyStatusMarkup() {
  const wantsDraft = new URLSearchParams(window.location.search).get('copy') === 'draft'
  if (!wantsDraft) return ''

  const meta = getCopyMeta()
  if (meta.channel === 'draft' && !meta.usingFallback) {
    const release = meta.releaseId ? ` · 기준 ${escapeHtml(meta.releaseId)}` : ''
    return `<div class="copy-preview-banner" role="status">DRAFT 미리보기${release}</div>`
  }

  return '<div class="copy-preview-banner error" role="status">DRAFT 연결 실패 · 내장 문장으로 표시 중</div>'
}

function render(focusHeading = false, focusSelector?: string, scrollToFocus = false) {
  const content =
    state.scene === 'title'
      ? titleScene()
      : state.scene === 'letter'
        ? openingLetterScene()
        : state.scene === 'memory'
          ? memoryScene()
          : state.scene === 'assembly'
            ? assemblyScene()
            : state.scene === 'reveal'
              ? revealScene()
              : endingScene()

  app.innerHTML = `
    <div class="game-shell" data-scene="${state.scene}">
      ${copyStatusMarkup()}
      ${headerMarkup()}
      ${content}
    </div>`

  announce(state.feedback)

  if (focusHeading) {
    window.scrollTo({ top: 0, left: 0 })
    window.requestAnimationFrame(() => {
      const heading = document.querySelector<HTMLElement>('#scene-title')
      heading?.setAttribute('tabindex', '-1')
      heading?.focus({ preventScroll: true })
    })
  } else if (focusSelector) {
    window.requestAnimationFrame(() => {
      const target = document.querySelector<HTMLElement>(focusSelector)
      target?.focus({ preventScroll: !scrollToFocus })
      if (target && scrollToFocus && window.matchMedia('(max-width: 980px)').matches) {
        target.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    })
  }
}

function soundOnIcon() {
  return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10v4h4l5 4V6L8 10H4Z"/><path d="M16 9c1.4 1.6 1.4 4.4 0 6M18.5 6.5c3 3 3 8 0 11"/></svg>`
}

function soundOffIcon() {
  return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10v4h4l5 4V6L8 10H4Z"/><path d="m17 10 4 4m0-4-4 4"/></svg>`
}

function envelopeIllustration() {
  return `
    <svg class="envelope-illustration" viewBox="0 0 640 520">
      <defs><filter id="paper-shadow" x="-20%" y="-20%" width="140%" height="160%"><feDropShadow dx="0" dy="18" stdDeviation="18" flood-color="#06101d" flood-opacity=".32"/></filter></defs>
      <g filter="url(#paper-shadow)">
        <path d="M104 187 320 63l216 124v236H104Z" fill="#ebe3d6" stroke="#20304a" stroke-width="5"/>
        <path d="m105 190 215 161 215-161" fill="#f7f1e7" stroke="#20304a" stroke-width="5"/>
        <path d="m105 422 151-137 64 48 64-48 152 137" fill="#f1e8db" stroke="#20304a" stroke-width="5"/>
      </g>
      <path d="M183 135c63-56 198-58 272 4" fill="none" stroke="#d86f91" stroke-width="7" stroke-linecap="round" stroke-dasharray="1 17"/>
      <circle cx="182" cy="135" r="7" fill="#d86f91"/><circle cx="455" cy="139" r="7" fill="#4d83a7"/>
    </svg>`
}

function rainyMemoryIllustration() {
  return `
    <svg class="memory-illustration" viewBox="0 0 1000 560" role="img" aria-hidden="true">
      <defs>
        <linearGradient id="memory-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7593a6"/><stop offset="1" stop-color="#c8d2cf"/></linearGradient>
        <linearGradient id="puddle" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#91adbc" stop-opacity=".1"/><stop offset=".5" stop-color="#e7eee9" stop-opacity=".8"/><stop offset="1" stop-color="#91adbc" stop-opacity=".12"/></linearGradient>
      </defs>
      <rect width="1000" height="560" fill="url(#memory-sky)"/>
      <path d="M0 416C180 395 340 436 514 412s330-6 486 4v144H0Z" fill="#34495b" opacity=".36"/>
      <path d="M0 438h1000" stroke="#e6eee8" stroke-opacity=".45" stroke-width="3"/>
      <ellipse cx="525" cy="492" rx="270" ry="24" fill="url(#puddle)"/>
      <g opacity=".62" stroke="#26394d" fill="none" stroke-width="7"><path d="M90 88h820"/><path d="M122 88v345M878 88v345"/><path d="M70 432h860"/><path d="M129 155h742" stroke-width="3"/></g>
      <g fill="none" stroke="#d96f91" stroke-width="12" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="438" cy="260" r="37" fill="#d9a0b3" fill-opacity=".18"/><path d="M438 299c-29 40-30 98-27 150M411 348l-48 65M417 446l-35 74M436 447l40 72"/><path d="M449 313c22 22 34 50 38 82" stroke-width="8"/>
      </g>
      <g fill="none" stroke="#356f99" stroke-width="12" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="624" cy="254" r="38" fill="#5891b4" fill-opacity=".18"/><path d="M618 294c25 38 30 97 31 154M641 341l58 48M645 447l-24 74M661 447l48 68"/><path d="M605 315c-28 22-41 53-45 84" stroke-width="8"/><path d="M648 303c30 18 40 57 36 94" stroke="#77a9c4" stroke-width="15" opacity=".72"/>
      </g>
      <g fill="none" stroke-linecap="round" stroke-linejoin="round">
        <path d="M306 226c56-111 304-126 439 1-42-13-70-5-94 19-31-25-72-30-111-9-31-28-75-30-112-5-37-20-79-19-122-6Z" fill="#eff5f2" fill-opacity=".55" stroke="#2e536e" stroke-width="7"/>
        <path d="M540 231v184c0 42 58 42 58 3" stroke="#2e536e" stroke-width="7"/><path d="M540 237c-20-33-62-40-112-5M540 237c35-28 77-23 111 9" stroke="#557a91" stroke-width="3" opacity=".8"/>
      </g>
      <g stroke="#b8e2ef" stroke-width="5" stroke-linecap="round"><path d="M686 301l-12 26M700 309l-11 25M713 319l-9 23"/></g>
      <g opacity=".52" stroke="#e8f3f4" stroke-width="3" stroke-linecap="round"><path d="M115 128l-20 48M180 183l-17 41M815 132l-23 53M862 230l-19 45M242 106l-17 40M776 296l-15 35M93 276l-20 45"/></g>
    </svg>`
}

function endingIllustration() {
  return `
    <svg viewBox="0 0 720 640">
      <defs><linearGradient id="end-sky" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#1a2942"/><stop offset="1" stop-color="#314d63"/></linearGradient></defs>
      <rect width="720" height="640" rx="40" fill="url(#end-sky)"/><path d="M120 520h480" stroke="#e7eadf" stroke-opacity=".38" stroke-width="3"/>
      <g class="end-figure end-pink" fill="none" stroke="#df7a99" stroke-width="12" stroke-linecap="round"><circle cx="288" cy="285" r="36"/><path d="M288 322v132M288 360l-53 54M288 455l-38 78M288 455l41 78"/></g>
      <g class="end-figure end-blue" fill="none" stroke="#6ea5c5" stroke-width="12" stroke-linecap="round"><circle cx="441" cy="278" r="36"/><path d="M441 316v138M441 356l52 55M441 455l-38 78M441 455l42 78"/></g>
      <g fill="none" stroke="#e8f0eb" stroke-linecap="round" stroke-linejoin="round"><path d="M186 260c54-111 286-119 378 0-38-15-73-8-95 17-35-24-73-24-106-1-32-24-70-24-103 1-22-24-46-31-74-17Z" fill="#e8f0eb" fill-opacity=".08" stroke-width="7"/><path d="M364 271v194c0 37 49 39 51 5" stroke-width="7"/></g>
      <path class="closing-gap" d="M356 362h18" stroke="#f0c474" stroke-width="6" stroke-linecap="round"/>
    </svg>`
}

async function bootstrap() {
  await loadCopy()
  state.feedback = copy('feedback.initial')
  render()
}

void bootstrap()
