import type { IDict, IChainId, INetworkName } from '@curvefi/api/lib/interfaces'
import type { SearchParams as PoolListSearchParams } from '@/components/PagePoolList/types'
import type { Location, NavigateFunction, Params } from 'react-router'
import type { PoolTemplate } from '@curvefi/api/lib/pools'
import type { TooltipProps } from '@/ui/Tooltip/types'
import type { Eip1193Provider, WalletState } from '@web3-onboard/core'
import type curveApi from '@curvefi/api'

import { ethers } from 'ethers'
import React from 'react'
import curvejsApi from '@/lib/curvejs'

declare global {
  interface Window {
    clipboardData: any
    ethereum: Eip1193Provider
    exodus?: Eip1193Provider
    enkrypt?: { providers: { ethereum: Eip1193Provider } }
  }

  type Balances = IDict<string>
  type Balance = string | IDict<string>

  type CurveApi = typeof curveApi & { chainId: IChainId }
  type ChainId = IChainId
  type NetworkEnum = INetworkName

  type NetworkConfigFromApi = {
    hasDepositAndStake: boolean | undefined
    hasRouter: boolean | undefined
  }

  type NetworkConfig = {
    name: string
    id: NetworkEnum
    networkId: ChainId
    api: typeof curvejsApi
    blocknativeSupport: boolean
    compensations: { [poolId: string]: boolean }
    ethTokenAddress: { [key: string]: string }
    poolCustomTVL: { [poolAddress: string]: string }
    poolIsWrappedOnly: { [poolAddress: string]: boolean }
    poolFilters: string[]
    excludeRoutes: string[]
    excludeGetUserBalancesTokens: string[] // tokens that cause issues when getting wallet balances
    forms: string[]
    gasL2: boolean
    gasPricesUnit: string
    gasPricesUrl: string
    gasPricesDefault: number
    hex: string
    hidePoolRewards: { [poolId: string]: boolean }
    hideSmallPoolsTvl: number
    icon: FunctionComponent<SVGProps<SVGSVGElement>>
    imageBaseUrl: string
    integrations: {
      imageBaseurl: string
      listUrl: string
      tagsUrl: string
    }
    missingPools: { name: string; url: string }[]
    orgUIPath: string
    poolListFormValuesDefault: Partial<PoolListSearchParams>
    rpcUrlConnectWallet: string // for wallet connect
    rpcUrl: string // for curvejs & curve-stablecoin api
    swap: { [key: string]: string }
    customPoolIds: { [key: string]: boolean }
    showHideSmallPoolsCheckbox: boolean
    showInSelectNetwork: boolean
    swapCustomRouteRedirect: {
      [key: string]: string
    }
    symbol: string
    createQuickList: {
      address: string
      haveSameTokenName: boolean
      symbol: string
    }[]
    basePools: {
      name: string
      token: string
      pool: string
      coins: string[]
    }[]
    stableSwapFactory: boolean
    cryptoSwapFactory: boolean
    tricryptoFactory: boolean
    stableSwapNg: boolean
    hasFactory: boolean
    pricesApi: boolean
    scanAddressPath: (hash: string) => string
    scanTxPath: (hash: string) => string
    scanTokenPath: (hash: string) => string
  }

  type CurrencyReservesToken = {
    token: string
    tokenAddress: string
    balance: string
    balanceUsd: string
    usdRate: number
    percentShareInPool: string
  }
  type CurrencyReserves = {
    poolId: string
    tokens: CurrencyReservesToken[]
    total: string
    totalUsd: string
  }
  type CurrencyReservesMapper = { [chainPoolId: string]: CurrencyReserves }

  type PageProps = {
    curve: CurveApi | null
    chainId: ChainId | null
    haveSigner: boolean
    signerAddress: string
  }

  type Pool = PoolTemplate
  type Provider = ethers.BrowserProvider | Eip1193Provider

  // pool rewards
  export type ClaimableReward = {
    token: string
    symbol: string
    amount: string
    price: number
  }

  export type RewardBase = {
    day: string
    week: string
  }
  export type RewardCrv = number
  export type RewardOther = {
    apy: number
    decimals?: number
    gaugeAddress: string
    name?: string
    symbol: string
    tokenAddress: string
    tokenPrice?: number
  }
  export type RewardsApy = {
    poolId: string
    base: RewardBase
    other: RewardOther[]
    crv: RewardCrv[]
    error: { [rewardType: string]: boolean }
  }
  export type RewardsApyMapper = { [poolId: string]: RewardsApy }

  type PoolParameters = {
    A: string
    adminFee: string
    fee: string
    future_A?: string
    future_A_time?: number
    gamma?: string
    initial_A?: string
    initial_A_time?: number
    lpTokenSupply: string
    priceOracle?: string[]
    priceScale?: string[]
    virtualPrice: string
  }

  type Token = {
    address: string
    ethAddress?: string
    symbol: string
    haveSameTokenName: boolean // use to display token address if duplicated token names
    volume?: number
  }
  type TokensMapper = { [tokenAddress: string]: Token | undefined }
  type TokensNameMapper = { [tokenAddress: string]: string }
  type UserBalancesMapper = { [tokenAddress: string]: string | undefined }
  type UserToken = {
    address: string
    userBalance: string
    userBalanceUsd: number
    usdRate: number | undefined
  }
  type UserTokensMapper = { [tokenAddress: string]: UserToken }

  interface PoolData {
    idx?: number
    chainId: ChainId
    pool: Pool

    hasWrapped: boolean
    hasVyperVulnerability: boolean
    isWrapped: boolean
    currenciesReserves: CurrencyReserves | null
    parameters: PoolParameters
    seedData: { token: string; percent: number }[]
    tokenAddresses: string[]
    tokenAddressesAll: string[]
    tokens: string[]
    tokensCountBy: { [key: string]: number }
    tokensAll: string[]
    tokensLowercase: string[]
    curvefiUrl: string
    failedFetching24hOldVprice: boolean
  }

  type PoolDataMapper = { [poolAddress: string]: PoolData }

  type PoolDataCache = {
    hasWrapped: boolean
    hasVyperVulnerability: boolean
    tokenAddresses: string[]
    tokenAddressesAll: string[]
    tokens: string[]
    tokensCountBy: { [key: string]: number }
    tokensAll: string[]
    tokensLowercase: string[]
    pool: {
      id: string
      name: string
      address: string
      gauge: string
      gaugeStatus: { rewardsNeedNudging: boolean; areCrvRewardsStuckInBridge: boolean } | null
      lpToken: string
      isCrypto: boolean
      isStableNg: boolean
      isFactory: boolean
      isLending: boolean
      implementation: string
      isGaugeKilled: boolean
      referenceAsset: string
    }
  }

  type SnapshotsMapper = { [poolAddress: string]: PricesApiSnapshotsData }

  type PricesApiSnapshotsData = {
    timestamp: number
    a: number
    fee: number
    admin_fee: number
    virtual_price: number
    xcp_profit: number
    xcp_profit_a: number
    base_daily_apr: number
    base_weekly_apr: number
    offpeg_fee_multiplier: number
    gamma: number
    mid_fee: number
    out_fee: number
    fee_gamma: number
    allowed_extra_profit: number
    adjustment_step: number
    ma_half_time: number
    price_scale: number[]
    price_oracle: number[]
    block_number: number
  }

  // REST
  type PricesApiSnapshotsResponse = {
    address: string
    chain: string
    data: PricesApiSnapshotsData[]
  }

  type PoolDataCacheMapper = { [poolAddress: string]: PoolDataCache }

  type PoolDataCacheOrApi = PoolData | PoolDataCache

  type PageWidthClassName = 'page-wide' | 'page-large' | 'page-medium' | 'page-small' | 'page-small-x' | 'page-small-xx'

  type RouterParams = {
    rChainId: ChainId
    rPoolId: string
    rFormType: 'deposit' | 'withdraw' | 'swap' | 'adjust_crv' | 'adjust_date' | 'create'
  }

  type RouterProps = {
    params: Params
    location: Location
    navigate: NavigateFunction
  }

  type Tvl = {
    poolId: string
    value: string
    errorMessage: string
  }
  type TvlMapper = { [poolId: string]: Tvl }

  type UsdRatesMapper = { [tokenAddress: string]: number | undefined }
  type UserPoolListMapper = { [poolId: string]: boolean }

  type Volume = {
    poolId: string
    value: string
    errorMessage: string
  }
  type VolumeMapper = { [poolId: string]: Volume }

  type Wallet = WalletState

  type AlertType = 'info' | 'warning' | 'error' | 'danger' | ''

  interface PoolAlert extends TooltipProps {
    alertType: AlertType
    isDisableDeposit?: boolean // display alert in Page action and disable Deposit
    isDisableSwap?: boolean
    isInformationOnly?: boolean // display alert in pool detail information section
    isCloseOnTooltipOnly?: boolean // should only close if hover over Tooltip
    address?: string
    message: string | React.ReactNode
  }

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
}
