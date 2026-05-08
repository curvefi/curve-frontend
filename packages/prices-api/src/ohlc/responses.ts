import type { TimestampResponse } from '../timestamp'

export type GetOHLCResponse = {
  chain: string
  address: string
  data: {
    time: TimestampResponse
    open: number
    close: number
    high: number
    low: number
  }[]
}
