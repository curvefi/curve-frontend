import { ReactNode, useCallback } from 'react'
import curvejsApi from '@/dex/lib/curvejs'
import useStore from '@/dex/store/useStore'
import type { CurveApi } from '@/dex/types/main.types'
import type { NetworkDef } from '@ui/utils'
import { useConnection } from '@ui-kit/features/connect-wallet'
import { useLayoutStore } from '@ui-kit/features/layout'
import usePageVisibleInterval from '@ui-kit/hooks/usePageVisibleInterval'
import { REFRESH_INTERVAL } from '@ui-kit/lib/model'

const useAutoRefresh = (networkDef: NetworkDef) => {
  const { curveApi } = useConnection()

  const isPageVisible = useLayoutStore((state) => state.isPageVisible)
  const fetchPools = useStore((state) => state.pools.fetchPools)
  const poolDataMapper = useStore((state) => state.pools.poolsMapper[networkDef.chainId])
  const fetchPoolsVolume = useStore((state) => state.pools.fetchPoolsVolume)
  const fetchPoolsTvl = useStore((state) => state.pools.fetchPoolsTvl)
  const setTokensMapper = useStore((state) => state.tokens.setTokensMapper)
  const fetchGasInfo = useStore((state) => state.gas.fetchGasInfo)
  const fetchAllStoredUsdRates = useStore((state) => state.usdRates.fetchAllStoredUsdRates)
  const fetchAllStoredBalances = useStore((state) => state.userBalances.fetchAllStoredBalances)
  const network = useStore((state) => state.networks.networks[networkDef.chainId])

  const fetchPoolsVolumeTvl = useCallback(
    async (curve: CurveApi) => {
      const { chainId } = curve
      const poolDatas = Object.values(poolDataMapper)
      await Promise.all([fetchPoolsVolume(chainId, poolDatas), fetchPoolsTvl(curve, poolDatas)])
      void setTokensMapper(chainId, poolDatas)
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

  usePageVisibleInterval(refetchPools, REFRESH_INTERVAL['11m'], isPageVisible && !!curveApi && !!network)
}

const BaseLayout = ({ children, network }: { children: ReactNode; network: NetworkDef }) => {
  useAutoRefresh(network)
  return children
}

export default BaseLayout
