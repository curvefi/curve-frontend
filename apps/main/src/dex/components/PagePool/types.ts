import {
  CurveApi,
  ChainId,
  TokensMapper,
  PoolData,
  PoolDataCache,
  PoolAlert,
  type PoolUrlParams,
} from '@/dex/types/main.types'
import type { MakeRequired } from '@evm-ui/types/util'
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
  poolDataCacheOrApi: PoolData | PoolDataCache
}

export type TransferProps = {
  blockchainId: string
  poolAlert: PoolAlert | null
  maxSlippage: Decimal
  seed: Seed
  tokensMapper: TokensMapper
} & PageTransferProps

export type TransferTabsParams = MakeRequired<TransferProps, 'poolData'> & {
  isGaugeManager: boolean | undefined
  isRewardsDistributor: boolean | undefined
}
