import type { Metadata } from 'next';
import './globals.css';

const title = '희수 깨우기';
const description =
  '소리, 빛, 온도를 조절해 화나지 않게 희수를 깨우는 짧은 환경 퍼즐';

export const metadata: Metadata = {
  metadataBase: new URL('https://heesu-wakeup.pandapillow.chatgpt.site'),
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
