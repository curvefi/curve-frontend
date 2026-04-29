import type { Timestamp } from '../timestamp'

export type GetOHLCResponse = {
  chain: string
  address: string
  data: {
    time: Timestamp
    open: number
    close: number
    high: number
    low: number
  }[]
}
