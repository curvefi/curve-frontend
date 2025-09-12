import type { NetworkEnum } from '@/llamalend/llamalend.types'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import type { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import type { MintMarketTemplate } from '@curvefi/llamalend-api/lib/mintMarkets'
import type { FieldsOf } from '@ui-kit/lib'
import type { PoolQuery } from '@ui-kit/lib/model'
import type { MakeOptional } from '@ui-kit/types/util'

/** Complete borrow creation form with all fields already filled in (after validation) */
export type CompleteBorrowForm = {
  userCollateral: number
  userBorrowed: number // currently hidden and always 0
  debt: number
  range: number
  slippage: number
  leverage: number | undefined
}

/** Borrow creation form as used in the UI, with some fields still optional or being filled in */
export type BorrowForm = MakeOptional<CompleteBorrowForm, 'debt' | 'userCollateral'>

/** Fields of the borrow form that are passed back to the origin application for synchronization */
export type BorrowFormExternalFields = Pick<BorrowForm, 'range' | 'userCollateral' | 'debt'>
/** Callback type to pass on the external fields of the borrow form */
export type OnBorrowFormUpdate = (form: BorrowFormExternalFields) => Promise<void>

/** Full query type for borrow creation queries, including pool identification and all form fields */
export type BorrowFormQuery = PoolQuery<IChainId> & CompleteBorrowForm
/** Fields of the borrow form query before validation */
export type BorrowFormQueryParams = FieldsOf<BorrowFormQuery>

/** A simple token representation */
export type Token = { symbol: string; address: string; chain: NetworkEnum }

/**
 * Preset options for borrowing
 * @see BORROW_PRESET_RANGES
 **/
export enum BorrowPreset {
  Safe = 'Safe',
  MaxLtv = 'MaxLtv',
  Custom = 'Custom',
}

/**
 * Union type of the possible Llama market templates
 * We strive to keep the application independent of the market type as much as possible
 */
export type LlamaMarketTemplate = MintMarketTemplate | LendMarketTemplate
