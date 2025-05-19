import { type ReactNode, useCallback } from 'react'
import { useAccount } from 'wagmi'
import { LlamaMarketColumnId } from '@/loan/components/PageLlamaMarkets/columns.enum'
import { LlamaMarket, LlamaMarketType } from '@/loan/entities/llama-markets'
import PersonIcon from '@mui/icons-material/Person'
import Grid from '@mui/material/Grid2'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import { DeepKeys } from '@tanstack/table-core/build/lib/utils'
import { t } from '@ui-kit/lib/i18n'
import { HeartIcon } from '@ui-kit/shared/icons/HeartIcon'
import { PointsIcon } from '@ui-kit/shared/icons/PointsIcon'
import { ResetFiltersButton } from '@ui-kit/shared/ui/DataTable'
import { SelectableChip, type SelectableChipProps } from '@ui-kit/shared/ui/SelectableChip'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing } = SizesAndSpaces

type LlamaMarketKey = DeepKeys<LlamaMarket>

type ColumnFilterProps = {
  columnFiltersById: Record<LlamaMarketKey, unknown>
  setColumnFilter: (id: LlamaMarketKey, value: unknown) => void
}

/** Hook for managing a single boolean filter */
function useToggleFilter(key: LlamaMarketKey, { columnFiltersById, setColumnFilter }: ColumnFilterProps) {
  const isSelected = !!columnFiltersById[key]
  const toggle = useCallback(
    () => setColumnFilter(key, isSelected ? undefined : true),
    [isSelected, key, setColumnFilter],
  )
  return [isSelected, toggle] as const
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
        filter?.includes(type) ? filter.filter((f) => f !== type) : [...(filter || []), type],
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

type MarketsFilterChipsProps = ColumnFilterProps & {
  hiddenMarketCount: number
  resetFilters: () => void
  hasFilters: boolean
  hasPositions: boolean | undefined
  hasFavorites: boolean | undefined
}

const GridItem = ({
  children,
  size = 6,
  alignRight,
  extraMargin,
}: {
  children: ReactNode
  size?: number // used for mobile size (`Points` can take the full width on mobile)
  alignRight?: boolean // used to align text to the right on the last item
  extraMargin?: boolean // used to separate the different types of chips on larger screens
}) => (
  <Grid
    size={{ mobile: size, tablet: 'auto' }}
    sx={{
      alignContent: 'center',
      ...(alignRight && { textAlign: 'right', '&': { flexGrow: '1' } }),
      ...(extraMargin && { marginInlineEnd: { tablet: Spacing.md.tablet } }),
    }}
  >
    {children}
  </Grid>
)

const GridChip = ({
  size,
  extraMargin,
  ...props
}: Omit<SelectableChipProps, 'size'> & { size?: number; extraMargin?: boolean }) => (
  <GridItem size={size} extraMargin={extraMargin}>
    <SelectableChip {...props} sx={{ width: { mobile: '100%', tablet: 'auto' } }} />
  </GridItem>
)

export const MarketsFilterChips = ({
  hiddenMarketCount,
  resetFilters,
  hasFilters,
  hasPositions,
  hasFavorites,
  ...props
}: MarketsFilterChipsProps) => {
  const [myMarkets, toggleMyMarkets] = useToggleFilter(LlamaMarketColumnId.UserHasPosition, props)
  const [favorites, toggleFavorites] = useToggleFilter(LlamaMarketColumnId.IsFavorite, props)
  const [rewards, toggleRewards] = useToggleFilter(LlamaMarketColumnId.Rewards, props)
  const [marketTypes, toggleMarkets] = useMarketTypeFilter(props)
  const { address } = useAccount()
  const isMobile = useMediaQuery((t) => t.breakpoints.down('tablet'))

  return (
    <Grid
      container
      rowSpacing={{ mobile: 2, tablet: 4 }}
      columnSpacing={{ mobile: 2, tablet: '4px' }}
      sx={{ width: '100%' }}
    >
      <GridChip
        label={t`Mint Markets`}
        selected={marketTypes.Mint}
        toggle={toggleMarkets.Mint}
        data-testid="chip-mint"
      />
      <GridChip
        label={t`Lend Markets`}
        selected={marketTypes.Lend}
        toggle={toggleMarkets.Lend}
        data-testid="chip-lend"
        extraMargin
      />
      {address && (
        <GridChip
          label={t`My Markets`}
          selected={myMarkets}
          toggle={toggleMyMarkets}
          icon={<PersonIcon />}
          data-testid="chip-my-markets"
          disabled={!hasPositions}
        />
      )}
      <GridChip
        label={t`Favorites`}
        selected={favorites}
        toggle={toggleFavorites}
        icon={<HeartIcon />}
        data-testid="chip-favorites"
        disabled={!hasFavorites}
      />
      <GridChip
        label={t`Points`}
        selected={rewards}
        toggle={toggleRewards}
        icon={<PointsIcon />}
        data-testid="chip-rewards"
        {...(address && { size: 12 })}
        extraMargin
      />
      <GridItem {...(!isMobile && { alignRight: true })}>
        <Stack direction="column">
          <Typography variant="bodyXsRegular">{t`Hidden Markets`}</Typography>
          <Typography variant="highlightS">{hiddenMarketCount}</Typography>
        </Stack>
      </GridItem>
      <GridItem alignRight>
        <ResetFiltersButton onClick={resetFilters} hidden={!hasFilters} />
      </GridItem>
    </Grid>
  )
}
