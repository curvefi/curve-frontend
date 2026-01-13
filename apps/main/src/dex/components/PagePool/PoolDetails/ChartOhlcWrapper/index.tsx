import { useCallback, useEffect, useMemo, useState } from 'react'
import { styled } from 'styled-components'
import { PoolActivity } from '@/dex/components/PagePool/PoolDetails/ChartOhlcWrapper/PoolActivity'
import { combinations } from '@/dex/components/PagePool/PoolDetails/ChartOhlcWrapper/utils'
import { useStore } from '@/dex/store/useStore'
import { ChainId } from '@/dex/types/main.types'
import { Box } from '@ui/Box'
import { Button } from '@ui/Button'
import { ChartWrapper } from '@ui-kit/features/candle-chart/ChartWrapper'
import type { LabelList, PricesApiCoin, PricesApiPool } from '@ui-kit/features/candle-chart/types'
import { getThreeHundredResultsAgo, subtractTimeUnit } from '@ui-kit/features/candle-chart/utils'
import { useUserProfileStore } from '@ui-kit/features/user-profile'
import { t } from '@ui-kit/lib/i18n'

const CHART_HEIGHT = 300

export const PoolInfoData = ({ rChainId, pricesApiPoolData }: { rChainId: ChainId; pricesApiPoolData: PricesApiPool }) => {
  const theme = useUserProfileStore((state) => state.theme)
  const chartOhlcData = useStore((state) => state.pools.pricesApiState.chartOhlcData)
  const chartStatus = useStore((state) => state.pools.pricesApiState.chartStatus)
  const timeOption = useStore((state) => state.pools.pricesApiState.timeOption)
  const tradesTokens = useStore((state) => state.pools.pricesApiState.tradesTokens)
  const refetchingCapped = useStore((state) => state.pools.pricesApiState.refetchingCapped)
  const lastFetchEndTime = useStore((state) => state.pools.pricesApiState.lastFetchEndTime)
  const setChartTimeOption = useStore((state) => state.pools.setChartTimeOption)
  const fetchPricesApiCharts = useStore((state) => state.pools.fetchPricesApiCharts)
  const fetchPricesApiActivity = useStore((state) => state.pools.fetchPricesApiActivity)
  const fetchMorePricesApiCharts = useStore((state) => state.pools.fetchMorePricesApiCharts)

  const [poolInfo, setPoolInfo] = useState<'chart' | 'poolActivity'>('chart')
  const [selectChartList, setSelectChartList] = useState<LabelList[]>([])
  const [selectedChartIndex, setChartSelectedIndex] = useState<number>(0)
  const [isFlipped, setIsFlipped] = useState<boolean[]>([])

  const chartCombinations: PricesApiCoin[][] = useMemo(() => {
    const coins = pricesApiPoolData.coins.slice(0, pricesApiPoolData.n_coins)

    const combinationsArray = combinations(coins, 2)
    // adds combinations in case of basepool
    const extraCombinations = pricesApiPoolData.coins.slice(pricesApiPoolData.n_coins).map((item) => [item, coins[0]])

    const combinedArray = [...combinationsArray]
    combinedArray.splice(0, 0, ...extraCombinations)

    return combinedArray
  }, [pricesApiPoolData.coins, pricesApiPoolData.n_coins])

  const chartTimeSettings = useMemo(() => {
    const threeHundredResultsAgo = getThreeHundredResultsAgo(timeOption, Date.now() / 1000)

    return {
      start: +threeHundredResultsAgo,
      end: Math.floor(Date.now() / 1000),
    }
  }, [timeOption])

  const chartInterval = useMemo(() => {
    if (timeOption === '15m') return 15
    if (timeOption === '30m') return 30
    if (timeOption === '1h') return 1
    if (timeOption === '4h') return 4
    if (timeOption === '6h') return 6
    if (timeOption === '12h') return 12
    if (timeOption === '1d') return 1
    if (timeOption === '7d') return 7
    return 14 // 14d
  }, [timeOption])

  const timeUnit = useMemo(() => {
    if (timeOption === '15m') return 'minute'
    if (timeOption === '30m') return 'minute'
    if (timeOption === '1h') return 'hour'
    if (timeOption === '4h') return 'hour'
    if (timeOption === '6h') return 'hour'
    if (timeOption === '12h') return 'hour'
    if (timeOption === '1d') return 'day'
    if (timeOption === '7d') return 'day'
    return 'day' // 14d
  }, [timeOption])

  const refetchPricesData = () => {
    fetchPricesApiCharts(
      rChainId,
      selectedChartIndex,
      pricesApiPoolData.address,
      chartInterval,
      timeUnit,
      chartTimeSettings.end,
      chartTimeSettings.start,
      chartCombinations,
      isFlipped,
    )
    fetchPricesApiActivity(rChainId, pricesApiPoolData.address, chartCombinations)
  }

  // set snapshot data and subscribe to new data
  useEffect(() => {
    fetchPricesApiCharts(
      rChainId,
      selectedChartIndex,
      pricesApiPoolData.address,
      chartInterval,
      timeUnit,
      chartTimeSettings.end,
      chartTimeSettings.start,
      chartCombinations,
      isFlipped,
    )
  }, [
    rChainId,
    chartCombinations,
    pricesApiPoolData.address,
    chartInterval,
    chartTimeSettings.end,
    chartTimeSettings.start,
    fetchPricesApiCharts,
    isFlipped,
    selectedChartIndex,
    timeUnit,
  ])

  const fetchMoreChartData = useCallback(
    (lastFetchEndTime: number) => {
      const endTime = subtractTimeUnit(timeOption, lastFetchEndTime)
      const startTime = getThreeHundredResultsAgo(timeOption, endTime)

      fetchMorePricesApiCharts(
        rChainId,
        selectedChartIndex,
        pricesApiPoolData.address,
        chartInterval,
        timeUnit,
        +startTime,
        endTime,
        chartCombinations,
        isFlipped,
      )
    },
    [
      rChainId,
      chartCombinations,
      chartInterval,
      fetchMorePricesApiCharts,
      isFlipped,
      pricesApiPoolData.address,
      selectedChartIndex,
      timeOption,
      timeUnit,
    ],
  )

  useEffect(() => {
    const chartsList: LabelList[] =
      chartOhlcData.length !== 0
        ? [
            {
              label: t`LP Token (USD)`,
            },
            {
              label: t`LP Token (${pricesApiPoolData.coins[0].symbol})`,
            },
          ].concat(
            chartCombinations.map((chart, index) => {
              const mainTokenSymbol = isFlipped[index] ? chart[1].symbol : chart[0].symbol
              const referenceTokenSymbol = isFlipped[index] ? chart[0].symbol : chart[1].symbol

              return {
                label: `${referenceTokenSymbol} / ${mainTokenSymbol}`,
              }
            }),
          )
        : []
    setSelectChartList(chartsList)
    // }
  }, [pricesApiPoolData.coins, chartCombinations, isFlipped, chartOhlcData.length])

  useEffect(() => {
    const flippedList = new Array(chartCombinations.length).fill(false)
    setIsFlipped(flippedList)
  }, [chartCombinations.length])

  const flipChart = () =>
    setIsFlipped(
      isFlipped.map((_item, index) =>
        index === selectedChartIndex - 2 ? !isFlipped[selectedChartIndex - 2] : isFlipped[selectedChartIndex - 2],
      ),
    )

  return (
    <Wrapper>
      <SelectorRow>
        <SelectorButton
          variant={'text'}
          className={poolInfo === 'chart' ? 'active' : ''}
          onClick={() => setPoolInfo('chart')}
        >
          {t`Chart`}
        </SelectorButton>
        <SelectorButton
          variant={'text'}
          className={poolInfo === 'poolActivity' ? 'active' : ''}
          onClick={() => setPoolInfo('poolActivity')}
        >
          {t`Pool Activity`}
        </SelectorButton>
      </SelectorRow>
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
        <ChartWrapper
          hideCandleSeriesLabel={false}
          chartType="poolPage"
          chartStatus={chartStatus}
          chartHeight={CHART_HEIGHT}
          themeType={theme}
          ohlcData={chartOhlcData}
          selectChartList={selectChartList}
          selectedChartIndex={selectedChartIndex}
          setChartSelectedIndex={setChartSelectedIndex}
          timeOption={timeOption}
          setChartTimeOption={setChartTimeOption}
          flipChart={flipChart}
          refetchPricesData={refetchPricesData}
          refetchingCapped={refetchingCapped}
          fetchMoreChartData={fetchMoreChartData}
          lastFetchEndTime={lastFetchEndTime}
        />
      )}
    </Wrapper>
  )
}

const Wrapper = styled(Box)`
  display: flex;
  flex-direction: column;
`

const SelectorRow = styled.div`
  display: flex;
  flex-direction: row;
  margin-bottom: var(--spacing-2);
`

const SelectorButton = styled(Button)`
  color: inherit;
  font: var(--font);
  font-size: var(--font-size-2);
  font-weight: bold;
  text-transform: none;
  opacity: 0.7;
  &.active {
    opacity: 1;
    border-bottom: 2px solid var(--page--text-color);
  }
`
