import { ReactNode, useEffect, useMemo, useState } from 'react'
import ChartBandBalances from '@/loan/components/ChartBandBalances'
import type { BrushStartEndIndex } from '@/loan/components/ChartBandBalances/types'
import { useUserLoanDetails } from '@/loan/hooks/useUserLoanDetails'
import useStore from '@/loan/store/useStore'
import { Llamma } from '@/loan/types/loan.types'
import { t } from '@ui-kit/lib/i18n'

const DEFAULT_BAND_CHART_DATA = {
  collateral: '0',
  collateralUsd: '0',
  isLiquidationBand: '',
  isOraclePriceBand: false,
  isNGrouped: false,
  n: '',
  p_up: '0',
  p_down: '0',
  pUpDownMedian: '',
  stablecoin: '0',
  collateralStablecoinUsd: 0,
}

const ChartUserBands = ({
  llammaId,
  llamma,
  selectorMenu,
}: {
  llammaId: string
  llamma: Llamma | null
  selectorMenu?: ReactNode
}) => {
  const loanDetails = useStore((state) => state.loans.detailsMapper[llammaId])
  const { userBandsBalances, userLiquidationBand } = useUserLoanDetails(llammaId) ?? {}

  const [brushIndex, setBrushIndex] = useState<BrushStartEndIndex>({
    startIndex: undefined,
    endIndex: undefined,
  })

  const { oraclePrice, oraclePriceBand } = loanDetails?.priceInfo ?? {}

  const chartBandBalancesData = useMemo(() => {
    const data = [...(userBandsBalances ?? [])]

    if (!data || data.length === 0 || oraclePriceBand === undefined || oraclePriceBand === null) return data

    const firstN = data[0].n
    const lastN = data[data.length - 1].n
    const oracleBand = Number(oraclePriceBand)

    if (oracleBand > +firstN) {
      if (+firstN + 1 !== oracleBand) {
        // add a group of bands between lastN and oraclePriceBand
        const n1 = +firstN + 1
        const n2 = oracleBand - 1
        const showN1 = n1 === n2
        data.unshift({ ...DEFAULT_BAND_CHART_DATA, n: showN1 ? `${n1}` : `${n1}...${n2}`, isNGrouped: !showN1 })
      }
      data.unshift({ ...DEFAULT_BAND_CHART_DATA, isOraclePriceBand: true, n: `${oracleBand}` })
    } else if (oracleBand < +lastN) {
      if (+lastN - 1 !== oracleBand) {
        // add a group of bands between lastN and oraclePriceBand
        const n1 = +lastN - 1
        const n2 = oracleBand + 1
        const showN1 = n1 === n2
        data.push({ ...DEFAULT_BAND_CHART_DATA, n: showN1 ? `${n1}` : `${n1}...${n2}`, isNGrouped: !showN1 })
      }
      data.push({ ...DEFAULT_BAND_CHART_DATA, isOraclePriceBand: true, n: `${oracleBand}` })
    }

    return data
  }, [userBandsBalances, oraclePriceBand])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setBrushIndex({ startIndex: undefined, endIndex: undefined })
  }, [chartBandBalancesData])

  return (
    <ChartBandBalances
      brushIndex={brushIndex}
      data={chartBandBalancesData}
      market={llamma}
      oraclePrice={oraclePrice}
      oraclePriceBand={oraclePriceBand}
      showLiquidationIndicator={!!userLiquidationBand}
      title={selectorMenu ?? t`Bands`}
      setBrushIndex={setBrushIndex}
    />
  )
}

export default ChartUserBands
