import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '見積書デモアプリ',
  description: '見積書作成支援システム',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  )
}

