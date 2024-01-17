import React from 'react'
import { UserBaseProfit, UserClaimableToken, UserTokenProfit } from '@/types'

export type Order = 'asc' | 'desc'

export type SortId =
  | 'poolName'
  | 'baseApy'
  | 'userCrvApy'
  | 'incentivesRewardsApy'
  | 'liquidityUsd'
  | 'baseProfit'
  | 'crvProfit'
  | 'claimableCrv'

export type WalletDashboardData = {
  totalLiquidityUsd: number
  totalBaseProfit: number
  totalCrvProfit: { total: number; price: number }
  totalOtherProfit: { [tokenAddress: string]: { symbol: string; total: number; price: number } }
  totalProfitUsd: number
  totalClaimableCrv: { total: number; price: number }
  totalClaimableOther: { [tokenAddress: string]: { symbol: string; total: number; price: number } }
  totalClaimableUsd: number
}

export type WalletPoolData = {
  poolAddress: string
  poolId: string
  poolName: string
  poolRewardsApy: RewardsApy | undefined
  userCrvApy: number
  liquidityUsd: string
  baseProfit: UserBaseProfit | undefined
  crvProfit: UserTokenProfit | undefined
  tokensProfit: UserTokenProfit[] | undefined
  claimableCrv: UserClaimableToken[] | undefined
  claimableOther: UserClaimableToken[]
  percentStaked: string
}

export type FormValues = {
  sortBy: SortId
  sortByOrder: Order
  walletAddress: string
}

export type TableLabel = {
  poolName: { name: string; mobile: string }
  baseApy: { name: string; mobile: string }
  userCrvApy: { name: React.ReactNode; mobile: string }
  incentivesRewardsApy: { name: string; mobile: string }
  liquidityUsd: { name: string; mobile: string }
  baseProfit: { name: string; mobile: string }
  crvProfit: { name: string; mobile: string }
  claimableCrv: { name: string; mobile: string }
}

export type StepKey = 'WITHDRAW' | 'CLAIM' | ''

export type FormStatus = {
  loading: boolean
  formProcessing: boolean
  formType: 'CLAIMABLE_FEES' | 'VECRV' | ''
  formTypeCompleted: StepKey
  step: StepKey
  error: string
}
