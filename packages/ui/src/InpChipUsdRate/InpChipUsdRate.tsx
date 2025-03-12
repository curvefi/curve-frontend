import { useMemo } from 'react'
import styled from 'styled-components'
import TextCaption from 'ui/src/TextCaption'
import Chip from 'ui/src/Typography/Chip'
import type { ChipProps } from 'ui/src/Typography/types'
import { FORMAT_OPTIONS, formatNumber } from 'ui/src/utils'

export type InpChipUsdRateProps = ChipProps & {
  className?: string
  amount: string | undefined
  hideRate?: boolean
  usdRate: string | number | undefined
}

const InpChipUsdRate = ({ className = '', amount, hideRate, usdRate, ...props }: InpChipUsdRateProps) => {
  const amountUsd = useMemo(() => {
    if (typeof usdRate === 'undefined' || typeof amount === 'undefined') return undefined
    return +amount * +usdRate
  }, [usdRate, amount])

  const formattedAmountUsd = formatNumber(amountUsd, { ...FORMAT_OPTIONS.USD, defaultValue: '-' })

  return (
    <>
      {hideRate ? (
        <TextCaption className={className} {...props}>
          {formattedAmountUsd}
        </TextCaption>
      ) : (
        <StyledInpChip className={className} size="xs">
          x {formatNumber(usdRate)} ≈{formattedAmountUsd}
        </StyledInpChip>
      )}
    </>
  )
}

const StyledInpChip = styled(Chip)<{ noPadding?: boolean }>`
  padding: ${({ noPadding }) => (noPadding ? '0' : '0 0.3125rem')}; // 5px
  min-height: 0.875rem; // 14px
  opacity: 0.9;
`

export default InpChipUsdRate
