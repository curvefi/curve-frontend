import { z } from 'zod/v4'
import { timestamp } from '../schemas'

const ohlc = z.object({
  time: timestamp,
  open: z.number(),
  close: z.number(),
  high: z.number(),
  low: z.number(),
})

export const getOHLCResponse = z
  .object({
    chain: z.string(),
    address: z.string(),
    data: z.array(ohlc),
  })
  .transform(data => data.data)

export type OHLC = z.infer<typeof ohlc>
