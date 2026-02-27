import { useIsMobile } from '@ui-kit/hooks/useBreakpoints'
import { t } from '@ui-kit/lib/i18n'
import { HeartIcon } from '@ui-kit/shared/icons/HeartIcon'
import { PointsIcon } from '@ui-kit/shared/icons/PointsIcon'
import { GridChip } from '@ui-kit/shared/ui/DataTable/chips/GridChip'
import { type FilterProps } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { LlamaMarketColumnId } from '../columns'
import { useToggleFilter } from '../hooks/useToggleFilter'

export const LlamaListUserChips = ({
  hasFavorites,
  ...props
}: {
  hasFavorites: boolean | undefined
} & FilterProps<LlamaMarketColumnId>) => {
  const [favorites, toggleFavorites] = useToggleFilter(LlamaMarketColumnId.IsFavorite, props)
  const [rewards, toggleRewards] = useToggleFilter(LlamaMarketColumnId.Rewards, props)
  const isMobile = useIsMobile()
  return (
    <>
      <GridChip
        label={t`Favorites`}
        selected={favorites}
        toggle={toggleFavorites}
        onDelete={toggleFavorites}
        icon={<HeartIcon />}
        data-testid="chip-favorites"
        disabled={!hasFavorites}
        selectableChipSize={isMobile ? 'large' : 'small'}
      />
      <GridChip
        label={t`Points`}
        selected={rewards}
        toggle={toggleRewards}
        onDelete={toggleRewards}
        icon={<PointsIcon />}
        data-testid="chip-rewards"
        selectableChipSize={isMobile ? 'large' : 'small'}
      />
    </>
  )
}
