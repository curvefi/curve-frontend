import cloneDeep from 'lodash/cloneDeep'
import { useEffect, useMemo, useState } from 'react'
import ChartBandBalances from '@/lend/components/ChartBandBalances'
import type { BrushStartEndIndex } from '@/lend/components/ChartBandBalances/types'
import { DEFAULT_BAND_CHART_DATA } from '@/lend/components/DetailsUser/utils'
import { helpers } from '@/lend/lib/apiLending'
import useStore from '@/lend/store/useStore'
import { PageContentProps } from '@/lend/types/lend.types'
import { t } from '@ui-kit/lib/i18n'

const DetailsUserLoanChartBandBalances = ({
  rChainId,
  rOwmId,
  api,
  market,
}: Pick<PageContentProps, 'api' | 'rChainId' | 'rOwmId' | 'market'>) => {
  const loansPrices = useStore((state) => state.markets.pricesMapper[rChainId]?.[rOwmId])
  const loansStatsBands = useStore((state) => state.markets.statsBandsMapper[rChainId]?.[rOwmId])
  const userActiveKey = helpers.getUserActiveKey(api, market!)
  const userLoanDetails = useStore((state) => state.user.loansDetailsMapper[userActiveKey])

  const [brushIndex, setBrushIndex] = useState<BrushStartEndIndex>({
    startIndex: undefined,
    endIndex: undefined,
  })

  const { bandsBalances } = userLoanDetails?.details ?? {}
  const { liquidationBand } = loansStatsBands?.bands ?? {}
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
      market={market}
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
