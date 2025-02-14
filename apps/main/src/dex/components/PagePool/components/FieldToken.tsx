import { t } from '@ui-kit/lib/i18n'

import { NETWORK_TOKEN } from '@/dex/constants'
import { shortenTokenAddress, shortenTokenName } from '@/dex/utils'

import Box from '@ui/Box'
import InputProvider, { InputDebounced, InputMaxBtn } from '@ui/InputComp'
import TokenIcon from '@/dex/components/TokenIcon'

type Props = {
  idx: number
  amount: string
  balance: string | undefined
  balanceLoading: boolean
  disableMaxButton: boolean
  disableInput: boolean
  hasError: boolean
  haveSameTokenName?: boolean
  haveSigner: boolean
  hideMaxButton?: boolean
  imageBaseUrl: string
  isMaxLoading?: boolean
  isWithdraw?: boolean
  token: string
  tokenAddress: string
  handleAmountChange: (val: string, idx: number) => void
  handleMaxClick: () => void
}

const FieldToken = ({
  idx,
  amount,
  disableMaxButton,
  balance,
  balanceLoading,
  disableInput,
  haveSameTokenName,
  hideMaxButton = false,
  hasError,
  haveSigner,
  imageBaseUrl,
  isWithdraw = false,
  isMaxLoading,
  token,
  tokenAddress,
  handleAmountChange,
  handleMaxClick,
}: Props) => {
  const value = typeof amount === 'undefined' ? '' : amount
  const isNetworkToken = !isWithdraw && tokenAddress.toLowerCase() === NETWORK_TOKEN
  const showAvailableBalance = haveSigner && !isWithdraw

  return (
    <InputProvider
      grid
      gridTemplateColumns={hideMaxButton ? '1fr auto' : '1fr auto auto'}
      padding="var(--spacing-1) var(--spacing-2)"
      id={token}
      disabled={disableInput}
      inputVariant={hasError ? 'error' : undefined}
    >
      <InputDebounced
        id={`input-${token}-amount`}
        autoComplete="off"
        type="number"
        value={value}
        labelProps={{
          label: `${shortenTokenName(token)} ${haveSameTokenName ? shortenTokenAddress(tokenAddress) : ''} ${
            showAvailableBalance ? `${t`Avail.`} ` : ''
          }`,
          descriptionLoading: showAvailableBalance && balanceLoading,
          description: showAvailableBalance ? balance : '',
        }}
        onChange={(val) => handleAmountChange(val, idx)}
      />
      {!hideMaxButton && (
        <InputMaxBtn
          isNetworkToken={isNetworkToken}
          loading={isMaxLoading}
          disabled={disableMaxButton}
          onClick={handleMaxClick}
        />
      )}
      <Box flex flexAlignItems="center">
        <TokenIcon imageBaseUrl={imageBaseUrl} token={token} address={tokenAddress} />
      </Box>
    </InputProvider>
  )
}

export default FieldToken
