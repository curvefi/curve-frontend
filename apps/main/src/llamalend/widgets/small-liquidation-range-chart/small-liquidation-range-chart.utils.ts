type RenderableLiquidationRange = readonly [number, number]
type ChartDomain = readonly [number, number]

const DEFAULT_PADDING_RATIO = 0.1

type GetChartDomainParams = {
  currentRange?: RenderableLiquidationRange
  newRange?: RenderableLiquidationRange
  oraclePrice?: number
}

const getExtent = (values: number[]): ChartDomain => [Math.min(...values), Math.max(...values)]

const padDomain = ([domainMin, domainMax]: ChartDomain, values: number[]): ChartDomain => {
  if (domainMin === domainMax) {
    const halfWidth = domainMin === 0 ? 1 : Math.abs(domainMin) * DEFAULT_PADDING_RATIO
    return [domainMin - halfWidth, domainMax + halfWidth]
  }

  const padding = (domainMax - domainMin) * DEFAULT_PADDING_RATIO
  const rawPaddedMin = domainMin - padding
  const paddedMax = domainMax + padding
  // Prices are positive, so avoid wasting chart width by padding down to zero.
  const paddedMin = rawPaddedMin <= 0 ? Math.min(...values) * (1 - DEFAULT_PADDING_RATIO) : rawPaddedMin

  return [paddedMin, paddedMax]
}

/** Includes all chart prices with padding, without anchoring the domain to zero. */
export const getSmallLiquidationRangeChartDomain = ({
  currentRange,
  newRange,
  oraclePrice,
}: GetChartDomainParams): ChartDomain | undefined => {
  const values = [...(currentRange ?? []), ...(newRange ?? []), ...(oraclePrice === undefined ? [] : [oraclePrice])]

  if (values.length === 0) return undefined

  const baseDomain = getExtent(values)

  return padDomain(baseDomain, values)
}
