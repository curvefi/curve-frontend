import { useCallback, useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import PoolActivity from '@/loan/components/ChartOhlcWrapper/PoolActivity'
import useStore from '@/loan/store/useStore'
import AlertBox from '@ui/AlertBox'
import Box from '@ui/Box'
import Button from '@ui/Button'
import ChartWrapper, { type ChartWrapperProps } from '@ui/Chart/ChartWrapper'
import type { LiquidationRanges, LlammaLiquididationRange } from '@ui/Chart/types'
import { getThreeHundredResultsAgo, subtractTimeUnit } from '@ui/Chart/utils'
import Icon from '@ui/Icon'
import TextCaption from '@ui/TextCaption'
import { useUserProfileStore } from '@ui-kit/features/user-profile'
import { t } from '@ui-kit/lib/i18n'
import { ChartOhlcWrapperProps, LlammaLiquidityCoins } from './types'

const ChartOhlcWrapper = ({ rChainId, llamma, llammaId }: ChartOhlcWrapperProps) => {
  const address = llamma?.address ?? ''
  const controller = llamma?.controller ?? ''
  const increaseActiveKey = useStore((state) => state.loanIncrease.activeKey)
  const decreaseActiveKey = useStore((state) => state.loanDecrease.activeKey)
  const deleverageActiveKey = useStore((state) => state.loanDeleverage.activeKey)
  const collateralIncreaseActiveKey = useStore((state) => state.loanCollateralIncrease.activeKey)
  const collateralDecreaseActiveKey = useStore((state) => state.loanCollateralDecrease.activeKey)
  const formValues = useStore((state) => state.loanCreate.formValues)
  const activeKeyLiqRange = useStore((state) => state.loanCreate.activeKeyLiqRange)
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
  const chartLlammaOhlc = useStore((state) => state.ohlcCharts.chartLlammaOhlc)
  const chartOraclePoolOhlc = useStore((state) => state.ohlcCharts.chartOraclePoolOhlc)
  const timeOption = useStore((state) => state.ohlcCharts.timeOption)
  const setChartTimeOption = useStore((state) => state.ohlcCharts.setChartTimeOption)
  const fetchLlammaOhlcData = useStore((state) => state.ohlcCharts.fetchLlammaOhlcData)
  const fetchOracleOhlcData = useStore((state) => state.ohlcCharts.fetchOracleOhlcData)
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
  const priceInfo = useStore((state) => state.loans.detailsMapper[llammaId]?.priceInfo ?? null)

  const { oraclePrice } = priceInfo ?? {}
  const [poolInfo, setPoolInfo] = useState<'chart' | 'poolActivity'>('chart')
  const [selectedChartIndex, setChartSelectedIndex] = useState(0)

  const chartOhlcObject = selectedChartIndex === 0 ? chartOraclePoolOhlc : chartLlammaOhlc
  const ohlcDataUnavailable = chartLlammaOhlc.dataDisabled && chartOraclePoolOhlc.dataDisabled

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

      for (const data of chartOhlcObject.data) {
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
    if (formValues.n && liqRangesMapper && chartOhlcObject.data) {
      const currentPrices = liqRangesMapper[formValues.n].prices

      if (currentPrices.length !== 0) {
        // flip order to match other data
        liqRanges.new = formatRange([currentPrices[1], currentPrices[0]])
      }
    }

    // current loan prices
    if (userPrices && chartOhlcObject.data) {
      liqRanges.current = formatRange(userPrices)
    }
    // increase loan prices
    if (increaseLoanPrices && increaseLoanPrices.length !== 0 && chartOhlcObject.data) {
      liqRanges.new = formatRange(increaseLoanPrices)
    }
    // decrease loan prices
    if (decreaseLoanPrices && decreaseLoanPrices.length !== 0 && chartOhlcObject.data) {
      liqRanges.new = formatRange(decreaseLoanPrices)
    }
    // increase collateral prices
    if (increaseCollateralPrices && increaseCollateralPrices.length !== 0 && chartOhlcObject.data) {
      liqRanges.new = formatRange(increaseCollateralPrices)
    }
    // decrease collateral prices
    if (decreaseCollateralPrices && decreaseCollateralPrices.length !== 0 && chartOhlcObject.data) {
      liqRanges.new = formatRange(decreaseCollateralPrices)
    }

    // deleverage prices
    if (deleveragePrices && chartOhlcObject.data) {
      liqRanges.new = formatRange(deleveragePrices)
    }

    return liqRanges
  }, [
    formValues.n,
    liqRangesMapper,
    chartOhlcObject.data,
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

  const selectChartList = useMemo(() => {
    if (chartOraclePoolOhlc.fetchStatus === 'LOADING') {
      return [{ label: t`Loading` }, { label: t`Loading` }]
    }

    if (chartOraclePoolOhlc.dataDisabled) {
      return [{ label: t`${coins?.collateral.symbol} / crvUSD (LLAMMA)` }]
    }

    return [
      {
        label: t`${chartOraclePoolOhlc.collateralToken.symbol} / ${chartOraclePoolOhlc.borrowedToken.symbol}`,
      },
      {
        label: t`${coins?.collateral.symbol} / crvUSD (LLAMMA)`,
      },
    ]
  }, [
    chartOraclePoolOhlc.borrowedToken.symbol,
    chartOraclePoolOhlc.collateralToken.symbol,
    chartOraclePoolOhlc.dataDisabled,
    chartOraclePoolOhlc.fetchStatus,
    coins?.collateral.symbol,
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

  /*
   * Fetch both oracle and llamma data at once in order to have access to volume data in
   * the oracle pools based ohlc chart.
   */
  const refetchPricesData = useCallback(() => {
    void fetchOracleOhlcData(
      rChainId,
      controller,
      chartInterval,
      timeUnit,
      chartTimeSettings.start,
      chartTimeSettings.end,
    )
    void fetchLlammaOhlcData(
      rChainId,
      llammaId,
      address,
      chartInterval,
      timeUnit,
      chartTimeSettings.start,
      chartTimeSettings.end,
    )
  }, [
    fetchOracleOhlcData,
    rChainId,
    controller,
    chartInterval,
    timeUnit,
    chartTimeSettings.start,
    chartTimeSettings.end,
    fetchLlammaOhlcData,
    llammaId,
    address,
  ])

  // fetch ohlc data
  useEffect(() => {
    if (llamma !== undefined) {
      refetchPricesData()
    }
  }, [llamma, refetchPricesData])

  const fetchMoreChartData = useCallback(
    (lastFetchEndTime: number) => {
      const endTime = subtractTimeUnit(timeOption, lastFetchEndTime)
      const startTime = getThreeHundredResultsAgo(timeOption, endTime)

      void fetchMoreData(rChainId, controller, address, chartInterval, timeUnit, +startTime, endTime)
    },
    [timeOption, fetchMoreData, rChainId, controller, address, chartInterval, timeUnit],
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
    chartStatus: llamma ? chartOhlcObject.fetchStatus : 'LOADING',
    chartHeight: chartHeight,
    chartExpanded: chartExpanded,
    themeType: theme,
    ohlcData: chartOhlcObject.data,
    volumeData: chartLlammaOhlc.volumeData,
    oraclePriceData: chartOhlcObject.oraclePriceData,
    liquidationRange: selectedLiqRange,
    timeOption: timeOption,
    selectChartList: selectChartList,
    setChartTimeOption: setChartTimeOption,
    refetchPricesData: refetchPricesData,
    refetchingCapped: chartOhlcObject.refetchingCapped,
    fetchMoreChartData: fetchMoreChartData,
    lastFetchEndTime: chartOhlcObject.lastFetchEndTime,
    toggleLiqRangeCurrentVisible: toggleLiqRangeCurrentVisible,
    toggleLiqRangeNewVisible: toggleLiqRangeNewVisible,
    toggleOraclePriceVisible: toggleOraclePriceVisible,
    liqRangeCurrentVisible: liqRangeCurrentVisible,
    liqRangeNewVisible: liqRangeNewVisible,
    oraclePriceVisible: oraclePriceVisible,
    latestOraclePrice: oraclePrice,
    selectedChartIndex: selectedChartIndex,
    setChartSelectedIndex: setChartSelectedIndex,
  }

  return chartExpanded ? (
    <ExpandedWrapper activityHidden={activityHidden}>
      <Wrapper variant={'secondary'} chartExpanded={chartExpanded}>
        <ChartWrapper {...ChartWrapperProps} />
      </Wrapper>
      <LpEventsWrapperExpanded>
        <PoolActivity poolAddress={address} chainId={rChainId} coins={coins} />
      </LpEventsWrapperExpanded>
    </ExpandedWrapper>
  ) : (
    <Wrapper className={isAdvancedMode ? '' : 'normal-mode'} chartExpanded={chartExpanded}>
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
      {poolInfo === 'chart' && <ChartWrapper {...ChartWrapperProps} />}
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

const StyledAlertBox = styled(AlertBox)`
  align-items: center;
  display: flex;
  justify-content: center;
  margin: var(--spacing-narrow) 0;
`

export default ChartOhlcWrapper
