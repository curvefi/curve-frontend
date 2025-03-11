import { useCallback } from 'react'
import { LlamaMarket, LlamaMarketType } from '@/loan/entities/llama-markets'
import PersonIcon from '@mui/icons-material/Person'
import Stack from '@mui/material/Stack'
import { DeepKeys } from '@tanstack/table-core/build/lib/utils'
import { useWallet } from '@ui-kit/features/connect-wallet'
import { t } from '@ui-kit/lib/i18n'
import { HeartIcon } from '@ui-kit/shared/icons/HeartIcon'
import { PointsIcon } from '@ui-kit/shared/icons/PointsIcon'
import { SelectableChip } from '@ui-kit/shared/ui/SelectableChip'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { LlamaMarketColumnId } from '@/loan/components/PageLlamaMarkets/columns.enum'

const { Spacing } = SizesAndSpaces

type LlamaMarketKey = DeepKeys<LlamaMarket>

type ColumnFilterProps = {
  columnFiltersById: Record<LlamaMarketKey, unknown>
  setColumnFilter: (id: LlamaMarketKey, value: unknown) => void
}

/** Hook for managing a single boolean filter */
function useToggleFilter(key: LlamaMarketKey, { columnFiltersById, setColumnFilter }: ColumnFilterProps) {
  const isFiltered = !!columnFiltersById[key]
  const toggle = useCallback(
    () => setColumnFilter(key, isFiltered ? undefined : true),
    [isFiltered, key, setColumnFilter],
  )
  return [isFiltered, toggle] as const
}

/**
 * Hook for managing market type filter
 * @returns marketTypes - object with keys for each market type and boolean values indicating if the type is selected
 * @returns toggles - object with keys for each market type and functions to toggle the type
 */
function useMarketTypeFilter({ columnFiltersById, setColumnFilter }: ColumnFilterProps) {
  const filter = columnFiltersById[LlamaMarketColumnId.Type] as LlamaMarketType[] | undefined
  const toggleMarketType = useCallback(
    (type: LlamaMarketType) => {
      setColumnFilter(
        LlamaMarketColumnId.Type,
        filter?.includes(type) ? Object.values(LlamaMarketType).filter((f) => f !== type) : [...(filter || []), type],
      )
    },
    [filter, setColumnFilter],
  )

  const marketTypes = {
    [LlamaMarketType.Mint]: filter?.includes(LlamaMarketType.Mint) ?? false,
    [LlamaMarketType.Lend]: filter?.includes(LlamaMarketType.Lend) ?? false,
  }
  const toggles = {
    [LlamaMarketType.Mint]: useCallback(() => toggleMarketType(LlamaMarketType.Mint), [toggleMarketType]),
    [LlamaMarketType.Lend]: useCallback(() => toggleMarketType(LlamaMarketType.Lend), [toggleMarketType]),
  }
  return [marketTypes, toggles] as const
}

export const MarketsFilterChips = (props: ColumnFilterProps) => {
  const [myMarkets, toggleMyMarkets] = useToggleFilter(LlamaMarketColumnId.UserHasPosition, props)
  const [favorites, toggleFavorites] = useToggleFilter(LlamaMarketColumnId.IsFavorite, props)
  const [rewards, toggleRewards] = useToggleFilter(LlamaMarketColumnId.Rewards, props)
  const [marketTypes, toggleMarkets] = useMarketTypeFilter(props)
  const { signerAddress } = useWallet()

  return (
    <Stack direction="row" gap={Spacing.lg} flexWrap="wrap">
      <Stack direction="row" gap="4px">
        <SelectableChip
          label={t`Mint Markets`}
          selected={marketTypes.Mint}
          toggle={toggleMarkets.Mint}
          data-testid="chip-mint"
        />
        <SelectableChip
          label={t`Lend Markets`}
          selected={marketTypes.Lend}
          toggle={toggleMarkets.Lend}
          data-testid="chip-lend"
        />
      </Stack>
      <Stack direction="row" gap="4px">
        {signerAddress && (
          <SelectableChip
            label={t`My Markets`}
            selected={myMarkets}
            toggle={toggleMyMarkets}
            icon={<PersonIcon />}
            data-testid="chip-my-markets"
          />
        )}
        <SelectableChip
          label={t`Favorites`}
          selected={favorites}
          toggle={toggleFavorites}
          icon={<HeartIcon />}
          data-testid="chip-favorites"
        />
        <SelectableChip
          label={t`Rewards`}
          selected={rewards}
          toggle={toggleRewards}
          icon={<PointsIcon />}
          data-testid="chip-rewards"
        />
      </Stack>
    </Stack>
  )
}
