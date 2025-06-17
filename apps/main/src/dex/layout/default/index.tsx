import { ReactNode, useCallback } from 'react'
import curvejsApi from '@/dex/lib/curvejs'
import useStore from '@/dex/store/useStore'
import type { CurveApi, NetworkConfig } from '@/dex/types/main.types'
import { useConnection } from '@ui-kit/features/connect-wallet'
import { useLayoutStore } from '@ui-kit/features/layout'
import usePageVisibleInterval from '@ui-kit/hooks/usePageVisibleInterval'
import { REFRESH_INTERVAL } from '@ui-kit/lib/model'

const useAutoRefresh = (network: NetworkConfig) => {
  const { curveApi } = useConnection()

  const isPageVisible = useLayoutStore((state) => state.isPageVisible)
  const fetchPools = useStore((state) => state.pools.fetchPools)
  const poolDataMapper = useStore((state) => state.pools.poolsMapper[network.chainId])
  const fetchPoolsVolume = useStore((state) => state.pools.fetchPoolsVolume)
  const fetchPoolsTvl = useStore((state) => state.pools.fetchPoolsTvl)
  const setTokensMapper = useStore((state) => state.tokens.setTokensMapper)
  const fetchGasInfo = useStore((state) => state.gas.fetchGasInfo)
  const fetchAllStoredUsdRates = useStore((state) => state.usdRates.fetchAllStoredUsdRates)
  const fetchAllStoredBalances = useStore((state) => state.userBalances.fetchAllStoredBalances)

  const fetchPoolsVolumeTvl = useCallback(
    async (curve: CurveApi) => {
      const { chainId } = curve
      const poolDatas = Object.values(poolDataMapper)
      await Promise.all([fetchPoolsVolume(chainId, poolDatas), fetchPoolsTvl(curve, poolDatas)])
      void setTokensMapper(chainId, poolDatas)
    },
    [fetchPoolsTvl, fetchPoolsVolume, poolDataMapper, setTokensMapper],
  )

  const refetchPools = useCallback(
    async (curve: CurveApi) => {
      const poolIds = await curvejsApi.network.fetchAllPoolsList(curve, network)
      void fetchPools(curve, poolIds, null)
    },
    [fetchPools, network],
  )

  usePageVisibleInterval(
    () => {
      if (curveApi) {
        void fetchGasInfo(curveApi)
        void fetchAllStoredUsdRates(curveApi)
        void fetchPoolsVolumeTvl(curveApi)

        if (curveApi.signerAddress) {
          void fetchAllStoredBalances(curveApi)
        }
      }
    },
    REFRESH_INTERVAL['5m'],
    isPageVisible,
  )

  usePageVisibleInterval(
    () => {
      if (curveApi) {
        void refetchPools(curveApi)
      }
    },
    REFRESH_INTERVAL['11m'],
    isPageVisible,
  )
}

const BaseLayout = ({ children, network }: { children: ReactNode } & { network: NetworkConfig }) => {
  useAutoRefresh(network)
  return children
}

export default BaseLayout
