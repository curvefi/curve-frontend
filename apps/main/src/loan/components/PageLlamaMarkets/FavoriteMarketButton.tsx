import { useFavoriteMarket } from '@/loan/entities/favorite-markets'
import IconButton from '@mui/material/IconButton'
import { useTheme } from '@mui/material/styles'
import { t } from '@ui-kit/lib/i18n'
import { FavoriteHeartIcon } from '@ui-kit/shared/icons/HeartIcon'
import { ClickableInRowClass, DesktopOnlyHoverClass } from '@ui-kit/shared/ui/DataTable'
import { Tooltip } from '@ui-kit/shared/ui/Tooltip'
import type { Address } from '@ui-kit/utils'
import { classNames } from '@ui-kit/utils/dom'

export function FavoriteMarketButton({ address, desktopOnly }: { address: Address; desktopOnly?: boolean }) {
  const [isFavorite, toggleFavorite] = useFavoriteMarket(address)
  const { design } = useTheme()
  return (
    <Tooltip title={isFavorite ? t`Remove from favorites` : t`Add to favorites`} placement="top">
      <IconButton
        size="extraSmall"
        onClick={toggleFavorite}
        {...{
          ...(desktopOnly && {
            className: classNames(!isFavorite && DesktopOnlyHoverClass, ClickableInRowClass),
            sx: { display: { mobile: 'none', tablet: 'flex' } },
          }),
        }}
      >
        <FavoriteHeartIcon color={design.Text.TextColors.Highlight} isFavorite={isFavorite} />
      </IconButton>
    </Tooltip>
  )
}
