import { useState } from 'react'
import { PositionsEmptyState } from '@/llamalend/constants'
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
import { UserPositionsEmptyState } from './UserPositionsEmptyState'

const { Spacing, Sizing } = SizesAndSpaces

const TABLE_CONFIG = {
  [MarketRateType.Borrow]: {
    label: t`Borrowing`,
    defaultSort: DEFAULT_SORT_BORROW,
    sortQueryField: 'userSortBorrow',
    storageKey: 'My Borrow Positions',
  },
  [MarketRateType.Supply]: {
    label: t`Supplying`,
    defaultSort: DEFAULT_SORT_SUPPLY,
    sortQueryField: 'userSortSupply',
    storageKey: 'My Supply Positions',
  },
}

const getEmptyState = (isError: boolean): PositionsEmptyState =>
  isError ? PositionsEmptyState.Error : PositionsEmptyState.NoPositions

type UserPositionsTableProps = {
  tableQuery: QueryProp<LlamaMarket[]>
  marketRateType: MarketRateType
  onReload: () => void
}

const pagination = { pageIndex: 0, pageSize: 50 }
const DEFAULT_VISIBLE_ROWS = 3

export const UserPositionsMarketRateTable = ({
  tableQuery: { data = [], isLoading, error },
  marketRateType,
  onReload,
}: UserPositionsTableProps) => {
  const { label, defaultSort, sortQueryField, storageKey } = TABLE_CONFIG[marketRateType]
  const [sorting, onSortingChange] = useSortFromQueryString(defaultSort, sortQueryField)
  const { columnVisibility } = useLlamaTableVisibility(storageKey, sorting, marketRateType)
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
      defaultVisibleRows={{
        max: DEFAULT_VISIBLE_ROWS,
        buttonLabel: t`View all ${data.length} ${marketRateType.toLowerCase()} positions`,
      }}
      // with two user positions tables let's avoid having too many skeletons rows when loading
      increasingLengthOptions={{ initialLength: 1, maxLength: 3 }}
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
          height: Sizing.md,
          justifyContent: 'end',
          paddingInline: Spacing.md,
        }}
      >
        <CardHeader title={label} size="small" />
      </Stack>
    </DataTable>
  )
}
