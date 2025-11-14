import { useCallback, useMemo } from 'react'
import type { UseFormReturn } from 'react-hook-form'
import { LargeTokenInput } from '@ui-kit/shared/ui/LargeTokenInput'
import { TokenLabel } from '@ui-kit/shared/ui/TokenLabel'
import { Decimal } from '@ui-kit/utils'
import { setValueOptions } from '../react-form.utils'
import type { BorrowForm, Token } from '../types'

const maxField = {
  debt: 'maxDebt',
  userCollateral: 'maxCollateral',
} satisfies Partial<Record<keyof BorrowForm, keyof BorrowForm>>

export const BorrowFormTokenInput = ({
  label,
  token,
  name,
  balance,
  max,
  isLoading,
  isError,
  form,
  testId,
}: {
  label: string
  token: Token | undefined
  isError: boolean
  isLoading: boolean
  balance: Decimal | undefined
  max: Decimal | undefined
  name: keyof typeof maxField
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
    onBalance={useCallback((v?: Decimal) => form.setValue(name, v, setValueOptions), [form, name])}
    isError={isError || !!form.formState.errors[name] || !!form.formState.errors[maxField[name]]}
    message={form.formState.errors[name]?.message ?? form.formState.errors[maxField[name]]?.message}
    walletBalance={useMemo(() => ({ balance, symbol: token?.symbol, loading: isLoading }), [balance, isLoading, token])}
    maxBalance={useMemo(() => ({ balance: max, chips: 'max' }), [max])}
  />
)
