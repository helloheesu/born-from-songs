import type { Metadata } from 'next';
import './globals.css';

const title = '야간비행';
const description =
  '별과 행성 사이를 유영하며 기억과 글자 조각으로 자신의 답을 완성하는 짧은 탐색 게임';

export const metadata: Metadata = {
  metadataBase: new URL(
    'https://born-from-songs-night-flight.pandapillow.chatgpt.site',
  ),
  title,
  description,
  openGraph: {
    title,
    description,
    type: 'website',
    locale: 'ko_KR',
    images: [{ url: '/og.png', width: 1440, height: 900, alt: title }],
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    images: ['/og.png'],
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
