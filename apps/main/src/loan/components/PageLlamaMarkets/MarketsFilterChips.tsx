import Chip from '@mui/material/Chip'
import { t } from '@lingui/macro'
import { HeartIcon } from '@ui-kit/shared/icons/HeartIcon'
import { PointsIcon } from '@ui-kit/shared/icons/PointsIcon'
import { LlamaMarket, LlamaMarketType } from '@/loan/entities/llama-markets'
import Stack from '@mui/material/Stack'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { DeepKeys } from '@tanstack/table-core/build/lib/utils'
import { useCallback } from 'react'
import { createSvgIcon } from '@mui/material/utils'

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
  const filter = columnFiltersById['type'] as LlamaMarketType[] | undefined
  const toggleMarketType = useCallback(
    (type: LlamaMarketType) => {
      setColumnFilter(
        'type',
        filter && filter.includes(type) ? filter.filter((f) => f !== type) : [...(filter || []), type],
      )
    },
    [filter, setColumnFilter],
  )

  const marketTypes = {
    [LlamaMarketType.Mint]: !filter || filter.includes(LlamaMarketType.Mint),
    [LlamaMarketType.Pool]: !filter || filter.includes(LlamaMarketType.Pool),
  }
  const toggles = {
    [LlamaMarketType.Mint]: useCallback(() => toggleMarketType(LlamaMarketType.Mint), [toggleMarketType]),
    [LlamaMarketType.Pool]: useCallback(() => toggleMarketType(LlamaMarketType.Pool), [toggleMarketType]),
  }
  return [marketTypes, toggles] as const
}

const FilterChip = ({
  label,
  selected,
  toggle,
  icon: Icon,
}: {
  label: string
  selected: boolean
  toggle: () => void
  icon?: ReturnType<typeof createSvgIcon>
}) => (
  <Chip
    clickable
    label={label}
    color={selected ? 'selected' : 'unselected'}
    onDelete={selected ? toggle : undefined}
    onClick={selected ? undefined : toggle}
    icon={Icon && <Icon />}
  />
)

export const MarketsFilterChips = (props: ColumnFilterProps) => {
  const [favorites, toggleFavorites] = useToggleFilter('isFavorite', props)
  const [rewards, toggleRewards] = useToggleFilter('rewards', props)
  const [marketTypes, toggleMarkets] = useMarketTypeFilter(props)

  return (
    <Stack direction="row" gap={Spacing.lg}>
      <Stack direction="row" gap="4px">
        <FilterChip label={t`Favorites`} selected={favorites} toggle={toggleFavorites} icon={HeartIcon} />
        <FilterChip label={t`Rewards`} selected={rewards} toggle={toggleRewards} icon={PointsIcon} />
      </Stack>
      <Stack direction="row" gap="4px">
        <FilterChip label={t`Mint Markets`} selected={marketTypes.Mint} toggle={toggleMarkets.Mint} />
        <FilterChip label={t`Lend Markets`} selected={marketTypes.Pool} toggle={toggleMarkets.Pool} />
      </Stack>
    </Stack>
  )
}
