import { oneAddress, oneFloat, oneInt, onePrice } from '@cy/support/generators'
import { oneToken } from '@cy/support/helpers/tokens'
import { range } from '@primitives/objects.utils'
import {
  SECONDS_PER_DAY,
  SECONDS_PER_HOUR,
  SECONDS_PER_MINUTE,
  SECONDS_PER_MONTH,
  SECONDS_PER_WEEK,
} from '@ui/utils/time'

const MAX_OHLC_POINTS = 240
const AGG_UNIT_SECONDS = {
  minute: SECONDS_PER_MINUTE,
  hour: SECONDS_PER_HOUR,
  day: SECONDS_PER_DAY,
  week: SECONDS_PER_WEEK,
  month: SECONDS_PER_MONTH,
} as const

const getOhlcTimeRange = (params: URLSearchParams) => {
  const end = Number(params.get('end'))
  const start = Number(params.get('start'))
  const aggNumber = Number(params.get('agg_number'))
  const aggUnitSeconds = AGG_UNIT_SECONDS[params.get('agg_units') as keyof typeof AGG_UNIT_SECONDS]
  const interval = Math.max(1, aggNumber * aggUnitSeconds)
  const pointCount = Math.min(MAX_OHLC_POINTS, Math.max(2, Math.floor((end - start) / interval)))

  return { pointCount, start, interval }
}

const createOhlcData = (params: URLSearchParams) => {
  const { pointCount, start, interval } = getOhlcTimeRange(params)

  return range(pointCount).map(index => {
    const basePrice = Math.max(onePrice(5_000), 0.01)
    const open = basePrice + oneFloat(0, basePrice * 0.02)
    const close = basePrice + oneFloat(0, basePrice * 0.02)
    const spread = oneFloat(0, basePrice * 0.01)

    return {
      time: start + index * interval,
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
  cy.intercept({ method: 'GET', pathname: /^\/v1\/(crvusd|lending)\/llamma_ohlc\/.+/ }, req => {
    const { searchParams } = new URL(req.url)
    req.reply({ body: { data: createOhlcData(searchParams) } })
  })
  cy.intercept({ method: 'GET', pathname: /^\/v1\/(crvusd|lending)\/oracle_ohlc\/.+/ }, req => {
    const { pathname, searchParams } = new URL(req.url)
    const [, , , , chain, controller] = pathname.split('/')
    const price_source_pools = [createOraclePriceSourcePool(chain)]
    const body = { chain, controller, oracle: oneAddress(), price_source_pools, data: createOhlcData(searchParams) }
    req.reply({ body })
  })
}
