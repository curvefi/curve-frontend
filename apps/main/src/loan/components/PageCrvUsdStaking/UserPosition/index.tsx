import { BigNumber } from 'bignumber.js'
import { useConnection } from 'wagmi'
import { oneMonthProjectionYield, oneYearProjectionYield, isReady } from '@/loan/components/PageCrvUsdStaking/utils'
import { useScrvUsdExchangeRate as useScrvUsdExchangeRateQuery } from '@/loan/entities/scrvusd-exchange-rate.query'
import { useScrvUsdStatistics } from '@/loan/entities/scrvusd-statistics.query'
import { useScrvUsdUserBalances } from '@/loan/entities/scrvusd-userBalances.query'
import { useStore } from '@/loan/store/useStore'
import type { ChainId } from '@/loan/types/loan.types'
import { Card, CardContent, CardHeader, Stack } from '@mui/material'
import Grid from '@mui/material/Grid'
import type { Decimal } from '@primitives/decimal.utils'
import { maybe } from '@primitives/objects.utils'
import { useScrvUsdNewForms } from '@ui-kit/hooks/useFeatureFlags'
import { t } from '@ui-kit/lib/i18n'
import { Metric } from '@ui-kit/shared/ui/Metric'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { mapQuery, q, type QueryProp } from '@ui-kit/types/util'

const { Spacing } = SizesAndSpaces

const CRVUSD_OPTIONS = { symbol: 'crvUSD', position: 'suffix' as const, abbreviate: true }

const useScrvUsdExchangeRate = (chainId: ChainId | undefined): QueryProp<Decimal | undefined> => {
  const useNewForms = useScrvUsdNewForms()
  const legacyExchangeRate = useStore(state => state.scrvusd.scrvUsdExchangeRate)
  const exchangeRate = useScrvUsdExchangeRateQuery({ chainId }, !!chainId && useNewForms)

  if (useNewForms) return mapQuery(exchangeRate, rate => rate)

  return q({
    data: isReady(legacyExchangeRate.fetchStatus) ? (legacyExchangeRate.value as Decimal) : undefined,
    isLoading: !isReady(legacyExchangeRate.fetchStatus),
    error: null,
  })
}

type UserPositionProps = {
  chainId: ChainId | undefined
}

export const UserPosition = ({ chainId }: UserPositionProps) => {
  const { address } = useConnection()
  const { data: statisticsData, isLoading: isStatisticsLoading } = useScrvUsdStatistics({})
  const { data: userBalance, isLoading: userBalanceLoading } = useScrvUsdUserBalances({ userAddress: address })
  const scrvUsdExchangeRate = useScrvUsdExchangeRate(chainId)

  const userScrvUsdBalance = maybe(userBalance?.scrvUSD, Number)
  const userScrvUsdBalanceInCrvUsd = maybe(scrvUsdExchangeRate.data, rate =>
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
              loading={userBalanceLoading || scrvUsdExchangeRate.isLoading}
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
