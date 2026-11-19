import type { Chain } from '@curvefi/prices-api'
import type { Timestamp } from '@curvefi/prices-api/timestamp'
import type { Token } from '@primitives/address.utils'
import type { Nullish } from '@primitives/objects.utils'

/** A token of an activity row, whose address can be a token pair so its icon shows both tokens */
export type ActivityToken = Omit<Token, 'address'> & { address: Token['address'] | Token['address'][] }

/** A single token delta of an activity event, used to render one row per token */
export type ActivityTokenDelta = {
  label: string
  token: ActivityToken | undefined
  amount: number // Positive when the wallet receives tokens, negative when it sends them.
  /** Omit when the source has no USD pricing. Use null when a historical price is missing. */
  amountUsd?: number | null
}

export type ActivityRow = {
  chainId: number
  blockchainId: Chain
  txHash: string | null
  timestamp: Timestamp
  address: Token['address']
  action: { label: string; color?: 'success' | 'error' }
  valueUsd: number | Nullish
  deltas: ActivityTokenDelta[]
  /** Number of required deltas before breakdown presentation kicks in. In some cases, like swaps, having a breakdown at 2 tokens doesn't offer much value, as all swap info can be seen from the 'amounts' column. */
  breakdownCutoff?: number
}
