import { useTokenAlert } from '@/dex/hooks/useTokenAlert'
import type { PoolAlert } from '@/dex/types/main.types'
import type { Pool as PricesApiPool } from '@curvefi/prices-api/pools'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Stack from '@mui/material/Stack'
import { t } from '@ui/lib/i18n'
import { stackedCardHeadersSx } from '@ui/lib/mui'
import { usePoolContext } from '../pool-context'
import { Alerts } from './components/Alerts'
import { Metrics } from './components/Metrics'
import { PointsCampaigns } from './components/points-campaigns'
import { PoolComposition } from './components/PoolComposition'
import { YieldBreakdown } from './components/yield-breakdown'
import { useMetrics } from './hooks/useMetrics'
import { useYieldBreakdown } from './hooks/useYieldBreakdown'

type PoolInformation = { poolAlert: PoolAlert | null; pricesApiPoolData?: PricesApiPool }

export const PoolInformation = ({ poolAlert, pricesApiPoolData }: PoolInformation) => {
  const { chainId, poolId, pool, tokenAddressesAll } = usePoolContext()
  return (
    <Stack sx={stackedCardHeadersSx}>
      <Card size="small">
        <CardHeader title={t`Pool Information`} />
        <CardContent component={Stack}>
          <Metrics {...useMetrics({ chainId, poolId, pricesApiPoolData })} />
        </CardContent>
      </Card>
      <PoolComposition pricesApiPoolData={pricesApiPoolData} />
      <YieldBreakdown {...useYieldBreakdown({ chainId, pool, poolId })} />
      <PointsCampaigns />
      <Alerts poolAlert={poolAlert} tokenAlert={useTokenAlert(tokenAddressesAll)} />
    </Stack>
  )
}
