import lodash from 'lodash'
import { ReactNode, useMemo, useState } from 'react'
import { ChartBandBalances } from '@/lend/components/ChartBandBalances'
import type { BrushStartEndIndex } from '@/lend/components/ChartBandBalances/types'
import { DEFAULT_BAND_CHART_DATA } from '@/lend/components/DetailsUser/utils'
import { useStore } from '@/lend/store/useStore'
import { PageContentProps, ParsedBandsBalances } from '@/lend/types/lend.types'
import { t } from '@ui-kit/lib/i18n'

export const DetailsLoanChartBalances = ({
  rChainId,
  rOwmId,
  market,
  selectorMenu,
}: Pick<PageContentProps, 'rChainId' | 'rOwmId' | 'market'> & {
  selectorMenu?: ReactNode
}) => {
  const statsBandsResp = useStore((state) => state.markets.statsBandsMapper[rChainId]?.[rOwmId])
  const loanPricesResp = useStore((state) => state.markets.pricesMapper[rChainId]?.[rOwmId])

  const [brushIndex, setBrushIndex] = useState<BrushStartEndIndex>({
    startIndex: undefined,
    endIndex: undefined,
  })

  const { bandsBalances } = statsBandsResp?.bands ?? {}
  const { oraclePrice, oraclePriceBand } = loanPricesResp?.prices ?? {}

  const chartBandBalancesData = useMemo(() => {
    if (!bandsBalances) return
    const data = lodash.cloneDeep(bandsBalances)
    if (data?.length > 0 && typeof oraclePriceBand === 'number') {
      const firstN = data[0].n
      const lastN = data[data.length - 1].n
      if (oraclePriceBand > +firstN) {
        if (+firstN + 1 !== oraclePriceBand) {
          // add a group of bands between lastN and oraclePriceBand
          data.unshift({ ...DEFAULT_BAND_CHART_DATA, n: `${+firstN + 1}...${oraclePriceBand - 1}`, isNGrouped: true })
        }
        data.unshift({ ...DEFAULT_BAND_CHART_DATA, isOraclePriceBand: true, n: `${oraclePriceBand}` })
      } else if (oraclePriceBand < +lastN) {
        if (+lastN - 1 !== oraclePriceBand) {
          // add a group of bands between lastN and oraclePriceBand
          data.push({ ...DEFAULT_BAND_CHART_DATA, n: `${+lastN - 1}...${oraclePriceBand + 1}`, isNGrouped: true })
        }
        data.push({ ...DEFAULT_BAND_CHART_DATA, isOraclePriceBand: true, n: `${oraclePriceBand}` })
      }
    }
    return data
  }, [bandsBalances, oraclePriceBand])

  const parsedChartBandBalancesData = useMemo(() => {
    setBrushIndex({ startIndex: undefined, endIndex: undefined })
    return chartBandBalancesData && _parseData(chartBandBalancesData)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chartBandBalancesData?.length])

  return (
    <ChartBandBalances
      rChainId={rChainId}
      rOwmId={rOwmId}
      market={market}
      brushIndex={brushIndex}
      data={parsedChartBandBalancesData}
      oraclePrice={oraclePrice}
      oraclePriceBand={oraclePriceBand}
      showLiquidationIndicator={false}
      title={selectorMenu ?? t`Bands`}
      setBrushIndex={setBrushIndex}
    />
  )
}

function _findDataIndex(d: ParsedBandsBalances) {
  return (
    +d.collateral !== 0 ||
    +d.collateralUsd !== 0 ||
    d.isLiquidationBand ||
    d.isOraclePriceBand ||
    +d.borrowed ||
    d.isNGrouped
  )
}

// show +-50 active data if it is not user Chart
function _parseData(data: ParsedBandsBalances[]) {
  const firstDataIdx = data.findIndex(_findDataIndex)
  const lastDataIdx = data.findLastIndex(_findDataIndex)
  return data.slice(firstDataIdx, lastDataIdx + 1)
}
