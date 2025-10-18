import { useCallback } from 'react'
import InpChipUsdRate from '@/lend/components/InpChipUsdRate'
import { StyledInpChip } from '@/lend/components/PageLoanManage/styles'
import { FieldsTitle } from '@/lend/components/SharedFormStyles/FieldsWrapper'
import type { NetworkConfig } from '@/lend/types/lend.types'
import Box from '@ui/Box'
import InputProvider, { InputDebounced, InputMaxBtn } from '@ui/InputComp'
import { formatNumber } from '@ui/utils'
import { useReleaseChannel } from '@ui-kit/hooks/useLocalStorage'
import { t } from '@ui-kit/lib/i18n'
import { useTokenUsdRate } from '@ui-kit/lib/model/entities/token-usd-rate'
import { LargeTokenInput } from '@ui-kit/shared/ui/LargeTokenInput'
import { TokenLabel } from '@ui-kit/shared/ui/TokenLabel'
import { ReleaseChannel, decimal, type Decimal } from '@ui-kit/utils'

const InpToken = ({
  id,
  testId,
  maxTestId,
  inpTopLabel,
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
  inpTopLabel?: string
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
  const [releaseChannel] = useReleaseChannel()
  const onBalance = useCallback((val?: Decimal) => handleInpChange(val ?? ''), [handleInpChange])
  return releaseChannel !== ReleaseChannel.Beta ? (
    <Box grid gridRowGap={1}>
      {inpTopLabel && <FieldsTitle>{inpTopLabel}</FieldsTitle>}
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
        notionalValueUsd: usdRate != null && tokenBalance != null ? usdRate * +tokenBalance : undefined,
        clickTestId: maxTestId,
      }}
      label={inpTopLabel}
      balance={decimal(inpValue)}
      tokenSelector={
        <TokenLabel blockchainId={network.id} tooltip={tokenSymbol} address={tokenAddress} label={tokenSymbol ?? '?'} />
      }
      onBalance={onBalance}
    />
  )
}

export default InpToken
