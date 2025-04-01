import { ethers } from 'ethers'
import curvejsApi from '@/dao/lib/curvejs'
import type curveApi from '@curvefi/api'
import type { INetworkName } from '@curvefi/api/lib/interfaces'
import type { BaseConfig } from '@ui/utils'
import type { Address } from '@ui-kit/utils'
import type { WalletState } from '@web3-onboard/core'

export type PageWidthClassName =
  | 'page-wide'
  | 'page-large'
  | 'page-medium'
  | 'page-small'
  | 'page-small-x'
  | 'page-small-xx'
export type CurveApi = typeof curveApi & { chainId: number }
export type ChainId = number
export type NetworkEnum = INetworkName

export type FormType = 'create' | 'adjust_crv' | 'adjust_date'
export type NetworkUrlParams = { network: INetworkName }
export type GaugeUrlParams = NetworkUrlParams & { gaugeAddress: Address }
export type UserUrlParams = NetworkUrlParams & { userAddress: Address }
export type ProposalUrlParams = NetworkUrlParams & { proposalId: string }
export type VeCrvUrlParams = NetworkUrlParams & { formType: [FormType] }
export type UrlParams = NetworkUrlParams & Partial<GaugeUrlParams & UserUrlParams & ProposalUrlParams & VeCrvUrlParams>

export interface NetworkConfig extends BaseConfig {
  api: typeof curvejsApi
  isActiveNetwork: boolean
  showInSelectNetwork: boolean
}

export type RouterParams = {
  rChainId: ChainId
  rNetwork: NetworkEnum
  rNetworkIdx: number
  rSubdirectory: string
  rSubdirectoryUseDefault: boolean
  rProposalId: string
  rUserAddress: string
  rGaugeAddress: string
  rFormType: FormType
  redirectPathname: string
  restFullPathname: string
}
export type PageProps = {
  curve: CurveApi | null
  pageLoaded: boolean
  routerParams: RouterParams
}
export type Provider = ethers.BrowserProvider
export type Wallet = WalletState
export type EstimatedGas = number | number[] | null
export type GasInfo = {
  gasPrice: number | null
  max: number[]
  priority: number[]
  basePlusPriority: number[]
  basePlusPriorityL1?: number[] | undefined
  l1GasPriceWei?: number
  l2GasPriceWei?: number
}
export type UsdRatesMapper = { [tokenAddress: string]: number | undefined }
export type ProposalType = 'PARAMETER' | 'OWNERSHIP'
export type ProposalResponseData = {
  voteId: number
  voteType: ProposalType
  creator: string
  startDate: number
  snapshotBlock: number
  ipfsMetadata: string
  metadata: string
  votesFor: string
  votesAgainst: string
  voteCount: number
  supportRequired: string
  minAcceptQuorum: string
  totalSupply: string
  executed: boolean
}
export type PricesProposalResponseData = {
  creator: string
  dt: string
  executed: boolean
  ipfs_metadata: string
  metadata: string
  min_accept_quorum: string
  snapshot_block: number
  start_date: number
  support_required: string
  total_supply: string
  transaction_hash: string
  vote_count: number
  vote_id: number
  vote_type: string
  votes_against: string
  votes_for: string
}

export interface ProposalData extends Omit<ProposalResponseData, 'votesFor' | 'votesAgainst'> {
  status: 'Active' | 'Passed' | 'Denied'
  votesFor: number
  votesAgainst: number
  totalVotes: number
  minSupport: number
  minAcceptQuorumPercent: number
  quorumVeCrv: number
  totalVeCrv: number
  currentQuorumPercentage: number
}

export type PricesProposalsResponse = {
  proposals: PricesProposalResponseData[]
}
export type PricesProposalResponse =
  | {
      vote_id: number
      vote_type: ProposalType
      creator: string
      start_date: number
      snapshot_block: number
      ipfs_metadata: string
      metadata: string
      votes_for: string
      votes_against: string
      vote_count: number
      support_required: string
      min_accept_quorum: string
      total_supply: string
      executed: boolean
      transaction_hash: string
      dt: string
      creator_voting_power: string
      execution_tx: string
      script: string
      votes: Array<{
        voter: string
        supports: boolean
        voting_power: string
        transaction_hash: string
      }>
    }
  | {
      detail: string
    }
