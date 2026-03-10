import { useFavoriteMarket } from '@/llamalend/queries/market-list/favorite-markets'
import IconButton from '@mui/material/IconButton'
import type { Address } from '@primitives/address.utils'
import { t } from '@ui-kit/lib/i18n'
import { FavoriteHeartIcon } from '@ui-kit/shared/icons/HeartIcon'
import { ClickableInRowClass, DesktopOnlyHoverClass } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { Tooltip } from '@ui-kit/shared/ui/Tooltip'
import { classNames } from '@ui-kit/utils/dom'

export function FavoriteMarketButton({ address, desktopOnly }: { address: Address; desktopOnly?: boolean }) {
  const [isFavorite, toggleFavorite] = useFavoriteMarket(address)
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
        <FavoriteHeartIcon isFavorite={isFavorite} />
      </IconButton>
    </Tooltip>
  )
}
