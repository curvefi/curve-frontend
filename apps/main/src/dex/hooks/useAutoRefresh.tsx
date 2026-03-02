import { useStore } from '@/dex/store/useStore'
import { useCurve } from '@ui-kit/features/connect-wallet'
import { usePageVisibleInterval } from '@ui-kit/hooks/usePageVisibleInterval'
import { REFRESH_INTERVAL } from '@ui-kit/lib/model'
import { useGasInfoAndUpdateLib } from '@ui-kit/lib/model/entities/gas-info'
import { useNetworks } from '../entities/networks'
import { usePoolIds } from '../queries/pool-ids.query'

export const useAutoRefresh = (chainId: number | undefined) => {
  const { curveApi } = useCurve()
  const { data: networks } = useNetworks()
  const fetchPools = useStore((state) => state.pools.fetchPools)
  const { data: poolIds } = usePoolIds({ chainId })

  useGasInfoAndUpdateLib({ chainId, networks })

  usePageVisibleInterval(() => {
    if (curveApi && poolIds) {
      void fetchPools(curveApi, poolIds)
    }
  }, REFRESH_INTERVAL['15m'])
}
