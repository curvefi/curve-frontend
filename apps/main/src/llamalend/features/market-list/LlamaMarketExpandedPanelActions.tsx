import { useMemo } from 'react'
import type { LlamaMarket } from '@/llamalend/queries/market-list/llama-markets'
import { notFalsy } from '@primitives/objects.utils'
import { t } from '@ui-kit/lib/i18n'
import { LEND_MARKET_ROUTES } from '@ui-kit/shared/routes'
import { ExpandedPanelActions } from '@ui-kit/shared/ui/DataTable/ExpandedPanelActions'
import type { ExpandedPanelComponent } from '@ui-kit/shared/ui/DataTable/ExpansionRow'
import { LlamaMarketType } from '@ui-kit/types/market'
import { useLlamaMarketExpandedPanelActions } from './hooks/useLlamaMarketExpandedPanelActions'

export const LlamaMarketExpandedPanelActions: ExpandedPanelComponent<LlamaMarket> = ({ row: { original: market } }) => {
  const extraPanels = useLlamaMarketExpandedPanelActions(market)

  const actions = useMemo(
    () =>
      notFalsy(
        market.type === LlamaMarketType.Lend && {
          id: 'earn',
          label: t`Earn`,
          href: market.url + LEND_MARKET_ROUTES.PAGE_VAULT,
          testId: 'llama-market-go-to-vault',
        },
        { id: 'borrow', label: t`Borrow`, href: market.url, testId: 'llama-market-go-to-borrow' },
        ...extraPanels,
      ),
    [extraPanels, market.type, market.url],
  )

  return <ExpandedPanelActions actions={actions} />
}
