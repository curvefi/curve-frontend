import type { Step } from '@ui/Stepper/types'

import React from 'react'
import { t } from '@ui-kit/lib/i18n'

import { _parseValues } from '@/lend/components/PageLoanManage/LoanBorrowMore/utils'
import useStore from '@/lend/store/useStore'

import DetailInfoEstimateGas from '@/lend/components/DetailInfoEstimateGas'
import DetailInfoHealth from '@/lend/components/DetailInfoHealth'
import DetailInfoLeverageAdvancedExpected from '@/lend/components/DetailInfoLeverageAdvancedExpected'
import DetailInfoLeverageAvgPrice from '@/lend/components/DetailInfoLeverageAvgPrice'
import DetailInfoLeverageExpected from '@/lend/components/DetailInfoLeverageExpected'
import DetailInfoLiqRange from '@/lend/components/DetailInfoLiqRange'
import DetailInfoPriceImpact from '@/lend/components/DetailInfoPriceImpact'
import DetailInfoRate from '@/lend/components/DetailInfoRate'
import DetailInfoSlippageTolerance from '@/lend/components/DetailInfoSlippageTolerance'
import { useUserProfileStore } from '@ui-kit/features/user-profile'
import { PageContentProps, HealthMode } from '@/lend/types/lend.types'

const DetailInfoLeverage = ({
  rChainId,
  rOwmId,
  api,
  market,
  activeStep,
  healthMode,
  isLoaded,
  steps,
  userActiveKey,
  setHealthMode,
}: Pick<PageContentProps, 'rChainId' | 'rOwmId' | 'api' | 'market' | 'userActiveKey'> & {
  activeStep: number | null
  healthMode: HealthMode
  isLoaded: boolean
  steps: Step[]
  setHealthMode: React.Dispatch<React.SetStateAction<HealthMode>>
}) => {
  const activeKey = useStore((state) => state.loanBorrowMore.activeKey)
  const detailInfo = useStore((state) => state.loanBorrowMore.detailInfoLeverage[activeKey])
  const formEstGas = useStore((state) => state.loanBorrowMore.formEstGas[activeKey])
  const formValues = useStore((state) => state.loanBorrowMore.formValues)

  const isAdvancedMode = useUserProfileStore((state) => state.isAdvancedMode)
  const maxSlippage = useUserProfileStore((state) => state.maxSlippage.global)

  const { signerAddress } = api ?? {}
  const { expectedCollateral, routeImage } = detailInfo ?? {}
  const { collateral_token, borrowed_token } = market ?? {}
  const { haveDebt, haveFormErrors } = _parseValues(formValues)

  const loading =
    !!signerAddress && (!isLoaded || (!haveFormErrors && haveDebt && typeof expectedCollateral === 'undefined'))
  const expectedLoading = loading || detailInfo?.loading

  return (
    <>
      {isAdvancedMode ? (
        <DetailInfoLiqRange
          isManage
          rChainId={rChainId}
          rOwmId={rOwmId}
          {...detailInfo}
          loading={loading}
          detailInfoLeverage={
            <>
              <DetailInfoLeverageAdvancedExpected
                rChainId={rChainId}
                $minWidth="260px"
                loading={expectedLoading}
                swapFrom={borrowed_token}
                swapFromAmounts={[
                  { value: formValues.debt, label: t`Debt` },
                  { value: formValues.userBorrowed, label: t`Wallet` },
                ]}
                swapTo={collateral_token}
                swapToAmounts={[expectedCollateral?.collateralFromDebt, expectedCollateral?.collateralFromUserBorrowed]}
                nonSwapAmount={{
                  value: expectedCollateral?.userCollateral,
                  label: '',
                }}
                total={expectedCollateral?.totalCollateral}
                avgPrice={expectedCollateral?.avgPrice}
                type="collateral"
                routeImage={routeImage}
              />
              <DetailInfoLeverageAvgPrice loading={expectedLoading} avgPrice={expectedCollateral?.avgPrice} />
              <DetailInfoPriceImpact
                loading={expectedLoading}
                priceImpact={detailInfo?.priceImpact}
                isHighImpact={detailInfo?.isHighPriceImpact}
              />
            </>
          }
          healthMode={healthMode}
          userActiveKey={userActiveKey}
        />
      ) : (
        <DetailInfoLeverageExpected
          loading={expectedLoading}
          total={expectedCollateral?.totalCollateral}
          swapToSymbol={collateral_token?.symbol}
        />
      )}

      <DetailInfoHealth
        isManage
        rChainId={rChainId}
        rOwmId={rOwmId}
        {...detailInfo}
        loading={loading}
        amount={formValues.debt}
        formType=""
        healthMode={healthMode}
        userActiveKey={userActiveKey}
        setHealthMode={setHealthMode}
      />
      <DetailInfoRate isBorrow={true} rChainId={rChainId} rOwmId={rOwmId} futureRates={detailInfo?.futureRates} />

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

export default DetailInfoLeverage
