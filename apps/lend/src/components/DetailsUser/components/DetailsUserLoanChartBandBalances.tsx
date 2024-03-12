import type { BrushStartEndIndex } from '@/components/ChartBandBalances/types'

import { useEffect, useMemo, useState } from 'react'
import { t } from '@lingui/macro'
import cloneDeep from 'lodash/cloneDeep'
import useStore from '@/store/useStore'

import { DEFAULT_BAND_CHART_DATA } from '@/components/DetailsUser/utils'
import ChartBandBalances from '@/components/ChartBandBalances'

const DetailsUserLoanChartBandBalances = ({
  rChainId,
  rOwmId,
  borrowed_token,
  collateral_token,
}: Pick<PageContentProps, 'rChainId' | 'rOwmId' | 'borrowed_token' | 'collateral_token'>) => {
  const loansPrices = useStore((state) => state.markets.pricesMapper[rChainId]?.[rOwmId])
  const loansStatsBands = useStore((state) => state.markets.statsBandsMapper[rChainId]?.[rOwmId])

  const [brushIndex, setBrushIndex] = useState<BrushStartEndIndex>({
    startIndex: undefined,
    endIndex: undefined,
  })

  const { bandsBalances, liquidationBand } = loansStatsBands?.bands ?? {}
  const { oraclePrice, oraclePriceBand } = loansPrices?.prices ?? {}

  const chartBandBalancesData = useMemo(() => {
    const data = cloneDeep(bandsBalances ?? [])
    if (data.length > 0 && typeof oraclePriceBand === 'number') {
      const firstN = data[0].n
      const lastN = data[data.length - 1].n
      if (oraclePriceBand > +firstN) {
        if (+firstN + 1 !== oraclePriceBand) {
          // add a group of bands between lastN and oraclePriceBand
          const n1 = +firstN + 1
          const n2 = oraclePriceBand - 1
          const showN1 = n1 === n2
          data.unshift({ ...DEFAULT_BAND_CHART_DATA, n: showN1 ? `${n1}` : `${n1}...${n2}`, isNGrouped: !showN1 })
        }
        data.unshift({ ...DEFAULT_BAND_CHART_DATA, isOraclePriceBand: true, n: `${oraclePriceBand}` })
      } else if (oraclePriceBand < +lastN) {
        if (+lastN - 1 !== oraclePriceBand) {
          // add a group of bands between lastN and oraclePriceBand
          const n1 = +lastN - 1
          const n2 = oraclePriceBand + 1
          const showN1 = n1 === n2
          data.push({ ...DEFAULT_BAND_CHART_DATA, n: showN1 ? `${n1}` : `${n1}...${n2}`, isNGrouped: !showN1 })
        }
        data.push({ ...DEFAULT_BAND_CHART_DATA, isOraclePriceBand: true, n: `${oraclePriceBand}` })
      }
    }
    return data
  }, [bandsBalances, oraclePriceBand])

  useEffect(() => {
    setBrushIndex({ startIndex: undefined, endIndex: undefined })
  }, [chartBandBalancesData])

  return (
    <ChartBandBalances
      rChainId={rChainId}
      rOwmId={rOwmId}
      borrowed_token={borrowed_token}
      collateral_token={collateral_token}
      brushIndex={brushIndex}
      data={chartBandBalancesData}
      oraclePrice={oraclePrice}
      oraclePriceBand={oraclePriceBand}
      showLiquidationIndicator={!!liquidationBand}
      title={t`Bands`}
      setBrushIndex={setBrushIndex}
    />
  )
}

export default DetailsUserLoanChartBandBalances
