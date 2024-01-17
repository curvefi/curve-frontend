import React, { useMemo } from 'react'
import isNaN from 'lodash/isNaN'
import isUndefined from 'lodash/isUndefined'
import styled from 'styled-components'

import { formatNumber, formatNumberUsdRate } from '@/ui/utils'

import Chip from '@/ui/Typography/Chip'

const FieldHelperUsdRate = ({ amount, usdRate }: { amount: string; usdRate: number | undefined }) => {
  const usdRateTotal = useMemo(() => {
    let total = ''

    if (!isUndefined(usdRate) && !isNaN(usdRate) && +usdRate > 0 && +amount > 0) {
      total = (Number(usdRate) * Number(amount)).toString()
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
