import { useMemo } from 'react'
import type { LlamaMarketRow } from '@/llamalend/queries/market-list/llama-market-stats'
import { LEND_MARKET_ROUTES } from '@evm-ui/shared/routes'
import { MarketType } from '@evm-ui/types/market'
import { notFalsy } from '@primitives/objects.utils'
import { ExpandedPanelActions } from '@ui/features/tables/ExpandedPanelActions'
import type { ExpandedPanelComponent } from '@ui/features/tables/ExpansionRow'
import { t } from '@ui/lib/i18n'
import { useMarketExpandedPanelActions } from './hooks/useMarketExpandedPanelActions'

export const MarketExpandedPanelActions: ExpandedPanelComponent<LlamaMarketRow> = ({ row: { original: market } }) => {
  const extraPanels = useMarketExpandedPanelActions(market)

  const actions = useMemo(
    () => [
      ...notFalsy(
        market.type === MarketType.Lend && {
          id: 'earn',
          label: t`Earn`,
          href: LEND_MARKET_ROUTES.PAGE_VAULT({
            app: 'lend',
            blockchainId: market.blockchainId,
            marketId: market.controllerAddress,
          }),
          testId: 'llama-market-go-to-vault',
        },
        { id: 'borrow', label: t`Borrow`, href: market.url, testId: 'llama-market-go-to-borrow' },
      ),
      ...extraPanels,
    ],
    [extraPanels, market.type, market.url, market.blockchainId, market.controllerAddress],
  )

  return <ExpandedPanelActions actions={actions} />
}
