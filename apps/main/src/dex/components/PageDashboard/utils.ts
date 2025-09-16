import type { FormStatus, FormValues } from '@/dex/components/PageDashboard/types'
import { todayInMilliseconds } from '@/dex/utils/utilsDates'
import type { TooltipProps } from '@ui/Tooltip/types'

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

export const tooltipProps: TooltipProps = {
  placement: 'bottom-end',
  textAlign: 'end',
  noWrap: true,
}
