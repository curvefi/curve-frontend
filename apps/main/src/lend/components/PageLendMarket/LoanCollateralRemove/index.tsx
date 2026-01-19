import { ReactNode, useCallback, useEffect, useRef, useState } from 'react'
import { AlertFormError } from '@/lend/components/AlertFormError'
import { AlertLoanSummary as AlertSummary } from '@/lend/components/AlertLoanSummary'
import { DetailInfoEstimateGas } from '@/lend/components/DetailInfoEstimateGas'
import { DetailInfoHealth } from '@/lend/components/DetailInfoHealth'
import { DetailInfoLiqRange } from '@/lend/components/DetailInfoLiqRange'
import { DialogFormWarning } from '@/lend/components/DialogFormWarning'
import { InpTokenRemove } from '@/lend/components/InpTokenRemove'
import { LoanFormConnect } from '@/lend/components/LoanFormConnect'
import type { FormStatus, FormValues, StepKey } from '@/lend/components/PageLendMarket/LoanCollateralRemove/types'
import type { FormEstGas } from '@/lend/components/PageLendMarket/types'
import { DEFAULT_CONFIRM_WARNING } from '@/lend/components/PageLendMarket/utils'
import { StyledDetailInfoWrapper } from '@/lend/components/styles'
import { NOFITY_MESSAGE } from '@/lend/constants'
import { useUserLoanDetails } from '@/lend/hooks/useUserLoanDetails'
import { helpers } from '@/lend/lib/apiLending'
import { networks } from '@/lend/networks'
import { DEFAULT_FORM_VALUES } from '@/lend/store/createLoanCollateralRemoveSlice'
import { useStore } from '@/lend/store/useStore'
import { Api, OneWayMarketTemplate, PageContentProps } from '@/lend/types/lend.types'
import { DEFAULT_HEALTH_MODE } from '@/llamalend/constants'
import { RemoveCollateralForm } from '@/llamalend/features/manage-loan/components/RemoveCollateralForm'
import type { HealthMode } from '@/llamalend/llamalend.types'
import { AlertBox } from '@ui/AlertBox'
import { getActiveStep } from '@ui/Stepper/helpers'
import { Stepper } from '@ui/Stepper/Stepper'
import type { Step } from '@ui/Stepper/types'
import { TxInfoBar } from '@ui/TxInfoBar'
import { scanTxPath } from '@ui/utils'
import { notify } from '@ui-kit/features/connect-wallet'
import { useUserProfileStore } from '@ui-kit/features/user-profile'
import { t } from '@ui-kit/lib/i18n'

