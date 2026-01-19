import { oneMonthProjectionYield, oneYearProjectionYield } from '@/loan/components/PageCrvUsdStaking/utils'
import { useScrvUsdStatistics } from '@/loan/entities/scrvusd-statistics'
import { Typography } from '@mui/material'
import { Stack } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { t } from '@ui-kit/lib/i18n'
import { Metric } from '@ui-kit/shared/ui/Metric'
import { Sizing } from '@ui-kit/themes/design/0_primitives'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { MaxWidth, Spacing } = SizesAndSpaces

export const StatsBanner = () => {
  const {
    design: { Color },
  } = useTheme()
  const { data: statisticsData, isLoading: isStatisticsLoading } = useScrvUsdStatistics({})

  const exampleBalance = 100000
  const scrvUsdApy = statisticsData?.apyProjected

  return (
    <Stack
      direction="column"
      gap={Spacing.md}
      padding={Spacing.lg}
      sx={{
        backgroundColor: Color.Secondary[100],
        border: `1px solid ${Color.Secondary[500]}`,
        width: '100%',
        maxWidth: `calc(${MaxWidth.legacyActionCard} + ${Sizing[200]} + ${MaxWidth.section})`, // action card + gap + section
      }}
    >
      <Stack direction="column">
        <Typography variant="headingSBold">{t`Your stablecoins could do more`}</Typography>
        <Typography variant="bodyMRegular">{t`With $100k of scrvUSD held you could get`}</Typography>
      </Stack>
      <Stack direction="row" gap={Sizing[200]} justifyContent="space-between" flexWrap="wrap">
        <Metric
          label={t`30 Days Projection`}
          value={scrvUsdApy ? oneMonthProjectionYield(scrvUsdApy, exampleBalance) : undefined}
          valueOptions={{ unit: 'dollar' }}
          loading={isStatisticsLoading}
          labelTooltip={{
            title: t`This is an indicator based on the historical yield of the crvUSD Savings Vault. It does not guarantee any future yield.`,
          }}
          copyText={t`Copied 30 days projection`}
        />
        <Metric
          label={t`1 Year Projection`}
          value={scrvUsdApy ? oneYearProjectionYield(scrvUsdApy, exampleBalance) : undefined}
          valueOptions={{ unit: 'dollar' }}
          loading={isStatisticsLoading}
          labelTooltip={{
            title: t`This is an indicator based on the historical yield of the crvUSD Savings Vault. It does not guarantee any future yield.`,
          }}
          copyText={t`Copied 1 year projection`}
        />
        <Metric
          label={t`Estimated APY`}
          value={scrvUsdApy}
          valueOptions={{ unit: 'percentage' }}
          loading={isStatisticsLoading}
          labelTooltip={{
            title: t`Annual percentage yield (APY) refers to how much interest is distributed on savings and takes compounded interest into account. 
This value is an indicator based on the historical yield of the crvUSD Savings Vault. It does not guarantee any future yield.`,
          }}
          copyText={t`Copied estimated APY`}
        />
      </Stack>
    </Stack>
  )
}
