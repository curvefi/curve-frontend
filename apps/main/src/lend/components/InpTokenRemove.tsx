import { useCallback } from 'react'
import { InpChipUsdRate } from '@/lend/components/InpChipUsdRate'
import { FieldsTitle } from '@/lend/components/SharedFormStyles/FieldsWrapper'
import { StyledInpChip } from '@/lend/components/styles'
import type { NetworkConfig } from '@/lend/types/lend.types'
import { Box } from '@ui/Box'
import type { BoxProps } from '@ui/Box/types'
import { InputDebounced, InputMaxBtn, InputProvider } from '@ui/InputComp'
import { formatNumber } from '@ui/utils'
import { useLegacyTokenInput } from '@ui-kit/hooks/useFeatureFlags'
import { t } from '@ui-kit/lib/i18n'
import { useTokenUsdRate } from '@ui-kit/lib/model/entities/token-usd-rate'
import { LargeTokenInput } from '@ui-kit/shared/ui/LargeTokenInput'
import { TokenLabel } from '@ui-kit/shared/ui/TokenLabel'
import { decimal, type Decimal } from '@ui-kit/utils'

export const InpTokenRemove = ({
  network,
  id,
  inpStyles,
  inpTopLabel,
  inpError,
  inpDisabled,
  inpLabelLoading,
  inpLabelDescription,
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
  inpStyles?: BoxProps
  inpTopLabel?: string
  inpError: string
  inpDisabled: boolean
  inpLabelLoading: boolean
  inpLabelDescription: string
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
  return useLegacyTokenInput() ? (
    <Box grid gridRowGap={1} {...inpStyles}>
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
          id={`inp${id}`}
          type="number"
          labelProps={{
            label: t`${tokenSymbol} Avail.`,
            descriptionLoading: inpLabelLoading,
            description: inpLabelDescription,
          }}
          value={inpValue}
          onChange={handleInpChange}
        />
        <InputMaxBtn onClick={handleMaxClick} />
      </InputProvider>
      {+inpValue > 0 && <InpChipUsdRate address={tokenAddress} amount={inpValue} />}
      {inpError === 'too-much' ? (
        <StyledInpChip size="xs" isDarkBg isError>
          {t`Amount > wallet balance ${formatNumber(tokenBalance)}`}
        </StyledInpChip>
      ) : inpError === 'too-much-max' ? (
        <StyledInpChip size="xs" isDarkBg isError>
          {t`Amount > max removable ${formatNumber(maxRemovable)}`}
        </StyledInpChip>
      ) : (
        <StyledInpChip size="xs" isDarkBg>
          {t`Max removable ${formatNumber(maxRemovable)}`}
        </StyledInpChip>
      )}
    </Box>
  ) : (
    <LargeTokenInput
      name="collateral"
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
