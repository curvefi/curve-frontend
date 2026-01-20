import { SubTabsSwitcher } from 'curve-ui-kit/src/shared/ui/Tabs/SubTabsSwitcher'
import { useState } from 'react'
import { useOhlcChartState } from '@/dex/hooks/useOhlcChartState'
import { usePoolActivity } from '@/dex/hooks/usePoolActivity'
import { ChainId } from '@/dex/types/main.types'
import type { Address } from '@curvefi/prices-api'
import Stack from '@mui/material/Stack'
import { ActivityTable, PoolTradesExpandedPanel, PoolLiquidityExpandedPanel } from '@ui-kit/features/activity-table'
import { ChartWrapper } from '@ui-kit/features/candle-chart/ChartWrapper'
import { TIME_OPTIONS } from '@ui-kit/features/candle-chart/constants'
import type { PricesApiPool } from '@ui-kit/features/candle-chart/types'
import { t } from '@ui-kit/lib/i18n'
import { ChartHeader } from '@ui-kit/shared/ui/Chart/ChartHeader'
import { type TabOption } from '@ui-kit/shared/ui/Tabs/TabsSwitcher'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing } = SizesAndSpaces

type Tab = 'chart' | 'poolActivity'
const tabs: TabOption<Tab>[] = [
  { value: 'chart', label: t`Chart` },
  { value: 'poolActivity', label: t`Pool Activity` },
]

const PoolActivity = ({ chainId, poolAddress }: { poolAddress: Address; chainId: ChainId }) => {
  const { activeSelection, setActiveSelection, selections, tradesTableConfig, liquidityTableConfig } = usePoolActivity({
    chainId,
    poolAddress,
  })

  return (
    <>
      {activeSelection === 'trades' && (
        <ActivityTable
          selections={selections}
          activeSelection={activeSelection}
          onSelectionChange={setActiveSelection}
          tableConfig={tradesTableConfig}
          expandedPanel={PoolTradesExpandedPanel}
        />
      )}
      {activeSelection === 'liquidity' && (
        <ActivityTable
          selections={selections}
          activeSelection={activeSelection}
          onSelectionChange={setActiveSelection}
          tableConfig={liquidityTableConfig}
          expandedPanel={PoolLiquidityExpandedPanel}
        />
      )}
    </>
  )
}

export const OhlcAndActivityComp = ({
  rChainId,
  pricesApiPoolData,
}: {
  rChainId: ChainId
  pricesApiPoolData: PricesApiPool
}) => {
  const { isLoading, setSelectedChart, setTimeOption, ohlcChartProps, flipChart } = useOhlcChartState({
    rChainId,
    pricesApiPoolData,
  })
  const [tab, setTab] = useState<'chart' | 'poolActivity'>('chart')

  return (
    <Stack gap={Spacing.md}>
      <SubTabsSwitcher tabs={tabs} value={tab} onChange={setTab} />
      {pricesApiPoolData && tab === 'poolActivity' && (
        <PoolActivity poolAddress={pricesApiPoolData.address as Address} chainId={rChainId} />
      )}
      {tab === 'chart' && (
        <Stack sx={{ gap: Spacing.md }}>
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
  )
}
