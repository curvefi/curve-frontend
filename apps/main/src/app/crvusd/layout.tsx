import '@/global-extensions'
import { type ReactNode } from 'react'
import { CrvUsdClientLayout } from '@/app/crvusd/client'

export default function CrvUsdLayout({ children }: { children: ReactNode }) {
  return <CrvUsdClientLayout>{children}</CrvUsdClientLayout>
}
