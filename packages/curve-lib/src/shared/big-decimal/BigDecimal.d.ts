export declare class BigDecimal {
  constructor(value: BigDecimalTypes.Value, scale?: number)

  abs(): BigDecimal
  plus(n: BigDecimalTypes.Value): BigDecimal
  minus(n: BigDecimalTypes.Value): BigDecimal
  times(n: BigDecimalTypes.Value): BigDecimal
  div(n: BigDecimalTypes.Value, scale?: number): BigDecimal
  pow(n: number): BigDecimal
  sqrt(scale?: number): BigDecimal
  eq(n: BigDecimalTypes.Value): boolean
  gt(n: BigDecimalTypes.Value): boolean
  gte(n: BigDecimalTypes.Value): boolean
  lt(n: BigDecimalTypes.Value): boolean
  lte(n: BigDecimalTypes.Value): boolean
  isZero(): boolean
  isPositive(): boolean
  isNegative(): boolean
  toString(): string
  toFixed(dp: number): string

  static from(n: BigDecimalTypes.Value, scale?: number): BigDecimal
  static fr(n: BigDecimalTypes.Value, scale?: number): BigDecimal
  static max(...n: BigDecimalTypes.Value[]): BigDecimal
  static min(...n: BigDecimalTypes.Value[]): BigDecimal
  static isBigDecimal(n: any): n is BigDecimal
}

export declare namespace BigDecimalTypes {
  type IntegerPart = `${'-' | ''}${bigint}`
  type FractionPart = `${number}`
  export type StringDecimal = `${IntegerPart}` | `${IntegerPart}.${FractionPart}`

  type Value = StringDecimal | number | bigint | BigDecimal

  interface Config {
    DECIMAL_PLACES?: number
    ROUNDING_MODE?: RoundingMode
    EXPONENTIAL_AT?: number | [number, number]
    RANGE?: number | [number, number]
    CRYPTO?: boolean
    MODULO_MODE?: ModuloMode
    POW_PRECISION?: number
    FORMAT?: Format
    ALPHABET?: string
  }

  interface Format {
    prefix?: string
    decimalSeparator?: string
    groupSeparator?: string
    groupSize?: number
    secondaryGroupSize?: number
    fractionGroupSeparator?: string
    fractionGroupSize?: number
    suffix?: string
  }

  type RoundingMode = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8
  type ModuloMode = 0 | 1 | 3 | 6 | 9

  const ROUND_UP: 0
  const ROUND_DOWN: 1
  const ROUND_CEIL: 2
  const ROUND_FLOOR: 3
  const ROUND_HALF_UP: 4
  const ROUND_HALF_DOWN: 5
  const ROUND_HALF_EVEN: 6
  const ROUND_HALF_CEIL: 7
  const ROUND_HALF_FLOOR: 8
  const EUCLID: 9
}

export default BigDecimal
