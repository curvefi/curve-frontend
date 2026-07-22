import { useConnection } from 'wagmi'
import { Stack } from '@mui/material'
import { t } from '@ui-kit/lib/i18n'
import { EmptyStateCard } from '@ui-kit/shared/ui/EmptyStateCard'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { MarketRateType } from '@ui-kit/types/market'

const { Spacing } = SizesAndSpaces

type NoPositionProps = {
  type: MarketRateType
  compact: boolean
}

type EmptyMarketType = MarketRateType | 'disconnected'

const EMPTY_MARKET_CONFIG: Record<EmptyMarketType, { title: string; description: string }> = {
  [MarketRateType.Borrow]: {
    title: t`No active position`,
    description: t`Borrow with LLAMMA to stay exposed, reduce liquidation risk and access liquidity without selling.`,
  },
  [MarketRateType.Supply]: {
    title: t`You're not earning yet`,
    description: t`Lend assets to earn yield and support deep liquidity across Curve.`,
  },
  disconnected: {
    title: t`Disconnected`,
    description: t`Please connect your wallet to view your positions.`,
  },
}

export const MarketEmptyPosition = ({ type, compact }: NoPositionProps) => {
  const emptyType = useConnection().address ? type : 'disconnected'
  const { title, description } = EMPTY_MARKET_CONFIG[emptyType]
  return (
    <Stack
      sx={{ alignItems: 'center', padding: compact ? Spacing.sm : Spacing.md }}
      data-testid={`no-position-${emptyType.toLowerCase()}`}
    >
      <EmptyStateCard
        size={compact ? 'sm' : 'md'}
        title={title}
        description={description}
        {...(emptyType === 'disconnected' && {
          button: { testId: 'no-position-disconnected', type: 'connect-wallet' },
        })}
      />
    </Stack>
  )
}
