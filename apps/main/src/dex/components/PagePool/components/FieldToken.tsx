import { useCallback } from 'react'
import { ethAddress } from 'viem'
import { t } from '@ui-kit/lib/i18n'
import { LargeTokenInput } from '@ui-kit/shared/ui/LargeTokenInput'
import { TokenLabel } from '@ui-kit/shared/ui/TokenLabel'
import { decimal, type Decimal, shortenAddress } from '@ui-kit/utils'

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

export const FieldToken = ({
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
  const onBalance = useCallback((val?: Decimal) => handleAmountChange(val ?? '', idx), [handleAmountChange, idx])

  const isNetworkToken = !isWithdraw && tokenAddress.toLowerCase() === ethAddress
  const onMax = useCallback(() => {
    handleAmountChange(balance!, idx)
    afterMaxClick?.(idx)
  }, [idx, afterMaxClick, handleAmountChange, balance])

  return (
    <LargeTokenInput
      name={token}
      disabled={disabled}
      isError={hasError}
      {...(showAvailableBalance && {
        walletBalance: {
          balance: decimal(balance),
          symbol: token,
          loading: balanceLoading || isMaxLoading,
        },
      })}
      {...(showAvailableBalance &&
        !hideMaxButton && {
          maxBalance: {
            chips: [{ label: t`Max`, newBalance: onMax }],
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
