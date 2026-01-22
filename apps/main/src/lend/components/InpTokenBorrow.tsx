import { useCallback } from 'react'
import type { NetworkConfig } from '@/lend/types/lend.types'
import { formatNumber } from '@ui/utils'
import { t } from '@ui-kit/lib/i18n'
import { useTokenUsdRate } from '@ui-kit/lib/model/entities/token-usd-rate'
import { LargeTokenInput } from '@ui-kit/shared/ui/LargeTokenInput'
import { TokenLabel } from '@ui-kit/shared/ui/TokenLabel'
import { decimal, type Decimal } from '@ui-kit/utils'

export const InpTokenBorrow = ({
  id,
  testId,
  inpError,
  inpDisabled,
  inpValue,
  tokenAddress,
  tokenSymbol,
  maxRecv,
  handleInpChange,
  network,
}: {
  id: string
  testId?: string
  inpError: string
  inpDisabled: boolean
  inpValue: string
  tokenAddress: string | undefined
  tokenSymbol: string | undefined
  maxRecv: string | undefined
  handleInpChange(inpValue: string): void
  network: NetworkConfig
}) => {
  const { data: usdRate } = useTokenUsdRate({ chainId: network.chainId, tokenAddress })
  return (
    <LargeTokenInput
      name={id}
      testId={testId ?? `${id}Amt`}
      isError={!!inpError}
      message={inpError === 'too-much' ? t`Amount > max borrow ${formatNumber(maxRecv || '0')}` : undefined}
      disabled={inpDisabled}
      inputBalanceUsd={decimal(inpValue && usdRate && usdRate * +inpValue)}
      maxBalance={{ balance: decimal(maxRecv), chips: 'max' }}
      label={t`Borrow amount:`}
      balance={decimal(inpValue)}
      tokenSelector={
        <TokenLabel blockchainId={network.id} tooltip={tokenSymbol} address={tokenAddress} label={tokenSymbol ?? '?'} />
      }
      onBalance={useCallback((val?: Decimal) => handleInpChange(val ?? ''), [handleInpChange])}
    />
  )
}
