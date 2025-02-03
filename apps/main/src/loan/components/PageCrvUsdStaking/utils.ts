import { FetchStatus, TransactionStatus } from '@/loan/types/loan.types'

export const isReady = (status: FetchStatus) => status === 'success'
export const isLoading = (status: FetchStatus) => status === 'loading'
export const isIdle = (status: FetchStatus) => status === ''

export const txIsConfirming = (status: TransactionStatus) => status === 'confirming'
export const txIsSuccess = (status: TransactionStatus) => status === 'success'
export const txIsError = (status: TransactionStatus) => status === 'error'
export const txIsLoading = (status: TransactionStatus) => status === 'loading'
export const txIsIdle = (status: TransactionStatus) => status === ''

export function toUTC(timestamp: string | number): number {
  if (typeof timestamp === 'number') {
    return timestamp
  }

  const parsed = Number(timestamp)
  if (!Number.isNaN(parsed)) {
    return parsed
  }

  const [date, time] = timestamp.split('T')
  const [year, month, day] = date.split('-').map(Number)
  const [timeWithoutZ] = time.split('.') // Handle milliseconds by splitting on dot
  const [hour, minute, second] = timeWithoutZ.split(':').map(Number)

  return Date.UTC(year, month - 1, day, hour, minute, second) / 1000
}
