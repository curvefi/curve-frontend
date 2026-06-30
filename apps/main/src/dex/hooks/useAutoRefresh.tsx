import { useMemo } from 'react'
import { useStore } from '@/dex/store/useStore'
import { useCurve } from '@ui-kit/features/connect-wallet'
import { useDexPoolListV2 } from '@ui-kit/hooks/useFeatureFlags'
import { usePageVisibleInterval } from '@ui-kit/hooks/usePageVisibleInterval'
import { REFRESH_INTERVAL } from '@ui-kit/lib/model'
import { useGasInfoAndUpdateLib } from '@ui-kit/lib/model/entities/gas-info'
import { useNetworks } from '../entities/networks'
import { refetchPoolVolumes } from '../queries/pool-volume.query'

export const useAutoRefresh = (chainId: number | undefined) => {
  const isDexPoolListV2 = useDexPoolListV2()
  const { curveApi, isHydrated } = useCurve()
  const { data: networks } = useNetworks()
  const fetchPools = useStore(state => state.pools.fetchPools)
  const poolIds = useMemo(
    () => isHydrated && curveApi?.chainId === chainId && curveApi?.getPoolList(),
    [chainId, curveApi, isHydrated],
  )

  useGasInfoAndUpdateLib({ chainId, networks })

  usePageVisibleInterval(async () => {
    if (curveApi && poolIds) {
      const poolVolumes = await refetchPoolVolumes({ chainId: curveApi.chainId })
      const isLegacyDexList = !isDexPoolListV2 || !networks[curveApi.chainId]?.pricesApi
      await fetchPools(curveApi, poolIds, poolVolumes, isLegacyDexList)
    }
  }, REFRESH_INTERVAL['15m'])
}
