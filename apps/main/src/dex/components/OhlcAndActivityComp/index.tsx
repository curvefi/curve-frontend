import { useState } from 'react'
import { ChainId } from '@/dex/types/main.types'
import type { Pool } from '@curvefi/prices-api/pools'
import Stack from '@mui/material/Stack'
import type { Address } from '@primitives/address.utils'
import {
  ActivityTable,
  PoolTradesExpandedPanel,
  PoolTradesExpandedPanelFooter,
  PoolLiquidityExpandedPanel,
  PoolLiquidityExpandedPanelFooter,
} from '@ui-kit/features/activity-table'
import { ChartWrapper } from '@ui-kit/features/candle-chart/ChartWrapper'
import { TIME_OPTIONS } from '@ui-kit/features/candle-chart/constants'
import { t } from '@ui-kit/lib/i18n'
import { ChartHeader } from '@ui-kit/shared/ui/Chart/ChartHeader'
import { TabsSwitcher, type TabOption } from '@ui-kit/shared/ui/Tabs/TabsSwitcher'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { useOhlcChartState } from './hooks/useOhlcChartState'
import { usePoolActivityEventsConfig } from './hooks/usePoolActivityEventsConfig'
import { usePoolActivityTradesConfig } from './hooks/usePoolActivityTradesConfig'

const { Spacing } = SizesAndSpaces

type Tab = 'chart' | 'events' | 'trades'
const tabs: TabOption<Tab>[] = [
  { value: 'chart', label: t`Chart` },
  { value: 'trades', label: t`Swaps` },
  { value: 'events', label: t`Liquidity` },
]

export const OhlcAndActivityComp = ({
  rChainId,
  poolAddress,
  pricesApiPoolData,
}: {
  rChainId: ChainId
  poolAddress: Address
  pricesApiPoolData: Pool
}) => {
  const { isLoading, setSelectedChart, setTimeOption, ohlcChartProps, flipChart } = useOhlcChartState({
    rChainId,
    pricesApiPoolData,
  })
  const liquidityTable = usePoolActivityEventsConfig({
    chainId: rChainId,
    poolAddress,
  })
  const tradesTable = usePoolActivityTradesConfig({
    chainId: rChainId,
    poolAddress,
  })
  const [tab, setTab] = useState<Tab>('chart')

  return (
    <Stack>
      <TabsSwitcher variant="contained" value={tab} onChange={setTab} options={tabs} />
      <Stack sx={{ backgroundColor: t => t.design.Layer[1].Fill }}>
        {tab === 'events' && (
          <ActivityTable
            table={liquidityTable.table}
            emptyState={liquidityTable.emptyState}
            errorState={liquidityTable.errorState}
            expandedPanel={{ Body: PoolLiquidityExpandedPanel, Footer: PoolLiquidityExpandedPanelFooter }}
          />
        )}
        {tab === 'trades' && (
          <ActivityTable
            table={tradesTable.table}
            emptyState={tradesTable.emptyState}
            errorState={tradesTable.errorState}
            expandedPanel={{ Body: PoolTradesExpandedPanel, Footer: PoolTradesExpandedPanelFooter }}
          />
        )}
        {tab === 'chart' && (
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
        )}
      </Stack>
    </Stack>
  )
}
