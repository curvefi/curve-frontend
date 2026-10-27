import { Fragment } from 'react'
import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import type { Decimal } from '@primitives/decimal.utils'
import type { UseFormReturn } from '@ui/features/forms'
import { LargeTokenInputSkeleton } from '@ui/features/forms/controls/LargeTokenInput/LargeTokenInputSkeleton'
import type { QueryProp } from '@ui/features/queries/util'
import { t } from '@ui/lib/i18n'
import type { PoolForm, PoolTokenFields } from './pool-form.utils'
import { type PoolToken, PoolTokenInput } from './PoolTokenInput'

export type PoolTokenDisabled = boolean | 'first-only'

export const PoolTokenInputs = <TValues extends PoolForm>({
  form,
  tokens,
  disabled,
  maxAmounts,
  maxSelectedIndex,
  showBalance = true,
  onMax,
  onValueChange,
}: {
  form: UseFormReturn<TValues> & Pick<UseFormReturn<PoolTokenFields>, 'update'>
  tokens: QueryProp<PoolToken>[] | undefined
  disabled: PoolTokenDisabled
  maxAmounts?: QueryProp<Decimal>[]
  maxSelectedIndex?: number
  showBalance?: boolean
  onMax?: (index: number) => void
  onValueChange: (index: number, value: Decimal | undefined) => void
}) =>
  tokens?.map(({ data: token, isLoading, error }, index) => (
    // eslint-disable-next-line @eslint-react/no-array-index-key
    <Fragment key={index}>
      {token ? (
        <PoolTokenInput
          form={form}
          key={token.address}
          token={token}
          index={index}
          disabled={disabled === true || (disabled === 'first-only' && index > 0)}
          max={maxAmounts?.[index]}
          isMaxSelected={index === maxSelectedIndex}
          onMax={onMax}
          onValueChange={onValueChange}
          walletBalance={showBalance ? { symbol: token.symbol, balance: token.balance } : undefined}
        />
      ) : (
        isLoading && <LargeTokenInputSkeleton />
      )}
      {error && (
        <Alert severity="error">
          <AlertTitle>{`${t`Error retrieving pool token`} ${index + 1}`}</AlertTitle> {error.message}
        </Alert>
      )}
    </Fragment>
  )) ?? (
    <>
      <LargeTokenInputSkeleton />
      <LargeTokenInputSkeleton />
    </>
  )
