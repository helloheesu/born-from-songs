import type { Metadata } from 'next';
import './globals.css';

const title = 'GO AHEAD — 끝나지 않은 타석';
const description =
  '성장, 노화, 은퇴와 복귀를 타격 판정의 변화로 느끼는 짧은 타이밍 야구 게임';

export const metadata: Metadata = {
  metadataBase: new URL(
    'https://born-from-songs-go-ahead.pandapillow.chatgpt.site',
  ),
  title,
  description,
  openGraph: {
    title,
    description,
    type: 'website',
    locale: 'ko_KR',
    images: [{ url: '/og.png', width: 1200, height: 722, alt: title }],
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
