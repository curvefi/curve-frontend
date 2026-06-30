import { useConnection } from 'wagmi'
import { oneMonthProjectionYield, oneYearProjectionYield } from '@/loan/components/PageCrvUsdStaking/utils'
import { useScrvUsdExchangeRate } from '@/loan/entities/scrvusd-exchange-rate.query'
import { useScrvUsdStatistics } from '@/loan/entities/scrvusd-statistics.query'
import { useScrvUsdUserBalances } from '@/loan/entities/scrvusd-userBalances.query'
import type { ChainId } from '@/loan/types/loan.types'
import { Card, CardContent, CardHeader, Stack } from '@mui/material'
import Grid from '@mui/material/Grid'
import { combineQueries } from '@ui-kit/lib'
import { t } from '@ui-kit/lib/i18n'
import { Metric } from '@ui-kit/shared/ui/Metric'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { mapQuery } from '@ui-kit/types/util'
import { decimal, decimalDiv, decimalMultiply } from '@ui-kit/utils'

const { Spacing } = SizesAndSpaces

const CRVUSD_OPTIONS = { symbol: 'crvUSD', position: 'suffix' as const, abbreviate: true }
const PRIMARY_METRIC_CATEGORY = 'loan.scrvusdUserPositionPrimary'
const SECONDARY_METRIC_CATEGORY = 'loan.scrvusdUserPositionSecondary'

type UserPositionProps = {
  chainId: ChainId | undefined
}

export const UserPosition = ({ chainId }: UserPositionProps) => {
  const { address } = useConnection()
  const statistics = useScrvUsdStatistics({})
  const scrvUsdExchangeRate = useScrvUsdExchangeRate({ chainId })
  const totalScrvUsdSupply = mapQuery(statistics, ({ supply }) => decimal(supply))
  const scrvUsdApy = mapQuery(statistics, ({ apyProjected }) => decimal(apyProjected))
  const userScrvUsdBalance = mapQuery(
    useScrvUsdUserBalances({ chainId, userAddress: address }),
    ({ scrvUSD }) => scrvUSD,
  )
  const userScrvUsdBalanceInCrvUsd = combineQueries([userScrvUsdBalance, scrvUsdExchangeRate], (balance, rate) =>
    +rate ? decimalDiv(balance, rate) : undefined,
  )
  const userShareOfTotalScrvUsdSupply = combineQueries([userScrvUsdBalance, totalScrvUsdSupply], (balance, supply) =>
    +supply ? decimalMultiply(decimalDiv(balance, supply), '100') : '0',
  )
  const thirtyDayProjection = combineQueries([scrvUsdApy, userScrvUsdBalance], oneMonthProjectionYield)
  const oneYearProjection = combineQueries([scrvUsdApy, userScrvUsdBalance], oneYearProjectionYield)

  return (
    <Card size="small">
      <CardHeader title={t`Position Details`} />
      <CardContent component={Stack} sx={{ gap: Spacing.md }}>
        <Grid container wrap="wrap" columnSpacing={Spacing.lg} rowSpacing={Spacing.md}>
          <Grid size={6}>
            <Metric
              category={PRIMARY_METRIC_CATEGORY}
              label={t`Your crvUSD Staked`}
              valueOptions={{ unit: CRVUSD_OPTIONS }}
              value={userScrvUsdBalanceInCrvUsd}
              testId="scrvusd-position-staked"
            />
          </Grid>
          <Grid size={6}>
            <Metric
              category={PRIMARY_METRIC_CATEGORY}
              label={t`Your share of the vault`}
              valueOptions={{ unit: 'percentage' }}
              value={userShareOfTotalScrvUsdSupply}
              testId="scrvusd-position-share"
            />
          </Grid>
        </Grid>

        <Grid container columnSpacing={Spacing.lg} rowSpacing={Spacing.md} wrap="wrap">
          <Grid size={3}>
            <Metric
              category={SECONDARY_METRIC_CATEGORY}
              label={t`30 Days Projection`}
              valueOptions={{ unit: 'dollar' }}
              value={thirtyDayProjection}
              labelTooltip={{
                title: t`This is an indicator based on the historical yield of the crvUSD Savings Vault. It does not guarantee any future yield.`,
              }}
              testId="scrvusd-position-projection-30d"
            />
          </Grid>

          <Grid size={3}>
            <Metric
              category={SECONDARY_METRIC_CATEGORY}
              label={t`1 Year Projection`}
              valueOptions={{ unit: 'dollar' }}
              value={oneYearProjection}
              labelTooltip={{
                title: t`This is an indicator based on the historical yield of the crvUSD Savings Vault. It does not guarantee any future yield.`,
              }}
              testId="scrvusd-position-projection-1y"
            />
          </Grid>

          <Grid size={3}>
            <Metric
              category={SECONDARY_METRIC_CATEGORY}
              label={t`Estimated APY`}
              valueOptions={{ unit: 'percentage' }}
              value={scrvUsdApy}
              labelTooltip={{
                title: t`Annual percentage yield (APY) refers to how much interest is distributed on savings and takes compounded interest into account. 
This value is an indicator based on the historical yield of the crvUSD Savings Vault. It does not guarantee any future yield.`,
              }}
              testId="scrvusd-position-apy"
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )
}
