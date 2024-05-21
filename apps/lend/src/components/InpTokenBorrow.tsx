import type { BoxProps } from '@/ui/Box/types'

import React from 'react'
import { t } from '@lingui/macro'

import { formatNumber } from '@/ui/utils'

import { FieldsTitle } from '@/components/SharedFormStyles/FieldsWrapper'
import { StyledInpChip } from '@/components/PageLoanManage/styles'
import Box from '@/ui/Box'
import InputProvider, { InputDebounced, InputMaxBtn } from '@/ui/InputComp'
import InpChipUsdRate from '@/components/InpChipUsdRate'

const InpTokenBorrow = ({
  id,
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
}) => {
  return (
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
          labelProps={{ label: `${tokenSymbol} ${inpTopLabel ? '' : t`Borrow amount`}` }}
          value={inpValue}
          onChange={handleInpChange}
        />
        <InputMaxBtn onClick={handleMaxClick} />
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
}

export default InpTokenBorrow
