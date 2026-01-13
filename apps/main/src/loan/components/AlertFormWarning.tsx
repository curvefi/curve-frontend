import { useMemo } from 'react'
import { AlertType } from '@/loan/types/loan.types'
import { AlertBox } from '@ui/AlertBox'
import type { AlertBoxProps } from '@ui/AlertBox/types'
import { t } from '@ui-kit/lib/i18n'

const ALERT_FORM_WARNING_KEYS = {
  // loan deleverage
  'warning-full-repayment-only': 'warning-full-repayment-only',

  'warning-is-payoff-amount': 'warning-is-payoff-amount',
  'warning-not-in-liquidation-mode': 'warning-not-in-liquidation-mode',
  'warning-not-enough-crvusd': 'warning-not-enough-crvusd',
} as const

export type AlertFormWarningKey = keyof typeof ALERT_FORM_WARNING_KEYS

interface Props extends Omit<AlertBoxProps, 'alertType'> {
  errorKey: AlertFormWarningKey | string
}

export const AlertFormWarning = ({ errorKey, ...props }: Props) => {
  const errorMessage = useMemo(() => {
    const messages: { [key: AlertFormWarningKey | string]: { message: string; alertType?: AlertType } } = {
      [ALERT_FORM_WARNING_KEYS['warning-full-repayment-only']]: {
        message: t`Only full repayment is allowed when in soft-liquidation mode.`,
      },
      [ALERT_FORM_WARNING_KEYS['warning-is-payoff-amount']]: {
        message: t`Once the loan is paid off, you will no longer be able to manage this loan.`,
      },
      [ALERT_FORM_WARNING_KEYS['warning-not-in-liquidation-mode']]: {
        message: t`You are not in liquidation mode.`,
      },
      [ALERT_FORM_WARNING_KEYS['warning-not-enough-crvusd']]: {
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
