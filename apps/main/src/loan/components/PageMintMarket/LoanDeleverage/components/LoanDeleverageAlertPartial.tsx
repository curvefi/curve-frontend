import { styled } from 'styled-components'
import type { FormValues } from '@/loan/components/PageMintMarket/LoanDeleverage/types'
import { Llamma, UserLoanDetails } from '@/loan/types/loan.types'
import { getTokenName } from '@/loan/utils/utilsLoan'
import { Box } from '@ui/Box'
import { DetailInfo } from '@ui/DetailInfo'
import { Icon } from '@ui/Icon'
import { formatNumber, getFractionDigitsOptions } from '@ui/utils'
import { t } from '@ui-kit/lib/i18n'

// Deleverage partial payment will only result in state change, user will not receive any tokens to wallet.
// 1. userState.collateral = old userState.collateral - formValues.collateral
// 2. userState.debt ~= old userState.debt - received stablecoin
export const LoanDeleverageAlertPartial = ({
  receivedStablecoin,
  formValues,
  llamma,
  userState,
}: {
  receivedStablecoin: string
  formValues: FormValues
  llamma: Llamma
  userState: UserLoanDetails['userState']
}) => {
  const format = (val: string | number) => formatNumber(val, { ...getFractionDigitsOptions(val, 2) })
  const collateralBalance = +userState.collateral - +formValues.collateral
  const debtBalance = +userState.debt - +receivedStablecoin
  const { collateral: collateralName, stablecoin: stablecoinName } = getTokenName(llamma)
  const fCollateralBalance = `${format(collateralBalance)} ${collateralName}`
  const fDebtBalance = `${format(debtBalance)} ${stablecoinName}`

  return (
    <Wrapper grid gridRowGap={2} padding="0 1rem 0 0">
      <p>{t`Partial repayment LLAMMA changes:`}</p>

      {/* AMM state change */}
      <DetailInfoStablecoinBalanceWrapper>
        <DetailInfo label={t`Collateral:`}>
          {format(userState.collateral)} <ToIcon size={16} name="ArrowRight" /> <strong>{fCollateralBalance}</strong>
        </DetailInfo>
        <DetailInfoDebt label={t`Debt:`} isDivider>
          <div>
            {format(userState.debt)} <ToIcon size={16} name="ArrowRight" className="svg-arrow" /> ≈
            <strong>{fDebtBalance}</strong>
          </div>
        </DetailInfoDebt>
      </DetailInfoStablecoinBalanceWrapper>
    </Wrapper>
  )
}

const Wrapper = styled(Box)`
  width: 100%;
`

const DetailInfoStablecoinBalanceWrapper = styled(Box)`
  > div {
    min-height: 1.25rem;
  }
`

const DetailInfoDebt = styled(DetailInfo)`
  > span {
    margin-top: 3px;
    height: 100%;
  }
`

const ToIcon = styled(Icon)`
  width: 10px;
  margin: 0 2px;
`
