import type { FormValues, FormStatus, StepKey } from '@loan/components/PageLoanManage/CollateralIncrease/types'
import type { FormEstGas, PageLoanManageProps } from '@loan/components/PageLoanManage/types'
import type { ReactNode } from 'react'
import type { Step } from '@ui/Stepper/types'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { t } from '@lingui/macro'

import { DEFAULT_DETAIL_INFO, DEFAULT_FORM_EST_GAS, DEFAULT_HEALTH_MODE } from '@loan/components/PageLoanManage/utils'
import { DEFAULT_FORM_STATUS } from '@loan/store/createLoanCollateralIncreaseSlice'
import { DEFAULT_WALLET_BALANCES } from '@loan/components/LoanInfoUser/utils'
import { curveProps } from '@loan/utils/helpers'
import { formatNumber } from '@ui/utils'
import { getActiveStep } from '@ui/Stepper/helpers'
import { getStepStatus, getTokenName } from '@loan/utils/utilsLoan'
import networks from '@loan/networks'
import useStore from '@loan/store/useStore'

import { StyledDetailInfoWrapper, StyledInpChip } from '@loan/components/PageLoanManage/styles'
import AlertBox from '@ui/AlertBox'
import AlertFormError from '@loan/components/AlertFormError'
import Box from '@ui/Box'
import DialogHealthWarning from '@loan/components/DialogHealthWarning'
import DetailInfoBorrowRate from '@loan/components/DetailInfoBorrowRate'
import DetailInfoEstimateGas from '@loan/components/DetailInfoEstimateGas'
import DetailInfoHealth from '@loan/components/DetailInfoHealth'
import DetailInfoLiqRange from '@loan/components/DetailInfoLiqRange'
import InputProvider, { InputDebounced, InputMaxBtn } from '@ui/InputComp'
import LoanFormConnect from '@loan/components/LoanFormConnect'
import Stepper from '@ui/Stepper'
import TxInfoBar from '@ui/TxInfoBar'
import { useUserProfileStore } from '@ui-kit/features/user-profile'
import { Curve, Llamma } from '@loan/types/loan.types'

interface Props extends Pick<PageLoanManageProps, 'curve' | 'isReady' | 'llamma' | 'llammaId'> {}

