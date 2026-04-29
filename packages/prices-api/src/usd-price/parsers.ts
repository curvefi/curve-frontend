import type * as Models from './models'
import type * as Responses from './responses'

export const parseUsdPrice = (x: Responses.GetUsdPriceResponse): Models.UsdPrice => ({
  address: x.data.address,
  usdPrice: x.data.usd_price,
  lastUpdated: x.data.last_updated,
})

export const parseUsdPriceHistory = (x: Responses.GetUsdPriceHistoryResponse): Models.UsdPriceHistory =>
  x.data.map(({ price, timestamp }) => ({ price, timestamp }))
