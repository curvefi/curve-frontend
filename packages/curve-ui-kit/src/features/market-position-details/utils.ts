export const calculateRangeToLiquidation = (upperLiquidationPrice: number, oraclePrice: number) => {
  // show negative buffer to liquidation price if already inside soft liquidation range
  if (oraclePrice > upperLiquidationPrice) return ((oraclePrice - upperLiquidationPrice) / upperLiquidationPrice) * -100

  return ((oraclePrice - upperLiquidationPrice) / upperLiquidationPrice) * 100
}
