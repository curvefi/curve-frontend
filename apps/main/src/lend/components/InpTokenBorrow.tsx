import { useCallback } from 'react'
import InpChipUsdRate from '@/lend/components/InpChipUsdRate'
import { StyledInpChip } from '@/lend/components/PageLoanManage/styles'
import { FieldsTitle } from '@/lend/components/SharedFormStyles/FieldsWrapper'
import type { NetworkConfig } from '@/lend/types/lend.types'
import Box from '@ui/Box'
import type { BoxProps } from '@ui/Box/types'
import InputProvider, { InputDebounced, InputMaxBtn } from '@ui/InputComp'
import { formatNumber } from '@ui/utils'
import { useReleaseChannel } from '@ui-kit/hooks/useLocalStorage'
import { t } from '@ui-kit/lib/i18n'
import { useTokenUsdRate } from '@ui-kit/lib/model/entities/token-usd-rate'
import { LargeTokenInput } from '@ui-kit/shared/ui/LargeTokenInput'
import { TokenLabel } from '@ui-kit/shared/ui/TokenLabel'
import { ReleaseChannel, decimal, type Decimal } from '@ui-kit/utils'

const InpTokenBorrow = ({
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
  const [releaseChannel] = useReleaseChannel()
  const onBalance = useCallback((val?: Decimal) => handleInpChange(val ?? ''), [handleInpChange])
  return releaseChannel !== ReleaseChannel.Beta ? (
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
      inputBalanceUsd={usdRate ? decimal((usdRate * +inpValue).toString()) : undefined}
      walletBalance={{
        loading: tokenBalance == null,
        balance: decimal(tokenBalance),
        symbol: tokenSymbol,
        notionalValueUsd: usdRate != null && tokenBalance != null ? usdRate * +tokenBalance : undefined,
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

export default InpTokenBorrow
