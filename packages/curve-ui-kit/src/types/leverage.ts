// Shared leverage types for both lend and loan (mint) markets

export type MarketMaxLeverage = {
  maxLeverage: string
  error: string
}

export type MarketsMaxLeverageMapper = {
  [marketId: string]: MarketMaxLeverage
}

export type ExpectedCollateral = {
  totalCollateral: string
  userCollateral: string
  collateralFromUserBorrowed: string
  collateralFromDebt: string
  leverage: string
  avgPrice: string
}

export type ExpectedBorrowed = {
  totalBorrowed: string
  borrowedFromStateCollateral: string
  borrowedFromUserCollateral: string
  userBorrowed: string
  avgPrice: string
}
