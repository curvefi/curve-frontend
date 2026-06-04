import { type ReactNode, useMemo } from 'react'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import TableCell from '@mui/material/TableCell'
import Typography from '@mui/material/Typography'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { createColumnHelper } from '@tanstack/react-table'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { formatNumber } from '@ui-kit/utils'
import { EmptyStateCard } from '../EmptyStateCard'
import { type ColumnDefinition, getTableOptions, type TableItem, useTable } from './data-table.utils'
import { DataTable } from './DataTable'
import { EmptyStateRow } from './EmptyStateRow'

const { Spacing } = SizesAndSpaces

const formatTokenAmount = (value: number, symbol: string) => `${formatNumber(value, { abbreviate: false })} ${symbol}`
const formatPercentage = (value: number) => formatNumber(value, 'percent.value')
const formatUsdNotional = (value: number) => formatNumber(value, 'usd.notional')

type MarketRow = TableItem & {
  id: number
  collateral: string
  debt: string
  market: string
  userDebt: number
  userCollateral: number
  borrowApr: number
  lendApy: number
  maxLtv: number
  utilization: number
  liquidity: number
  totalDebt: number
  extraMetrics: number[]
}

type DataTableProps = Parameters<typeof DataTable<MarketRow>>[0]

type DemoDataTableProps = Omit<DataTableProps, 'table' | 'emptyState' | 'children' | 'footerRow' | 'expandedPanel'> & {
  rowCount?: number
  extraColumnCount?: number
  isError?: boolean
  wrapperWidth?: string
  showFooterRow?: boolean
  showFilterRow?: boolean
  emptyTitle?: string
  emptySubtitle?: string
}

const columnHelper = createColumnHelper<MarketRow>()

const generateMarketRows = (count: number | undefined): MarketRow[] =>
  Array.from({ length: count ?? 0 }, (_, index) => {
    const id = index + 1
    return {
      id,
      collateral: 'WETH',
      debt: 'crvUSD',
      market: `Market ${index + 1}`,
      userDebt: 10_000 + id * 100,
      userCollateral: 5 + id / 10,
      borrowApr: 8 + id / 100,
      lendApy: 5 + id / 100,
      maxLtv: 75,
      utilization: 68 + id / 10,
      liquidity: 2_000_000 + id * 25_000,
      totalDebt: 12_000_000 + id * 50_000,
      extraMetrics: Array.from({ length: 12 }, (_, metricIndex) => 100_000 + id * 1_000 + metricIndex * 10_000),
    }
  })

const createMarketColumns = (extraColumnCount = 0): ColumnDefinition<MarketRow>[] => [
  columnHelper.accessor('market', {
    header: 'Market',
    cell: ({ row }) => (
      <Stack sx={{ gap: 0.25 }}>
        <Typography component="span" variant="tableCellMBold">
          {row.original.market}
        </Typography>
      </Stack>
    ),
  }),
  columnHelper.accessor('userDebt', {
    header: 'Borrow Amount',
    cell: ({ row }) => formatTokenAmount(row.original.userDebt, 'crvUSD'),
    meta: { type: 'numeric' },
  }),
  columnHelper.accessor('userCollateral', {
    header: 'Collateral Amount',
    cell: ({ row }) => formatTokenAmount(row.original.userCollateral, 'WETH'),
    meta: { type: 'numeric' },
  }),
  columnHelper.accessor('borrowApr', {
    header: 'Borrow APR',
    cell: ({ row }) => formatPercentage(row.original.borrowApr),
    meta: { type: 'numeric' },
  }),
  columnHelper.accessor('lendApy', {
    header: 'Supply APY',
    cell: ({ row }) => formatPercentage(row.original.lendApy),
    meta: { type: 'numeric' },
  }),
  columnHelper.accessor('maxLtv', {
    header: 'Max LTV',
    cell: ({ row }) => formatPercentage(row.original.maxLtv),
    meta: { type: 'numeric' },
  }),
  columnHelper.accessor('utilization', {
    header: 'Utilization',
    cell: ({ row }) => formatPercentage(row.original.utilization),
    meta: { type: 'numeric' },
  }),
  columnHelper.accessor('liquidity', {
    header: 'Available Liquidity',
    cell: ({ row }) => formatUsdNotional(row.original.liquidity),
    meta: { type: 'numeric' },
  }),
  columnHelper.accessor('totalDebt', {
    header: 'Total Debt',
    cell: ({ row }) => formatUsdNotional(row.original.totalDebt),
    meta: { type: 'numeric' },
  }),
  ...Array.from({ length: extraColumnCount }, (_, index) =>
    columnHelper.accessor(row => row.extraMetrics[index], {
      id: `extraMetric${index + 1}`,
      header: `Metric ${index + 1}`,
      cell: ({ row }) => formatUsdNotional(row.original.extraMetrics[index]),
      meta: { type: 'numeric' },
    }),
  ),
]

