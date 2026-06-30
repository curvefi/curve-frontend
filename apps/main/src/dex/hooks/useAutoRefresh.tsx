import { useMemo } from 'react'
import { useStore } from '@/dex/store/useStore'
import { isLegacyList } from '@/dex/utils'
import { useCurve } from '@ui-kit/features/connect-wallet'
import { useReleaseChannel } from '@ui-kit/hooks/useLocalStorage'
import { usePageVisibleInterval } from '@ui-kit/hooks/usePageVisibleInterval'
import { REFRESH_INTERVAL } from '@ui-kit/lib/model'
import { useGasInfoAndUpdateLib } from '@ui-kit/lib/model/entities/gas-info'
import { useNetworks } from '../entities/networks'
import { refetchPoolVolumes } from '../queries/pool-volume.query'

export const useAutoRefresh = (chainId: number | undefined) => {
  const [releaseChannel] = useReleaseChannel()
  const { curveApi, isHydrated } = useCurve()
  const { data: networks } = useNetworks()
  const fetchPools = useStore(state => state.pools.fetchPools)
  const poolIds = useMemo(
    () => isHydrated && curveApi?.chainId === chainId && curveApi?.getPoolList(),
    [chainId, curveApi, isHydrated],
  )

  useGasInfoAndUpdateLib({ chainId, networks })

  usePageVisibleInterval(async () => {
    if (!curveApi || !poolIds || !chainId) return
    const poolVolumes = await refetchPoolVolumes({ chainId })
    await fetchPools(curveApi, poolIds, poolVolumes, isLegacyList(releaseChannel, networks[chainId]))
  }, REFRESH_INTERVAL['15m'])
}
