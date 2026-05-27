import { useState } from 'react'
import { PositionsEmptyState } from '@/llamalend/constants'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
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
import { UserPositionsEmptyState } from './UserPositionsEmptyState'

const { Spacing, Sizing } = SizesAndSpaces

const LOCAL_STORAGE_KEYS = {
  // not using the t`` here as the value is used as a key in the local storage
  [MarketRateType.Borrow]: 'My Borrow Positions',
  [MarketRateType.Supply]: 'My Supply Positions',
}
const TABLE_LABEL = {
  [MarketRateType.Borrow]: t`Borrowing`,
  [MarketRateType.Supply]: t`Supplying`,
}

const DEFAULT_SORT = {
  [MarketRateType.Borrow]: DEFAULT_SORT_BORROW,
  [MarketRateType.Supply]: DEFAULT_SORT_SUPPLY,
}

const SORT_QUERY_FIELD = {
  [MarketRateType.Borrow]: 'userSortBorrow',
  [MarketRateType.Supply]: 'userSortSupply',
}

const getEmptyState = (isError: boolean): PositionsEmptyState =>
  isError ? PositionsEmptyState.Error : PositionsEmptyState.NoPositions

type UserPositionsTableProps = {
  tableQuery: QueryProp<LlamaMarket[]>
  marketRateType: MarketRateType
  onReload: () => void
}

const pagination = { pageIndex: 0, pageSize: 50 }
// const DEFAULT_VISIBLE_ROWS = 3

export const UserPositionsMarketRateTable = ({
  tableQuery: { data = [], isLoading, error },
  marketRateType,
  onReload,
}: UserPositionsTableProps) => {
  const [sorting, onSortingChange] = useSortFromQueryString(
    DEFAULT_SORT[marketRateType],
    SORT_QUERY_FIELD[marketRateType],
  )
  const { columnVisibility } = useLlamaTableVisibility(LOCAL_STORAGE_KEYS[marketRateType], sorting, marketRateType)
  const [expanded, onExpandedChange] = useState<ExpandedState>({})

  const table = useTable({
    columns: LLAMA_MARKET_COLUMNS,
    data,
    state: { expanded, sorting, columnVisibility },
    initialState: { pagination },
    onSortingChange,
    onExpandedChange,
    ...getTableOptions(data),
  })
  return (
    <DataTable
      table={table}
      // rowLimit={DEFAULT_VISIBLE_ROWS}
      // viewAllLabel="View all positions"
      emptyState={
        <UserPositionsEmptyState
          state={getEmptyState(!!error)}
          table={table}
          marketRateType={marketRateType}
          onReload={onReload}
        />
      }
      expandedPanel={LlamaMarketExpandedPanel}
      shouldStickFirstColumn={Boolean(useIsTablet() && data.length)}
      isLoading={isLoading}
    >
      <Stack
        sx={{
          backgroundColor: t => t.design.Layer[1].Fill,
          paddingBlockEnd: Spacing.xs,
          height: Sizing.md,
          justifyContent: 'end',
        }}
      >
        <Typography variant="headingXsBold" color="textSecondary">
          {TABLE_LABEL[marketRateType]}
        </Typography>
      </Stack>
    </DataTable>
  )
}
