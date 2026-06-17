import { Stack } from '@mui/material'
import { t } from '@ui-kit/lib/i18n'
import { EmptyStateCard } from '@ui-kit/shared/ui/EmptyStateCard'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { MarketRateType } from '@ui-kit/types/market'

const { Spacing } = SizesAndSpaces

type NoPositionProps = {
  rateType: MarketRateType
}

const EMPTY_MARKET_CONFIG: Record<NoPositionProps['rateType'], { title: string; subtitle: string }> = {
  [MarketRateType.Borrow]: {
    title: t`No active position`,
    subtitle: t`Borrow with LLAMMA to stay exposed, reduce liquidation risk and access liquidity without selling.`,
  },
  [MarketRateType.Supply]: {
    title: t`You're not earning yet`,
    subtitle: t`Lend assets to earn yield and support deep liquidity across Curve.`,
  },
}

export const MarketEmptyPosition = ({ rateType }: NoPositionProps) => {
  const { title, subtitle } = EMPTY_MARKET_CONFIG[rateType]
  return (
    <Stack sx={{ alignItems: 'center', padding: Spacing.md }}>
      <EmptyStateCard title={title} subtitle={subtitle} />
    </Stack>
  )
}
