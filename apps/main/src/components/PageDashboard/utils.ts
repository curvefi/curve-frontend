import type { FormStatus, FormValues } from '@/components/PageDashboard/types'

import { todayInMilliseconds } from '@/utils/utilsDates'

export function getIsLockExpired(lockedAmount: string, unlockTime: number) {
  return unlockTime && unlockTime < todayInMilliseconds() && +lockedAmount > 0
}

export const DEFAULT_WALLET_DASHBOARD_DATA = {
  totalLiquidityUsd: 0,
  totalBaseProfit: 0,
  totalCrvProfit: { total: 0, price: 0 },
  totalOtherProfit: {},
  totalProfitUsd: 0,
  totalClaimableCrv: { total: 0, price: 0 },
  totalClaimableOther: {},
  totalClaimableUsd: 0,
}

export const DEFAULT_FORM_VALUES: FormValues = {
  sortBy: 'liquidityUsd',
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
