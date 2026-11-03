import type { ComponentType } from 'react'
import type { Address } from '@primitives/address.utils'
import type { Decimal } from '@primitives/decimal.utils'
import type { NumberFormatCategory } from '@primitives/number.utils'
import type { UseFormReturn } from '@ui/features/forms'
import type { SlippageType } from '@ui/features/forms/slippage/slippage.utils'
import type { PoolFormProps } from '@ui/features/pool-forms/pool-form.types'
import type { PoolTokenFields } from '@ui/features/pool-forms/pool-form.utils'
import type { QueryProp } from '@ui/features/queries/util'
import type { TokenOption } from '@ui/features/select-token/types'
import type { CREATE_POOL_SECTIONS } from './constants'

export type CreatePoolFormValues = PoolTokenFields & {
  decimals: (number | undefined)[] | undefined
  tokens: (TokenOption | undefined)[]
  poolType: string | undefined
  preset: string
  amplification: Decimal | undefined
  fee: Decimal | undefined
  feeMultiplier: Decimal | undefined
  priceOracleAveragingWindow: Decimal | undefined
  poolName: string
  symbol: string
  maxAmounts: (Decimal | undefined)[] | undefined
  slippage: Decimal
  addLiquidity: boolean
}

export type PoolParameters = Pick<
  CreatePoolFormValues,
  'amplification' | 'fee' | 'feeMultiplier' | 'priceOracleAveragingWindow'
>
export type PoolParameterRanges = Record<'amplification' | 'fee', { min: number; max: number }>

export type PoolParameter = {
  name: keyof PoolParameters
  label: string
  format: NumberFormatCategory
  unit?: string
  advanced?: boolean
  summaryLabel?: string
  showInSummary?: boolean
}

export type PoolType = {
  id: string
  disabled: boolean
  label: string
  description: string
  liquidityDescription: string
  slippageType: SlippageType
  defaultPreset: string
  presets: { id: string; label: string; values: PoolParameters }[]
  parameters: PoolParameter[]
  CurvePreview?: ComponentType<{
    amplification: Decimal | undefined
    tokenCount: number
    tokenSymbol: string | undefined
  }>
}

export type CreatePoolTokenSearchProps = {
  tokenSearch: string
  onTokenSearch: (search: string) => void
  tokenOptions: QueryProp<TokenOption[]>
}

export type CreatePoolTokensProps = CreatePoolTokenSearchProps & {
  form: UseFormReturn<CreatePoolFormValues>
  blockchainId: string
  tokenCountRange: { min: number; max: number }
  inputsDisabled: boolean
  setTokens: (tokens: (TokenOption | undefined)[]) => void
}

export type CreatePoolLiquidityProps = {
  form: UseFormReturn<CreatePoolFormValues>
  poolTypes: readonly PoolType[]
  maxAmounts: QueryProp<Decimal>[] | undefined
  totalDepositValueUsd: QueryProp<Decimal>
  inputsDisabled: boolean
  userAddress: Address | undefined
}

export type CreatePoolSummaryProps = {
  form: UseFormReturn<CreatePoolFormValues>
  poolTypes: readonly PoolType[]
  blockchainId: string
  totalDepositValueUsd: QueryProp<Decimal>
  creationFee: QueryProp<Decimal>
  nativeSymbol: string
  created: { explorerUrl: string } | undefined
  poolListUrl: string
  wallet: PoolFormProps<CreatePoolFormValues>['wallet']
  isPending: boolean
  isLoading: boolean
  isDisabled: boolean
  isFunded: boolean
  isDepositing: boolean
}

export type CreatePoolFormProps = Omit<PoolFormProps<CreatePoolFormValues>, 'footer' | 'tokens'> &
  CreatePoolTokensProps &
  CreatePoolLiquidityProps &
  CreatePoolSummaryProps & {
    parameterRanges: PoolParameterRanges
    nameMaxBytes: number
    symbolMaxBytes: number
    completed: Record<(typeof CREATE_POOL_SECTIONS)[number]['value'], boolean>
  }
