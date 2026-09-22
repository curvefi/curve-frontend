import MenuList from '@mui/material/MenuList'
import type { Decimal } from '@primitives/decimal.utils'
import { shortenString } from '@primitives/string.utils'
import type { UseFormReturn } from '@ui/features/forms'
import { LargeTokenInput } from '@ui/features/forms/controls/LargeTokenInput'
import { q, type QueryProp } from '@ui/features/queries/util'
import type { TokenOption as TokenOptionType } from '@ui/features/select-token/types'
import { TokenOption } from '@ui/features/select-token/ui/modal/TokenOption'
import { TokenSelector } from '@ui/features/select-token/ui/TokenSelector'
import { useSwitch } from '@ui/hooks/useSwitch'
import { t } from '@ui/lib/i18n'
import type { PoolToken } from '../PoolTokenInput'
import { SWAP_FIELDS, type SwapFormValues, type SwapSide } from './swap-form.utils'

const INPUT_BY_SIDE = {
  pay: { label: t`You pay`, testId: 'pool-swap-pay', selectorLabel: t`Token to sell` },
  receive: { label: t`You receive (estimated)`, testId: 'pool-swap-receive', selectorLabel: t`Token to receive` },
} as const

type SwapTokenOption = TokenOptionType & Pick<PoolToken, 'balance'> & { index: number }

const SwapTokenList = ({
  tokens,
  onToken,
}: {
  tokens: SwapTokenOption[] | undefined
  onToken: (token: SwapTokenOption) => void
}) => (
  <MenuList variant="menu" sx={{ paddingBlock: 0 }}>
    {tokens?.map(token => (
      <TokenOption key={token.address} {...token} balance={token.balance.data} onToken={() => onToken(token)} />
    ))}
  </MenuList>
)

export const SwapTokenInput = ({
  form,
  tokens,
  side,
  balance,
  disabled,
}: {
  form: UseFormReturn<SwapFormValues>
  tokens: QueryProp<PoolToken[]>
  side: SwapSide
  balance: QueryProp<Decimal | undefined>
  disabled: boolean
}) => {
  const { amountField: name, amountIndexField, calculatedIndexField } = SWAP_FIELDS[side]
  const { label, testId, selectorLabel } = INPUT_BY_SIDE[side]
  const values = form.watchValues()
  const token = tokens.data?.[values[amountIndexField]]
  const options = tokens.data?.map((token, index): SwapTokenOption => ({
    ...token,
    symbol: token.symbol ?? shortenString(token.address),
    chain: token.blockchainId,
    index,
  }))
  const [isOpen, onOpen, onClose] = useSwitch(false)
  const { errors } = form.formState
  const error = form.isTouched('inputAmount', 'outputAmount') ? errors[name] : undefined

  return (
    <LargeTokenInput
      name={name}
      label={label}
      testId={testId}
      tokenSelector={
        <TokenSelector
          selectedToken={options?.[values[amountIndexField]]}
          disabled={disabled || !tokens.data}
          title={selectorLabel}
          isOpen={isOpen}
          onOpen={onOpen}
          onClose={onClose}
          size="small"
        >
          <SwapTokenList
            tokens={options?.filter(option => option.index !== values[calculatedIndexField])}
            onToken={token => form.update({ [amountIndexField]: token.index })}
          />
        </TokenSelector>
      }
      balance={q({ ...balance, data: values[name], error: error ?? balance.error })}
      onBalance={amount => {
        const updates: Partial<SwapFormValues> = { [name]: amount, editedSide: side }
        form.update(updates)
      }}
      walletBalance={token && { symbol: token.symbol, balance: token.balance }}
      {...(side === 'pay' && token && { maxBalance: { balance: token.balance, chips: 'max' } })}
      message={error?.message}
      disabled={disabled}
    />
  )
}
