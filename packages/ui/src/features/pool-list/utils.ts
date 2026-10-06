import { maybe } from '@primitives/objects.utils'
import { decimalGreaterThan, ZERO } from '@ui/lib/decimal'
import type { PoolClaimables } from './types'

export const hasClaimableRewards = <T extends PoolClaimables | undefined>(claimables: T) =>
  maybe(claimables, cs => cs.some(({ amount }) => decimalGreaterThan(amount, ZERO)))
