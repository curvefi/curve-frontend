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

  type ProposalResponseData = {
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
  }

  interface ProposalData extends ProposalResponseData {
    status: 'Active' | 'Passed' | 'Denied'
    votesFor: number
    votesAgainst: number
    totalVotes: number
    totalVotesPercentage: number
    minAcceptQuorumPercent: number
    quorumVeCrv: number
    totalVeCrv: number
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

  type ProposalListFilter = 'all' | 'active' | 'passed' | 'denied'

  type SortByFilter = 'voteId' | 'endingSoon'

  type ActiveSortDirection = 'asc' | 'desc'
}
