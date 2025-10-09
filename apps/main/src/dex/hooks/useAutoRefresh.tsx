import { useCallback } from 'react'
import curvejsApi from '@/dex/lib/curvejs'
import useStore from '@/dex/store/useStore'
import type { NetworkDef } from '@ui/utils'
import { type CurveApi, useConnection } from '@ui-kit/features/connect-wallet'
import { useLayoutStore } from '@ui-kit/features/layout'
import usePageVisibleInterval from '@ui-kit/hooks/usePageVisibleInterval'
import { REFRESH_INTERVAL } from '@ui-kit/lib/model'
import { useGasInfoAndUpdateLib } from '@ui-kit/lib/model/entities/gas-info'
import { useNetworkByChain, useNetworks } from '../entities/networks'

export const useAutoRefresh = (networkDef: NetworkDef) => {
  const { curveApi } = useConnection()

  const isPageVisible = useLayoutStore((state) => state.isPageVisible)
  const fetchPools = useStore((state) => state.pools.fetchPools)
  const poolDataMapper = useStore((state) => state.pools.poolsMapper[networkDef.chainId])
  const fetchPoolsVolume = useStore((state) => state.pools.fetchPoolsVolume)
  const fetchPoolsTvl = useStore((state) => state.pools.fetchPoolsTvl)
  const setTokensMapper = useStore((state) => state.tokens.setTokensMapper)
  const fetchAllStoredBalances = useStore((state) => state.userBalances.fetchAllStoredBalances)

  const { data: networks } = useNetworks()
  const { data: network } = useNetworkByChain({ chainId: networkDef.chainId })

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
