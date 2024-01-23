import { t } from '@lingui/macro'
import isUndefined from 'lodash/isUndefined'

import { formatNumber, getFractionDigitsOptions } from '@/ui/utils'
import { getTokenName } from '@/utils/utilsLoan'
import useStore from '@/store/useStore'

import { Chip } from '@/ui/Typography'
import Box from '@/ui/Box'

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
        <>
          {llamma ? (
            <Box gridGap={1} padding="0.25rem">
              {[
                { label: getTokenName(llamma).stablecoin, value: totalStablecoin },
                { label: getTokenName(llamma).collateral, value: totalCollateralUsd },
              ].map(({ label, value }) => (
                <Box key={label} grid gridTemplateColumns="repeat(2, minmax(100px, 1fr))" gridGap={1}>
                  <strong>{label}</strong>
                  {formatNumber(value, { ...getFractionDigitsOptions(value, 2) })}
                </Box>
              ))}
              <hr />
              <div>
                ≈ {formatNumber(totalCollateralValue, { ...getFractionDigitsOptions(totalCollateralValue, 2) })}
              </div>
            </Box>
          ) : null}
        </>
      }
    >
      {formatNumber(totalCollateralValue, { notation: 'compact', currency: 'USD' })}
    </Chip>
  )
}

export default TableCellTotalCollateral
