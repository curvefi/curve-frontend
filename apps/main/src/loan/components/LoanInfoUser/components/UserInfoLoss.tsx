import { useMemo } from 'react'
import styled from 'styled-components'
import InpChipUsdRate from '@/loan/components/InpChipUsdRate'
import useStore from '@/loan/store/useStore'
import { Llamma } from '@/loan/types/loan.types'
import Box from '@ui/Box'
import TextCaption from '@ui/TextCaption'
import Chip from '@ui/Typography/Chip'
import { FORMAT_OPTIONS, formatNumber } from '@ui/utils'
import { t } from '@ui-kit/lib/i18n'

const SMALL_AMOUNT = 0.0001

const UserInfoLoss = ({
  llammaId,
  llamma,
  type,
}: {
  llammaId: string
  llamma: Llamma | null
  type: 'lossCollateral' | 'lossAmount' | 'lossPercent'
}) => {
  const userLoanDetails = useStore((state) => state.loans.userDetailsMapper[llammaId])

  const { current_collateral_estimation, deposited_collateral, loss, loss_pct } = userLoanDetails?.userLoss ?? {}

  const [_, collateralAddress] = llamma?.coinAddresses ?? []

  const diff = useMemo(() => {
    if (typeof current_collateral_estimation === 'undefined' || typeof deposited_collateral === 'undefined') return null
    return Math.abs(Number(deposited_collateral) - Number(current_collateral_estimation)).toString()
  }, [current_collateral_estimation, deposited_collateral])

  if (typeof userLoanDetails === 'undefined' || diff === null) {
    return <>-</>
  }

  if (type === 'lossCollateral') {
    const depositedCollateral = formatNumber(deposited_collateral, { trailingZeroDisplay: 'stripIfInteger' })
    const currentCollateralEst = formatNumber(current_collateral_estimation, { trailingZeroDisplay: 'stripIfInteger' })

    return (
      <Chip
        size="md"
        tooltip={
          <Box gridGap={3}>
            <Box gridGap={1} padding="0.25rem">
              <Box grid gridTemplateColumns="140px auto" gridGap={1}>
                <strong>Deposited</strong> <Value>{depositedCollateral}</Value>
              </Box>
              <Box grid gridTemplateColumns="140px auto" gridGap={1}>
                <strong>Current Bal. (est.)*</strong> <Value>- {currentCollateralEst}</Value>
              </Box>
              <hr />
              <div className="right">
                {formatNumber(diff)}
                <br />
                <InpChipUsdRate hideRate address={collateralAddress} amount={diff} />
              </div>
            </Box>
            <TextCaption>{t`*current balance minus losses`}</TextCaption>
          </Box>
        }
      >
        {`${currentCollateralEst}`} <TextCaption>/ {depositedCollateral}</TextCaption>
      </Chip>
    )
  }

  if (type === 'lossAmount') {
    return Number(loss) <= SMALL_AMOUNT || Number(loss) === 0 ? 0 : formatNumber(loss)
  }

  if (type === 'lossPercent') {
    return Number(loss_pct) <= SMALL_AMOUNT || Number(loss_pct) === 0
      ? 0
      : formatNumber(loss_pct, { ...FORMAT_OPTIONS.PERCENT })
  }

  return null
}

const Value = styled.div`
  text-align: right;
  white-space: nowrap;
`

export default UserInfoLoss
