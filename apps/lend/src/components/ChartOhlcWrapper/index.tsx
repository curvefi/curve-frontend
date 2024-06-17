import type { LlammaLiquididationRange, LiquidationRanges } from '@/ui/Chart/types'
import { LendingMarketTokens } from './types'

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

type Props = {
  rChainId: ChainId
  userActiveKey: string
  rOwmId: string
}

const ChartOhlcWrapper = ({ rChainId, userActiveKey, rOwmId }: Props) => {
  const isAdvanceMode = useStore((state) => state.isAdvanceMode)
  const themeType = useStore((state) => state.themeType)
  const owm = useStore((state) => state.markets.owmDatasMapper[rChainId]?.[rOwmId]?.owm)
  const borrowMoreActiveKey = useStore((state) => state.loanBorrowMore.activeKey)
  const loanRepayActiveKey = useStore((state) => state.loanRepay.activeKey)
  const loanCollateralAddActiveKey = useStore((state) => state.loanCollateralAdd.activeKey)
  const loanCollateralRemoveActiveKey = useStore((state) => state.loanCollateralRemove.activeKey)
  const { formValues, activeKeyLiqRange } = useStore((state) => state.loanCreate)
  const userPrices = useStore((state) => state.user.loansDetailsMapper[userActiveKey]?.details?.prices ?? null)
  const liqRangesMapper = useStore((state) => state.loanCreate.liqRangesMapper[activeKeyLiqRange])
  const borrowMorePrices = useStore((state) => state.loanBorrowMore.detailInfo[borrowMoreActiveKey]?.prices ?? null)
  const repayLoanPrices = useStore((state) => state.loanRepay.detailInfo[loanRepayActiveKey]?.prices ?? null)
  // const deleveragePrices = useStore((state) => state.loanDeleverage.detailInfo[deleverageActiveKey]?.prices ?? null)
  const addCollateralPrices = useStore(
    (state) => state.loanCollateralAdd.detailInfo[loanCollateralAddActiveKey]?.prices ?? null
  )
  const removeCollateralPrices = useStore(
    (state) => state.loanCollateralRemove.detailInfo[loanCollateralRemoveActiveKey]?.prices ?? null
  )
  const isMdUp = useStore((state) => state.layout.isMdUp)
  const {
    chartLlammaOhlc,
    chartOracleOhlc,
    timeOption,
    volumeData,
    oraclePriceData,
    setChartTimeOption,
    fetchLlammaOhlcData,
    fetchMoreLlammaOhlcData,
    fetchOracleOhlcData,
    fetchMoreOracleOhlcData,
    setChartSelectedIndex,
    selectedChartIndex,
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
  const priceInfo = useStore((state) => state.markets.pricesMapper[rChainId]?.[rOwmId]?.prices ?? null)
  const { oraclePrice } = priceInfo ?? {}
  const [poolInfo, setPoolInfo] = useState<'chart' | 'poolActivity'>('chart')

  const currentChart = useMemo(() => {
    return selectedChartIndex === 0 ? chartOracleOhlc : chartLlammaOhlc
  }, [chartLlammaOhlc, chartOracleOhlc, selectedChartIndex])

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

      for (const data of currentChart.data) {
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
    if (formValues.n && liqRangesMapper && currentChart.data) {
      const currentPrices = liqRangesMapper[formValues.n].prices
      // flip order to match other data
      const range = formatRange([currentPrices[1], currentPrices[0]])
      liqRanges.new = range
    }

    // current loan prices
    if (userPrices && currentChart.data) {
      const range = formatRange(userPrices)
      liqRanges.current = range
    }
    // increase loan prices
    if (borrowMorePrices && borrowMorePrices.length !== 0 && currentChart.data) {
      const range = formatRange(borrowMorePrices)
      liqRanges.new = range
    }
    // decrease loan prices
    if (repayLoanPrices && repayLoanPrices.length !== 0 && currentChart.data) {
      const range = formatRange(repayLoanPrices)
      liqRanges.new = range
    }
    // increase collateral prices
    if (addCollateralPrices && addCollateralPrices.length !== 0 && currentChart.data) {
      const range = formatRange(addCollateralPrices)
      liqRanges.new = range
    }
    // decrease collateral prices
    if (removeCollateralPrices && removeCollateralPrices.length !== 0 && currentChart.data) {
      const range = formatRange(removeCollateralPrices)
      liqRanges.new = range
    }

    // // deleverage prices
    // if (deleveragePrices && currentChart.data) {
    //   const range = formatRange(deleveragePrices)
    //   liqRanges.new = range
    // }

    return liqRanges
  }, [
    formValues.n,
    liqRangesMapper,
    currentChart.data,
    userPrices,
    borrowMorePrices,
    repayLoanPrices,
    addCollateralPrices,
    removeCollateralPrices,
  ])

  const coins: LendingMarketTokens = owm
    ? {
        borrowedToken: {
          symbol: owm?.borrowed_token.symbol,
          address: owm?.borrowed_token.address,
        },
        collateralToken: {
          symbol: owm?.collateral_token.symbol,
          address: owm?.collateral_token.address,
        },
      }
    : null

  const selectChartList = owm
    ? [
        {
          label: t`${coins?.collateralToken.symbol} / ${coins?.borrowedToken.symbol} (Oracle)`,
        },
        {
          label: t`${coins?.collateralToken.symbol} / ${coins?.borrowedToken.symbol} (LLAMMA)`,
        },
      ]
    : [{ label: t`Chart` }]

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
    fetchLlammaOhlcData(
      rChainId,
      rOwmId,
      owm?.addresses.amm,
      chartInterval,
      timeUnit,
      chartTimeSettings.start,
      chartTimeSettings.end
    )
    fetchOracleOhlcData(
      rChainId,
      owm?.addresses.controller,
      chartInterval,
      timeUnit,
      chartTimeSettings.start,
      chartTimeSettings.end
    )
  }

  // set snapshot data and subscribe to new data
  useEffect(() => {
    if (owm !== undefined) {
      fetchLlammaOhlcData(
        rChainId,
        rOwmId,
        owm?.addresses.amm,
        chartInterval,
        timeUnit,
        chartTimeSettings.start,
        chartTimeSettings.end
      )
      fetchOracleOhlcData(
        rChainId,
        owm?.addresses.controller,
        chartInterval,
        timeUnit,
        chartTimeSettings.start,
        chartTimeSettings.end
      )
    }
  }, [
    rChainId,
    chartInterval,
    chartTimeSettings.end,
    chartTimeSettings.start,
    timeUnit,
    fetchLlammaOhlcData,
    fetchOracleOhlcData,
    owm,
    rOwmId,
  ])

  const fetchMoreChartData = useCallback(
    (lastFetchEndTime: number) => {
      const endTime = subtractTimeUnit(timeOption, lastFetchEndTime)
      const startTime = getThreeHundredResultsAgo(timeOption, endTime)

      fetchMoreLlammaOhlcData(rChainId, owm?.addresses.amm, chartInterval, timeUnit, +startTime, endTime)
      fetchMoreOracleOhlcData(rChainId, owm?.addresses.controller, chartInterval, timeUnit, +startTime, endTime)
    },
    [
      timeOption,
      fetchMoreLlammaOhlcData,
      rChainId,
      owm?.addresses.amm,
      chartInterval,
      timeUnit,
      fetchMoreOracleOhlcData,
      owm?.addresses.controller,
    ]
  )

  return chartExpanded ? (
    <ExpandedWrapper activityHidden={activityHidden}>
      <Wrapper variant={'secondary'} chartExpanded={chartExpanded}>
        <ChartWrapper
          chartType="crvusd"
          chartStatus={currentChart.fetchStatus}
          chartHeight={chartHeight}
          chartExpanded={chartExpanded}
          themeType={themeType}
          ohlcData={currentChart.data}
          volumeData={volumeData}
          oraclePriceData={oraclePriceData}
          liquidationRange={selectedLiqRange}
          timeOption={timeOption}
          selectChartList={selectChartList}
          setChartTimeOption={setChartTimeOption}
          refetchPricesData={refetchPricesData}
          refetchingCapped={currentChart.refetchingCapped}
          fetchMoreChartData={fetchMoreChartData}
          lastFetchEndTime={currentChart.lastFetchEndTime}
          toggleLiqRangeCurrentVisible={toggleLiqRangeCurrentVisible}
          toggleLiqRangeNewVisible={toggleLiqRangeNewVisible}
          toggleOraclePriceVisible={toggleOraclePriceVisible}
          liqRangeCurrentVisible={liqRangeCurrentVisible}
          liqRangeNewVisible={liqRangeNewVisible}
          oraclePriceVisible={oraclePriceVisible}
          latestOraclePrice={oraclePrice}
          selectedChartIndex={selectedChartIndex}
          setChartSelectedIndex={setChartSelectedIndex}
        />
      </Wrapper>
      <LpEventsWrapperExpanded>
        <PoolActivity poolAddress={owm?.addresses.amm} chainId={rChainId} coins={coins} />
      </LpEventsWrapperExpanded>
    </ExpandedWrapper>
  ) : (
    <Wrapper className={!isAdvanceMode ? 'normal-mode' : ''} chartExpanded={chartExpanded}>
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
      {poolInfo === 'poolActivity' && (
        <PoolActivity poolAddress={owm?.addresses.amm} chainId={rChainId} coins={coins} />
      )}
      {poolInfo === 'chart' && (
        <ChartWrapper
          chartType="crvusd"
          chartStatus={currentChart.fetchStatus}
          chartHeight={chartHeight}
          chartExpanded={false}
          themeType={themeType}
          ohlcData={currentChart.data}
          volumeData={volumeData}
          oraclePriceData={oraclePriceData}
          liquidationRange={selectedLiqRange}
          timeOption={timeOption}
          selectedChartIndex={selectedChartIndex}
          setChartSelectedIndex={setChartSelectedIndex}
          selectChartList={selectChartList}
          setChartTimeOption={setChartTimeOption}
          refetchPricesData={refetchPricesData}
          refetchingCapped={currentChart.refetchingCapped}
          fetchMoreChartData={fetchMoreChartData}
          lastFetchEndTime={currentChart.lastFetchEndTime}
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
