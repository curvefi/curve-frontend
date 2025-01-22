import type { DetailInfoCompProps, DetailInfoCompAdditionalProps } from '@lend/components/PageLoanCreate/types'

import React from 'react'
import { t } from '@lingui/macro'

import { _parseValue } from '@lend/components/PageLoanCreate/utils'
import useStore from '@lend/store/useStore'

import DetailInfoEstGas from '@lend/components/DetailInfoEstimateGas'
import DetailInfoHealth from '@lend/components/DetailInfoHealth'
import DetailInfoLiqRange from '@lend/components/DetailInfoLiqRange'
import DetailInfoLiqRangeEdit from '@lend/components/DetailInfoLiqRangeEdit'
import DetailInfoN from '@lend/components/DetailInfoN'
import DetailInfoSlippageTolerance from '@lend/components/DetailInfoSlippageTolerance'
import DetailInfoRate from '@lend/components/DetailInfoRate'
import DetailInfoLeverageX from '@lend/components/DetailInfoLeverageX'
import DetailInfoLeverageExpected from '@/lend/components/DetailInfoLeverageExpected'
import DetailInfoLeverageAdvancedExpected from '@/lend/components/DetailInfoLeverageAdvancedExpected'
import DetailInfoLeverageAvgPrice from '@lend/components/DetailInfoLeverageAvgPrice'
import DetailInfoLTV from '@lend/components/DetailInfoLTV'
import DetailInfoPriceImpact from '@lend/components/DetailInfoPriceImpact'
import { useUserProfileStore } from '@ui-kit/features/user-profile'
import { PageContentProps } from '@lend/types/lend.types'

