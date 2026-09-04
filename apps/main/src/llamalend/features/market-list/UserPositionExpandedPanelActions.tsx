import { useMemo } from 'react'
import type { LlamaMarketRow } from '@/llamalend/queries/market-list/llama-market-stats'
import { ExpandedPanelActions } from '@evm-ui/shared/ui/DataTable/ExpandedPanelActions'
import type { ExpandedPanelComponent } from '@evm-ui/shared/ui/DataTable/ExpansionRow'
import { t } from '@ui/lib/i18n'
import { useMarketExpandedPanelActions } from './hooks/useMarketExpandedPanelActions'

export const UserPositionExpandedPanelActions: ExpandedPanelComponent<LlamaMarketRow> = ({
  row: { original: market },
}) => {
  const extraPanels = useMarketExpandedPanelActions(market)

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
