import { useState } from 'react'
import type { LlamaMarketRow } from '@/llamalend/queries/market-list/llama-market-stats'
import { EvmDataTable } from '@evm-ui/shared/ui/DataTable/EvmDataTable'
import { MarketRateType } from '@evm-ui/types/market'
import CardHeader from '@mui/material/CardHeader'
import Stack from '@mui/material/Stack'
import { ExpandedState } from '@tanstack/react-table'
import { QueryProp } from '@ui/features/queries/util'
import { useCurveTable } from '@ui/features/tables/data-table.utils'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { useIsTablet } from '@ui/hooks/useBreakpoints'
import { t } from '@ui/lib/i18n'
import { BORROW_TABLE } from './columns/borrow.table'
import { SUPPLY_TABLE } from './columns/supply.table'
import { useMarketColumns } from './hooks/useMarketColumns'
import { MarketExpandedPanel } from './MarketExpandedPanel'
import { UserPositionExpandedPanelActions } from './UserPositionExpandedPanelActions'

const { Spacing } = SizesAndSpaces

const TABLE_CONFIG = {
  [MarketRateType.Borrow]: { title: t`Borrowing`, label: t`borrow`, marketTable: BORROW_TABLE },
  [MarketRateType.Supply]: { title: t`Supplying`, label: t`supply`, marketTable: SUPPLY_TABLE },
}

type UserPositionsTableProps = {
  tableQuery: QueryProp<LlamaMarketRow[]>
  marketRateType: MarketRateType
  onReload: () => Promise<unknown>
}

const pagination = { pageIndex: 0, pageSize: 50 }

export const UserPositionsMarketRateTable = ({ tableQuery, marketRateType, onReload }: UserPositionsTableProps) => {
  const { title, label, marketTable } = TABLE_CONFIG[marketRateType]
  const { columns, sorting, onSortingChange, columnVisibility } = useMarketColumns(marketTable)
  const [expanded, setExpanded] = useState<ExpandedState>({})

  const table = useCurveTable({
    columns,
    query: tableQuery,
    meta: { getRowHref: ({ url }) => url },
    state: { expanded, sorting, columnVisibility },
    initialState: { pagination },
    onSortingChange,
    onExpandedChange: setExpanded,
  })
  const rowCount = table.getRowModel().rows.length

  return (
    <EvmDataTable
      category="limited"
      table={table}
      viewAllLabel={t`View all ${rowCount} ${label} positions`}
      errorState={{ title: t`Could not load ${label} positions`, onReload }}
      expandedPanel={{ Body: MarketExpandedPanel, Actions: UserPositionExpandedPanelActions }}
      shouldStickFirstColumn={Boolean(useIsTablet() && rowCount)}
    >
      <Stack sx={{ backgroundColor: t => t.design.Layer[1].Fill, justifyContent: 'end', paddingInline: Spacing.md }}>
        <CardHeader title={title} variant="inline" />
      </Stack>
    </EvmDataTable>
  )
}