const ScrollableStoryWrapper = ({ children, width = '100%' }: { children: ReactNode; width?: string }) => (
  <Box sx={{ width, maxWidth: '100%', border: t => `1px solid ${t.design.Layer[2].Outline}` }}>{children}</Box>
)

const pagination = { pageIndex: 0, pageSize: 20 }

const DemoDataTable = ({
  rowCount,
  extraColumnCount,
  isLoading,
  isError,
  disableStickyHeader,
  shouldStickFirstColumn,
  hideHeader,
  size,
  verticalAlign,
  maxHeight,
  defaultVisibleRows,
  wrapperWidth,
  showFooterRow,
  showFilterRow,
  emptyTitle,
  emptySubtitle,
}: DemoDataTableProps) => {
  const generatedRows = useMemo(() => generateMarketRows(rowCount), [rowCount])
  const data = isLoading || isError ? [] : generatedRows
  const columns = useMemo(() => createMarketColumns(extraColumnCount), [extraColumnCount])
  const table = useTable({
    data,
    columns,
    initialState: { pagination },
    ...getTableOptions(data),
  })
  const columnCount = table.getHeaderGroups().reduce((count, { headers }) => count + headers.length, 0)

  const tableElement = (
    <DataTable
      table={table}
      emptyState={
        <EmptyStateRow table={table}>
          <EmptyStateCard
            title={isError ? 'Could not load markets' : emptyTitle || 'No markets found'}
            subtitle={isError ? 'Refresh and try again.' : emptySubtitle || 'Try adjusting the table filters.'}
          />
        </EmptyStateRow>
      }
      isLoading={!!isLoading}
      disableStickyHeader={disableStickyHeader}
      shouldStickFirstColumn={shouldStickFirstColumn}
      hideHeader={hideHeader}
      size={size}
      verticalAlign={verticalAlign}
      maxHeight={maxHeight}
      defaultVisibleRows={defaultVisibleRows}
      footerRow={
        showFooterRow && (
          <TableCell colSpan={columnCount} sx={{ textAlign: 'center' }}>
            This is a footer row
          </TableCell>
        )
      }
    >
      {showFilterRow && (
        <Stack direction="row" sx={{ padding: Spacing.sm, backgroundColor: t => t.design.Layer[1].Fill }}>
          <Typography>This is a filter row</Typography>
        </Stack>
      )}
    </DataTable>
  )

  return wrapperWidth ? (
    <ScrollableStoryWrapper width={wrapperWidth}>{tableElement}</ScrollableStoryWrapper>
  ) : (
    tableElement
  )
}

