import { useCallback, useMemo } from 'react'
import type { UseFormReturn } from 'react-hook-form/dist/types'
import { LargeTokenInput } from '@ui-kit/shared/ui/LargeTokenInput'
import { TokenLabel } from '@ui-kit/shared/ui/TokenLabel'
import type { BorrowForm, Token } from '../borrow.types'

export const BorrowFormTokenInput = ({
  label,
  token,
  name,
  max: balance,
  state: { isError, isLoading: isLoading },
  form,
}: {
  label: string
  token: Token | undefined
  state: { isError: boolean; isLoading: boolean }
  max: number | undefined
  name: keyof BorrowForm
  form: UseFormReturn<BorrowForm>
}) => (
  <LargeTokenInput
    name={name}
    label={label}
    tokenSelector={
      <TokenLabel
        blockchainId={token?.chain}
        tooltip={token?.symbol}
        address={token?.address}
        label={token?.symbol ?? '?'}
      />
    }
    onBalance={useCallback((v) => form.setValue(name, v), [form, name])}
    isError={isError}
    balanceDecimals={2}
    maxBalance={useMemo(() => ({ balance, symbol: token?.symbol, loading: isLoading }), [balance, isLoading, token])}
  />
)
