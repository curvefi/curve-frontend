import type { FormEstGas, PageLoanManageProps } from '@loan/components/PageLoanManage/types'
import type { FormStatus, FormValues, StepKey } from '@loan/components/PageLoanManage/CollateralDecrease/types'
import type { Step } from '@ui/Stepper/types'
import { t } from '@lingui/macro'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { DEFAULT_DETAIL_INFO, DEFAULT_FORM_EST_GAS, DEFAULT_HEALTH_MODE } from '@loan/components/PageLoanManage/utils'
import { DEFAULT_WALLET_BALANCES } from '@loan/components/LoanInfoUser/utils'
import { DEFAULT_FORM_STATUS } from '@loan/store/createLoanCollateralDecreaseSlice'
import { curveProps } from '@loan/utils/helpers'
import { getActiveStep } from '@ui/Stepper/helpers'
import { getStepStatus, getTokenName } from '@loan/utils/utilsLoan'
import { formatNumber } from '@ui/utils'
import networks from '@loan/networks'
import useStore from '@loan/store/useStore'
import { StyledDetailInfoWrapper, StyledInpChip } from '@loan/components/PageLoanManage/styles'
import AlertBox from '@ui/AlertBox'
import AlertFormError from '@loan/components/AlertFormError'
import Box from '@ui/Box'
import DetailInfoBorrowRate from '@loan/components/DetailInfoBorrowRate'
import DetailInfoEstimateGas from '@loan/components/DetailInfoEstimateGas'
import DetailInfoHealth from '@loan/components/DetailInfoHealth'
import DetailInfoLiqRange from '@loan/components/DetailInfoLiqRange'
import DialogHealthWarning from '@loan/components/DialogHealthWarning'
import InputProvider, { InputDebounced, InputMaxBtn } from '@ui/InputComp'
import LoanFormConnect from '@loan/components/LoanFormConnect'
import Stepper from '@ui/Stepper'
import TxInfoBar from '@ui/TxInfoBar'
import { useUserProfileStore } from '@ui-kit/features/user-profile'
import { Curve, Llamma } from '@loan/types/loan.types'
import { notify as notifyNotification } from '@ui-kit/features/connect-wallet'

interface Props extends Pick<PageLoanManageProps, 'curve' | 'llamma' | 'llammaId' | 'rChainId'> {}

