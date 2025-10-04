import type { IChainId, INetworkName } from '@curvefi/llamalend-api/lib/interfaces'
import type { FieldsOf } from '@ui-kit/lib'
import type { PoolQuery } from '@ui-kit/lib/model'
import type { MakeOptional } from '@ui-kit/types/util'
import { Decimal } from '@ui-kit/utils'

/** Complete borrow creation form with all fields already filled in (after validation) */
export type CompleteBorrowForm = {
  userCollateral: number
  userBorrowed: number // currently hidden and always 0
  debt: number
  range: number
  slippage: Decimal
  leverageEnabled: boolean
}

type CalculatedValues = { maxDebt: number | undefined; maxCollateral: number | undefined }

/** Borrow creation form as used in the UI, with some fields still optional or being filled in */
export type BorrowForm = MakeOptional<CompleteBorrowForm, 'debt' | 'userCollateral'> & CalculatedValues

/** Fields of the borrow form that are passed back to the origin application for synchronization */
export type BorrowFormExternalFields = Omit<BorrowForm, keyof CalculatedValues>
/** Callback type to pass on the external fields of the borrow form */
export type OnBorrowFormUpdate = (form: BorrowFormExternalFields) => Promise<void>

/** Full query type for borrow creation queries, including pool identification and all form fields */
export type BorrowFormQuery<T = IChainId> = PoolQuery<T> & CompleteBorrowForm
/** Fields of the borrow form query before validation */
export type BorrowFormQueryParams<T = IChainId> = FieldsOf<BorrowFormQuery<T>>

/** A simple token representation */
export type Token = { symbol: string; address: string; chain: INetworkName }

/**
 * Preset options for borrowing
 * @see BORROW_PRESET_RANGES
 **/
export enum BorrowPreset {
  Safe = 'Safe',
  MaxLtv = 'MaxLtv',
  Custom = 'Custom',
}

export type BorrowFormErrors = (readonly [keyof BorrowForm | 'root', string])[]
