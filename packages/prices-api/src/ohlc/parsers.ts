import type * as Models from './models'
import type * as Responses from './responses'

export const parseOHLC = (x: Responses.GetOHLCResponse['data'][number]): Models.OHLC => ({
  time: x.time,
  open: x.open,
  high: x.high,
  low: x.low,
  close: x.close,
})
