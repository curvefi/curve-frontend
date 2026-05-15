import { z } from 'zod/v4'
import { address, camelizeKeys, timestamp } from '../schemas'

export const getUsdPriceResponse = z
  .object({
    data: z.object({
      address,
      usd_price: z.number(),
      last_updated: timestamp,
    }),
  })
  .transform(camelizeKeys)
  .transform(({ data: { lastUpdated, ...price } }) => ({ ...price, lastUpdated }))

const usdPriceHistory = z.object({
  price: z.number(),
  timestamp,
})

export const getUsdPriceHistoryResponse = z
  .object({
    address,
    data: z.array(usdPriceHistory),
  })
  .transform(data => data.data)

export type UsdPrice = z.infer<typeof getUsdPriceResponse>
export type UsdPriceHistory = z.infer<typeof getUsdPriceHistoryResponse>
