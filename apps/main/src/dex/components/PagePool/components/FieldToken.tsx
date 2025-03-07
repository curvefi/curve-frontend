import { ethAddress } from 'viem'
import { shortenTokenAddress, shortenTokenName } from '@/dex/utils'
import Box from '@ui/Box'
import InputProvider, { InputDebounced, InputMaxBtn } from '@ui/InputComp'
import { t } from '@ui-kit/lib/i18n'
import { TokenIcon } from '@ui-kit/shared/ui/TokenIcon'

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
  blockchainId: string
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
  blockchainId,
  isWithdraw = false,
  isMaxLoading,
  token,
  tokenAddress,
  handleAmountChange,
  handleMaxClick,
}: Props) => {
  const value = typeof amount === 'undefined' ? '' : amount
  const isNetworkToken = !isWithdraw && tokenAddress.toLowerCase() === ethAddress
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
        <TokenIcon blockchainId={blockchainId} tooltip={token} address={tokenAddress} />
      </Box>
    </InputProvider>
  )
}

export default FieldToken
