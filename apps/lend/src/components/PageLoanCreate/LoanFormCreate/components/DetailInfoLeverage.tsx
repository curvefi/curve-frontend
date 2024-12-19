import type { DetailInfoCompProps, DetailInfoCompAdditionalProps } from '@/components/PageLoanCreate/types'

import React from 'react'
import { t } from '@lingui/macro'

import { _parseValue } from '@/components/PageLoanCreate/utils'
import useStore from '@/store/useStore'

import DetailInfoEstGas from '@/components/DetailInfoEstimateGas'
import DetailInfoHealth from '@/components/DetailInfoHealth'
import DetailInfoLiqRange from '@/components/DetailInfoLiqRange'
import DetailInfoLiqRangeEdit from '@/components/DetailInfoLiqRangeEdit'
import DetailInfoN from '@/components/DetailInfoN'
import DetailInfoSlippageTolerance from '@/components/DetailInfoSlippageTolerance'
import DetailInfoRate from '@/components/DetailInfoRate'
import DetailInfoLeverageX from '@/components/DetailInfoLeverageX'
import DetailInfoLeverageExpected from 'components/DetailInfoLeverageExpected'
import DetailInfoLeverageAdvancedExpected from 'components/DetailInfoLeverageAdvancedExpected'
import DetailInfoLeverageAvgPrice from '@/components/DetailInfoLeverageAvgPrice'
import DetailInfoLTV from '@/components/DetailInfoLTV'
import DetailInfoPriceImpact from '@/components/DetailInfoPriceImpact'

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
  const isAdvanceMode = useStore((state) => state.isAdvanceMode)
  const maxSlippage = useStore((state) => state.maxSlippage)

  const { signerAddress } = api ?? {}
  const { minBands, maxBands, borrowed_token, collateral_token } = market ?? {}
  const { expectedCollateral, routes } = detailInfo ?? {}
  const { userBorrowed, debt } = formValues
  const { symbol: collateralSymbol = '' } = collateral_token ?? {}
  const { haveValues, haveDebt } = _parseValue(formValues)

  const loading = haveValues && haveDebt && typeof expectedCollateral === 'undefined'
  const expectedLoading = loading || detailInfo?.loading

  return (
    <div>
      {isAdvanceMode ? (
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
                  routes={routes}
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
      {isAdvanceMode && (
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
