import type { FormValues, FormStatus, StepKey } from '@/components/PageLoanManage/LoanCollateralRemove/types'
import type { Step } from '@/ui/Stepper/types'

import { t } from '@lingui/macro'
import React, { useCallback, useEffect, useRef, useState } from 'react'

import { DEFAULT_HEALTH_MODE } from '@/components/PageLoanManage/utils'
import { getActiveStep } from '@/ui/Stepper/helpers'
import { formatNumber } from '@/ui/utils'
import { helpers } from '@/lib/apiLending'
import networks from '@/networks'
import useStore from '@/store/useStore'

import { StyledInpChip, StyledDetailInfoWrapper } from '@/components/PageLoanManage/styles'
import AlertBox from '@/ui/AlertBox'
import AlertFormError from '@/components/AlertFormError'
import AlertNoLoanFound from '@/components/AlertNoLoanFound'
import Box from '@/ui/Box'
import DetailInfoEstimateGas from '@/components/DetailInfoEstimateGas'
import DetailInfoHealth from '@/components/DetailInfoHealth'
import DetailInfoLiqRange from '@/components/DetailInfoLiqRange'
import DialogHealthWarning from '@/components/DialogHealthWarning'
import InputProvider, { InputDebounced, InputMaxBtn } from '@/ui/InputComp'
import InpChipUsdRate from '@/components/InpChipUsdRate'
import LoanFormConnect from '@/components/LoanFormConnect'
import Stepper from '@/ui/Stepper'
import TxInfoBar from '@/ui/TxInfoBar'

