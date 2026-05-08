import type { Timestamp } from '../timestamp'

export type OHLC = {
  time: Timestamp
  open: number
  close: number
  high: number
  low: number
}
