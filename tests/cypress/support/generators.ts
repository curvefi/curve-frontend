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
