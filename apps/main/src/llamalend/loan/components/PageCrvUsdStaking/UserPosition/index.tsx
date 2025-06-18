import BigNumber from 'bignumber.js'
import { useAccount } from 'wagmi'
import { isReady } from '@/loan/components/PageCrvUsdStaking/utils'
import { oneMonthProjectionYield, oneYearProjectionYield } from '@/loan/components/PageCrvUsdStaking/utils'
import { useScrvUsdStatistics } from '@/loan/entities/scrvusdStatistics'
import { useScrvUsdUserBalances } from '@/loan/entities/scrvusdUserBalances'
import useStore from '@/loan/store/useStore'
import { Card, CardHeader, Stack } from '@mui/material'
import Grid from '@mui/material/Grid2'
import { useTheme } from '@mui/material/styles'
import { t } from '@ui-kit/lib/i18n'
import { Metric } from '@ui-kit/shared/ui/Metric'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { MaxWidth, Spacing } = SizesAndSpaces

const CRVUSD_OPTIONS = { symbol: 'crvUSD', position: 'suffix' as const, abbreviate: true }

const UserPosition = ({ chartExpanded = false }: { chartExpanded?: boolean }) => {
  const { address } = useAccount()
  const {
    design: { Layer },
  } = useTheme()
  const { data: statisticsData, isLoading: isStatisticsLoading } = useScrvUsdStatistics({})
  const { data: userBalance, isLoading: userBalanceLoading } = useScrvUsdUserBalances({ userAddress: address })
  const usdRateLoading = useStore((state) => state.usdRates.loading)
  const scrvUsdExchangeRateFetchStatus = useStore((state) => state.scrvusd.scrvUsdExchangeRate.fetchStatus)
  const scrvUsdRate = useStore((state) => state.scrvusd.scrvUsdExchangeRate.value)

  const userScrvUsdBalance = Number(userBalance?.scrvUSD)
  const userScrvUsdBalanceInCrvUsd = userScrvUsdBalance / Number(scrvUsdRate)
  const exchangeRateLoading = !isReady(scrvUsdExchangeRateFetchStatus)

  const totalScrvUsdSupply = statisticsData?.supply
  const scrvUsdApy = statisticsData?.aprProjected

  const userShareOfTotalScrvUsdSupply = totalScrvUsdSupply
    ? Number(BigNumber(userScrvUsdBalance).div(totalScrvUsdSupply).times(100))
    : undefined

  return (
    <Card
      sx={{
        width: '100%',
        maxWidth: chartExpanded ? '100%' : MaxWidth.section,
        backgroundColor: (t) => t.design.Layer[1].Fill,
        boxShadow: 'none',
      }}
    >
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
              loading={userBalanceLoading || usdRateLoading || exchangeRateLoading}
              unit={CRVUSD_OPTIONS}
            />
          </Grid>
          <Grid flexGrow={1}>
            <Metric
              size="large"
              label={t`Your share of the vault`}
              unit="percentage"
              value={userShareOfTotalScrvUsdSupply}
              loading={isStatisticsLoading}
            />
          </Grid>
        </Grid>
        <Grid container columnGap={Spacing.lg} rowGap={Spacing.md} wrap="wrap">
          <Grid flexGrow={1}>
            <Metric
              size="small"
              label={t`30 Days Projection`}
              unit="dollar"
              value={scrvUsdApy && oneMonthProjectionYield(scrvUsdApy, userScrvUsdBalance)}
              loading={isStatisticsLoading || userBalanceLoading}
              tooltip={t`This is an indicator based on the historical yield of the crvUSD Savings Vault. It does not guarantee any future yield.`}
            />
          </Grid>
          <Grid flexGrow={1}>
            <Metric
              size="small"
              label={t`1 Year Projection`}
              unit="dollar"
              value={scrvUsdApy && oneYearProjectionYield(scrvUsdApy, userScrvUsdBalance)}
              loading={isStatisticsLoading || userBalanceLoading}
              tooltip={t`This is an indicator based on the historical yield of the crvUSD Savings Vault. It does not guarantee any future yield.`}
            />
          </Grid>
          <Grid flexGrow={1}>
            <Metric
              size="small"
              label={t`scrvUSD Staking Rate`}
              unit="percentage"
              value={scrvUsdApy}
              loading={isStatisticsLoading}
              tooltip={t`Annual percentage yield (APY) refers to how much interest is distributed on savings and takes compounded interest into account. 
This value is an indicator based on the historical yield of the crvUSD Savings Vault. It does not guarantee any future yield.`}
            />
          </Grid>
        </Grid>
      </Stack>
    </Card>
  )
}

export default UserPosition
