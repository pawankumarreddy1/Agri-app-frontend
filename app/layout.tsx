import type { Metadata } from 'next'
import { DM_Sans, Fraunces } from 'next/font/google'
import './globals.css'

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'AgriConnect — Bulk farm orders for hostels, PGs & markets',
  description:
    'Farmers list bulk produce at a fixed rate. Hostels, PGs, messes and wholesale markets buy by delivery date on AgriConnect.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${dmSans.variable} ${fraunces.variable}`}>
      <body className="font-sans antialiased bg-[var(--bg)] text-[var(--ink)]">{children}</body>
    </html>
  )
}
