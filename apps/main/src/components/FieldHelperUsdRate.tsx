import Chip from '@/ui/Typography/Chip'
import { formatNumber, formatNumberUsdRate } from '@/ui/utils'
import isNaN from 'lodash/isNaN'
import isUndefined from 'lodash/isUndefined'
import React, { useMemo } from 'react'
import styled from 'styled-components'


import { BD } from '@/shared/curve-lib'

const FieldHelperUsdRate = ({ amount, usdRate }: { amount: string; usdRate: number | undefined }) => {
  const usdRateTotal = useMemo(() => {
    let total = ''

    if (!isUndefined(usdRate) && !isNaN(usdRate) && +usdRate > 0 && +amount > 0) {
      total = BD.from(usdRate).times(BD.from(amount)).toString()
    }
    return total
  }, [usdRate, amount])

  return (
    <StyledChip size="xs">
      x {usdRate && formatNumberUsdRate(usdRate, true)} ≈
      {formatNumber(usdRateTotal, { currency: 'USD', defaultValue: '-' })}
    </StyledChip>
  )
}

const StyledChip = styled(Chip)`
  margin-left: 0.125rem; // 2px
`

export default FieldHelperUsdRate
