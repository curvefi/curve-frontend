import AlertBox from '@/ui/AlertBox'
import Stepper from '@/ui/Stepper'
import { getActiveStep } from '@/ui/Stepper/helpers'
import type { Step } from '@/ui/Stepper/types'
import TxInfoBar from '@/ui/TxInfoBar'
import { formatNumber } from '@/ui/utils'
import { t } from '@lingui/macro'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import AlertFormError from '@/components/AlertFormError'
import AlertSummary from '@/components/AlertLoanSummary'
import AlertNoLoanFound from '@/components/AlertNoLoanFound'
import DetailInfoEstimateGas from '@/components/DetailInfoEstimateGas'
import DetailInfoHealth from '@/components/DetailInfoHealth'
import DetailInfoLiqRange from '@/components/DetailInfoLiqRange'
import InpToken from '@/components/InpToken'
import LoanFormConnect from '@/components/LoanFormConnect'
import type { FormValues, FormStatus, StepKey } from '@/components/PageLoanManage/LoanCollateralAdd/types'
import { StyledDetailInfoWrapper } from '@/components/PageLoanManage/styles'
import type { FormEstGas } from '@/components/PageLoanManage/types'


import { DEFAULT_HEALTH_MODE } from '@/components/PageLoanManage/utils'
import { NOFITY_MESSAGE } from '@/constants'
import { helpers } from '@/lib/apiLending'
import networks from '@/networks'
import { DEFAULT_FORM_VALUES } from '@/store/createLoanCollateralAddSlice'
import useStore from '@/store/useStore'
import { _showNoLoanFound } from '@/utils/helpers'


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
  const loanExists = useStore((state) => state.user.loansExistsMapper[userActiveKey]?.loanExists)
  const userBalances = useStore((state) => state.user.marketsBalancesMapper[userActiveKey])
  const userDetails = useStore((state) => state.user.loansDetailsMapper[userActiveKey]?.details)
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
    (updatedFormValues: Partial<FormValues>, isFullReset?: boolean) => {
      setFormValues(isLoaded ? api : null, owmData, isFullReset ? DEFAULT_FORM_VALUES : updatedFormValues)
    },
    [api, isLoaded, owmData, setFormValues]
  )

  const handleBtnClickAdd = useCallback(
    async (payloadActiveKey: string, api: Api, owmData: OWMData, formValues: FormValues) => {
      const { chainId } = api

      const notify = notifyNotification(NOFITY_MESSAGE.pendingConfirm, 'pending')
      const resp = await fetchStepIncrease(payloadActiveKey, api, owmData, formValues)

      if (isSubscribed.current && resp && resp.hash && resp.activeKey === activeKey && !resp.error) {
        const txMessage = t`Transaction completed.`
        const txHash = networks[chainId].scanTxPath(resp.hash)
        setTxInfoBar(<TxInfoBar description={txMessage} txHash={txHash} onClose={() => updateFormValues({}, true)} />)
      }
      if (resp?.error) setTxInfoBar(null)
      if (notify && typeof notify.dismiss === 'function') notify.dismiss()
    },
    [activeKey, fetchStepIncrease, notifyNotification, updateFormValues]
  )

  const getSteps = useCallback(
    (
      payloadActiveKey: string,
      api: Api,
      owmData: OWMData,
      formEstGas: FormEstGas,
      formStatus: FormStatus,
      formValues: FormValues,
      steps: Step[]
    ) => {
      const { signerAddress } = api
      const { owm } = owmData
      const { collateral, collateralError } = formValues
      const { error, isApproved, isComplete, isInProgress, step } = formStatus

      const isValid = !!signerAddress && !formEstGas?.loading && +collateral > 0 && !collateralError && !error

      if (+collateral > 0) {
        const notifyMessage = t`deposit ${formValues.collateral} ${owm.collateral_token.symbol}.`
        setTxInfoBar(
          <AlertBox alertType="info">
            <AlertSummary
              pendingMessage={notifyMessage}
              borrowed_token={owm.borrowed_token}
              collateral_token={owm.collateral_token}
              receive={formValues.collateral}
              userState={userDetails?.state}
              userWallet={userBalances}
              type="change"
            />
          </AlertBox>
        )
      } else if (!isComplete) {
        setTxInfoBar(null)
      }

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
    [fetchStepApprove, handleBtnClickAdd, notifyNotification, userBalances, userDetails?.state]
  )

  // onMount
  useEffect(() => {
    isSubscribed.current = true

    return () => {
      isSubscribed.current = false
    }
  }, [])

  useEffect(() => {
    if (isLoaded) {
      resetState()
      updateFormValues({})
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded])

  // steps
  useEffect(() => {
    if (isLoaded && api && owmData) {
      const updatedSteps = getSteps(activeKey, api, owmData, formEstGas, formStatus, formValues, steps)
      setSteps(updatedSteps)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, activeKey, formEstGas?.loading, formStatus, formValues, userBalances, userDetails?.state])

  const activeStep = signerAddress ? getActiveStep(steps) : null
  const disabled = !!formStatus.step

  return (
    <>
      <div>
        <InpToken
          id="collateral"
          inpError={formValues.collateralError}
          inpDisabled={disabled}
          inpLabelLoading={!!signerAddress && typeof userBalances === 'undefined'}
          inpLabelDescription={formatNumber(userBalances?.collateral, { defaultValue: '-' })}
          inpValue={formValues.collateral}
          tokenAddress={collateral_token?.address}
          tokenSymbol={collateral_token?.symbol}
          tokenBalance={userBalances?.collateral}
          handleInpChange={(collateral) => updateFormValues({ collateral })}
          handleMaxClick={() => updateFormValues({ collateral: userBalances?.collateral ?? '' })}
        />
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

      {/* actions */}
      {_showNoLoanFound(signerAddress, formStatus.isComplete, loanExists) ? (
        <AlertNoLoanFound owmId={rOwmId} />
      ) : (
        <LoanFormConnect haveSigner={!!signerAddress} loading={!api}>
          {txInfoBar}
          {(formStatus.error || formStatus.stepError) && (
            <AlertFormError
              limitHeight
              errorKey={formStatus.error || formStatus.stepError}
              handleBtnClose={() => updateFormValues({}, true)}
            />
          )}
          {steps && <Stepper steps={steps} />}
        </LoanFormConnect>
      )}
    </>
  )
}

export default LoanCollateralAdd
