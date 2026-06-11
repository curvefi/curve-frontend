import { FetchStatus, TransactionStatus } from '@/loan/types/loan.types'
import type { Decimal } from '@primitives/decimal.utils'
import { decimalDiv, decimalMultiply } from '@ui-kit/utils'

export const isReady = (status: FetchStatus) => status === 'success'
export const isLoading = (status: FetchStatus) => status === 'loading'

export const txIsConfirming = (status: TransactionStatus) => status === 'confirming'
export const txIsSuccess = (status: TransactionStatus) => status === 'success'
export const txIsLoading = (status: TransactionStatus) => status === 'loading'

export const oneMonthProjectionYield = (apy: Decimal, balance: Decimal) =>
  decimalDiv(decimalMultiply(apy, balance), '1200')
export const oneYearProjectionYield = (apy: Decimal, balance: Decimal) =>
  decimalDiv(decimalMultiply(apy, balance), '100')
