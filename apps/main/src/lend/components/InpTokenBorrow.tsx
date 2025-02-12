import type { BoxProps } from '@ui/Box/types'

import React from 'react'
import { t } from '@ui-kit/lib/i18n'

import { formatNumber } from '@ui/utils'

import { FieldsTitle } from '@/lend/components/SharedFormStyles/FieldsWrapper'
import { StyledInpChip } from '@/lend/components/PageLoanManage/styles'
import Box from '@ui/Box'
import InputProvider, { InputDebounced, InputMaxBtn } from '@ui/InputComp'
import InpChipUsdRate from '@/lend/components/InpChipUsdRate'

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
  maxRecv,
  handleInpChange,
  handleMaxClick,
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
  maxRecv: string | undefined
  handleInpChange(inpValue: string): void
  handleMaxClick(): void
}) => (
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
)

export default InpTokenBorrow