export type PricesProposalData = {
  vote_id: number
  vote_type: ProposalType
  creator: string
  start_date: number
  snapshot_block: number
  ipfs_metadata: string
  metadata: string
  votes_for: number
  votes_against: number
  vote_count: number
  support_required: number
  min_accept_quorum: number
  total_supply: number
  executed: boolean
  transaction_hash: string
  dt: string
  creator_voting_power: number
  execution_tx: string
  script: string
  votes: Array<{
    voter: string
    topHolder: string | null
    stake: number
    relativePower: number
    supports: boolean
    transaction_hash: string
  }>
}
export type ProposalMapper = {
  [proposalId: string]: PricesProposalData
}
export type PricesGaugeOverviewData = {
  address: string
  effective_address?: string
  gauge_type: string
  name: string | null
  version: string | null
  lp_token: string
  pool: {
    address: string
    name: string
    chain: string
    tvl_usd: number
    trading_volume_24h: number
  } | null
  tokens: [{ symbol: string; address: string; precision: number }]
  market: {
    name: string
    chain: string
  } | null
  is_killed: boolean | null
  emissions: number
  gauge_weight: string
  gauge_weight_7d_delta: number | null
  gauge_weight_60d_delta: number | null
  gauge_relative_weight: number
  gauge_relative_weight_7d_delta: number | null
  gauge_relative_weight_60d_delta: number | null
  creation_tx: string
  creation_date: string
  last_vote_date: string
  last_vote_tx: string
}
export type CurveApiBaseGauge = {
  isPool: boolean
  name: string
  shortName: string
  factory: boolean
  lpTokenPrice: number | null
  blockchainId: string
  gauge: string
  rootGauge?: string
  gauge_data: {
    inflation_rate: string
    working_supply: string
  }
  gauge_controller: {
    gauge_relative_weight: string
    gauge_future_relative_weight: string
    get_gauge_weight: string
    inflation_rate: string
  }
  gaugeCrvApy: [number, number]
  gaugeFutureCrvApy: [number, number]
  side_chain: boolean
  is_killed: boolean
  hasNoCrv: boolean
}
export type CurveApiPoolGauge = CurveApiBaseGauge & {
  isPool: true
  poolUrls: {
    swap: string[]
    deposit: string[]
    withdraw: string[]
  }
  poolAddress: string
  virtualPrice: string | number
  type: string
  swap: string
  swap_token: string
}
export type CurveApiLendingGauge = CurveApiBaseGauge & {
  isPool: false
  lendingVaultUrls: {
    deposit: string
    withdraw: string
  }
  lendingVaultAddress: string
}
export type CurveApiGaugeData = CurveApiPoolGauge | CurveApiLendingGauge
export type CurveGaugeResponse = {
  success: boolean
  data: {
    [poolId: string]: CurveApiGaugeData
  }
  generatedTimeMs: number
}
export type PricesGaugeOverviewResponse = {
  gauges: PricesGaugeOverviewData[]
}

export interface GaugeFormattedData extends Omit<PricesGaugeOverviewData, 'gauge_weight'> {
  title: string
  platform: string
  gauge_weight: number
}

export interface GaugeMapper {
  [gaugeAddress: string]: GaugeFormattedData
}

export interface GaugeCurveApiDataMapper {
  [gaugeAddress: string]: CurveApiGaugeData
}

export type GaugeVotesResponse = {
  votes: GaugeVoteData[]
}
export type GaugeVoteData = {
  user: string
  weight: number
  block_number: number
  timestamp: string
  transaction: string
}
export type GaugeVote = {
  user: string
  weight: number
  block_number: number
  timestamp: number
  transaction: string
}

export interface GaugeVotesMapper {
  [gaugeAddress: string]: {
    fetchingState: FetchingState
    votes: GaugeVote[]
  }
}

export type GaugeWeightHistoryData = {
  is_killed: boolean
  gauge_weight: number
  gauge_relative_weight: number
  emissions: number
  epoch: number
}

export interface UserMapper {
  [userAddress: string]: {
    ens: string
  }
}

export interface UserVoteData {
  voteId: number
  voteType: 'PARAMETER' | 'OWNERSHIP'
  userVote: 'no' | 'yes' | 'even'
}

export type SnapshotVotingPower = {
  loading: boolean
  value: number
  blockNumber: number
}
export type ActiveProposal = {
  active: boolean
  startTimestamp: number
  endTimestamp: number
}

export interface UserLockApi {
  amount: string
  unlock_time: number
  lock_type: veCrvLockType
  locked_balance: string
  block_number: number
  dt: string
  transaction_hash: string
}

export interface UserLockRes {
  locks: UserLockApi[]
}

export interface UserLock {
  amount: number
  unlock_time: number
  lock_type: veCrvLockType
  locked_balance: number
  block_number: number
  date: string
  transaction_hash: string
}

