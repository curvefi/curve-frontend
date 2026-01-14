import BigNumber from 'bignumber.js'
import { useConnection } from 'wagmi'
import { isReady } from '@/loan/components/PageCrvUsdStaking/utils'
import { oneMonthProjectionYield, oneYearProjectionYield } from '@/loan/components/PageCrvUsdStaking/utils'
import { useScrvUsdStatistics } from '@/loan/entities/scrvusd-statistics'
import { useScrvUsdUserBalances } from '@/loan/entities/scrvusd-userBalances'
import { useStore } from '@/loan/store/useStore'
import { Card, CardHeader, Stack } from '@mui/material'
import Grid from '@mui/material/Grid'
import { useTheme } from '@mui/material/styles'
import { t } from '@ui-kit/lib/i18n'
import { Metric } from '@ui-kit/shared/ui/Metric'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { MaxWidth, Spacing } = SizesAndSpaces

const CRVUSD_OPTIONS = { symbol: 'crvUSD', position: 'suffix' as const, abbreviate: true }

export const UserPosition = ({ chartExpanded = false }: { chartExpanded?: boolean }) => {
  const { address } = useConnection()
  const {
    design: { Layer },
  } = useTheme()
  const { data: statisticsData, isLoading: isStatisticsLoading } = useScrvUsdStatistics({})
  const { data: userBalance, isLoading: userBalanceLoading } = useScrvUsdUserBalances({ userAddress: address })
  const usdRateLoading = useStore((state) => state.scrvusd.scrvUsdExchangeRate.fetchStatus === 'loading')
  const scrvUsdExchangeRateFetchStatus = useStore((state) => state.scrvusd.scrvUsdExchangeRate.fetchStatus)
  const scrvUsdRate = useStore((state) => state.scrvusd.scrvUsdExchangeRate.value)

  const userScrvUsdBalance = Number(userBalance?.scrvUSD)
  const userScrvUsdBalanceInCrvUsd = userScrvUsdBalance / Number(scrvUsdRate)
  const exchangeRateLoading = !isReady(scrvUsdExchangeRateFetchStatus)

  const totalScrvUsdSupply = statisticsData?.supply
  const scrvUsdApy = statisticsData?.apyProjected

  const userShareOfTotalScrvUsdSupply = totalScrvUsdSupply
    ? Number(BigNumber(userScrvUsdBalance).div(totalScrvUsdSupply).times(100))
    : undefined

  return (
    <Card sx={{ width: '100%', maxWidth: chartExpanded ? '100%' : MaxWidth.section }}>
      <CardHeader title={t`Position Details`} />
      <Stack padding={Spacing.md} gap={Spacing.md}>
        <Grid
          container
          wrap="wrap"
          columnGap={Spacing.lg}
          rowGap={Spacing.md}
          padding={Spacing.lg}
          sx={{ backgroundColor: Layer[2].Fill, border: `2px solid ${Layer.Highlight.Outline}`, width: '100%' }}
        >
          <Grid flexGrow={1}>
            <Metric
              size="large"
              label={t`Your crvUSD Staked`}
              value={userScrvUsdBalanceInCrvUsd}
              valueOptions={{ unit: CRVUSD_OPTIONS }}
              loading={userBalanceLoading || usdRateLoading || exchangeRateLoading}
            />
          </Grid>
          <Grid flexGrow={1}>
            <Metric
              size="large"
              label={t`Your share of the vault`}
              value={userShareOfTotalScrvUsdSupply}
              valueOptions={{ unit: 'percentage' }}
              loading={isStatisticsLoading}
            />
          </Grid>
        </Grid>
        <Grid container columnGap={Spacing.lg} rowGap={Spacing.md} wrap="wrap">
          <Grid flexGrow={1}>
            <Metric
              size="small"
              label={t`30 Days Projection`}
              value={scrvUsdApy && oneMonthProjectionYield(scrvUsdApy, userScrvUsdBalance)}
              valueOptions={{ unit: 'dollar' }}
              loading={isStatisticsLoading || userBalanceLoading}
              labelTooltip={{
                title: t`This is an indicator based on the historical yield of the crvUSD Savings Vault. It does not guarantee any future yield.`,
              }}
            />
          </Grid>
          <Grid flexGrow={1}>
            <Metric
              size="small"
              label={t`1 Year Projection`}
              value={scrvUsdApy && oneYearProjectionYield(scrvUsdApy, userScrvUsdBalance)}
              valueOptions={{ unit: 'dollar' }}
              loading={isStatisticsLoading || userBalanceLoading}
              labelTooltip={{
                title: t`This is an indicator based on the historical yield of the crvUSD Savings Vault. It does not guarantee any future yield.`,
              }}
            />
          </Grid>
          <Grid flexGrow={1}>
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
      </Stack>
    </Card>
  )
}
