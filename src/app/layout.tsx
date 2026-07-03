import { Geist, Geist_Mono } from 'next/font/google'
import type { Metadata } from 'next'

import './globals.css'

const geistSans = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans',
})

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
})

export const metadata: Metadata = {
  description:
    'Opinionated Next.js + TypeScript + Prisma + Tailwind starter with a strict code quality toolchain.',
  title: {
    default: 'Next.js Linting Template',
    template: '%s | Next.js Linting Template',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`} lang="en">
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  )
}
