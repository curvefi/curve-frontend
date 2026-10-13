import { Fragment } from 'react'
import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import type { Decimal } from '@primitives/decimal.utils'
import { LargeTokenInputSkeleton } from '@ui/features/forms/controls/LargeTokenInput/LargeTokenInputSkeleton'
import type { QueryProp } from '@ui/features/queries/util'
import { t } from '@ui/lib/i18n'
import { type PoolToken, PoolTokenInput } from './PoolTokenInput'

export type PoolTokenDisabled = boolean | 'first-only'

export const PoolTokenInputs = ({
  tokens,
  reserves,
  disabled,
  maxAmounts,
  positionAmounts,
}: {
  tokens: QueryProp<PoolToken>[] | undefined
  reserves: QueryProp<Decimal[]>
  disabled: PoolTokenDisabled
  maxAmounts?: QueryProp<Decimal>[]
  positionAmounts?: QueryProp<Decimal>[]
}) =>
  tokens?.map(({ data: token, isLoading, error }, index) => (
    // eslint-disable-next-line @eslint-react/no-array-index-key
    <Fragment key={index}>
      {token ? (
        <PoolTokenInput
          key={token.address}
          token={token}
          index={index}
          disabled={disabled === true || (disabled === 'first-only' && index > 0)}
          reserves={reserves}
          max={maxAmounts?.[index]}
          positionBalance={
            positionAmounts && { position: positionAmounts[index], tooltip: t`Available pool liquidity` }
          }
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
