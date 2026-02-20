import { BigNumber } from 'bignumber.js'
import type { Decimal } from './routes/routes.schemas'

export function assert<T>(value: T | null | undefined | 0 | false | '', message: string) {
  if (!value) {
    throw new Error(message)
  }
  return value
}

export const notFalsy = <T>(...items: (T | null | undefined | false | 0)[]): T[] => items.filter(Boolean) as T[]

export const handleTimeout = <T>(promise: Promise<T>, timeout: number, message?: string): Promise<T> =>
  new Promise((resolve, reject) => {
    const id = setTimeout(() => {
      clearTimeout(id)
      reject(new Error(message || `Promise timed out after ${timeout}ms`))
    }, timeout)
    promise.then(resolve, reject)
  })

/**
 * Returns the maximum Decimal value from an array of Decimals, without losing precision.
 */
export const decimalMax = (...data: Decimal[]): Decimal | undefined =>
  data.reduce<Decimal | undefined>(
    (max, value) => (max == null ? value : new BigNumber(value).isGreaterThan(max) ? value : max),
    undefined,
  )

export const toWei = (n: string, decimals: number) => BigNumber(n).shiftedBy(decimals).toFixed() as Decimal
export const fromWei = (n: string, decimals: number) => BigNumber(n).shiftedBy(-decimals).toFixed() as Decimal
export const decimalCompare = (a: Decimal, b: Decimal) => BigNumber(a).comparedTo(b) ?? 0
