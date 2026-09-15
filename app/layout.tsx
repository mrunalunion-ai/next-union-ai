// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import '../styles/globals.css';
import { AppProviders } from "@/components/provider/provider";
import { inter } from '@/lib/fonts';
import { Metadata } from 'next';

const APP_NAME = 'UnionAI';
const APP_URL = 'https://unionai.org';
const APP_DESCRIPTION = 'The intelligent Relationship Union Score and wellness app built to secure your lifetime bond.'

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL || 'http://localhost:3000'),
  title: {
    default: APP_NAME,
    template: `%s | ${APP_NAME}`,
  },
  description:
    APP_DESCRIPTION,
  keywords:
    '',
  icons: {
    icon: [
      {
        url: '/favicon_2.ico',
        sizes: '16x16',
        type: 'image/png',
      },
      {
        url: '/favicon_2.ico',
        sizes: '32x32',
        type: 'image/png',
      },
    ],
    shortcut: '/favicon_2.ico',
    // apple: [
    //   {
    //     url: '/apple-touch-icon.png',
    //     sizes: '180x180',
    //     type: 'image/png',
    //   },
    // ],
    other: [
      {
        rel: 'web-app-manifest-192x192',
        url: '/web-app-manifest-192x192.png',
        sizes: '192x192',
      },
    ],
  },
  manifest: '/manifest.json',
  openGraph: {
    title: APP_NAME,
    description:
      APP_DESCRIPTION,
    url: APP_URL,
    siteName: APP_NAME,
    type: "website",
    images: [
      {
        url: `${APP_URL}/assets/icons/metadata-image-og.jpg`,
        width: 1200,
        height: 630,
        alt: APP_NAME,
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: APP_NAME,
    description: APP_DESCRIPTION,
    images: [`${APP_URL}/assets/icons/metadata-image-og.jpg`],
    creator: '@we-are-everywhere',
  },

  alternates: {
    canonical: APP_URL,
  },
  other: {
    'og:title': APP_NAME,
    'og:description': APP_DESCRIPTION,
    'og:image': `${APP_URL}/assets/icons/metadata-image-og.jpg`,
    'og:image:width': '1200',
    'og:image:height': '630',
    'og:url': APP_URL,
    'og:type': 'website',
    'og:site_name': APP_NAME,
  },
  // robots: {
  //   index: true,
  //   follow: true,
  //   googleBot: {
  //     index: true,
  //     follow: true,
  //     'max-snippet': -1,
  //     'max-image-preview': 'large',
  //     'max-video-preview': -1,
  //   },
  // },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.variable}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
