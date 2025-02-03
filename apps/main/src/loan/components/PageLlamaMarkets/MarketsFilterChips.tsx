import Chip from '@mui/material/Chip'
import { t } from '@lingui/macro'
import { HeartIcon } from '@ui-kit/shared/icons/HeartIcon'
import { PointsIcon } from '@ui-kit/shared/icons/PointsIcon'
import { LlamaMarketType } from '@/loan/entities/llama-markets'
import Stack from '@mui/material/Stack'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing } = SizesAndSpaces

export const MarketsFilterChips = ({
  columnFiltersById,
  setColumnFilter,
}: {
  columnFiltersById: Record<string, unknown>
  setColumnFilter: (id: string, value: unknown) => void
}) => {
  console.log(columnFiltersById)
  const isFavoriteFiltered = columnFiltersById['isFavorite']
  const toggleFilterFavorite = () => setColumnFilter('isFavorite', !isFavoriteFiltered)
  const hasPointsFiltered = columnFiltersById['hasPoints']
  const toggleHasPoints = () => setColumnFilter('hasPoints', !hasPointsFiltered)
  const showMintMarkets = columnFiltersById['type'] !== LlamaMarketType.Mint
  const toggleShowMintMarkets = () => setColumnFilter('type', showMintMarkets ? undefined : LlamaMarketType.Mint)
  const showPoolMarkets = columnFiltersById['type'] !== LlamaMarketType.Pool
  const toggleShowPoolMarkets = () => setColumnFilter('type', showPoolMarkets ? undefined : LlamaMarketType.Pool)

  return (
    <Stack direction="row" gap={Spacing.lg}>
      <Stack direction="row" gap="4px">
        <Chip
          clickable
          label={t`Favorites`}
          color={isFavoriteFiltered ? 'selected' : 'unselected'}
          onClick={toggleFilterFavorite}
          icon={<HeartIcon />}
        />
        <Chip
          clickable
          label={t`Points`}
          color={hasPointsFiltered ? 'selected' : 'unselected'}
          onClick={toggleHasPoints}
          icon={<PointsIcon />}
        />
      </Stack>
      <Stack direction="row" gap="4px">
        <Chip
          clickable
          label={t`Mint Markets`}
          color={showMintMarkets ? 'selected' : 'unselected'}
          onDelete={showMintMarkets ? toggleShowMintMarkets : undefined}
        />
        <Chip
          clickable
          label={t`Pool Markets`}
          color={showPoolMarkets ? 'selected' : 'unselected'}
          onDelete={showPoolMarkets ? toggleShowPoolMarkets : undefined}
        />
      </Stack>
    </Stack>
  )
}
