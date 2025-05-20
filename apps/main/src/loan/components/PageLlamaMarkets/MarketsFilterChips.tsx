import { type ReactNode } from 'react'
import { useAccount } from 'wagmi'
import { LlamaMarketColumnId } from '@/loan/components/PageLlamaMarkets/columns.enum'
import { useMarketTypeFilter } from '@/loan/components/PageLlamaMarkets/hooks/useMarketTypeFilter'
import { useToggleFilter } from '@/loan/components/PageLlamaMarkets/hooks/useToggleFilter'
import type { LlamaMarketKey } from '@/loan/entities/llama-markets'
import PersonIcon from '@mui/icons-material/Person'
import Grid from '@mui/material/Grid2'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import { t } from '@ui-kit/lib/i18n'
import { HeartIcon } from '@ui-kit/shared/icons/HeartIcon'
import { PointsIcon } from '@ui-kit/shared/icons/PointsIcon'
import { type FilterProps, ResetFiltersButton } from '@ui-kit/shared/ui/DataTable'
import { SelectableChip, type SelectableChipProps } from '@ui-kit/shared/ui/SelectableChip'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing } = SizesAndSpaces

type ColumnFilterProps = FilterProps<LlamaMarketKey>

type MarketsFilterChipsProps = ColumnFilterProps & {
  hiddenMarketCount: number
  resetFilters: () => void
  hasFilters: boolean
  hasPositions: boolean | undefined
  hasFavorites: boolean | undefined
}

/**
 * A Grid item for the list of chips. It takes 50% of the width on mobile and auto on larger screens.
 * @param children - The content of the item
 * @param size - The size of the item on mobile (default is 6, which is 50% of the width)
 *    (`Points` can take the full width on mobile)
 * @param alignRight - Used to align the text to the right on the last item.
 * @param extraMargin - For large screens, used to separate the different types of chips
 */
const GridItem = ({
  children,
  size = 6,
  alignRight,
  extraMargin,
}: {
  children: ReactNode
  size?: number
  alignRight?: boolean
  extraMargin?: boolean
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

/** A <GridItem> with a SelectableChip inside */
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
      justifyContent="flex-end"
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
