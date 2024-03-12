import type { FormValues, FormStatus, StepKey } from '@/components/PageLoanManage/LoanRepay/types'
import type { Step } from '@/ui/Stepper/types'

import { t } from '@lingui/macro'
import { useNavigate, useParams } from 'react-router-dom'
import React, { useCallback, useEffect, useRef, useState } from 'react'

import { DEFAULT_HEALTH_MODE } from '@/components/PageLoanManage/utils'
import { formatNumber } from '@/ui/utils'
import { getActiveStep } from '@/ui/Stepper/helpers'
import { getCollateralListPathname } from '@/utils/utilsRouter'
import { helpers } from '@/lib/apiLending'
import networks from '@/networks'
import useStore from '@/store/useStore'

import { StyledDetailInfoWrapper, StyledInpChip } from '@/components/PageLoanManage/styles'
import AlertBox from '@/ui/AlertBox'
import AlertFormError from '@/components/AlertFormError'
import AlertFormWarning from '@/components/AlertFormWarning'
import AlertNoLoanFound from '@/components/AlertNoLoanFound'
import Box from '@/ui/Box'
import Checkbox from '@/ui/Checkbox'
import DetailInfoRate from '@/components/DetailInfoRate'
import DetailInfoEstimateGas from '@/components/DetailInfoEstimateGas'
import DetailInfoHealth from '@/components/DetailInfoHealth'
import DetailInfoLiqRange from '@/components/DetailInfoLiqRange'
import InputProvider, { InputDebounced, InputMaxBtn } from '@/ui/InputComp'
import InpChipUsdRate from '@/components/InpChipUsdRate'
import LoanFormConnect from '@/components/LoanFormConnect'
import Stepper from '@/ui/Stepper'
import TxInfoBar from '@/ui/TxInfoBar'

