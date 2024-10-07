import { t } from '@lingui/macro'

import InputProvider, { InputDebounced, InputMaxBtn } from '@/ui/InputComp'

const FieldLpToken = ({
  amount,
  balance,
  balanceLoading,
  disabledMaxButton,
  disableInput,
  hasError,
  haveSigner,
  handleAmountChange,
  handleMaxClick,
}: {
  amount: string
  balance: string
  balanceLoading: boolean
  disabledMaxButton?: boolean
  disableInput: boolean
  hasError: boolean
  haveSigner: boolean
  handleAmountChange: (val: string) => void
  handleMaxClick?: () => void
}) => {
  const value = typeof amount === 'undefined' ? '' : amount

  return (
    <InputProvider
      id="lpTokens"
      grid
      gridTemplateColumns="1fr auto"
      disabled={disableInput}
      inputVariant={hasError ? 'error' : undefined}
      padding="var(--spacing-1) var(--spacing-2)"
    >
      <InputDebounced
        id="inp-lp-tokens"
        autoComplete="off"
        type="number"
        labelProps={{
          label: haveSigner ? t`LP Tokens Avail.` : t`LP Tokens`,
          descriptionLoading: haveSigner ? balanceLoading : false,
          description: haveSigner ? balance : '',
        }}
        value={value}
        onChange={handleAmountChange}
      />
      {handleMaxClick && <InputMaxBtn disabled={disabledMaxButton} onClick={handleMaxClick} />}
    </InputProvider>
  )
}

export default FieldLpToken
