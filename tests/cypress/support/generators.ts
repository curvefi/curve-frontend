import type { Address } from '@curvefi/prices-api'

export const oneFloat = (minOrMax = 1, maxExclusive?: number): number =>
  maxExclusive === undefined ? Math.random() * minOrMax : minOrMax + Math.random() * (maxExclusive - minOrMax)

export const oneInt = (minOrMax = 100, maxExclusive?: number): number => Math.floor(oneFloat(minOrMax, maxExclusive))

export const range = (lengthOrStart: number, length?: number) =>
  length === undefined
    ? Array.from({ length: lengthOrStart }, (_, i) => i)
    : Array.from({ length }, (_, i) => i + lengthOrStart)

export const oneOf = <T>(...options: T[]) => options[oneInt(0, options.length)]

export const oneAddress = (): Address =>
  `0x${oneInt(0, 16 ** 40)
    .toString(16)
    .padStart(40, '0')}`

export const onePrice = (max = 1e10) => oneFloat(max)

export const shuffle = <T>(...options: T[]): T[] => {
  const result = [...options]
  for (let i = result.length - 1; i > 0; i--) {
    const j = oneInt(i + 1)
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}
