import type { FormStatus, FormValues, StepKey } from '@/loan/components/PageLoanManage/LoanIncrease/types'
import type { FormEstGas, PageLoanManageProps } from '@/loan/components/PageLoanManage/types'
import type { Step } from '@ui/Stepper/types'
import { t } from '@ui-kit/lib/i18n'
import { ReactNode, useCallback, useEffect, useRef, useState } from 'react'
import { DEFAULT_FORM_STATUS, getMaxRecvActiveKey } from '@/loan/store/createLoanIncreaseSlice'
import {
  DEFAULT_DETAIL_INFO,
  DEFAULT_FORM_EST_GAS,
  DEFAULT_HEALTH_MODE,
  DEFAULT_USER_WALLET_BALANCES,
} from '@/loan/components/PageLoanManage/utils'
import { curveProps } from '@/loan/utils/helpers'
import { formatNumber } from '@ui/utils'
import { getActiveStep } from '@ui/Stepper/helpers'
import { getStepStatus, getTokenName } from '@/loan/utils/utilsLoan'
import networks from '@/loan/networks'
import useStore from '@/loan/store/useStore'
import { StyledDetailInfoWrapper, StyledInpChip } from '@/loan/components/PageLoanManage/styles'
import AlertBox from '@ui/AlertBox'
import Box from '@ui/Box'
import DetailInfoBorrowRate from '@/loan/components/DetailInfoBorrowRate'
import DetailInfoEstimateGas from '@/loan/components/DetailInfoEstimateGas'
import DetailInfoHealth from '@/loan/components/DetailInfoHealth'
import DetailInfoLiqRange from '@/loan/components/DetailInfoLiqRange'
import DialogHealthWarning from '@/loan/components/DialogHealthWarning'
import InputProvider, { InputDebounced, InputMaxBtn } from '@ui/InputComp'
import LoanFormConnect from '@/loan/components/LoanFormConnect'
import Stepper from '@ui/Stepper'
import TxInfoBar from '@ui/TxInfoBar'
import AlertFormError from '@/loan/components/AlertFormError'
import { useUserProfileStore } from '@ui-kit/features/user-profile'
import { Curve, Llamma } from '@/loan/types/loan.types'
import { notify } from '@ui-kit/features/connect-wallet'

interface Props extends Pick<PageLoanManageProps, 'curve' | 'isReady' | 'llamma' | 'llammaId'> {}

