import type { Metadata } from 'next';
import './globals.css';

const title = '야간비행';
const description =
  '유한한 생애 동안 지나가는 행성의 중력을 읽고 궤도를 맞추며 서로에게 색을 남기는 짧은 물리 게임';

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
    images: [{ url: '/og.png', width: 1280, height: 720, alt: title }],
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
