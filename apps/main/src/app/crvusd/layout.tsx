import '@/global-extensions'
import { type ReactNode } from 'react'
import type { CrvUsdServerData } from '@/app/api/crvusd/types'
import { CrvUsdClientLayout } from '@/app/crvusd/client'
import { getServerData } from '@/background'

export default async function CrvUsdLayout({ children }: { children: ReactNode }) {
  const serverData = await getServerData<CrvUsdServerData>('crvusd', new Headers())
  return <CrvUsdClientLayout serverData={serverData}>{children}</CrvUsdClientLayout>
}
