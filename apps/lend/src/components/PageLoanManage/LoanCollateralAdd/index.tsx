import type { FormValues, FormStatus, StepKey } from '@/components/PageLoanManage/LoanCollateralAdd/types'
import type { Step } from '@/ui/Stepper/types'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { t } from '@lingui/macro'

import { DEFAULT_HEALTH_MODE } from '@/components/PageLoanManage/utils'
import { formatNumber } from '@/ui/utils'
import { getActiveStep } from '@/ui/Stepper/helpers'
import { helpers } from '@/lib/apiLending'
import networks from '@/networks'
import useStore from '@/store/useStore'

import { StyledDetailInfoWrapper, StyledInpChip } from '@/components/PageLoanManage/styles'
import AlertBox from '@/ui/AlertBox'
import AlertFormError from '@/components/AlertFormError'
import AlertNoLoanFound from '@/components/AlertNoLoanFound'
import Box from '@/ui/Box'
import DetailInfoEstimateGas from '@/components/DetailInfoEstimateGas'
import DetailInfoHealth from '@/components/DetailInfoHealth'
import DetailInfoLiqRange from '@/components/DetailInfoLiqRange'
import InputProvider, { InputDebounced, InputMaxBtn } from '@/ui/InputComp'
import InpChipUsdRate from '@/components/InpChipUsdRate'
import LoanFormConnect from '@/components/LoanFormConnect'
import Stepper from '@/ui/Stepper'
import TxInfoBar from '@/ui/TxInfoBar'

