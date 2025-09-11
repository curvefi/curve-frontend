import { useCallback, useMemo } from 'react'
import type { UseFormReturn } from 'react-hook-form'
import { LargeTokenInput } from '@ui-kit/shared/ui/LargeTokenInput'
import { TokenLabel } from '@ui-kit/shared/ui/TokenLabel'
import type { BorrowForm, Token } from '../borrow.types'
import { setValueOptions } from '../llama.util'

export const BorrowFormTokenInput = ({
  label,
  token,
  name,
  max: balance,
  isLoading,
  isError,
  form,
  testId,
}: {
  label: string
  token: Token | undefined
  isError: boolean
  isLoading: boolean
  max: number | undefined
  name: keyof BorrowForm
  form: UseFormReturn<BorrowForm>
  testId?: string
}) => (
  <LargeTokenInput
    name={name}
    label={label}
    testId={testId}
    tokenSelector={
      <TokenLabel
        blockchainId={token?.chain}
        tooltip={token?.symbol}
        address={token?.address}
        label={token?.symbol ?? '?'}
      />
    }
    onBalance={useCallback((v) => form.setValue(name, v, setValueOptions), [form, name])}
    isError={isError}
    balanceDecimals={2}
    maxBalance={useMemo(
      () => ({ balance, symbol: token?.symbol, loading: isLoading, showSlider: false }),
      [balance, isLoading, token],
    )}
  />
)
