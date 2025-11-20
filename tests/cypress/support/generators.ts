import type { Address } from '@curvefi/prices-api'
import { range, recordValues } from '@curvefi/prices-api/objects.util'

export const MAX_USD_VALUE = 40_000_000 // $ 40m 🤑 not higher so we can test the highest TVL

export const oneFloat = (minOrMax = 1, maxExclusive?: number): number =>
  maxExclusive === undefined ? Math.random() * minOrMax : minOrMax + Math.random() * (maxExclusive - minOrMax)

export const oneInt = (minOrMax = 100, maxExclusive?: number): number => Math.floor(oneFloat(minOrMax, maxExclusive))

export const oneOf = <T>(...options: T[]) => options[oneInt(0, options.length)]
export const oneBool = () => oneOf(true, false)
export const oneValueOf = <K extends keyof any, T>(obj: Record<K, T>) => oneOf(...recordValues(obj))

export const oneAddress = (): Address =>
  `0x${range(4) // create separate ints otherwise they aren't large enough
    .map(() =>
      oneInt(0, 16 ** 10)
        .toString(16)
        .padStart(10, '0'),
    )
    .join('')}`

export const onePrice = (max = MAX_USD_VALUE) => oneFloat(max)

/**
 * Return a random Date between start and end (inclusive).
 * Accepts Date | number | string. Defaults to 2015-01-01 .. now.
 * Uses oneInt for randomness.
 *
 * @param start - start date (inclusive) or falsy to use 2015-01-01
 * @param end - end date (inclusive) or falsy to use now
 */
export const oneDate = (start?: Date | number | string, end?: Date | number | string): Date => {
  const s = start ? +new Date(start) : +new Date(2015, 0, 1)
  const e = end ? +new Date(end) : Date.now()
  const min = Math.min(s, e)
  const max = Math.max(s, e)
  return new Date(oneInt(min, max + 1))
}

export const shuffle = <T>(...options: T[]): T[] => {
  const result = [...options]
  for (let i = result.length - 1; i > 0; i--) {
    const j = oneInt(i + 1)
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

export const oneTokenType = () => oneOf('collateral', 'borrowed')
export type TokenType = ReturnType<typeof oneTokenType>
