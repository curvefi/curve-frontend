import type { FormEstGas, FormValues } from '@/components/PageLoanCreate/LoanFormCreate/types'
import type { Step } from '@/ui/Stepper/types'
import type { LiqRangeSliderIdx } from '@/store/types'

import React from 'react'

import { DEFAULT_DETAIL_INFO } from '@/components/PageLoanManage/utils'
import useStore from '@/store/useStore'

import DetailInfoRate from '@/components/DetailInfoRate'
import DetailInfoEstGas from '@/components/DetailInfoEstimateGas'
import DetailInfoHealth from '@/components/DetailInfoHealth'
import DetailInfoLiqRange from '@/components/DetailInfoLiqRange'
import DetailInfoLiqRangeEdit from '@/components/DetailInfoLiqRangeEdit'
import DetailInfoN from '@/components/DetailInfoN'

const DetailInfoNonLeverage = ({
  activeKey,
  activeStep,
  activeKeyLiqRange,
  rChainId,
  rOwmId,
  api,
  formEstGas,
  detailInfoLTV,
  healthMode,
  isAdvanceMode,
  isLoaded,
  isValidFormValues = true,
  owmData,
  steps,
  userActiveKey,
  handleSelLiqRange,
  selectedLiqRange,
  setHealthMode,
  handleLiqRangesEdit,
}: PageContentProps & {
  activeKey: string
  activeKeyLiqRange: string
  activeStep: number | null
  detailInfoLTV?: React.ReactNode
  formEstGas: FormEstGas
  formValues: FormValues
  healthMode: HealthMode
  isAdvanceMode: boolean
  isValidFormValues?: boolean
  selectedLiqRange: LiqRangeSliderIdx | undefined
  steps: Step[]
  userActiveKey: string
  handleLiqRangesEdit(): void
  handleSelLiqRange(n: number): void
  setHealthMode: React.Dispatch<React.SetStateAction<HealthMode>>
  updateFormValues: (updatedFormValues: Partial<FormValues>) => void
}) => {
  const createLoanDetailInfo = useStore((state) => state.loanCreate.detailInfo[activeKey] ?? DEFAULT_DETAIL_INFO)
  const formValues = useStore((state) => state.loanCreate.formValues)
  const isEditLiqRange = useStore((state) => state.loanCreate.isEditLiqRange)
  const liqRanges = useStore((state) => state.loanCreate.liqRanges[activeKeyLiqRange])

  const { signerAddress } = api ?? {}
  const { owm } = owmData ?? {}

  return (
    <div>
      {isAdvanceMode && (
        <>
          <DetailInfoLiqRange
            {...createLoanDetailInfo}
            rChainId={rChainId}
            rOwmId={rOwmId}
            healthMode={signerAddress ? healthMode : null}
            isEditLiqRange={isEditLiqRange}
            isValidFormValues={isValidFormValues}
            selectedLiqRange={selectedLiqRange}
            userActiveKey={userActiveKey}
            handleLiqRangesEdit={handleLiqRangesEdit}
          />
          <DetailInfoN isLoaded={isLoaded} n={formValues.n} />
          <DetailInfoLiqRangeEdit
            {...createLoanDetailInfo}
            liqRanges={liqRanges}
            maxBands={owm?.maxBands}
            minBands={owm?.minBands}
            selectedLiqRange={selectedLiqRange}
            showEditLiqRange={isEditLiqRange}
            handleSelLiqRange={handleSelLiqRange}
          />
        </>
      )}
      {signerAddress && (
        <DetailInfoHealth
          {...createLoanDetailInfo}
          rChainId={rChainId}
          rOwmId={rOwmId}
          isManage={false}
          amount={formValues.debt}
          formType="create-loan"
          healthMode={healthMode}
          isValidFormValues={isValidFormValues}
          setHealthMode={setHealthMode}
          userActiveKey={userActiveKey}
        />
      )}
      <DetailInfoRate isBorrow rChainId={rChainId} rOwmId={rOwmId} futureRates={createLoanDetailInfo?.futureRates} />
      {isAdvanceMode && detailInfoLTV}
      {signerAddress && (
        <DetailInfoEstGas
          isDivider
          chainId={rChainId}
          {...formEstGas}
          stepProgress={activeStep && steps.length > 1 ? { active: activeStep, total: steps.length } : null}
        />
      )}
    </div>
  )
}

export default DetailInfoNonLeverage
