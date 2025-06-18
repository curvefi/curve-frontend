import DetailInfoBorrowRate from '@/loan/components/DetailInfoBorrowRate'
import DetailInfoEstGas from '@/loan/components/DetailInfoEstimateGas'
import DetailInfoHealth from '@/loan/components/DetailInfoHealth'
import DetailInfoLiqRange from '@/loan/components/DetailInfoLiqRange'
import DetailInfoN from '@/loan/components/DetailInfoN'
import type { FormDetailInfo, FormDetailInfoSharedProps } from '@/loan/components/PageLoanCreate/types'
import { DEFAULT_DETAIL_INFO } from '@/loan/components/PageLoanManage/utils'
import { useUserLoanDetails } from '@/loan/hooks/useUserLoanDetails'
import useStore from '@/loan/store/useStore'
import { LiquidationRangeSlider } from '@ui-kit/shared/ui/LiquidationRangeSlider'

const DetailInfoNonLeverage = ({
  activeKey,
  activeStep,
  activeKeyLiqRange,
  chainId,
  formEstGas,
  detailInfoLTV,
  haveSigner,
  healthMode,
  isAdvanceMode,
  isReady,
  isValidFormValues = true,
  llamma,
  llammaId,
  steps,
  handleSelLiqRange,
  selectedLiqRange,
  setHealthMode,
  handleLiqRangesEdit,
}: FormDetailInfo & FormDetailInfoSharedProps) => {
  const detailInfo = useStore((state) => state.loanCreate.detailInfo[activeKey] ?? DEFAULT_DETAIL_INFO)
  const formValues = useStore((state) => state.loanCreate.formValues)
  const isEditLiqRange = useStore((state) => state.loanCreate.isEditLiqRange)
  const liqRanges = useStore((state) => state.loanCreate.liqRanges[activeKeyLiqRange])
  const loanDetails = useStore((state) => state.loans.detailsMapper[llammaId])
  const userLoanDetails = useUserLoanDetails(llammaId)

  return (
    <div>
      {isAdvanceMode && (
        <>
          <DetailInfoLiqRange
            {...detailInfo}
            healthMode={haveSigner ? healthMode : null}
            isEditLiqRange={isEditLiqRange}
            isValidFormValues={isValidFormValues}
            loading={detailInfo.loading}
            loanDetails={loanDetails}
            selectedLiqRange={selectedLiqRange}
            userLoanDetails={userLoanDetails}
            handleLiqRangesEdit={handleLiqRangesEdit}
          />
          <DetailInfoN isReady={isReady} n={formValues.n} />
          <LiquidationRangeSlider
            {...detailInfo}
            liqRanges={liqRanges}
            maxBands={llamma?.maxBands}
            minBands={llamma?.minBands}
            selectedLiqRange={selectedLiqRange}
            showEditLiqRange={isEditLiqRange}
            handleSelLiqRange={handleSelLiqRange}
          />
        </>
      )}
      {haveSigner && (
        <DetailInfoHealth
          {...detailInfo}
          isManage={false}
          amount={formValues.debt}
          formType="create-loan"
          healthMode={healthMode}
          isValidFormValues={isValidFormValues}
          loanDetails={loanDetails}
          setHealthMode={setHealthMode}
          userLoanDetails={userLoanDetails}
        />
      )}
      <DetailInfoBorrowRate parameters={loanDetails?.parameters} />
      {isAdvanceMode && detailInfoLTV}
      {haveSigner && chainId && (
        <DetailInfoEstGas
          isDivider
          chainId={chainId}
          {...formEstGas}
          stepProgress={activeStep && steps.length > 1 ? { active: activeStep, total: steps.length } : null}
        />
      )}
    </div>
  )
}

export default DetailInfoNonLeverage
