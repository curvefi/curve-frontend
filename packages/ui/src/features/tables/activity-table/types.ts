import type { Timestamp } from '@curvefi/prices-api/timestamp'
import type { Token } from '@primitives/address.utils'
import type { Nullish } from '@primitives/objects.utils'
import type { TableMeta } from '@tanstack/react-table'
import type { CurveTableFeatures } from '@ui/features/tables/data-table.utils'
import type { AddressDisplay } from '@ui/lib/address'

export type ActivityDisplay = AddressDisplay & {
  formatAddress: (address: string) => string
  scanTxPath: (chainId: number, txHash: string) => string | undefined
}

/** A token of an activity row, whose address can be a token pair so its icon shows both tokens */
export type ActivityToken = Omit<Token, 'address'> & { address: Token['address'] | Token['address'][] }

/** A single token delta of an activity event, used to render one row per token */
export type ActivityTokenDelta = {
  label: string
  token: ActivityToken | undefined
  /** Signed change in the wallet balance or position. */
  amount: number
  /** Override the expanded panel's default amount color. */
  amountColor?: 'success' | 'error'
  /** Omit when the source has no USD pricing. Use null when a historical price is missing. */
  amountUsd?: number | null
}

export type ActivityRow = {
  chainId: number
  blockchainId: string
  txHash: string | null
  timestamp: Timestamp
  address: Token['address']
  action: { label: string; color?: 'success' | 'error' }
  /** Use undefined when the row has no USD summary, or null when its historical price is missing. */
  valueUsd: number | Nullish
  deltas: ActivityTokenDelta[]
}

export type ActivityTableMeta = TableMeta<CurveTableFeatures, ActivityRow> & { addressDisplay: ActivityDisplay }
