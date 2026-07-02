import { oneMonthProjectionYield, oneYearProjectionYield } from '@/loan/components/PageCrvUsdStaking/utils'
import { useScrvUsdStatistics } from '@/loan/entities/scrvusd-statistics.query'
import Stack from '@mui/material/Stack'
import { useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import { t } from '@ui-kit/lib/i18n'
import { Metric } from '@ui-kit/shared/ui/Metric'
import { Sizing } from '@ui-kit/themes/design/0_primitives'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { mapQuery } from '@ui-kit/types/util'
import { decimal } from '@ui-kit/utils'

const { Spacing } = SizesAndSpaces

const METRIC_CATEGORY = 'loan.scrvusdBanner'

export const StatsBanner = () => {
  const {
    design: { Color },
  } = useTheme()
  const statistics = useScrvUsdStatistics({})

  const exampleBalance = '100000' as const
  const scrvUsdApy = mapQuery(statistics, ({ apyProjected }) => decimal(apyProjected))

  return (
    <Stack
      direction="column"
      sx={{
        gap: Spacing.md,
        padding: Spacing.lg,
        backgroundColor: Color.Secondary[100],
        border: `1px solid ${Color.Secondary[500]}`,
        width: '100%',
      }}
    >
      <Stack direction="column">
        <Typography variant="headingSBold">{t`Your stablecoins could do more`}</Typography>
        <Typography variant="bodyMRegular">{t`With $100k of scrvUSD held you could get`}</Typography>
      </Stack>
      <Stack
        direction="row"
        sx={{
          gap: Sizing[200],
          justifyContent: 'space-between',
          flexWrap: 'wrap',
        }}
      >
        <Metric
          category={METRIC_CATEGORY}
          label={t`30 Days Projection`}
          value={mapQuery(scrvUsdApy, apy => oneMonthProjectionYield(apy, exampleBalance))}
          valueOptions={{ unit: 'dollar' }}
          labelTooltip={{
            title: t`This is an indicator based on the historical yield of the crvUSD Savings Vault. It does not guarantee any future yield.`,
          }}
          copyText={t`Copied 30 days projection`}
        />
        <Metric
          category={METRIC_CATEGORY}
          label={t`1 Year Projection`}
          value={mapQuery(scrvUsdApy, apy => oneYearProjectionYield(apy, exampleBalance))}
          valueOptions={{ unit: 'dollar' }}
          labelTooltip={{
            title: t`This is an indicator based on the historical yield of the crvUSD Savings Vault. It does not guarantee any future yield.`,
          }}
          copyText={t`Copied 1 year projection`}
        />
        <Metric
          category={METRIC_CATEGORY}
          label={t`Estimated APY`}
          value={scrvUsdApy}
          valueOptions={{ unit: 'percentage' }}
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
