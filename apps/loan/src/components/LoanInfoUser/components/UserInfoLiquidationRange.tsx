import React, { useMemo } from 'react'
import { t } from '@lingui/macro'
import isUndefined from 'lodash/isUndefined'

import { formatNumber } from '@/ui/utils'
import useStore from '@/store/useStore'

import ListInfoItem from '@/ui/ListInfo'

const UserInfoLiquidationRange = ({ llammaId }: { llammaId: string }) => {
  const isAdvanceMode = useStore((state) => state.isAdvanceMode)
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

  return (
    <>
      <ListInfoItem isFull title={t`Liquidation range`}>
        {liqPriceRange && <>{`${liqPriceRange.price1} to ${liqPriceRange.price2}`}</>}
      </ListInfoItem>
      {isAdvanceMode && (
        <ListInfoItem title={t`Band range`}>
          {liqPriceRange && <>{`${liqPriceRange.band1} to ${liqPriceRange.band2}`}</>}
        </ListInfoItem>
      )}
    </>
  )
}

export default UserInfoLiquidationRange
