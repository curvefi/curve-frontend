import { z } from 'zod/v4'
import { timestampResponse } from '../schemas'
import { parseTimestamp } from '../timestamp'

const ohlc = z
  .object({
    time: timestampResponse,
    open: z.number(),
    close: z.number(),
    high: z.number(),
    low: z.number(),
  })
  .transform(data => ({
    time: parseTimestamp(data.time),
    open: data.open,
    high: data.high,
    low: data.low,
    close: data.close,
  }))

export const getOHLCResponse = z
  .object({
    chain: z.string(),
    address: z.string(),
    data: z.array(ohlc),
  })
  .transform(data => data.data)

export type OHLC = z.infer<typeof ohlc>
