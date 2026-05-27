import type { Address } from 'viem'
import type { Chain } from '@curvefi/prices-api'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Grid from '@mui/material/Grid'
import { t } from '@ui-kit/lib/i18n'
import { Metric } from '@ui-kit/shared/ui/Metric'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { useRefuelPool } from '../queries/pools.query'

const { Spacing } = SizesAndSpaces

export const BorrowInformationContainer = ({
  blockchainId,
  poolAddress,
}: {
  blockchainId: Chain
  poolAddress: Address
}) => {
  const { data: pool, isLoading: isPoolLoading, error: poolError } = useRefuelPool({ blockchainId, poolAddress })

  return (
    <Card size="small" data-testid="refuel-pool-information">
      <CardHeader title={t`Pool Information`} />
      <CardContent>
        <Grid container columnSpacing={Spacing.md}>
          {/** Sizes might sum up to something else than 12 just for sizing and spacing consistency with other cards */}
          <Grid size={2}>
            <Metric
              label={t`TVL`}
              value={pool?.tvlUsd}
              valueOptions={{ unit: 'dollar', abbreviate: true }}
              loading={isPoolLoading}
              error={poolError}
              testId="refuel-pool-tvl"
            />
          </Grid>

          <Grid size={2}>
            <Metric
              label={t`Volume`}
              value={pool?.tradingVolume24h}
              valueOptions={{ unit: 'dollar', abbreviate: true }}
              loading={isPoolLoading}
              error={poolError}
              testId="refuel-pool-volume"
            />
          </Grid>

          <Grid size={2}>
            <Metric
              label={t`24h fees`}
              value={pool?.tradingFee24h}
              valueOptions={{ unit: 'dollar', abbreviate: true }}
              loading={isPoolLoading}
              error={poolError}
              testId="refuel-pool-fees"
            />
          </Grid>

          <Grid size={2}>
            <Metric
              label={t`1W APR`}
              value={pool?.baseWeeklyApr}
              valueOptions={{ unit: 'percentage', abbreviate: true }}
              loading={isPoolLoading}
              error={poolError}
              testId="refuel-pool-apr"
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )
}
