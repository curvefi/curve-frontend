


import DetailInfo from '@/ui/DetailInfo'
import { getActiveStep } from '@/ui/Stepper/helpers'
import { FORMAT_OPTIONS, formatNumber } from '@/ui/utils'
import { t } from '@lingui/macro'
import React, { useMemo } from 'react'
import DetailInfoLeverage from '@/components/PageLoanCreate/LoanFormCreate/components/DetailInfoLeverage'
import DetailInfoNonLeverage from '@/components/PageLoanCreate/LoanFormCreate/components/DetailInfoNonLeverage'
import type { FormDetailInfo, FormDetailInfoSharedProps } from '@/components/PageLoanCreate/types'
import useStore from '@/store/useStore'

const DetailInfoComp = (props: FormDetailInfo) => {
  const { activeKeyLiqRange, formValues, isLeverage, isReady, llamma, haveSigner, steps, updateFormValues } = props

  const collateralUsdRate = useStore((state) => state.usdRates.tokens[llamma?.collateral ?? ''])
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

export default DetailInfoComp
