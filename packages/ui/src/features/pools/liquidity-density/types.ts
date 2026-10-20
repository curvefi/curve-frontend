export type LiquidityPair = readonly [inputCoin: number, outputCoin: number]

export type LiquidityCurve = {
  /** Balances after applying rates and dividing by their mean to keep the math near 1. */
  xp: readonly number[]
  /** Multiply each coordinate by its scale to recover a whole-token balance. */
  scale: readonly number[]
  /** Undefined when the balance is outside the solver's domain or iteration does not converge. */
  solve: (balances: readonly number[], outputCoin: number) => number | undefined
  /** Initial relative price offset used to find the peak's width. */
  seed: number
}

export type LiquiditySample = {
  price: number
  /** Whole input tokens per 1% of log-price movement. */
  depth: number
  low: number
  high: number
}

export type LiquidityProfile = {
  samples: LiquiditySample[]
  spot: number
  pair: LiquidityPair
  low: number
  high: number
}
