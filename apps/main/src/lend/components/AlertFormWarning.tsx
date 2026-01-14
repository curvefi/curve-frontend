import { useMemo } from 'react'
import { AlertType, FormWarning } from '@/lend/types/lend.types'
import { AlertBox } from '@ui/AlertBox/AlertBox'
import type { AlertBoxProps } from '@ui/AlertBox/types'
import { t } from '@ui-kit/lib/i18n'

interface Props extends Omit<AlertBoxProps, 'alertType'> {
  errorKey: FormWarning | string
}

export const AlertFormWarning = ({ errorKey, ...props }: Props) => {
  const errorMessage = useMemo(() => {
    const messages: { [key: FormWarning | string]: { message: string; alertType?: AlertType } } = {
      [FormWarning.FullRepaymentOnly]: {
        message: t`Only full repayment is allowed when in soft-liquidation mode.`,
      },
      [FormWarning.IsPayoffAmount]: {
        message: t`You will no longer be able to manage this loan once it is paid off.`,
      },
      [FormWarning.NotInLiquidationMode]: {
        message: t`You are not in liquidation mode.`,
      },
      [FormWarning.NotEnoughCrvusd]: {
        message: t`You do not have enough crvUSD for self-liquidation.`,
      },
    }

    if (errorKey) {
      return messages[errorKey] ?? { message: errorKey }
    } else {
      return null
    }
  }, [errorKey])

  return errorMessage ? (
    <AlertBox {...props} alertType={errorMessage.alertType ?? 'warning'}>
      {errorMessage.message}
    </AlertBox>
  ) : null
}
