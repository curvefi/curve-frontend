import Box from '@/ui/Box'
import Checkbox from '@/ui/Checkbox'
import InputProvider, { InputDebounced, InputMaxBtn } from '@/ui/InputComp'
import Stepper from '@/ui/Stepper'
import { getActiveStep } from '@/ui/Stepper/helpers'
import type { Step } from '@/ui/Stepper/types'
import TxInfoBar from '@/ui/TxInfoBar'
import { formatNumber } from '@/ui/utils'
import { t } from '@lingui/macro'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AlertFormError from '@/components/AlertFormError'
import AlertFormWarning from '@/components/AlertFormWarning'
import DetailInfoBorrowRate from '@/components/DetailInfoBorrowRate'
import DetailInfoEstimateGas from '@/components/DetailInfoEstimateGas'
import DetailInfoHealth from '@/components/DetailInfoHealth'
import DetailInfoLiqRange from '@/components/DetailInfoLiqRange'
import LoanFormConnect from '@/components/LoanFormConnect'
import { DEFAULT_WALLET_BALANCES } from '@/components/LoanInfoUser/utils'
import type { FormValues, FormStatus, StepKey } from '@/components/PageLoanManage/LoanDecrease/types'
import { StyledDetailInfoWrapper, StyledInpChip } from '@/components/PageLoanManage/styles'
import type { FormEstGas, PageLoanManageProps } from '@/components/PageLoanManage/types'


import { DEFAULT_DETAIL_INFO, DEFAULT_FORM_EST_GAS, DEFAULT_HEALTH_MODE } from '@/components/PageLoanManage/utils'
import networks from '@/networks'
import { DEFAULT_FORM_STATUS } from '@/store/createLoanDecreaseSlice'
import useStore from '@/store/useStore'
import { curveProps } from '@/utils/helpers'
import { getStepStatus, getTokenName } from '@/utils/utilsLoan'
import { getCollateralListPathname } from '@/utils/utilsRouter'


interface Props extends Pick<PageLoanManageProps, 'curve' | 'llamma' | 'llammaId' | 'params' | 'rChainId'> {}

