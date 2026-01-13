import { useCallback } from 'react'
import type { NetworkConfig } from '@/lend/types/lend.types'
import { formatNumber } from '@ui/utils'
import { t } from '@ui-kit/lib/i18n'
import { useTokenUsdRate } from '@ui-kit/lib/model/entities/token-usd-rate'
import { LargeTokenInput } from '@ui-kit/shared/ui/LargeTokenInput'
import { TokenLabel } from '@ui-kit/shared/ui/TokenLabel'
import { decimal, type Decimal } from '@ui-kit/utils'

export const InpTokenRemove = ({
  network,
  id,
  inpError,
  inpDisabled,
  inpLabelLoading,
  inpValue,
  maxRemovable,
  tokenAddress,
  tokenSymbol,
  tokenBalance,
  handleInpChange,
  handleMaxClick,
}: {
  network: NetworkConfig
  id: string
  inpError: string
  inpDisabled: boolean
  inpLabelLoading: boolean
  inpValue: string
  maxRemovable: string
  tokenAddress: string | undefined
  tokenSymbol: string | undefined
  tokenBalance: string
  handleInpChange(inpValue: string): void
  handleMaxClick(): void
}) => {
  const { data: usdRate } = useTokenUsdRate({ chainId: network.chainId, tokenAddress })
  const onBalance = useCallback((val?: Decimal) => handleInpChange(val ?? ''), [handleInpChange])
  return (
    <LargeTokenInput
      name={id}
      label={t`Collateral to remove`}
      isError={!!inpError}
      message={
        inpError === 'too-much'
          ? t`Amount > wallet balance ${formatNumber(tokenBalance)}`
          : inpError === 'too-much-max'
            ? t`Amount > max removable ${formatNumber(maxRemovable)}`
            : undefined
      }
      disabled={inpDisabled}
      inputBalanceUsd={decimal(inpValue && usdRate && usdRate * +inpValue)}
      walletBalance={{
        symbol: tokenSymbol,
        balance: decimal(tokenBalance),
        usdRate,
        onClick: handleMaxClick,
        loading: inpLabelLoading,
      }}
      maxBalance={{
        balance: decimal(maxRemovable),
        chips: 'max',
      }}
      balance={decimal(inpValue)}
      tokenSelector={
        <TokenLabel blockchainId={network.id} tooltip={tokenSymbol} address={tokenAddress} label={tokenSymbol ?? '?'} />
      }
      onBalance={onBalance}
    />
  )
}
