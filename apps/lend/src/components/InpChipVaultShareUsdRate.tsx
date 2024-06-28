import type { ChipProps } from '@/ui/Typography/types'

import React from 'react'

import { StyledInpChip } from '@/components/PageLoanManage/styles'
import TextCaption from '@/ui/TextCaption'
import Box from '@/ui/Box'
import useVaultShares from '@/hooks/useVaultShares'

const ChipVaultSharesUsdRate = ({
  className = '',
  rChainId,
  rOwmId,
  amount,
  hideRate,
  noPadding,
  ...props
}: ChipProps & {
  className?: string
  rChainId: ChainId
  rOwmId: string
  amount: string | number | undefined
  hideRate?: boolean
  noPadding?: boolean
}) => {
  const { isLoading, isError, borrowedAmount, borrowedAmountUsd } = useVaultShares(rChainId, rOwmId, amount)

  return (
    <>
      {isLoading ? null : isError ? (
        '?'
      ) : (
        <>
          {hideRate ? (
            <TextCaption className={className} {...props}>
              {borrowedAmount} ({borrowedAmountUsd})
            </TextCaption>
          ) : (
            <Box grid gridGap={1}>
              <StyledInpChip noPadding={noPadding} className={className}>
                {borrowedAmount}
              </StyledInpChip>
              <StyledInpChip noPadding={noPadding} className={className} size="xs">
                {borrowedAmountUsd}
              </StyledInpChip>
            </Box>
          )}
        </>
      )}
    </>
  )
}

export default ChipVaultSharesUsdRate