export const LoanCollateralRemove = ({ rChainId, rOwmId, isLoaded, api, market, userActiveKey }: PageContentProps) => {
  const isSubscribed = useRef(false)

  const activeKey = useStore((state) => state.loanCollateralRemove.activeKey)
  const detailInfo = useStore((state) => state.loanCollateralRemove.detailInfo[activeKey])
  const formEstGas = useStore((state) => state.loanCollateralRemove.formEstGas[activeKey])
  const formStatus = useStore((state) => state.loanCollateralRemove.formStatus)
  const formValues = useStore((state) => state.loanCollateralRemove.formValues)
  const maxRemovable = useStore((state) => state.loanCollateralRemove.maxRemovable)
  const userBalances = useStore((state) => state.user.marketsBalancesMapper[userActiveKey])
  const { state: userState } = useUserLoanDetails(userActiveKey)
  const fetchStepDecrease = useStore((state) => state.loanCollateralRemove.fetchStepDecrease)
  const setFormValues = useStore((state) => state.loanCollateralRemove.setFormValues)
  const resetState = useStore((state) => state.loanCollateralRemove.resetState)

  const isAdvancedMode = useUserProfileStore((state) => state.isAdvancedMode)

  const [{ confirmedWarning }, setConfirmWarning] = useState(DEFAULT_CONFIRM_WARNING)
  const [healthMode, setHealthMode] = useState(DEFAULT_HEALTH_MODE)
  const [steps, setSteps] = useState<Step[]>([])
  const [txInfoBar, setTxInfoBar] = useState<ReactNode>(null)

  const { signerAddress } = api ?? {}

  const network = networks[rChainId]

  const updateFormValues = useCallback(
    (updatedFormValues: Partial<FormValues>, isFullReset?: boolean) => {
      setConfirmWarning(DEFAULT_CONFIRM_WARNING)
      void setFormValues(isLoaded ? api : null, market, updatedFormValues)

      if (isFullReset) setHealthMode(DEFAULT_HEALTH_MODE)
    },
    [api, isLoaded, market, setFormValues],
  )

  const handleBtnClickRemove = useCallback(
    async (payloadActiveKey: string, api: Api, market: OneWayMarketTemplate, formValues: FormValues) => {
      const notification = notify(NOFITY_MESSAGE.pendingConfirm, 'pending')
      const resp = await fetchStepDecrease(payloadActiveKey, api, market, formValues)

      if (isSubscribed.current && resp && resp.hash && resp.activeKey === activeKey && !resp.error) {
        const txMessage = t`Transaction completed.`
        const txHash = scanTxPath(network, resp.hash)
        setTxInfoBar(
          <TxInfoBar
            description={txMessage}
            txHash={txHash}
            onClose={() => updateFormValues(DEFAULT_FORM_VALUES, true)}
          />,
        )
      }
      if (resp?.error) setTxInfoBar(null)
      notification?.dismiss()
    },
    [activeKey, fetchStepDecrease, network, updateFormValues],
  )

  const stepsObj = useCallback(
    (
      payloadActiveKey: string,
      api: Api,
      market: OneWayMarketTemplate,
      healthMode: HealthMode,
      confirmedHealthWarning: boolean,
      formEstGas: FormEstGas,
      formStatus: FormStatus,
      formValues: FormValues,
    ) => {
      const { signerAddress } = api
      const { collateral, collateralError } = formValues
      const { error, isComplete, step } = formStatus

      const isValid =
        !!signerAddress && !formEstGas?.loading && +collateral > 0 && !collateralError && !error && !!healthMode.percent

      if (+collateral > 0) {
        const notifyMessage = t`Removal of ${collateral} ${market.collateral_token.symbol}.`
        setTxInfoBar(
          <AlertBox alertType="info">
            <AlertSummary
              pendingMessage={notifyMessage}
              market={market}
              receive={`-${formValues.collateral}`}
              userState={userState}
              userWallet={userBalances}
              type="change"
            />
          </AlertBox>,
        )
      } else if (!isComplete) {
        setTxInfoBar(null)
      }

      const stepsObj: { [key: string]: Step } = {
        REMOVE: {
          key: 'REMOVE',
          status: helpers.getStepStatus(isComplete, step === 'REMOVE', isValid),
          type: 'action',
          content: isComplete ? t`Collateral Removed` : t`Remove Collateral`,
          ...(healthMode.message
            ? {
                modal: {
                  initFn: () => setConfirmWarning({ isConfirming: true, confirmedWarning: false }),
                  title: t`Warning!`,
                  content: (
                    <DialogFormWarning
                      health={healthMode}
                      confirmed={confirmedHealthWarning}
                      setConfirmed={(val) =>
                        setConfirmWarning({ isConfirming: false, confirmedWarning: val as boolean })
                      }
                    />
                  ),
                  isDismissable: false,
                  cancelBtnProps: {
                    label: t`Cancel`,
                    onClick: () => setConfirmWarning(DEFAULT_CONFIRM_WARNING),
                  },
                  primaryBtnProps: {
                    onClick: () => handleBtnClickRemove(payloadActiveKey, api, market, formValues),
                    disabled: !confirmedHealthWarning,
                  },
                  primaryBtnLabel: 'Remove anyway',
                },
              }
            : { onClick: async () => handleBtnClickRemove(payloadActiveKey, api, market, formValues) }),
        },
      }

      const stepsKey: StepKey[] = ['REMOVE']

      return stepsKey.map((k) => stepsObj[k])
    },
    [handleBtnClickRemove, userBalances, userState],
  )

  // onMount
  useEffect(() => {
    isSubscribed.current = true

    return () => {
      isSubscribed.current = false
    }
  }, [])

  // init
  useEffect(() => {
    if (isLoaded) {
      resetState()
      updateFormValues({})
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded])

  // steps
  useEffect(() => {
    if (isLoaded && market && api) {
      const updatedSteps = stepsObj(
        activeKey,
        api,
        market,
        healthMode,
        confirmedWarning,
        formEstGas,
        formStatus,
        formValues,
      )
      setSteps(updatedSteps)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isLoaded,
    activeKey,
    confirmedWarning,
    healthMode?.percent,
    formEstGas?.loading,
    formStatus,
    formValues,
    userBalances,
    userState,
  ])

  const activeStep = signerAddress ? getActiveStep(steps) : null
  const disabled = !!formStatus.step

  return (
    <>
      <InpTokenRemove
        network={networks[rChainId]}
        id="collateral"
        inpError={formValues.collateralError}
        inpDisabled={disabled}
        inpLabelLoading={!!signerAddress && typeof userBalances?.collateral === 'undefined'}
        inpValue={formValues.collateral}
        maxRemovable={maxRemovable}
        tokenAddress={market?.collateral_token?.address}
        tokenSymbol={market?.collateral_token?.symbol}
        tokenBalance={userBalances?.collateral}
        handleInpChange={useCallback((collateral) => updateFormValues({ collateral }), [updateFormValues])}
        handleMaxClick={() => updateFormValues({ collateral: maxRemovable ?? '' })}
      />

      {/* detail info */}
      <StyledDetailInfoWrapper>
        {isAdvancedMode && (
          <DetailInfoLiqRange
            isManage
            rChainId={rChainId}
            rOwmId={rOwmId}
            {...detailInfo}
            healthMode={healthMode}
            userActiveKey={userActiveKey}
          />
        )}
        <DetailInfoHealth
          isManage
          rChainId={rChainId}
          rOwmId={rOwmId}
          {...detailInfo}
          amount={formValues.collateral}
          healthMode={healthMode}
          formType="collateral-decrease"
          userActiveKey={userActiveKey}
          setHealthMode={setHealthMode}
        />
        <DetailInfoEstimateGas
          isDivider
          chainId={rChainId}
          {...formEstGas}
          stepProgress={activeStep && steps.length > 1 ? { active: activeStep, total: steps.length } : null}
        />
      </StyledDetailInfoWrapper>

      {/* actions */}
      <LoanFormConnect haveSigner={!!signerAddress} loading={!api}>
        {txInfoBar}
        {healthMode.message && <AlertBox alertType="warning">{healthMode.message}</AlertBox>}
        {(formStatus.error || formStatus.stepError) && (
          <AlertFormError
            limitHeight
            errorKey={formStatus.error || formStatus.stepError}
            handleBtnClose={() => updateFormValues({})}
          />
        )}
        {steps && <Stepper steps={steps} />}
      </LoanFormConnect>
    </>
  )
}

export const LoanRemoveCollateralTab = ({ rChainId, market, isLoaded }: PageContentProps) => (
  <RemoveCollateralForm networks={networks} chainId={rChainId} market={market} enabled={isLoaded} />
)
