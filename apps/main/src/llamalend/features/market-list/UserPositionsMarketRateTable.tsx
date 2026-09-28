import { useState } from 'react'
import type { LlamaMarketRow } from '@/llamalend/queries/market-list/llama-market-stats'
import { useNewLlamalendHealth } from '@evm-ui/hooks/useFeatureFlags'
import { useSortFromQueryString } from '@evm-ui/hooks/useSortFromQueryString'
import { EvmDataTable } from '@evm-ui/shared/ui/DataTable/EvmDataTable'
import { MarketRateType } from '@evm-ui/types/market'
import Box from '@mui/material/Box'
import CardHeader from '@mui/material/CardHeader'
import Stack from '@mui/material/Stack'
import { ExpandedState } from '@tanstack/react-table'
import { QueryProp } from '@ui/features/queries/util'
import { useCurveTable } from '@ui/features/tables/data-table.utils'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { useIsTablet } from '@ui/hooks/useBreakpoints'
import { t } from '@ui/lib/i18n'
import { DEFAULT_SORT_BORROW, DEFAULT_SORT_SUPPLY } from './columns'
import { useMarketsVisibility } from './hooks/useMarketsVisibility'
import { MarketExpandedPanel } from './MarketExpandedPanel'
import { UserPositionExpandedPanelActions } from './UserPositionExpandedPanelActions'

const { Spacing } = SizesAndSpaces

const TABLE_CONFIG = {
  [MarketRateType.Borrow]: {
    title: t`Borrowing`,
    label: t`borrow`,
    defaultSort: DEFAULT_SORT_BORROW,
    sortQueryField: 'userSortBorrow',
    storageKey: 'My Borrow Positions',
  },
  [MarketRateType.Supply]: {
    title: t`Supplying`,
    label: t`supply`,
    defaultSort: DEFAULT_SORT_SUPPLY,
    sortQueryField: 'userSortSupply',
    storageKey: 'My Supply Positions',
  },
}

type UserPositionsTableProps = {
  tableQuery: QueryProp<LlamaMarketRow[]>
  marketRateType: MarketRateType
  onReload: () => Promise<unknown>
}

const pagination = { pageIndex: 0, pageSize: 50 }

export const UserPositionsMarketRateTable = ({ tableQuery, marketRateType, onReload }: UserPositionsTableProps) => {
  const beta = useNewLlamalendHealth()
  const { title, label, defaultSort, sortQueryField, storageKey } = TABLE_CONFIG[marketRateType]
  const [sorting, onSortingChange] = useSortFromQueryString(defaultSort, sortQueryField)
  const { columnVisibility, columns, tableSorting } = useMarketsVisibility(storageKey, sorting, marketRateType)
  const [expanded, setExpanded] = useState<ExpandedState>({})

  const table = useCurveTable({
    columns,
    query: tableQuery,
    meta: { getRowHref: ({ url }) => url, showNetBorrowApr: beta && marketRateType === MarketRateType.Borrow },
    state: { expanded, sorting: tableSorting, columnVisibility },
    initialState: { pagination },
    onSortingChange,
    onExpandedChange: setExpanded,
  })
  const rowCount = table.getRowModel().rows.length

  return (
    <Box data-testid={marketRateType === MarketRateType.Borrow ? 'borrow-positions-table' : undefined}>
      <EvmDataTable
        category="limited"
        table={table}
        viewAllLabel={t`View all ${rowCount} ${label} positions`}
        errorState={{ title: t`Could not load ${label} positions`, onReload }}
        expandedPanel={{ Body: MarketExpandedPanel, Actions: UserPositionExpandedPanelActions }}
        shouldStickFirstColumn={Boolean(useIsTablet() && rowCount)}
      >
        <Stack
          data-testid={marketRateType === MarketRateType.Borrow ? 'borrow-positions-header' : undefined}
          sx={{ backgroundColor: t => t.design.Layer[1].Fill, justifyContent: 'end', paddingInline: Spacing.md }}
        >
          <CardHeader title={title} variant="inline" />
        </Stack>
      </EvmDataTable>
    </Box>
  )
}
