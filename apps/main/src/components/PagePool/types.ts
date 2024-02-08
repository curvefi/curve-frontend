import { Params } from 'react-router'

export type EstimatedGas = {
  loading: boolean
  estimatedGas: number | null
  error?: string | null
}

export type Slippage = {
  loading: boolean
  slippage: number | null
  isHighSlippage: boolean
  isBonus: boolean
  error: string
}

export type TransferFormType = 'swap' | 'deposit' | 'withdraw'

export type Seed = {
  isSeed: boolean | null
  cryptoSeedInitialRate: string
  loaded: boolean
  error: string
}

export type PageTransferProps = {
  curve: CurveApi | null
  params: Params
  routerParams: { rChainId: ChainId; rPoolId: string; rFormType: RFormType }
  hasDepositAndStake: boolean
  poolData: PoolData | undefined
  poolDataCacheOrApi: PoolData | PoolDataCache
}

export type TransferProps = {
  imageBaseUrl: string
  poolAlert: PoolAlert | null
  maxSlippage: string
  seed: Seed
  userPoolBalances: Balances | undefined
  userPoolBalancesLoading: boolean
  tokensMapper: TokensMapper
} & PageTransferProps

export type DetailInfoTypes = 'user' | 'pool' | 'advanced'