// Borrow more
const LoanIncrease = ({ curve, isReady, llamma, llammaId }: Props) => {
  const isSubscribed = useRef(false)

  const activeKey = useStore((state) => state.loanIncrease.activeKey)
  const detailInfo = useStore((state) => state.loanIncrease.detailInfo[activeKey] ?? DEFAULT_DETAIL_INFO)
  const formEstGas = useStore((state) => state.loanIncrease.formEstGas[activeKey] ?? DEFAULT_FORM_EST_GAS)
  const formStatus = useStore((state) => state.loanIncrease.formStatus)
  const formValues = useStore((state) => state.loanIncrease.formValues)
  const maxRecvActiveKey = llamma ? getMaxRecvActiveKey(llamma, formValues.collateral) : ''
  const maxRecv = useStore((state) => state.loanIncrease.maxRecv[maxRecvActiveKey])
  const loanDetails = useStore((state) => state.loans.detailsMapper[llammaId])
  const userLoanDetails = useStore((state) => state.loans.userDetailsMapper[llammaId])
  const userWalletBalancesLoading = useStore((state) => state.loans.userWalletBalancesLoading)
  const userWalletBalances = useStore(
    (state) => state.loans.userWalletBalancesMapper[llammaId] ?? DEFAULT_USER_WALLET_BALANCES,
  )

  const init = useStore((state) => state.loanIncrease.init)
  const fetchStepApprove = useStore((state) => state.loanIncrease.fetchStepApprove)
  const fetchStepIncrease = useStore((state) => state.loanIncrease.fetchStepIncrease)
  const setFormValues = useStore((state) => state.loanIncrease.setFormValues)
  const setStateByKey = useStore((state) => state.loanIncrease.setStateByKey)
  const resetState = useStore((state) => state.loanIncrease.resetState)

  const isAdvancedMode = useUserProfileStore((state) => state.isAdvancedMode)

  const [confirmedHealthWarning, setConfirmHealthWarning] = useState(false)
  const [healthMode, setHealthMode] = useState(DEFAULT_HEALTH_MODE)
  const [steps, setSteps] = useState<Step[]>([])
  const [txInfoBar, setTxInfoBar] = useState<ReactNode>(null)

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

  const handleInpChange = (name: 'collateral' | 'debt', value: string) => {
    reset(!!formStatus.error, formStatus.isComplete)

    const updatedFormValues = { ...formValues }
    updatedFormValues[name] = value
    updatedFormValues.collateralError = ''
    updatedFormValues.debtError = ''
    updateFormValues(updatedFormValues)
  }

  const handleBtnClickBorrow = useCallback(
    async (payloadActiveKey: string, curve: Curve, formValues: FormValues, llamma: Llamma) => {
      const chainId = curve.chainId
      const { collateral, debt } = formValues
      const haveCollateral = +collateral > 0
      const haveDebt = +debt > 0

      const notifyMessage =
        haveCollateral && haveDebt
          ? t`Please confirm borrowing of ${formValues.debt} ${getTokenName(llamma).stablecoin} and adding ${
              formValues.collateral
            } ${llamma.collateralSymbol}.`
          : t`Please confirm borrowing of ${formValues.debt} ${getTokenName(llamma).stablecoin}.`

      const notification = notify(notifyMessage, 'pending')

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
      notification?.dismiss()
    },
    [activeKey, fetchStepIncrease, reset],
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
      const { debt, debtError, collateralError } = formValues
      const { error, isApproved, isComplete, step } = formStatus
      const haveDebt = +debt > 0
      const isValid =
        !!curve.signerAddress && !formEstGas.loading && haveDebt && !debtError && !collateralError && !error

      const stepsObj: { [key: string]: Step } = {
        APPROVAL: {
          key: 'APPROVAL',
          status: getStepStatus(isApproved, step === 'APPROVAL', isValid),
          type: 'action',
          content: isApproved ? t`Spending Approved` : t`Approve Spending`,
          onClick: async () => {
            const notifyMessage = t`Please approve spending of ${formValues.collateral}`
            const notification = notify(notifyMessage, 'pending')

            await fetchStepApprove(payloadActiveKey, curve, llamma, formValues)
            notification?.dismiss()
          },
        },
        BORROW: {
          key: 'BORROW',
          status: getStepStatus(isComplete, step === 'BORROW', isValid && isApproved),
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
                    onClick: () => handleBtnClickBorrow(payloadActiveKey, curve, formValues, llamma),
                    disabled: !confirmedHealthWarning,
                  },
                  primaryBtnLabel: t`Borrow more anyway`,
                },
              }
            : { onClick: async () => handleBtnClickBorrow(payloadActiveKey, curve, formValues, llamma) }),
        },
      }

      let stepsKey: StepKey[]

      if (formStatus.isInProgress || formStatus.isComplete) {
        stepsKey = steps.map((s) => s.key as StepKey)
      } else {
        stepsKey = formStatus.isApproved ? ['BORROW'] : ['APPROVAL', 'BORROW']
      }

      return stepsKey.map((k) => stepsObj[k])
    },
    [healthMode, fetchStepApprove, handleBtnClickBorrow],
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
    if (isReady && chainId && llamma) {
      init(chainId, llamma)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady, chainId, llamma])

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
              label: t`${getTokenName(llamma).stablecoin} borrow amount`,
            }}
            value={formValues.debt}
            onChange={(val) => handleInpChange('debt', val)}
          />
          <InputMaxBtn disabled={disabled} onClick={() => handleInpChange('debt', maxRecv)} />
        </InputProvider>
        {formValues.debtError === 'too-much' ? (
          <StyledInpChip size="xs" isDarkBg isError>
            Borrow amount is greater than ${formatNumber(maxRecv)}, increase collateral to borrow more
          </StyledInpChip>
        ) : (
          <StyledInpChip size="xs">Max borrow amount {isReady && maxRecv ? formatNumber(maxRecv) : '-'}</StyledInpChip>
        )}
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
              label: t`${getTokenName(llamma).collateral} Avail.`,
              descriptionLoading: userWalletBalancesLoading,
              description: formatNumber(userWalletBalances.collateral),
            }}
            value={formValues.collateral}
            onChange={(val) => handleInpChange('collateral', val)}
          />
          <InputMaxBtn
            disabled={disabled}
            onClick={() => handleInpChange('collateral', userWalletBalances.collateral)}
          />
        </InputProvider>
        <StyledInpChip size="xs" isDarkBg isError>
          {formValues.collateralError === 'too-much' && userWalletBalances?.collateral && (
            <>Collateral is greater than {+userWalletBalances.collateral}</>
          )}
        </StyledInpChip>

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
            amount={formValues.debt}
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
      </Box>

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

export default LoanIncrease
