import type { LlammaLiquididationRange, LiquidationRanges } from '@/ui/Chart/types'
import { LlammaLiquidityCoins, ChartOhlcWrapperProps } from './types'

import { useEffect, useState, useMemo, useCallback } from 'react'
import styled from 'styled-components'
import { t } from '@lingui/macro'

import useStore from '@/store/useStore'
import { getThreeHundredResultsAgo, subtractTimeUnit } from '@/ui/Chart/utils'

import Button from '@/ui/Button'
import ChartWrapper from '@/ui/Chart'
import Icon from '@/ui/Icon'
import Box from '@/ui/Box'
import PoolActivity from '@/components/ChartOhlcWrapper/PoolActivity'
import { useUserProfileStore } from '@ui-kit/features/user-profile'

const ChartOhlcWrapper: React.FC<ChartOhlcWrapperProps> = ({ rChainId, llamma, llammaId }) => {
  const address = llamma?.address ?? ''
  const increaseActiveKey = useStore((state) => state.loanIncrease.activeKey)
  const decreaseActiveKey = useStore((state) => state.loanDecrease.activeKey)
  const deleverageActiveKey = useStore((state) => state.loanDeleverage.activeKey)
  const collateralIncreaseActiveKey = useStore((state) => state.loanCollateralIncrease.activeKey)
  const collateralDecreaseActiveKey = useStore((state) => state.loanCollateralDecrease.activeKey)
  const { formValues, activeKeyLiqRange } = useStore((state) => state.loanCreate)
  const userPrices = useStore((state) => state.loans.userDetailsMapper[llammaId]?.userPrices ?? null)
  const liqRangesMapper = useStore((state) => state.loanCreate.liqRangesMapper[activeKeyLiqRange])
  const increaseLoanPrices = useStore((state) => state.loanIncrease.detailInfo[increaseActiveKey]?.prices ?? null)
  const decreaseLoanPrices = useStore((state) => state.loanDecrease.detailInfo[decreaseActiveKey]?.prices ?? null)
  const deleveragePrices = useStore((state) => state.loanDeleverage.detailInfo[deleverageActiveKey]?.prices ?? null)
  const increaseCollateralPrices = useStore(
    (state) => state.loanCollateralIncrease.detailInfo[collateralIncreaseActiveKey]?.prices ?? null,
  )
  const decreaseCollateralPrices = useStore(
    (state) => state.loanCollateralDecrease.detailInfo[collateralDecreaseActiveKey]?.prices ?? null,
  )

  const theme = useUserProfileStore((state) => state.theme)
  const isAdvancedMode = useUserProfileStore((state) => state.isAdvancedMode)

  const isMdUp = useStore((state) => state.layout.isMdUp)
  const {
    chartFetchStatus,
    timeOption,
    refetchingCapped,
    lastFetchEndTime,
    chartOhlcData,
    volumeData,
    oraclePriceData,
    setChartTimeOption,
    fetchOhlcData,
    fetchMoreOhlcData,
    activityHidden,
    chartExpanded,
    setChartExpanded,
    toggleLiqRangeCurrentVisible,
    toggleLiqRangeNewVisible,
    toggleOraclePriceVisible,
    liqRangeCurrentVisible,
    liqRangeNewVisible,
    oraclePriceVisible,
  } = useStore((state) => state.ohlcCharts)
  const priceInfo = useStore((state) => state.loans.detailsMapper[llammaId]?.priceInfo ?? null)
  const { oraclePrice } = priceInfo ?? {}
  const [poolInfo, setPoolInfo] = useState<'chart' | 'poolActivity'>('chart')

  const selectedLiqRange = useMemo(() => {
    let liqRanges: LiquidationRanges = {
      current: null,
      new: null,
    }

    const formatRange = (liqRange: string[]) => {
      let range: LlammaLiquididationRange = {
        price1: [],
        price2: [],
      }

      for (const data of chartOhlcData) {
        range.price1 = [
          ...range.price1,
          {
            time: data.time,
            value: +liqRange[1],
          },
        ]
        range.price2 = [
          ...range.price2,
          {
            time: data.time,
            value: +liqRange[0],
          },
        ]
      }
      return range
    }

    // create loan prices
    if (formValues.n && liqRangesMapper && chartOhlcData) {
      const currentPrices = liqRangesMapper[formValues.n].prices
      // flip order to match other data
      const range = formatRange([currentPrices[1], currentPrices[0]])
      liqRanges.new = range
    }

    // current loan prices
    if (userPrices && chartOhlcData) {
      const range = formatRange(userPrices)
      liqRanges.current = range
    }
    // increase loan prices
    if (increaseLoanPrices && increaseLoanPrices.length !== 0 && chartOhlcData) {
      const range = formatRange(increaseLoanPrices)
      liqRanges.new = range
    }
    // decrease loan prices
    if (decreaseLoanPrices && decreaseLoanPrices.length !== 0 && chartOhlcData) {
      const range = formatRange(decreaseLoanPrices)
      liqRanges.new = range
    }
    // increase collateral prices
    if (increaseCollateralPrices && increaseCollateralPrices.length !== 0 && chartOhlcData) {
      const range = formatRange(increaseCollateralPrices)
      liqRanges.new = range
    }
    // decrease collateral prices
    if (decreaseCollateralPrices && decreaseCollateralPrices.length !== 0 && chartOhlcData) {
      const range = formatRange(decreaseCollateralPrices)
      liqRanges.new = range
    }

    // deleverage prices
    if (deleveragePrices && chartOhlcData) {
      const range = formatRange(deleveragePrices)
      liqRanges.new = range
    }

    return liqRanges
  }, [
    formValues.n,
    liqRangesMapper,
    chartOhlcData,
    userPrices,
    increaseLoanPrices,
    decreaseLoanPrices,
    increaseCollateralPrices,
    decreaseCollateralPrices,
    deleveragePrices,
  ])

  const coins: LlammaLiquidityCoins = llamma
    ? {
        crvusd: {
          symbol: llamma?.coins[0],
          address: llamma?.coinAddresses[0],
        },
        collateral: {
          symbol: llamma?.coins[1],
          address: llamma?.coinAddresses[1],
        },
      }
    : null

  const chartHeight = {
    expanded: 500,
    standard: 300,
  }

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
    fetchOhlcData(rChainId, llammaId, address, chartInterval, timeUnit, chartTimeSettings.start, chartTimeSettings.end)
  }

  // set snapshot data and subscribe to new data
  useEffect(() => {
    if (llamma !== undefined) {
      fetchOhlcData(
        rChainId,
        llammaId,
        address,
        chartInterval,
        timeUnit,
        chartTimeSettings.start,
        chartTimeSettings.end,
      )
    }
  }, [
    rChainId,
    chartInterval,
    chartTimeSettings.end,
    chartTimeSettings.start,
    timeUnit,
    fetchOhlcData,
    address,
    llamma,
    llammaId,
  ])

  const fetchMoreChartData = useCallback(
    (lastFetchEndTime: number) => {
      const endTime = subtractTimeUnit(timeOption, lastFetchEndTime)
      const startTime = getThreeHundredResultsAgo(timeOption, endTime)

      fetchMoreOhlcData(rChainId, address, chartInterval, timeUnit, +startTime, endTime)
    },
    [timeOption, fetchMoreOhlcData, rChainId, address, chartInterval, timeUnit],
  )

  return chartExpanded ? (
    <ExpandedWrapper activityHidden={activityHidden}>
      <Wrapper variant={'secondary'} chartExpanded={chartExpanded}>
        <ChartWrapper
          chartType="crvusd"
          chartStatus={llamma ? chartFetchStatus : 'LOADING'}
          chartHeight={chartHeight}
          chartExpanded={chartExpanded}
          themeType={theme}
          ohlcData={chartOhlcData}
          volumeData={volumeData}
          oraclePriceData={oraclePriceData}
          liquidationRange={selectedLiqRange}
          timeOption={timeOption}
          selectChartList={[{ label: llamma ? `${llamma.collateralSymbol} / crvUSD` : t`Chart` }]}
          setChartTimeOption={setChartTimeOption}
          refetchPricesData={refetchPricesData}
          refetchingCapped={refetchingCapped}
          fetchMoreChartData={fetchMoreChartData}
          lastFetchEndTime={lastFetchEndTime}
          toggleLiqRangeCurrentVisible={toggleLiqRangeCurrentVisible}
          toggleLiqRangeNewVisible={toggleLiqRangeNewVisible}
          toggleOraclePriceVisible={toggleOraclePriceVisible}
          liqRangeCurrentVisible={liqRangeCurrentVisible}
          liqRangeNewVisible={liqRangeNewVisible}
          oraclePriceVisible={oraclePriceVisible}
          latestOraclePrice={oraclePrice}
        />
      </Wrapper>
      <LpEventsWrapperExpanded>
        <PoolActivity poolAddress={address} chainId={rChainId} coins={coins} />
      </LpEventsWrapperExpanded>
    </ExpandedWrapper>
  ) : (
    <Wrapper className={!isAdvancedMode ? 'normal-mode' : ''} chartExpanded={chartExpanded}>
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
          {t`LLAMMA Activity`}
        </SelectorButton>
        {isMdUp && (
          <ExpandButton variant={'text'} onClick={() => setChartExpanded()}>
            {chartExpanded ? 'Minimize' : 'Expand'}
            <ExpandIcon name={chartExpanded ? 'Minimize' : 'Maximize'} size={16} aria-label={t`Expand chart`} />
          </ExpandButton>
        )}
      </SelectorRow>
      {poolInfo === 'poolActivity' && <PoolActivity poolAddress={address} chainId={rChainId} coins={coins} />}
      {poolInfo === 'chart' && (
        <ChartWrapper
          chartType="crvusd"
          chartStatus={llamma ? chartFetchStatus : 'LOADING'}
          chartHeight={chartHeight}
          chartExpanded={false}
          themeType={theme}
          ohlcData={chartOhlcData}
          volumeData={volumeData}
          oraclePriceData={oraclePriceData}
          liquidationRange={selectedLiqRange}
          timeOption={timeOption}
          selectChartList={[{ label: llamma ? `${llamma.collateralSymbol} / crvUSD` : t`Chart` }]}
          setChartTimeOption={setChartTimeOption}
          refetchPricesData={refetchPricesData}
          refetchingCapped={refetchingCapped}
          fetchMoreChartData={fetchMoreChartData}
          lastFetchEndTime={lastFetchEndTime}
          toggleLiqRangeCurrentVisible={toggleLiqRangeCurrentVisible}
          toggleLiqRangeNewVisible={toggleLiqRangeNewVisible}
          toggleOraclePriceVisible={toggleOraclePriceVisible}
          liqRangeCurrentVisible={liqRangeCurrentVisible}
          liqRangeNewVisible={liqRangeNewVisible}
          oraclePriceVisible={oraclePriceVisible}
          latestOraclePrice={oraclePrice}
        />
      )}
    </Wrapper>
  )
}

const ExpandedWrapper = styled.div<{ activityHidden: boolean }>`
  display: grid;
  ${(props) =>
    !props.activityHidden
      ? 'grid-template-columns: 2fr 26.4375rem'
      : 'grid-template-columns: auto calc(var(--spacing-3) + var(--spacing-3))'}
`

const LpEventsWrapperExpanded = styled(Box)`
  padding: var(--spacing-3);
  background: var(--box--secondary--content--background-color);
`

const Wrapper = styled(Box)<{ chartExpanded: boolean }>`
  display: flex;
  flex-direction: column;
  padding: ${(props) => (props.chartExpanded ? 'var(--spacing-3)' : '0')};
  &.normal-mode {
    padding: var(--spacing-3);
    @media screen and (min-width: 53.125rem) {
      padding: 2rem;
    }
  }
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

const ExpandButton = styled(SelectorButton)`
  margin-left: auto;
  display: flex;
  align-content: center;
`

const ExpandIcon = styled(Icon)`
  margin-left: var(--spacing-1);
`

export default ChartOhlcWrapper
