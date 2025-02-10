import { t } from '@lingui/macro'

import useStore from '@/loan/store/useStore'
import { isReady } from '@/loan/components/PageCrvUsdStaking/utils'

import { useTheme } from '@mui/material/styles'
import { Typography } from '@mui/material'
import { Stack } from '@mui/material'
import { Sizing } from '@ui-kit/themes/design/0_primitives'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { Metric } from '@ui-kit/shared/ui/Metric'

const { MaxWidth, Spacing } = SizesAndSpaces

const StatsBanner = () => {
  const {
    design: { Color },
  } = useTheme()
  const pricesYieldData = useStore((state) => state.scrvusd.pricesYieldData)

  const exampleBalance = 100000
  const isLoadingPricesYieldData = !isReady(pricesYieldData.fetchStatus)
  const scrvUsdApy = pricesYieldData.data?.proj_apr || 0
  const oneMonthProjYield = (scrvUsdApy / 100 / 12) * exampleBalance
  const oneYearProjYield = (scrvUsdApy / 100) * exampleBalance

  return (
    <Stack
      direction="column"
      gap={Spacing.md}
      padding={Spacing.lg}
      sx={{
        backgroundColor: Color.Secondary[100],
        border: `1px solid ${Color.Secondary[500]}`,
        maxWidth: `calc(${MaxWidth.actionCard} + ${Sizing[200]} + ${MaxWidth.section})`, // action card + gap + section
      }}
    >
      <Stack direction="column">
        <Typography variant="headingSBold">{t`Your stablecoins could do more`}</Typography>
        <Typography variant="bodyMRegular">{t`With $100k of scrvUSD held you could get`}</Typography>
      </Stack>
      <Stack direction="row" gap={Sizing[200]} justifyContent="space-between">
        <Metric
          label={t`30 Days Projection`}
          unit="dollar"
          value={oneMonthProjYield}
          loading={isLoadingPricesYieldData}
          tooltip={t`This is an indicator based on the historical yield of the crvUSD Savings Vault. It does not guarantee any future yield.`}
        />
        <Metric
          label={t`1 Year Projection`}
          unit="dollar"
          value={oneYearProjYield}
          loading={isLoadingPricesYieldData}
          tooltip={t`This is an indicator based on the historical yield of the crvUSD Savings Vault. It does not guarantee any future yield.`}
        />
        <Metric
          label={t`Estimated APY`}
          unit="percentage"
          value={scrvUsdApy}
          loading={isLoadingPricesYieldData}
          tooltip={t`Annual percentage yield (APY) refers to how much interest is distributed on savings and takes compounded interest into account. 
This value is an indicator based on the historical yield of the crvUSD Savings Vault. It does not guarantee any future yield.`}
        />
      </Stack>
    </Stack>
  )
}

export default StatsBanner