const LoanCollateralAdd = ({
  rChainId,
  rOwmId,
  api,
  isLoaded,
  owmData,
  userActiveKey,
  collateral_token,
}: PageContentProps) => {
  const isSubscribed = useRef(false)

  const activeKey = useStore((state) => state.loanCollateralAdd.activeKey)
  const detailInfo = useStore((state) => state.loanCollateralAdd.detailInfo[activeKey])
  const formEstGas = useStore((state) => state.loanCollateralAdd.formEstGas[activeKey])
  const formStatus = useStore((state) => state.loanCollateralAdd.formStatus)
  const formValues = useStore((state) => state.loanCollateralAdd.formValues)
  const isAdvanceMode = useStore((state) => state.isAdvanceMode)
  const userBalances = useStore((state) => state.user.marketsBalancesMapper[userActiveKey])
  const fetchStepApprove = useStore((state) => state.loanCollateralAdd.fetchStepApprove)
  const fetchStepIncrease = useStore((state) => state.loanCollateralAdd.fetchStepIncrease)
  const notifyNotification = useStore((state) => state.wallet.notifyNotification)
  const setFormValues = useStore((state) => state.loanCollateralAdd.setFormValues)
  const resetState = useStore((state) => state.loanCollateralAdd.resetState)

  const [healthMode, setHealthMode] = useState(DEFAULT_HEALTH_MODE)
  const [steps, setSteps] = useState<Step[]>([])
  const [txInfoBar, setTxInfoBar] = useState<React.ReactNode | null>(null)

  const { signerAddress } = api ?? {}

  const updateFormValues = useCallback(
    (updatedFormValues: Partial<FormValues>) => {
      setFormValues(isLoaded ? api : null, owmData, updatedFormValues)
    },
    [api, isLoaded, owmData, setFormValues]
  )

  const reset = useCallback(
    (updatedFormValues: Partial<FormValues>) => {
      setTxInfoBar(null)
      updateFormValues(updatedFormValues)
    },
    [updateFormValues]
  )

  const handleInpChangeCollateral = (collateral: string) => {
    reset({ collateral })
  }

  const handleBtnClickAdd = useCallback(
    async (payloadActiveKey: string, api: Api, owmData: OWMData, formValues: FormValues) => {
      const { owm } = owmData
      const { chainId } = api

      const notifyMessage = t`add ${formValues.collateral} ${owm.collateral_token.symbol} collateral`
      const notify = notifyNotification(`Please confirm ${notifyMessage}`, 'pending')
      setTxInfoBar(<AlertBox alertType="info">{`Pending ${notifyMessage}`}</AlertBox>)

      const resp = await fetchStepIncrease(payloadActiveKey, api, owmData, formValues)

      if (isSubscribed.current && resp && resp.hash && resp.activeKey === activeKey && !resp.error) {
        const txMessage = t`Transaction completed.`
        const txHash = networks[chainId].scanTxPath(resp.hash)
        setTxInfoBar(<TxInfoBar description={txMessage} txHash={txHash} onClose={() => reset({})} />)
      }
      if (resp?.error) setTxInfoBar(null)
      if (notify && typeof notify.dismiss === 'function') notify.dismiss()
    },
    [activeKey, fetchStepIncrease, notifyNotification, reset]
  )

  const getSteps = useCallback(
    (
      payloadActiveKey: string,
      api: Api,
      owmData: OWMData,
      formStatus: FormStatus,
      formValues: FormValues,
      steps: Step[]
    ) => {
      const { signerAddress } = api
      const { owm } = owmData
      const { collateral, collateralError } = formValues
      const { error, isApproved, isComplete, isInProgress, step } = formStatus

      const isValid = !!signerAddress && +collateral > 0 && !collateralError && !error

      const stepsObj: { [key: string]: Step } = {
        APPROVAL: {
          key: 'APPROVAL',
          status: helpers.getStepStatus(isApproved, step === 'APPROVAL', isValid),
          type: 'action',
          content: isApproved ? t`Spending Approved` : t`Approve Spending`,
          onClick: async () => {
            const notifyMessage = t`Please approve spending of ${owm.collateral_token.symbol}`
            const notify = notifyNotification(notifyMessage, 'pending')

            await fetchStepApprove(payloadActiveKey, api, owmData, formValues)
            if (notify && typeof notify.dismiss === 'function') notify.dismiss()
          },
        },
        ADD: {
          key: 'ADD',
          status: helpers.getStepStatus(isComplete, step === 'ADD', isValid && isApproved),
          type: 'action',
          content: isComplete ? t`Collateral Added` : t`Add Collateral`,
          onClick: async () => handleBtnClickAdd(payloadActiveKey, api, owmData, formValues),
        },
      }

      let stepsKey: StepKey[]

      if (isInProgress || isComplete) {
        stepsKey = steps.map((s) => s.key as StepKey)
      } else {
        stepsKey = isApproved ? ['ADD'] : ['APPROVAL', 'ADD']
      }

      return stepsKey.map((k) => stepsObj[k])
    },
    [fetchStepApprove, handleBtnClickAdd, notifyNotification]
  )

  // onMount
  useEffect(() => {
    isSubscribed.current = true

    return () => {
      isSubscribed.current = false
      resetState()
    }
  }, [resetState])

  useEffect(() => {
    if (isLoaded) updateFormValues({})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded])

  // steps
  useEffect(() => {
    if (isLoaded && api && owmData) {
      const updatedSteps = getSteps(activeKey, api, owmData, formStatus, formValues, steps)
      setSteps(updatedSteps)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, formEstGas?.loading, formStatus, formValues])

  const activeStep = signerAddress ? getActiveStep(steps) : null
  const disabled = formStatus.isInProgress

  return (
    <>
      <div>
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
                descriptionLoading: !!signerAddress && typeof userBalances === 'undefined',
                description: formatNumber(userBalances?.collateral, { defaultValue: '-' }),
              }}
              value={formValues.collateral}
              onChange={handleInpChangeCollateral}
            />
            <InputMaxBtn onClick={() => handleInpChangeCollateral(userBalances?.collateral ?? '')} />
          </InputProvider>
          {formValues.collateralError === 'too-much' && (
            <StyledInpChip size="xs" isDarkBg isError>
              {t`Amount > collateral balance ${formatNumber(userBalances?.collateral)}`}
            </StyledInpChip>
          )}
          <InpChipUsdRate address={collateral_token?.address} amount={formValues.collateral} />
        </Box>
      </div>

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
          formType=""
          healthMode={healthMode}
          userActiveKey={userActiveKey}
          setHealthMode={setHealthMode}
        />

        {signerAddress && (
          <DetailInfoEstimateGas
            isDivider
            chainId={rChainId}
            {...formEstGas}
            stepProgress={activeStep && steps.length > 1 ? { active: activeStep, total: steps.length } : null}
          />
        )}
      </StyledDetailInfoWrapper>

      {signerAddress && !formStatus.isComplete && (
        <AlertNoLoanFound alertType="info" owmId={rOwmId} userActiveKey={userActiveKey} />
      )}

      {/* actions */}
      <LoanFormConnect haveSigner={!!signerAddress} loading={!api}>
        {formStatus.error && <AlertFormError errorKey={formStatus.error} handleBtnClose={() => reset({})} />}
        {txInfoBar}
        {steps && <Stepper steps={steps} />}
      </LoanFormConnect>
    </>
  )
}

export default LoanCollateralAdd
