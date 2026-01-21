import { useCallback } from 'react'
import type { NetworkConfig } from '@/lend/types/lend.types'
import { formatNumber } from '@ui/utils'
import { t } from '@ui-kit/lib/i18n'
import { useTokenUsdRate } from '@ui-kit/lib/model/entities/token-usd-rate'
import { LargeTokenInput } from '@ui-kit/shared/ui/LargeTokenInput'
import { TokenLabel } from '@ui-kit/shared/ui/TokenLabel'
import { decimal, type Decimal } from '@ui-kit/utils'

export const InpToken = ({
  id,
  testId,
  maxTestId,
  inpLabel,
  inpError,
  inpDisabled,
  inpLabelLoading,
  inpValue,
  tokenAddress,
  tokenSymbol,
  tokenBalance,
  debt,
  handleInpChange,
  handleMaxClick,
  network,
}: {
  id: string
  testId?: string
  maxTestId?: string
  inpLabel?: string
  inpError: string
  inpDisabled: boolean
  inpLabelLoading: boolean
  inpValue: string
  tokenAddress: string | undefined
  tokenSymbol: string | undefined
  tokenBalance: string | undefined
  debt?: string
  handleInpChange(inpValue: string): void
  handleMaxClick?: () => void
  network: NetworkConfig
}) => (
  <LargeTokenInput
    name={id}
    testId={testId ?? `${id}Amt`}
    isError={!!inpError}
    message={
      inpError === 'too-much'
        ? t`Amount > wallet balance ${formatNumber(tokenBalance)}`
        : inpError === 'too-much-debt'
          ? t`Amount > max debt ${formatNumber(debt)}`
          : inpError === 'too-much-collateral'
            ? t`Amount > collateral ${formatNumber(tokenBalance)}`
            : undefined
    }
    disabled={inpDisabled}
    walletBalance={{
      loading: inpLabelLoading,
      balance: decimal(tokenBalance),
      symbol: tokenSymbol,
      usdRate: useTokenUsdRate({ chainId: network.chainId, tokenAddress }).data,
      buttonTestId: maxTestId,
    }}
    {...(handleMaxClick && {
      maxBalance: {
        chips: [{ label: t`Max`, newBalance: handleMaxClick }],
      },
    })}
    label={inpLabel}
    balance={decimal(inpValue)}
    tokenSelector={
      <TokenLabel blockchainId={network.id} tooltip={tokenSymbol} address={tokenAddress} label={tokenSymbol ?? '?'} />
    }
    onBalance={useCallback((val?: Decimal) => handleInpChange(val ?? ''), [handleInpChange])}
  />
)
