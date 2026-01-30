import { useMemo } from 'react'
import { styled } from 'styled-components'
import { Chip } from '@ui/Typography/Chip'
import { BN, formatNumber } from '@ui/utils'

export const FieldHelperUsdRate = ({ amount, usdRate }: { amount: string; usdRate: number | null | undefined }) => {
  const usdRateTotal = useMemo(() => {
    let total = ''

    if (Number(usdRate) > 0 && Number(amount) > 0) {
      total = BN(Number(usdRate)).multipliedBy(amount).toString()
    }
    return total
  }, [usdRate, amount])

  return (
    <StyledChip size="xs">
      x {usdRate && formatNumber(usdRate, { currency: 'USD', defaultValue: '-' })} ≈
      {formatNumber(usdRateTotal, { currency: 'USD', defaultValue: '-' })}
    </StyledChip>
  )
}

const StyledChip = styled(Chip)`
  margin-left: 0.125rem; // 2px
`
