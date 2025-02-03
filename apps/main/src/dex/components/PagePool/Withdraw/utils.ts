import type { FormStatus, FormValues } from '@/dex/components/PagePool/Withdraw/types'

import { t } from '@lingui/macro'

export const DEFAULT_FORM_VALUES: FormValues = {
  amounts: [],
  claimableRewards: [],
  claimableCrv: '',
  isWrapped: false,
  lpToken: '',
  stakedLpToken: '',
  selected: '',
  selectedToken: '',
  selectedTokenAddress: '',
}

export const DEFAULT_FORM_STATUS: FormStatus = {
  isApproved: false,
  isClaimCrv: false,
  isClaimRewards: false,
  formProcessing: false,
  formTypeCompleted: '',
  step: '',
  error: '',
}

export function resetFormAmounts(formValues: FormValues) {
  return formValues.amounts.map((a) => ({ ...a, value: '' }))
}

export function getTokensText(
  { claimableCrv, claimableRewards }: FormValues,
  { isClaimCrv, isClaimRewards }: FormStatus,
) {
  let message = []

  if (isClaimCrv) {
    message.push(`CRV ${claimableCrv}`)
  } else if (isClaimRewards) {
    claimableRewards.map(({ symbol, amount }) => {
      message.push(`${symbol} ${amount}`)
    })
  }

  return message.join(', ')
}

export function getClaimText(
  formValues: FormValues,
  formStatus: FormStatus,
  comp: 'notify' | 'inProgress' | 'success' | 'successTxInfo' | 'claimCrvButton',
  rewardsNeedNudging: boolean | undefined,
) {
  const tokensMessage = getTokensText(formValues, formStatus)
  const haveClaimableCrv = +formValues.claimableCrv > 0
  const haveClaimableRewards = formValues.claimableRewards.length > 0
  let type: 'isClaimOnly' | 'isNudgeAndClaim' | 'isNudgeOnly' | '' = ''

  if (haveClaimableCrv || haveClaimableRewards) {
    type = rewardsNeedNudging ? 'isNudgeAndClaim' : 'isClaimOnly'
  } else if (rewardsNeedNudging) {
    type = 'isNudgeOnly'
  }

  const messages = {
    notify: {
      isClaimOnly: t`Please confirm claim of ${tokensMessage}`,
      isNudgeAndClaim: t`Please confirm nudge and claim of ${tokensMessage}`,
      isNudgeOnly: t`Please confirm nudge rewards`,
    },
    inProgress: {
      isClaimOnly: t`Claiming`,
      isNudgeAndClaim: t`Nudging and Claiming`,
      isNudgeOnly: t`Nudging`,
    },
    success: {
      isClaimOnly: t`Claim CRV Complete`,
      isNudgeAndClaim: t`Nudge and Claim CRV Complete`,
      isNudgeOnly: t`Nudge Complete`,
    },
    successTxInfo: {
      isClaimOnly: t`Claimed ${tokensMessage}`,
      isNudgeAndClaim: t`Nudged and Claimed ${tokensMessage}`,
      isNudgeOnly: t`Nudged Rewards Tx`,
    },
    claimCrvButton: {
      isClaimOnly: t`Claim CRV`,
      isNudgeAndClaim: t`Nudge and Claim CRV`,
      isNudgeOnly: t`Nudge CRV`,
    },
  }

  if (type) {
    return messages[comp][type]
  }
  return ''
}
