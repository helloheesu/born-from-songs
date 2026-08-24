import { copy } from './content.ts'

export type FragmentId = 'umbrella' | 'shoulder'
export type LetterSlot = 'rain' | 'turn'

interface StoryFragment {
  id: FragmentId
  number: string
  label: string
  observation: string
  slot: LetterSlot
  color: 'blue' | 'pink'
}

export const fragments: Record<FragmentId, StoryFragment> = {
  umbrella: {
    id: 'umbrella',
    number: '01',
    get label() {
      return copy('fragment.umbrella.label')
    },
    get observation() {
      return copy('fragment.umbrella.observation')
    },
    slot: 'rain',
    color: 'blue',
  },
  shoulder: {
    id: 'shoulder',
    number: '02',
    get label() {
      return copy('fragment.shoulder.label')
    },
    get observation() {
      return copy('fragment.shoulder.observation')
    },
    slot: 'turn',
    color: 'pink',
  },
}
