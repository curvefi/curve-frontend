import type { FormStatus, FormValues, StepKey } from '@/components/PageLoanManage/LoanCollateralRemove/types'
import type { FormEstGas } from '@/components/PageLoanManage/types'
import type { Step } from '@/ui/Stepper/types'

import { t } from '@lingui/macro'
import React, { useCallback, useEffect, useRef, useState } from 'react'

import { DEFAULT_CONFIRM_WARNING, DEFAULT_HEALTH_MODE } from '@/components/PageLoanManage/utils'
import { DEFAULT_FORM_VALUES } from '@/store/createLoanCollateralRemoveSlice'
import { NOFITY_MESSAGE } from '@/constants'
import { _showNoLoanFound } from '@/utils/helpers'
import { getActiveStep } from '@/ui/Stepper/helpers'
import { formatNumber } from '@/ui/utils'
import { helpers } from '@/lib/apiLending'
import networks from '@/networks'
import useStore from '@/store/useStore'

import { StyledDetailInfoWrapper } from '@/components/PageLoanManage/styles'
import AlertBox from '@/ui/AlertBox'
import AlertFormError from '@/components/AlertFormError'
import AlertNoLoanFound from '@/components/AlertNoLoanFound'
import AlertSummary from '@/components/AlertLoanSummary'
import DetailInfoEstimateGas from '@/components/DetailInfoEstimateGas'
import DetailInfoHealth from '@/components/DetailInfoHealth'
import DetailInfoLiqRange from '@/components/DetailInfoLiqRange'
import DialogFormWarning from '@/components/DialogFormWarning'
import InpTokenRemove from '@/components/InpTokenRemove'
import LoanFormConnect from '@/components/LoanFormConnect'
import Stepper from '@/ui/Stepper'
import TxInfoBar from '@/ui/TxInfoBar'
import { OneWayMarketTemplate } from '@curvefi/lending-api/lib/markets'
import { useUserProfileStore } from '@ui-kit/features/user-profile'
import { Api, PageContentProps, HealthMode } from '@/types/lend.types'

const LoanCollateralRemove = ({ rChainId, rOwmId, isLoaded, api, market, userActiveKey }: PageContentProps) => {
  const isSubscribed = useRef(false)

  const activeKey = useStore((state) => state.loanCollateralRemove.activeKey)
  const detailInfo = useStore((state) => state.loanCollateralRemove.detailInfo[activeKey])
  const formEstGas = useStore((state) => state.loanCollateralRemove.formEstGas[activeKey])
  const formStatus = useStore((state) => state.loanCollateralRemove.formStatus)
  const formValues = useStore((state) => state.loanCollateralRemove.formValues)
  const maxRemovable = useStore((state) => state.loanCollateralRemove.maxRemovable)
  const loanExists = useStore((state) => state.user.loansExistsMapper[userActiveKey]?.loanExists)
  const userBalances = useStore((state) => state.user.marketsBalancesMapper[userActiveKey])
  const userDetails = useStore((state) => state.user.loansDetailsMapper[userActiveKey]?.details)
  const fetchStepDecrease = useStore((state) => state.loanCollateralRemove.fetchStepDecrease)
  const notifyNotification = useStore((state) => state.wallet.notifyNotification)
  const setFormValues = useStore((state) => state.loanCollateralRemove.setFormValues)
  const resetState = useStore((state) => state.loanCollateralRemove.resetState)

  const isAdvancedMode = useUserProfileStore((state) => state.isAdvancedMode)

  const [{ confirmedWarning }, setConfirmWarning] = useState(DEFAULT_CONFIRM_WARNING)
  const [healthMode, setHealthMode] = useState(DEFAULT_HEALTH_MODE)
  const [steps, setSteps] = useState<Step[]>([])
  const [txInfoBar, setTxInfoBar] = useState<React.ReactNode | null>(null)

  const { signerAddress } = api ?? {}

  const network = networks[rChainId]

  const updateFormValues = useCallback(
    (updatedFormValues: Partial<FormValues>, isFullReset?: boolean) => {
      setConfirmWarning(DEFAULT_CONFIRM_WARNING)
      setFormValues(isLoaded ? api : null, market, updatedFormValues)

      if (isFullReset) setHealthMode(DEFAULT_HEALTH_MODE)
    },
    [api, isLoaded, market, setFormValues],
  )

  const handleBtnClickRemove = useCallback(
    async (payloadActiveKey: string, api: Api, market: OneWayMarketTemplate, formValues: FormValues) => {
      const notify = notifyNotification(NOFITY_MESSAGE.pendingConfirm, 'pending')
      const resp = await fetchStepDecrease(payloadActiveKey, api, market, formValues)

      if (isSubscribed.current && resp && resp.hash && resp.activeKey === activeKey && !resp.error) {
        const txMessage = t`Transaction completed.`
        const txHash = network.scanTxPath(resp.hash)
        setTxInfoBar(
          <TxInfoBar
            description={txMessage}
            txHash={txHash}
            onClose={() => updateFormValues(DEFAULT_FORM_VALUES, true)}
          />,
        )
      }
      if (resp?.error) setTxInfoBar(null)
      if (notify && typeof notify.dismiss === 'function') notify.dismiss()
    },
    [activeKey, fetchStepDecrease, network, notifyNotification, updateFormValues],
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
              userState={userDetails?.state}
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

      let stepsKey: StepKey[] = ['REMOVE']

      return stepsKey.map((k) => stepsObj[k])
    },
    [handleBtnClickRemove, userBalances, userDetails?.state],
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
    userDetails?.state,
  ])

  const activeStep = signerAddress ? getActiveStep(steps) : null
  const disabled = !!formStatus.step

  return (
    <>
      <InpTokenRemove
        id="collateral"
        inpError={formValues.collateralError}
        inpDisabled={disabled}
        inpLabelLoading={!!signerAddress && typeof userBalances?.collateral === 'undefined'}
        inpLabelDescription={formatNumber(userBalances?.collateral, { defaultValue: '-' })}
        inpValue={formValues.collateral}
        maxRemovable={maxRemovable}
        tokenAddress={market?.collateral_token?.address}
        tokenSymbol={market?.collateral_token?.symbol}
        tokenBalance={userBalances?.collateral}
        handleInpChange={(collateral) => updateFormValues({ collateral })}
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
      {_showNoLoanFound(signerAddress, formStatus.isComplete, loanExists) ? (
        <AlertNoLoanFound owmId={rOwmId} />
      ) : (
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
      )}
    </>
  )
}

export default LoanCollateralRemove
