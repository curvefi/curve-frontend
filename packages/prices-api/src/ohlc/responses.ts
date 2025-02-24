import type { Chain } from '../index'

export type GetOHLCResponse = {
  chain: Chain
  address: string
  data: {
    time: number
    open: number
    close: number
    high: number
    low: number
  }[]
}