export interface UserProposalVoteResData {
  proposal: {
    vote_id: number
    vote_type: string
    creator: string
    start_date: number
    snapshot_block: number
    ipfs_metadata: string
    metadata: string
    votes_for: string
    votes_against: string
    vote_count: number
    support_required: string
    min_accept_quorum: string
    total_supply: string
    executed: boolean
    transaction_hash: string
    dt: string
  }
  votes: {
    voter: string
    supports: boolean
    voting_power: string
    transaction_hash: string
  }[]
}

export interface UserProposalVoteData {
  vote_id: number
  vote_type: string
  vote_for: number
  vote_against: number
  vote_open: number
  vote_close: number
  vote_total_supply: number
}

export interface UserProposalVotesRes {
  page: number
  count: number
  data: UserProposalVoteResData[]
}

export type UserGaugeVote = {
  gauge: string
  gauge_name: string
  weight: number
  block_number: number
  timestamp: number
  transaction: string
}
export type UserGaugeVotesRes = {
  votes: UserGaugeVote[]
}

export type UserGaugeVoteWeight = {
  title: string
  userPower: number
  userVeCrv: number
  userFutureVeCrv: number
  expired: boolean
  gaugeAddress: string
  rootGaugeAddress: string
  isKilled: boolean
  lpTokenAddress: string
  network: string
  poolAddress: string
  poolName: string
  poolUrl: string
  relativeWeight: number
  totalVeCrv: number
  nextVoteTime: {
    fetchingState: FetchingState | null
    timestamp: number | null
  }
  canVote: boolean
}

export type UserGaugeVoteWeightsMapper = {
  [userAddress: string]: {
    fetchingState: FetchingState
    data: {
      powerUsed: number
      veCrvUsed: number
      gauges: UserGaugeVoteWeight[]
    }
  }
}

export interface FnStepEstGasApprovalResponse {
  activeKey: string
  isApproved: boolean
  estimatedGas: EstimatedGas
  error: string
}

export interface FnStepApproveResponse {
  activeKey: string
  hashes: string[]
  error: string
}

export interface FnStepResponse {
  activeKey: string
  hash: string
  error: string
}

export type FetchingState = 'LOADING' | 'SUCCESS' | 'ERROR'
export type TransactionState = '' | 'CONFIRMING' | 'LOADING' | 'SUCCESS' | 'ERROR'
export type ProposalListFilter = 'all' | 'active' | 'passed' | 'denied' | 'executable'
export type ProposalListFilterItem = { key: ProposalListFilter; label: string }
export type SortByFilterProposals = 'timeCreated' | 'endingSoon'
export type SortByFilterGaugesKeys =
  | 'gauge_relative_weight'
  | 'gauge_relative_weight_7d_delta'
  | 'gauge_relative_weight_60d_delta'
export type SortByFilterGauges = {
  key: SortByFilterGaugesKeys
  order: SortDirection
}
export type SortDirection = 'asc' | 'desc'
export type TopHoldersSortBy = 'weight' | 'locked' | 'weightRatio'
export type AllHoldersSortBy = 'weight' | 'locked' | 'weightRatio' | 'unlockTime'
export type UserLocksSortBy = 'date' | 'amount' | 'unlock_time'
export type UserGaugeVotesSortBy = 'weight' | 'timestamp'
export type UserProposalVotesSortBy = 'vote_id' | 'vote_for' | 'vote_against' | 'vote_open' | 'vote_close'
export type GaugeVotesSortBy = 'weight' | 'timestamp'
export type UserGaugeVoteWeightSortBy = 'userPower' | 'userVeCrv'
export type veCrvLockType = 'CREATE_LOCK' | 'WITHDRAW' | 'INCREASE_LOCK_AMOUNT' | 'INCREASE_UNLOCK_TIME'

export enum ClaimButtonsKey {
  '3CRV' = '3CRV',
  crvUSD = 'crvUSD',
}

export type AlertFormErrorKey =
  | 'error-user-rejected-action'
  | 'error-est-gas-approval'
  | 'error-invalid-provider'
  | 'error-pool-list'
  | 'error-step-approve'
  | 'error-step-deposit'
  | 'error-step-swap'
  | 'error-step-stake'
  | 'error-step-withdraw'
  | 'error-step-unstake'
  | 'error-swap-exchange-and-output'
  | 'error-swap-not-available'
  | 'error-deposit-bonus'
  | 'error-deposit-balance'
  | 'error-deposit-withdraw-expected'
  | 'error-deposit-withdraw-expected-bonus'
  | 'error-step-claim'
  | 'error-get-claimable'
  | 'error-get-dashboard-data'
  | 'error-get-gas'
  | 'error-get-locked-crv-info'
  | 'error-step-claim-fees'
  | 'error-step-create-locked-crv'
  | 'error-step-locked-time'
  | 'error-step-locked-crv'
  | 'error-withdraw-locked-crv'
