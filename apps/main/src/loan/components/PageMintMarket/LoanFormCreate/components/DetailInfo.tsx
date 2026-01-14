import { useMemo } from 'react'
import { useChainId } from 'wagmi'
import { DetailInfoLeverage } from '@/loan/components/PageMintMarket/LoanFormCreate/components/DetailInfoLeverage'
import { DetailInfoNonLeverage } from '@/loan/components/PageMintMarket/LoanFormCreate/components/DetailInfoNonLeverage'
import type { CreateFormDetailInfo, FormDetailInfoSharedProps } from '@/loan/components/PageMintMarket/types'
import { useStore } from '@/loan/store/useStore'
import { DetailInfo } from '@ui/DetailInfo'
import { getActiveStep } from '@ui/Stepper/helpers'
import { FORMAT_OPTIONS, formatNumber } from '@ui/utils'
import { t } from '@ui-kit/lib/i18n'
import { useTokenUsdRate } from '@ui-kit/lib/model/entities/token-usd-rate'

export const DetailInfoComp = (props: CreateFormDetailInfo) => {
  const { activeKeyLiqRange, formValues, isLeverage, isReady, llamma, haveSigner, steps, updateFormValues } = props

  const chainId = useChainId()
  const { data: collateralUsdRate } = useTokenUsdRate({ chainId, tokenAddress: llamma?.collateral ?? '' })

  const isEditLiqRange = useStore((state) => state.loanCreate.isEditLiqRange)
  const liqRangesMapper = useStore((state) => state.loanCreate.liqRangesMapper[activeKeyLiqRange])
  const setStateByKey = useStore((state) => state.loanCreate.setStateByKey)

  const activeStep = haveSigner ? getActiveStep(steps) : null

  const selectedLiqRange = useMemo(() => {
    if (formValues.n && liqRangesMapper) {
      return liqRangesMapper[formValues.n]
    }
  }, [formValues.n, liqRangesMapper])

  const handleLiqRangesEdit = () => {
    const showEditLiqRange = !isEditLiqRange
    setStateByKey('isEditLiqRange', showEditLiqRange)
    updateFormValues(formValues)
  }

  const handleSelLiqRange = (n: number) => {
    updateFormValues({ ...formValues, n })
  }

  const loanToValueRatio = useMemo(() => {
    if (+formValues.debt > 0 && +formValues.collateral > 0 && collateralUsdRate) {
      return +formValues.debt / (+formValues.collateral * +collateralUsdRate)
    }
    return ''
  }, [collateralUsdRate, formValues.collateral, formValues.debt])

  const detailInfoLTV = (
    <DetailInfo
      label={t`Loan to Value ratio:`}
      loading={!!formValues.debt && !!formValues.collateral && !isReady}
      loadingSkeleton={[90, 20]}
    >
      {loanToValueRatio ? <strong>{formatNumber(loanToValueRatio * 100, FORMAT_OPTIONS.PERCENT)}</strong> : '-'}
    </DetailInfo>
  )

  const additionalProps: FormDetailInfoSharedProps = {
    activeStep,
    isValidFormValues: +formValues.debt > 0 && !formValues.debtError,
    llamma,
    selectedLiqRange,
    handleLiqRangesEdit,
    handleSelLiqRange,
  }

  return isLeverage ? (
    <DetailInfoLeverage {...props} {...additionalProps} detailInfoLTV={detailInfoLTV} />
  ) : (
    <DetailInfoNonLeverage {...props} {...additionalProps} detailInfoLTV={detailInfoLTV} />
  )
}
