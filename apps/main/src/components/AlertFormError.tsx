import type { AlertBoxProps } from '@/ui/AlertBox/types'

import { t } from '@lingui/macro'
import React, { useMemo } from 'react'
import styled from 'styled-components'

import AlertBox from '@/ui/AlertBox'

const ALERT_FORM_ERROR_KEYS = {
  'error-user-rejected-action': 'error-user-rejected-action',
  'error-est-gas-approval': 'error-est-gas-approval',
  'error-invalid-provider': 'error-invalid-provider',
  'error-pool-list': 'error-pool-list',
  'error-step-approve': 'error-step-approve',
  'error-swap-exchange-and-output': 'error-swap-exchange-and-output',
  'error-swap-not-available': 'error-swap-not-available',
  'error-step-claim': 'error-step-claim',
  'error-get-claimable': 'error-get-claimable',
  'error-get-dashboard-data': 'error-get-dashboard-data',
  'error-get-gas': 'error-get-gas',
  'error-get-locked-crv-info': 'error-get-locked-crv-info',
  'error-withdraw-locked-crv': 'error-withdraw-locked-crv',
  'too-much-reserves': 'too-much-reserves',
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
      // quick swap and pool swap
      [ALERT_FORM_ERROR_KEYS['error-swap-not-available']]: t`Swap is not available.`,
      [ALERT_FORM_ERROR_KEYS['error-swap-exchange-and-output']]: t`Unable to get exchange rates and swap amount`,
      [ALERT_FORM_ERROR_KEYS['too-much-reserves']]: t`The entered amount exceeds the available currency reserves.`,

      // all
      [ALERT_FORM_ERROR_KEYS['error-user-rejected-action']]: t`User rejected action`,
      [ALERT_FORM_ERROR_KEYS['error-est-gas-approval']]: t`Unable to get approval or estimated gas`,
      [ALERT_FORM_ERROR_KEYS['error-invalid-provider']]: t`Unable to find provider`,
      [ALERT_FORM_ERROR_KEYS['error-step-approve']]: t`Unable to approve spending`,
      [ALERT_FORM_ERROR_KEYS['error-pool-list']]: t`Unable to get pool list`,
      [ALERT_FORM_ERROR_KEYS['error-get-dashboard-data']]: t`Unable to get dashboard data`,
      [ALERT_FORM_ERROR_KEYS['error-get-gas']]: t`Unable to get gas price`,

      //   withdraw
      [ALERT_FORM_ERROR_KEYS['error-get-claimable']]: t`Unable to get claimable amounts`,
      [ALERT_FORM_ERROR_KEYS['error-step-claim']]: t`Unable to claim`,

      // locked crv
      [ALERT_FORM_ERROR_KEYS['error-get-locked-crv-info']]: t`Unable to get locked CRV info`,
      [ALERT_FORM_ERROR_KEYS['error-withdraw-locked-crv']]: t`Unable to withdraw locked CRV`,
    }

    return errorKey ? messages[errorKey] ?? errorKey : ''
  }, [errorKey])

  if (!errorMessage) return null

  return (
    <StyledAlertBox limitHeight {...props} alertType="error">
      {errorMessage}
    </StyledAlertBox>
  )
}

const StyledAlertBox = styled(AlertBox)`
  [data-tag='content'] {
    align-items: flex-start;
  }
`

export default AlertFormError
