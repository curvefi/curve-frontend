import { useMemo } from 'react'
import AlertBox from '@ui/AlertBox'
import type { AlertBoxProps } from '@ui/AlertBox/types'
import { t } from '@ui-kit/lib/i18n'

export enum FormError {
  // vault

  // repay
  FullRepaymentRequired = 'error-full-repayment-required',

  // all
  API = 'error-api',
  ExistingLoan = 'error-existing-loan',
  EstGasApproval = 'error-est-gas-approval',
  InvalidProvider = 'error-invalid-provider',
  WalletBalances = 'error-wallet-balances',
  StepApprove = 'error-step-approve',
  LiquidationMode = 'error-liquidation-mode',
  TotalSupply = 'error-total-supply',
}

interface Props extends Omit<AlertBoxProps, 'alertType'> {
  errorKey: FormError | string
}

// generate message that only display if it cannot get error message from api.
const AlertFormError = ({ errorKey, ...props }: Props) => {
  const errorMessage = useMemo(() => {
    // locale will update inside component
    const messages: { [key: FormError | string]: string } = {
      // vault
      [FormError.API]: t`Unable to get data from api`,

      // all
      [FormError.ExistingLoan]: t`Unable to check if loan existed`,
      [FormError.WalletBalances]: t`Unable to get wallet balances`,
      [FormError.EstGasApproval]: t`Unable to get approval or estimated gas`,
      [FormError.InvalidProvider]: t`Unable to find provider`,
      [FormError.StepApprove]: t`Unable to approve spending`,
      [FormError.LiquidationMode]: t`You cannot adjust your collateral while in liquidation mode. Your options are repayment or self-liquidation.`,
      [FormError.TotalSupply]: t`Unable to get total supply`,
    }

    if (errorKey) {
      return messages[errorKey] ?? errorKey
    } else {
      return ''
    }
  }, [errorKey])

  return errorMessage ? (
    <AlertBox {...props} alertType="error">
      {errorMessage}
    </AlertBox>
  ) : null
}

export default AlertFormError
