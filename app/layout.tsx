import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { BadmintonProvider } from '@/contexts/BadmintonContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Badminton Rotation Manager',
  description: 'A Progressive Web App for managing badminton player rotation and game scheduling',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Badminton PWA',
  },
  generator: 'v0.dev'
}

export function generateViewport() {
  return {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    themeColor: '#000000',
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/icon-192x192.svg" />
        <link rel="apple-touch-icon" href="/icon-192x192.svg" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Badminton PWA" />
      </head>
      <body className={inter.className}>
        <BadmintonProvider>
          {children}
        </BadmintonProvider>
      </body>
    </html>
  )
}
