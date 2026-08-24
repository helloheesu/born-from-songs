import type { Metadata } from 'next';
import './globals.css';

const title = '말보다 먼저 — 한 사이클 프로토타입';
const description =
  '행동을 관찰해 빈 편지의 의미를 완성하는 짧은 포인트 앤 클릭 게임';

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    type: 'website',
    locale: 'ko_KR',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
