import { useMemo } from 'react'
import { FormError } from '@/lend/types/lend.types'
import { AlertBox } from '@ui/AlertBox'
import type { AlertBoxProps } from '@ui/AlertBox/types'
import { t } from '@ui-kit/lib/i18n'

interface Props extends Omit<AlertBoxProps, 'alertType'> {
  errorKey: FormError | string
}

// generate message that only display if it cannot get error message from api.
export const AlertFormError = ({ errorKey, ...props }: Props) => {
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
