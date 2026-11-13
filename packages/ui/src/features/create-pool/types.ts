import type { ComponentType } from 'react'
import type { Address } from '@primitives/address.utils'
import type { Decimal } from '@primitives/decimal.utils'
import type { NumberFormatCategory } from '@primitives/number.utils'
import type { MutationStatus } from '@tanstack/react-query'
import type { UseFormReturn } from '@ui/features/forms'
import type { PoolFormProps } from '@ui/features/pool-forms/pool-form.types'
import type { PoolTokenFields } from '@ui/features/pool-forms/pool-form.utils'
import type { QueryProp } from '@ui/features/queries/util'
import type { TokenOption } from '@ui/features/select-token/types'
import type { CreatePoolSection } from './constants'

export type CreatePoolTokenField = `token_${number}`
export type CreatePoolTokenFields = Record<CreatePoolTokenField, Address | undefined> &
  Record<`symbol_${number}`, string | undefined> &
  Record<`decimals_${number}`, number | undefined>

export type CreatePoolToken = { address: Address; symbol?: string; decimals?: number }
export type PoolType = 'stableswap' | 'cryptoswap' | 'fxswap'

export type CreatePoolFormValues = PoolTokenFields &
  CreatePoolTokenFields & {
    tokenCount: number
    poolType: PoolType | undefined
    preset: string
    amplification: Decimal | undefined
    fee: Decimal | undefined
    feeMultiplier: Decimal | undefined
    priceOracleAveragingWindow: Decimal | undefined
    poolName: string | undefined
    symbol: string | undefined
    maxAmounts: (Decimal | undefined)[] | undefined
    addLiquidity: boolean
  }

export type PoolParameters = Pick<
  CreatePoolFormValues,
  'amplification' | 'fee' | 'feeMultiplier' | 'priceOracleAveragingWindow'
>
export type PoolParameterRanges = Record<'amplification' | 'fee', { min: number; max: number }>

export type CreatePoolNetwork = { name: string; nativeCurrency: { symbol: string } }

export type PoolParameter = {
  name: keyof PoolParameters
  label: string
  format: NumberFormatCategory
  unit?: string
  advanced?: boolean
  summaryLabel?: string
}

export type PoolPreset = { id: string; label: string; values: PoolParameters }

export type PoolTypeOption = {
  id: PoolType
  disabled: boolean
  label: string
  description: string
  defaultPreset: string
  presets: PoolPreset[]
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
  tokenOptions: QueryProp<(TokenOption & { balance?: Decimal; tokenPrice?: number })[]>
}

export type CreatePoolTokensProps = CreatePoolTokenSearchProps & {
  form: UseFormReturn<CreatePoolFormValues>
  network: CreatePoolNetwork
  availability: QueryProp<number[]>
  blockchainId: string
  limits: PoolParameterRanges & { tokens: { min: number; max: number }; nameMaxBytes: number; symbolMaxBytes: number }
  inputsDisabled: boolean
  setTokens: (tokens: (CreatePoolToken | undefined)[]) => void
}

export type CreatePoolLiquidityProps = {
  form: UseFormReturn<CreatePoolFormValues>
  maxAmounts: QueryProp<Decimal>[] | undefined
  totalDepositValueUsd: QueryProp<Decimal>
  inputsDisabled: boolean
}

export type CreatePoolSummaryProps = Pick<
  PoolFormProps<CreatePoolFormValues>,
  'error' | 'formErrors' | 'userAddress'
> & {
  form: UseFormReturn<CreatePoolFormValues>
  poolType: PoolTypeOption | undefined
  preset: PoolPreset | undefined
  network: CreatePoolNetwork
  blockchainId: string
  poolListUrl: string
  totalDepositValueUsd: QueryProp<Decimal>
  creationFee: QueryProp<Decimal>
  expectedLp: QueryProp<Decimal>
  created: { explorerUrl: string; depositUrl: string } | undefined
  wallet: PoolFormProps<CreatePoolFormValues>['wallet']
  isPending: boolean
  isLoading: boolean
  isDisabled: boolean
  isFunded: boolean
  transactions: { label: string; status: MutationStatus }[]
}

export type CreatePoolFormProps = Omit<PoolFormProps<CreatePoolFormValues>, 'footer' | 'tokens'> &
  CreatePoolTokensProps &
  CreatePoolLiquidityProps &
  Omit<CreatePoolSummaryProps, 'poolType' | 'preset'> & {
    poolTypes: readonly PoolTypeOption[]
    completed: Record<CreatePoolSection, boolean>
  }
