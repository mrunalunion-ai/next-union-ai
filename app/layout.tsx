// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import '../styles/globals.css';
import { AppProviders } from "@/components/provider/provider";
import { inter } from '@/lib/fonts';
import { Metadata } from 'next';

const APP_NAME = 'UnionAI App';
const APP_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://unionai.appristine.co.in";
const APP_DESCRIPTION = 'The intelligent Relationship Union Score and wellness app built to secure your lifetime bond.'

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: APP_NAME,
    template: `%s | ${APP_NAME}`,
  },
  applicationName: APP_NAME,
  description: APP_DESCRIPTION,
  keywords: [
    'relationship wellness app',
    'AI relationship coach',
    'couples communication app',
    'relationship health score',
    'relationship insights app'
  ],
  authors: [{ name: APP_NAME }],
  creator: APP_NAME,
  publisher: APP_NAME,
  icons: {
    icon: [
      {
        url: '/favicon_2.ico',
        sizes: '16x16',
        type: 'image/x-icon',
      },
      {
        url: '/favicon_2.ico',
        sizes: '32x32',
        type: 'image/x-icon',
      },
    ],
    shortcut: '/favicon_2.ico',
  },
  manifest: '/manifest.json',
  openGraph: {
    title: APP_NAME,
    description: APP_DESCRIPTION,
    url: APP_URL,
    siteName: APP_NAME,
    type: "website",
    locale: 'en_GB',
    images: [
      {
        url: `${APP_URL}/assets/images/metadata-image-og.jpg`,
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
    images: [`${APP_URL}/assets/images/metadata-image-og.jpg`],
    creator: '@unionaiapp',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-snippet': -1,
      'max-image-preview': 'large',
      'max-video-preview': -1,
    },
  },
};

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: APP_NAME,
  url: APP_URL,
  logo: `${APP_URL}/favicon_2.ico`,
  sameAs: [],
};

const webSiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: APP_NAME,
  url: APP_URL,
  description: APP_DESCRIPTION,
  inLanguage: 'en-GB',
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