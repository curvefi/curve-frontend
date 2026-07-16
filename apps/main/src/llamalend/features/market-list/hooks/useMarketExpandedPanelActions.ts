import { useMemo } from 'react'
import { useFavoriteMarkets } from '@/llamalend/queries/market-list/favorite-markets'
import type { LlamaMarket } from '@/llamalend/queries/market-list/llama-markets'
import { copyToClipboardWithToast } from '@ui-kit/hooks/useCopyToClipboard'
import { t } from '@ui-kit/lib/i18n'
import type { ExpandedPanelAction } from '@ui-kit/shared/ui/DataTable/data-table.utils'

export const useMarketExpandedPanelActions = (market: LlamaMarket) => {
  const [, toggleFavoriteMarket] = useFavoriteMarkets()
  const { controllerAddress, isFavorite, favoriteKey } = market

  return useMemo<ExpandedPanelAction[]>(
    () => [
      {
        id: 'toggle-favorite-market',
        label: isFavorite ? t`Remove from favorites` : t`Add to favorites`,
        onClick: () => toggleFavoriteMarket(favoriteKey),
        testId: isFavorite ? 'favorite-btn-active' : 'favorite-btn',
        alwaysInKebabMenu: true,
      },
      {
        id: 'copy-market-address',
        label: t`Copy market address`,
        onClick: () =>
          void copyToClipboardWithToast({
            copyText: controllerAddress,
            confirmationText: t`Market address copied`,
            failureText: t`Failed to copy market address`,
          }),
        testId: `copy-market-address-${controllerAddress}`,
        alwaysInKebabMenu: true,
      },
    ],
    [controllerAddress, favoriteKey, isFavorite, toggleFavoriteMarket],
  )
}
