import { type ReactNode, useMemo } from 'react'
import { ChainId } from '@/dex/types/main.types'
import type { Pool } from '@curvefi/prices-api/pools'
import { ActivityTable, PoolLiquidityExpandedPanel, PoolTradesExpandedPanel } from '@evm-ui/features/activity-table'
import { ChartWrapper } from '@evm-ui/features/candle-chart/ChartWrapper'
import { TIME_OPTIONS } from '@evm-ui/features/candle-chart/constants'
import { ChartHeader } from '@evm-ui/shared/ui/Chart/ChartHeader'
import { Tabs } from '@evm-ui/shared/ui/Tabs/Tabs'
import Stack from '@mui/material/Stack'
import type { Address } from '@primitives/address.utils'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { t } from '@ui/lib/i18n'
import { useOhlcChartState } from './hooks/useOhlcChartState'
import { usePoolActivityEventsConfig } from './hooks/usePoolActivityEventsConfig'
import { usePoolActivityTradesConfig } from './hooks/usePoolActivityTradesConfig'

const { Spacing } = SizesAndSpaces

type OhlcTabsParams = {
  chart: ReturnType<typeof useOhlcChartState>
  liquidityTable: ReturnType<typeof usePoolActivityEventsConfig>
  tradesTable: ReturnType<typeof usePoolActivityTradesConfig>
}

const EventsTab = ({ liquidityTable }: OhlcTabsParams) => (
  <ActivityTable
    table={liquidityTable.table}
    emptyState={liquidityTable.emptyState}
    errorState={liquidityTable.errorState}
    expandedPanel={{ Body: PoolLiquidityExpandedPanel }}
  />
)

const TradesTab = ({ tradesTable }: OhlcTabsParams) => (
  <ActivityTable
    table={tradesTable.table}
    emptyState={tradesTable.emptyState}
    errorState={tradesTable.errorState}
    expandedPanel={{ Body: PoolTradesExpandedPanel }}
  />
)

const ChartTab = ({
  chart: { isLoading, setSelectedChart, setTimeOption, ohlcChartProps, flipChart },
}: OhlcTabsParams) => (
  <Stack sx={{ gap: Spacing.md, padding: Spacing.sm }}>
    <ChartHeader
      flipChart={flipChart}
      chartOptionVariant="select"
      chartSelections={{
        selections: ohlcChartProps.selectChartList,
        activeSelection: ohlcChartProps.selectedChartKey,
        setActiveSelection: setSelectedChart,
      }}
      timeOption={{
        options: TIME_OPTIONS,
        activeOption: ohlcChartProps.timeOption,
        setActiveOption: setTimeOption,
      }}
      isLoading={isLoading}
    />
    <ChartWrapper {...ohlcChartProps} />
  </Stack>
)

const menu = [
  { value: 'chart', label: t`Chart`, component: ChartTab },
  { value: 'trades', label: t`Swaps`, component: TradesTab },
  { value: 'events', label: t`Liquidity`, component: EventsTab },
]

const OhlcTabsContent = ({ children }: { children: ReactNode }) => (
  <Stack sx={{ backgroundColor: t => t.design.Layer[1].Fill }}>{children}</Stack>
)

export const OhlcAndActivityComp = ({
  rChainId: chainId,
  poolAddress,
  pricesApiPoolData,
}: {
  rChainId: ChainId
  poolAddress: Address
  pricesApiPoolData: Pool
}) => {
  const chart = useOhlcChartState({ chainId, pricesApiPoolData })
  const liquidityTable = usePoolActivityEventsConfig({ chainId, poolAddress })
  const tradesTable = usePoolActivityTradesConfig({ chainId, poolAddress })
  return (
    <Stack>
      <Tabs
        menu={menu}
        params={useMemo(() => ({ chart, liquidityTable, tradesTable }), [chart, liquidityTable, tradesTable])}
        variant="contained"
        ContentWrapper={OhlcTabsContent}
      />
    </Stack>
  )
}
