import type { FormEstGas } from '@/loan/components/PageLoanManage/types'
import type { FormStatus, FormValues, PageLoanCreateProps, StepKey } from '@/loan/components/PageLoanCreate/types'
import type { Step } from '@ui/Stepper/types'
import { t, Trans } from '@ui-kit/lib/i18n'
import { ReactNode, useCallback, useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import { DEFAULT_FORM_EST_GAS, DEFAULT_HEALTH_MODE, hasDeleverage } from '@/loan/components/PageLoanManage/utils'
import { DEFAULT_WALLET_BALANCES } from '@/loan/components/LoanInfoUser/utils'
import { DEFAULT_FORM_STATUS } from '@/loan/store/createLoanCollateralIncreaseSlice'
import { formatNumber } from '@ui/utils'
import { getLoanManagePathname } from '@/loan/utils/utilsRouter'
import { getStepStatus, getTokenName } from '@/loan/utils/utilsLoan'
import { curveProps } from '@/loan/utils/helpers'
import networks from '@/loan/networks'
import useStore from '@/loan/store/useStore'
import { StyledInpChip } from '@/loan/components/PageLoanManage/styles'
import Accordion from '@ui/Accordion'
import AlertBox from '@ui/AlertBox'
import AlertFormError from '@/loan/components/AlertFormError'
import Box from '@ui/Box'
import DetailInfo from '@/loan/components/PageLoanCreate/LoanFormCreate/components/DetailInfo'
import DialogHealthWarning from '@/loan/components/DialogHealthWarning'
import InputProvider, { InputDebounced, InputMaxBtn } from '@ui/InputComp'
import LinkButton from '@ui/LinkButton'
import LoanFormConnect from '@/loan/components/LoanFormConnect'
import LoanInfoParameters from '@/loan/components/LoanInfoLlamma/LoanInfoParameters'
import Stepper from '@ui/Stepper'
import TxInfoBar from '@ui/TxInfoBar'
import DialogHealthLeverageWarning from '@/loan/components/PageLoanCreate/LoanFormCreate/components/DialogHealthLeverageWarning'
import { useUserProfileStore } from '@ui-kit/features/user-profile'
import { CollateralAlert, Curve, Llamma } from '@/loan/types/loan.types'
import { notify } from '@ui-kit/features/connect-wallet'

const LoanCreate = ({
  collateralAlert,
  curve,
  isReady,
  llamma,
  llammaId,
  params,
  rChainId,
  rFormType,
}: PageLoanCreateProps & { collateralAlert: CollateralAlert | null }) => {
  const isSubscribed = useRef(false)
  const isLeverage = rFormType === 'leverage'

  const activeKey = useStore((state) => state.loanCreate.activeKey)
  const activeKeyLiqRange = useStore((state) => state.loanCreate.activeKeyLiqRange)
  const formEstGas = useStore((state) => state.loanCreate.formEstGas[activeKey] ?? DEFAULT_FORM_EST_GAS)
  const formStatus = useStore((state) => state.loanCreate.formStatus)
  const formValues = useStore((state) => state.loanCreate.formValues)
  const maxRecv = useStore((state) =>
    isLeverage
      ? (state.loanCreate.maxRecvLeverage[activeKey]?.maxBorrowable ?? '')
      : (state.loanCreate.maxRecv[activeKey] ?? ''),
  )
  const userWalletBalancesLoading = useStore((state) => state.loans.userWalletBalancesLoading)
  const userWalletBalances = useStore(
    (state) => state.loans.userWalletBalancesMapper[llammaId] ?? DEFAULT_WALLET_BALANCES,
  )
  const fetchStepApprove = useStore((state) => state.loanCreate.fetchStepApprove)
  const fetchStepCreate = useStore((state) => state.loanCreate.fetchStepCreate)
  const setFormValues = useStore((state) => state.loanCreate.setFormValues)
  const setStateByKey = useStore((state) => state.loanCreate.setStateByKey)
  const resetState = useStore((state) => state.loanCreate.resetState)

  const isAdvancedMode = useUserProfileStore((state) => state.isAdvancedMode)
  const maxSlippage = useUserProfileStore((state) => state.maxSlippage.global)

  const [confirmedHealthWarning, setConfirmHealthWarning] = useState(false)
  const [healthMode, setHealthMode] = useState(DEFAULT_HEALTH_MODE)
  const [steps, setSteps] = useState<Step[]>([])
  const [txInfoBar, setTxInfoBar] = useState<ReactNode>(null)

  const { haveSigner } = curveProps(curve)
  const network = networks[rChainId]

  const updateFormValues = useCallback(
    (updatedFormValues: FormValues) => {
      if (curve && llamma) {
        setFormValues(curve, isLeverage, llamma, updatedFormValues, maxSlippage)
      }
    },
    [curve, isLeverage, llamma, maxSlippage, setFormValues],
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

  const handleClickCreate = useCallback(
    async (
      payloadActiveKey: string,
      curve: Curve,
      formValues: FormValues,
      isLeverage: boolean,
      llamma: Llamma,
      maxSlippage: string,
    ) => {
      const notifyMessage = t`Please confirm deposit of ${formValues.collateral} ${llamma.collateralSymbol}`
      const notification = notify(notifyMessage, 'pending')
      const resp = await fetchStepCreate(payloadActiveKey, curve, isLeverage, llamma, formValues, maxSlippage)

      if (isSubscribed.current && resp && resp.hash && resp.activeKey === activeKey) {
        const TxDescription = <Trans>Transaction complete.</Trans>
        setTxInfoBar(<TxInfoBar description={TxDescription} txHash={network.scanTxPath(resp.hash)} />)
      }
      notification?.dismiss()
    },
    [activeKey, fetchStepCreate, network],
  )

  const getSteps = useCallback(
    (
      payloadActiveKey: string,
      curve: Curve,
      isLeverage: boolean,
      llamma: Llamma,
      confirmedHealthWarning: boolean,
      formEstGas: FormEstGas,
      formStatus: FormStatus,
      formValues: FormValues,
      maxSlippage: string,
      steps: Step[],
    ) => {
      const { collateral, collateralError, debt, debtError, n } = formValues
      const { isApproved, isComplete, isInProgress, error, warning, step } = formStatus
      const haveCollateral = +collateral > 0
      const haveDebt = +debt > 0
      const isValidCollateral = haveCollateral && !collateralError
      const isValidDebt = haveDebt && !debtError
      const isValid =
        !!curve.signerAddress && !formEstGas.loading && isValidCollateral && isValidDebt && !warning && !error

      const stepsObj: { [key: string]: Step } = {
        APPROVAL: {
          key: 'APPROVAL',
          status: getStepStatus(isApproved, step === 'APPROVAL', isValid),
          type: 'action',
          content: isApproved ? t`Spending Approved` : t`Approve Spending`,
          onClick: async () => {
            const notifyMessage = t`Please approve spending your ${llamma.collateralSymbol}.`
            const notification = notify(notifyMessage, 'pending')

            await fetchStepApprove(payloadActiveKey, curve, isLeverage, llamma, formValues, maxSlippage)
            notification?.dismiss()
          },
        },
        CREATE: {
          key: 'CREATE',
          status: getStepStatus(isComplete, step === 'CREATE', isValid && !!n && isApproved),
          type: 'action',
          content: isComplete ? t`Loan Created` : t`Create Loan`,
          ...(healthMode.message || isLeverage
            ? {
                modal: {
                  title: t`Warning!`,
                  content: isLeverage ? (
                    <DialogHealthLeverageWarning
                      {...healthMode}
                      confirmed={confirmedHealthWarning}
                      setConfirmed={(val) => setConfirmHealthWarning(val)}
                    />
                  ) : (
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
                    onClick: () =>
                      handleClickCreate(payloadActiveKey, curve, formValues, isLeverage, llamma, maxSlippage),
                    disabled: !confirmedHealthWarning,
                  },
                  primaryBtnLabel: 'Create anyway',
                },
              }
            : {
                onClick: async () =>
                  handleClickCreate(payloadActiveKey, curve, formValues, isLeverage, llamma, maxSlippage),
              }),
        },
      }

      let stepsKey: StepKey[]

      if (isInProgress || isComplete) {
        stepsKey = steps.map((s) => s.key as StepKey)
      } else {
        stepsKey = isApproved ? ['CREATE'] : ['APPROVAL', 'CREATE']
      }

      return stepsKey.map((k) => stepsObj[k])
    },
    [fetchStepApprove, handleClickCreate, healthMode],
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
      let updatedSteps = getSteps(
        activeKey,
        curve,
        isLeverage,
        llamma,
        confirmedHealthWarning,
        formEstGas,
        formStatus,
        formValues,
        maxSlippage,
        steps,
      )
      setSteps(updatedSteps)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    confirmedHealthWarning,
    healthMode?.message,
    llamma?.id,
    haveSigner,
    formEstGas.loading,
    formStatus,
    formValues,
    maxSlippage,
  ])

  const disabled = !isReady || (formStatus.isInProgress && !formStatus.error)

  useEffect(() => {
    updateFormValues(formValues)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [haveSigner])

  return (
    <>
      {/* field collateral */}
      <Box grid gridRowGap={1}>
        <StyledInputProvider
          grid
          gridTemplateColumns="1fr auto"
          inputVariant={formValues.collateralError ? 'error' : undefined}
          disabled={disabled}
          id="collateral"
        >
          <InputDebounced
            id="inpCollateralAmt"
            type="number"
            labelProps={{
              label: t`${llamma?.collateralSymbol} Avail.`,
              ...(haveSigner
                ? {
                    descriptionLoading: userWalletBalancesLoading,
                    description: formatNumber(userWalletBalances.collateral),
                  }
                : {}),
            }}
            value={formValues.collateral}
            onChange={(val) => handleInpChange('collateral', val)}
          />
          <InputMaxBtn onClick={() => handleInpChange('collateral', userWalletBalances.collateral)} />
        </StyledInputProvider>
        <StyledInpChip size="xs" isDarkBg isError>
          {formValues.collateralError === 'too-much'
            ? t`Amount is greater than ${formatNumber(userWalletBalances.collateral)}`
            : null}
        </StyledInpChip>
      </Box>

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
            labelProps={{ label: llamma ? t`${getTokenName(llamma).stablecoin} borrow amount` : '' }}
            value={formValues.debt}
            onChange={(val) => handleInpChange('debt', val)}
          />
          <InputMaxBtn disabled={!maxRecv} onClick={() => handleInpChange('debt', maxRecv)} />
        </InputProvider>
        {formValues.debtError === 'too-much' ? (
          <StyledInpChip size="xs" isDarkBg isError>
            Amount is greater than {formatNumber(maxRecv)}
          </StyledInpChip>
        ) : (
          <StyledInpChip size="xs">
            {t`Max borrow amount`} {formatNumber(maxRecv || null)}
          </StyledInpChip>
        )}
      </Box>

      {/* detail info */}
      <DetailInfo
        activeKey={activeKey}
        activeKeyLiqRange={activeKeyLiqRange}
        curve={curve}
        chainId={rChainId}
        formEstGas={formEstGas}
        formValues={formValues}
        haveSigner={haveSigner}
        healthMode={healthMode}
        isAdvanceMode={isAdvancedMode}
        isLeverage={isLeverage}
        isReady={isReady}
        llamma={llamma}
        llammaId={llammaId}
        steps={steps}
        setHealthMode={setHealthMode}
        updateFormValues={updateFormValues}
      />

      {rFormType === 'leverage' && (
        <AlertBox alertType="info">
          <Box grid gridRowGap={2}>
            <p>{t`You can leverage your collateral up to 9x. This has the effect of repeat trading crvUSD to collateral and depositing to maximize your collateral position. Essentially, all borrowed crvUSD is utilized to purchase more collateral.`}</p>
            <p>{t`Be careful, if the collateral price dips, you would need to repay the entire amount to reclaim your initial position.`}</p>
            {!hasDeleverage(llamma) && (
              <p>{t`WARNING: The corresponding deleverage button is also not yet available.`}</p>
            )}
          </Box>
        </AlertBox>
      )}

      {collateralAlert?.isDeprecated && <AlertBox {...collateralAlert}>{collateralAlert.message}</AlertBox>}

      {/* actions */}
      <LoanFormConnect haveSigner={haveSigner} loading={!curve}>
        {formStatus.warning === 'warning-loan-exists' && llamma ? (
          <AlertBox alertType="info">{t`Transaction complete`}</AlertBox>
        ) : healthMode.message ? (
          <AlertBox alertType="warning">{healthMode.message}</AlertBox>
        ) : formStatus.error ? (
          <AlertFormError errorKey={formStatus.error} handleBtnClose={() => reset(true, false)} />
        ) : null}

        {txInfoBar}
        {steps && <Stepper steps={steps} />}
        {formStatus.isComplete && llamma && (
          <LinkButton variant="filled" size="large" to={getLoanManagePathname(params, llamma.id, 'loan')}>
            Manage loan
          </LinkButton>
        )}
      </LoanFormConnect>

      {!isAdvancedMode && (
        <Accordion btnLabel={t`Loan Parameters`}>
          <LoanInfoParameters llamma={llamma} llammaId={llammaId} />
        </Accordion>
      )}
    </>
  )
}

const StyledInputProvider = styled(InputProvider)`
  padding: var(--spacing-1) var(--spacing-2);
`

export default LoanCreate
