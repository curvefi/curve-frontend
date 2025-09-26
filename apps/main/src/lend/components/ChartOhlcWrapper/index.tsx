import { useCallback, useEffect, useMemo, useState } from 'react'
import { styled } from 'styled-components'
import PoolActivity from '@/lend/components/ChartOhlcWrapper/PoolActivity'
import { useOneWayMarket } from '@/lend/entities/chain'
import { useUserLoanDetails } from '@/lend/hooks/useUserLoanDetails'
import useStore from '@/lend/store/useStore'
import AlertBox from '@ui/AlertBox'
import Box from '@ui/Box'
import Button from '@ui/Button'
import ChartWrapper, { type ChartWrapperProps } from '@ui/Chart/ChartWrapper'
import type { LiquidationRanges, LlammaLiquididationRange } from '@ui/Chart/types'
import { getThreeHundredResultsAgo, subtractTimeUnit } from '@ui/Chart/utils'
import Icon from '@ui/Icon'
import TextCaption from '@ui/TextCaption'
import { useLayoutStore } from '@ui-kit/features/layout'
import { useUserProfileStore } from '@ui-kit/features/user-profile'
import { t } from '@ui-kit/lib/i18n'
import { ChartOhlcWrapperProps, LendingMarketTokens } from './types'

const ChartOhlcWrapper = ({ rChainId, userActiveKey, rOwmId, betaBackgroundColor }: ChartOhlcWrapperProps) => {
  const market = useOneWayMarket(rChainId, rOwmId).data
  const borrowMoreActiveKey = useStore((state) => state.loanBorrowMore.activeKey)
  const loanRepayActiveKey = useStore((state) => state.loanRepay.activeKey)
  const loanCollateralAddActiveKey = useStore((state) => state.loanCollateralAdd.activeKey)
  const loanCollateralRemoveActiveKey = useStore((state) => state.loanCollateralRemove.activeKey)
  const activeKey = useStore((state) => state.loanCreate.activeKey)
  const formValues = useStore((state) => state.loanCreate.formValues)
  const activeKeyLiqRange = useStore((state) => state.loanCreate.activeKeyLiqRange)
  const loanCreateLeverageDetailInfo = useStore((state) => state.loanCreate.detailInfoLeverage[activeKey])
  const userPrices = useUserLoanDetails(userActiveKey)?.prices ?? null
  const liqRangesMapper = useStore((state) => state.loanCreate.liqRangesMapper[activeKeyLiqRange])
  const borrowMorePrices = useStore((state) => state.loanBorrowMore.detailInfo[borrowMoreActiveKey]?.prices ?? null)
  const repayActiveKey = useStore((state) => state.loanRepay.activeKey)
  const repayLeveragePrices = useStore((state) => state.loanRepay.detailInfoLeverage[repayActiveKey]?.prices ?? null)
  const repayLoanPrices = useStore((state) => state.loanRepay.detailInfo[loanRepayActiveKey]?.prices ?? null)
  const addCollateralPrices = useStore(
    (state) => state.loanCollateralAdd.detailInfo[loanCollateralAddActiveKey]?.prices ?? null,
  )
  const removeCollateralPrices = useStore(
    (state) => state.loanCollateralRemove.detailInfo[loanCollateralRemoveActiveKey]?.prices ?? null,
  )
  const theme = useUserProfileStore((state) => state.theme)
  const isMdUp = useLayoutStore((state) => state.isMdUp)
  const chartLlammaOhlc = useStore((state) => state.ohlcCharts.chartLlammaOhlc)
  const chartOraclePoolOhlc = useStore((state) => state.ohlcCharts.chartOraclePoolOhlc)
  const timeOption = useStore((state) => state.ohlcCharts.timeOption)
  const setChartTimeOption = useStore((state) => state.ohlcCharts.setChartTimeOption)
  const fetchLlammaOhlcData = useStore((state) => state.ohlcCharts.fetchLlammaOhlcData)
  const fetchOraclePoolOhlcData = useStore((state) => state.ohlcCharts.fetchOraclePoolOhlcData)
  const fetchMoreData = useStore((state) => state.ohlcCharts.fetchMoreData)
  const activityHidden = useStore((state) => state.ohlcCharts.activityHidden)
  const chartExpanded = useStore((state) => state.ohlcCharts.chartExpanded)
  const setChartExpanded = useStore((state) => state.ohlcCharts.setChartExpanded)
  const toggleLiqRangeCurrentVisible = useStore((state) => state.ohlcCharts.toggleLiqRangeCurrentVisible)
  const toggleLiqRangeNewVisible = useStore((state) => state.ohlcCharts.toggleLiqRangeNewVisible)
  const toggleOraclePriceVisible = useStore((state) => state.ohlcCharts.toggleOraclePriceVisible)
  const liqRangeCurrentVisible = useStore((state) => state.ohlcCharts.liqRangeCurrentVisible)
  const liqRangeNewVisible = useStore((state) => state.ohlcCharts.liqRangeNewVisible)
  const oraclePriceVisible = useStore((state) => state.ohlcCharts.oraclePriceVisible)
  const priceInfo = useStore((state) => state.markets.pricesMapper[rChainId]?.[rOwmId]?.prices ?? null)

  const { oraclePrice } = priceInfo ?? {}
  const [poolInfo, setPoolInfo] = useState<'chart' | 'poolActivity'>('chart')
  const [selectedChartIndex, setChartSelectedIndex] = useState(0)

  const ohlcDataUnavailable = chartLlammaOhlc.dataDisabled && chartOraclePoolOhlc.dataDisabled

  const currentChart = useMemo(
    () => (selectedChartIndex === 0 ? chartOraclePoolOhlc : chartLlammaOhlc),
    [chartLlammaOhlc, chartOraclePoolOhlc, selectedChartIndex],
  )

  const oraclePriceData = useMemo(() => {
    if (selectedChartIndex === 0) {
      if (chartOraclePoolOhlc.oraclePriceData.length > 0) return chartOraclePoolOhlc.oraclePriceData
      if (chartLlammaOhlc.oraclePriceData.length > 0) return chartLlammaOhlc.oraclePriceData
      return undefined
    }
    if (chartLlammaOhlc.oraclePriceData.length > 0) return chartLlammaOhlc.oraclePriceData
    if (chartOraclePoolOhlc.oraclePriceData.length > 0) return chartOraclePoolOhlc.oraclePriceData
    return undefined
  }, [chartLlammaOhlc.oraclePriceData, chartOraclePoolOhlc.oraclePriceData, selectedChartIndex])

  const selectedLiqRange = useMemo(() => {
    const liqRanges: LiquidationRanges = {
      current: null,
      new: null,
    }

    const formatRange = (liqRange: string[]) => {
      const range: LlammaLiquididationRange = {
        price1: [],
        price2: [],
      }

      // if a pool only has oracle price data, use that
      const chartArray = currentChart.data.length !== 0 ? currentChart.data : currentChart.oraclePriceData

      for (const data of chartArray) {
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
      if (liqRangesMapper[formValues.n].prices.length !== 0) {
        const currentPrices = liqRangesMapper[formValues.n].prices

        if (currentPrices.length !== 0) {
          // flip order to match other data
          liqRanges.new = formatRange([currentPrices[1], currentPrices[0]])
        }
      } else {
        const currentPrices = loanCreateLeverageDetailInfo?.prices

        if (currentPrices) {
          liqRanges.new = formatRange([currentPrices[0], currentPrices[1]])
        }
      }
    }

    // current loan prices
    if (userPrices && currentChart.data) {
      liqRanges.current = formatRange(userPrices)
    }
    // increase loan prices
    if (borrowMorePrices && borrowMorePrices.length !== 0 && currentChart.data) {
      liqRanges.new = formatRange(borrowMorePrices)
    }
    // decrease loan prices
    if (repayLoanPrices && repayLoanPrices.length !== 0 && currentChart.data) {
      liqRanges.new = formatRange(repayLoanPrices)
    }
    // increase collateral prices
    if (addCollateralPrices && addCollateralPrices.length !== 0 && currentChart.data) {
      liqRanges.new = formatRange(addCollateralPrices)
    }
    // decrease collateral prices
    if (removeCollateralPrices && removeCollateralPrices.length !== 0 && currentChart.data) {
      liqRanges.new = formatRange(removeCollateralPrices)
    }
    // // deleverage prices
    if (repayLeveragePrices && currentChart.data) {
      liqRanges.new = formatRange(repayLeveragePrices)
    }

    return liqRanges
  }, [
    formValues.n,
    liqRangesMapper,
    currentChart.data,
    currentChart.oraclePriceData,
    userPrices,
    borrowMorePrices,
    repayLoanPrices,
    addCollateralPrices,
    removeCollateralPrices,
    repayLeveragePrices,
    loanCreateLeverageDetailInfo?.prices,
  ])

  const coins: LendingMarketTokens = useMemo(
    () =>
      market
        ? {
            borrowedToken: {
              symbol: market?.borrowed_token.symbol,
              address: market?.borrowed_token.address,
            },
            collateralToken: {
              symbol: market?.collateral_token.symbol,
              address: market?.collateral_token.address,
            },
          }
        : null,
    [market],
  )

  const selectChartList = useMemo(() => {
    if (chartOraclePoolOhlc.fetchStatus === 'LOADING') {
      return [{ label: t`Loading` }, { label: t`Loading` }]
    }

    if (market) {
      if (chartOraclePoolOhlc.dataDisabled) {
        return [{ label: t`${coins?.collateralToken.symbol} / ${coins?.borrowedToken.symbol} (LLAMMA)` }]
      }

      return [
        {
          label: t`${chartOraclePoolOhlc.collateralToken.symbol} / ${chartOraclePoolOhlc.borrowedToken.symbol}`,
        },
        {
          label: t`${coins?.collateralToken.symbol} / ${coins?.borrowedToken.symbol} (LLAMMA)`,
        },
      ]
    } else {
      return []
    }
  }, [
    chartOraclePoolOhlc.borrowedToken.symbol,
    chartOraclePoolOhlc.collateralToken.symbol,
    chartOraclePoolOhlc.dataDisabled,
    chartOraclePoolOhlc.fetchStatus,
    coins?.borrowedToken.symbol,
    coins?.collateralToken.symbol,
    market,
  ])

  // set chart selected index to llamma if oracle pool is disabled due to no oracle pools being found for market on the api
  useEffect(() => {
    if (chartOraclePoolOhlc.dataDisabled) {
      setChartSelectedIndex(1)
    }
  }, [chartOraclePoolOhlc.dataDisabled, setChartSelectedIndex])

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

  const refetchPricesData = useCallback(() => {
    if (market?.addresses.controller) {
      void fetchOraclePoolOhlcData(
        rChainId,
        market.addresses.controller,
        chartInterval,
        timeUnit,
        chartTimeSettings.start,
        chartTimeSettings.end,
      )
    }
    if (market?.addresses.amm) {
      void fetchLlammaOhlcData(
        rChainId,
        rOwmId,
        market.addresses.amm,
        chartInterval,
        timeUnit,
        chartTimeSettings.start,
        chartTimeSettings.end,
      )
    }
  }, [
    chartInterval,
    chartTimeSettings.end,
    chartTimeSettings.start,
    fetchLlammaOhlcData,
    fetchOraclePoolOhlcData,
    market?.addresses.amm,
    market?.addresses.controller,
    rChainId,
    rOwmId,
    timeUnit,
  ])

  /*
   * Fetch both oracle and llamma data at once in order to have access to volume data in
   * the oracle pools based ohlc chart.
   */
  useEffect(() => {
    if (market !== undefined) {
      refetchPricesData()
    }
  }, [market, refetchPricesData])

  const fetchMoreChartData = useCallback(
    (lastFetchEndTime: number) => {
      const endTime = subtractTimeUnit(timeOption, lastFetchEndTime)
      const startTime = getThreeHundredResultsAgo(timeOption, endTime)

      if (market?.addresses.controller && market?.addresses.amm) {
        void fetchMoreData(
          rChainId,
          market?.addresses.controller,
          market?.addresses.amm,
          chartInterval,
          timeUnit,
          startTime,
          endTime,
        )
      }
    },
    [timeOption, fetchMoreData, rChainId, market?.addresses.amm, market?.addresses.controller, chartInterval, timeUnit],
  )

  if (ohlcDataUnavailable) {
    setChartExpanded(false)

    return (
      <StyledAlertBox alertType="">
        <TextCaption isCaps isBold>
          {t`Ohlc chart data and pool activity is not yet available for this market.`}
        </TextCaption>
      </StyledAlertBox>
    )
  }

  const ChartWrapperProps: ChartWrapperProps = {
    chartType: 'crvusd',
    chartStatus: currentChart.fetchStatus,
    chartHeight,
    chartExpanded,
    betaBackgroundColor,
    themeType: theme,
    ohlcData: currentChart.data,
    volumeData: chartLlammaOhlc.volumeData,
    oraclePriceData,
    liquidationRange: selectedLiqRange,
    timeOption,
    selectedChartIndex,
    setChartSelectedIndex,
    selectChartList,
    setChartTimeOption,
    refetchPricesData,
    refetchingCapped: currentChart.refetchingCapped,
    fetchMoreChartData,
    lastFetchEndTime: currentChart.lastFetchEndTime,
    toggleLiqRangeCurrentVisible,
    toggleLiqRangeNewVisible,
    toggleOraclePriceVisible,
    liqRangeCurrentVisible,
    liqRangeNewVisible,
    oraclePriceVisible,
    latestOraclePrice: oraclePrice,
  }

  return chartExpanded ? (
    <ExpandedWrapper activityHidden={activityHidden}>
      <Wrapper variant={'secondary'} chartExpanded={chartExpanded}>
        <ChartWrapper {...ChartWrapperProps} chartExpanded={chartExpanded} />
      </Wrapper>
      <LpEventsWrapperExpanded>
        {market && <PoolActivity poolAddress={market.addresses.amm} chainId={rChainId} coins={coins} />}
      </LpEventsWrapperExpanded>
    </ExpandedWrapper>
  ) : (
    <Wrapper chartExpanded={chartExpanded}>
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
      {poolInfo === 'poolActivity' && market && (
        <PoolActivity poolAddress={market.addresses.amm} chainId={rChainId} coins={coins} />
      )}
      {poolInfo === 'chart' && <ChartWrapper {...ChartWrapperProps} chartExpanded={chartExpanded} />}
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

const StyledAlertBox = styled(AlertBox)`
  align-items: center;
  display: flex;
  justify-content: center;
  margin: var(--spacing-narrow) 0;
`

export default ChartOhlcWrapper
