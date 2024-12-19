import type { BoxProps } from '@/ui/Box/types'

import React from 'react'
import { t } from '@lingui/macro'

import { formatNumber } from '@/ui/utils'

import { FieldsTitle } from '@/components/SharedFormStyles/FieldsWrapper'
import { StyledInpChip } from '@/components/PageLoanManage/styles'
import Box from '@/ui/Box'
import InputProvider, { InputDebounced, InputMaxBtn } from '@/ui/InputComp'
import InpChipUsdRate from '@/components/InpChipUsdRate'

const InpToken = ({
  id,
  testId,
  maxTestId,
  inpStyles,
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
}: {
  id: string
  testId?: string
  maxTestId?: string
  inpStyles?: BoxProps
  inpTopLabel?: string
  inpError: string
  inpDisabled: boolean
  inpLabelLoading: boolean
  inpLabelDescription: string
  inpValue: string
  tokenAddress: string | undefined
  tokenSymbol: string | undefined
  tokenBalance: string
  debt?: string
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
  )

export default InpToken
