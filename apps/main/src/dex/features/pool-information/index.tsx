import { useEffect } from 'react'
import type { PageTransferProps } from '@/dex/components/PagePool/types'
import { usePoolIdByAddressOrId } from '@/dex/hooks/usePoolIdByAddressOrId'
import { useTokenAlert } from '@/dex/hooks/useTokenAlert'
import { useStore } from '@/dex/store/useStore'
import type { PoolAlert } from '@/dex/types/main.types'
import type { Pool as PricesApiPool } from '@curvefi/prices-api/pools'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Stack from '@mui/material/Stack'
import { t } from '@ui-kit/lib/i18n'
import { Alerts } from './components/Alerts'
import { Metrics } from './components/Metrics'
import { PointsCampaigns } from './components/points-campaigns'
import { PoolComposition } from './components/pool-composition'
import { YieldBreakdown } from './components/yield-breakdown'

type PoolInformation = {
  poolAlert: PoolAlert | null
  pricesApiPoolData?: PricesApiPool
} & Pick<PageTransferProps, 'curve' | 'poolData' | 'poolDataCacheOrApi' | 'routerParams'>

export const PoolInformation = ({
  curve,
  routerParams,
  poolData,
  poolDataCacheOrApi,
  poolAlert,
  pricesApiPoolData,
}: PoolInformation) => {
  const { rChainId: chainId, rPoolIdOrAddress: poolIdOrAddress } = routerParams
  const poolId = usePoolIdByAddressOrId({ chainId, poolIdOrAddress })
  const resolvedPoolId = poolId ?? poolDataCacheOrApi.pool.id
  const fetchPoolStats = useStore(state => state.pools.fetchPoolStats)
  const tokenAlert = useTokenAlert(poolData?.tokenAddressesAll ?? poolDataCacheOrApi.tokenAddressesAll)

  // Preserve the legacy stats fetch path; forms still rely on these store-backed values.
  useEffect(() => {
    if (curve && poolData) {
      void fetchPoolStats(curve, poolData)
    }
  }, [curve, fetchPoolStats, poolData])

  return (
    <Card size="small">
      <CardHeader title={t`Pool Information`} />
      <CardContent component={Stack}>
        <Metrics
          chainId={chainId}
          poolDataCacheOrApi={poolDataCacheOrApi}
          poolId={resolvedPoolId}
          pricesApiPoolData={pricesApiPoolData}
        />
        <PoolComposition
          chainId={chainId}
          poolDataCacheOrApi={poolDataCacheOrApi}
          poolId={resolvedPoolId}
          pricesApiPoolData={pricesApiPoolData}
        />
        <YieldBreakdown chainId={chainId} poolDataCacheOrApi={poolDataCacheOrApi} poolId={resolvedPoolId} />
        <PointsCampaigns chainId={chainId} poolDataCacheOrApi={poolDataCacheOrApi} />
        <Alerts poolAlert={poolAlert} tokenAlert={tokenAlert} />
      </CardContent>
    </Card>
  )
}
