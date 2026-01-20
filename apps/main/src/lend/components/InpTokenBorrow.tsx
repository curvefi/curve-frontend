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

export const InpTokenBorrow = ({
  id,
  testId,
  maxTextId,
  inpStyles,
  inpTopLabel,
  inpError,
  inpDisabled,
  inpValue,
  tokenAddress,
  tokenSymbol,
  tokenBalance,
  maxRecv,
  handleInpChange,
  handleMaxClick,
  network,
}: {
  id: string
  testId?: string
  maxTextId?: string
  inpStyles?: BoxProps
  inpTopLabel?: string
  inpError: string
  inpDisabled: boolean
  inpValue: string
  tokenAddress: string | undefined
  tokenSymbol: string | undefined
  tokenBalance: string | undefined
  maxRecv: string | undefined
  handleInpChange(inpValue: string): void
  handleMaxClick(): void
  network: NetworkConfig
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
          id={`${id}Amt`}
          testId={testId ?? `${id}Amt`}
          type="number"
          labelProps={{ label: `${tokenSymbol} ${inpTopLabel ? '' : t`Borrow amount`}` }}
          value={inpValue}
          onChange={handleInpChange}
        />
        <InputMaxBtn testId={maxTextId ?? `${id}Max`} onClick={handleMaxClick} />
      </InputProvider>
      {+inpValue > 0 && <InpChipUsdRate address={tokenAddress} amount={inpValue} />}
      {inpError === 'too-much' ? (
        <StyledInpChip size="xs" isDarkBg isError>
          {t`Amount > max borrow ${formatNumber(maxRecv || '0')}`}
        </StyledInpChip>
      ) : (
        <StyledInpChip size="xs">{t`Max borrow amount ${formatNumber(maxRecv, { defaultValue: '-' })}`}</StyledInpChip>
      )}
    </Box>
  ) : (
    <LargeTokenInput
      name={id}
      testId={testId ?? `${id}Amt`}
      isError={!!inpError}
      message={inpError === 'too-much' ? t`Amount > max borrow ${formatNumber(maxRecv || '0')}` : undefined}
      disabled={inpDisabled}
      inputBalanceUsd={decimal(inpValue && usdRate && usdRate * +inpValue)}
      walletBalance={{
        loading: tokenBalance == null,
        balance: decimal(tokenBalance),
        symbol: tokenSymbol,
        usdRate: usdRate,
      }}
      maxBalance={{
        balance: decimal(maxRecv),
        chips: 'max',
      }}
      label={t`Borrow amount:`}
      balance={decimal(inpValue)}
      tokenSelector={
        <TokenLabel blockchainId={network.id} tooltip={tokenSymbol} address={tokenAddress} label={tokenSymbol ?? '?'} />
      }
      onBalance={onBalance}
    />
  )
}
