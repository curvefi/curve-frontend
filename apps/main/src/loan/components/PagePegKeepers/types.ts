import type { Decimal } from '@primitives/decimal.utils'
import type { QueryProp } from '@ui-kit/types/util'
import type { PEG_KEEPERS } from './constants'

export type PegKeeper = (typeof PEG_KEEPERS)[number]

export type PegKeeperDetails = {
  rate: QueryProp<Decimal>
  debt: QueryProp<Decimal>
  estCallerProfit: QueryProp<Decimal>
  debtCeiling: QueryProp<Decimal>
}

export type Pool = PegKeeper['pool']
