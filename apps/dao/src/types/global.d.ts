import type { INetworkName } from '@curvefi/api/lib/interfaces'
import type { Eip1193Provider, WalletState } from '@web3-onboard/core'
import type { Locale } from '@/lib/i18n'
import type { Location, NavigateFunction, Params } from 'react-router'
import type curveApi from '@curvefi/api'

import { ethers } from 'ethers'
import curvejsApi from '@/lib/curvejs'

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

  type NetworkConfig = {
    name: string
    id: NetworkEnum
    networkId: ChainId
    api: typeof curvejsApi
    blocknativeSupport: boolean
    gasL2: boolean
    gasPricesUnit: string
    gasPricesUrl: string
    gasPricesDefault: number
    hex: string
    icon: FunctionComponent<SVGProps<SVGSVGElement>>
    imageBaseUrl: string
    orgUIPath: string
    rpcUrlConnectWallet: string // for wallet connect
    rpcUrl: string // for curvejs & curve-stablecoin api
    symbol: string
    showInSelectNetwork: boolean
    scanAddressPath: (hash: string) => string
    scanTxPath: (hash: string) => string
    scanTokenPath: (hash: string) => string
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

  type CurveJsProposalData = {
    voteId: number
    voteType: 'PARAMETER' | 'OWNERSHIP'
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
    tx: string
    creatorVotingPower: number
    script: string
    votes: {
      tx: string
      voteId: number
      voter: string
      supports: boolean
      stake: number
      relativePower: number
    }[]
  }

  type PricesProposalData = {
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
    creator_voting_power: string
    execution_tx: string
    script: string
    votes: {
      voter: string
      supports: boolean
      voting_power: string | number
      relative_power: number
      transaction_hash: string
    }[]
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

  type PricesGaugeOverviewResponse = {
    gauges: PricesGaugeOverviewData[]
  }

  interface GaugeFormattedData extends PricesGaugeOverviewData {
    title: string
    platform: string
    gauge_weight: number
  }

  type GaugeWeightHistoryData = {
    is_killed: boolean
    gauge_weight: number
    gauge_relative_weight: number
    emissions: number
    epoch: number
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

  type VeCrvFee = {
    fees_usd: number
    timestamp: number
    date: string
  }

  interface VeCrvFeesRes {
    distributions: VeCrvFee[]
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

  type FetchingState = 'LOADING' | 'SUCCESS' | 'ERROR'
  type ProposalListFilter = 'all' | 'active' | 'passed' | 'denied' | 'executable'
  type ProposalListFilterItem = { key: ProposalListFilter; label: string }
  type SortByFilterProposals = 'voteId' | 'endingSoon'
  type SortByFilterGauges = 'relativeWeight' | '7dayWeight' | '60dayWeight'
  type ActiveSortDirection = 'asc' | 'desc'
  type TopHoldersSortBy = 'weight' | 'locked' | 'weight_ratio'
  type AllHoldersSortBy = 'weight' | 'locked' | 'weight_ratio' | 'unlock_time'
}
