import { useMemo, useRef, useState } from 'react'
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
import { TableButton } from '@ui/features/tables/TableButton'
import { TableVisibilitySettingsPopover } from '@ui/features/tables/TableVisibilitySettingsPopover'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { useIsMobile, useIsTablet } from '@ui/hooks/useBreakpoints'
import { useSwitch } from '@ui/hooks/useSwitch'
import { GearIcon } from '@ui/icons/GearIcon'
import { t } from '@ui/lib/i18n'
import { DEFAULT_SORT_BORROW, DEFAULT_SORT_SUPPLY, MarketColumnId } from './columns'
import { useMarketsVisibility } from './hooks/useMarketsVisibility'
import { MarketExpandedPanel } from './MarketExpandedPanel'
import { isUserPositionInRange } from './user-position.utils'
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
  const isMobile = useIsMobile()
  const { title, label, defaultSort, sortQueryField, storageKey } = TABLE_CONFIG[marketRateType]
  const [sorting, onSortingChange] = useSortFromQueryString(defaultSort, sortQueryField)
  const { columnSettings, columnVisibility, columns, tableSorting, toggleVisibility } = useMarketsVisibility(
    storageKey,
    sorting,
    marketRateType,
  )
  const [expanded, setExpanded] = useState<ExpandedState>({})
  const [visibilitySettingsOpen, openVisibilitySettings, closeVisibilitySettings] = useSwitch(false)
  const visibilitySettingsRef = useRef<HTMLButtonElement>(null)

  const showBuffer = useMemo(
    () =>
      beta &&
      marketRateType === MarketRateType.Borrow &&
      !columnVisibility[MarketColumnId.UserDistanceToRange] &&
      (tableQuery.data ?? []).some(isUserPositionInRange),
    [beta, columnVisibility, marketRateType, tableQuery.data],
  )
  const resolvedVisibility = useMemo(
    () =>
      !isMobile && beta && marketRateType === MarketRateType.Borrow
        ? { ...columnVisibility, [MarketColumnId.UserLiquidationBuffer]: showBuffer }
        : columnVisibility,
    [beta, columnVisibility, isMobile, marketRateType, showBuffer],
  )

  const table = useCurveTable({
    columns,
    query: tableQuery,
    meta: {
      getRowHref: ({ url }) => url,
      showNetBorrowApr: beta && marketRateType === MarketRateType.Borrow,
      showNetSupplyApy: beta && marketRateType === MarketRateType.Supply,
    },
    state: { expanded, sorting: tableSorting, columnVisibility: resolvedVisibility },
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
          direction="row"
          data-testid={marketRateType === MarketRateType.Borrow ? 'borrow-positions-header' : undefined}
          sx={{
            alignItems: 'center',
            backgroundColor: t => t.design.Layer[1].Fill,
            justifyContent: 'space-between',
            paddingInline: Spacing.md,
          }}
        >
          <CardHeader title={title} variant="inline" sx={{ flex: 1 }} />
          {!isMobile && (
            <TableButton
              ref={visibilitySettingsRef}
              onClick={openVisibilitySettings}
              icon={GearIcon}
              testId="btn-visibility-settings"
              active={visibilitySettingsOpen}
            />
          )}
        </Stack>
      </EvmDataTable>
      <TableVisibilitySettingsPopover<MarketColumnId>
        anchorRef={visibilitySettingsRef}
        visibilityGroups={columnSettings}
        toggleVisibility={toggleVisibility}
        open={visibilitySettingsOpen}
        onClose={closeVisibilitySettings}
      />
    </Box>
  )
}
