import { useRouter } from 'next/navigation'
import { ReactNode, useCallback, useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import AlertFormError from '@/loan/components/AlertFormError'
import AlertFormWarning from '@/loan/components/AlertFormWarning'
import DetailInfoBorrowRate from '@/loan/components/DetailInfoBorrowRate'
import DetailInfoEstimateGas from '@/loan/components/DetailInfoEstimateGas'
import DetailInfoHealth from '@/loan/components/DetailInfoHealth'
import DetailInfoLiqRange from '@/loan/components/DetailInfoLiqRange'
import DetailInfoSlippageTolerance from '@/loan/components/DetailInfoSlippageTolerance'
import LoanFormConnect from '@/loan/components/LoanFormConnect'
import DetailInfoTradeRoutes from '@/loan/components/PageLoanCreate/LoanFormCreate/components/DetailInfoTradeRoutes'
import DialogHighPriceImpactWarning from '@/loan/components/PageLoanManage/LoanDeleverage/components/DialogHighPriceImpactWarning'
import LoanDeleverageAlertFull from '@/loan/components/PageLoanManage/LoanDeleverage/components/LoanDeleverageAlertFull'
import LoanDeleverageAlertPartial from '@/loan/components/PageLoanManage/LoanDeleverage/components/LoanDeleverageAlertPartial'
import type { FormDetailInfo, FormStatus, FormValues } from '@/loan/components/PageLoanManage/LoanDeleverage/types'
import { DEFAULT_FORM_VALUES } from '@/loan/components/PageLoanManage/LoanDeleverage/utils'
import { StyledDetailInfoWrapper, StyledInpChip } from '@/loan/components/PageLoanManage/styles'
import type { PageLoanManageProps } from '@/loan/components/PageLoanManage/types'
import {
  DEFAULT_DETAIL_INFO,
  DEFAULT_FORM_EST_GAS,
  DEFAULT_HEALTH_MODE,
  hasDeleverage,
} from '@/loan/components/PageLoanManage/utils'
import networks from '@/loan/networks'
import useStore from '@/loan/store/useStore'
import { Curve, Llamma } from '@/loan/types/loan.types'
import { curveProps } from '@/loan/utils/helpers'
import { getStepStatus, getTokenName } from '@/loan/utils/utilsLoan'
import { getCollateralListPathname } from '@/loan/utils/utilsRouter'
import AlertBox from '@ui/AlertBox'
import Box from '@ui/Box'
import DetailInfo from '@ui/DetailInfo'
import InputProvider, { InputDebounced, InputMaxBtn } from '@ui/InputComp'
import Stepper from '@ui/Stepper'
import { getActiveStep } from '@ui/Stepper/helpers'
import type { Step } from '@ui/Stepper/types'
import TxInfoBar from '@ui/TxInfoBar'
import { formatNumber } from '@ui/utils'
import { notify } from '@ui-kit/features/connect-wallet'
import { useUserProfileStore } from '@ui-kit/features/user-profile'
import usePageVisibleInterval from '@ui-kit/hooks/usePageVisibleInterval'
import { t } from '@ui-kit/lib/i18n'
import { REFRESH_INTERVAL } from '@ui-kit/lib/model'

// Loan Deleverage
const LoanDeleverage = ({
  curve,
  llamma,
  llammaId,
  params,
  rChainId,
}: Pick<PageLoanManageProps, 'curve' | 'llamma' | 'llammaId' | 'params' | 'rChainId'>) => {
  const isSubscribed = useRef(false)
  const { push } = useRouter()

  const activeKey = useStore((state) => state.loanDeleverage.activeKey)
  const detailInfo = useStore((state) => state.loanDeleverage.detailInfo[activeKey]) ?? DEFAULT_DETAIL_INFO
  const formEstGas = useStore((state) => state.loanDeleverage.formEstGas[activeKey]) ?? DEFAULT_FORM_EST_GAS
  const formStatus = useStore((state) => state.loanDeleverage.formStatus)
  const formValues = useStore((state) => state.loanDeleverage.formValues)
  const isPageVisible = useStore((state) => state.isPageVisible)
  const loanDetails = useStore((state) => state.loans.detailsMapper[llammaId])
  const userLoanDetails = useStore((state) => state.loans.userDetailsMapper[llammaId])
  const userWalletBalancesLoading = useStore((state) => state.loans.userWalletBalancesLoading)
  const fetchStepRepay = useStore((state) => state.loanDeleverage.fetchStepRepay)
  const setFormValues = useStore((state) => state.loanDeleverage.setFormValues)

  const isAdvancedMode = useUserProfileStore((state) => state.isAdvancedMode)
  const maxSlippage = useUserProfileStore((state) => state.maxSlippage.crypto)

  const [confirmHighPriceImpact, setConfirmHighPriceImpact] = useState(false)
  const [healthMode, setHealthMode] = useState(DEFAULT_HEALTH_MODE)
  const [steps, setSteps] = useState<Step[]>([])
  const [txInfoBar, setTxInfoBar] = useState<ReactNode>(null)

  const { chainId, haveSigner } = curveProps(curve)
  const { userState } = userLoanDetails || {}
  const { collateral: collateralName } = getTokenName(llamma)

  const updateFormValues = useCallback(
    (updatedFormValues: Partial<FormValues>, updatedMaxSlippage: string | null, isFullReset: boolean) => {
      setTxInfoBar(null)
      setConfirmHighPriceImpact(false)

      if (isFullReset) {
        setHealthMode(DEFAULT_HEALTH_MODE)
      }

      setFormValues(
        llammaId,
        curve,
        llamma,
        isFullReset ? DEFAULT_FORM_VALUES : updatedFormValues,
        updatedMaxSlippage || maxSlippage,
        isFullReset,
      )
    },
    [curve, llamma, llammaId, maxSlippage, setFormValues],
  )

  const handleBtnClickRepay = useCallback(
    async (payloadActiveKey: string, curve: Curve, llamma: Llamma, formValues: FormValues, maxSlippage: string) => {
      const { collateral } = formValues
      const fTokenName = `${collateral} ${collateralName}`
      const notifyMessage = t`Please approve deleverage with ${fTokenName} at ${maxSlippage}% max slippage.`

      const { dismiss } = notify(notifyMessage, 'pending')
      const resp = await fetchStepRepay(payloadActiveKey, curve, llamma, formValues, maxSlippage)

      if (isSubscribed.current && resp && resp.hash && resp.activeKey === activeKey) {
        const txInfoBarMessage = resp.loanExists
          ? t`Transaction complete`
          : t`Transaction complete. This loan is paid-off and will no longer be manageable.`

        setTxInfoBar(
          <TxInfoBar
            description={txInfoBarMessage}
            txHash={networks[rChainId].scanTxPath(resp.hash)}
            onClose={() => {
              if (resp.loanExists) {
                updateFormValues({}, '', true)
              } else {
                push(getCollateralListPathname(params))
              }
            }}
          />,
        )
      }
      if (typeof dismiss === 'function') dismiss()
    },
    [activeKey, collateralName, fetchStepRepay, push, params, rChainId, updateFormValues],
  )

  const getSteps = useCallback(
    (
      payloadActiveKey: string,
      curve: Curve,
      llamma: Llamma,
      formStatus: FormStatus,
      formValues: FormValues,
      detailInfo: FormDetailInfo,
    ) => {
      const { isComplete, step } = formStatus
      const isValidForm =
        +formValues.collateral > 0 && !formValues.collateralError && +userState.collateral >= +formValues.collateral
      const isValid = !!curve.signerAddress && isValidForm && !formStatus.error && !detailInfo.loading

      const stepsObj: { [key: string]: Step } = {
        REPAY: {
          key: 'REPAY',
          status: getStepStatus(isComplete, step === 'REPAY', isValid),
          type: 'action',
          content: isComplete ? t`Repaid` : t`Repay`,
          ...(detailInfo.isHighImpact
            ? {
                modal: {
                  title: t`Warning!`,
                  content: (
                    <DialogHighPriceImpactWarning
                      priceImpact={detailInfo?.priceImpact}
                      confirmed={confirmHighPriceImpact}
                      setConfirmed={(val) => setConfirmHighPriceImpact(val)}
                    />
                  ),
                  isDismissable: false,
                  cancelBtnProps: {
                    label: t`Cancel`,
                    onClick: () => setConfirmHighPriceImpact(false),
                  },
                  primaryBtnProps: {
                    onClick: () => handleBtnClickRepay(payloadActiveKey, curve, llamma, formValues, maxSlippage),
                    disabled: !confirmHighPriceImpact,
                  },
                  primaryBtnLabel: t`Repay anyway`,
                },
              }
            : { onClick: () => handleBtnClickRepay(payloadActiveKey, curve, llamma, formValues, maxSlippage) }),
        },
      }

      return ['REPAY'].map((k) => stepsObj[k])
    },
    [userState?.collateral, confirmHighPriceImpact, maxSlippage, handleBtnClickRepay],
  )

  // onMount
  useEffect(() => {
    isSubscribed.current = true
    updateFormValues(DEFAULT_FORM_VALUES, '', true)

    return () => {
      isSubscribed.current = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // signer changed
  useEffect(() => {
    updateFormValues(DEFAULT_FORM_VALUES, '', true)

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [curve?.signerAddress])

  // update formValues
  useEffect(() => {
    if (chainId && llamma) {
      updateFormValues({}, '', false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chainId, llamma, userState?.collateral, userLoanDetails?.userIsCloseToLiquidation])

  // maxSlippage
  useEffect(() => {
    if (maxSlippage) {
      updateFormValues({}, maxSlippage, false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maxSlippage])

  //  pageVisible
  useEffect(() => {
    if (!formStatus.isInProgress) {
      updateFormValues({}, '', false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPageVisible])

  // interval
  usePageVisibleInterval(
    () => {
      if (!formStatus.isInProgress) {
        updateFormValues({}, '', false)
      }
    },
    REFRESH_INTERVAL['1m'],
    isPageVisible,
  )

  // steps
  useEffect(() => {
    if (curve && llamma && userState) {
      const updatedSteps = getSteps(activeKey, curve, llamma, formStatus, formValues, detailInfo)
      setSteps(updatedSteps)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    detailInfo.loading,
    detailInfo.isHighImpact,
    confirmHighPriceImpact,
    llamma?.id,
    curve?.chainId,
    formEstGas.loading,
    formStatus,
    formValues,
    userState,
  ])

  const activeStep = haveSigner ? getActiveStep(steps) : null
  const disable = formStatus.isInProgress
  const isReady = !!curve && !!llamma
  const isValid = !formValues.collateralError

  const LeveragePriceImpactDetail = () => (
    <DetailInfo
      isBold={isValid && detailInfo.isHighImpact}
      variant={isValid && detailInfo.isHighImpact ? 'error' : undefined}
      label={isValid && detailInfo.isHighImpact ? t`High price impact:` : t`Price impact:`}
      loading={!isReady || detailInfo.loading}
      loadingSkeleton={[70, 20]}
    >
      {isValid && detailInfo.priceImpact ? <strong>{detailInfo.priceImpact}%</strong> : '-'}
    </DetailInfo>
  )

  return (
    <Box grid gridRowGap={3}>
      {/* collateral field */}
      <Box grid gridRowGap={1}>
        <InputProvider
          grid
          gridTemplateColumns="1fr auto"
          padding="4px 8px"
          inputVariant={formValues.collateralError ? 'error' : undefined}
          disabled={disable}
          id="collateral"
        >
          <InputDebounced
            id="inpCollateral"
            type="number"
            labelProps={{
              label: t`LLAMMA ${collateralName} Avail.`,
              descriptionLoading: userWalletBalancesLoading,
              description: formatNumber(userState?.collateral, { defaultValue: '-' }),
            }}
            value={formValues.collateral}
            onChange={(collateral) => updateFormValues({ collateral }, '', false)}
          />
          <InputMaxBtn onClick={() => updateFormValues({ collateral: userState.collateral }, '', false)} />
        </InputProvider>
        {formValues.collateralError === 'too-much' ? (
          <StyledInpChip size="xs" isDarkBg isError>
            {t`Amount must be <= ${formatNumber(userState.collateral)}`}
          </StyledInpChip>
        ) : (
          <StyledInpChip size="xs">
            {t`Debt`} {userState?.debt ? `${formatNumber(userState.debt)}` : '-'}
          </StyledInpChip>
        )}
      </Box>

      {/* detail info */}
      <StyledDetailInfoWrapper>
        {isAdvancedMode ? (
          <DetailInfoLiqRange
            isManage
            {...detailInfo}
            detailInfoLeverage={
              <DetailInfoLeverageWrapper>
                <LeveragePriceImpactDetail />
                <DetailInfoTradeRoutes
                  isValidFormValues={isValid}
                  loading={detailInfo.loading}
                  routes={detailInfo.routeName}
                  input={formValues.collateral}
                  inputSymbol={llamma?.collateralSymbol ?? ''}
                  output={detailInfo.receiveStablecoin}
                  outputSymbol={getTokenName(llamma).stablecoin}
                />
              </DetailInfoLeverageWrapper>
            }
            healthMode={healthMode}
            loanDetails={loanDetails}
            userLoanDetails={userLoanDetails}
          />
        ) : (
          <>
            <LeveragePriceImpactDetail />
            <DetailInfo
              label={`Receive ${getTokenName(llamma).stablecoin}:`}
              loading={detailInfo.loading}
              loadingSkeleton={[100, 20]}
            >
              <strong>{formatNumber(detailInfo.receiveStablecoin)}</strong>
            </DetailInfo>
          </>
        )}

        <DetailInfoHealth
          isManage
          isPayoff={formValues.isFullRepay}
          {...detailInfo}
          amount={formValues.collateral}
          formType=""
          healthMode={healthMode}
          loanDetails={loanDetails}
          userLoanDetails={userLoanDetails}
          setHealthMode={setHealthMode}
        />
        <DetailInfoBorrowRate parameters={loanDetails?.parameters} />
        <DetailInfoEstimateGas
          isDivider
          chainId={rChainId}
          {...formEstGas}
          stepProgress={activeStep && steps.length > 1 ? { active: activeStep, total: steps.length } : null}
        />
        <DetailInfoSlippageTolerance maxSlippage={maxSlippage} />
      </StyledDetailInfoWrapper>

      {/* actions */}
      {llamma && !hasDeleverage(llamma) ? (
        <AlertBox alertType="info">Deleverage is not available</AlertBox>
      ) : (
        <LoanFormConnect haveSigner={haveSigner} loading={!curve}>
          {!txInfoBar && (
            <>
              {formStatus.error ? (
                <AlertFormError errorKey={formStatus.error} handleBtnClose={() => updateFormValues({}, '', true)} />
              ) : formStatus.warning ? (
                <AlertFormWarning errorKey={formStatus.warning} />
              ) : !!llamma &&
                userState &&
                !detailInfo.loading &&
                !formValues.collateralError &&
                +formValues.collateral > 0 &&
                +detailInfo.receiveStablecoin > 0 ? (
                <AlertBox alertType="info">
                  {formValues.isFullRepay ? (
                    <LoanDeleverageAlertFull
                      receivedStablecoin={detailInfo.receiveStablecoin}
                      formValues={formValues}
                      llamma={llamma}
                      userState={userState}
                    />
                  ) : formStatus.warning !== 'warning-full-repayment-only' ? (
                    <LoanDeleverageAlertPartial
                      receivedStablecoin={detailInfo.receiveStablecoin}
                      formValues={formValues}
                      llamma={llamma}
                      userState={userState}
                    />
                  ) : null}
                </AlertBox>
              ) : null}
            </>
          )}
          {txInfoBar}
          {steps && <Stepper steps={steps} />}
        </LoanFormConnect>
      )}
    </Box>
  )
}

const DetailInfoLeverageWrapper = styled.div`
  border: 1px solid var(--border-400);
  padding: 0.5rem 0.75rem;
  margin-bottom: 1rem;
`

export default LoanDeleverage
