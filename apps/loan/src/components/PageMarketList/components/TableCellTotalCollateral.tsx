import { useMemo } from 'react'
import { t } from '@lingui/macro'
import isUndefined from 'lodash/isUndefined'
import styled from 'styled-components'

import { formatNumber } from '@/ui/utils'
import { getTokenName } from '@/utils/utilsLoan'
import useStore from '@/store/useStore'

import { Chip } from '@/ui/Typography'
import Box from '@/ui/Box'
import TextCaption from '@/ui/TextCaption'

type Props = {
  rChainId: ChainId
  collateralId: string
}

const TableCellTotalCollateral = ({ rChainId, collateralId }: Props) => {
  const loanDetails = useStore((state) => state.loans.detailsMapper[collateralId])
  const llamma = useStore((state) => state.collaterals.collateralDatasMapper[rChainId]?.[collateralId]?.llamma)
  const collateralUsdRate = useStore((state) => state.usdRates.tokens[llamma?.collateral ?? ''])
  const isAdvanceMode = useStore((state) => state.isAdvanceMode)

  const { totalCollateral, totalStablecoin } = loanDetails ?? {}

  const totalCollateralUsd = Number(totalCollateral) * Number(collateralUsdRate)
  const totalCollateralValue = (totalCollateralUsd + Number(totalStablecoin)).toString()

  const tooltipContent = useMemo<{ label: string; value: string | number }[]>(() => {
    if (!llamma || !totalCollateralUsd || !totalStablecoin) return []

    const { collateral, stablecoin } = getTokenName(llamma)

    return [
      { label: collateral, value: totalCollateralUsd },
      { label: stablecoin, value: totalStablecoin },
    ]
  }, [llamma, totalCollateralUsd, totalStablecoin])

  if (isUndefined(totalCollateral) || isUndefined(totalStablecoin) || isUndefined(collateralUsdRate)) {
    return <></>
  }

  if (collateralUsdRate === 'NaN' || +collateralUsdRate === 0) {
    return (
      <Chip tooltip={t`Unable to get USD rate`} tooltipProps={{ placement: 'bottom end' }}>
        ?
      </Chip>
    )
  }

  return (
    <Box grid>
      {formatNumber(totalCollateralValue, { notation: 'compact', currency: 'USD' })}
      {isAdvanceMode && (
        <>
          {+totalCollateralValue > 0 && (
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
    </Box>
  )
}

const TotalSummary = styled(TextCaption)`
  margin-top: 0.2rem;
  white-space: nowrap;
`

export default TableCellTotalCollateral
