import { type ReactNode, useMemo } from 'react'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import TableCell from '@mui/material/TableCell'
import Typography from '@mui/material/Typography'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { createColumnHelper } from '@tanstack/react-table'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { q } from '@ui-kit/types/util'
import { formatNumber } from '@ui-kit/utils'
import { type ColumnDefinition, getTableOptions, type TableItem, useTable } from './data-table.utils'
import { DataTable, DataTableProps } from './DataTable'

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

type DemoDataTableProps = Omit<
  DataTableProps<MarketRow>,
  'table' | 'emptyState' | 'children' | 'footerRow' | 'expandedPanel'
> & {
  rowCount?: number
  extraColumnCount?: number
  isLoading?: boolean
  isError?: boolean
  wrapperWidth?: string
  showFooterRow?: boolean
  showFilterRow?: boolean
  emptyTitle?: string
  emptyMessage?: string
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
  category,
  rowCount,
  extraColumnCount,
  isLoading,
  isError,
  shouldStickFirstColumn,
  verticalAlign,
  viewAllLabel,
  wrapperWidth,
  showFooterRow,
  showFilterRow,
  emptyTitle,
  emptyMessage,
}: DemoDataTableProps) => {
  const generatedRows = useMemo(() => generateMarketRows(rowCount), [rowCount])
  const data = isLoading || isError ? [] : generatedRows
  const columns = useMemo(() => createMarketColumns(extraColumnCount), [extraColumnCount])
  const table = useTable({
    query: q({
      data,
      isLoading: !!isLoading,
      error: isError ? new globalThis.Error('Network request failed while loading data') : null,
    }),
    columns,
    initialState: { pagination },
    ...getTableOptions(data),
  })
  const columnCount = table.getHeaderGroups().reduce((count, { headers }) => count + headers.length, 0)

  const tableElement = (
    <DataTable
      category={category}
      table={table}
      emptyState={{ title: emptyTitle, description: emptyMessage }}
      shouldStickFirstColumn={shouldStickFirstColumn}
      verticalAlign={verticalAlign}
      viewAllLabel={viewAllLabel}
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
    category: 'list',
    shouldStickFirstColumn: false,
    verticalAlign: 'middle',
    viewAllLabel: undefined,
    wrapperWidth: undefined,
    showFooterRow: false,
    showFilterRow: false,
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
    shouldStickFirstColumn: {
      control: 'boolean',
      description: 'Makes the first visible column sticky.',
    },
    category: {
      control: 'select',
      options: ['list', 'limitedList', 'scrollableList', 'detail', 'summary'],
      description: 'Preset table behavior and sizing category.',
    },
    verticalAlign: {
      control: 'radio',
      options: ['top', 'middle', 'bottom'],
      description: 'Vertical alignment passed to body rows.',
    },
    viewAllLabel: {
      control: 'text',
      description: 'Optional label for the limited-list view-all row.',
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
    emptyMessage: {
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
    category: 'limited',
    viewAllLabel: 'View all markets',
  },
}

export const Loading: Story = {
  args: {
    isLoading: true,
  },
}

export const Empty: Story = {
  args: {
    rowCount: 0,
    emptyTitle: 'No results found',
    emptyMessage: 'Generated market rows are intentionally empty in this story.',
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
    category: 'scrollable',
  },
}

export const HeaderNotSticky: Story = {
  args: {
    rowCount: 40,
    category: 'detail',
  },
}

export const HiddenHeader: Story = {
  args: {
    category: 'form',
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
    category: 'scrollable',
  },
}

export const WithFooterRow: Story = {
  args: {
    showFooterRow: true,
  },
}
