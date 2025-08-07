export const calculateRangeToLiquidation = (upperLiquidationPrice: number, oraclePrice: number) =>
  ((oraclePrice - upperLiquidationPrice) / upperLiquidationPrice) * 100

export const calculateLtv = (debt: number, collateralValue: number) => (debt / collateralValue) * 100
