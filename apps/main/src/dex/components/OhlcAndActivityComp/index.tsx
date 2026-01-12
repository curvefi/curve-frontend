import { useState } from 'react'
import { styled } from 'styled-components'
import PoolActivity from '@/dex/components/OhlcAndActivityComp/PoolActivity'
import { useOhlcChartState } from '@/dex/hooks/useOhlcChartState'
import { ChainId } from '@/dex/types/main.types'
import Stack from '@mui/material/Stack'
import Box from '@ui/Box'
import ChartWrapper from '@ui-kit/features/candle-chart/ChartWrapper'
import { TIME_OPTIONS } from '@ui-kit/features/candle-chart/constants'
import type { PricesApiPool } from '@ui-kit/features/candle-chart/types'
import { t } from '@ui-kit/lib/i18n'
import ChartHeader from '@ui-kit/shared/ui/ChartHeader'
import { SubTabsSwitcher } from '@ui-kit/shared/ui/SubTabsSwitcher'
import { type TabOption } from '@ui-kit/shared/ui/TabsSwitcher'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing } = SizesAndSpaces

type Tab = 'chart' | 'poolActivity'
const tabs: TabOption<Tab>[] = [
  { value: 'chart', label: t`Chart` },
  { value: 'poolActivity', label: t`Pool Activity` },
]

export const OhlcAndActivityComp = ({
  rChainId,
  pricesApiPoolData,
}: {
  rChainId: ChainId
  pricesApiPoolData: PricesApiPool
}) => {
  const { chartCombinations, tradesTokens, isLoading, setSelectedChart, setTimeOption, ohlcChartProps, flipChart } =
    useOhlcChartState({
      rChainId,
      pricesApiPoolData,
    })
  const [poolInfo, setPoolInfo] = useState<'chart' | 'poolActivity'>('chart')

  return (
    <Wrapper>
      <SubTabsSwitcher tabs={tabs} value={poolInfo} onChange={setPoolInfo} />
      {pricesApiPoolData && poolInfo === 'poolActivity' && (
        <PoolActivity
          coins={pricesApiPoolData.coins}
          tradesTokens={tradesTokens}
          poolAddress={pricesApiPoolData.address}
          chainId={rChainId}
          chartCombinations={chartCombinations}
        />
      )}
      {poolInfo === 'chart' && (
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
    </Wrapper>
  )
}

const Wrapper = styled(Box)`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
`
