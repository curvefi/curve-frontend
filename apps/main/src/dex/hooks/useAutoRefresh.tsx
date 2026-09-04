import { useMemo } from 'react'
import { useStore } from '@/dex/store/useStore'
import { useCurve } from '@evm-ui/features/connect-wallet'
import { useDexPoolListV2 } from '@evm-ui/hooks/useFeatureFlags'
import { usePageVisibleInterval } from '@evm-ui/hooks/usePageVisibleInterval'
import { useGasInfoAndUpdateLib } from '@evm-ui/lib/model/entities/gas-info'
import { REFRESH_INTERVAL } from '@ui/utils/time'
import { refetchPoolVolumes } from '../queries/pool-volume.query'

export const useAutoRefresh = (chainId: number | undefined) => {
  const usePoolListV2 = useDexPoolListV2()
  const { curveApi, isHydrated } = useCurve()
  const fetchPools = useStore(state => state.pools.fetchPools)
  const poolIds = useMemo(
    () => isHydrated && curveApi?.chainId === chainId && curveApi?.getPoolList(),
    [chainId, curveApi, isHydrated],
  )

  useGasInfoAndUpdateLib({ chainId })

  usePageVisibleInterval(async () => {
    if (!curveApi || !poolIds || !chainId) return
    const poolVolumes = await refetchPoolVolumes({ chainId })
    await fetchPools(curveApi, poolIds, poolVolumes, !usePoolListV2)
  }, REFRESH_INTERVAL['15m'])
}
