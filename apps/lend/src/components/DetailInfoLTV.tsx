import React, { useMemo } from 'react'
import { t } from '@lingui/macro'

import { FORMAT_OPTIONS, formatNumber } from '@/ui/utils'

import DetailInfo from '@/ui/DetailInfo'
import { useTokenUsdRate, useTokenUsdRates } from '@/entities/token'
import { useChainId } from '@/entities/chain'

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
  const { data: chainId } = useChainId()
  const { data: debtUsdRate } = useTokenUsdRate({ chainId, tokenAddress: debt?.address })
  const collateralAddresses = useMemo(() => collaterals?.map((c) => c.address), [collaterals])
  const { data: collateralUsdRates } = useTokenUsdRates({ chainId, tokenAddresses: collateralAddresses })

  const debtUsd = useMemo(() => debt && debtUsdRate && +debt.amount * +debtUsdRate, [debt, debtUsdRate])

  const collateralUsd = useMemo(() => {
    if (!collaterals?.every((c) => collateralUsdRates?.[c.address] != null)) return undefined
    return collaterals.reduce((prev, { amount, address }) => prev + +amount * +collateralUsdRates![address], 0)
  }, [collaterals, collateralUsdRates])

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
