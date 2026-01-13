import { useMemo } from 'react'
import { DetailInfoLeverage } from '@/lend/components/PageLendMarket/LoanFormCreate/components/DetailInfoLeverage'
import { DetailInfoNonLeverage } from '@/lend/components/PageLendMarket/LoanFormCreate/components/DetailInfoNonLeverage'
import type { DetailInfoCompAdditionalProps, DetailInfoCompProps } from '@/lend/components/PageLendMarket/types'
import type { LiqRangeSliderIdx } from '@/lend/store/types'
import { useStore } from '@/lend/store/useStore'
import { PageContentProps } from '@/lend/types/lend.types'
import { getActiveStep } from '@ui/Stepper/helpers'

export const DetailInfoComp = ({
  isLeverage,
  ...props
}: PageContentProps & DetailInfoCompProps & { isLeverage: boolean }) => {
  const { api, market, steps, updateFormValues } = props

  const { signerAddress } = api ?? {}
  const activeKeyLiqRange = useStore((state) => state.loanCreate.activeKeyLiqRange)
  const formValues = useStore((state) => state.loanCreate.formValues)
  const isEditLiqRange = useStore((state) => state.loanCreate.isEditLiqRange)
  const liqRanges = useStore((state) => state.loanCreate.liqRangesMapper[activeKeyLiqRange])
  const setStateByKey = useStore((state) => state.loanCreate.setStateByKey)

  const activeStep = signerAddress ? getActiveStep(steps) : null

  const selectedLiqRange = useMemo(() => {
    if (formValues.n && liqRanges) {
      return liqRanges[formValues.n]
    } else if (market) {
      return { n: market.defaultBands } as LiqRangeSliderIdx
    } else {
      return undefined
    }
  }, [formValues.n, liqRanges, market])

  const handleLiqRangesEdit = () => {
    const showEditLiqRange = !isEditLiqRange
    setStateByKey('isEditLiqRange', showEditLiqRange)
    updateFormValues(formValues)
  }

  const handleSelLiqRange = (n: number) => {
    updateFormValues({ ...formValues, n })
  }

  const additionalProps: DetailInfoCompAdditionalProps = {
    activeStep,
    selectedLiqRange,
    handleLiqRangesEdit,
    handleSelLiqRange,
  }

  return isLeverage ? (
    <DetailInfoLeverage {...props} {...additionalProps} />
  ) : (
    <DetailInfoNonLeverage {...props} {...additionalProps} />
  )
}
