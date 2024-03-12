import type { ChipProps } from '@/ui/Typography/types'

import React, { useMemo } from 'react'

import { FORMAT_OPTIONS, formatNumber } from '@/ui/utils'
import useStore from '@/store/useStore'

import { StyledInpChip } from '@/components/PageLoanManage/styles'
import TextCaption from '@/ui/TextCaption'

const InpChipUsdRate = ({
  className = '',
  address,
  amount,
  hideRate,
  ...props
}: ChipProps & {
  className?: string
  address: string | undefined
  amount: string | undefined
  hideRate?: boolean
}) => {
  const usdRatesMapper = useStore((state) => state.usdRates.tokens)

  const tokenUsdRate = useMemo(() => {
    if (address) {
      return usdRatesMapper[address] || null
    }
    return null
  }, [address, usdRatesMapper])

  const amountUsd = useMemo(() => {
    if (tokenUsdRate && typeof amount !== 'undefined') {
      return +amount * +tokenUsdRate
    }
    return undefined
  }, [tokenUsdRate, amount])

  const formattedAmountUsd = formatNumber(amountUsd, { ...FORMAT_OPTIONS.USD, defaultValue: '-' })

  return (
    <>
      {hideRate ? (
        <TextCaption className={className} {...props}>
          {formattedAmountUsd}
        </TextCaption>
      ) : (
        <StyledInpChip className={className} size="xs">
          x {formatNumber(tokenUsdRate)} ≈{formattedAmountUsd}
        </StyledInpChip>
      )}
    </>
  )
}

export default InpChipUsdRate
