import type { Address } from 'viem'
import type { Chain } from '@curvefi/prices-api'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Grid from '@mui/material/Grid'
import { t } from '@ui-kit/lib/i18n'
import { Metric } from '@ui-kit/shared/ui/Metric'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { mapQuery } from '@ui-kit/types/util'
import { useRefuelPool } from '../queries/pools.query'

const { Spacing } = SizesAndSpaces

const METRIC_SIZE = { mobile: 3, desktop: 2 }
const METRIC_CATEGORY = 'dex.refuelPoolInformation'

export const BorrowInformationContainer = ({
  blockchainId,
  poolAddress,
}: {
  blockchainId: Chain
  poolAddress: Address
}) => {
  const refuel = useRefuelPool({ blockchainId, poolAddress })
  return (
    <Card size="small" data-testid="refuel-pool-information">
      <CardHeader title={t`Pool Information`} />
      <CardContent>
        <Grid container columnSpacing={Spacing.md}>
          <Grid size={METRIC_SIZE}>
            <Metric
              category={METRIC_CATEGORY}
              label={t`TVL`}
              value={mapQuery(refuel, pool => pool.tvlUsd)}
              valueOptions={{ unit: 'dollar', abbreviate: true }}
              testId="refuel-pool-tvl"
            />
          </Grid>

          <Grid size={METRIC_SIZE}>
            <Metric
              category={METRIC_CATEGORY}
              label={t`Volume`}
              value={mapQuery(refuel, pool => pool.tradingVolume24h)}
              valueOptions={{ unit: 'dollar', abbreviate: true }}
              testId="refuel-pool-volume"
            />
          </Grid>

          <Grid size={METRIC_SIZE}>
            <Metric
              category={METRIC_CATEGORY}
              label={t`24h fees`}
              value={mapQuery(refuel, pool => pool.tradingFee24h)}
              valueOptions={{ unit: 'dollar', abbreviate: true }}
              testId="refuel-pool-fees"
            />
          </Grid>

          <Grid size={METRIC_SIZE}>
            <Metric
              category={METRIC_CATEGORY}
              label={t`1W APR`}
              value={mapQuery(refuel, pool => pool.baseWeeklyApr)}
              valueOptions={{ unit: 'percentage', abbreviate: true }}
              testId="refuel-pool-apr"
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )
}
