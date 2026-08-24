export default function Home() {
  return (
    <main className="game-host">
      <iframe
        className="game-frame"
        src="/game/index.html"
        title="GO AHEAD — 끝나지 않은 타석"
        allow="autoplay"
        referrerPolicy="same-origin"
        allowFullScreen
      />
      <noscript>
        이 게임을 플레이하려면 JavaScript를 켜 주세요.{' '}
        <a href="/game/index.html">게임 직접 열기</a>
      </noscript>
    </main>
  );
}
