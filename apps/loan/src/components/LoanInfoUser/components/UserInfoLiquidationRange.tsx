import React, { useMemo } from 'react'
import isUndefined from 'lodash/isUndefined'

import { formatNumber } from '@ui/utils'
import useStore from '@loan/store/useStore'

const UserInfoLiquidationRange = ({
  llammaId,
  type,
}: {
  llammaId: string
  type: 'liquidationRange' | 'liquidationBandRange'
}) => {
  const userLoanDetails = useStore((state) => state.loans.userDetailsMapper[llammaId])

  const { userPrices, userBands } = userLoanDetails ?? {}

  const liqPriceRange = useMemo(() => {
    const [price1, price2] = userPrices ?? []
    const [band1, band2] = userBands ?? []

    if (!isUndefined(price1) && !isUndefined(price2) && !isUndefined(band1) && !isUndefined(band2)) {
      const parsedPrice1 = `${formatNumber(price1, { maximumFractionDigits: 2 })}`
      const parsedPrice2 = `${formatNumber(price2, { maximumFractionDigits: 2 })}`
      return { price1: parsedPrice1, price2: parsedPrice2, band1, band2 }
    }
  }, [userPrices, userBands])

  if (type === 'liquidationRange') {
    return liqPriceRange && <>{`${liqPriceRange.price1} to ${liqPriceRange.price2}`}</>
  }

  if (type === 'liquidationBandRange') {
    return liqPriceRange && <>{`${liqPriceRange.band1} to ${liqPriceRange.band2}`}</>
  }

  return null
}

export default UserInfoLiquidationRange
