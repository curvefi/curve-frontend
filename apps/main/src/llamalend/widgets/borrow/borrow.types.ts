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

export const [RANGE_MAX_BORROW, DEFAULT_RANGE_SIMPLE_MODE, RANGE_MAX_SAFETY] = [4, 10, 50] as const
export const DEFAULT_SLIPPAGE = 0.1 as const

export type BorrowFormQuery = PoolQuery<IChainId> & CompleteBorrowForm
export type BorrowFormQueryParams = FieldsOf<BorrowFormQuery>

export type Token = { symbol: string; address: string; chain: NetworkEnum }
