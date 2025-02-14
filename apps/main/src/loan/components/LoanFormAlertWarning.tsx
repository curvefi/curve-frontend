import type { AlertBoxProps } from '@ui/AlertBox/types'

import { t } from '@ui-kit/lib/i18n'
import React, { useMemo } from 'react'

import AlertBox from '@ui/AlertBox'
import { AlertType } from '@/loan/types/loan.types'

const ALERT_FORM_WARNING_KEYS = {
  'warning-exchange-rate-low': 'warning-exchange-rate-low',
} as const

export type AlertFormWarningKey = keyof typeof ALERT_FORM_WARNING_KEYS

interface Props extends Omit<AlertBoxProps, 'alertType'> {
  errorKey: AlertFormWarningKey | string
}

const LoanFormAlertWarning = ({ errorKey, ...props }: React.PropsWithChildren<Props>) => {
  const errorMessage = useMemo(() => {
    const messages: { [key: AlertFormWarningKey | string]: { message: string; alertType?: AlertType } } = {
      [ALERT_FORM_WARNING_KEYS['warning-exchange-rate-low']]: {
        message: t`Warning! Exchange rate is too low!`,
        alertType: 'error',
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

export default LoanFormAlertWarning
