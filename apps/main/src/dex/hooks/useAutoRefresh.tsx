import { useMemo } from 'react'
import { useStore } from '@/dex/store/useStore'
import { useCurve } from '@evm-ui/features/connect-wallet'
import { useReleaseChannel } from '@evm-ui/hooks/useLocalStorage'
import { usePageVisibleInterval } from '@evm-ui/hooks/usePageVisibleInterval'
import { useGasInfoAndUpdateLib } from '@evm-ui/lib/model/entities/gas-info'
import { REFRESH_INTERVAL, ReleaseChannel } from '@evm-ui/utils'
import { refetchPoolVolumes } from '../queries/pool-volume.query'

export const useAutoRefresh = (chainId: number | undefined) => {
  const [releaseChannel] = useReleaseChannel()
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
    await fetchPools(curveApi, poolIds, poolVolumes, releaseChannel === ReleaseChannel.Legacy)
  }, REFRESH_INTERVAL['15m'])
}
