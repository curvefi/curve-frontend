import { useMemo } from 'react'
import { useStore } from '@/dex/store/useStore'
import { useCurve } from '@evm-ui/features/connect-wallet'
import { useGasInfoAndUpdateLib } from '@evm-ui/lib/model/entities/gas-info'
import { usePageVisibleInterval } from '@ui/hooks/usePageVisibleInterval'
import { REFRESH_INTERVAL } from '@ui/lib/time'

export const useAutoRefresh = (chainId: number | undefined) => {
  const { curveApi, isHydrated } = useCurve()
  const fetchPools = useStore(state => state.pools.fetchPools)
  const poolIds = useMemo(
    () => isHydrated && curveApi?.chainId === chainId && curveApi?.getPoolList(),
    [chainId, curveApi, isHydrated],
  )

  useGasInfoAndUpdateLib({ chainId })

  usePageVisibleInterval(async () => {
    if (!curveApi || !poolIds || !chainId) return
    await fetchPools(curveApi, poolIds, true)
  }, REFRESH_INTERVAL['15m'])
}
