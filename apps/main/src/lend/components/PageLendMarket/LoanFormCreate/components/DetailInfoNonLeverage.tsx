import { DetailInfoEstimateGas as DetailInfoEstGas } from '@/lend/components/DetailInfoEstimateGas'
import { DetailInfoHealth } from '@/lend/components/DetailInfoHealth'
import { DetailInfoLiqRange } from '@/lend/components/DetailInfoLiqRange'
import { DetailInfoLTV } from '@/lend/components/DetailInfoLTV'
import { DetailInfoN } from '@/lend/components/DetailInfoN'
import { DetailInfoRate } from '@/lend/components/DetailInfoRate'
import type { DetailInfoCompProps, DetailInfoCompAdditionalProps } from '@/lend/components/PageLendMarket/types'
import { useStore } from '@/lend/store/useStore'
import { PageContentProps } from '@/lend/types/lend.types'
import { useUserProfileStore } from '@ui-kit/features/user-profile'
import { LiquidationRangeSlider } from '@ui-kit/shared/ui/LiquidationRangeSlider'

export const DetailInfoNonLeverage = ({
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
  const isEditLiqRange = useStore((state) => state.loanCreate.isEditLiqRange)
  const liqRanges = useStore((state) => state.loanCreate.liqRanges[activeKeyLiqRange])

  const isAdvancedMode = useUserProfileStore((state) => state.isAdvancedMode)

  const { signerAddress } = api ?? {}
  const { borrowed_token, collateral_token } = market ?? {}

  const loading = !isLoaded || typeof detailInfo === 'undefined'

  return (
    <div>
      {isAdvancedMode && (
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
          <LiquidationRangeSlider
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
      {isAdvancedMode && (
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
