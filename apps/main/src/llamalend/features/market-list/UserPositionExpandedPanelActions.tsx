import { useMemo } from 'react'
import type { LlamaMarket } from '@/llamalend/queries/market-list/llama-markets'
import { t } from '@ui-kit/lib/i18n'
import { ExpandedPanelActions } from '@ui-kit/shared/ui/DataTable/ExpandedPanelActions'
import type { ExpandedPanelComponent } from '@ui-kit/shared/ui/DataTable/ExpansionRow'
import { useLlamaMarketExpandedPanelActions } from './hooks/useLlamaMarketExpandedPanelActions'

export const UserPositionExpandedPanelActions: ExpandedPanelComponent<LlamaMarket> = ({
  row: { original: market },
}) => {
  const extraPanels = useLlamaMarketExpandedPanelActions(market)

  const actions = useMemo(
    () => [
      {
        id: 'manage-position',
        label: t`Manage position`,
        href: market.url, // the url is already built for borrow/supply in the UserPositionsMarketRateTable
        testId: 'llama-market-go-to-position',
      },
      ...extraPanels,
    ],
    [extraPanels, market.url],
  )

  return <ExpandedPanelActions actions={actions} />
}
