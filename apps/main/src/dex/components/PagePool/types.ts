import {
  CurveApi,
  ChainId,
  TokensMapper,
  PoolData,
  PoolAlert,
  PoolDataCacheOrApi,
  type PoolUrlParams,
} from '@/dex/types/main.types'
import type { QueryProp } from '@evm-ui/types/util'
import type { Decimal } from '@primitives/decimal.utils'

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

export type TransferFormType = 'swap' | 'deposit' | 'withdraw' | 'manage-gauge'

export type Seed = {
  isSeed: boolean | null
  loaded: boolean
}

export type PageTransferProps = {
  curve: CurveApi | null
  params: PoolUrlParams
  routerParams: { rChainId: ChainId; rPoolIdOrAddress: string }
  hasDepositAndStake: boolean
  poolData: PoolData | undefined
  poolDataCacheOrApi: PoolDataCacheOrApi
}

export type PoolPageTransferProps = Omit<PageTransferProps, 'hasDepositAndStake' | 'poolDataCacheOrApi'> & {
  hasDepositAndStake?: boolean
  poolQuery: QueryProp<PoolDataCacheOrApi | undefined>
}

export type TransferProps = {
  blockchainId: string
  poolAlert: PoolAlert | null
  maxSlippage: Decimal
  seed: Seed
  tokensMapper: TokensMapper
} & PageTransferProps
