import type { FormEstGas, FormValues } from '@/components/PageLoanCreate/LoanFormCreate/types'
import type { LiqRangeSliderIdx } from '@/store/types'
import type { Step } from '@/ui/Stepper/types'

import React, { useMemo } from 'react'
import { t } from '@lingui/macro'

import { getActiveStep } from '@/ui/Stepper/helpers'
import { FORMAT_OPTIONS, formatNumber } from '@/ui/utils'
import useStore from '@/store/useStore'

import DetailInfo from '@/ui/DetailInfo'
import DetailInfoNonLeverage from '@/components/PageLoanCreate/LoanFormCreate/components/DetailInfoNonLeverage'

const DetailInfoComp = (
  props: PageContentProps & {
    activeKey: string
    activeKeyLiqRange: string
    formEstGas: FormEstGas
    formValues: FormValues
    healthMode: HealthMode
    isAdvanceMode: boolean
    steps: Step[]
    setHealthMode: React.Dispatch<React.SetStateAction<HealthMode>>
    updateFormValues: (updatedFormValues: Partial<FormValues>) => void
  }
) => {
  const { activeKeyLiqRange, api, formValues, isLoaded, owmData, steps, updateFormValues } = props

  const { signerAddress } = api ?? {}
  const { owm } = owmData ?? {}

  const collateralUsdRate = useStore((state) => state.usdRates.tokens[owm?.addresses?.collateral_token ?? ''])
  const borrowedUsdRate = useStore((state) => state.usdRates.tokens[owm?.addresses?.borrowed_token ?? ''])
  const isEditLiqRange = useStore((state) => state.loanCreate.isEditLiqRange)
  const liqRanges = useStore((state) => state.loanCreate.liqRangesMapper[activeKeyLiqRange])
  const setStateByKey = useStore((state) => state.loanCreate.setStateByKey)

  const activeStep = signerAddress ? getActiveStep(steps) : null

  const selectedLiqRange = useMemo(() => {
    if (formValues.n && liqRanges) {
      return liqRanges[formValues.n]
    } else if (owm) {
      return { n: owm.defaultBands } as LiqRangeSliderIdx
    } else {
      return undefined
    }
  }, [formValues.n, liqRanges, owm])

  const handleLiqRangesEdit = () => {
    const showEditLiqRange = !isEditLiqRange
    setStateByKey('isEditLiqRange', showEditLiqRange)
    updateFormValues(formValues)
  }

  const handleSelLiqRange = (n: number) => {
    updateFormValues({ ...formValues, n })
  }

  const loanToValueRatio = useMemo(() => {
    if (+formValues.debt > 0 && +formValues.collateral > 0 && +collateralUsdRate > 0 && +borrowedUsdRate > 0) {
      return (+formValues.debt * +borrowedUsdRate) / (+formValues.collateral * +collateralUsdRate)
    }
    return ''
  }, [borrowedUsdRate, collateralUsdRate, formValues.collateral, formValues.debt])

  const detailInfoLTV = (
    <DetailInfo
      label={t`Loan to value ratio:`}
      loading={!!formValues.debt && !!formValues.collateral && !isLoaded}
      loadingSkeleton={[90, 20]}
    >
      {loanToValueRatio ? <strong>{formatNumber(loanToValueRatio * 100, FORMAT_OPTIONS.PERCENT)}</strong> : '-'}
    </DetailInfo>
  )

  return (
    <DetailInfoNonLeverage
      {...props}
      activeStep={activeStep}
      detailInfoLTV={detailInfoLTV}
      isValidFormValues={+formValues.debt > 0}
      selectedLiqRange={selectedLiqRange}
      handleLiqRangesEdit={handleLiqRangesEdit}
      handleSelLiqRange={handleSelLiqRange}
    />
  )
}

export default DetailInfoComp
