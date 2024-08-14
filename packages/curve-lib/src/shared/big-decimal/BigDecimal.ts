import { BigDecimalTypes } from './BigDecimal.d'

class BigDecimal {
  private _integerPart: bigint
  private _fractionalPart: bigint
  private _scale: number
  private _isNegative: boolean

  /**
   * Creates a new BigDecimal instance.
   * @param value The value to create the BigDecimal from. If a string, it should be in the format "integer.fraction", "integer" or BigDecimal.
   * @param scale The scale (number of decimal places) to use. Defaults to 0 or the number of decimal places in the input string, whichever is larger.
   */
  constructor(value: BigDecimalTypes.Value, scale: number = 0) {
    if (scale < 0) {
      throw new Error('Scale must be non-negative')
    }

    if (value instanceof BigDecimal) {
      this._integerPart = value._integerPart
      this._fractionalPart = value._fractionalPart
      this._scale = Math.max(value._scale, scale)
      this._isNegative = value._isNegative
      return
    }

    if (typeof value === 'string') {
      const match = /^(-?)(\d+)(?:\.(\d+))?$/.exec(value)
      if (!match) {
        throw new Error('Invalid string format. Expected "integer.fraction" or "integer"')
      }

      const [, sign, intPart, fracPart = ''] = match
      this._integerPart = BigInt(intPart)
      this._fractionalPart = BigInt(fracPart.padEnd(scale, '0'))
      this._scale = Math.max(fracPart.length, scale)
      this._isNegative = sign === '-'
      return
    }

    this._scale = scale
    if (typeof value === 'number') {
      const [intPart, fracPart = ''] = Math.abs(value).toFixed(scale).split('.')
      this._integerPart = BigInt(intPart)
      this._fractionalPart = BigInt(fracPart)
      this._isNegative = value < 0
      return
    }

    if (typeof value === 'bigint') {
      this._integerPart = value < 0n ? -value : value
      this._fractionalPart = 0n
      this._isNegative = value < 0n
      return
    }

    throw new Error('Invalid value type')
  }

  static from(value: BigDecimalTypes.Value, scale: number = 0): BigDecimal {
    return new BigDecimal(value, scale)
  }

  static fr = BigDecimal.from

  static zero = BigDecimal.from(0)

  /**
   * Changes the sign of the BigDecimal.
   * @returns A new BigDecimal with the opposite sign.
   */
  negate(): BigDecimal {
    const result = new BigDecimal(this, this._scale)
    result._isNegative = !this._isNegative
    return result
  }

  abs(): BigDecimal {
    return this.isNegative() ? this.negate() : this
  }

  private scaleFactor(scale: number): bigint {
    return BigInt('1' + '0'.repeat(scale))
  }

  private toScaledBigInt(): bigint {
    return this._integerPart * this.scaleFactor(this._scale) + this._fractionalPart
  }

  plus(other: BigDecimal): BigDecimal {
    const maxScale = Math.max(this._scale, other._scale)
    const thisScaled = this.scaleUp(maxScale)
    const otherScaled = other.scaleUp(maxScale)

    const thisValue = thisScaled.toScaledBigInt()
    const otherValue = otherScaled.toScaledBigInt()

    if (this._isNegative === other._isNegative) {
      const sum = thisValue + otherValue
      const result = new BigDecimal(0, maxScale)
      result._integerPart = sum / this.scaleFactor(maxScale)
      result._fractionalPart = sum % this.scaleFactor(maxScale)
      result._isNegative = this._isNegative
      return result
    } else {
      const isThisGreater = thisValue > otherValue
      const greater = isThisGreater ? thisValue : otherValue
      const lesser = isThisGreater ? otherValue : thisValue
      const diff = greater - lesser
      const result = new BigDecimal(0, maxScale)
      result._integerPart = diff / this.scaleFactor(maxScale)
      result._fractionalPart = diff % this.scaleFactor(maxScale)
      result._isNegative = isThisGreater ? this._isNegative : other._isNegative
      return result
    }
  }

  minus(other: BigDecimal): BigDecimal {
    const negatedOther = other.negate()
    return this.plus(negatedOther)
  }

  times(other: BigDecimal): BigDecimal {
    const newScale = this._scale + other._scale
    const thisValue = this.toScaledBigInt()
    const otherValue = other.toScaledBigInt()
    const product = thisValue * otherValue
    const result = new BigDecimal(0, newScale)
    result._integerPart = product / this.scaleFactor(newScale)
    result._fractionalPart = product % this.scaleFactor(newScale)
    result._isNegative = this._isNegative !== other._isNegative
    return result
  }

  div(other: BigDecimal, scale: number = this._scale): BigDecimal {
    if (other.isZero()) {
      throw new Error('Division by zero')
    }
    const scaledThis = this.scaleUp(scale + other._scale + 1)
    const scaledOther = other.scaleUp(0)
    const thisValue = scaledThis.toScaledBigInt()
    const otherValue = scaledOther.toScaledBigInt()
    const quotient = thisValue / otherValue
    const result = new BigDecimal(quotient, scale)
    result._isNegative = this._isNegative !== other._isNegative
    return result
  }