const CollateralIncrease = ({ curve, isReady, llamma, llammaId }: Props) => {
  const isSubscribed = useRef(false)

  const activeKey = useStore((state) => state.loanCollateralIncrease.activeKey)
  const detailInfo = useStore((state) => state.loanCollateralIncrease.detailInfo[activeKey] ?? DEFAULT_DETAIL_INFO)
  const formEstGas = useStore((state) => state.loanCollateralIncrease.formEstGas[activeKey] ?? DEFAULT_FORM_EST_GAS)
  const formStatus = useStore((state) => state.loanCollateralIncrease.formStatus)
  const formValues = useStore((state) => state.loanCollateralIncrease.formValues)
  const loanDetails = useStore((state) => state.loans.detailsMapper[llammaId])
  const userLoanDetails = useStore((state) => state.loans.userDetailsMapper[llammaId])
  const userWalletBalancesLoading = useStore((state) => state.loans.userWalletBalancesLoading)
  const userWalletBalances = useStore(
    (state) => state.loans.userWalletBalancesMapper[llammaId] ?? DEFAULT_WALLET_BALANCES,
  )

  const fetchStepApprove = useStore((state) => state.loanCollateralIncrease.fetchStepApprove)
  const fetchStepIncrease = useStore((state) => state.loanCollateralIncrease.fetchStepIncrease)
  const notifyNotification = useStore((state) => state.wallet.notifyNotification)
  const setFormValues = useStore((state) => state.loanCollateralIncrease.setFormValues)
  const setStateByKey = useStore((state) => state.loanCollateralIncrease.setStateByKey)
  const resetState = useStore((state) => state.loanCollateralIncrease.resetState)

  const isAdvancedMode = useUserProfileStore((state) => state.isAdvancedMode)

  const [confirmedHealthWarning, setConfirmHealthWarning] = useState(false)
  const [healthMode, setHealthMode] = useState(DEFAULT_HEALTH_MODE)
  const [steps, setSteps] = useState<Step[]>([])
  const [txInfoBar, setTxInfoBar] = useState<ReactNode | null>(null)

  const { chainId, haveSigner } = curveProps(curve)

  const updateFormValues = useCallback(
    (updatedFormValues: FormValues) => {
      if (chainId && llamma) {
        setFormValues(chainId, llamma, updatedFormValues)
      }
    },
    [chainId, llamma, setFormValues],
  )

  const reset = useCallback(
    (isErrorReset: boolean, isFullReset: boolean) => {
      setConfirmHealthWarning(false)
      setTxInfoBar(null)

      if (isErrorReset || isFullReset) {
        if (isFullReset) {
          setHealthMode(DEFAULT_HEALTH_MODE)
        }
        setStateByKey('formStatus', { ...DEFAULT_FORM_STATUS, isApproved: formStatus.isApproved })
      }
    },
    [formStatus, setStateByKey],
  )

  const handleInpChangeCollateral = (collateral: string) => {
    reset(!!formStatus.error, formStatus.isComplete)

    const updatedFormValues = { ...formValues }
    updatedFormValues.collateral = collateral
    updatedFormValues.collateralError = ''
    updateFormValues(updatedFormValues)
  }

  const handleBtnClickAdd = useCallback(
    async (payloadActiveKey: string, curve: Curve, llamma: Llamma, formValues: FormValues) => {
      const chainId = curve.chainId
      const notifyMessage = t`Please confirm depositing ${formValues.collateral} ${llamma.collateralSymbol}`
      const notify = notifyNotification(notifyMessage, 'pending')
      const resp = await fetchStepIncrease(payloadActiveKey, curve, llamma, formValues)

      if (isSubscribed.current && resp && resp.hash && resp.activeKey === activeKey) {
        setTxInfoBar(
          <TxInfoBar
            description={t`Transaction complete`}
            txHash={networks[chainId].scanTxPath(resp.hash)}
            onClose={() => reset(false, true)}
          />,
        )
      }
      if (notify && typeof notify.dismiss === 'function') notify.dismiss()
    },
    [activeKey, fetchStepIncrease, notifyNotification, reset],
  )

  const getSteps = useCallback(
    (
      payloadActiveKey: string,
      curve: Curve,
      llamma: Llamma,
      confirmedHealthWarning: boolean,
      formEstGas: FormEstGas,
      formStatus: FormStatus,
      formValues: FormValues,
      steps: Step[],
    ) => {
      const { collateral, collateralError } = formValues
      const { error, isApproved, isComplete, isInProgress, step } = formStatus
      const haveCollateral = !!collateral && +collateral > 0
      const isValid = !!curve.signerAddress && !formEstGas.loading && haveCollateral && !collateralError && !error

      const stepsObj: { [key: string]: Step } = {
        APPROVAL: {
          key: 'APPROVAL',
          status: getStepStatus(isApproved, step === 'APPROVAL', isValid),
          type: 'action',
          content: isApproved ? t`Spending Approved` : t`Approve Spending`,
          onClick: async () => {
            const notifyMessage = t`Please approve spending of ${llamma.collateralSymbol}`
            const notify = notifyNotification(notifyMessage, 'pending')

            await fetchStepApprove(payloadActiveKey, curve, llamma, formValues)
            if (notify && typeof notify.dismiss === 'function') notify.dismiss()
          },
        },
        ADD: {
          key: 'ADD',
          status: getStepStatus(isComplete, step === 'ADD', isValid && isApproved),
          type: 'action',
          content: isComplete ? t`Collateral Added` : t`Add Collateral`,
          ...(healthMode?.message
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
                    onClick: () => handleBtnClickAdd(payloadActiveKey, curve, llamma, formValues),
                    disabled: !confirmedHealthWarning,
                  },
                  primaryBtnLabel: 'Add anyway',
                },
              }
            : { onClick: async () => handleBtnClickAdd(payloadActiveKey, curve, llamma, formValues) }),
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
    [fetchStepApprove, handleBtnClickAdd, healthMode, notifyNotification],
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
      const updatedSteps = getSteps(
        activeKey,
        curve,
        llamma,
        confirmedHealthWarning,
        formEstGas,
        formStatus,
        formValues,
        steps,
      )
      setSteps(updatedSteps)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [confirmedHealthWarning, healthMode?.message, llamma?.id, haveSigner, formEstGas.loading, formStatus, formValues])

  const activeStep = haveSigner ? getActiveStep(steps) : null
  const disabled = !isReady || formStatus.isInProgress

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
                label: t`${getTokenName(llamma).collateral} Avail.`,
                descriptionLoading: userWalletBalancesLoading,
                description: formatNumber(userWalletBalances.collateral),
              }}
              value={formValues.collateral}
              onChange={handleInpChangeCollateral}
            />
            <InputMaxBtn onClick={() => handleInpChangeCollateral(userWalletBalances.collateral)} />
          </InputProvider>
          <StyledInpChip size="xs" isDarkBg isError>
            {formValues.collateralError === 'too-much' && (
              <>Collateral is greater than {formatNumber(userWalletBalances.collateral)}</>
            )}
          </StyledInpChip>
        </Box>

        {/* detail info */}
        <StyledDetailInfoWrapper>
          {isAdvancedMode && (
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
            amount={formValues.collateral}
            formType=""
            healthMode={healthMode}
            loanDetails={loanDetails}
            userLoanDetails={userLoanDetails}
            setHealthMode={setHealthMode}
          />
          <DetailInfoBorrowRate parameters={loanDetails?.parameters} />
          {chainId && (
            <DetailInfoEstimateGas
              isDivider
              chainId={chainId}
              {...formEstGas}
              stepProgress={activeStep && steps.length > 1 ? { active: activeStep, total: steps.length } : null}
            />
          )}
        </StyledDetailInfoWrapper>
      </div>

      {/* actions */}
      <LoanFormConnect haveSigner={haveSigner} loading={!curve}>
        {formStatus.error ? (
          <AlertFormError errorKey={formStatus.error} handleBtnClose={() => reset(true, false)} />
        ) : detailInfo.healthNotFull !== healthMode.percent && healthMode.message ? (
          <AlertBox alertType="warning">{healthMode.message}</AlertBox>
        ) : null}
        {txInfoBar}
        {steps && <Stepper steps={steps} />}
      </LoanFormConnect>
    </>
  )
}

export default CollateralIncrease
