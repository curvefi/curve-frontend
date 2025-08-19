import { useAccount } from 'wagmi'
import type { LlamaMarketKey } from '@/llamalend/entities/llama-markets'
import { GridChip } from '@/llamalend/PageLlamaMarkets/chips/GridChip'
import { LlamaMarketColumnId } from '@/llamalend/PageLlamaMarkets/columns.enum'
import { useToggleFilter } from '@/llamalend/PageLlamaMarkets/hooks/useToggleFilter'
import PersonIcon from '@mui/icons-material/Person'
import Grid from '@mui/material/Grid'
import { t } from '@ui-kit/lib/i18n'
import { HeartIcon } from '@ui-kit/shared/icons/HeartIcon'
import { PointsIcon } from '@ui-kit/shared/icons/PointsIcon'
import { type FilterProps } from '@ui-kit/shared/ui/DataTable'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing } = SizesAndSpaces

export const LlamaListFilterChips = ({
  hasPositions,
  hasFavorites,
  ...props
}: {
  hasPositions: boolean | undefined
  hasFavorites: boolean | undefined
} & FilterProps<LlamaMarketKey>) => {
  const { address } = useAccount()
  const isConnected = hasPositions != null && !!address
  const [myMarkets, toggleMyMarkets] = useToggleFilter(LlamaMarketColumnId.UserHasPosition, props)
  const [favorites, toggleFavorites] = useToggleFilter(LlamaMarketColumnId.IsFavorite, props)
  const [rewards, toggleRewards] = useToggleFilter(LlamaMarketColumnId.Rewards, props)
  return (
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
  )
}
