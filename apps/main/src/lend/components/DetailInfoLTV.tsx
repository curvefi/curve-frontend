import { useMemo } from 'react'
import { useChainId } from '@/lend/entities/chain'
import { DetailInfo } from '@ui/DetailInfo'
import { FORMAT_OPTIONS, formatNumber } from '@ui/utils'
import { t } from '@ui-kit/lib/i18n'
import { useTokenUsdRate, useTokenUsdRates } from '@ui-kit/lib/model/entities/token-usd-rate'

type Amount = { amount: string; address: string }

export const DetailInfoLTV = ({
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
