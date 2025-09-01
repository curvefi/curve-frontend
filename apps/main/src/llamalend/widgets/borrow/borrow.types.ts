import type { NetworkEnum } from '@/llamalend/llamalend.types'
import type { IChainId } from '@curvefi/api/lib/interfaces'
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

export const DEFAULT_SLIPPAGE = 0.1 as const

export type BorrowFormQuery = PoolQuery<IChainId> & CompleteBorrowForm
export type BorrowFormQueryParams = FieldsOf<BorrowFormQuery>

export type Token = { symbol: string; address: string; chain: NetworkEnum }

export enum BorrowPreset {
  Safe = 'Safe',
  MaxLtv = 'MaxLtv',
  Custom = 'Custom',
}

export const BORROW_PRESET_RANGES = {
  [BorrowPreset.Safe]: 50,
  [BorrowPreset.MaxLtv]: 4,
  [BorrowPreset.Custom]: 10,
}
