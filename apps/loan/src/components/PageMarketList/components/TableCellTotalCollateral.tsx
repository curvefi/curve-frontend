import { t } from '@lingui/macro'
import isUndefined from 'lodash/isUndefined'
import styled from 'styled-components'

import { formatNumber, getFractionDigitsOptions } from '@/ui/utils'
import { getTokenName } from '@/utils/utilsLoan'
import useStore from '@/store/useStore'

import { Chip } from '@/ui/Typography'

type Props = {
  llamma: Llamma | undefined
  loanDetails: Partial<LoanDetails> | undefined
}

const TableCellTotalCollateral = ({ llamma, loanDetails }: Props) => {
  const { totalCollateral, totalStablecoin } = loanDetails ?? {}
  const collateralUsdRate = useStore((state) => state.usdRates.tokens[llamma?.collateral ?? ''])

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

  const totalCollateralUsd = Number(totalCollateral) * Number(collateralUsdRate)
  const totalCollateralValue = (totalCollateralUsd + Number(totalStablecoin)).toString()

  return (
    <Chip
      size="md"
      tooltip={
        llamma ? (
          <TooltipTable>
            <tbody>
              <tr>
                <th>{getTokenName(llamma).stablecoin}</th>
                <td className="right">
                  {formatNumber(totalStablecoin, { ...getFractionDigitsOptions(totalStablecoin, 2) })}
                </td>
              </tr>
              <tr>
                <th>{getTokenName(llamma).collateral}</th>
                <td className="right">
                  {formatNumber(totalCollateralUsd, { ...getFractionDigitsOptions(totalCollateralUsd, 2) })}
                </td>
              </tr>
              <tr>
                <td colSpan={2} className="right" style={{ borderTop: '1px solid var(--border-600)' }}>
                  ≈ {formatNumber(totalCollateralValue, { ...getFractionDigitsOptions(totalCollateralValue, 2) })}
                </td>
              </tr>
            </tbody>
          </TooltipTable>
        ) : null
      }
      tooltipProps={{ placement: 'bottom end' }}
    >
      {formatNumber(totalCollateralValue, { notation: 'compact', currency: 'USD' })}
    </Chip>
  )
}

const TooltipTable = styled.table`
  width: 100%;

  td {
    padding: 0.2rem;
  }
`

export default TableCellTotalCollateral
