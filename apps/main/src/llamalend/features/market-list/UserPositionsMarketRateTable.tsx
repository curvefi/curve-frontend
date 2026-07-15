import { useState } from 'react'
import CardHeader from '@mui/material/CardHeader'
import Stack from '@mui/material/Stack'
import { ExpandedState } from '@tanstack/react-table'
import { useIsTablet } from '@ui-kit/hooks/useBreakpoints'
import { useSortFromQueryString } from '@ui-kit/hooks/useSortFromQueryString'
import { t } from '@ui-kit/lib/i18n'
import { getTableOptions, useTable } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { DataTable } from '@ui-kit/shared/ui/DataTable/DataTable'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { MarketRateType } from '@ui-kit/types/market'
import { QueryProp } from '@ui-kit/types/util'
import type { LlamaMarket } from '../../queries/market-list/llama-markets'
import { DEFAULT_SORT_BORROW, DEFAULT_SORT_SUPPLY, LLAMA_MARKET_COLUMNS } from './columns'
import { useLlamaTableVisibility } from './hooks/useLlamaTableVisibility'
import { LlamaMarketExpandedPanel } from './LlamaMarketExpandedPanel'
import { UserPositionExpandedPanelActions } from './UserPositionExpandedPanelActions'

const { Spacing, Sizing } = SizesAndSpaces

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
  tableQuery: QueryProp<LlamaMarket[]>
  marketRateType: MarketRateType
  onReload: () => void
}

const pagination = { pageIndex: 0, pageSize: 50 }

export const UserPositionsMarketRateTable = ({ tableQuery, marketRateType, onReload }: UserPositionsTableProps) => {
  const { title, label, defaultSort, sortQueryField, storageKey } = TABLE_CONFIG[marketRateType]
  const [sorting, onSortingChange] = useSortFromQueryString(defaultSort, sortQueryField)
  const { columnVisibility } = useLlamaTableVisibility(storageKey, sorting, marketRateType)
  const [expanded, setExpanded] = useState<ExpandedState>({})

  const table = useTable({
    columns: LLAMA_MARKET_COLUMNS,
    query: tableQuery,
    state: { expanded, sorting, columnVisibility },
    initialState: { pagination },
    onSortingChange,
    onExpandedChange: setExpanded,
    ...getTableOptions(tableQuery.data),
  })
  const rowCount = table.getRowModel().rows.length

  return (
    <DataTable
      category="limited"
      table={table}
      viewAllLabel={t`View all ${rowCount} ${label} positions`}
      errorState={{ title: t`Could not load ${label} positions`, onReload }}
      expandedPanel={{ Body: LlamaMarketExpandedPanel, Actions: UserPositionExpandedPanelActions }}
      shouldStickFirstColumn={Boolean(useIsTablet() && rowCount)}
    >
      <Stack
        sx={{
          backgroundColor: t => t.design.Layer[1].Fill,
          height: Sizing.md,
          justifyContent: 'end',
          paddingInline: Spacing.md,
        }}
      >
        <CardHeader title={title} size="small" />
      </Stack>
    </DataTable>
  )
}
