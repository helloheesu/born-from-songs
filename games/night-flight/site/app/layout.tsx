import type { Metadata } from 'next';
import './globals.css';

const title = '야간비행';
const description =
  '무채색 우주비행사가 지나가는 궤도와 공명하며 색과 익명의 흔적을 이어받는 90초 물리 게임';

export const metadata: Metadata = {
  metadataBase: new URL(
    'https://born-from-songs-night-flight-solitude.pandapillow.chatgpt.site',
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
