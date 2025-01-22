import type { FormStatus, FormValues } from '@main/components/PageDashboard/types'

import { todayInMilliseconds } from '@main/utils/utilsDates'

export function getIsLockExpired(lockedAmount: string, unlockTime: number) {
  return unlockTime && unlockTime < todayInMilliseconds() && +lockedAmount > 0
}

export enum SORT_ID {
  'poolName' = 'poolName',
  'userCrvApy' = 'userCrvApy',
  'rewardBase' = 'rewardBase',
  'rewardOthers' = 'rewardOthers',
  'liquidityUsd' = 'liquidityUsd',
  'profits' = 'profits',
  'claimables' = 'claimables',
}

export const DEFAULT_FORM_VALUES: FormValues = {
  sortBy: SORT_ID.liquidityUsd,
  sortByOrder: 'desc',
  walletAddress: '',
}

export const DEFAULT_FORM_STATUS: FormStatus = {
  loading: false,
  formType: '',
  formProcessing: false,
  formTypeCompleted: '',
  step: '',
  error: '',
}
