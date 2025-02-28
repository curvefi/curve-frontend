import { FetchStatus, TransactionStatus } from '@/loan/types/loan.types'

export const isReady = (status: FetchStatus) => status === 'success'
export const isLoading = (status: FetchStatus) => status === 'loading'
export const isIdle = (status: FetchStatus) => status === ''

export const txIsConfirming = (status: TransactionStatus) => status === 'confirming'
export const txIsSuccess = (status: TransactionStatus) => status === 'success'
export const txIsLoading = (status: TransactionStatus) => status === 'loading'

export const oneMonthProjectionYield = (apy: number, balance: number) => (apy / 100 / 12) * balance
export const oneYearProjectionYield = (apy: number, balance: number) => (apy / 100) * balance
