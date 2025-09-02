import type { NetworkEnum } from '@/llamalend/llamalend.types'
import type { IChainId } from '@curvefi/api/lib/interfaces'
import type { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import type { MintMarketTemplate } from '@curvefi/llamalend-api/lib/mintMarkets'
import type { FieldsOf } from '@ui-kit/lib'
import type { PoolQuery } from '@ui-kit/lib/model'

export type CompleteBorrowForm = {
  userCollateral: number
  userBorrowed: number // currently hidden and always 0
  debt: number
  range: number
  slippage: number
  leverage: number | undefined
}

export type BorrowForm = Omit<CompleteBorrowForm, 'debt' | 'userCollateral'> & {
  userCollateral: number | undefined
  debt: number | undefined
}

export type BorrowFormQuery = PoolQuery<IChainId> & CompleteBorrowForm
export type BorrowFormQueryParams = FieldsOf<BorrowFormQuery>

export type Token = { symbol: string; address: string; chain: NetworkEnum }

export enum BorrowPreset {
  Safe = 'Safe',
  MaxLtv = 'MaxLtv',
  Custom = 'Custom',
}

export type LlamaMarketTemplate = MintMarketTemplate | LendMarketTemplate
