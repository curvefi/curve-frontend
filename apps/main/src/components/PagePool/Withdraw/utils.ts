import type { FormType, ClaimableDetailsResp } from '@/entities/withdraw'

import { t } from '@lingui/macro'

export function getTokensText(
  claimableCrv: string,
  claimableRewards: ClaimableDetailsResp['claimableRewards'],
  formType: FormType
) {
  switch (formType) {
    case 'CLAIM_CRV':
      return `CRV ${claimableCrv}`
    case 'CLAIM_REWARDS':
      return claimableRewards.map(({ symbol, amount }) => `${symbol} ${amount}`).join(', ')
    default:
      return ''
  }
}

export function getClaimText(
  claimableCrv: string,
  claimableRewards: ClaimableDetailsResp['claimableRewards'],
  formType: FormType,
  comp: 'notify' | 'inProgress' | 'success' | 'successTxInfo' | 'claimCrvButton',
  rewardsNeedNudging: boolean | undefined
) {
  const tokensMessage = getTokensText(claimableCrv, claimableRewards, formType)
  const haveClaimableCrv = +claimableCrv > 0
  const haveClaimableRewards = claimableRewards.length > 0
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
