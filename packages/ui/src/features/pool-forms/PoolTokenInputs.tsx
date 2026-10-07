import type { Decimal } from '@primitives/decimal.utils'
import { LargeTokenInputSkeleton } from '@ui/features/forms/controls/LargeTokenInput/LargeTokenInputSkeleton'
import { mapQuery, type QueryProp } from '@ui/features/queries/util'
import { t } from '@ui/lib/i18n'
import { PoolTokenInput, type PoolToken } from './PoolTokenInput'

export type PoolTokenDisabled = boolean | 'first-only'

export const PoolTokenInputs = ({
  tokens: { data: tokens, error },
  reserves,
  disabled,
  maxAmounts,
  positionAmounts,
}: {
  tokens: QueryProp<PoolToken[]>
  reserves: QueryProp<Decimal[]>
  disabled: PoolTokenDisabled
  maxAmounts?: QueryProp<Decimal>[]
  positionAmounts?: QueryProp<(Decimal | undefined)[]> | undefined
}) =>
  tokens?.map((token, index) => (
    <PoolTokenInput
      key={token.address}
      token={token}
      index={index}
      disabled={disabled === true || (disabled === 'first-only' && index > 0)}
      reserves={reserves}
      max={maxAmounts?.[index]}
      positionBalance={
        positionAmounts && {
          position: mapQuery(positionAmounts, amounts => amounts[index]),
          tooltip: t`Available pool liquidity`,
        }
      }
    />
  )) ??
  (!error && (
    <>
      <LargeTokenInputSkeleton />
      <LargeTokenInputSkeleton />
    </>
  ))
