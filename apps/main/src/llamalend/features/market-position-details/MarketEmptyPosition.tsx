import { useConnection } from 'wagmi'
import { EmptyStateCard } from '@evm-ui/shared/ui/EmptyStateCard'
import { MarketRateType } from '@evm-ui/types/market'
import { Stack } from '@mui/material'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { t } from '@ui/lib/i18n'

const { Spacing } = SizesAndSpaces

type NoPositionProps = {
  type: MarketRateType
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

export const MarketEmptyPosition = ({ type }: NoPositionProps) => {
  const emptyType = useConnection().address ? type : 'disconnected'
  const { title, description } = EMPTY_MARKET_CONFIG[emptyType]
  return (
    <Stack sx={{ alignItems: 'center', padding: Spacing.md }} data-testid={`no-position-${emptyType.toLowerCase()}`}>
      <EmptyStateCard
        size="sm"
        title={title}
        description={description}
        {...(emptyType === 'disconnected' && {
          button: { testId: 'no-position-disconnected', type: 'connect-wallet' },
        })}
      />
    </Stack>
  )
}
