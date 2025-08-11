'use client'
import '@/global-extensions'
import { type ReactNode, useEffect } from 'react'
import type { CrvUsdServerData } from '@/app/api/crvusd/types'
import { setAppStatsDailyVolume } from '@/loan/entities/appstats-daily-volume'
import { networks, networksIdMapper } from '@/loan/networks'
import useStore from '@/loan/store/useStore'
import type { UrlParams } from '@/loan/types/loan.types'
import { recordValues } from '@curvefi/prices-api/objects.util'
import { useParams } from '@ui-kit/hooks/router'
import { useHydration } from '@ui-kit/hooks/useHydration'
import { useRedirectToEth } from '@ui-kit/hooks/useRedirectToEth'
import { logSuccess } from '@ui-kit/lib'
import { useGasInfoAndUpdateLib } from '@ui-kit/lib/model/entities/gas-info'

export function useInjectServerData(serverData: CrvUsdServerData) {
  useEffect(() => {
    const { mintMarkets, dailyVolume } = serverData
    dailyVolume && setAppStatsDailyVolume({}, dailyVolume)
    logSuccess('useInjectServerData', { mintMarkets: recordValues(mintMarkets ?? {}).flat().length })
  }, [serverData])
}

export function CrvUsdClientLayout({ children, serverData }: { children: ReactNode; serverData: CrvUsdServerData }) {
  useInjectServerData(serverData)
  const { network: networkId = 'ethereum' } = useParams() as Partial<UrlParams> // network absent only in root
  const chainId = networksIdMapper[networkId]
  const hydrate = useStore((s) => s.hydrate)
  const isHydrated = useHydration('llamaApi', hydrate, chainId)

  useGasInfoAndUpdateLib({ chainId, networks }) // Refresh gas info on a regular interval, relies on a side-effect
  useRedirectToEth(networks[chainId], networkId, isHydrated)

  return isHydrated && children
}
