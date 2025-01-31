import Stack from '@mui/material/Stack'
import Chip from '@mui/material/Chip'
import { t } from '@lingui/macro'
import React, { useCallback, useMemo } from 'react'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { LlamaMarket, LlamaMarketType } from '@/loan/entities/llama-markets'
import { useLocalStorage } from '@ui-kit/hooks/useLocalStorage'
import IconButton from '@mui/material/IconButton'
import { FavoriteHeartIcon } from '@ui-kit/shared/icons/HeartIcon'
import { PointsIcon } from '@ui-kit/shared/icons/PointsIcon'
import { useTheme } from '@mui/material/styles'
import Tooltip from '@mui/material/Tooltip'
import { DesktopOnlyHoverClass } from '@ui-kit/shared/ui/DataTable'

const { Spacing } = SizesAndSpaces

const poolTypeNames: Record<LlamaMarketType, () => string> = {
  [LlamaMarketType.Pool]: () => t`Pool`,
  [LlamaMarketType.Mint]: () => t`Mint`,
}

function useFavoriteMarket(address: string) {
  const [favorites, setFavorites] = useLocalStorage<string[]>('favoriteMarkets', [])
  const isFavorite = useMemo(() => favorites.includes(address), [favorites, address])
  const toggleFavorite = useCallback(
    () => (isFavorite ? setFavorites(favorites.filter((id) => id !== address)) : setFavorites([...favorites, address])),
    [favorites, isFavorite, address, setFavorites],
  )
  return [isFavorite, toggleFavorite] as const
}

/** Displays badges for a pool, such as the chain icon and the pool type. */
export const MarketBadges = ({ market: { address, hasPoints, type, leverage } }: { market: LlamaMarket }) => {
  const [isFavorite, toggleFavorite] = useFavoriteMarket(address)
  const iconsColor = useTheme().design.Text.TextColors.Highlight
  return (
    <Stack direction="row" gap={Spacing.sm} alignItems="center">
      <Chip size="small" color="default" label={poolTypeNames[type]()} />
      {leverage > 0 && <Chip size="small" color="highlight" label={t`🔥 ${leverage}x leverage`} />}

      {hasPoints && (
        <Tooltip title={t`This pool has points`} placement="top">
          <PointsIcon htmlColor={iconsColor} />
        </Tooltip>
      )}

      <IconButton size="extraSmall" onClick={toggleFavorite} className={isFavorite ? '' : DesktopOnlyHoverClass}>
        <FavoriteHeartIcon color={iconsColor} isFavorite={isFavorite} />
      </IconButton>
    </Stack>
  )
}
