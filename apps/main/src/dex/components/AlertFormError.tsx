import { useMemo } from 'react'
import { styled } from 'styled-components'
import { AlertBox } from '@ui/AlertBox'
import type { AlertBoxProps } from '@ui/AlertBox/types'
import { t } from '@ui-kit/lib/i18n'

const ALERT_FORM_ERROR_KEYS = {
  'error-user-rejected-action': 'error-user-rejected-action',
  'error-est-gas-approval': 'error-est-gas-approval',
  'error-invalid-provider': 'error-invalid-provider',
  'error-pool-list': 'error-pool-list',
  'error-step-approve': 'error-step-approve',
  'error-step-deposit': 'error-step-deposit',
  'error-step-swap': 'error-step-swap',
  'error-step-stake': 'error-step-stake',
  'error-step-withdraw': 'error-step-withdraw',
  'error-step-unstake': 'error-step-unstake',
  'error-swap-exchange-and-output': 'error-swap-exchange-and-output',
  'error-swap-not-available': 'error-swap-not-available',
  'error-deposit-bonus': 'error-deposit-bonus',
  'error-deposit-balance': 'error-deposit-balance',
  'error-deposit-withdraw-expected': 'error-deposit-withdraw-expected',
  'error-deposit-withdraw-expected-bonus': 'error-deposit-withdraw-expected-bonus',
  'error-step-claim': 'error-step-claim',
  'error-get-claimable': 'error-get-claimable',
  'error-get-dashboard-data': 'error-get-dashboard-data',
  'error-get-gas': 'error-get-gas',
  'error-get-locked-crv-info': 'error-get-locked-crv-info',
  'error-step-claim-fees': 'error-step-claim-fees',
  'error-step-create-locked-crv': 'error-step-create-locked-crv',
  'error-step-locked-time': 'error-step-locked-time',
  'error-step-locked-crv': 'error-step-locked-crv',
  'error-withdraw-locked-crv': 'error-withdraw-locked-crv',
} as const

export type AlertFormErrorKey = keyof typeof ALERT_FORM_ERROR_KEYS

interface Props extends Omit<AlertBoxProps, 'alertType'> {
  errorKey: AlertFormErrorKey | string
}

// generate message that only display if it cannot get error message from api.
export const AlertFormError = ({ errorKey, ...props }: Props) => {
  const errorMessage = useMemo(() => {
    // locale will update inside component
    const messages: { [key: AlertFormErrorKey | string]: string } = {
      // quick swap and pool swap
      [ALERT_FORM_ERROR_KEYS['error-swap-not-available']]: t`Swap route is not available on Curve. Try an aggregator.`,
      [ALERT_FORM_ERROR_KEYS['error-swap-exchange-and-output']]: t`Unable to get exchange rates and swap amount`,
      [ALERT_FORM_ERROR_KEYS['error-step-swap']]: t`Unable to swap`,

      // all
      [ALERT_FORM_ERROR_KEYS['error-user-rejected-action']]: t`User rejected action`,
      [ALERT_FORM_ERROR_KEYS['error-est-gas-approval']]: t`Unable to get approval or estimated gas`,
      [ALERT_FORM_ERROR_KEYS['error-invalid-provider']]: t`Unable to find provider`,
      [ALERT_FORM_ERROR_KEYS['error-step-approve']]: t`Unable to approve spending`,
      [ALERT_FORM_ERROR_KEYS['error-deposit-withdraw-expected']]: t`Unable to get expected`,
      [ALERT_FORM_ERROR_KEYS['error-deposit-withdraw-expected-bonus']]: t`Unable to get bonus or expected`,
      [ALERT_FORM_ERROR_KEYS['error-pool-list']]: t`Unable to get pool list`,
      [ALERT_FORM_ERROR_KEYS['error-get-dashboard-data']]: t`Unable to get dashboard data`,
      [ALERT_FORM_ERROR_KEYS['error-get-gas']]: t`Unable to get gas price`,

      //  deposit
      [ALERT_FORM_ERROR_KEYS['error-step-deposit']]: t`Unable to deposit`,
      [ALERT_FORM_ERROR_KEYS['error-deposit-bonus']]: t`Unable to get bonus`,
      [ALERT_FORM_ERROR_KEYS['error-step-stake']]: t`Unable to stake`,
      [ALERT_FORM_ERROR_KEYS['error-deposit-balance']]: t`Unable to get balanced amounts`,

      //   withdraw
      [ALERT_FORM_ERROR_KEYS['error-get-claimable']]: t`Unable to get claimable amounts`,
      [ALERT_FORM_ERROR_KEYS['error-step-withdraw']]: t`Unable to withdraw`,
      [ALERT_FORM_ERROR_KEYS['error-step-unstake']]: t`Unable to unstake`,
      [ALERT_FORM_ERROR_KEYS['error-step-claim']]: t`Unable to claim`,

      //   claim fees
      [ALERT_FORM_ERROR_KEYS['error-step-claim-fees']]: t`Unable to claim veCRV 3pool LP`,

      // locked crv
      [ALERT_FORM_ERROR_KEYS['error-get-locked-crv-info']]: t`Unable to get locked CRV info`,
      [ALERT_FORM_ERROR_KEYS['error-step-create-locked-crv']]: t`Unable to create locked CRV`,
      [ALERT_FORM_ERROR_KEYS['error-step-locked-crv']]: t`Unable to lock crv`,
      [ALERT_FORM_ERROR_KEYS['error-step-locked-time']]: t`Unable to lock date`,
      [ALERT_FORM_ERROR_KEYS['error-withdraw-locked-crv']]: t`Unable to withdraw locked CRV`,
    }

    if (errorKey) {
      return messages[errorKey] ?? errorKey
    } else {
      return ''
    }
  }, [errorKey])

  return errorMessage ? (
    <StyledAlertBox {...props} alertType="error">
      {errorMessage}
    </StyledAlertBox>
  ) : null
}

const StyledAlertBox = styled(AlertBox)`
  max-height: 300px;
  overflow-y: auto;

  [data-tag='content'] {
    align-items: flex-start;
  }
`
