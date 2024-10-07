import Box from '@/ui/Box'
import type { BoxProps } from '@/ui/Box/types'

import InputProvider, { InputDebounced, InputMaxBtn } from '@/ui/InputComp'
import { formatNumber } from '@/ui/utils'
import { t } from '@lingui/macro'
import React from 'react'


import InpChipUsdRate from '@/components/InpChipUsdRate'
import { StyledInpChip } from '@/components/PageLoanManage/styles'
import { FieldsTitle } from '@/components/SharedFormStyles/FieldsWrapper'


const InpTokenRemove = ({
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
  )
}

export default InpTokenRemove
