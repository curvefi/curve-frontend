import { useMemo } from 'react'
import type { LlamaMarketRow } from '@/llamalend/queries/market-list/llama-market-stats'
import { t } from '@evm-ui/lib/i18n'
import { LEND_MARKET_ROUTES } from '@evm-ui/shared/routes'
import { ExpandedPanelActions } from '@evm-ui/shared/ui/DataTable/ExpandedPanelActions'
import type { ExpandedPanelComponent } from '@evm-ui/shared/ui/DataTable/ExpansionRow'
import { MarketType } from '@evm-ui/types/market'
import { notFalsy } from '@primitives/objects.utils'
import { useMarketExpandedPanelActions } from './hooks/useMarketExpandedPanelActions'

export const MarketExpandedPanelActions: ExpandedPanelComponent<LlamaMarketRow> = ({ row: { original: market } }) => {
  const extraPanels = useMarketExpandedPanelActions(market)

  const actions = useMemo(
    () => [
      ...notFalsy(
        market.type === MarketType.Lend && {
          id: 'earn',
          label: t`Earn`,
          href: market.url + LEND_MARKET_ROUTES.PAGE_VAULT,
          testId: 'llama-market-go-to-vault',
        },
        { id: 'borrow', label: t`Borrow`, href: market.url, testId: 'llama-market-go-to-borrow' },
      ),
      ...extraPanels,
    ],
    [extraPanels, market.type, market.url],
  )

  return <ExpandedPanelActions actions={actions} />
}
