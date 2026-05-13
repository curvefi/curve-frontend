import { z } from 'zod/v4'
import { address, camelizeKeys, timestampResponse } from '../schemas'
import { parseTimestamp } from '../timestamp'

export const getUsdPriceResponse = z
  .object({
    data: z.object({
      address,
      usd_price: z.number(),
      last_updated: timestampResponse,
    }),
  })
  .transform(camelizeKeys)
  .transform(data => {
    const { lastUpdated, ...price } = data.data
    return { ...price, lastUpdated: parseTimestamp(lastUpdated) }
  })

const usdPriceHistory = z
  .object({
    price: z.number(),
    timestamp: timestampResponse,
  })
  .transform(data => ({ price: data.price, timestamp: parseTimestamp(data.timestamp) }))

export const getUsdPriceHistoryResponse = z
  .object({
    address,
    data: z.array(usdPriceHistory),
  })
  .transform(data => data.data)

export type UsdPrice = z.infer<typeof getUsdPriceResponse>
export type UsdPriceHistory = z.infer<typeof getUsdPriceHistoryResponse>
