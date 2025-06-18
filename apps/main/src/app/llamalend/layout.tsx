import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { App } from './client'

export const metadata: Metadata = {
  title: {
    template: '%s - Curve LlamaLend',
    default: 'LlamaLend - Curve',
  },
  description: 'LlamaLend - Decentralized lending and borrowing on Curve Finance',
}

export default function LlamaLendLayout({ children }: { children: ReactNode }) {
  return <App>{children}</App>
}
