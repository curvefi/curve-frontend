import type { FormDetailInfo } from '@/components/PageLoanManage/types'
import type { DetailProps, FormDetailInfoLeverage } from '@/components/PageLoanManage/LoanRepay/types'

import React from 'react'
import { t } from '@lingui/macro'

import useStore from '@/store/useStore'
import { _parseValues } from '@/components/PageLoanManage/LoanRepay/utils'

import DetailInfoEstimateGas from '@/components/DetailInfoEstimateGas'
import DetailInfoHealth from '@/components/DetailInfoHealth'
import DetailInfoLiqRange from '@/components/DetailInfoLiqRange'
import DetailInfoLeverageAdvancedExpected from '@/components/DetailInfoLeverageAdvancedExpected'
import DetailInfoLeverageAvgPrice from '@/components/DetailInfoLeverageAvgPrice'
import DetailInfoLeverageExpected from '@/components/DetailInfoLeverageExpected'
import DetailInfoPriceImpact from '@/components/DetailInfoPriceImpact'
import DetailInfoRate from '@/components/DetailInfoRate'
import DetailInfoSlippageTolerance from '@/components/DetailInfoSlippageTolerance'
import { useUserProfileStore } from '@ui-kit/features/user-profile'

const DetailInfo = ({
  rChainId,
  rOwmId,
  activeKey,
  activeStep,
  api,
  healthMode,
  isFullRepay,
  market,
  steps,
  userActiveKey,
  setHealthMode,
}: DetailProps & Pick<PageContentProps, 'market'>) => {
  const { borrowed_token, collateral_token } = market ?? {}
  const detailInfoNonLeverage = useStore((state) => state.loanRepay.detailInfo[activeKey])
  const detailInfoLeverage = useStore((state) => state.loanRepay.detailInfoLeverage[activeKey])
  const formEstGas = useStore((state) => state.loanRepay.formEstGas[activeKey])
  const formValues = useStore((state) => state.loanRepay.formValues)

  const {
    isAdvancedMode,
    maxSlippage: { global: maxSlippage },
  } = useUserProfileStore()

  const detailInfo = detailInfoNonLeverage ?? detailInfoLeverage

  const { signerAddress } = api ?? {}
  const { expectedBorrowed, repayIsFull, routeImage } = (detailInfo ?? {}) as FormDetailInfo & FormDetailInfoLeverage
  const { swapRequired, haveValues, haveFormErrors } = _parseValues(formValues)

  const loading =
    !!signerAddress && !haveFormErrors && haveValues && swapRequired && typeof expectedBorrowed === 'undefined'
  const expectedLoading = loading || detailInfoLeverage?.loading

  return (
    <>
      {isAdvancedMode ? (
        <>
          <DetailInfoLiqRange
            isManage
            rChainId={rChainId}
            rOwmId={rOwmId}
            {...detailInfo}
            isFullRepay={isFullRepay}
            loading={loading}
            detailInfoLeverage={
              swapRequired ? (
                <>
                  <DetailInfoLeverageAdvancedExpected
                    rChainId={rChainId}
                    loading={expectedLoading}
                    $minWidth="230px"
                    swapFrom={collateral_token}
                    swapFromAmounts={[
                      { value: formValues.stateCollateral, label: t`Collateral:` },
                      { value: formValues.userCollateral, label: t`Wallet:` },
                    ]}
                    swapTo={borrowed_token}
                    swapToAmounts={[
                      expectedBorrowed?.borrowedFromStateCollateral,
                      expectedBorrowed?.borrowedFromUserCollateral,
                    ]}
                    nonSwapAmount={{
                      value: expectedBorrowed?.userBorrowed,
                      label: '',
                    }}
                    total={expectedBorrowed?.totalBorrowed}
                    avgPrice={expectedBorrowed?.avgPrice}
                    routeImage={routeImage}
                    type="borrowed"
                  />
                  <DetailInfoLeverageAvgPrice loading={expectedLoading} avgPrice={expectedBorrowed?.avgPrice} />
                  <DetailInfoPriceImpact
                    loading={expectedLoading}
                    priceImpact={detailInfoLeverage?.priceImpact}
                    isHighImpact={detailInfoLeverage?.isHighPriceImpact}
                  />
                </>
              ) : null
            }
            healthMode={healthMode}
            userActiveKey={userActiveKey}
          />
        </>
      ) : (
        <DetailInfoLeverageExpected
          loading={expectedLoading}
          total={expectedBorrowed?.totalBorrowed}
          swapToSymbol={borrowed_token?.symbol}
        />
      )}

      {!isFullRepay && (
        <DetailInfoHealth
          isManage
          rChainId={rChainId}
          rOwmId={rOwmId}
          {...detailInfo}
          loading={loading}
          isPayoff={repayIsFull || formValues.isFullRepay}
          amount={swapRequired ? (expectedBorrowed?.totalBorrowed ?? '') : formValues.userBorrowed}
          formType=""
          healthMode={healthMode}
          userActiveKey={userActiveKey}
          setHealthMode={setHealthMode}
        />
      )}
      <DetailInfoRate isBorrow rChainId={rChainId} rOwmId={rOwmId} futureRates={detailInfo?.futureRates} />

      {signerAddress && (
        <>
          <DetailInfoEstimateGas
            isDivider
            chainId={rChainId}
            {...formEstGas}
            stepProgress={activeStep && steps.length > 1 ? { active: activeStep, total: steps.length } : null}
          />
          <DetailInfoSlippageTolerance maxSlippage={maxSlippage} />
        </>
      )}
    </>
  )
}

export default DetailInfo
