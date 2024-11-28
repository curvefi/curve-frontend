import type { INetworkName } from '@curvefi/api/lib/interfaces'
import type { Eip1193Provider, WalletState } from '@web3-onboard/core'
import type { Locale } from '@/lib/i18n'
import type { Location, NavigateFunction, Params } from 'react-router'
import type curveApi from '@curvefi/api'

import { ethers } from 'ethers'
import curvejsApi from '@/lib/curvejs'
import type { BaseConfig } from '@/ui/utils'

declare global {
  interface Window {
    clipboardData: any
    ethereum: Eip1193Provider
    exodus?: Eip1193Provider
    enkrypt?: { providers: { ethereum: Eip1193Provider } }
  }

  type PageWidthClassName = 'page-wide' | 'page-large' | 'page-medium' | 'page-small' | 'page-small-x' | 'page-small-xx'
  type CurveApi = typeof curveApi & { chainId: 1 }
  type ChainId = 1
  type NetworkEnum = INetworkName

  interface NetworkConfig extends BaseConfig {
    api: typeof curvejsApi
    isActiveNetwork: boolean
    showInSelectNetwork: boolean
  }

  type RouterParams = {
    rLocale: Locale | null
    rLocalePathname: string
    rChainId: ChainId
    rNetwork: NetworkEnum
    rNetworkIdx: number
    rSubdirectory: string
    rSubdirectoryUseDefault: boolean
    rProposalId: string
    rUserAddress: string
    rGaugeAddress: string
    rFormType: RFormType
    redirectPathname: string
    restFullPathname: string
  }

  type PageProps = {
    curve: CurveApi | null
    pageLoaded: boolean
    routerParams: RouterParams
  }

  type RouterProps = {
    params: Params
    location: Location
    navigate: NavigateFunction
  }

  type Provider = ethers.Provider.BrowserProvider
  type Wallet = WalletState

  // number[]: [L2GasUsed, L1GasUsed]
  // number  : L1gasUsed
  type EstimatedGas = number | number[] | null

  type GasInfo = {
    gasPrice: number | null
    max: number[]
    priority: number[]
    basePlusPriority: number[]
    basePlusPriorityL1?: number[] | undefined
    l1GasPriceWei?: number
    l2GasPriceWei?: number
  }

  type UsdRatesMapper = { [tokenAddress: string]: number | undefined }

  type ProposalType = 'PARAMETER' | 'OWNERSHIP'

  type ProposalResponseData = {
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

  type PricesProposalResponseData = {
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

  interface ProposalData extends ProposalResponseData {
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

  type PricesProposalsResponse = {
    proposals: PricesProposalResponseData[]
  }

  type PricesProposalResponse = {
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

  type PricesProposalData = {
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

  type ProposalMapper = {
    [proposalId: string]: PricesProposalData
  }

  type PricesGaugeOverviewData = {
    address: string
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

  type CurveApiBaseGauge = {
    isPool: boolean
    name: string
    shortName: string
    factory: boolean
    lpTokenPrice: number | null
    blockchainId: string
    gauge: string
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

  type CurveApiPoolGauge = CurveApiBaseGauge & {
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

  type CurveApiLendingGauge = CurveApiBaseGauge & {
    isPool: false
    lendingVaultUrls: {
      deposit: string
      withdraw: string
    }
    lendingVaultAddress: string
  }

  type CurveApiGaugeData = CurveApiPoolGauge | CurveApiLendingGauge

  type CurveGaugeResponse = {
    success: boolean
    data: {
      [poolId: string]: CurveApiGaugeData
    }
    generatedTimeMs: number
  }

  type PricesGaugeOverviewResponse = {
    gauges: PricesGaugeOverviewData[]
  }

  interface GaugeFormattedData extends PricesGaugeOverviewData {
    title: string
    platform: string
    gauge_weight: number
  }

  interface GaugeMapper {
    [gaugeAddress: string]: GaugeFormattedData
  }

  interface GaugeCurveApiDataMapper {
    [gaugeAddress: string]: CurveApiGaugeData
  }

  type GaugeVotesResponse = {
    votes: GaugeVoteData[]
  }

  type GaugeVoteData = {
    user: string
    weight: number
    block_number: number
    timestamp: string
    transaction: string
  }

  type GaugeVote = {
    user: string
    weight: number
    block_number: number
    timestamp: number
    transaction: string
  }

  interface GaugeVotesMapper {
    [gaugeAddress: string]: {
      fetchingState: FetchingState
      votes: GaugeVote[]
    }
  }

  type GaugeWeightHistoryData = {
    is_killed: boolean
    gauge_weight: number
    gauge_relative_weight: number
    emissions: number
    epoch: number
  }

  interface UserMapper {
    [userAddress: string]: {
      ens: string
    }
  }

  interface UserVoteData {
    voteId: number
    voteType: 'PARAMETER' | 'OWNERSHIP'
    userVote: 'no' | 'yes' | 'even'
  }

  type SnapshotVotingPower = {
    loading: boolean
    value: number
    blockNumber: number
  }

  type ActiveProposal = {
    active: boolean
    startTimestamp: number
    endTimestamp: number
  }

  type VeCrvFeeRes = {
    fees_usd: number
    timestamp: string
  }

  type VeCrvFee = {
    fees_usd: number
    timestamp: number
    date: string
  }

  interface VeCrvFeesRes {
    distributions: VeCrvFeeRes[]
    page: number
    count: number
  }

  type VeCrvDailyLock = {
    day: string
    amount: string
  }

  interface VeCrvDailyLockRes {
    locks: { day: string; amount: string }[]
  }

  interface VeCrvHolder {
    user: string
    locked: number
    weight: number
    weight_ratio: number
    unlock_time: number
  }

  interface VeCrvHoldersRes {
    locks: {
      user: string
      locked: string
      weight: string
      weight_ratio: string
      unlock_time: number
    }[]
  }

  interface UserLockApi {
    amount: string
    unlock_time: number
    lock_type: veCrvLockType
    locked_balance: string
    block_number: number
    dt: string
    transaction_hash: string
  }

  interface UserLockRes {
    locks: UserLockApi[]
  }

  interface UserLock {
    amount: number
    unlock_time: number
    lock_type: veCrvLockType
    locked_balance: number
    block_number: number
    date: string
    transaction_hash: string
  }

  interface UserProposalVoteResData {
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

  interface UserProposalVoteData {
    vote_id: number
    vote_type: string
    vote_for: number
    vote_against: number
    vote_open: number
    vote_close: number
    vote_total_supply: number
  }

  interface UserProposalVotesRes {
    page: number
    count: number
    data: UserProposalVoteResData[]
  }

  type UserGaugeVoteData = {
    gauge: string
    gauge_name: string
    weight: number
    block_number: number
    timestamp: string
    transaction: string
  }

  type UserGaugeVote = {
    gauge: string
    gauge_name: string
    weight: number
    block_number: number
    timestamp: number
    transaction: string
  }

  type UserGaugeVotesRes = {
    votes: UserGaugeVote[]
  }

  type UserGaugeVoteWeightResData = {
    userPower: string
    userVeCrv: string
    userFutureVeCrv: string
    expired: boolean
    gaugeData: {
      gaugeAddress: string
      isKilled: boolean
      lpTokenAddress: string
      network: string
      poolAddress: string
      poolName: string
      poolUrl: string
      relativeWeight: string
      totalVeCrv: string
    }[]
  }

  type UserGaugeVoteWeight = {
    title: string
    userPower: number
    userVeCrv: number
    userFutureVeCrv: number
    expired: boolean
    gaugeAddress: string
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
  }

  type UserGaugeVoteWeightRes = {
    powerUsed: string
    veCrvUsed: string
    gauges: UserGaugeVoteWeightResData[]
  }

  type UserGaugeVoteWeightsMapper = {
    [userAddress: string]: {
      fetchingState: FetchingState
      data: {
        powerUsed: number
        veCrvUsed: number
        gauges: UserGaugeVoteWeight[]
      }
    }
  }

  interface FnStepEstGasApprovalResponse {
    activeKey: string
    isApproved: boolean
    estimatedGas: EstimatedGas
    error: string
  }

  interface FnStepApproveResponse {
    activeKey: string
    hashes: string[]
    error: string
  }

  interface FnStepResponse {
    activeKey: string
    hash: string
    error: string
  }

  type FetchingState = 'LOADING' | 'SUCCESS' | 'ERROR'
  type TransactionState = '' | 'CONFIRMING' | 'LOADING' | 'SUCCESS' | 'ERROR'
  type ProposalListFilter = 'all' | 'active' | 'passed' | 'denied' | 'executable'
  type ProposalListFilterItem = { key: ProposalListFilter; label: string }
  type SortByFilterProposals = 'timeCreated' | 'endingSoon'
  type SortByFilterGaugesKeys =
    | 'gauge_relative_weight'
    | 'gauge_relative_weight_7d_delta'
    | 'gauge_relative_weight_60d_delta'
  type SortByFilterGauges = {
    key: SortByFilterGaugesKeys
    order: SortDirection
  }
  type SortDirection = 'asc' | 'desc'
  type TopHoldersSortBy = 'weight' | 'locked' | 'weight_ratio'
  type AllHoldersSortBy = 'weight' | 'locked' | 'weight_ratio' | 'unlock_time'
  type UserLocksSortBy = 'date' | 'amount' | 'unlock_time'
  type UserGaugeVotesSortBy = 'weight' | 'timestamp'
  type UserProposalVotesSortBy = 'vote_id' | 'vote_for' | 'vote_against' | 'vote_open' | 'vote_close'
  type GaugeVotesSortBy = 'weight' | 'timestamp'
  type UserGaugeVoteWeightSortBy = 'userPower' | 'userVeCrv'
  type veCrvLockType = 'CREATE_LOCK' | 'WITHDRAW' | 'INCREASE_LOCK_AMOUNT' | 'INCREASE_UNLOCK_TIME'

  export enum ClaimButtonsKey {
    '3CRV' = '3CRV',
    crvUSD = 'crvUSD',
  }
  export type AlertFormErrorKey = keyof typeof ALERT_FORM_ERROR_KEYS
}

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
