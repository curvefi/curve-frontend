import { oneAddress, oneDate, oneFloat, oneInt, onePrice } from '@cy/support/generators'
import { oneToken } from '@cy/support/helpers/tokens'
import { range } from '@primitives/objects.utils'

const DAY = 24 * 60 * 60 * 1000
const MIN_OHLC_POINTS = 36
const MAX_OHLC_POINTS = 72

const createOhlcData = () => {
  const pointCount = oneInt(MIN_OHLC_POINTS, MAX_OHLC_POINTS)
  const start = oneDate({
    minDate: new Date(Date.now() - 30 * DAY),
    maxDate: new Date(Date.now() - 2 * DAY),
  }).getTime()
  const interval = oneInt(30 * 60 * 1000, 2 * 60 * 60 * 1000)

  return range(pointCount).map(index => {
    const basePrice = Math.max(onePrice(5_000), 0.01)
    const open = basePrice + oneFloat(0, basePrice * 0.02)
    const close = basePrice + oneFloat(0, basePrice * 0.02)
    const spread = oneFloat(0, basePrice * 0.01)

    return {
      time: new Date(start + index * interval).toISOString(),
      open,
      close,
      high: Math.max(open, close) + spread,
      low: Math.max(Math.min(open, close) - spread, 0),
      base_price: basePrice,
      oracle_price: basePrice + oneFloat(0, basePrice * 0.02),
      volume: oneFloat(0, 1_000_000),
    }
  })
}

const createOraclePriceSourcePool = (chain: string) => {
  const { address: borrowed_address, symbol: borrowed_symbol } = oneToken(chain)
  const { address: collateral_address, symbol: collateral_symbol } = oneToken(chain)
  return {
    address: oneAddress(),
    borrowed_ix: oneInt(0, 4),
    borrowed_symbol,
    borrowed_address,
    collateral_ix: oneInt(0, 4),
    collateral_symbol,
    collateral_address,
  }
}

/**
 * The chart APIs can take a long time to load when running e2e tests, mock them so we test the frontend and avoid flakyness.
 */
export const mockLlamalendChartApis = () => {
  cy.intercept(
    { method: 'GET', pathname: /^\/v1\/(crvusd|lending)\/llamma_ohlc\/.+/ },
    { body: { data: createOhlcData() } },
  )
  cy.intercept({ method: 'GET', pathname: /^\/v1\/(crvusd|lending)\/oracle_ohlc\/.+/ }, req => {
    const [, , , , chain, controller] = new URL(req.url).pathname.split('/')
    const price_source_pools = [createOraclePriceSourcePool(chain)]
    const body = { chain, controller, oracle: oneAddress(), price_source_pools, data: createOhlcData() }
    req.reply({ body })
  })
}
