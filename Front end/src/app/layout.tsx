import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Leitor ADV — Triagem jurídica automatizada',
  description: 'Sistema de leitura e extração estruturada de peças jurídicas. OCR + IA. Agência Borges.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
