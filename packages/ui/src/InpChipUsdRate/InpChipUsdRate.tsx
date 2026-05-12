import { useMemo } from 'react'
import { styled } from 'styled-components'
import { TextCaption } from '@ui/TextCaption'
import { Chip } from '@ui/Typography/Chip'
import type { ChipProps } from '@ui/Typography/types'
import { amount as toAmount, formatNumber } from '@ui-kit/utils'

export type InpChipUsdRateProps = ChipProps & {
  className?: string
  amount: string | undefined
  hideRate?: boolean
  usdRate: string | number | undefined
}

export const InpChipUsdRate = ({ className = '', amount, hideRate, usdRate, ...props }: InpChipUsdRateProps) => {
  const amountUsd = useMemo(() => {
    if (typeof usdRate === 'undefined' || typeof amount === 'undefined') return undefined
    return +amount * +usdRate
  }, [usdRate, amount])

  const formattedAmountUsd = formatNumber(amountUsd, { unit: 'dollar', abbreviate: false, fallback: '-' })

  return (
    <>
      {hideRate ? (
        <TextCaption className={className} {...props}>
          {formattedAmountUsd}
        </TextCaption>
      ) : (
        <StyledInpChip className={className} size="xs">
          x {formatNumber(toAmount(usdRate), { abbreviate: false, fallback: '-' })} ≈ {formattedAmountUsd}
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