const meta: Meta<typeof DemoDataTable> = {
  title: 'UI Kit/DataTable/DataTable',
  component: DemoDataTable,
  args: {
    rowCount: 30,
    extraColumnCount: 0,
    isLoading: false,
    isError: false,
    disableStickyHeader: false,
    shouldStickFirstColumn: false,
    hideHeader: false,
    size: 'small',
    verticalAlign: 'middle',
    defaultVisibleRows: undefined,
    maxHeight: undefined,
    wrapperWidth: undefined,
    showFooterRow: false,
    showFilterRow: false,
    emptyTitle: 'No markets found',
    emptySubtitle: 'Try adjusting the table filters.',
  },
  argTypes: {
    rowCount: {
      control: { type: 'number', min: 0, max: 80, step: 1 },
      description: 'Number of generated market rows.',
    },
    extraColumnCount: {
      control: { type: 'number', min: 0, max: 12, step: 1 },
      description: 'Additional generated metric columns used to force horizontal overflow.',
    },
    isLoading: {
      control: 'boolean',
      description: 'Shows skeleton rows instead of data.',
    },
    isError: {
      control: 'boolean',
      description: 'Shows the error empty state.',
    },
    disableStickyHeader: {
      control: 'boolean',
      description: 'Disables sticky table header behavior.',
    },
    shouldStickFirstColumn: {
      control: 'boolean',
      description: 'Makes the first visible column sticky.',
    },
    hideHeader: {
      control: 'boolean',
      description: 'Hides the table header rows.',
    },
    size: {
      control: 'select',
      options: ['extraSmall', 'small', 'medium', 'large'],
      description: 'DataTable header size.',
    },
    verticalAlign: {
      control: 'radio',
      options: ['top', 'middle', 'bottom'],
      description: 'Vertical alignment passed to body rows.',
    },
    maxHeight: {
      control: 'text',
      description: 'Optional max-height for the vertical scrolling wrapper, for example 24rem.',
    },
    defaultVisibleRows: {
      control: 'object',
      description: 'Limits initially visible rows and shows the view-all row when set.',
    },
    wrapperWidth: {
      control: 'text',
      description: 'Optional outer wrapper width, for example 44rem, used to test horizontal overflow.',
    },
    showFooterRow: {
      control: 'boolean',
      description: 'Adds a generated footer row.',
    },
    showFilterRow: {
      control: 'boolean',
      description: 'Adds sample children content to render in the table filter row.',
    },
    emptyTitle: {
      control: 'text',
      description: 'Title for the non-error empty state.',
    },
    emptySubtitle: {
      control: 'text',
      description: 'Subtitle for the non-error empty state.',
    },
  },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'DataTable with sticky headers, limited rows, loading, empty, error, sticky columns, and horizontal overflow that can be checked independently.',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof DemoDataTable>

export const Default: Story = {
  args: {},
}

export const LimitedRows: Story = {
  args: {
    rowCount: 40,
    defaultVisibleRows: { max: 5, buttonLabel: 'View all markets' },
  },
}

export const Empty: Story = {
  args: {
    rowCount: 0,
    emptyTitle: 'No markets found',
    emptySubtitle: 'Generated market rows are intentionally empty in this story.',
  },
}

export const Loading: Story = {
  args: {
    isLoading: true,
  },
}

export const Error: Story = {
  args: {
    isError: true,
  },
}

export const StickyHeader: Story = {
  args: {
    rowCount: 40,
    maxHeight: '24rem',
  },
}

export const HeaderNotSticky: Story = {
  args: {
    rowCount: 40,
    disableStickyHeader: true,
    maxHeight: '24rem',
  },
}

export const HiddenHeader: Story = {
  args: {
    hideHeader: true,
  },
}

export const StickyFirstColumn: Story = {
  args: {
    rowCount: 18,
    extraColumnCount: 8,
    shouldStickFirstColumn: true,
    wrapperWidth: '44rem',
  },
}

export const HorizontalOverflow: Story = {
  args: {
    rowCount: 18,
    extraColumnCount: 10,
    wrapperWidth: '44rem',
  },
}

export const WithFilterRow: Story = {
  args: {
    showFilterRow: true,
    maxHeight: '24rem',
  },
}

export const WithFooterRow: Story = {
  args: {
    showFooterRow: true,
  },
}
