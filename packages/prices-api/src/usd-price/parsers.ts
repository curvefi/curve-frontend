import { toDate } from '../timestamp'
import type * as Models from './models'
import type * as Responses from './responses'

export const parseUsdPrice = (x: Responses.GetUsdPriceResponse): Models.UsdPrice => ({
  address: x.data.address,
  usdPrice: x.data.usd_price,
  lastUpdated: toDate(x.data.last_updated),
})
