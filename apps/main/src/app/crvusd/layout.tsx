'use client'
import '@/global-extensions'
import { headers } from 'next/headers'
import { useParams } from 'next/navigation'
import { type ReactNode, use, useEffect } from 'react'
import type { CrvUsdServerData } from '@/app/api/crvusd/types'
import { getServerData } from '@/background'
import { setAppStatsDailyVolume } from '@/loan/entities/appstats-daily-volume'
import { networks, networksIdMapper } from '@/loan/networks'
import useStore from '@/loan/store/useStore'
import type { UrlParams } from '@/loan/types/loan.types'
import { useConnection } from '@ui-kit/features/connect-wallet'
import { useLayoutStore } from '@ui-kit/features/layout'
import { useHydration } from '@ui-kit/hooks/useHydration'
import usePageVisibleInterval from '@ui-kit/hooks/usePageVisibleInterval'
import { useRedirectToEth } from '@ui-kit/hooks/useRedirectToEth'
import { logSuccess } from '@ui-kit/lib'
import { REFRESH_INTERVAL } from '@ui-kit/lib/model'

function useInjectServerData() {
  const props = use(getServerData<CrvUsdServerData>('crvusd', use(headers())))
  useEffect(() => {
    const { mintMarkets, dailyVolume } = props
    dailyVolume && setAppStatsDailyVolume({}, dailyVolume)
    logSuccess('useInjectServerData', { mintMarkets: mintMarkets?.length })
  }, [props])
}

export default function CrvUsdLayout({ children }: { children: ReactNode }) {
  useInjectServerData()
  const { network: networkId = 'ethereum' } = useParams() as Partial<UrlParams> // network absent only in root
  const chainId = networksIdMapper[networkId]
  const { llamaApi: curve = null } = useConnection()
  const isPageVisible = useLayoutStore((state) => state.isPageVisible)
  const fetchAllStoredUsdRates = useStore((state) => state.usdRates.fetchAllStoredUsdRates)
  const fetchGasInfo = useStore((state) => state.gas.fetchGasInfo)
  const hydrate = useStore((s) => s.hydrate)

  const isHydrated = useHydration('llamaApi', hydrate, chainId)

  usePageVisibleInterval(
    () => {
      if (isPageVisible && curve) {
        void fetchAllStoredUsdRates(curve)
        void fetchGasInfo(curve)
      }
    },
    REFRESH_INTERVAL['5m'],
    isPageVisible,
  )

  useRedirectToEth(networks[chainId], networkId, isHydrated)

  return isHydrated && children
}
