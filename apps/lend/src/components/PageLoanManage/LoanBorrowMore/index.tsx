import type { FormValues, FormStatus, StepKey } from '@/components/PageLoanManage/LoanBorrowMore/types'
import type { Step } from '@/ui/Stepper/types'

import { t } from '@lingui/macro'
import React, { useCallback, useEffect, useRef, useState } from 'react'

import { _getMaxRecvActiveKey } from '@/store/createLoanBorrowMoreSlice'
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
import DetailInfoRate from '@/components/DetailInfoRate'
import DetailInfoEstimateGas from '@/components/DetailInfoEstimateGas'
import DetailInfoHealth from '@/components/DetailInfoHealth'
import DetailInfoLiqRange from '@/components/DetailInfoLiqRange'
import DialogHealthWarning from '@/components/DialogHealthWarning'
import InputProvider, { InputDebounced, InputMaxBtn } from '@/ui/InputComp'
import InpChipUsdRate from '@/components/InpChipUsdRate'
import LoanFormConnect from '@/components/LoanFormConnect'
import Stepper from '@/ui/Stepper'
import TxInfoBar from '@/ui/TxInfoBar'

const LoanBorrowMore = ({
  rChainId,
  rOwmId,
  isLoaded,
  api,
  owmData,
  userActiveKey,
  borrowed_token,
  collateral_token,
}: PageContentProps) => {
  const isSubscribed = useRef(false)

  const activeKey = useStore((state) => state.loanBorrowMore.activeKey)
  const detailInfo = useStore((state) => state.loanBorrowMore.detailInfo[activeKey])
  const formEstGas = useStore((state) => state.loanBorrowMore.formEstGas[activeKey])
  const formStatus = useStore((state) => state.loanBorrowMore.formStatus)
  const formValues = useStore((state) => state.loanBorrowMore.formValues)
  const maxRecvActiveKey = _getMaxRecvActiveKey(api, owmData, formValues.collateral)
  const maxRecvResp = useStore((state) => state.loanBorrowMore.maxRecv[maxRecvActiveKey])
  const isAdvanceMode = useStore((state) => state.isAdvanceMode)
  const userBalances = useStore((state) => state.user.marketsBalancesMapper[userActiveKey])
  const fetchStepApprove = useStore((state) => state.loanBorrowMore.fetchStepApprove)
  const fetchStepIncrease = useStore((state) => state.loanBorrowMore.fetchStepIncrease)
  const notifyNotification = useStore((state) => state.wallet.notifyNotification)
  const setFormValues = useStore((state) => state.loanBorrowMore.setFormValues)
  const resetState = useStore((state) => state.loanBorrowMore.resetState)

  const [confirmedHealthWarning, setConfirmHealthWarning] = useState(false)
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

  const handleInpChange = (name: 'collateral' | 'debt', value: string) => {
    const updatedFormValues: Partial<FormValues> = { [name]: value }
    reset(updatedFormValues, formStatus.isComplete)
  }

  const handleBtnClickBorrow = useCallback(
    async (payloadActiveKey: string, api: Api, formValues: FormValues, owmData: OWMData) => {
      const { chainId } = api
      const { owm } = owmData
      const { collateral, debt } = formValues

      const haveCollateralAndDebt = +collateral > 0 && +debt > 0
      const notifyMessage = haveCollateralAndDebt
        ? t`borrow more ${formValues.debt} ${owm.borrowed_token.symbol}, add ${formValues.collateral} ${owm.collateral_token.symbol} collateral`
        : t`borrow more ${formValues.debt} ${owm.borrowed_token.symbol}`
      const notify = notifyNotification(`Please confirm ${notifyMessage}`, 'pending')
      setTxInfoBar(<AlertBox alertType="info">{`Pending ${notifyMessage}`}</AlertBox>)

      const resp = await fetchStepIncrease(payloadActiveKey, api, owmData, formValues)

      if (isSubscribed.current && resp && resp.hash && resp.activeKey === activeKey && !resp.error) {
        const txMessage = t`Transaction completed.`
        setTxInfoBar(
          <TxInfoBar
            description={txMessage}
            txHash={networks[chainId].scanTxPath(resp.hash)}
            onClose={() => reset({}, true)}
          />
        )
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
      healthMode: HealthMode,
      confirmedHealthWarning: boolean,
      formStatus: FormStatus,
      formValues: FormValues,
      steps: Step[]
    ) => {
      const { signerAddress } = api
      const { debt, debtError, collateralError } = formValues
      const { error, isApproved, isComplete, step } = formStatus

      const isValid = !!signerAddress && +debt > 0 && !debtError && !collateralError && !error && !!healthMode.percent

      const stepsObj: { [key: string]: Step } = {
        APPROVAL: {
          key: 'APPROVAL',
          status: helpers.getStepStatus(isApproved, step === 'APPROVAL', isValid),
          type: 'action',
          content: isApproved ? t`Spending Approved` : t`Approve Spending`,
          onClick: async () => {
            const notifyMessage = t`Please approve spending of ${formValues.collateral}`
            const notify = notifyNotification(notifyMessage, 'pending')

            await fetchStepApprove(payloadActiveKey, api, owmData, formValues)
            if (notify && typeof notify.dismiss === 'function') notify.dismiss()
          },
        },
        BORROW_MORE: {
          key: 'BORROW_MORE',
          status: helpers.getStepStatus(isComplete, step === 'BORROW_MORE', isValid && isApproved),
          type: 'action',
          content: formStatus.isComplete ? t`Borrowed` : t`Borrow`,
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
                    onClick: () => handleBtnClickBorrow(payloadActiveKey, api, formValues, owmData),
                    disabled: !confirmedHealthWarning,
                  },
                  primaryBtnLabel: t`Borrow more anyway`,
                },
              }
            : { onClick: async () => handleBtnClickBorrow(payloadActiveKey, api, formValues, owmData) }),
        },
      }

      let stepsKey: StepKey[]

      if (formStatus.isInProgress || formStatus.isComplete) {
        stepsKey = steps.map((s) => s.key as StepKey)
      } else {
        stepsKey = formStatus.isApproved ? ['BORROW_MORE'] : ['APPROVAL', 'BORROW_MORE']
      }

      return stepsKey.map((k) => stepsObj[k])
    },
    [notifyNotification, fetchStepApprove, handleBtnClickBorrow]
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
      const updatedSteps = getSteps(
        activeKey,
        api,
        owmData,
        healthMode,
        confirmedHealthWarning,
        formStatus,
        formValues,
        steps
      )
      setSteps(updatedSteps)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, confirmedHealthWarning, healthMode?.percent, formEstGas?.loading, formStatus, formValues])

  const activeStep = signerAddress ? getActiveStep(steps) : null
  const disabled = formStatus.isInProgress

  return (
    <>
      {/* field debt */}
      <Box grid gridRowGap={1}>
        <InputProvider
          grid
          gridTemplateColumns="1fr auto"
          padding="4px 8px"
          inputVariant={formValues.debtError ? 'error' : undefined}
          disabled={disabled}
          id="debt"
        >
          <InputDebounced
            id="inpDebt"
            type="number"
            labelProps={{
              label: t`${borrowed_token?.symbol} borrow amount`,
            }}
            value={formValues.debt}
            onChange={(val) => handleInpChange('debt', val)}
          />
          <InputMaxBtn disabled={disabled} onClick={() => handleInpChange('debt', maxRecvResp?.maxRecv)} />
        </InputProvider>
        {formValues.debtError === 'too-much-max' ? (
          <StyledInpChip size="xs" isDarkBg isError>
            {t`Amount > max borrow amount ${formatNumber(maxRecvResp?.maxRecv)}`}
          </StyledInpChip>
        ) : (
          <StyledInpChip size="xs">
            Max borrow amount {formatNumber(maxRecvResp?.maxRecv, { defaultValue: '-' })}
          </StyledInpChip>
        )}
        <InpChipUsdRate address={borrowed_token?.address} amount={formValues.debt} />
      </Box>

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
            onChange={(val) => handleInpChange('collateral', val)}
          />
          <InputMaxBtn
            disabled={disabled}
            onClick={() => handleInpChange('collateral', userBalances?.collateral ?? '')}
          />
        </InputProvider>
        {formValues.collateralError === 'too-much-wallet' && (
          <StyledInpChip size="xs" isDarkBg isError>
            {t`Amount > wallet balance ${+userBalances?.collateral}`}
          </StyledInpChip>
        )}
        <InpChipUsdRate address={collateral_token?.address} amount={formValues.collateral} />

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

          {signerAddress && (
            <DetailInfoEstimateGas
              isDivider
              chainId={rChainId}
              {...formEstGas}
              stepProgress={activeStep && steps.length > 1 ? { active: activeStep, total: steps.length } : null}
            />
          )}
        </StyledDetailInfoWrapper>
      </Box>

      {isLoaded && userActiveKey && <AlertNoLoanFound alertType="info" owmId={rOwmId} userActiveKey={userActiveKey} />}

      {/* actions */}
      <LoanFormConnect haveSigner={!!signerAddress} loading={!isLoaded}>
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

export default LoanBorrowMore
