import { useCallback } from 'react'
import { ethAddress } from 'viem'
import { t } from '@evm-ui/lib/i18n'
import { LargeTokenInput } from '@evm-ui/shared/ui/LargeTokenInput'
import { TokenLabel } from '@evm-ui/shared/ui/TokenLabel'
import { q, type QueryProp } from '@evm-ui/types/util'
import { decimal, shortenAddress } from '@evm-ui/utils'
import type { Decimal } from '@primitives/decimal.utils'

type Props = {
  idx: number
  amount: string
  balance: QueryProp<Decimal | undefined>
  disabled: boolean
  isNotEnough: boolean
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
  disabled,
  haveSameTokenName,
  hideMaxButton = false,
  isNotEnough,
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
    handleAmountChange(balance.data!, idx)
    afterMaxClick?.(idx)
  }, [idx, afterMaxClick, handleAmountChange, balance.data])

  return (
    <LargeTokenInput
      name={token}
      disabled={disabled}
      {...(showAvailableBalance && {
        walletBalance: { balance: q({ ...balance, isLoading: balance.isLoading || !!isMaxLoading }), symbol: token },
      })}
      {...(showAvailableBalance && !hideMaxButton && { maxBalance: { chips: [{ label: t`Max`, newBalance: onMax }] } })}
      tokenSelector={
        <TokenLabel
          blockchainId={blockchainId}
          label={token}
          tooltip={isNetworkToken ? t`Balance minus estimated gas` : (tokenAddress ?? '')}
          address={tokenAddress}
        />
      }
      {...(haveSameTokenName && { label: `${token} ${shortenAddress(tokenAddress)}` })}
      balance={q({
        data: decimal(amount),
        error: isNotEnough ? new Error(t`Not enough tokens`) : null,
        isLoading: false,
      })}
      onBalance={onBalance}
    />
  )
}