const LoanCollateralRemove = ({
  rChainId,
  rOwmId,
  isLoaded,
  api,
  owmData,
  userActiveKey,
  collateral_token,
}: PageContentProps) => {
  const isSubscribed = useRef(false)

  const activeKey = useStore((state) => state.loanCollateralRemove.activeKey)
  const detailInfo = useStore((state) => state.loanCollateralRemove.detailInfo[activeKey])
  const formEstGas = useStore((state) => state.loanCollateralRemove.formEstGas[activeKey])
  const formStatus = useStore((state) => state.loanCollateralRemove.formStatus)
  const formValues = useStore((state) => state.loanCollateralRemove.formValues)
  const maxRemovable = useStore((state) => state.loanCollateralRemove.maxRemovable)
  const isAdvanceMode = useStore((state) => state.isAdvanceMode)
  const userBalances = useStore((state) => state.user.marketsBalancesMapper[userActiveKey])
  const fetchStepDecrease = useStore((state) => state.loanCollateralRemove.fetchStepDecrease)
  const notifyNotification = useStore((state) => state.wallet.notifyNotification)
  const setFormValues = useStore((state) => state.loanCollateralRemove.setFormValues)
  const resetState = useStore((state) => state.loanCollateralRemove.resetState)

  const [confirmedHealthWarning, setConfirmHealthWarning] = useState(false)
  const [healthMode, setHealthMode] = useState(DEFAULT_HEALTH_MODE)
  const [steps, setSteps] = useState<Step[]>([])
  const [txInfoBar, setTxInfoBar] = useState<React.ReactNode | null>(null)

  const { signerAddress } = api ?? {}

  const network = networks[rChainId]

  const updateFormValues = useCallback(
    (updatedFormValues: Partial<FormValues>) => {
      setFormValues(isLoaded ? api : null, owmData, updatedFormValues, maxRemovable)
    },
    [api, isLoaded, maxRemovable, owmData, setFormValues]
  )

  const reset = useCallback(
    (updatedFormValues: Partial<FormValues>, isFullReset: boolean) => {
      setConfirmHealthWarning(false)
      setTxInfoBar(null)
      updateFormValues(updatedFormValues)

      if (isFullReset) {
        setHealthMode(DEFAULT_HEALTH_MODE)
      }
    },
    [updateFormValues]
  )

  const handleInpChangeCollateral = (collateral: string) => {
    reset({ collateral }, formStatus.isComplete)
  }

  const handleBtnClickRemove = useCallback(
    async (payloadActiveKey: string, api: Api, owmData: OWMData, formValues: FormValues) => {
      const { owm } = owmData

      const notifyMessage = t`removal of ${formValues.collateral} ${owm.collateral_token.symbol} collateral`
      const notify = notifyNotification(`Please confirm ${notifyMessage}`, 'pending')
      setTxInfoBar(<AlertBox alertType="info">{`Pending ${notifyMessage}`}</AlertBox>)

      const resp = await fetchStepDecrease(payloadActiveKey, api, owmData, formValues)

      if (isSubscribed.current && resp && resp.hash && resp.activeKey === activeKey && !resp.error) {
        const txMessage = t`Transaction completed.`
        const txHash = network.scanTxPath(resp.hash)
        setTxInfoBar(<TxInfoBar description={txMessage} txHash={txHash} onClose={() => reset({}, true)} />)
      }
      if (resp?.error) setTxInfoBar(null)
      if (notify && typeof notify.dismiss === 'function') notify.dismiss()
    },
    [activeKey, fetchStepDecrease, network, notifyNotification, reset]
  )

  const stepsObj = useCallback(
    (
      payloadActiveKey: string,
      api: Api,
      owmData: OWMData,
      healthMode: HealthMode,
      confirmedHealthWarning: boolean,
      formStatus: FormStatus,
      formValues: FormValues
    ) => {
      const { signerAddress } = api
      const { collateral, collateralError } = formValues
      const { error, isComplete, step } = formStatus

      const isValid = !!signerAddress && +collateral > 0 && !collateralError && !error && !!healthMode.percent

      const stepsObj: { [key: string]: Step } = {
        REMOVE: {
          key: 'REMOVE',
          status: helpers.getStepStatus(isComplete, step === 'REMOVE', isValid),
          type: 'action',
          content: isComplete ? t`Collateral Removed` : t`Remove Collateral`,
          ...(healthMode.message
            ? {
                modal: {
                  title: t`Warning!`,
                  content: (
                    <DialogHealthWarning
                      {...healthMode}
                      confirmed={confirmedHealthWarning}
                      setConfirmed={(val) => setConfirmHealthWarning(val)}
                    />
                  ),
                  isDismissable: false,
                  cancelBtnProps: {
                    label: t`Cancel`,
                    onClick: () => setConfirmHealthWarning(false),
                  },
                  primaryBtnProps: {
                    onClick: () => handleBtnClickRemove(payloadActiveKey, api, owmData, formValues),
                    disabled: !confirmedHealthWarning,
                  },
                  primaryBtnLabel: 'Remove anyway',
                },
              }
            : { onClick: async () => handleBtnClickRemove(payloadActiveKey, api, owmData, formValues) }),
        },
      }

      let stepsKey: StepKey[] = ['REMOVE']

      return stepsKey.map((k) => stepsObj[k])
    },
    [handleBtnClickRemove]
  )

  // onMount
  useEffect(() => {
    isSubscribed.current = true

    return () => {
      isSubscribed.current = false
      resetState()
    }
  }, [resetState])

  // init
  useEffect(() => {
    if (isLoaded) updateFormValues({})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded])

  // steps
  useEffect(() => {
    if (isLoaded && owmData && api) {
      const updatedSteps = stepsObj(activeKey, api, owmData, healthMode, confirmedHealthWarning, formStatus, formValues)
      setSteps(updatedSteps)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, confirmedHealthWarning, healthMode?.percent, formEstGas?.loading, formStatus, formValues])

  const activeStep = signerAddress ? getActiveStep(steps) : null
  const disabled = formStatus.isInProgress

  return (
    <>
      {/* input collateral */}
      <Box grid gridRowGap={1}>
        <InputProvider
          grid
          gridTemplateColumns="1fr auto"
          padding="4px 8px"
          inputVariant={formValues.collateralError ? 'error' : undefined}
          disabled={disabled}
          id="collateral"
        >
          <InputDebounced
            id="inpCollateral"
            type="number"
            labelProps={{
              label: t`${collateral_token?.symbol} Avail.`,
              descriptionLoading: !!signerAddress && typeof userBalances?.collateral === 'undefined',
              description: formatNumber(userBalances?.collateral, { defaultValue: '-' }),
            }}
            value={formValues.collateral}
            onChange={handleInpChangeCollateral}
          />
          <InputMaxBtn onClick={() => handleInpChangeCollateral(maxRemovable ?? '0')} />
        </InputProvider>
        {formValues.collateralError === 'too-much-max' && maxRemovable ? (
          <StyledInpChip size="xs" isDarkBg isError>
            {t`Amount > max removable ${formatNumber(maxRemovable, { defaultValue: '-' })}`}
          </StyledInpChip>
        ) : (
          <StyledInpChip size="xs">Max removable {formatNumber(maxRemovable, { defaultValue: '-' })}</StyledInpChip>
        )}
        <InpChipUsdRate address={collateral_token?.address} amount={formValues.collateral} />
      </Box>

      {/* detail info */}
      <StyledDetailInfoWrapper>
        {isAdvanceMode && (
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

      {signerAddress && !formStatus.isComplete && (
        <AlertNoLoanFound alertType="info" owmId={rOwmId} userActiveKey={userActiveKey} />
      )}

      {/* actions */}
      <LoanFormConnect haveSigner={!!signerAddress} loading={!api}>
        {formStatus.error ? (
          <AlertFormError errorKey={formStatus.error} handleBtnClose={() => reset({}, false)} />
        ) : healthMode.message ? (
          <AlertBox alertType="warning">{healthMode.message}</AlertBox>
        ) : null}
        {txInfoBar}
        {steps && <Stepper steps={steps} />}
      </LoanFormConnect>
    </>
  )
}

export default LoanCollateralRemove
