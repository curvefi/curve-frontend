import { Market } from '@curvefi/prices-api/crvusd'

export type CrvUsdServerData = {
  mintMarkets?: Market[]
  dailyVolume?: number
}
