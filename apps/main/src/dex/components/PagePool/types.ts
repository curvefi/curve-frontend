import { PoolAlert, type PoolAddressParams } from '@/dex/types/main.types'
import type { Decimal } from '@primitives/decimal.utils'
import type { QueryProp } from '@ui/features/queries/util'

export type EstimatedGas = { loading: boolean; estimatedGas: number | null; error?: string | null }

export type Slippage = {
  loading: boolean
  slippage: number | null
  isHighSlippage: boolean
  isBonus: boolean
  error: string
}

export type PageTransferProps = { params: PoolAddressParams }

export type TransferProps = {
  poolAlert: PoolAlert | null
  maxSlippage: Decimal
  seed: QueryProp<boolean | null>
} & PageTransferProps

export type TransferTabsParams = TransferProps & {
  isGaugeManager: boolean | undefined
  isRewardsDistributor: boolean | undefined
}
