import { DetailInfoEstimateGas } from '@/lend/components/DetailInfoEstimateGas'
import { DetailInfoHealth } from '@/lend/components/DetailInfoHealth'
import { DetailInfoLeverageAvgPrice } from '@/lend/components/DetailInfoLeverageAvgPrice'
import { DetailInfoLeverageExpected } from '@/lend/components/DetailInfoLeverageExpected'
import { DetailInfoLiqRange } from '@/lend/components/DetailInfoLiqRange'
import { DetailInfoPriceImpact } from '@/lend/components/DetailInfoPriceImpact'
import { DetailInfoRate } from '@/lend/components/DetailInfoRate'
import type { DetailProps, FormDetailInfoLeverage } from '@/lend/components/PageLendMarket/LoanRepay/types'
import { _parseValues } from '@/lend/components/PageLendMarket/LoanRepay/utils'
import type { FormDetailInfo } from '@/lend/components/PageLendMarket/types'
import { networks } from '@/lend/networks'
import { useStore } from '@/lend/store/useStore'
import { PageContentProps } from '@/lend/types/lend.types'
import { RouteDetails } from '@/llamalend/widgets/RouteDetails'
import { useUserProfileStore } from '@ui-kit/features/user-profile'
import { t } from '@ui-kit/lib/i18n'
import { SlippageToleranceActionInfo } from '@ui-kit/widgets/SlippageSettings'

export const DetailInfo = ({
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

  const isAdvancedMode = useUserProfileStore((state) => state.isAdvancedMode)
  const maxSlippage = useUserProfileStore((state) => state.maxSlippage.crypto)

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
                  <RouteDetails
                    network={networks[rChainId].id}
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
          <SlippageToleranceActionInfo maxSlippage={maxSlippage} />
        </>
      )}
    </>
  )
}