const LoanRepay = ({ rChainId, rOwmId, isLoaded, api, owmData, userActiveKey, borrowed_token }: PageContentProps) => {
  const isSubscribed = useRef(false)
  const params = useParams()
  const navigate = useNavigate()

  const activeKey = useStore((state) => state.loanRepay.activeKey)
  const detailInfo = useStore((state) => state.loanRepay.detailInfo[activeKey])
  const formEstGas = useStore((state) => state.loanRepay.formEstGas[activeKey])
  const formStatus = useStore((state) => state.loanRepay.formStatus)
  const formValues = useStore((state) => state.loanRepay.formValues)
  const isAdvanceMode = useStore((state) => state.isAdvanceMode)
  const userLoanDetails = useStore((state) => state.user.loansDetailsMapper[userActiveKey]?.details)
  const userBalances = useStore((state) => state.user.marketsBalancesMapper[userActiveKey])
  const fetchStepApprove = useStore((state) => state.loanRepay.fetchStepApprove)
  const fetchStepDecrease = useStore((state) => state.loanRepay.fetchStepDecrease)
  const notifyNotification = useStore((state) => state.wallet.notifyNotification)
  const setFormValues = useStore((state) => state.loanRepay.setFormValues)
  const resetState = useStore((state) => state.loanRepay.resetState)

  const [healthMode, setHealthMode] = useState(DEFAULT_HEALTH_MODE)
  const [steps, setSteps] = useState<Step[]>([])
  const [txInfoBar, setTxInfoBar] = useState<React.ReactNode | null>(null)

  const { signerAddress } = api ?? {}
  const { state } = userLoanDetails || {}

  const updateFormValues = useCallback(
    (updatedFormValues: Partial<FormValues>) => {
      setFormValues(isLoaded ? api : null, owmData, updatedFormValues)
    },
    [api, isLoaded, owmData, setFormValues]
  )

  const reset = useCallback(
    (updatedFormValues: Partial<FormValues>, isFullReset: boolean) => {
      setTxInfoBar(null)
      updateFormValues(updatedFormValues)

      if (isFullReset) setHealthMode(DEFAULT_HEALTH_MODE)
    },
    [updateFormValues]
  )

  const handleInpChangeDebt = (debt: string) => {
    const updatedFormValues: Partial<FormValues> = { debt, isFullRepay: false }
    reset(updatedFormValues, formStatus.isComplete)
  }

  const handleInpChangeFullRepay = (isFullRepay: boolean) => {
    const updatedFormValues: Partial<FormValues> = { debt: '', isFullRepay }
    reset(updatedFormValues, false)
  }

  const handleBtnClickPay = useCallback(
    async (payloadActiveKey: string, api: Api, owmData: OWMData, formValues: FormValues) => {
      const { owm } = owmData
      const { debt, isFullRepay } = formValues

      const notifyMessage = isFullRepay ? t`full repay` : t`repay ${debt} ${owm.borrowed_token.symbol}`
      const notify = notifyNotification(`Please confirm ${notifyMessage}`, 'pending')
      setTxInfoBar(<AlertBox alertType="info">Pending {notifyMessage}</AlertBox>)

      const resp = await fetchStepDecrease(payloadActiveKey, api, owmData, formValues)

      if (isSubscribed.current && resp && resp.hash && resp.activeKey === activeKey && !resp.error) {
        const txMessage = t`Transaction completed.`

        setTxInfoBar(
          <TxInfoBar
            description={txMessage}
            txHash={networks[rChainId].scanTxPath(resp.hash)}
            onClose={() => {
              if (resp.loanExists) {
                reset({}, true)
              } else {
                navigate(getCollateralListPathname(params))
              }
            }}
          />
        )
      }
      if (resp?.error) setTxInfoBar(null)
      if (notify && typeof notify.dismiss === 'function') notify.dismiss()
    },
    [activeKey, fetchStepDecrease, navigate, notifyNotification, params, rChainId, reset]
  )

  const getSteps = useCallback(
    (
      payloadActiveKey: string,
      api: Api,
      owmData: OWMData,
      healthMode: HealthMode,
      formStatus: FormStatus,
      formValues: FormValues,
      steps: Step[]
    ) => {
      const { signerAddress } = api
      const { owm } = owmData
      const { debt, debtError, isFullRepay } = formValues
      const { error, isApproved, isComplete, isInProgress, step } = formStatus

      const isValid = !!signerAddress && (isFullRepay || (+debt > 0 && !debtError && !!healthMode.percent)) && !error

      const stepsObj: { [key: string]: Step } = {
        APPROVAL: {
          key: 'APPROVAL',
          status: helpers.getStepStatus(isApproved, step === 'APPROVAL', isValid),
          type: 'action',
          content: isApproved ? t`Spending Approved` : t`Approve Spending`,
          onClick: async () => {
            const notifyMessage = t`Please approve spending your ${owm.borrowed_token.symbol}`
            const notify = notifyNotification(notifyMessage, 'pending')

            await fetchStepApprove(payloadActiveKey, api, owmData, formValues)
            if (notify && typeof notify.dismiss === 'function') notify.dismiss()
          },
        },
        REPAY: {
          key: 'REPAY',
          status: helpers.getStepStatus(isComplete, step === 'REPAY', isValid && isApproved),
          type: 'action',
          content: isComplete ? t`Repaid` : t`Repay`,
          onClick: () => handleBtnClickPay(payloadActiveKey, api, owmData, formValues),
        },
      }

      let stepsKey: StepKey[]

      if (isInProgress || isComplete) {
        stepsKey = steps.map((s) => s.key as StepKey)
      } else {
        stepsKey = isApproved ? ['REPAY'] : ['APPROVAL', 'REPAY']
      }

      return stepsKey.map((k) => stepsObj[k])
    },
    [fetchStepApprove, handleBtnClickPay, notifyNotification]
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
    if (api && owmData) {
      const updatedSteps = getSteps(activeKey, api, owmData, healthMode, formStatus, formValues, steps)
      setSteps(updatedSteps)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, healthMode?.percent, formEstGas?.loading, formStatus, formValues])

  const activeStep = signerAddress ? getActiveStep(steps) : null
  const disable = formStatus.isInProgress

  return (
    <>
      {/* input debt */}
      <Box grid gridRowGap={1}>
        <InputProvider
          grid
          gridTemplateColumns="1fr auto"
          padding="4px 8px"
          inputVariant={formValues.debtError ? 'error' : undefined}
          disabled={disable}
          id="debt"
        >
          <InputDebounced
            id="inpDebt"
            type="number"
            labelProps={{
              label: t`${borrowed_token?.symbol} Avail.`,
              descriptionLoading: !!signerAddress && typeof userBalances?.borrowed === 'undefined',
              description: formatNumber(userBalances?.borrowed, { defaultValue: '-' }),
            }}
            value={formValues.debt}
            onChange={handleInpChangeDebt}
          />
          <InputMaxBtn
            onClick={() => {
              // if wallet balance < debt, use wallet balance, else use full repay.
              if (+userBalances?.borrowed < +(state?.debt ?? '0')) {
                handleInpChangeDebt(userBalances?.borrowed)
              } else {
                handleInpChangeFullRepay(true)
              }
            }}
          />
        </InputProvider>
        {formValues.debtError === 'too-much-state' ? (
          <StyledInpChip size="xs" isDarkBg isError>
            {t`Amount > debt balance ${formatNumber(state?.debt)}`}
          </StyledInpChip>
        ) : formValues.debtError === 'too-much-wallet' ? (
          <StyledInpChip size="xs" isDarkBg isError>
            {t`Amount > wallet balance ${formatNumber(userBalances?.borrowed)}`}
          </StyledInpChip>
        ) : (
          <StyledInpChip size="xs">
            {t`Debt balance`} {formatNumber(state?.debt, { defaultValue: '-' })}
          </StyledInpChip>
        )}
        <InpChipUsdRate
          address={borrowed_token?.address}
          amount={formValues.isFullRepay ? state?.debt : formValues.debt}
        />
      </Box>

      <Checkbox
        isDisabled={disable || +userBalances?.borrowed < +(state?.debt ?? '0')}
        isSelected={formValues.isFullRepay}
        onChange={(isFullRepay) => handleInpChangeFullRepay(isFullRepay)}
      >
        {t`Repay in full and close loan`}
      </Checkbox>

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
          amount={formValues.debt}
          formType=""
          healthMode={healthMode}
          userActiveKey={userActiveKey}
          setHealthMode={setHealthMode}
        />
        <DetailInfoRate isBorrow rChainId={rChainId} rOwmId={rOwmId} futureRates={detailInfo?.futureRates} />
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
        {!txInfoBar && (
          <>
            {formStatus.error ? (
              <AlertFormError errorKey={formStatus.error} handleBtnClose={() => reset({}, false)} />
            ) : formStatus.warning ? (
              <AlertFormWarning errorKey={formStatus.warning} />
            ) : null}
          </>
        )}
        {txInfoBar}
        {steps && <Stepper steps={steps} />}
      </LoanFormConnect>
    </>
  )
}

export default LoanRepay
