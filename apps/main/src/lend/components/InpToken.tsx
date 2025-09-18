import { useCallback } from 'react'
import type { NetworkConfig } from '@/lend/types/lend.types'
import { formatNumber } from '@ui/utils'
import { t } from '@ui-kit/lib/i18n'
import { useTokenUsdRate } from '@ui-kit/lib/model/entities/token-usd-rate'
import { LargeTokenInput } from '@ui-kit/shared/ui/LargeTokenInput'
import { TokenLabel } from '@ui-kit/shared/ui/TokenLabel'
import { stringToNumber } from '@ui-kit/utils'

const InpToken = ({
  id,
  testId,
  maxTestId,
  inpTopLabel,
  inpError,
  inpDisabled,
  inpLabelLoading,
  inpValue,
  tokenAddress,
  tokenSymbol,
  tokenBalance,
  debt,
  handleInpChange,
  network,
}: {
  id: string
  testId?: string
  maxTestId?: string
  inpTopLabel?: string
  inpError: string
  inpDisabled: boolean
  inpLabelLoading: boolean
  inpValue: string
  tokenAddress: string | undefined
  tokenSymbol: string | undefined
  tokenBalance: string
  debt?: string
  handleInpChange(inpValue: string): void
  network: NetworkConfig
}) => {
  const { data: usdRate } = useTokenUsdRate({ chainId: network.chainId, tokenAddress })
  return (
    <>
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
        maxBalance={{
          loading: inpLabelLoading,
          balance: stringToNumber(tokenBalance),
          symbol: tokenSymbol,
          showBalance: true,
          notionalValueUsd: usdRate != null && tokenBalance ? usdRate * +tokenBalance : undefined,
          maxTestId,
        }}
        label={inpTopLabel}
        balance={stringToNumber(inpValue)}
        tokenSelector={
          <TokenLabel
            blockchainId={network.name}
            tooltip={tokenSymbol}
            address={tokenAddress}
            label={tokenSymbol ?? '?'}
          />
        }
        onBalance={useCallback((val) => handleInpChange(`${val ?? ''}`), [handleInpChange])}
      />
    </>
  )
}

export default InpToken
