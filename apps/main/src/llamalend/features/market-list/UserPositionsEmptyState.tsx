import { PositionsEmptyState } from '@/llamalend/constants'
import type { LlamaMarket } from '@/llamalend/queries/market-list/llama-markets'
import { t } from '@ui-kit/lib/i18n'
import type { TanstackTable } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { EmptyStateRow } from '@ui-kit/shared/ui/DataTable/EmptyStateRow'
import { EmptyStateCard } from '@ui-kit/shared/ui/EmptyStateCard'
import { MarketRateType } from '@ui-kit/types/market'

type EmptyStateConfig = {
  title: string
  subtitle?: string
  buttonLabel?: string
  onButtonClick?: () => void
}

type UserPositionsEmptyStateProps = {
  table: TanstackTable<LlamaMarket>
  state: PositionsEmptyState
  marketRateType: MarketRateType
  onReload: () => void
  resetFilters?: () => void
}

const emptyStateConfigs = (
  marketRateType: MarketRateType,
  onReload: () => void,
  resetFilters?: () => void,
): Record<PositionsEmptyState, EmptyStateConfig> => ({
  [PositionsEmptyState.Error]: {
    title: t`Could not load positions`,
    buttonLabel: t`Reload`,
    onButtonClick: onReload,
  },
  [PositionsEmptyState.NoPositions]: {
    title: t`No active positions`,
    subtitle: noPositionsSubTitle[marketRateType],
  },
  [PositionsEmptyState.Filtered]: {
    title: t`No positions found`,
    subtitle: t`Try adjusting your filters or search query`,
    buttonLabel: t`Show All Positions`,
    onButtonClick: resetFilters,
  },
})

const noPositionsSubTitle: Record<MarketRateType, string> = {
  [MarketRateType.Borrow]: t`Borrow with LLAMMA to stay exposed, reduce liquidation risk, and access liquidity without selling.`,
  [MarketRateType.Supply]: t`Lend assets to earn yield and support deep liquidity across Curve.`,
}

export const UserPositionsEmptyState = ({
  table,
  state,
  marketRateType,
  onReload,
  resetFilters,
}: UserPositionsEmptyStateProps) => {
  const configs = emptyStateConfigs(marketRateType, onReload, resetFilters)
  const { title, subtitle, buttonLabel, onButtonClick } = configs[state]

  return (
    <EmptyStateRow size="sm" table={table}>
      <EmptyStateCard
        title={title}
        subtitle={subtitle}
        {...(onButtonClick && { button: { label: buttonLabel, onClick: onButtonClick } })}
      />
    </EmptyStateRow>
  )
}
