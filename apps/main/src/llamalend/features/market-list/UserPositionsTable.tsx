import { useCallback, useState } from 'react'
import { PositionsEmptyState } from '@/llamalend/constants'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { notFalsyArray } from '@primitives/objects.utils'
import { ExpandedState } from '@tanstack/react-table'
import { useIsTablet } from '@ui-kit/hooks/useBreakpoints'
import { useSortFromQueryString } from '@ui-kit/hooks/useSortFromQueryString'
import { t } from '@ui-kit/lib/i18n'
import { getInternalUrl, LEND_MARKET_ROUTES, LEND_ROUTES } from '@ui-kit/shared/routes'
import { getTableOptions, useTable } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { DataTable } from '@ui-kit/shared/ui/DataTable/DataTable'
import { TableHeader } from '@ui-kit/shared/ui/DataTable/TableHeader'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { MarketRateType } from '@ui-kit/types/market'
import { QueryProp, useMappedQuery } from '@ui-kit/types/util'
import type { LlamaMarket, LlamaMarketsResult } from '../../queries/market-list/llama-markets'
import { DEFAULT_SORT_BORROW, DEFAULT_SORT_SUPPLY, LLAMA_MARKET_COLUMNS } from './columns'
import { useLlamaTableVisibility } from './hooks/useLlamaTableVisibility'
import { LlamaMarketExpandedPanel } from './LlamaMarketExpandedPanel'
import { UserPositionsEmptyState } from './UserPositionsEmptyState'
import { UserPositionSummary } from './UserPositionsSummary'

const { Spacing, Sizing } = SizesAndSpaces

const LOCAL_STORAGE_KEYS = {
  // not using the t`` here as the value is used as a key in the local storage
  [MarketRateType.Borrow]: 'My Borrow Positions',
  [MarketRateType.Supply]: 'My Supply Positions',
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

const buildVaultUrl = (market: LlamaMarket) =>
  getInternalUrl(
    'lend',
    market.chain,
    `${LEND_ROUTES.PAGE_MARKETS}/${market.controllerAddress}${LEND_MARKET_ROUTES.PAGE_VAULT}`,
  )

type UserPositionsTableProps = {
  onReload: () => void
  tableQuery: QueryProp<LlamaMarketsResult>
}

const pagination = { pageIndex: 0, pageSize: 50 }
// const DEFAULT_VISIBLE_ROWS = 3

export const UserPositionsTable = ({
  onReload,
  tableQuery,
  tableQuery: { data: queryData, isLoading, error },
}: UserPositionsTableProps) => {
  const { markets = [], userHasPositions } = queryData ?? {}
  const tab: MarketRateType = MarketRateType.Supply

  const userQuery = useMappedQuery(
    tableQuery,
    useCallback(
      ({ markets }) =>
        markets
          .filter(market => market.userHasPositions?.[tab])
          .map(
            (
              market, // For supply positions, navigate to vault page instead of borrow page
            ) => (tab === MarketRateType.Supply ? { ...market, url: buildVaultUrl(market) } : market),
          ),
      [tab],
    ),
  )

  const userData = notFalsyArray(userQuery.data)

  const title = LOCAL_STORAGE_KEYS[tab]

  const [sorting, onSortingChange] = useSortFromQueryString(DEFAULT_SORT[tab], SORT_QUERY_FIELD[tab])
  const { columnVisibility } = useLlamaTableVisibility(title, sorting, tab)
  const [expanded, onExpandedChange] = useState<ExpandedState>({})

  const table = useTable({
    columns: LLAMA_MARKET_COLUMNS,
    data: userData,
    state: { expanded, sorting, columnVisibility },
    initialState: { pagination },
    onSortingChange,
    onExpandedChange,
    ...getTableOptions(queryData),
  })
  return (
    <DataTable
      table={table}
      // rowLimit={DEFAULT_VISIBLE_ROWS}
      // viewAllLabel="View all positions"
      emptyState={
        <UserPositionsEmptyState state={getEmptyState(!!error)} table={table} tab={tab} onReload={onReload} />
      }
      expandedPanel={LlamaMarketExpandedPanel}
      shouldStickFirstColumn={Boolean(useIsTablet() && userHasPositions)}
      isLoading={isLoading}
    >
      <Stack>
        <TableHeader title={t`Your Positions`} onReload={onReload} isLoading={isLoading} />
        <UserPositionSummary markets={markets} tab={tab} selectedChains={undefined} />
        <Stack
          sx={{
            backgroundColor: t => t.design.Layer[1].Fill,
            paddingBlockEnd: Spacing.xs,
            height: Sizing.md,
            justifyContent: 'end',
          }}
        >
          <Typography variant="headingXsBold" color="textSecondary">
            {tab}
          </Typography>
        </Stack>
      </Stack>
    </DataTable>
  )
}
