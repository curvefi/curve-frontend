import { useMemo } from 'react'
import { styled } from 'styled-components'
import { AlertBox } from '@ui/AlertBox'
import type { AlertBoxProps } from '@ui/AlertBox/types'
import { t } from '@ui-kit/lib/i18n'

enum AlertFormErrorKey {
  USER_REJECTED_ACTION = 'error-user-rejected-action',
  EST_GAS_APPROVAL = 'error-est-gas-approval',
  INVALID_PROVIDER = 'error-invalid-provider',
  POOL_LIST = 'error-pool-list',
  STEP_APPROVE = 'error-step-approve',
  STEP_DEPOSIT = 'error-step-deposit',
  STEP_SWAP = 'error-step-swap',
  STEP_STAKE = 'error-step-stake',
  STEP_WITHDRAW = 'error-step-withdraw',
  STEP_UNSTAKE = 'error-step-unstake',
  SWAP_EXCHANGE_AND_OUTPUT = 'error-swap-exchange-and-output',
  SWAP_NOT_AVAILABLE = 'error-swap-not-available',
  DEPOSIT_BONUS = 'error-deposit-bonus',
  DEPOSIT_BALANCE = 'error-deposit-balance',
  DEPOSIT_WITHDRAW_EXPECTED = 'error-deposit-withdraw-expected',
  DEPOSIT_WITHDRAW_EXPECTED_BONUS = 'error-deposit-withdraw-expected-bonus',
  STEP_CLAIM = 'error-step-claim',
  GET_CLAIMABLE = 'error-get-claimable',
  GET_DASHBOARD_DATA = 'error-get-dashboard-data',
  GET_GAS = 'error-get-gas',
  GET_LOCKED_CRV_INFO = 'error-get-locked-crv-info',
  STEP_CLAIM_FEES = 'error-step-claim-fees',
  STEP_CREATE_LOCKED_CRV = 'error-step-create-locked-crv',
  STEP_LOCKED_TIME = 'error-step-locked-time',
  STEP_LOCKED_CRV = 'error-step-locked-crv',
  WITHDRAW_LOCKED_CRV = 'error-withdraw-locked-crv',
}

interface Props extends Omit<AlertBoxProps, 'alertType'> {
  errorKey: AlertFormErrorKey | string
}

// generate message that only display if it cannot get error message from api.
export const AlertFormError = ({ errorKey, ...props }: Props) => {
  const errorMessage = useMemo(() => {
    // locale will update inside component
    const messages: { [key: AlertFormErrorKey | string]: string } = {
      // quick swap and pool swap
      [AlertFormErrorKey.SWAP_NOT_AVAILABLE]: t`Swap route is not available on Curve. Try an aggregator.`,
      [AlertFormErrorKey.SWAP_EXCHANGE_AND_OUTPUT]: t`Unable to get exchange rates and swap amount`,
      [AlertFormErrorKey.STEP_SWAP]: t`Unable to swap`,

      // all
      [AlertFormErrorKey.USER_REJECTED_ACTION]: t`User rejected action`,
      [AlertFormErrorKey.EST_GAS_APPROVAL]: t`Unable to get approval or estimated gas`,
      [AlertFormErrorKey.INVALID_PROVIDER]: t`Unable to find provider`,
      [AlertFormErrorKey.STEP_APPROVE]: t`Unable to approve spending`,
      [AlertFormErrorKey.DEPOSIT_WITHDRAW_EXPECTED]: t`Unable to get expected`,
      [AlertFormErrorKey.DEPOSIT_WITHDRAW_EXPECTED_BONUS]: t`Unable to get bonus or expected`,
      [AlertFormErrorKey.POOL_LIST]: t`Unable to get pool list`,
      [AlertFormErrorKey.GET_DASHBOARD_DATA]: t`Unable to get dashboard data`,
      [AlertFormErrorKey.GET_GAS]: t`Unable to get gas price`,

      //  deposit
      [AlertFormErrorKey.STEP_DEPOSIT]: t`Unable to deposit`,
      [AlertFormErrorKey.DEPOSIT_BONUS]: t`Unable to get bonus`,
      [AlertFormErrorKey.STEP_STAKE]: t`Unable to stake`,
      [AlertFormErrorKey.DEPOSIT_BALANCE]: t`Unable to get balanced amounts`,

      //   withdraw
      [AlertFormErrorKey.GET_CLAIMABLE]: t`Unable to get claimable amounts`,
      [AlertFormErrorKey.STEP_WITHDRAW]: t`Unable to withdraw`,
      [AlertFormErrorKey.STEP_UNSTAKE]: t`Unable to unstake`,
      [AlertFormErrorKey.STEP_CLAIM]: t`Unable to claim`,

      //   claim fees
      [AlertFormErrorKey.STEP_CLAIM_FEES]: t`Unable to claim veCRV 3pool LP`,

      // locked crv
      [AlertFormErrorKey.GET_LOCKED_CRV_INFO]: t`Unable to get locked CRV info`,
      [AlertFormErrorKey.STEP_CREATE_LOCKED_CRV]: t`Unable to create locked CRV`,
      [AlertFormErrorKey.STEP_LOCKED_CRV]: t`Unable to lock crv`,
      [AlertFormErrorKey.STEP_LOCKED_TIME]: t`Unable to lock date`,
      [AlertFormErrorKey.WITHDRAW_LOCKED_CRV]: t`Unable to withdraw locked CRV`,
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
