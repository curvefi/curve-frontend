import { styled } from 'styled-components'
import { DetailInfoBorrowRate } from '@/loan/components/DetailInfoBorrowRate'
import { DetailInfoEstimateGas as DetailInfoEstGas } from '@/loan/components/DetailInfoEstimateGas'
import { DetailInfoHealth } from '@/loan/components/DetailInfoHealth'
import { DetailInfoLiqRange } from '@/loan/components/DetailInfoLiqRange'
import { DetailInfoN } from '@/loan/components/DetailInfoN'
import type { CreateFormDetailInfo, FormDetailInfoSharedProps } from '@/loan/components/PageMintMarket/types'
import { DEFAULT_DETAIL_INFO_LEVERAGE } from '@/loan/components/PageMintMarket/utils'
import { useUserLoanDetails } from '@/loan/hooks/useUserLoanDetails'
import { useStore } from '@/loan/store/useStore'
import { getTokenName } from '@/loan/utils/utilsLoan'
import { DetailInfo } from '@ui/DetailInfo'
import { formatNumber } from '@ui/utils'
import { useUserProfileStore } from '@ui-kit/features/user-profile'
import { t } from '@ui-kit/lib/i18n'
import { LiquidationRangeSlider } from '@ui-kit/shared/ui/LiquidationRangeSlider'
import { SlippageToleranceActionInfo } from '@ui-kit/widgets/SlippageSettings'
import { DetailInfoTradeRoutes } from './DetailInfoTradeRoutes'

export const DetailInfoLeverage = ({
  activeKey,
  activeKeyLiqRange,
  activeStep,
  chainId,
  detailInfoLTV,
  formEstGas,
  isAdvanceMode,
  isReady,
  isValidFormValues = true,
  haveSigner,
  healthMode,
  llamma,
  steps,
  handleSelLiqRange,
  selectedLiqRange,
  setHealthMode,
  handleLiqRangesEdit,
}: CreateFormDetailInfo & FormDetailInfoSharedProps) => {
  const llammaId = llamma?.id ?? ''
  const detailInfo = useStore((state) => state.loanCreate.detailInfoLeverage[activeKey] ?? DEFAULT_DETAIL_INFO_LEVERAGE)
  const formValues = useStore((state) => state.loanCreate.formValues)
  const isEditLiqRange = useStore((state) => state.loanCreate.isEditLiqRange)
  const liqRanges = useStore((state) => state.loanCreate.liqRanges[activeKeyLiqRange])
  const loanDetails = useStore((state) => state.loans.detailsMapper[llammaId])
  const userLoanDetails = useUserLoanDetails(llammaId)

  const maxSlippage = useUserProfileStore((state) => state.maxSlippage.crypto)

  const leverageDetailInfos = (
    <>
      <DetailInfo label={t`Leverage:`} loading={!isReady || detailInfo.loading} loadingSkeleton={[50, 20]}>
        {isValidFormValues && detailInfo.leverage ? (
          <strong>{formatNumber(detailInfo.leverage, { maximumFractionDigits: 2 })}x</strong>
        ) : (
          '-'
        )}
      </DetailInfo>
      <DetailInfo
        isBold={isValidFormValues && detailInfo.isHighImpact}
        variant={isValidFormValues && detailInfo.isHighImpact ? 'error' : undefined}
        label={isValidFormValues && detailInfo.isHighImpact ? t`High price impact:` : t`Price impact:`}
        loading={!isReady || detailInfo.loading}
        loadingSkeleton={[70, 20]}
      >
        {isValidFormValues && detailInfo.priceImpact ? (
          <strong>{formatNumber(detailInfo.priceImpact, { style: 'percent', maximumFractionDigits: 4 })}</strong>
        ) : (
          '-'
        )}
      </DetailInfo>
    </>
  )

  return (
    <div>
      {isAdvanceMode ? (
        <>
          <DetailInfoLiqRange
            {...detailInfo}
            detailInfoLeverage={
              <DetailInfoLeverageWrapper>
                {leverageDetailInfos}
                <DetailInfoTradeRoutes
                  loading={!isReady || detailInfo.loading}
                  routes={detailInfo.routeName}
                  input={formValues.debt}
                  inputSymbol={getTokenName(llamma).stablecoin}
                  output={
                    !!detailInfo.collateral && !!formValues.collateral
                      ? +detailInfo.collateral - +formValues.collateral
                      : ''
                  }
                  outputSymbol={llamma?.collateralSymbol ?? ''}
                />
              </DetailInfoLeverageWrapper>
            }
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
      ) : (
        leverageDetailInfos
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
      <SlippageToleranceActionInfo maxSlippage={maxSlippage} />
      <DetailInfo
        isDivider
        label={t`Total position collateral:`}
        loading={!isReady || detailInfo.loading}
        loadingSkeleton={[90, 20]}
      >
        {isValidFormValues && detailInfo.collateral ? (
          <strong>
            {formatNumber(detailInfo.collateral)} {llamma?.collateralSymbol}
          </strong>
        ) : (
          '-'
        )}
      </DetailInfo>
      {haveSigner && chainId && (
        <DetailInfoEstGas
          chainId={chainId}
          {...formEstGas}
          stepProgress={activeStep && steps.length > 1 ? { active: activeStep, total: steps.length } : null}
        />
      )}
    </div>
  )
}

const DetailInfoLeverageWrapper = styled.div`
  border: 1px solid var(--border-400);
  padding: 0.5rem 0.75rem;
  margin-bottom: 1rem;
`
