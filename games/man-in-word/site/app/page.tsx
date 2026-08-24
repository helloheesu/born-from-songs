type HomeProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const dynamic = 'force-dynamic';

export default async function Home({ searchParams }: HomeProps) {
  const incoming = await searchParams;
  const query = new URLSearchParams();
  const copy = Array.isArray(incoming.copy) ? incoming.copy[0] : incoming.copy;
  const token = Array.isArray(incoming.token) ? incoming.token[0] : incoming.token;

  if (copy === 'draft' && token && /^[a-zA-Z0-9_-]{16,160}$/.test(token)) {
    query.set('copy', 'draft');
    query.set('token', token);
  }

  const gameSrc = `/game/index.html${query.size ? `?${query.toString()}` : ''}`;

  return (
    <main className="game-host">
      <iframe
        className="game-frame"
        src={gameSrc}
        title="말보다 먼저 — 한 사이클 프로토타입"
        allow="autoplay"
        referrerPolicy="same-origin"
      />
      <noscript>
        이 게임을 플레이하려면 JavaScript를 켜 주세요.{' '}
        <a href={gameSrc}>게임 직접 열기</a>
      </noscript>
    </main>
  );
}
