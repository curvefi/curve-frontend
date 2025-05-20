import type { Address } from '@curvefi/prices-api'

export const MAX_USD_VALUE = 100_000_000_000_000 // $ 100T 🤑

export const oneFloat = (minOrMax = 1, maxExclusive?: number): number =>
  maxExclusive === undefined ? Math.random() * minOrMax : minOrMax + Math.random() * (maxExclusive - minOrMax)

export const oneInt = (minOrMax = 100, maxExclusive?: number): number => Math.floor(oneFloat(minOrMax, maxExclusive))

/**
 * Generate an array of numbers from 0 to lengthOrStart - 1 or from lengthOrStart to lengthOrStart + length - 1
 * Example: range(3) => [0, 1, 2]
 * Example: range(2, 3) => [2, 3, 4]
 */
export const range = (lengthOrStart: number, length?: number) =>
  length === undefined
    ? Array.from({ length: lengthOrStart }, (_, i) => i)
    : Array.from({ length }, (_, i) => i + lengthOrStart)

export const oneOf = <T>(...options: T[]) => options[oneInt(0, options.length)]

export const oneAddress = (): Address =>
  `0x${range(4) // create separate ints otherwise they aren't large enough
    .map(() =>
      oneInt(0, 16 ** 10)
        .toString(16)
        .padStart(10, '0'),
    )
    .join('')}`

export const onePrice = (max = MAX_USD_VALUE) => oneFloat(max)

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
