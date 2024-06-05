import type { ChipProps } from '@/ui/Typography/types'

import styled from 'styled-components'

import { formatNumber } from '@/ui/utils'
import useStore from '@/store/useStore'

import Chip from '@/ui/Typography/Chip'
import TextCaption from '@/ui/TextCaption'

const CellTotalCollateralValue = ({
  rChainId,
  rOwmId,
  ...props
}: ChipProps & {
  rChainId: ChainId
  rOwmId: string
}) => {
  const isAdvanceMode = useStore((state) => state.isAdvanceMode)
  const ammBalance = useStore((state) => state.markets.statsAmmBalancesMapper[rChainId]?.[rOwmId])
  const owmData = useStore((state) => state.markets.owmDatasMapper[rChainId]?.[rOwmId])

  const [borrowedAddress, collateralAddress] = owmData?.owm?.coinAddresses ?? ['', '']
  const borrowedUsdRate = useStore((state) => state.usdRates.tokens[borrowedAddress])
  const collateralUsdRate = useStore((state) => state.usdRates.tokens[collateralAddress])

  const isError = borrowedUsdRate === 'NaN' || collateralUsdRate === 'NaN' || (!!ammBalance && !!ammBalance?.error)

  const { total, tooltipContent } = _getTotalCollateralValue(owmData, ammBalance, borrowedUsdRate, collateralUsdRate)

  return (
    <>
      {typeof ammBalance === 'undefined' ? null : isError ? (
        '?'
      ) : (
        <>
          <StyledChip {...props}>{formatNumber(total, { notation: 'compact', currency: 'USD' })}</StyledChip>
          {isAdvanceMode && (
            <>
              {+total > 0 && (
                <TotalSummary>
                  {' '}
                  {tooltipContent.map(({ label, value }, idx) => {
                    const isLast = tooltipContent.length - 1 === idx
                    return `${idx === 0 ? '' : ''}${formatNumber(value, { notation: 'compact' })} ${label}${
                      isLast ? '' : ' + '
                    }`
                  })}
                </TotalSummary>
              )}
            </>
          )}
        </>
      )}
    </>
  )
}

const StyledChip = styled(Chip)`
  display: block;
`

const TotalSummary = styled(TextCaption)`
  white-space: nowrap;
`

function _getTotalCollateralValue(
  owmData: OWMData | undefined,
  ammBalance: MarketStatAmmBalances | undefined,
  borrowedUsdRate: string | number,
  collateralUsdRate: string | number
) {
  let resp = {
    total: '',
    tooltipContent: [] as { label: string; value: string }[],
  }

  const { borrowed_token, collateral_token } = owmData?.owm ?? {}

  if (
    collateralUsdRate === 'NaN' ||
    borrowedUsdRate === 'NaN' ||
    typeof ammBalance === 'undefined' ||
    ammBalance.error ||
    typeof borrowedUsdRate === 'undefined' ||
    typeof collateralUsdRate === 'undefined'
  )
    return resp

  const borrowedUsd = +ammBalance.borrowed * +borrowedUsdRate
  const collateralUsd = +ammBalance.collateral * +collateralUsdRate
  const totalCollateralValueUsd = +borrowedUsd + +collateralUsd

  resp.total = totalCollateralValueUsd.toString()
  resp.tooltipContent =
    totalCollateralValueUsd === 0
      ? []
      : [
          { label: collateral_token?.symbol ?? '', value: ammBalance.collateral },
          { label: borrowed_token?.symbol ?? '', value: ammBalance.borrowed },
        ]
  return resp
}

export default CellTotalCollateralValue