const CollateralDecrease = ({ curve, llamma, llammaId, rChainId }: Props) => {
  const isSubscribed = useRef(false)

  const activeKey = useStore((state) => state.loanCollateralDecrease.activeKey)
  const detailInfo = useStore((state) => state.loanCollateralDecrease.detailInfo[activeKey] ?? DEFAULT_DETAIL_INFO)
  const formEstGas = useStore((state) => state.loanCollateralDecrease.formEstGas[activeKey] ?? DEFAULT_FORM_EST_GAS)
  const formStatus = useStore((state) => state.loanCollateralDecrease.formStatus)
  const formValues = useStore((state) => state.loanCollateralDecrease.formValues)
  const maxRemovable = useStore((state) => state.loanCollateralDecrease.maxRemovable)
  const loanDetails = useStore((state) => state.loans.detailsMapper[llammaId])
  const userLoanDetails = useStore((state) => state.loans.userDetailsMapper[llammaId])
  const userWalletBalances = useStore(
    (state) => state.loans.userWalletBalancesMapper[llammaId] ?? DEFAULT_WALLET_BALANCES,
  )

  const init = useStore((state) => state.loanCollateralDecrease.init)
  const fetchStepDecrease = useStore((state) => state.loanCollateralDecrease.fetchStepDecrease)
  const setFormValues = useStore((state) => state.loanCollateralDecrease.setFormValues)
  const setStateByKey = useStore((state) => state.loanCollateralDecrease.setStateByKey)
  const resetState = useStore((state) => state.loanCollateralDecrease.resetState)

  const isAdvancedMode = useUserProfileStore((state) => state.isAdvancedMode)

  const [confirmedHealthWarning, setConfirmHealthWarning] = useState(false)
  const [healthMode, setHealthMode] = useState(DEFAULT_HEALTH_MODE)
  const [steps, setSteps] = useState<Step[]>([])
  const [txInfoBar, setTxInfoBar] = useState<React.ReactNode | null>(null)

  const network = networks[rChainId]
  const { chainId, haveSigner } = curveProps(curve)

  const updateFormValues = (updatedFormValues: FormValues) => {
    if (chainId && llamma) {
      setFormValues(chainId, llamma, updatedFormValues, maxRemovable)
    }
  }

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

  const handleBtnClickRemove = useCallback(
    async (payloadActiveKey: string, curve: Curve, llamma: Llamma, formValues: FormValues) => {
      const notifyMessage = t`Please confirm removal of ${formValues.collateral} ${llamma.collateralSymbol}`
      const notify = notifyNotification(notifyMessage, 'pending')
      const resp = await fetchStepDecrease(payloadActiveKey, curve, llamma, formValues)

      if (isSubscribed.current && resp && resp.hash && resp.activeKey === activeKey) {
        const txMessage = `Remove ${formValues.collateral} ${llamma.collateralSymbol} collateral.`
        setTxInfoBar(
          <TxInfoBar
            description={txMessage}
            txHash={network.scanTxPath(resp.hash)}
            onClose={() => reset(false, true)}
          />,
        )
      }
      if (notify && typeof notify.dismiss === 'function') notify.dismiss()
    },
    [activeKey, fetchStepDecrease, network, reset],
  )

  const stepsObj = useCallback(
    (
      payloadActiveKey: string,
      curve: Curve,
      llamma: Llamma,
      confirmedHealthWarning: boolean,
      formEstGas: FormEstGas,
      formStatus: FormStatus,
      formValues: FormValues,
    ) => {
      const { collateral, collateralError } = formValues
      const { error, isComplete, step } = formStatus
      const haveCollateral = !!collateral && +collateral > 0
      const isValid = !!curve.signerAddress && !formEstGas.loading && haveCollateral && !collateralError && !error

      const stepsObj: { [key: string]: Step } = {
        REMOVE: {
          key: 'REMOVE',
          status: getStepStatus(isComplete, step === 'REMOVE', isValid),
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
                    onClick: () => handleBtnClickRemove(payloadActiveKey, curve, llamma, formValues),
                    disabled: !confirmedHealthWarning,
                  },
                  primaryBtnLabel: 'Remove anyway',
                },
              }
            : { onClick: async () => handleBtnClickRemove(payloadActiveKey, curve, llamma, formValues) }),
        },
      }

      let stepsKey: StepKey[] = ['REMOVE']

      return stepsKey.map((k) => stepsObj[k])
    },
    [healthMode, handleBtnClickRemove],
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
    if (haveSigner && chainId && llamma) {
      init(chainId, llamma)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chainId, haveSigner, init, llamma?.id])

  // steps
  useEffect(() => {
    if (llamma && curve) {
      const updatedSteps = stepsObj(
        activeKey,
        curve,
        llamma,
        confirmedHealthWarning,
        formEstGas,
        formStatus,
        formValues,
      )
      setSteps(updatedSteps)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [confirmedHealthWarning, healthMode?.message, llamma?.id, haveSigner, formEstGas.loading, formStatus, formValues])

  const activeStep = haveSigner ? getActiveStep(steps) : null
  const disabled = !chainId || !llamma || formStatus.isInProgress || maxRemovable === ''

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
              label: t`${getTokenName(llamma).collateral} Avail. ${formatNumber(userWalletBalances.collateral)}`,
            }}
            delay={700}
            value={formValues.collateral}
            onChange={handleInpChangeCollateral}
          />
          <InputMaxBtn onClick={() => handleInpChangeCollateral(maxRemovable)} />
        </InputProvider>
        {formValues.collateralError === 'too-much' && maxRemovable ? (
          <StyledInpChip size="xs" isDarkBg isError>
            Cannot be greater than {maxRemovable ? formatNumber(maxRemovable) : '0'}
          </StyledInpChip>
        ) : (
          <StyledInpChip size="xs">Max removable {formatNumber(maxRemovable, { defaultValue: '-' })}</StyledInpChip>
        )}
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
          healthMode={healthMode}
          loanDetails={loanDetails}
          formType="collateral-decrease"
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
        {formStatus.error ? (
          <AlertFormError errorKey={formStatus.error} handleBtnClose={() => reset(true, false)} />
        ) : healthMode.message ? (
          <AlertBox alertType="warning">{healthMode.message}</AlertBox>
        ) : null}
        {txInfoBar}
        {steps && <Stepper steps={steps} />}
      </LoanFormConnect>
    </>
  )
}

export default CollateralDecrease
