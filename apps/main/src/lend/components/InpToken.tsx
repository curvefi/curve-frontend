import { useCallback } from 'react'
import { InpChipUsdRate } from '@/lend/components/InpChipUsdRate'
import { StyledInpChip } from '@/lend/components/styles'
import type { NetworkConfig } from '@/lend/types/lend.types'
import { Box } from '@ui/Box'
import { InputDebounced, InputMaxBtn, InputProvider } from '@ui/InputComp'
import { formatNumber } from '@ui/utils'
import { useLegacyTokenInput } from '@ui-kit/hooks/useFeatureFlags'
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
  inpLabelDescription,
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
  inpLabelDescription: string
  inpValue: string
  tokenAddress: string | undefined
  tokenSymbol: string | undefined
  tokenBalance: string | undefined
  debt?: string
  handleInpChange(inpValue: string): void
  handleMaxClick(): void
  network: NetworkConfig
}) => {
  const { data: usdRate } = useTokenUsdRate({ chainId: network.chainId, tokenAddress })

  const onBalance = useCallback((val?: Decimal) => handleInpChange(val ?? ''), [handleInpChange])
  return useLegacyTokenInput() ? (
    <Box grid gridRowGap={1}>
      <InputProvider
        grid
        gridTemplateColumns="1fr auto"
        padding="4px 8px"
        inputVariant={inpError ? 'error' : undefined}
        disabled={inpDisabled}
        id={id}
      >
        <InputDebounced
          id={`${id}Amt`}
          testId={testId ?? `${id}Amt`}
          type="number"
          labelProps={{
            label: t`${tokenSymbol} Avail.`,
            descriptionLoading: inpLabelLoading,
            description: inpLabelDescription,
          }}
          value={inpValue}
          onChange={handleInpChange}
        />
        <InputMaxBtn testId={maxTestId ?? `${id}Max`} onClick={handleMaxClick} />
      </InputProvider>
      {+inpValue > 0 && <InpChipUsdRate address={tokenAddress} amount={inpValue} />}
      {inpError === 'too-much' ? (
        <StyledInpChip size="xs" isDarkBg isError>
          {t`Amount > wallet balance ${formatNumber(tokenBalance)}`}
        </StyledInpChip>
      ) : inpError === 'too-much-debt' && typeof debt !== 'undefined' ? (
        <StyledInpChip size="xs" isDarkBg isError>
          {t`Amount > max debt ${formatNumber(debt)}`}
        </StyledInpChip>
      ) : inpError === 'too-much-collateral' ? (
        <StyledInpChip size="xs" isDarkBg isError>
          {t`Amount > collateral ${formatNumber(tokenBalance)}`}
        </StyledInpChip>
      ) : null}
    </Box>
  ) : (
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
        usdRate,
        buttonTestId: maxTestId,
      }}
      label={inpLabel}
      balance={decimal(inpValue)}
      tokenSelector={
        <TokenLabel blockchainId={network.id} tooltip={tokenSymbol} address={tokenAddress} label={tokenSymbol ?? '?'} />
      }
      onBalance={onBalance}
    />
  )
}
