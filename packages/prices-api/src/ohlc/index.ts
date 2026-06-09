import { addQueryString, fetchJson as fetch } from '@primitives/fetch.utils'
import { getHost, type Chain, type Options } from '..'
import { getTimeRange } from '../timestamp'
import * as Schema from './schema'

export type * from './schema'

type OhlcUnits = 'day' | 'hour' | 'minute'
type LpOhlcPriceUnits = 'usd' | 'token0'

type OhlcRangeParams = {
  interval?: number
  units?: OhlcUnits
  start?: number
  end?: number
  daysRange?: number
}

export type GetOHLCParams = OhlcRangeParams & {
  chain: Chain
  poolAddress: string
  mainToken: string
  referenceToken: string
}

export type GetLpOHLCParams = OhlcRangeParams & {
  chain: Chain
  poolAddress: string
  priceUnits?: LpOhlcPriceUnits
}

const DEFAULT_DAYS_RANGE = 90
const DEFAULT_INTERVAL = 1
const DEFAULT_UNITS: OhlcUnits = 'day'

const getOhlcQuery = ({
  daysRange = DEFAULT_DAYS_RANGE,
  end,
  interval = DEFAULT_INTERVAL,
  start,
  units = DEFAULT_UNITS,
  ...params
}: OhlcRangeParams & Record<string, string | number | undefined>) => {
  const range = getTimeRange({ start, end, daysRange })

  return addQueryString({
    ...params,
    agg_number: interval,
    agg_units: units,
    start: range.start,
    end: range.end,
  })
}

const fetchOhlc = async (url: string, options?: Options) => {
  const host = getHost(options)
  const response = await fetch(`${host}${url}`, undefined, options?.signal)

  return Schema.getOHLCResponse.parse(response)
}

export function getOHLC(params: GetOHLCParams, options?: Options): Promise<Schema.OHLC[]>
export function getOHLC(
  chain: Chain,
  poolAddress: string,
  mainToken: string,
  referenceToken: string,
  options?: Options,
): Promise<Schema.OHLC[]>
export async function getOHLC(
  paramsOrChain: GetOHLCParams | Chain,
  poolAddressOrOptions?: string | Options,
  mainToken?: string,
  referenceToken?: string,
  legacyOptions?: Options,
) {
  const params =
    typeof paramsOrChain === 'string'
      ? {
          chain: paramsOrChain,
          poolAddress: poolAddressOrOptions as string,
          mainToken: mainToken ?? '',
          referenceToken: referenceToken ?? '',
        }
      : paramsOrChain
  const options = typeof paramsOrChain === 'string' ? legacyOptions : (poolAddressOrOptions as Options | undefined)
  const query = getOhlcQuery({
    main_token: params.mainToken,
    reference_token: params.referenceToken,
    interval: params.interval,
    units: params.units,
    start: params.start,
    end: params.end,
    daysRange: params.daysRange,
  })

  return fetchOhlc(`/v1/ohlc/${params.chain}/${params.poolAddress}${query}`, options)
}

export async function getLpOHLC(
  { chain, poolAddress, priceUnits = 'usd', interval, units, start, end, daysRange }: GetLpOHLCParams,
  options?: Options,
) {
  const query = getOhlcQuery({
    price_units: priceUnits,
    interval,
    units,
    start,
    end,
    daysRange,
  })

  return fetchOhlc(`/v1/lp_ohlc/${chain}/${poolAddress}${query}`, options)
}
