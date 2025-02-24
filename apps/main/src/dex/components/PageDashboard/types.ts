import { SORT_ID } from '@/dex/components/PageDashboard/utils'
import { ChainId, RewardsApy, PoolData } from '@/dex/types/main.types'

type UserBaseProfit = {
  day: string
  week: string
  month: string
  year: string
}

type UserClaimableToken = {
  token: string
  symbol: string
  amount: string
  price: number
}

interface UserTokenProfit extends UserBaseProfit {
  token: string
  symbol: string
  price: number
}

export type Order = 'asc' | 'desc'

export type SortId = keyof typeof SORT_ID

export type WalletPoolData = {
  poolAddress: string
  poolId: string
  poolName: string
  userCrvApy: number
  liquidityUsd: string
  profitBase: UserBaseProfit | undefined
  profitCrv: UserTokenProfit | undefined
  profitOthers: UserTokenProfit[]
  profitsTotalUsd: number
  claimableCrv: UserClaimableToken[] | undefined
  claimableOthers: UserClaimableToken[]
  claimablesTotalUsd: number
  percentStaked: string
}

export type DashboardDataMapper = { [poolId: string]: WalletPoolData }
export type DashboardDatasMapper = { [searchedAddress: string]: DashboardDataMapper }

export type FormValues = {
  sortBy: SortId
  sortByOrder: Order
  walletAddress: string
}

export type TableLabel = Record<SortId, { name: string; mobile: string }>

export type StepKey = 'WITHDRAW' | 'CLAIM' | ''

export type FormStatus = {
  loading: boolean
  formProcessing: boolean
  formType: 'CLAIMABLE_FEES' | 'VECRV' | ''
  formTypeCompleted: StepKey
  step: StepKey
  error: string
}

export type DashboardTableRowProps = {
  rChainId: ChainId
  isLite: boolean
  blockchainId: string
  tableLabel: TableLabel
  formValues: FormValues
  poolData: PoolData
  poolRewardsApy: RewardsApy | undefined
  dashboardData: WalletPoolData
  fetchBoost: { fetchUserPoolBoost: (() => Promise<string>) | null }
  updatePath: (poolId: string) => void
}
