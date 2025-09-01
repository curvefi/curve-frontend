import lodash from 'lodash'
import { useMemo } from 'react'
import { styled } from 'styled-components'
import Chip from '@ui/Typography/Chip'
import { BN, formatNumber } from '@ui/utils'

const FieldHelperUsdRate = ({ amount, usdRate }: { amount: string; usdRate: number | undefined }) => {
  const usdRateTotal = useMemo(() => {
    let total = ''

    if (!lodash.isUndefined(usdRate) && !lodash.isNaN(usdRate) && +usdRate > 0 && +amount > 0) {
      total = BN(usdRate).multipliedBy(amount).toString()
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

export default FieldHelperUsdRate
