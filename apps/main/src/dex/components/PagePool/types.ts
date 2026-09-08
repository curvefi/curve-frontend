import { TokensMapper, PoolAlert, type PoolUrlParams } from '@/dex/types/main.types'
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
  params: PoolUrlParams
  hasDepositAndStake: boolean
}

export type TransferProps = {
  poolAlert: PoolAlert | null
  maxSlippage: Decimal
  seed: Seed
  tokensMapper: TokensMapper
} & PageTransferProps

export type TransferTabsParams = TransferProps & {
  isGaugeKilled: boolean | undefined
  isGaugeManager: boolean | undefined
  isRewardsDistributor: boolean | undefined
}
