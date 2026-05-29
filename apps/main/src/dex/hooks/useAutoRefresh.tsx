import { useMemo } from 'react'
import { useStore } from '@/dex/store/useStore'
import { useCurve } from '@ui-kit/features/connect-wallet'
import { usePageVisibleInterval } from '@ui-kit/hooks/usePageVisibleInterval'
import { REFRESH_INTERVAL } from '@ui-kit/lib/model'
import { useGasInfoAndUpdateLib } from '@ui-kit/lib/model/entities/gas-info'
import { useNetworks } from '../entities/networks'

export const useAutoRefresh = (chainId: number | undefined) => {
  const { curveApi, isHydrated } = useCurve()
  const { data: networks } = useNetworks()
  // eslint-disable-next-line @typescript-eslint/unbound-method -- Existing violation before enabling this rule.
  const fetchPools = useStore(state => state.pools.fetchPools)
  const poolIds = useMemo(
    () => isHydrated && curveApi?.chainId === chainId && curveApi?.getPoolList(),
    [chainId, curveApi, isHydrated],
  )

  useGasInfoAndUpdateLib({ chainId, networks })

  usePageVisibleInterval(() => curveApi && poolIds && fetchPools(curveApi, poolIds), REFRESH_INTERVAL['15m'])
}
