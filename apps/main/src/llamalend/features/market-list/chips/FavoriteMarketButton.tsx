import { useFavoriteMarket } from '@/llamalend/queries/market-list/favorite-markets'
import { t } from '@evm-ui/lib/i18n'
import { FavoriteHeartIcon } from '@evm-ui/shared/icons/HeartIcon'
import { CLICKABLE_IN_ROW_CLASS, DESKTOP_ONLY_HOVER_CLASS } from '@evm-ui/shared/ui/DataTable/data-table.utils'
import { Tooltip } from '@evm-ui/shared/ui/Tooltip'
import { classNames } from '@evm-ui/utils/dom'
import IconButton from '@mui/material/IconButton'
import type { Address } from '@primitives/address.utils'
import { notFalsy } from '@primitives/objects.utils'

export function FavoriteMarketButton({ address, desktopOnly }: { address: Address; desktopOnly?: boolean }) {
  const [isFavorite, toggleFavorite] = useFavoriteMarket(address)
  return (
    <Tooltip title={isFavorite ? t`Remove from favorites` : t`Add to favorites`} placement="top">
      <IconButton
        size="extraSmall"
        onClick={toggleFavorite}
        data-testid={notFalsy('favorite-btn', isFavorite && '-active').join('')}
        {...{
          ...(desktopOnly && {
            className: classNames(!isFavorite && DESKTOP_ONLY_HOVER_CLASS, CLICKABLE_IN_ROW_CLASS),
            sx: { display: { mobile: 'none', tablet: 'flex' } },
          }),
        }}
      >
        <FavoriteHeartIcon isFavorite={isFavorite} />
      </IconButton>
    </Tooltip>
  )
}
