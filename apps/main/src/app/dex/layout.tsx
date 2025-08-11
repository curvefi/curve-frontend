'use client'
import '@/global-extensions'
import { useParams } from '@ui-kit/hooks/router'
import { type ReactNode, use, useCallback, useEffect, useState } from 'react'
import curvejsApi from '@/dex/lib/curvejs'
import { getNetworkDefs } from '@/dex/lib/networks'
import useStore from '@/dex/store/useStore'
import type { CurveApi } from '@/dex/types/main.types'
import { type UrlParams } from '@/dex/types/main.types'
import { recordValues } from '@curvefi/prices-api/objects.util'
import type { NetworkDef } from '@ui/utils'
import { useConnection } from '@ui-kit/features/connect-wallet'
import { useLayoutStore } from '@ui-kit/features/layout'
import { useHydration } from '@ui-kit/hooks/useHydration'
import usePageVisibleInterval from '@ui-kit/hooks/usePageVisibleInterval'
import { useRedirectToEth } from '@ui-kit/hooks/useRedirectToEth'
import { REFRESH_INTERVAL } from '@ui-kit/lib/model'
import { useGasInfoAndUpdateLib } from '@ui-kit/lib/model/entities/gas-info'

const useAutoRefresh = (networkDef: NetworkDef) => {
  const { curveApi } = useConnection()

  const isPageVisible = useLayoutStore((state) => state.isPageVisible)
  const fetchPools = useStore((state) => state.pools.fetchPools)
  const poolDataMapper = useStore((state) => state.pools.poolsMapper[networkDef.chainId])
  const fetchPoolsVolume = useStore((state) => state.pools.fetchPoolsVolume)
  const fetchPoolsTvl = useStore((state) => state.pools.fetchPoolsTvl)
  const setTokensMapper = useStore((state) => state.tokens.setTokensMapper)
  const fetchAllStoredBalances = useStore((state) => state.userBalances.fetchAllStoredBalances)
  const network = useStore((state) => state.networks.networks[networkDef.chainId])
  const networks = useStore((state) => state.networks.networks)

  // Refresh gas info on a regular interval, relies on a side-effect
  useGasInfoAndUpdateLib({ chainId: networkDef.chainId, networks })

  const fetchPoolsVolumeTvl = useCallback(
    async (curve: CurveApi) => {
      const { chainId } = curve
      const poolsData = Object.values(poolDataMapper)
      await Promise.all([fetchPoolsVolume(chainId, poolsData), fetchPoolsTvl(curve, poolsData)])
      void setTokensMapper(chainId, poolsData)
    },
    [fetchPoolsTvl, fetchPoolsVolume, poolDataMapper, setTokensMapper],
  )

  const refetchPools = useCallback(async () => {
    if (!curveApi || !network) return console.warn('Curve API or network is not defined, cannot refetch pools')
    const poolIds = await curvejsApi.network.fetchAllPoolsList(curveApi, network)
    void fetchPools(curveApi, poolIds, null)
  }, [curveApi, fetchPools, network])

  usePageVisibleInterval(
    () => {
      if (curveApi) {
        void fetchPoolsVolumeTvl(curveApi)

        if (curveApi.signerAddress) {
          void fetchAllStoredBalances(curveApi)
        }
      }
    },
    REFRESH_INTERVAL['5m'],
    isPageVisible,
  )

  usePageVisibleInterval(refetchPools, REFRESH_INTERVAL['11m'], isPageVisible && !!curveApi && !!network)
}

export default function DexLayout({ children }: { children: ReactNode }) {
  const networks = use(getNetworkDefs())
  const { network: networkId = 'ethereum' } = useParams() as Partial<UrlParams> // network absent only in root
  const [appLoaded, setAppLoaded] = useState(false)
  const fetchNetworks = useStore((state) => state.networks.fetchNetworks)
  const hydrate = useStore((s) => s.hydrate)

  const network = recordValues(networks).find((n) => n.id === networkId)!
  const isHydrated = useHydration('curveApi', hydrate, network.chainId)
  useRedirectToEth(network, networkId, isHydrated)

  useEffect(() => {
    const abort = new AbortController()
    void (async () => {
      try {
        await fetchNetworks()
      } finally {
        if (!abort.signal.aborted) {
          setAppLoaded(true)
        }
      }
    })()
    return () => {
      setAppLoaded(false)
      abort.abort()
    }
  }, [fetchNetworks])

  useAutoRefresh(network)
  return appLoaded && isHydrated && children
}
