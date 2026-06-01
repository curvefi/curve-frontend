import {
  CurveApi,
  ChainId,
  RFormType,
  TokensMapper,
  PoolData,
  PoolDataCache,
  PoolAlert,
  type PoolUrlParams,
} from '@/dex/types/main.types'

export interface EstimatedGas {
  loading: boolean
  estimatedGas: number | null
  error?: string | null
}

export interface Slippage {
  loading: boolean
  slippage: number | null
  isHighSlippage: boolean
  isBonus: boolean
  error: string
}

export type TransferFormType = 'swap' | 'deposit' | 'withdraw' | 'manage-gauge'

export interface Seed {
  isSeed: boolean | null
  loaded: boolean
}

export interface PageTransferProps {
  curve: CurveApi | null
  params: PoolUrlParams
  routerParams: { rChainId: ChainId; rPoolIdOrAddress: string; rFormType: RFormType }
  hasDepositAndStake: boolean
  poolData: PoolData | undefined
  poolDataCacheOrApi: PoolData | PoolDataCache
}

export type TransferProps = {
  chainIdPoolId: string
  blockchainId: string
  poolAlert: PoolAlert | null
  maxSlippage: string
  seed: Seed
  tokensMapper: TokensMapper
} & PageTransferProps
