import { useEffect } from 'react'
import type { PageTransferProps } from '@/dex/components/PagePool/types'
import { useTokenAlert } from '@/dex/hooks/useTokenAlert'
import { useStore } from '@/dex/store/useStore'
import type { PoolAlert, PoolDataCacheOrApi } from '@/dex/types/main.types'
import type { Pool as PricesApiPool } from '@curvefi/prices-api/pools'
import { t } from '@evm-ui/lib/i18n'
import type { QueryProp } from '@evm-ui/types/util'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Stack from '@mui/material/Stack'
import { Alerts } from './components/Alerts'
import { Metrics } from './components/Metrics'
import { PointsCampaigns } from './components/points-campaigns'
import { PoolComposition } from './components/pool-composition'
import { YieldBreakdown } from './components/yield-breakdown'

type PoolInformation = {
  poolAlert: PoolAlert | null
  poolQuery: QueryProp<PoolDataCacheOrApi | undefined>
  pricesApiPoolData?: PricesApiPool
} & Pick<PageTransferProps, 'curve' | 'poolData' | 'routerParams'>

export const PoolInformation = ({
  curve,
  routerParams,
  poolData,
  poolQuery,
  poolAlert,
  pricesApiPoolData,
}: PoolInformation) => {
  const { rChainId: chainId } = routerParams
  const poolDataCacheOrApi = poolQuery.data
  const fetchPoolStats = useStore(state => state.pools.fetchPoolStats)
  const tokenAlert = useTokenAlert(poolData?.tokenAddressesAll ?? poolDataCacheOrApi?.tokenAddressesAll)

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
        <Metrics chainId={chainId} poolQuery={poolQuery} pricesApiPoolData={pricesApiPoolData} />
        <PoolComposition chainId={chainId} poolQuery={poolQuery} pricesApiPoolData={pricesApiPoolData} />
        <YieldBreakdown chainId={chainId} poolQuery={poolQuery} />
        <PointsCampaigns chainId={chainId} poolQuery={poolQuery} />
        <Alerts poolAlert={poolAlert} tokenAlert={tokenAlert} />
      </CardContent>
    </Card>
  )
}
