import type { Decimal } from '@primitives/decimal.utils'
import { LargeTokenInputSkeleton } from '@ui/features/forms/controls/LargeTokenInput/LargeTokenInputSkeleton'
import { mapQuery, type QueryProp } from '@ui/features/queries/util'
import { t } from '@ui/lib/i18n'
import { PoolTokenInput, type PoolToken } from './PoolTokenInput'

export const PoolTokenInputs = ({
  tokens: { data: tokens, error },
  reserves,
  isDisabled,
  maxAmounts,
  positionAmounts,
  enableFirstOnly,
}: {
  tokens: QueryProp<PoolToken[]>
  reserves: QueryProp<Decimal[]>
  isDisabled: boolean
  maxAmounts?: QueryProp<(Decimal | undefined)[]>
  positionAmounts?: QueryProp<(Decimal | undefined)[]> | undefined
  enableFirstOnly?: boolean
}) =>
  tokens?.map((token, index) => (
    <PoolTokenInput
      key={token.address}
      token={token}
      index={index}
      disabled={isDisabled || (!!enableFirstOnly && index > 0)}
      reserves={reserves}
      max={maxAmounts && mapQuery(maxAmounts, amounts => amounts[index])}
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
