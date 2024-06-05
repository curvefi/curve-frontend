import type { AlertBoxProps } from '@/ui/AlertBox/types'

import { t } from '@lingui/macro'
import React, { useMemo } from 'react'

import AlertBox from '@/ui/AlertBox'

const ALERT_FORM_ERROR_KEYS = {
  // vault

  // all
  'error-api': 'error-api',
  'error-existing-loan': 'error-existing-loan',
  'error-est-gas-approval': 'error-est-gas-approval',
  'error-invalid-provider': 'error-invalid-provider',
  'error-wallet-balances': 'error-wallet-balances',
  'error-step-approve': 'error-step-approve',
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
      // vault
      [ALERT_FORM_ERROR_KEYS['error-api']]: t`Unable to get data from api`,

      // all
      [ALERT_FORM_ERROR_KEYS['error-existing-loan']]: t`Unable to check if loan existed`,
      [ALERT_FORM_ERROR_KEYS['error-wallet-balances']]: t`Unable to get wallet balances`,
      [ALERT_FORM_ERROR_KEYS['error-est-gas-approval']]: t`Unable to get approval or estimated gas`,
      [ALERT_FORM_ERROR_KEYS['error-invalid-provider']]: t`Unable to find provider`,
      [ALERT_FORM_ERROR_KEYS['error-step-approve']]: t`Unable to approve spending`,
      [ALERT_FORM_ERROR_KEYS[
        'error-liquidation-mode'
      ]]: t`You cannot adjust your collateral while in liquidation mode. Your options are repayment or self-liquidation.`,
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
