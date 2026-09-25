import type { Decimal } from '@primitives/decimal.utils'

export type FieldReason = string

export type Available<T> = { status: 'value'; value: T } | { status: 'unavailable'; reason: FieldReason }

export const snapshotValue = <T,>(field: Available<T> | undefined): T | undefined =>
  field?.status === 'value' ? field.value : undefined

export type PositionSnapshot = {
  identity: { chainId: number; controller: string; userAddress: string }
  blockNumber: number
  observedAt: number
  source: 'live'
  /** Source inspection is not a matched deployment. Callers must not treat this as a verified predicate. */
  liquidationPredicate: 'unverified'
  loan: 'open' | 'closed' | Available<never>
  debt: Available<Decimal>
  collateralTokenAmount: Available<Decimal>
  borrowedAssetInAmm: Available<Decimal>
  oraclePrice: Available<Decimal>
  lowerPrice: Available<Decimal>
  upperPrice: Available<Decimal>
  /** Full Controller health in percentage points. Independent of the discount read. */
  fullHealthPercentagePoints: Available<Decimal>
  tickIndices: Available<readonly [number, number]>
}
