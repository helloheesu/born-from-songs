import type { Metadata } from 'next';
import './globals.css';

const title = '마지막 문장';
const description =
  '점프와 사랑 공격으로 이별의 말을 피하다가 마지막 문장을 받아들이는 짧은 아케이드 러너';

export const metadata: Metadata = {
  metadataBase: new URL(
    'https://born-from-songs-last-sentence.pandapillow.chatgpt.site',
  ),
  title,
  description,
  openGraph: {
    title,
    description,
    type: 'website',
    locale: 'ko_KR',
    images: [{ url: '/og.png', width: 1200, height: 760, alt: title }],
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
