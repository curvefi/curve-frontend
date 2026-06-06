import { BigNumber } from 'bignumber.js'
import { useMemo } from 'react'
import { styled } from 'styled-components'
import { Chip } from '@ui/Typography/Chip'
import { amount as toAmount, formatNumber } from '@ui-kit/utils'

export const FieldHelperUsdRate = ({ amount, usdRate }: { amount: string; usdRate: number | undefined }) => {
  const usdRateTotal = useMemo(() => {
    let total = ''

    if (usdRate != null && +usdRate > 0 && +amount > 0) {
      total = BigNumber(usdRate).multipliedBy(amount).toFixed()
    }
    return total
  }, [usdRate, amount])

  return (
    <StyledChip size="xs">
      x {usdRate && formatNumber(usdRate, 'usd.amount')} ≈ {formatNumber(toAmount(usdRateTotal), 'usd.amount')}
    </StyledChip>
  )
}

const StyledChip = styled(Chip)`
  margin-left: 0.125rem; // 2px
`