// Loan repay
const LoanDecrease = ({ curve, llamma, llammaId, params, rChainId }: Props) => {
  const isSubscribed = useRef(false)
  const navigate = useNavigate()

  const activeKey = useStore((state) => state.loanDecrease.activeKey)
  const detailInfo = useStore((state) => state.loanDecrease.detailInfo[activeKey] ?? DEFAULT_DETAIL_INFO)
  const formEstGas = useStore((state) => state.loanDecrease.formEstGas[activeKey] ?? DEFAULT_FORM_EST_GAS)
  const formStatus = useStore((state) => state.loanDecrease.formStatus)
  const formValues = useStore((state) => state.loanDecrease.formValues)
  const isAdvanceMode = useStore((state) => state.isAdvanceMode)
  const loanDetails = useStore((state) => state.loans.detailsMapper[llammaId])
  const userLoanDetails = useStore((state) => state.loans.userDetailsMapper[llammaId])
  const userWalletBalances = useStore(
    (state) => state.loans.userWalletBalancesMapper[llammaId] ?? DEFAULT_WALLET_BALANCES
  )
  const userWalletBalancesLoading = useStore((state) => state.loans.userWalletBalancesLoading)

  const fetchStepApprove = useStore((state) => state.loanDecrease.fetchStepApprove)
  const fetchStepDecrease = useStore((state) => state.loanDecrease.fetchStepDecrease)
  const notifyNotification = useStore((state) => state.wallet.notifyNotification)
  const setFormValues = useStore((state) => state.loanDecrease.setFormValues)
  const setStateByKey = useStore((state) => state.loanDecrease.setStateByKey)
  const resetState = useStore((state) => state.loanDecrease.resetState)

  const [healthMode, setHealthMode] = useState(DEFAULT_HEALTH_MODE)
  const [steps, setSteps] = useState<Step[]>([])
  const [txInfoBar, setTxInfoBar] = useState<React.ReactNode | null>(null)

  const { chainId, haveSigner } = curveProps(curve)
  const { userState } = userLoanDetails || {}

  const updateFormValues = (updatedFormValues: FormValues) => {
    if (chainId && llamma) {
      setFormValues(chainId, llamma, updatedFormValues)
    }
  }

  const reset = useCallback(
    (isErrorReset: boolean, isFullReset: boolean) => {
      setTxInfoBar(null)

      if (isErrorReset || isFullReset) {
        if (isFullReset) {
          setHealthMode(DEFAULT_HEALTH_MODE)
        }
        setStateByKey('formStatus', { ...DEFAULT_FORM_STATUS, isApproved: formStatus.isApproved })
      }
    },
    [formStatus, setStateByKey]
  )

  const handleInpChangeDebt = (debt: string) => {
    reset(!!formStatus.error, formStatus.isComplete)

    const updatedFormValues = { ...formValues }
    updatedFormValues.debt = debt
    updatedFormValues.debtError = ''
    updateFormValues(updatedFormValues)
  }

  const handleInpChangeFullRepay = (isFullRepay: boolean) => {
    reset(true, false)
    const updatedFormValues = { ...formValues }
    updatedFormValues.debt = ''
    updatedFormValues.debtError = ''
    updatedFormValues.isFullRepay = isFullRepay
    updateFormValues(updatedFormValues)
  }

  const handleBtnClickPay = useCallback(
    async (payloadActiveKey: string, curve: Curve, llamma: Llamma, formValues: FormValues) => {
      const { debt, isFullRepay } = formValues
      const notifyMessage = isFullRepay
        ? t`Please approve full repay.`
        : t`Please approve a repayment of ${debt} ${getTokenName(llamma).stablecoin}.`
      const notify = notifyNotification(notifyMessage, 'pending')
      const resp = await fetchStepDecrease(payloadActiveKey, curve, llamma, formValues)

      if (isSubscribed.current && resp && resp.hash && resp.activeKey === activeKey) {
        const txInfoBarMessage = resp.loanExists
          ? t`Transaction complete`
          : t`Transaction complete. This loan is payoff and will no longer be manageable.`

        setTxInfoBar(
          <TxInfoBar
            description={txInfoBarMessage}
            txHash={networks[rChainId].scanTxPath(resp.hash)}
            onClose={() => {
              if (resp.loanExists) {
                reset(false, true)
              } else {
                navigate(getCollateralListPathname(params))
              }
            }}
          />
        )
      }
      if (notify && typeof notify.dismiss === 'function') notify.dismiss()
    },
    [activeKey, fetchStepDecrease, navigate, notifyNotification, params, rChainId, reset]
  )

  const getSteps = useCallback(
    (
      payloadActiveKey: string,
      curve: Curve,
      llamma: Llamma,
      formEstGas: FormEstGas,
      formStatus: FormStatus,
      formValues: FormValues,
      steps: Step[]
    ) => {
      const { debt, debtError, isFullRepay } = formValues
      const { error, isApproved, isComplete, isInProgress, step } = formStatus
      const isValidFormValue = isFullRepay || (+debt > 0 && !debtError)
      const isValid = !!curve.signerAddress && !formEstGas.loading && isValidFormValue && !error

      const stepsObj: { [key: string]: Step } = {
        APPROVAL: {
          key: 'APPROVAL',
          status: getStepStatus(isApproved, step === 'APPROVAL', isValid),
          type: 'action',
          content: isApproved ? t`Spending Approved` : t`Approve Spending`,
          onClick: async () => {
            const notifyMessage = t`Please approve spending your ${getTokenName(llamma).stablecoin}`
            const notify = notifyNotification(notifyMessage, 'pending')

            await fetchStepApprove(payloadActiveKey, curve, llamma, formValues)
            if (notify && typeof notify.dismiss === 'function') notify.dismiss()
          },
        },
        PAY: {
          key: 'PAY',
          status: getStepStatus(isComplete, step === 'PAY', isValid && isApproved),
          type: 'action',
          content: isComplete ? t`Repaid` : t`Repay`,
          onClick: () => handleBtnClickPay(payloadActiveKey, curve, llamma, formValues),
        },
      }

      let stepsKey: StepKey[]

      if (isInProgress || isComplete) {
        stepsKey = steps.map((s) => s.key as StepKey)
      } else {
        stepsKey = isApproved ? ['PAY'] : ['APPROVAL', 'PAY']
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

  // steps
  useEffect(() => {
    if (curve && llamma) {
      const updatedSteps = getSteps(activeKey, curve, llamma, formEstGas, formStatus, formValues, steps)
      setSteps(updatedSteps)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [healthMode?.percent, llamma?.id, curve?.chainId, formEstGas.loading, formStatus, formValues])

  const activeStep = haveSigner ? getActiveStep(steps) : null
  const disable = !chainId || !llamma || formStatus.isInProgress

  return (
    <>
      {/* input debt */}
      <Box grid gridRowGap={1}>
        <InputProvider
          grid
          gridTemplateColumns="1fr auto"
          padding="4px 8px"
          inputVariant={formValues.debtError ? 'error' : undefined}
          disabled={disable || formValues.isFullRepay}
          id="debt"
        >
          <InputDebounced
            id="inpDebt"
            type="number"
            labelProps={{
              label: t`${getTokenName(llamma).stablecoin} Avail.`,
              descriptionLoading: userWalletBalancesLoading,
              description: formatNumber(userWalletBalances.stablecoin),
            }}
            value={formValues.debt}
            onChange={handleInpChangeDebt}
          />
          <InputMaxBtn
            onClick={() => {
              // if wallet balance < debt, use wallet balance, else use full repay.
              if (+userWalletBalances?.stablecoin < +userState?.debt) {
                handleInpChangeDebt(userWalletBalances.stablecoin)
              } else {
                handleInpChangeFullRepay(true)
              }
            }}
          />
        </InputProvider>
        {formValues.debtError ? (
          formValues.debtError === 'too-much' ? (
            <StyledInpChip size="xs" isDarkBg isError>
              The specified amount exceeds your total debt. Your debt balance is {formatNumber(userState.debt)}.
            </StyledInpChip>
          ) : formValues.debtError === 'not-enough' ? (
            <StyledInpChip size="xs" isDarkBg isError>
              The specified amount exceeds the current balance in the wallet.
            </StyledInpChip>
          ) : null
        ) : (
          <StyledInpChip size="xs">
            {t`Debt`} {formatNumber(userState?.debt, { defaultValue: '-' })}
          </StyledInpChip>
        )}
      </Box>

      <Checkbox
        isDisabled={
          disable ||
          typeof userWalletBalances === 'undefined' ||
          typeof userState === 'undefined' ||
          +userWalletBalances?.stablecoin < +userState?.debt
        }
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
            {...detailInfo}
            healthMode={healthMode}
            loanDetails={loanDetails}
            userLoanDetails={userLoanDetails}
          />
        )}
        <DetailInfoHealth
          isManage
          {...detailInfo}
          amount={formValues.debt}
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
      </StyledDetailInfoWrapper>

      {/* actions */}
      <LoanFormConnect haveSigner={haveSigner} loading={!curve}>
        {!txInfoBar && (
          <>
            {formStatus.error ? (
              <AlertFormError errorKey={formStatus.error} handleBtnClose={() => reset(true, false)} />
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

export default LoanDecrease
