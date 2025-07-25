import { type ReactNode } from 'react'
import { useAccount } from 'wagmi'
import type { LlamaMarketKey } from '@/llamalend/entities/llama-markets'
import { LlamaMarketColumnId } from '@/llamalend/PageLlamaMarkets/columns.enum'
import { useMarketTypeFilter } from '@/llamalend/PageLlamaMarkets/hooks/useMarketTypeFilter'
import { useToggleFilter } from '@/llamalend/PageLlamaMarkets/hooks/useToggleFilter'
import PersonIcon from '@mui/icons-material/Person'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useIsMobile } from '@ui-kit/hooks/useBreakpoints'
import { t } from '@ui-kit/lib/i18n'
import { HeartIcon } from '@ui-kit/shared/icons/HeartIcon'
import { PointsIcon } from '@ui-kit/shared/icons/PointsIcon'
import { type FilterProps, ResetFiltersButton } from '@ui-kit/shared/ui/DataTable'
import { TableSearchField } from '@ui-kit/shared/ui/DataTable/TableSearchField'
import { SelectableChip, type SelectableChipProps } from '@ui-kit/shared/ui/SelectableChip'
import { Tooltip } from '@ui-kit/shared/ui/Tooltip'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing } = SizesAndSpaces

type ColumnFilterProps = FilterProps<LlamaMarketKey>

type MarketsFilterChipsProps = ColumnFilterProps & {
  hiddenMarketCount: number
  resetFilters: () => void
  hasFilters: boolean
  hasPositions: boolean | undefined
  hasFavorites: boolean | undefined
  searchText: string
  onSearch: (value: string) => void
}

/**
 * A Grid item for the list of chips. It takes 50% of the width on mobile and auto on larger screens.
 * @param children - The content of the item
 * @param size - The size of the item on mobile (default is 6, which is 50% of the width)
 *    (`Points` can take the full width on mobile)
 * @param alignRight - Used to align the text to the right on the last item.
 * @param extraMargin - For large screens, used to separate the different types of chips
 */
const GridItem = ({ children, size = 6, alignRight }: { children: ReactNode; size?: number; alignRight?: boolean }) => (
  <Grid
    size={{ mobile: size, tablet: 'auto' }}
    sx={{
      alignContent: 'center',
      ...(alignRight && { textAlign: 'right', '&': { flexGrow: '1' } }),
    }}
  >
    {children}
  </Grid>
)

/** A <GridItem> with a SelectableChip inside */
const GridChip = ({ size, ...props }: Omit<SelectableChipProps, 'size'> & { size?: number }) => (
  <GridItem size={size}>
    <SelectableChip {...props} sx={{ width: { mobile: '100%', tablet: 'auto' } }} />
  </GridItem>
)

export const MarketsFilterChips = ({
  hiddenMarketCount,
  resetFilters,
  hasFilters,
  hasPositions,
  hasFavorites,
  searchText,
  onSearch,
  ...props
}: MarketsFilterChipsProps) => {
  const [myMarkets, toggleMyMarkets] = useToggleFilter(LlamaMarketColumnId.UserHasPosition, props)
  const [favorites, toggleFavorites] = useToggleFilter(LlamaMarketColumnId.IsFavorite, props)
  const [rewards, toggleRewards] = useToggleFilter(LlamaMarketColumnId.Rewards, props)
  const [marketTypes, toggleMarkets] = useMarketTypeFilter(props)
  const { address } = useAccount()

  const isConnected = hasPositions != null && !!address
  const tooltip =
    !hasFilters && hiddenMarketCount
      ? t`Some markets are hidden by default due to low liquidity. You may change that in the liquidity filter.`
      : null

  return (
    <Grid container rowSpacing={Spacing.xs} columnSpacing={Spacing.lg}>
      {!useIsMobile() && <TableSearchField value={searchText} onChange={onSearch} />}
      <Grid container columnSpacing={Spacing.xs} justifyContent="flex-end" size={{ mobile: 12, tablet: 'auto' }}>
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
        />
      </Grid>
      <Grid container columnSpacing={Spacing.xs} justifyContent="flex-end" size={{ mobile: 12, tablet: 'auto' }}>
        {isConnected && (
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
          {...(isConnected && { size: 12 })}
        />
      </Grid>

      <Tooltip title={tooltip}>
        <Grid container columnSpacing={Spacing.xs} justifyContent="flex-end" size={{ mobile: 12, tablet: 'auto' }}>
          <GridItem {...(!useIsMobile() && { alignRight: true })}>
            <Stack direction="row" gap={1} alignItems="center">
              <Typography variant="bodyXsRegular">{t`Hidden`}</Typography>
              <Typography variant="highlightS">{hiddenMarketCount}</Typography>
            </Stack>
          </GridItem>
          <GridItem alignRight>
            <ResetFiltersButton onClick={resetFilters} hidden={!hasFilters} />
          </GridItem>
        </Grid>
      </Tooltip>
    </Grid>
  )
}
