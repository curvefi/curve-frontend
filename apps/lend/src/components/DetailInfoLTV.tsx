import React, { useMemo } from 'react'
import { t } from '@lingui/macro'

import { FORMAT_OPTIONS, formatNumber } from '@/ui/utils'
import useStore from '@/store/useStore'

import DetailInfo from '@/ui/DetailInfo'

type Amount = { amount: string; address: string }

const DetailInfoLTV = ({
  loading,
  debt,
  collaterals,
}: {
  loading: boolean
  debt: Amount | undefined
  collaterals: Amount[] | undefined
}) => {
  const usdRatesMapper = useStore((state) => state.usdRates.tokens)

  const debtUsd = useMemo(() => {
    if (debt) {
      const usdRate = usdRatesMapper[debt.address]
      return +debt.amount * +usdRate
    }
  }, [debt, usdRatesMapper])

  const collateralUsd = useMemo(() => {
    if (!collaterals) return undefined

    const haveMissingUsdRates = collaterals.some(({ amount, address }) => {
      typeof usdRatesMapper[address] === 'undefined'
    })

    if (haveMissingUsdRates) return undefined

    return collaterals.reduce((prev, { amount, address }) => {
      const usdRate = usdRatesMapper[address]
      const amountInUsd = +amount * +usdRate
      prev += amountInUsd
      return prev
    }, 0)
  }, [collaterals, usdRatesMapper])

  return (
    <DetailInfo label={t`Loan to value ratio:`} loading={!debt && !collaterals && loading} loadingSkeleton={[90, 20]}>
      {collateralUsd && debtUsd ? (
        <strong>{formatNumber((debtUsd / collateralUsd) * 100, FORMAT_OPTIONS.PERCENT)}</strong>
      ) : (
        '-'
      )}
    </DetailInfo>
  )
}

export default DetailInfoLTV
