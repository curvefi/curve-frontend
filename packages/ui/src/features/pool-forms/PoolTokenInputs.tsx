import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import type { Decimal } from '@primitives/decimal.utils'
import { LargeTokenInputSkeleton } from '@ui/features/forms/controls/LargeTokenInput/LargeTokenInputSkeleton'
import type { QueryProp } from '@ui/features/queries/util'
import { t } from '@ui/lib/i18n'
import { PoolTokenInput, type PoolToken } from './PoolTokenInput'

export type PoolTokenDisabled = boolean | 'first-only'

export const PoolTokenInputs = ({
  tokens: { data: tokens, error },
  reserves,
  disabled,
  maxAmounts,
  maxSelectedIndex,
  positionAmounts,
  positionTooltip,
  onMax,
  onValueChange,
}: {
  tokens: QueryProp<PoolToken[]>
  reserves: QueryProp<Decimal[]>
  disabled: PoolTokenDisabled
  maxAmounts?: QueryProp<Decimal>[]
  maxSelectedIndex?: number
  positionAmounts?: QueryProp<Decimal>[]
  positionTooltip?: string
  onMax?: (index: number) => void
  onValueChange?: (index: number, value: Decimal | undefined) => void
}) =>
  tokens?.map((token, index) => (
    <PoolTokenInput
      key={token.address}
      token={token}
      index={index}
      disabled={disabled === true || (disabled === 'first-only' && index > 0)}
      reserves={reserves}
      max={maxAmounts?.[index]}
      isMaxSelected={index === maxSelectedIndex}
      onMax={onMax}
      onValueChange={onValueChange}
      positionBalance={positionAmounts && { position: positionAmounts[index], tooltip: positionTooltip }}
    />
  )) ??
  (error ? (
    <Alert severity="error">
      <AlertTitle>{t`Error retrieving pool tokens`}</AlertTitle>
      {error.message}
    </Alert>
  ) : (
    <>
      <LargeTokenInputSkeleton />
      <LargeTokenInputSkeleton />
    </>
  ))
