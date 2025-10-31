import { useCallback, useMemo } from 'react'
import type { UseFormReturn } from 'react-hook-form'
import { useAccount } from 'wagmi'
import type { IChainId, INetworkName } from '@curvefi/llamalend-api/lib/interfaces'
import type { BaseConfig } from '@ui/utils'
import { useTokenBalance } from '@ui-kit/hooks/useTokenBalance'
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
  blockchainId,
  name,
  max,
  isLoading: isMaxLoading,
  isError,
  form,
  testId,
  network,
}: {
  label: string
  token: Token | undefined
  blockchainId: INetworkName | undefined
  isError: boolean
  isLoading: boolean
  max: Decimal | undefined
  name: keyof typeof maxField
  form: UseFormReturn<BorrowForm>
  testId?: string
  network: BaseConfig<INetworkName, IChainId>
}) => {
  const { address: userAddress } = useAccount()
  const {
    data: balance,
    isLoading: isBalanceLoading,
    isError: isBalanceError,
  } = useTokenBalance({ chainId: network?.chainId, userAddress }, token)
  return (
    <LargeTokenInput
      name={name}
      label={label}
      testId={testId}
      tokenSelector={
        <TokenLabel
          blockchainId={blockchainId}
          tooltip={token?.symbol}
          address={token?.address}
          label={token?.symbol ?? '?'}
        />
      }
      onBalance={useCallback((v?: Decimal) => form.setValue(name, v, setValueOptions), [form, name])}
      isError={isError || isBalanceError || !!form.formState.errors[name] || !!form.formState.errors[maxField[name]]}
      message={form.formState.errors[name]?.message ?? form.formState.errors[maxField[name]]?.message}
      walletBalance={useMemo(
        // todo: separate isLoading for balance and for maxBalance
        () => ({ balance, symbol: token?.symbol, loading: isBalanceLoading || isMaxLoading }),
        [balance, isMaxLoading, isBalanceLoading, token?.symbol],
      )}
      maxBalance={useMemo(() => ({ balance: max, chips: 'max' }), [max])}
    />
  )
}
