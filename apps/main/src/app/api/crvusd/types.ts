import type { NetworkEnum } from '@/loan/types/loan.types'
import { Market } from '@curvefi/prices-api/crvusd'

export type CrvUsdServerData = {
  mintMarkets?: Record<NetworkEnum, Market[]>
  dailyVolume?: number
}
