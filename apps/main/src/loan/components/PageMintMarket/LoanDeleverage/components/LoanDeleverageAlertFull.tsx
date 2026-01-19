import { styled } from 'styled-components'
import type { FormValues } from '@/loan/components/PageMintMarket/LoanDeleverage/types'
import { Llamma, UserLoanDetails } from '@/loan/types/loan.types'
import { getTokenName } from '@/loan/utils/utilsLoan'
import { Box } from '@ui/Box'
import { DetailInfo } from '@ui/DetailInfo'
import { formatNumber, getFractionDigitsOptions } from '@ui/utils'
import { t } from '@ui-kit/lib/i18n'

// Deleverage full repayment will result in the following changes to user wallet:
// 1. wallet.collateral = userState.collateral - formValues.collateral
// 2. wallet.crvusd ~= (received stablecoin + userState.stablecoin) - debt
export const LoanDeleverageAlertFull = ({
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
  const { collateral: collateralName, stablecoin: stablecoinName } = getTokenName(llamma)
  const collateralBalance = +userState.collateral - +formValues.collateral
  const stablecoinBalance = +receivedStablecoin + +userState.stablecoin - +userState.debt
  const fCollateralBalance = `${format(collateralBalance)} ${collateralName}`
  const fStablecoinBalance = `${format(stablecoinBalance)} ${stablecoinName}`
  const fReceivedStablecoin = `${format(receivedStablecoin)} ${stablecoinName}`
  const fUserStateStablecoin = `${format(userState.stablecoin)} ${stablecoinName}`
  const fUserStateDebt = `${format(userState.debt)}  ${stablecoinName}`
  const totalStablecoin = `${format(+receivedStablecoin + +userState.stablecoin)} ${stablecoinName}`

  return (
    <Wrapper grid gridRowGap={2} padding="0 1rem 0 0">
      <p>{t`Your loan will be paid off`}</p>
      <DetailInfo label={t`Debt:`}>{fUserStateDebt}</DetailInfo>

      {/* stablecoin total */}
      <DetailInfoStablecoinBalanceWrapper>
        <DetailInfo label={t`Receive:`}>{fReceivedStablecoin}</DetailInfo>
        {+userState.stablecoin > 0 && (
          <>
            <DetailInfo label="LLAMMA:">{fUserStateStablecoin}</DetailInfo>
            <DetailInfo label="" isDivider isBold>
              {totalStablecoin}
            </DetailInfo>
          </>
        )}
      </DetailInfoStablecoinBalanceWrapper>

      {/* remaining balance */}
      {(collateralBalance > 0 || stablecoinBalance > 0) && (
        <DetailInfoReturnToWalletWrapper label={t`Return to wallet:`} isBold={false}>
          {collateralBalance > 0 && stablecoinBalance > 0 ? (
            <>
              {fCollateralBalance}
              <br />≈{fStablecoinBalance}
            </>
          ) : collateralBalance > 0 ? (
            <>{fCollateralBalance}</>
          ) : stablecoinBalance > 0 ? (
            <>≈{fStablecoinBalance}</>
          ) : (
            ''
          )}
        </DetailInfoReturnToWalletWrapper>
      )}
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

const DetailInfoReturnToWalletWrapper = styled(DetailInfo)`
  align-items: flex-start;
`
