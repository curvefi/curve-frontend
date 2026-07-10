import { useCallback } from 'react'
import { useFavoriteMarkets } from '@/llamalend/queries/market-list/favorite-markets'
import type { LlamaMarket } from '@/llamalend/queries/market-list/llama-markets'
import { notFalsy } from '@primitives/objects.utils'
import { copyToClipboardWithToast } from '@ui-kit/hooks/useCopyToClipboard'
import { t } from '@ui-kit/lib/i18n'
import type { ExpandedPanelActionResolver } from '@ui-kit/shared/ui/DataTable/data-table.utils'

export const useLlamaMarketExpandedPanelActions = (getPrimaryActions: ExpandedPanelActionResolver<LlamaMarket>) => {
  const [favoriteMarkets, toggleFavoriteMarket] = useFavoriteMarkets()

  return useCallback<ExpandedPanelActionResolver<LlamaMarket>>(
    context => {
      const { controllerAddress, favoriteKey } = context.row.original
      const isFavorite = favoriteMarkets.includes(favoriteKey)

      return notFalsy(
        ...getPrimaryActions(context),
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
        {
          id: 'toggle-favorite-market',
          label: isFavorite ? t`Remove from favorites` : t`Add to favorites`,
          onClick: () => toggleFavoriteMarket(favoriteKey),
          testId: isFavorite ? 'favorite-btn-active' : 'favorite-btn',
          alwaysInKebabMenu: true,
        },
      )
    },
    [favoriteMarkets, getPrimaryActions, toggleFavoriteMarket],
  )
}