const DetailInfoLeverage = ({
  activeStep,
  rChainId,
  rOwmId,
  api,
  healthMode,
  isLoaded,
  market,
  steps,
  userActiveKey,
  handleSelLiqRange,
  selectedLiqRange,
  setHealthMode,
  handleLiqRangesEdit,
}: PageContentProps & DetailInfoCompProps & DetailInfoCompAdditionalProps) => {
  const activeKey = useStore((state) => state.loanCreate.activeKey)
  const activeKeyLiqRange = useStore((state) => state.loanCreate.activeKeyLiqRange)
  const detailInfo = useStore((state) => state.loanCreate.detailInfoLeverage[activeKey])
  const formEstGas = useStore((state) => state.loanCreate.formEstGas[activeKey])
  const formValues = useStore((state) => state.loanCreate.formValues)
  const maxLeverage = useStore((state) => state.loanCreate.maxLeverage[formValues.n || ''])
  const isEditLiqRange = useStore((state) => state.loanCreate.isEditLiqRange)
  const liqRanges = useStore((state) => state.loanCreate.liqRanges[activeKeyLiqRange])

  const isAdvancedMode = useUserProfileStore((state) => state.isAdvancedMode)
  const maxSlippage = useUserProfileStore((state) => state.maxSlippage.global)

  const { signerAddress } = api ?? {}
  const { minBands, maxBands, borrowed_token, collateral_token } = market ?? {}
  const { expectedCollateral, routeImage } = detailInfo ?? {}
  const { userBorrowed, debt } = formValues
  const { symbol: collateralSymbol = '' } = collateral_token ?? {}
  const { haveValues, haveDebt } = _parseValue(formValues)

  const loading = haveValues && haveDebt && typeof expectedCollateral === 'undefined'
  const expectedLoading = loading || detailInfo?.loading

  return (
    <div>
      {isAdvancedMode ? (
        <>
          <DetailInfoLiqRange
            {...detailInfo}
            detailInfoLeverage={
              <>
                <DetailInfoLeverageX
                  loading={loading}
                  leverage={expectedCollateral?.leverage}
                  maxLeverage={maxLeverage}
                />
                <DetailInfoLeverageAdvancedExpected
                  rChainId={rChainId}
                  loading={expectedLoading}
                  swapFrom={borrowed_token}
                  swapFromAmounts={[
                    { value: debt, label: t`Debt:` },
                    { value: userBorrowed, label: t`Wallet:` },
                  ]}
                  $minWidth="250px"
                  swapTo={collateral_token}
                  swapToAmounts={[
                    expectedCollateral?.collateralFromDebt,
                    expectedCollateral?.collateralFromUserBorrowed,
                  ]}
                  nonSwapAmount={{ value: expectedCollateral?.userCollateral, label: '' }}
                  total={expectedCollateral?.totalCollateral}
                  avgPrice={expectedCollateral?.avgPrice}
                  routeImage={routeImage}
                  type="collateral"
                />
                <DetailInfoLeverageAvgPrice loading={expectedLoading} avgPrice={expectedCollateral?.avgPrice} />
                <DetailInfoPriceImpact
                  loading={expectedLoading}
                  priceImpact={detailInfo?.priceImpact}
                  isHighImpact={detailInfo?.isHighPriceImpact}
                />
                <DetailInfoHealth
                  {...detailInfo}
                  rChainId={rChainId}
                  rOwmId={rOwmId}
                  isManage={false}
                  loading={loading}
                  amount={formValues.debt}
                  formType="create-loan"
                  healthMode={healthMode}
                  isValidFormValues={haveValues && haveDebt}
                  setHealthMode={setHealthMode}
                  userActiveKey={userActiveKey}
                />
              </>
            }
            rChainId={rChainId}
            rOwmId={rOwmId}
            healthMode={signerAddress ? healthMode : null}
            isEditLiqRange={isEditLiqRange}
            isValidFormValues={haveValues && haveDebt}
            loading={loading}
            selectedLiqRange={selectedLiqRange}
            userActiveKey={userActiveKey}
            handleLiqRangesEdit={handleLiqRangesEdit}
          />
          <DetailInfoN isLoaded={isLoaded} n={formValues.n} />
          <DetailInfoLiqRangeEdit
            {...detailInfo}
            liqRanges={liqRanges}
            maxBands={maxBands}
            minBands={minBands}
            selectedLiqRange={selectedLiqRange}
            showEditLiqRange={isEditLiqRange}
            handleSelLiqRange={handleSelLiqRange}
          />
        </>
      ) : (
        <>
          <DetailInfoLeverageX
            loading={!isLoaded || formValues.n === null}
            leverage={expectedCollateral?.leverage}
            maxLeverage={maxLeverage}
          />
          <DetailInfoLeverageExpected
            loading={expectedLoading}
            total={expectedCollateral?.totalCollateral}
            swapToSymbol={collateralSymbol}
          />
          <DetailInfoPriceImpact
            loading={expectedLoading}
            priceImpact={detailInfo?.priceImpact}
            isHighImpact={detailInfo?.isHighPriceImpact}
          />
          <DetailInfoHealth
            {...detailInfo}
            rChainId={rChainId}
            rOwmId={rOwmId}
            isManage={false}
            loading={loading}
            amount={formValues.debt}
            formType="create-loan"
            healthMode={healthMode}
            isValidFormValues={haveValues && haveDebt}
            setHealthMode={setHealthMode}
            userActiveKey={userActiveKey}
          />
        </>
      )}

      <DetailInfoRate isBorrow rChainId={rChainId} rOwmId={rOwmId} futureRates={detailInfo?.futureRates} />
      {isAdvancedMode && (
        <DetailInfoLTV
          loading={!isLoaded}
          debt={borrowed_token?.address ? { amount: formValues.debt, address: borrowed_token.address } : undefined}
          collaterals={
            collateral_token?.address && borrowed_token?.address
              ? [
                  { amount: formValues.userCollateral, address: collateral_token.address },
                  { amount: formValues.userBorrowed, address: borrowed_token.address },
                ]
              : []
          }
        />
      )}

      {signerAddress && (
        <DetailInfoEstGas
          chainId={rChainId}
          isDivider
          {...formEstGas}
          loading={formEstGas?.loading || loading}
          stepProgress={activeStep && steps.length > 1 ? { active: activeStep, total: steps.length } : null}
        />
      )}
      <DetailInfoSlippageTolerance maxSlippage={maxSlippage} />
    </div>
  )
}

export default DetailInfoLeverage
