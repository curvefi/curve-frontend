import type { PEG_KEEPERS } from './constants'

export type PegKeeper = (typeof PEG_KEEPERS)[number]

export type PegKeeperDetails = {
  rate: string | undefined
  debt: string | undefined
  estCallerProfit: string | undefined
  debtCeiling: string | undefined
}

export type Pool = PegKeeper['pool']
