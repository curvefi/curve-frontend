import { ReactNode, useMemo, useState } from 'react'
import { ChartBandBalances } from '@/loan/components/ChartBandBalances'
import type { BrushStartEndIndex } from '@/loan/components/ChartBandBalances/types'
import { useStore } from '@/loan/store/useStore'
import { Llamma, BandsBalancesData } from '@/loan/types/loan.types'
import { t } from '@ui-kit/lib/i18n'

const DEFAULT_BAND_CHART_DATA = {
  collateral: '0',
  collateralUsd: '0',
  isLiquidationBand: '',
  isOraclePriceBand: false,
  isNGrouped: false,
  n: '',
  pUpDownMedian: '',
  p_up: '0',
  p_down: '0',
  stablecoin: '0',
  collateralStablecoinUsd: 0,
}

export const DetailsBandsChart = ({
  marketId,
  market,
  selectorMenu,
}: {
  marketId: string
  market: Llamma | null
  selectorMenu?: ReactNode
}) => {
  const loanDetails = useStore((state) => state.loans.detailsMapper[marketId])

  const [brushIndex, setBrushIndex] = useState<BrushStartEndIndex>({
    startIndex: undefined,
    endIndex: undefined,
  })

  const { bandsBalances, priceInfo } = loanDetails ?? {}
  const { oraclePrice, oraclePriceBand } = priceInfo ?? {}

  const chartBandBalancesData = useMemo(() => {
    const data = [...(bandsBalances ?? [])]
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

  const chartBandBalancesDataLength = chartBandBalancesData.length

  const parsedChartBandBalancesData = useMemo(() => {
    setBrushIndex({ startIndex: undefined, endIndex: undefined })
    return parseData(chartBandBalancesData)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chartBandBalancesDataLength])

  return (
    <ChartBandBalances
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

function findDataIndex(d: BandsBalancesData) {
  return (
    +d.collateral !== 0 ||
    +d.collateralUsd !== 0 ||
    d.isLiquidationBand ||
    d.isOraclePriceBand ||
    +d.stablecoin ||
    d.isNGrouped
  )
}

// show +-50 active data if it is not user Chart
function parseData(data: BandsBalancesData[]) {
  const firstDataIdx = data.findIndex(findDataIndex)
  const lastDataIdx = data.findLastIndex(findDataIndex)
  return data.slice(firstDataIdx, lastDataIdx + 1)
}