  protected create(value: BigDecimalTypes.Value, scale: number = 0): this {
    return new (this.constructor as new (value: BigDecimalTypes.Value, scale?: number) => this)(value, scale)
  }

  pow(n: number): this {
    if (!Number.isInteger(n)) {
      throw new Error('Exponent must be an integer')
    }
    let result = this.create(1)
    let base = this
    let exp = Math.abs(n)
    while (exp > 0) {
      if (exp % 2 === 1) {
        result = result.times(base) as this
      }
      base = base.times(base) as this
      exp = Math.floor(exp / 2)
    }
    return n < 0 ? (this.create(1).div(result) as this) : result
  }

  sqrt(scale: number = this._scale): BigDecimal {
    if (this.isNegative()) {
      throw new Error('Square root of negative numbers is not supported')
    }
    if (this.isZero()) return new BigDecimal(0)

    const epsilon = new BigDecimal(1, scale + 1)
    let x = this.scaleUp(scale + 1)
    let y = new BigDecimal(x._integerPart, 0).div(new BigDecimal(2), scale + 1)

    while (x.minus(y).abs().gt(epsilon)) {
      x = y
      y = this.div(x, scale + 1)
        .plus(x)
        .div(new BigDecimal(2), scale + 1)
    }

    return y
  }

  private scaleUp(newScale: number): BigDecimal {
    if (newScale <= this._scale) return this
    const scaleDiff = newScale - this._scale
    const newFractionalPart = this._fractionalPart * this.scaleFactor(scaleDiff)
    return new BigDecimal(this._integerPart * this.scaleFactor(newScale) + newFractionalPart, newScale)
  }

  private scaleDown(newScale: number): BigDecimal {
    if (newScale >= this._scale) return this
    const scaleDiff = this._scale - newScale
    const divisor = this.scaleFactor(scaleDiff)
    const newFractionalPart = this._fractionalPart / divisor
    return new BigDecimal(this._integerPart * this.scaleFactor(newScale) + newFractionalPart, newScale)
  }

  /**
   * Implements the toPrimitive symbol to allow BigDecimal to be used in comparisons.
   */
  [Symbol.toPrimitive](hint: string): number | string {
    if (hint === 'number') {
      return this.valueOf()
    }
    return this.toString()
  }

  /**
   * Converts the BigDecimal to a primitive value for comparisons.
   * @returns A number representation of the BigDecimal.
   */
  valueOf(): number {
    const value = Number(this._integerPart) + Number(this._fractionalPart) / 10 ** this._scale
    return this._isNegative ? -value : value
  }

  /**
   * Compares this BigDecimal to another BigDecimal.
   * @param other The BigDecimal to compare to.
   * @returns -1 if this < other, 0 if this === other, 1 if this > other
   */
  compareTo(other: BigDecimal): number {
    if (this._integerPart !== other._integerPart) {
      return this._integerPart > other._integerPart ? 1 : -1
    }
    if (this._fractionalPart !== other._fractionalPart) {
      return this._fractionalPart > other._fractionalPart ? 1 : -1
    }
    return 0
  }

  gt(other: BigDecimal): boolean {
    return this.compareTo(other) > 0
  }

  eq(other: BigDecimal): boolean {
    return this.compareTo(other) === 0
  }

  gte(other: BigDecimal): boolean {
    return this.gt(other) || this.eq(other)
  }

  lt(other: BigDecimal): boolean {
    return !this.gte(other)
  }

  lte(other: BigDecimal): boolean {
    return this.lt(other) || this.eq(other)
  }

  isZero(): boolean {
    return this._integerPart === 0n && this._fractionalPart === 0n
  }

  isPositive(): boolean {
    return !this._isNegative
  }

  isNegative(): boolean {
    return this._isNegative
  }

  toString(): string {
    const intStr = this._integerPart.toString()
    if (this._scale === 0) return this._isNegative ? `-${intStr}` : intStr
    const fracStr = this._fractionalPart.toString().padStart(this._scale, '0')
    return `${this._isNegative ? '-' : ''}${intStr}.${fracStr}`
  }

  toFixed(dp: number): string {
    if (dp < 0) throw new Error('Decimal places must be non-negative')
    const rounded = this.round(dp)
    const intStr = rounded._integerPart.toString()
    const fracStr = rounded._fractionalPart.toString().padStart(dp, '0')
    return `${rounded._isNegative ? '-' : ''}${intStr}${dp > 0 ? '.' + fracStr : ''}`
  }

  round(dp: number): BigDecimal {
    if (dp < 0) throw new Error('Decimal places must be non-negative')
    const scaleFactor = this.scaleFactor(dp)
    const scaled = this.scaleUp(dp + 1)
    const rounded = scaled._integerPart * scaleFactor + (scaled._fractionalPart + 5n * this.scaleFactor(0)) / 10n
    return new BigDecimal(rounded, dp)
  }
}

export { BigDecimal, BigDecimal as BD }
