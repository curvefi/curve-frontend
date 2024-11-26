import type { DetailInfoCompProps, DetailInfoCompAdditionalProps } from '@/components/PageLoanCreate/types'

import React from 'react'

import useStore from '@/store/useStore'

import DetailInfoRate from '@/components/DetailInfoRate'
import DetailInfoEstGas from '@/components/DetailInfoEstimateGas'
import DetailInfoHealth from '@/components/DetailInfoHealth'
import DetailInfoLiqRange from '@/components/DetailInfoLiqRange'
import DetailInfoLiqRangeEdit from '@/components/DetailInfoLiqRangeEdit'
import DetailInfoLTV from '@/components/DetailInfoLTV'
import DetailInfoN from '@/components/DetailInfoN'

const DetailInfoNonLeverage = ({
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
  const detailInfo = useStore((state) => state.loanCreate.detailInfo[activeKey])
  const formEstGas = useStore((state) => state.loanCreate.formEstGas[activeKey])
  const formValues = useStore((state) => state.loanCreate.formValues)
  const isAdvanceMode = useStore((state) => state.isAdvanceMode)
  const isEditLiqRange = useStore((state) => state.loanCreate.isEditLiqRange)
  const liqRanges = useStore((state) => state.loanCreate.liqRanges[activeKeyLiqRange])

  const { signerAddress } = api ?? {}
  const { borrowed_token, collateral_token } = market ?? {}

  const loading = !isLoaded || typeof detailInfo === 'undefined'

  return (
    <div>
      {isAdvanceMode && (
        <>
          <DetailInfoLiqRange
            {...detailInfo}
            rChainId={rChainId}
            rOwmId={rOwmId}
            healthMode={signerAddress ? healthMode : null}
            isEditLiqRange={isEditLiqRange}
            selectedLiqRange={selectedLiqRange}
            userActiveKey={userActiveKey}
            handleLiqRangesEdit={handleLiqRangesEdit}
          />
          <DetailInfoN isLoaded={isLoaded} n={formValues.n} />
          <DetailInfoLiqRangeEdit
            {...detailInfo}
            liqRanges={liqRanges}
            maxBands={market?.maxBands}
            minBands={market?.minBands}
            selectedLiqRange={selectedLiqRange}
            showEditLiqRange={isEditLiqRange}
            handleSelLiqRange={handleSelLiqRange}
          />
        </>
      )}
      <DetailInfoHealth
        {...detailInfo}
        rChainId={rChainId}
        rOwmId={rOwmId}
        isManage={false}
        amount={formValues.debt}
        formType="create-loan"
        healthMode={healthMode}
        setHealthMode={setHealthMode}
        userActiveKey={userActiveKey}
      />
      <DetailInfoRate isBorrow={true} rChainId={rChainId} rOwmId={rOwmId} futureRates={detailInfo?.futureRates} />
      {isAdvanceMode && (
        <DetailInfoLTV
          loading={loading}
          debt={borrowed_token ? { amount: formValues.debt, address: borrowed_token.address } : undefined}
          collaterals={
            collateral_token ? [{ amount: formValues.userCollateral, address: collateral_token.address }] : undefined
          }
        />
      )}
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
