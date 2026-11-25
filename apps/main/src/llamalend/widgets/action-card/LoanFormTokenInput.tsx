import { type ReactNode, useCallback } from 'react'
import { useConnection } from 'wagmi'
import { getAddressOrPair } from '@/llamalend/llama.utils'
import type { LlamaNetwork } from '@/llamalend/llamalend.types'
import type { INetworkName } from '@curvefi/llamalend-api/lib/interfaces'
import { useTokenBalance } from '@evm-ui/hooks/useTokenBalance'
import { useTokenUsdRate } from '@evm-ui/queries/token-usd-rate.query'
import type { Address } from '@primitives/address.utils'
import type { Decimal } from '@primitives/decimal.utils'
import { fromEntries } from '@primitives/objects.utils'
import { TokenLabel } from '@ui/components/TokenLabel'
import { FormTokenInput } from '@ui/features/forms/controls/LargeTokenInput/FormTokenInput'
import type { LargeTokenInputProps } from '@ui/features/forms/controls/LargeTokenInput/LargeTokenInput'
import type { FormControl } from '@ui/features/forms/useFormValidation'
import { mapQuery, q, type QueryProp } from '@ui/features/queries/util'
import { LlamaIcon } from '@ui/icons/LlamaIcon'
import { decimal } from '@ui/lib/decimal'
import type { FieldName } from '@ui/lib/validation/types'

type WalletBalanceProps = NonNullable<LargeTokenInputProps['walletBalance']>

export type LoanFormTokenInputProps<
  TForm extends FormControl<Record<TFieldName, Decimal | undefined>>,
  TFieldName extends string,
  TMaxFieldName extends FieldName<TForm['formState']['errors']>,
> = {
  label: string
  token: { address: Address; symbol?: string } | undefined
  blockchainId: INetworkName | undefined
  /**
   * Optional max-value query for this field, including loading and error state.
   * When present, it also carries an optional related max-field name whose errors should be reflected here.
   */
  max?: QueryProp<Decimal> & { fieldName: TMaxFieldName; onMax?: () => void }
  name: TFieldName
  form: TForm
  testId: string
  message?: LargeTokenInputProps['message']
  maxMessage?: ReactNode
  /**
   * Optional, displays the position balance instead of the wallet balance.
   */
  positionBalance?: { position: QueryProp<Decimal>; tooltip?: WalletBalanceProps['tooltip'] }
  /**
   * The network of the token.
   */
  network: LlamaNetwork
  tokenSelector?: ReactNode
  hideBalance?: boolean
  /**
   * Optional callback when the value changes (from user typing or clicking chips).
   * Called after the form value is set.
   */
  onValueChange?: (value: Decimal | undefined) => void
  disabled?: boolean
}

/**
 * A large token input field for loan forms, with balance and max handling.
 */
export const LoanFormTokenInput = <
  TForm extends FormControl<Record<TFieldName, Decimal | undefined>>,
  TFieldName extends string,
  TMaxFieldName extends FieldName<TForm['formState']['errors']>,
>({
  label,
  token,
  blockchainId,
  name,
  max,
  form: { values, update: updateForm, formState },
  testId,
  message,
  maxMessage,
  network,
  positionBalance,
  tokenSelector,
  hideBalance,
  onValueChange,
  disabled,
}: LoanFormTokenInputProps<TForm, TFieldName, TMaxFieldName>) => {
  const { address: userAddress } = useConnection()
  const balance = useTokenBalance({ chainId: network?.chainId, userAddress, tokenAddress: token?.address })
  const usdRate = useTokenUsdRate({ chainId: network?.chainId, tokenAddress: token?.address })

  const { position, tooltip } = positionBalance ?? {}
  const walletBalance = {
    balance: position ?? q(balance),
    symbol: token?.symbol,
    usdRate: q(usdRate),
    tooltip,
    prefix: position && LlamaIcon,
  }

  const value = values[name]

  const onBalance = useCallback(
    (v?: Decimal) => {
      if (v && max?.onMax && v === max.data) return max.onMax()
      updateForm(fromEntries([[name, v]]))
      onValueChange?.(v)
    },
    [max, name, onValueChange, updateForm],
  )
  return (
    <FormTokenInput
      form={{ values, formState }}
      name={name}
      label={label}
      testId={testId}
      tokenSelector={
        tokenSelector ?? (
          <TokenLabel
            blockchainId={blockchainId}
            tooltip={token?.symbol}
            address={getAddressOrPair(blockchainId, token?.address) ?? null}
            label={token?.symbol ?? '?'}
          />
        )
      }
      onBalance={onBalance}
      {...(!hideBalance && { walletBalance })}
      {...(max && { relatedFields: [max.fieldName] })}
      max={max && { balance: max, chips: 'range', onMax: max.onMax }}
      inputBalanceUsd={mapQuery(usdRate, rate => decimal(rate * +(value ?? 0)))}
      message={message ?? maxMessage}
      disabled={disabled}
    />
  )
}
