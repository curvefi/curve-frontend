import { useConnection } from 'wagmi'
import type { LlamaMarketsResult } from '@/llamalend/queries/market-list/llama-markets'
import PersonIcon from '@mui/icons-material/Person'
import { useIsMobile } from '@ui-kit/hooks/useBreakpoints'
import { t } from '@ui-kit/lib/i18n'
import { HeartIcon } from '@ui-kit/shared/icons/HeartIcon'
import { PointsIcon } from '@ui-kit/shared/icons/PointsIcon'
import { GridChip } from '@ui-kit/shared/ui/DataTable/chips/GridChip'
import { type FilterProps } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { LlamaMarketColumnId } from '../columns'
import { useToggleFilter } from '../hooks/useToggleFilter'

export const LlamaListUserChips = ({
  userHasPositions,
  hasFavorites,
  ...props
}: {
  userHasPositions: LlamaMarketsResult['userHasPositions'] | undefined
  hasFavorites: boolean | undefined
} & FilterProps<LlamaMarketColumnId>) => {
  const { address } = useConnection()
  const isConnected = Boolean(userHasPositions && address)
  const [myMarkets, toggleMyMarkets] = useToggleFilter(LlamaMarketColumnId.UserHasPositions, props)
  const [favorites, toggleFavorites] = useToggleFilter(LlamaMarketColumnId.IsFavorite, props)
  const [rewards, toggleRewards] = useToggleFilter(LlamaMarketColumnId.Rewards, props)
  const isMobile = useIsMobile()
  return (
    <>
      {isConnected && (
        <GridChip
          label={t`My Markets`}
          selected={myMarkets}
          toggle={toggleMyMarkets}
          onDelete={toggleMyMarkets}
          icon={<PersonIcon />}
          data-testid="chip-my-markets"
          disabled={!userHasPositions}
          size={{ mobile: 12, tablet: 'auto' }}
          selectableChipSize={isMobile ? 'large' : 'small'}
        />
      )}
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
