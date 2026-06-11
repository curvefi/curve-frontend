import { z } from 'zod/v4'
import { timestamp } from '../schemas'

const ohlc = z.object({
  time: timestamp,
  open: z.number().nullable().optional(),
  close: z.number().nullable().optional(),
  high: z.number().nullable().optional(),
  low: z.number().nullable().optional(),
})

export const getOHLCResponse = z
  .object({
    chain: z.string(),
    address: z.string(),
    data: z.array(ohlc),
  })
  .transform(({ data }) => data)

export type OHLC = z.infer<typeof ohlc>
