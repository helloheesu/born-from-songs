export const aspirations = [
  {
    id: 'brave',
    label: '용감한 사람',
    short: '용감한',
    pieces: ['yong', 'gam'],
    description: '두려워도 먼저 한 걸음을 내딛는 사람',
  },
  {
    id: 'kind',
    label: '다정한 사람',
    short: '다정한',
    pieces: ['da', 'jeong'],
    description: '다른 사람의 속도를 오래 바라봐 주는 사람',
  },
  {
    id: 'free',
    label: '자유로운 사람',
    short: '자유로운',
    pieces: ['ja', 'yu'],
    description: '자신의 궤도를 스스로 고르는 사람',
  },
] as const

export type AspirationId = (typeof aspirations)[number]['id']

export const destinations = [
  {
    id: 'first-door',
    name: '낯선 문의 행성',
    kind: 'planet',
    x: 16,
    y: 22,
    fragmentId: 'yong',
    fragment: '용',
    memoryTitle: '문 앞에서',
    memoryBody: '모두가 망설이던 날, 너는 완벽히 준비되지 않은 채로 먼저 문을 열었다.',
    reflection: '용기는 두려움이 사라진 뒤가 아니라, 두려움과 함께 움직인 순간에 남았다.',
    accent: '#f5bb68',
  },
  {
    id: 'slow-comet',
    name: '느린 혜성',
    kind: 'star',
    x: 70,
    y: 17,
    fragmentId: 'gam',
    fragment: '감',
    memoryTitle: '조금 더 가까이',
    memoryBody: '길을 잃은 밤에도, 너는 멀리 있는 작은 불빛을 향해 한 번 더 몸을 밀었다.',
    reflection: '앞으로 간 거리는 짧았지만, 멈춰 있던 궤도는 그때 처음 바뀌었다.',
    accent: '#8fd8ff',
  },
  {
    id: 'waiting-moon',
    name: '기다림의 위성',
    kind: 'moon',
    x: 84,
    y: 45,
    fragmentId: 'da',
    fragment: '다',
    memoryTitle: '같은 속도가 아니어도',
    memoryBody: '먼저 도착할 수 있었지만, 너는 뒤처진 사람과 나란히 걷기 위해 속도를 늦췄다.',
    reflection: '기다린 시간은 사라진 시간이 아니라 둘이 함께 가진 시간이 되었다.',
    accent: '#d9b8ff',
  },
  {
    id: 'signal-station',
    name: '안부의 정거장',
    kind: 'station',
    x: 63,
    y: 78,
    fragmentId: 'jeong',
    fragment: '정',
    memoryTitle: '짧은 신호',
    memoryBody: '멀어진 사람에게 무슨 말을 해야 할지 몰라서, 너는 그저 잘 지내냐는 신호를 보냈다.',
    reflection: '짧은 안부 하나가 끊어진 줄 알았던 궤도를 잠시 다시 이었다.',
    accent: '#ff9eb9',
  },
  {
    id: 'open-orbit',
    name: '열린 궤도의 별',
    kind: 'star',
    x: 20,
    y: 76,
    fragmentId: 'ja',
    fragment: '자',
    memoryTitle: '정해진 길 밖으로',
    memoryBody: '누구나 같은 방향으로 가던 날, 너는 오래 바라본 작은 샛길을 골랐다.',
    reflection: '다른 길은 틀린 길이 아니었다. 네가 직접 선택한 첫 번째 궤도였다.',
    accent: '#9ee5c2',
  },
  {
    id: 'quiet-sun',
    name: '고요한 작은 태양',
    kind: 'sun',
    x: 39,
    y: 45,
    fragmentId: 'yu',
    fragment: '유',
    memoryTitle: '머물고 떠나는 일',
    memoryBody: '좋아하는 곳에 충분히 머문 뒤, 너는 아쉬움을 품은 채 다음 여행을 선택했다.',
    reflection: '자유는 계속 떠나는 일이 아니라, 머물 곳과 떠날 때를 스스로 정하는 일이었다.',
    accent: '#ffe28a',
  },
] as const

export type DestinationId = (typeof destinations)[number]['id']
export type FragmentId = (typeof destinations)[number]['fragmentId']

export const phaseData = [
  {
    id: 'evening',
    label: '초저녁',
    age: '열여덟의 여행자',
    year: 18,
    copy: '아직 우주는 넓고, 몸은 가볍다.',
  },
  {
    id: 'midnight',
    label: '한밤',
    age: '서른하나의 여행자',
    year: 31,
    copy: '지나온 별들이 몸 주위에 작은 궤도를 만든다.',
  },
  {
    id: 'predawn',
    label: '새벽 전',
    age: '마흔여덟의 여행자',
    year: 48,
    copy: '움직임은 느려졌지만, 어디로 갈지는 더 선명하다.',
  },
  {
    id: 'dawn',
    label: '동틀 녘',
    age: '예순일곱의 여행자',
    year: 67,
    copy: '모은 경험이 오래된 빛처럼 곁에 남아 있다.',
  },
] as const

export type PhaseId = (typeof phaseData)[number]['id']

export function phaseIndexForVisitCount(count: number) {
  if (count >= 6) return 3
  if (count >= 4) return 2
  if (count >= 2) return 1
  return 0
}

export function aspirationById(id: AspirationId | null) {
  return aspirations.find((aspiration) => aspiration.id === id) ?? null
}

export function destinationById(id: DestinationId | null) {
  return destinations.find((destination) => destination.id === id) ?? null
}

export function identityForFragments(fragmentIds: readonly FragmentId[]) {
  if (fragmentIds.length !== 2) return null
  return (
    aspirations.find((aspiration) =>
      aspiration.pieces.every((piece) => fragmentIds.includes(piece as FragmentId)),
    ) ?? null
  )
}
