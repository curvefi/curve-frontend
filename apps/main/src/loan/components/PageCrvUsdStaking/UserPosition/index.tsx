import { BigNumber } from 'bignumber.js'
import { useConnection } from 'wagmi'
import { oneMonthProjectionYield, oneYearProjectionYield } from '@/loan/components/PageCrvUsdStaking/utils'
import { useScrvUsdExchangeRate as useScrvUsdExchangeRateQuery } from '@/loan/entities/scrvusd-exchange-rate.query'
import { useScrvUsdStatistics } from '@/loan/entities/scrvusd-statistics.query'
import { useScrvUsdUserBalances } from '@/loan/entities/scrvusd-userBalances.query'
import type { ChainId } from '@/loan/types/loan.types'
import { Card, CardContent, CardHeader, Stack } from '@mui/material'
import Grid from '@mui/material/Grid'
import { maybe } from '@primitives/objects.utils'
import { t } from '@ui-kit/lib/i18n'
import { Metric } from '@ui-kit/shared/ui/Metric'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing } = SizesAndSpaces

const CRVUSD_OPTIONS = { symbol: 'crvUSD', position: 'suffix' as const, abbreviate: true }

type UserPositionProps = {
  chainId: ChainId | undefined
}

export const UserPosition = ({ chainId }: UserPositionProps) => {
  const { address } = useConnection()
  const { data: statisticsData, isLoading: isStatisticsLoading } = useScrvUsdStatistics({})
  const { data: userBalance, isLoading: userBalanceLoading } = useScrvUsdUserBalances({ userAddress: address })
  const { data: exchangeRate, isLoading: isExchangeRateLoading } = useScrvUsdExchangeRateQuery({ chainId })

  const userScrvUsdBalance = maybe(userBalance?.scrvUSD, Number)
  const userScrvUsdBalanceInCrvUsd = maybe(exchangeRate, rate =>
    maybe(userScrvUsdBalance, balance => balance / Number(rate)),
  )

  const totalScrvUsdSupply = statisticsData?.supply
  const scrvUsdApy = statisticsData?.apyProjected

  const userShareOfTotalScrvUsdSupply = maybe(userScrvUsdBalance, balance =>
    maybe(totalScrvUsdSupply, supply => Number(BigNumber(balance).div(supply).times(100))),
  )

  return (
    <Card size="small">
      <CardHeader title={t`Position Details`} />
      <CardContent component={Stack} sx={{ gap: Spacing.md }}>
        <Grid container wrap="wrap" columnSpacing={Spacing.lg} rowSpacing={Spacing.md}>
          <Grid size={6}>
            <Metric
              label={t`Your crvUSD Staked`}
              value={userScrvUsdBalanceInCrvUsd}
              valueOptions={{ unit: CRVUSD_OPTIONS }}
              loading={isExchangeRateLoading}
            />
          </Grid>
          <Grid size={6}>
            <Metric
              label={t`Your share of the vault`}
              value={userShareOfTotalScrvUsdSupply}
              valueOptions={{ unit: 'percentage' }}
              loading={isStatisticsLoading}
            />
          </Grid>
        </Grid>

        <Grid container columnSpacing={Spacing.lg} rowSpacing={Spacing.md} wrap="wrap">
          <Grid size={3}>
            <Metric
              size="small"
              label={t`30 Days Projection`}
              value={maybe(scrvUsdApy, apy =>
                maybe(userScrvUsdBalance, balance => oneMonthProjectionYield(apy, balance)),
              )}
              valueOptions={{ unit: 'dollar' }}
              loading={isStatisticsLoading || userBalanceLoading}
              labelTooltip={{
                title: t`This is an indicator based on the historical yield of the crvUSD Savings Vault. It does not guarantee any future yield.`,
              }}
            />
          </Grid>

          <Grid size={3}>
            <Metric
              size="small"
              label={t`1 Year Projection`}
              value={maybe(scrvUsdApy, apy =>
                maybe(userScrvUsdBalance, balance => oneYearProjectionYield(apy, balance)),
              )}
              valueOptions={{ unit: 'dollar' }}
              loading={isStatisticsLoading || userBalanceLoading}
              labelTooltip={{
                title: t`This is an indicator based on the historical yield of the crvUSD Savings Vault. It does not guarantee any future yield.`,
              }}
            />
          </Grid>

          <Grid size={3}>
            <Metric
              size="small"
              label={t`Estimated APY`}
              value={scrvUsdApy}
              valueOptions={{ unit: 'percentage' }}
              loading={isStatisticsLoading}
              labelTooltip={{
                title: t`Annual percentage yield (APY) refers to how much interest is distributed on savings and takes compounded interest into account. 
This value is an indicator based on the historical yield of the crvUSD Savings Vault. It does not guarantee any future yield.`,
              }}
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )
}
