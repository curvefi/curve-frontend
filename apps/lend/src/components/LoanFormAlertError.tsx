import type { AlertBoxProps } from '@/ui/AlertBox/types'

import { t } from '@lingui/macro'
import React, { useMemo } from 'react'

import AlertBox from '@/ui/AlertBox'

const ALERT_FORM_ERROR_KEYS = {
  'error-est-gas-approval': 'error-est-gas-approval',
  'error-invalid-provider': 'error-invalid-provider',
  'error-liquidate': 'error-liquidate',
  'error-liquidate-not-in-liquidation-mode': 'error-liquidate-not-in-liquidation-mode',
  'error-step-liquidate': 'error-step-liquidate',
  'error-max-amount': 'error-max-amount',
  'error-step-create': 'error-step-create',
  'error-step-borrow-more': 'error-step-borrow-more',
  'error-step-remove-collateral': 'error-step-remove-collateral',
  'error-step-add-collateral': 'error-step-add-collateral',
  'error-step-approve': 'error-step-approve',
  'error-step-repay': 'error-step-repay',
} as const

export type AlertFormErrorKey = keyof typeof ALERT_FORM_ERROR_KEYS

interface Props extends Omit<AlertBoxProps, 'alertType'> {
  errorKey: AlertFormErrorKey | string
}

// generate message that only display if it cannot get error message from api.
const LoanFormAlertError = ({ errorKey, ...props }: React.PropsWithChildren<Props>) => {
  const errorMessage = useMemo(() => {
    // locale will update inside component
    const messages: { [key: AlertFormErrorKey | string]: string } = {
      // steps
      [ALERT_FORM_ERROR_KEYS['error-step-approve']]: t`Unable to approve spending`,
      [ALERT_FORM_ERROR_KEYS['error-step-create']]: t`Unable to create loan.`,
      [ALERT_FORM_ERROR_KEYS['error-step-borrow-more']]: t`Unable to borrow more.`,
      [ALERT_FORM_ERROR_KEYS['error-step-remove-collateral']]: t`Unable to remove collateral`,
      [ALERT_FORM_ERROR_KEYS['error-step-add-collateral']]: t`Unable to add collateral`,
      [ALERT_FORM_ERROR_KEYS['error-step-repay']]: t`Unable to repay loan`,

      // liquidation
      [ALERT_FORM_ERROR_KEYS['error-liquidate-not-in-liquidation-mode']]: t`Not eligible for liquidation`,
      [ALERT_FORM_ERROR_KEYS['error-step-liquidate']]: t`Unable to self liquidate`,
      [ALERT_FORM_ERROR_KEYS['error-liquidate']]: t`Unable to self liquidate`,

      // all
      [ALERT_FORM_ERROR_KEYS['error-est-gas-approval']]: t`Unable to get approval or estimated gas`,
      [ALERT_FORM_ERROR_KEYS['error-invalid-provider']]: t`Unable to find provider`,
      [ALERT_FORM_ERROR_KEYS['error-max-amount']]: t`Unable to get max amount`,
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

export default LoanFormAlertError
