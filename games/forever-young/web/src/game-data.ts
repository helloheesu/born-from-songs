export interface CareerYear {
  year: number
  age: number
  label: string
  chapter: 'rookie' | 'rise' | 'prime' | 'decline' | 'last'
  zoneWidth: number
  speed: number
  note: string
}

export const careerYears: CareerYear[] = [
  { year: 2005, age: 20, label: '첫해', chapter: 'rookie', zoneWidth: 0.14, speed: 0.56, note: '모든 공이 낯설었다.' },
  { year: 2006, age: 21, label: '성장', chapter: 'rise', zoneWidth: 0.18, speed: 0.54, note: '공이 조금 더 오래 보였다.' },
  { year: 2007, age: 22, label: '도약', chapter: 'rise', zoneWidth: 0.23, speed: 0.52, note: '내 스윙의 자리를 찾았다.' },
  { year: 2008, age: 23, label: '상승', chapter: 'rise', zoneWidth: 0.29, speed: 0.5, note: '관중이 내 이름을 외우기 시작했다.' },
  { year: 2009, age: 24, label: '전성기', chapter: 'prime', zoneWidth: 0.36, speed: 0.46, note: '세상이 공보다 느리게 움직였다.' },
  { year: 2010, age: 25, label: '전성기', chapter: 'prime', zoneWidth: 0.4, speed: 0.45, note: '어떤 공이 와도 칠 수 있었다.' },
  { year: 2011, age: 26, label: '유지', chapter: 'prime', zoneWidth: 0.34, speed: 0.48, note: '넓었던 순간은 오래 머물지 않았다.' },
  { year: 2012, age: 27, label: '하강', chapter: 'decline', zoneWidth: 0.25, speed: 0.53, note: '한 박자 늦는 날이 늘었다.' },
  { year: 2013, age: 28, label: '노화', chapter: 'decline', zoneWidth: 0.17, speed: 0.59, note: '가동 범위가 눈에 띄게 줄었다.' },
  { year: 2014, age: 29, label: '마지막 해', chapter: 'last', zoneWidth: 0.1, speed: 0.65, note: '보이는 공보다 몸이 먼저 멈췄다.' },
]

export interface RoutineBeat {
  day: number
  time: string
  action: string
  detail: string
  tone: 'morning' | 'commute' | 'evening' | 'night'
}

const oneDay: Omit<RoutineBeat, 'day'>[] = [
  { time: '06:40', action: '알람을 끈다', detail: '유니폼이 없는 아침.', tone: 'morning' },
  { time: '08:20', action: '같은 길을 걷는다', detail: '누구도 이름을 부르지 않는다.', tone: 'commute' },
  { time: '19:10', action: '혼자 저녁을 먹는다', detail: '중계 소리는 끈 채로.', tone: 'evening' },
  { time: '23:50', action: '불을 끈다', detail: '내일도 같은 시간에.', tone: 'night' },
]

export const routineBeats: RoutineBeat[] = Array.from({ length: 3 }, (_, dayIndex) =>
  oneDay.map((beat) => ({ ...beat, day: dayIndex + 1 })),
).flat()

export const trainingWindows = [0.1, 0.12, 0.15, 0.18, 0.22, 0.26, 0.31, 0.36]

export const pitchesPerYear = 3
