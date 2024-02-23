import type { ChipProps } from '@/ui/Typography/types'

import { t } from '@lingui/macro'

import { formatNumber, getFractionDigitsOptions } from '@/ui/utils'
import useStore from '@/store/useStore'

import Box from '@/ui/Box'
import Chip from '@/ui/Typography/Chip'

const CellTotalCollateralValue = ({
  rChainId,
  rOwmId,
  ...props
}: ChipProps & {
  rChainId: ChainId
  rOwmId: string
}) => {
  const statsAmmBalances = useStore((state) => state.markets.statsAmmBalancesMapper[rChainId]?.[rOwmId])
  const owmData = useStore((state) => state.markets.owmDatasMapper[rChainId]?.[rOwmId])

  const collateralToken = owmData?.owm?.collateral_token?.address ?? ''
  const collateralUsdRate = useStore((state) => state.usdRates.tokens[collateralToken])

  if (collateralUsdRate === 'NaN' || +collateralUsdRate === 0) {
    return (
      <Chip {...props} tooltip={t`Unable to get USD rate`} tooltipProps={{ placement: 'top end' }}>
        ?
      </Chip>
    )
  }

  const { total, tooltipContent } = _getTotalCollateralValue(owmData, statsAmmBalances, collateralUsdRate)

  return (
    <Chip
      {...props}
      tooltipProps={{ placement: 'top end' }}
      tooltip={
        tooltipContent.length ? (
          <Box gridGap={1} padding="0.25rem">
            {tooltipContent.map(({ label, value }) => (
              <Box key={label} grid gridTemplateColumns="repeat(2, minmax(100px, 1fr))" gridGap={1}>
                <strong>{label}</strong>
                {formatNumber(value, { ...getFractionDigitsOptions(value, 2) })}
              </Box>
            ))}
            <hr />
            <div>≈ {formatNumber(total, { ...getFractionDigitsOptions(total, 2) })}</div>
          </Box>
        ) : null
      }
    >
      {formatNumber(total, { notation: 'compact', currency: 'USD' })}
    </Chip>
  )
}

function _getTotalCollateralValue(
  owmData: OWMData | undefined,
  statsBalances: MarketStatAmmBalances | undefined,
  collateralUsd: string | number
) {
  let resp = {
    total: '0',
    tooltipContent: [] as { label: string; value: string }[],
  }

  const { borrowed_token, collateral_token } = owmData?.owm ?? {}
  const { error, collateral, borrowed = '' } = statsBalances ?? {}

  if (collateralUsd === 'NaN' || +collateralUsd === 0 || error || typeof statsBalances === 'undefined') return resp

  const totalCollateralUsd = Number(collateral) * Number(collateralUsd)
  const total = totalCollateralUsd + Number(borrowed)

  resp.total = total.toString()
  resp.tooltipContent =
    total === 0
      ? []
      : [
          { label: borrowed_token?.symbol ?? '', value: borrowed },
          { label: collateral_token?.symbol ?? '', value: totalCollateralUsd.toString() },
        ]
  return resp
}

export default CellTotalCollateralValue
