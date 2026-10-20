import { useTokenAlert } from '@/dex/hooks/useTokenAlert'
import type { PoolAlert } from '@/dex/types/main.types'
import type { Pool as PricesApiPool } from '@curvefi/prices-api/pools'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Stack from '@mui/material/Stack'
import { Metrics } from '@ui/features/pools/PoolInformationMetrics'
import type { QueryProp } from '@ui/features/queries/util'
import { t } from '@ui/lib/i18n'
import { stackedCardHeadersSx } from '@ui/lib/mui'
import { usePoolContext } from '../pool-context'
import { Alerts } from './components/Alerts'
import { PoolComposition } from './components/PoolComposition'
import { useMetrics } from './hooks/useMetrics'

type PoolInformation = { poolAlert: PoolAlert | null; pricesApiPoolData: QueryProp<PricesApiPool> }

export const PoolInformation = ({ poolAlert, pricesApiPoolData }: PoolInformation) => {
  const {
    chainId,
    poolAddress,
    tokenAddressesAll: { data: tokenAddressesAll },
  } = usePoolContext()
  return (
    <Stack sx={stackedCardHeadersSx}>
      <Card size="small">
        <CardHeader title={t`Pool Information`} />
        <CardContent component={Stack}>
          <Metrics {...useMetrics({ chainId, poolAddress, pricesApiPoolData })} />
        </CardContent>
      </Card>
      <PoolComposition pricesApiPoolData={pricesApiPoolData} />
      <Alerts poolAlert={poolAlert} tokenAlert={useTokenAlert(tokenAddressesAll)} />
    </Stack>
  )
}
