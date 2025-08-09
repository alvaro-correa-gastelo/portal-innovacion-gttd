import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Portal de Innovación GTTD - UTP',
  description: 'Portal interno de la UTP para gestión de innovación y tecnología',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={inter.className} suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  )
}
