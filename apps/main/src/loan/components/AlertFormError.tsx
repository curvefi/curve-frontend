import type { AlertBoxProps } from '@ui/AlertBox/types'

import { t } from '@ui-kit/lib/i18n'
import React, { useMemo } from 'react'

import AlertBox from '@ui/AlertBox'

const ALERT_FORM_ERROR_KEYS = {
  // loan deleverage
  'error-deleverage-api': 'error-deleverage-api',
  'error-full-repayment-required': 'error-full-repayment-required',

  // all
  'error-est-gas-approval': 'error-est-gas-approval',
  'error-invalid-provider': 'error-invalid-provider',
  'error-step-approve': 'error-step-approve',
  'error-step-swap': 'error-step-swap',
  'error-swap-exchange-and-output': 'error-swap-exchange-and-output',
  'error-swap-not-available': 'error-swap-not-available',
  'error-liquidation-mode': 'error-liquidation-mode',
  'error-total-supply': 'error-total-supply',
} as const

export type AlertFormErrorKey = keyof typeof ALERT_FORM_ERROR_KEYS

interface Props extends Omit<AlertBoxProps, 'alertType'> {
  errorKey: AlertFormErrorKey | string
}

// generate message that only display if it cannot get error message from api.
const AlertFormError = ({ errorKey, ...props }: React.PropsWithChildren<Props>) => {
  const errorMessage = useMemo(() => {
    // locale will update inside component
    const messages: { [key: AlertFormErrorKey | string]: string } = {
      // loan deleverage
      [ALERT_FORM_ERROR_KEYS['error-deleverage-api']]: t`Unable to get deleverage info`,
      [ALERT_FORM_ERROR_KEYS['error-full-repayment-required']]:
        t`Only full repayment is allowed when in soft-liquidation mode.`,

      // all
      [ALERT_FORM_ERROR_KEYS['error-est-gas-approval']]: t`Unable to get approval or estimated gas`,
      [ALERT_FORM_ERROR_KEYS['error-invalid-provider']]: t`Unable to find provider`,
      [ALERT_FORM_ERROR_KEYS['error-step-approve']]: t`Unable to approve spending`,
      [ALERT_FORM_ERROR_KEYS['error-liquidation-mode']]:
        t`You cannot adjust your collateral while in liquidation mode. Your options are repayment or self-liquidation.`,
      [ALERT_FORM_ERROR_KEYS['error-total-supply']]: t`Unable to get total supply`,
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
