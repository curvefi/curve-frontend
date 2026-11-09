import { useRef, useState } from 'react'
import type { LlamaMarketRow } from '@/llamalend/queries/market-list/llama-market-stats'
import { useLlamalendPositionTables } from '@evm-ui/hooks/useFeatureFlags'
import { EvmDataTable } from '@evm-ui/shared/ui/DataTable/EvmDataTable'
import { MarketRateType } from '@evm-ui/types/market'
import CardHeader from '@mui/material/CardHeader'
import Stack from '@mui/material/Stack'
import { ExpandedState } from '@tanstack/react-table'
import { QueryProp } from '@ui/features/queries/util'
import { useCurveTable } from '@ui/features/tables/data-table.utils'
import { TableVisibilitySettingsButton } from '@ui/features/tables/TableVisibilitySettingsButton'
import { TableVisibilitySettingsPopover } from '@ui/features/tables/TableVisibilitySettingsPopover'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { useIsMobile, useIsTablet } from '@ui/hooks/useBreakpoints'
import { useSwitch } from '@ui/hooks/useSwitch'
import { t } from '@ui/lib/i18n'
import { BORROW_TABLE, LEGACY_BORROW_TABLE } from './columns/borrow.table'
import { LEGACY_SUPPLY_TABLE, SUPPLY_TABLE } from './columns/supply.table'
import { MarketSortDrawer } from './drawers/MarketSortDrawer'
import { useMarketColumns } from './hooks/useMarketColumns'
import { MarketExpandedPanel } from './MarketExpandedPanel'
import { UserPositionExpandedPanelActions } from './UserPositionExpandedPanelActions'

const { Spacing } = SizesAndSpaces

const TABLE_CONFIG = {
  [MarketRateType.Borrow]: {
    title: t`Borrowing`,
    label: t`borrow`,
    table: BORROW_TABLE,
    legacyTable: LEGACY_BORROW_TABLE,
  },
  [MarketRateType.Supply]: {
    title: t`Supplying`,
    label: t`supply`,
    table: SUPPLY_TABLE,
    legacyTable: LEGACY_SUPPLY_TABLE,
  },
}

type UserPositionsTableProps = {
  tableQuery: QueryProp<LlamaMarketRow[]>
  marketRateType: MarketRateType
  onReload: () => Promise<unknown>
}

const pagination = { pageIndex: 0, pageSize: 50 }

export const UserPositionsMarketRateTable = ({ tableQuery, marketRateType, onReload }: UserPositionsTableProps) => {
  const { title, label, table: positionTable, legacyTable } = TABLE_CONFIG[marketRateType]
  const marketTable = useLlamalendPositionTables() ? positionTable : legacyTable
  const { columns, sorting, onSortingChange, sortField, columnVisibility, columnSettings, toggleVisibility } =
    useMarketColumns(marketTable)
  const [expanded, setExpanded] = useState<ExpandedState>({})
  const [visibilitySettingsOpen, openVisibilitySettings, closeVisibilitySettings] = useSwitch(false)
  const headerRef = useRef<HTMLDivElement>(null)
  const isMobile = useIsMobile()

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
    <>
      <EvmDataTable
        category="limited"
        table={table}
        viewAllLabel={t`View all ${rowCount} ${label} positions`}
        errorState={{ title: t`Could not load ${label} positions`, onReload }}
        expandedPanel={{ Body: MarketExpandedPanel, Actions: UserPositionExpandedPanelActions }}
        shouldStickFirstColumn={Boolean(useIsTablet() && rowCount)}
      >
        <Stack
          ref={headerRef}
          direction="row"
          sx={{
            backgroundColor: t => t.design.Layer[1].Fill,
            justifyContent: 'space-between',
            alignItems: 'end',
            paddingInline: Spacing.md,
          }}
        >
          <CardHeader title={title} variant="inline" />
          {isMobile ? (
            <MarketSortDrawer
              testId={marketTable.testId}
              columns={columns}
              onSortingChange={onSortingChange}
              sortField={sortField}
            />
          ) : (
            <TableVisibilitySettingsButton
              isOpen={visibilitySettingsOpen}
              open={openVisibilitySettings}
              testId={`btn-visibility-settings-${marketTable.testId}`}
            />
          )}
        </Stack>
      </EvmDataTable>
      <TableVisibilitySettingsPopover
        anchorRef={headerRef}
        visibilityGroups={columnSettings}
        toggleVisibility={toggleVisibility}
        open={visibilitySettingsOpen}
        onClose={closeVisibilitySettings}
      />
    </>
  )
}
