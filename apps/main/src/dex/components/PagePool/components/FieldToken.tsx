import { useCallback } from 'react'
import { ethAddress } from 'viem'
import { shortenTokenName } from '@/dex/utils'
import { notFalsy } from '@curvefi/prices-api/objects.util'
import Box from '@ui/Box'
import InputProvider, { InputDebounced, InputMaxBtn } from '@ui/InputComp'
import { formatNumber } from '@ui/utils'
import { useReleaseChannel } from '@ui-kit/hooks/useLocalStorage'
import { t } from '@ui-kit/lib/i18n'
import { LargeTokenInput } from '@ui-kit/shared/ui/LargeTokenInput'
import { TokenIcon } from '@ui-kit/shared/ui/TokenIcon'
import { TokenLabel } from '@ui-kit/shared/ui/TokenLabel'
import { ReleaseChannel, shortenAddress, decimal, type Decimal } from '@ui-kit/utils'

type Props = {
  idx: number
  amount: string
  balance: string | undefined
  balanceLoading: boolean
  disabled: boolean
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
  afterMaxClick?: (idx: number) => void
}

const FieldToken = ({
  idx,
  amount,
  balance,
  balanceLoading,
  disabled,
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
  afterMaxClick,
}: Props) => {
  const showAvailableBalance = haveSigner && !isWithdraw
  const [releaseChannel] = useReleaseChannel()
  const onBalance = useCallback((val?: Decimal) => handleAmountChange(val ?? '', idx), [handleAmountChange, idx])

  const isNetworkToken = !isWithdraw && tokenAddress.toLowerCase() === ethAddress
  const onMax = useCallback(() => {
    handleAmountChange(balance!, idx)
    afterMaxClick?.(idx)
  }, [idx, afterMaxClick, handleAmountChange, balance])

  return releaseChannel !== ReleaseChannel.Beta ? (
    <InputProvider
      grid
      gridTemplateColumns={hideMaxButton ? '1fr auto' : '1fr auto auto'}
      padding="var(--spacing-1) var(--spacing-2)"
      id={token}
      disabled={disabled}
      inputVariant={hasError ? 'error' : undefined}
    >
      <InputDebounced
        id={`input-${token}-amount`}
        autoComplete="off"
        type="number"
        value={amount == null ? '' : amount}
        labelProps={{
          label: notFalsy(
            shortenTokenName(token),
            haveSameTokenName && shortenAddress(tokenAddress),
            showAvailableBalance && t`Avail.`,
          ).join(' '),
          descriptionLoading: showAvailableBalance && balanceLoading,
          description: showAvailableBalance ? formatNumber(balance) : '',
        }}
        onChange={(val) => handleAmountChange(val, idx)}
      />
      {!hideMaxButton && (
        <InputMaxBtn isNetworkToken={isNetworkToken} loading={isMaxLoading} disabled={disabled} onClick={onMax} />
      )}
      <Box flex flexAlignItems="center">
        <TokenIcon blockchainId={blockchainId} tooltip={token} address={tokenAddress} />
      </Box>
    </InputProvider>
  ) : (
    <LargeTokenInput
      name={token}
      disabled={disabled}
      isError={hasError}
      {...(showAvailableBalance && {
        walletBalance: {
          balance: decimal(balance),
          symbol: token,
          onClick: onMax,
          loading: isMaxLoading,
        },
      })}
      {...(!hideMaxButton &&
        !isMaxLoading && {
          maxBalance: {
            balance: decimal(balance),
            chips: 'max',
          },
        })}
      tokenSelector={
        <TokenLabel
          blockchainId={blockchainId}
          label={token}
          tooltip={isNetworkToken ? t`Balance minus estimated gas` : (tokenAddress ?? '')}
          address={tokenAddress}
        />
      }
      {...(haveSameTokenName && { label: `${token} ${shortenAddress(tokenAddress)}` })}
      balance={decimal(amount)}
      onBalance={onBalance}
    />
  )
}

export default FieldToken
